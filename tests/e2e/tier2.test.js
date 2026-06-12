import assert from 'assert';
import { setupPageMocks, seedDb, loginAsAdmin, logout, fillInput, clickButton, submitBookingForm } from './helpers.js';

function parseSlot(slot, today) {
  const parts = slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!parts) return null;
  let hours = parseInt(parts[1]);
  const minutes = parseInt(parts[2]);
  const ampm = parts[3].toUpperCase();
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  const d = new Date(today);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export const tests = [
  {
    name: "T2.1: Same-day booking: slot at current time + 30 mins is filtered",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await page.waitForSelector('input[name="date"]');
      
      const todayVal = new Date().toISOString().split('T')[0];
      await fillInput(page, 'input[name="date"]', todayVal);
      
      const slots = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('select[name="time"] option'))
          .map(o => o.value)
          .filter(val => val !== '');
      });
      
      const today = new Date();
      const minAllowed = new Date(today.getTime() + 60 * 60 * 1000);
      
      for (const slot of slots) {
        const slotDate = parseSlot(slot, today);
        if (slotDate) {
          assert(slotDate > minAllowed, `Slot ${slot} should be filtered out because it is within the 1-hour buffer`);
        }
      }
    }
  },
  {
    name: "T2.2: Same-day booking: slot at current time + 2 hours is available",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await page.waitForSelector('input[name="date"]');
      
      const todayVal = new Date().toISOString().split('T')[0];
      await fillInput(page, 'input[name="date"]', todayVal);
      
      const slots = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('select[name="time"] option'))
          .map(o => o.value)
          .filter(val => val !== '');
      });
      
      const today = new Date();
      const targetTime = new Date(today.getTime() + 2 * 60 * 60 * 1000);
      
      // If the targetTime falls within the operating hours (10 AM - 10 PM), check that slots after it exist
      if (targetTime.getHours() >= 10 && targetTime.getHours() < 22) {
        assert(slots.length > 0, "Expected at least some future slots to be available");
      }
    }
  },
  {
    name: "T2.3: Future-day booking: includes past hour slots for that future day",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await page.waitForSelector('input[name="date"]');
      
      // Set date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowVal = tomorrow.toISOString().split('T')[0];
      await fillInput(page, 'input[name="date"]', tomorrowVal);
      
      const slots = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('select[name="time"] option'))
          .map(o => o.value)
          .filter(val => val !== '');
      });
      
      // Tomorrow should show the full slots, e.g., 10:00 AM should be present
      assert(slots.includes("10:00 AM"), "Tomorrow's slots should include 10:00 AM regardless of today's time");
    }
  },
  {
    name: "T2.4: Form validation: booking without name triggers HTML5 required",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await page.waitForSelector('input[name="name"]');
      
      const required = await page.evaluate(() => document.querySelector('input[name="name"]').required);
      assert.strictEqual(required, true);
    }
  },
  {
    name: "T2.5: Form validation: booking without phone triggers HTML5 required",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await page.waitForSelector('input[name="phone"]');
      
      const required = await page.evaluate(() => document.querySelector('input[name="phone"]').required);
      assert.strictEqual(required, true);
    }
  },
  {
    name: "T2.6: Form validation: booking without date triggers HTML5 required",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await page.waitForSelector('input[name="date"]');
      
      const required = await page.evaluate(() => document.querySelector('input[name="date"]').required);
      assert.strictEqual(required, true);
    }
  },
  {
    name: "T2.7: Form validation: booking without time triggers HTML5 required",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await page.waitForSelector('select[name="time"]');
      
      const required = await page.evaluate(() => document.querySelector('select[name="time"]').required);
      assert.strictEqual(required, true);
    }
  },
  {
    name: "T2.8: Guest count: option '1' is selectable and valid",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await page.waitForSelector('select[name="guests"]');
      
      await page.select('select[name="guests"]', '1');
      const val = await page.evaluate(() => document.querySelector('select[name="guests"]').value);
      assert.strictEqual(val, '1');
    }
  },
  {
    name: "T2.9: Guest count: option '12' is selectable and valid",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await page.waitForSelector('select[name="guests"]');
      
      await page.select('select[name="guests"]', '12');
      const val = await page.evaluate(() => document.querySelector('select[name="guests"]').value);
      assert.strictEqual(val, '12');
    }
  },
  {
    name: "T2.10: Guest count: select dropdown has exactly 12 options",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await page.waitForSelector('select[name="guests"]');
      
      const count = await page.evaluate(() => document.querySelectorAll('select[name="guests"] option').length);
      assert.strictEqual(count, 12);
    }
  },
  {
    name: "T2.11: Special notes: handles special characters",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      
      const specialNotes = "Table near window @#$%^&*()_+=-[]{}|;':\",./<>? ~` !";
      await submitBookingForm(page, {
        name: "Special Char Guest",
        phone: "+60123456744",
        date: new Date().toISOString().split('T')[0],
        time: "20:00",
        guests: 4,
        notes: specialNotes
      });
      
      await page.waitForFunction(() => document.body.innerText.includes('Requested') || document.body.innerText.includes('Success'));
      const dbState = await page.evaluate(() => window.mockDb);
      const res = Object.values(dbState.reservations).find(r => r.name === "Special Char Guest");
      assert.strictEqual(res.notes, specialNotes);
    }
  },
  {
    name: "T2.12: Special notes: handles very long notes (500 chars)",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      
      const longNotes = "A".repeat(500);
      await submitBookingForm(page, {
        name: "Long Note Guest",
        phone: "+60123456755",
        date: new Date().toISOString().split('T')[0],
        time: "20:00",
        guests: 2,
        notes: longNotes
      });
      
      await page.waitForFunction(() => document.body.innerText.includes('Requested') || document.body.innerText.includes('Success'));
      const dbState = await page.evaluate(() => window.mockDb);
      const res = Object.values(dbState.reservations).find(r => r.name === "Long Note Guest");
      assert.strictEqual(res.notes, longNotes);
    }
  },
  {
    name: "T2.13: Manage booking: searching non-existent ID shows alert dialog",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await clickButton(page, "Manage Booking");
      await fillInput(page, 'input[name="searchQuery"]', "nonexistent_id");
      
      let alertMsg = "";
      page.on('dialog', async dialog => {
        alertMsg = dialog.message();
        await dialog.accept();
      });
      
      await clickButton(page, 'form button[type="submit"]');
      await page.waitForFunction(() => alertMsg !== "");
      assert(alertMsg.includes("No confirmed reservations found") || alertMsg.includes("not found"));
    }
  },
  {
    name: "T2.14: Manage booking: phone query with letters displays no reservation alert",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await clickButton(page, "Manage Booking");
      await fillInput(page, 'input[name="searchQuery"]', "+6012abc3456");
      
      let alertMsg = "";
      page.on('dialog', async dialog => {
        alertMsg = dialog.message();
        await dialog.accept();
      });
      
      await clickButton(page, 'form button[type="submit"]');
      await page.waitForFunction(() => alertMsg !== "");
      assert(alertMsg.includes("No confirmed reservations found"));
    }
  },
  {
    name: "T2.15: Manage booking: empty search string is blocked by HTML5 required",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await clickButton(page, "Manage Booking");
      await page.waitForSelector('input[name="searchQuery"]');
      
      const required = await page.evaluate(() => document.querySelector('input[name="searchQuery"]').required);
      assert.strictEqual(required, true);
    }
  },
  {
    name: "T2.16: Manage booking cancellation: clicking Cancel in confirm keeps reservation confirmed",
    run: async (page, baseUrl) => {
      const dbState = {
        reservations: {
          res_keep: { name: "Keep Me", phone: "+60123456766", date: "2026-06-12", time: "18:00", guests: 2, status: "confirmed" }
        }
      };
      await setupPageMocks(page, dbState);
      await page.goto(baseUrl + '/book');
      await clickButton(page, "Manage Booking");
      await fillInput(page, 'input[name="searchQuery"]', "res_keep");
      await clickButton(page, 'form button[type="submit"]');
      await page.waitForFunction(() => document.body.innerText.includes('Keep Me'));
      
      // Intercept confirm dialog and DISMISS (Cancel) it
      page.on('dialog', async dialog => {
        await dialog.dismiss();
      });
      
      await clickButton(page, "Cancel Reservation");
      
      // Wait a moment and assert database is still confirmed
      await new Promise(r => setTimeout(r, 500));
      const status = await page.evaluate(() => window.mockDb.reservations.res_keep.status);
      assert.strictEqual(status, "confirmed");
    }
  },
  {
    name: "T2.17: Menu order: loading empty category page",
    run: async (page, baseUrl) => {
      // Menu only has mains
      const menuDb = {
        menu: {
          item_1: { name: 'Nasi Lemak', price: 12.50, category: 'mains', available: true, description: 'Delicious', names: { en: 'Nasi Lemak' } }
        }
      };
      await setupPageMocks(page, menuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      
      // Click drinks (which is empty)
      await clickButton(page, "drinks");
      await new Promise(r => setTimeout(r, 500));
      const text = await page.evaluate(() => document.body.innerText);
      assert(!text.includes('Nasi Lemak'));
    }
  },
  {
    name: "T2.18: Menu order: adding items to cart with price 0.00 works",
    run: async (page, baseUrl) => {
      const freeItemDb = {
        menu: {
          item_free: { name: 'Free Water', price: 0.00, category: 'drinks', available: true, description: 'Free', names: { en: 'Free Water' } }
        }
      };
      await setupPageMocks(page, freeItemDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Free Water'));
      
      await page.evaluate(() => {
        document.querySelector('button').click();
      });
      await page.waitForFunction(() => document.body.innerText.includes('1 Item'));
      const text = await page.evaluate(() => document.body.innerText);
      assert(text.includes("0.00"));
    }
  },
  {
    name: "T2.19: Checkout payment: online transfer requires reference field",
    run: async (page, baseUrl) => {
      const menuDb = {
        menu: {
          item_1: { name: 'Nasi Lemak', price: 12.50, category: 'mains', available: true, description: 'Delicious', names: { en: 'Nasi Lemak' } }
        }
      };
      await setupPageMocks(page, menuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      await page.evaluate(() => document.querySelector('button').click());
      await clickButton(page, "Checkout");
      await page.waitForSelector('form');
      
      // Click Online Transfer radio
      await clickButton(page, "Online Transfer");
      
      // Verify paymentRef field is present and required
      const required = await page.evaluate(() => {
        const input = document.querySelector('input[placeholder*="1234"]');
        return input ? input.required : false;
      });
      assert.strictEqual(required, true);
    }
  },
  {
    name: "T2.20: Checkout payment: online reference field has minLength=4 constraint",
    run: async (page, baseUrl) => {
      const menuDb = {
        menu: {
          item_1: { name: 'Nasi Lemak', price: 12.50, category: 'mains', available: true, description: 'Delicious', names: { en: 'Nasi Lemak' } }
        }
      };
      await setupPageMocks(page, menuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      await page.evaluate(() => document.querySelector('button').click());
      await clickButton(page, "Checkout");
      await page.waitForSelector('form');
      
      await clickButton(page, "Online Transfer");
      const minLength = await page.evaluate(() => {
        const input = document.querySelector('input[placeholder*="1234"]');
        return input ? input.minLength : 0;
      });
      assert.strictEqual(minLength, 4);
    }
  },
  {
    name: "T2.21: Checkout payment: online reference with 4 chars is accepted",
    run: async (page, baseUrl) => {
      const menuDb = {
        menu: {
          item_1: { name: 'Nasi Lemak', price: 12.50, category: 'mains', available: true, description: 'Delicious', names: { en: 'Nasi Lemak' } }
        }
      };
      await setupPageMocks(page, menuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      await page.evaluate(() => document.querySelector('button').click());
      await clickButton(page, "Checkout");
      await page.waitForSelector('form');
      
      await fillInput(page, 'input[type="text"]', "Test Customer");
      await clickButton(page, "Online Transfer");
      
      // Fill reference
      await page.type('input[placeholder*="1234"]', "1234");
      await clickButton(page, "Place Order");
      
      await page.waitForFunction(() => document.body.innerText.includes('Success') || document.body.innerText.includes('Receipt'));
      const dbState = await page.evaluate(() => window.mockDb);
      const orders = Object.values(dbState.orders);
      assert.strictEqual(orders.length, 1);
      assert.strictEqual(orders[0].paymentRef, "1234");
    }
  },
  {
    name: "T2.22: Checkout payment: cash/counter payment hides reference field",
    run: async (page, baseUrl) => {
      const menuDb = {
        menu: {
          item_1: { name: 'Nasi Lemak', price: 12.50, category: 'mains', available: true, description: 'Delicious', names: { en: 'Nasi Lemak' } }
        }
      };
      await setupPageMocks(page, menuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      await page.evaluate(() => document.querySelector('button').click());
      await clickButton(page, "Checkout");
      await page.waitForSelector('form');
      
      await clickButton(page, "Pay at Counter");
      const hidden = await page.evaluate(() => {
        return !document.querySelector('input[placeholder*="1234"]');
      });
      assert.strictEqual(hidden, true);
    }
  },
  {
    name: "T2.23: Checkout payment: DuitNow TnG QR requires reference with minLength=4",
    run: async (page, baseUrl) => {
      const menuDb = {
        menu: {
          item_1: { name: 'Nasi Lemak', price: 12.50, category: 'mains', available: true, description: 'Delicious', names: { en: 'Nasi Lemak' } }
        }
      };
      await setupPageMocks(page, menuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      await page.evaluate(() => document.querySelector('button').click());
      await clickButton(page, "Checkout");
      await page.waitForSelector('form');
      
      await clickButton(page, "DuitNow QR");
      const constraints = await page.evaluate(() => {
        const input = document.querySelector('input[placeholder*="1234"]');
        return input ? { required: input.required, minLength: input.minLength } : null;
      });
      assert.deepStrictEqual(constraints, { required: true, minLength: 4 });
    }
  },
  {
    name: "T2.24: Checkout payment: checkout form without customer name is blocked",
    run: async (page, baseUrl) => {
      const menuDb = {
        menu: {
          item_1: { name: 'Nasi Lemak', price: 12.50, category: 'mains', available: true, description: 'Delicious', names: { en: 'Nasi Lemak' } }
        }
      };
      await setupPageMocks(page, menuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      await page.evaluate(() => document.querySelector('button').click());
      await clickButton(page, "Checkout");
      await page.waitForSelector('form');
      
      const nameInput = await page.evaluate(() => {
        const input = document.querySelector('input[type="text"]');
        return input ? { required: input.required, value: input.value } : null;
      });
      assert.strictEqual(nameInput.required, true);
      assert.strictEqual(nameInput.value, "");
    }
  },
  {
    name: "T2.25: Settings boundary: settings with 0 tables does not crash Book.jsx page",
    run: async (page, baseUrl) => {
      const dbState = {
        settings: {
          master: { bookingEnabled: true, tables: 0, restaurantName: "Zero Tables Cafe" }
        }
      };
      await setupPageMocks(page, dbState);
      await page.goto(baseUrl + '/book');
      await page.waitForSelector('input[name="name"]');
      const text = await page.evaluate(() => document.body.innerText);
      assert(text.includes("Zero Tables Cafe"));
    }
  }
];
