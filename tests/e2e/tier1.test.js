import assert from 'assert';
import { setupPageMocks, seedDb, loginAsAdmin, logout, fillInput, clickButton, submitBookingForm } from './helpers.js';

const initialMenuDb = {
  menu: {
    item_1: { name: 'Nasi Lemak', price: 12.50, category: 'mains', available: true, description: 'Delicious', names: { en: 'Nasi Lemak', ms: 'Nasi Lemak' } },
    item_2: { name: 'Teh Tarik', price: 3.50, category: 'drinks', available: true, description: 'Sweet', names: { en: 'Teh Tarik', ms: 'Teh Tarik' } },
    item_3: { name: 'Roti Canai', price: 4.00, category: 'mains', available: false, description: 'Flaky', names: { en: 'Roti Canai', ms: 'Roti Canai' } }
  }
};

export const tests = [
  {
    name: "T1.1: Public route redirection to /book",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/');
      await page.waitForSelector('input[name="name"]');
      const url = page.url();
      assert(url.includes('/book'), `Expected URL to include /book, got ${url}`);
    }
  },
  {
    name: "T1.2: Displaying restaurant name from master settings",
    run: async (page, baseUrl) => {
      const dbState = {
        settings: {
          master: { bookingEnabled: true, tables: 5, restaurantName: "Cafe Bella E2E" }
        }
      };
      await setupPageMocks(page, dbState);
      await page.goto(baseUrl + '/book');
      await page.waitForSelector('header h1');
      const headerText = await page.evaluate(() => document.querySelector('header h1').textContent);
      assert.strictEqual(headerText, "Cafe Bella E2E");
    }
  },
  {
    name: "T1.3: Loading of the date picker in booking form",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await page.waitForSelector('input[name="date"]');
      const minDate = await page.evaluate(() => document.querySelector('input[name="date"]').getAttribute('min'));
      const today = new Date().toISOString().split('T')[0];
      assert.strictEqual(minDate, today);
    }
  },
  {
    name: "T1.4: Correct listing of guest count options",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await page.waitForSelector('select[name="guests"]');
      const options = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('select[name="guests"] option')).map(o => o.value);
      });
      assert.deepStrictEqual(options, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
    }
  },
  {
    name: "T1.5: Successful booking submission",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await submitBookingForm(page, {
        name: "John Doe",
        phone: "+60123456789",
        date: new Date().toISOString().split('T')[0],
        time: "19:00",
        guests: 4,
        notes: "Anniversary"
      });
      // Should show success or pending reservation receipt
      await page.waitForFunction(() => document.body.innerText.includes('Requested') || document.body.innerText.includes('Success') || document.body.innerText.includes('Receipt'));
      const dbState = await page.evaluate(() => window.mockDb);
      const res = Object.values(dbState.reservations);
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].name, "John Doe");
      assert.strictEqual(res[0].status, "pending");
    }
  },
  {
    name: "T1.6: Displaying booking confirmation receipt",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/book');
      await submitBookingForm(page, {
        name: "Jane Receipt",
        phone: "+60123456788",
        date: new Date().toISOString().split('T')[0],
        time: "18:00",
        guests: 2,
        notes: "Window seat"
      });
      await page.waitForSelector('button');
      const pageText = await page.evaluate(() => document.body.innerText);
      assert(pageText.includes("Download Receipt") || pageText.includes("Receipt"), "Should display receipt download action");
    }
  },
  {
    name: "T1.7: Finding a reservation by ID under Manage Booking",
    run: async (page, baseUrl) => {
      const dbState = {
        reservations: {
          res_123: { name: "Find Me", phone: "+60123456711", date: "2026-06-12", time: "12:00", guests: 3, status: "confirmed" }
        }
      };
      await setupPageMocks(page, dbState);
      await page.goto(baseUrl + '/book');
      await clickButton(page, "Manage Booking");
      await fillInput(page, 'input[name="searchQuery"]', "res_123");
      await clickButton(page, 'form button[type="submit"]');
      await page.waitForFunction(() => document.body.innerText.includes('Find Me'));
      const details = await page.evaluate(() => document.body.innerText);
      assert(details.includes("Find Me"));
      assert(details.includes("3 People") || details.includes("3 Pax"));
    }
  },
  {
    name: "T1.8: Finding a reservation by Phone under Manage Booking",
    run: async (page, baseUrl) => {
      const dbState = {
        reservations: {
          res_phone: { name: "Find By Phone", phone: "+60123456722", date: "2026-06-12", time: "13:00", guests: 2, status: "confirmed" }
        }
      };
      await setupPageMocks(page, dbState);
      await page.goto(baseUrl + '/book');
      await clickButton(page, "Manage Booking");
      await fillInput(page, 'input[name="searchQuery"]', "+60123456722");
      await clickButton(page, 'form button[type="submit"]');
      await page.waitForFunction(() => document.body.innerText.includes('Find By Phone'));
      const details = await page.evaluate(() => document.body.innerText);
      assert(details.includes("Find By Phone"));
    }
  },
  {
    name: "T1.9: Canceling a confirmed reservation from customer page",
    run: async (page, baseUrl) => {
      const dbState = {
        reservations: {
          res_cancel: { name: "Cancel Me", phone: "+60123456733", date: "2026-06-12", time: "14:00", guests: 2, status: "confirmed" }
        }
      };
      await setupPageMocks(page, dbState);
      await page.goto(baseUrl + '/book');
      await clickButton(page, "Manage Booking");
      await fillInput(page, 'input[name="searchQuery"]', "res_cancel");
      await clickButton(page, 'form button[type="submit"]');
      await page.waitForFunction(() => document.body.innerText.includes('Cancel Me'));
      // Intercept and accept confirm dialog
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      await clickButton(page, "Cancel Reservation");
      await page.waitForFunction(() => {
        return window.mockDb.reservations.res_cancel.status === 'cancelled';
      });
      const dbVal = await page.evaluate(() => window.mockDb.reservations.res_cancel.status);
      assert.strictEqual(dbVal, "cancelled");
    }
  },
  {
    name: "T1.10: Showing Closed when booking is disabled",
    run: async (page, baseUrl) => {
      const dbState = {
        settings: {
          master: { bookingEnabled: false }
        }
      };
      await setupPageMocks(page, dbState);
      await page.goto(baseUrl + '/book');
      await page.waitForFunction(() => document.body.innerText.includes('Closed') || document.body.innerText.includes('not taking'));
      const text = await page.evaluate(() => document.body.innerText);
      assert(text.includes("Closed") || text.includes("not taking"));
    }
  },
  {
    name: "T1.11: Routing to Menu/Order page",
    run: async (page, baseUrl) => {
      await setupPageMocks(page, initialMenuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForSelector('header');
      const url = page.url();
      assert(url.includes('/order'));
    }
  },
  {
    name: "T1.12: Displaying menu items",
    run: async (page, baseUrl) => {
      await setupPageMocks(page, initialMenuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      const text = await page.evaluate(() => document.body.innerText);
      assert(text.includes("Nasi Lemak"));
      assert(text.includes("Teh Tarik"));
      // Roti Canai is unavailable, shouldn't display
      assert(!text.includes("Roti Canai"));
    }
  },
  {
    name: "T1.13: Filtering menu items by category",
    run: async (page, baseUrl) => {
      await setupPageMocks(page, initialMenuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      
      // Filter by drinks category by clicking drinks category button
      await clickButton(page, "drinks");
      await page.waitForFunction(() => !document.body.innerText.includes('Nasi Lemak'));
      const text = await page.evaluate(() => document.body.innerText);
      assert(text.includes("Teh Tarik"));
      assert(!text.includes("Nasi Lemak"));
    }
  },
  {
    name: "T1.14: Adding an item to the shopping cart",
    run: async (page, baseUrl) => {
      await setupPageMocks(page, initialMenuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      
      // Click Add/Plus button on Nasi Lemak
      await clickButton(page, "button[aria-label*='Add']"); // Fallback check
      // Let's click plus icon or text
      const beforeCart = await page.evaluate(() => document.body.innerText.includes('Cart') || document.body.innerText.includes('Basket'));
      
      // Find element containing "Nasi Lemak" and click the add/plus button next to it
      await page.evaluate(() => {
        const itemEl = Array.from(document.querySelectorAll('div')).find(el => el.textContent.includes('Nasi Lemak'));
        const btn = itemEl.querySelector('button');
        if (btn) btn.click();
      });
      
      await page.waitForFunction(() => document.body.innerText.includes('1 Item') || document.body.innerText.includes('1x'));
      const text = await page.evaluate(() => document.body.innerText);
      assert(text.includes("1x Nasi Lemak") || text.includes("1 Item"));
    }
  },
  {
    name: "T1.15: Incrementing item count in the shopping cart",
    run: async (page, baseUrl) => {
      await setupPageMocks(page, initialMenuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      
      await page.evaluate(() => {
        const itemEl = Array.from(document.querySelectorAll('div')).find(el => el.textContent.includes('Nasi Lemak'));
        const btn = itemEl.querySelector('button');
        if (btn) btn.click();
      });
      await page.waitForFunction(() => document.body.innerText.includes('1 Item') || document.body.innerText.includes('1x'));
      
      // Click increment (+)
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        // Find button with plus icon or text
        const plusBtn = btns.find(b => b.innerHTML.includes('plus') || b.textContent === '+');
        if (plusBtn) plusBtn.click();
      });
      
      await page.waitForFunction(() => document.body.innerText.includes('2 Items') || document.body.innerText.includes('2x'));
      const text = await page.evaluate(() => document.body.innerText);
      assert(text.includes("2x Nasi Lemak") || text.includes("2 Items"));
    }
  },
  {
    name: "T1.16: Decrementing item count in the shopping cart",
    run: async (page, baseUrl) => {
      await setupPageMocks(page, initialMenuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      
      await page.evaluate(() => {
        const itemEl = Array.from(document.querySelectorAll('div')).find(el => el.textContent.includes('Nasi Lemak'));
        const btn = itemEl.querySelector('button');
        if (btn) btn.click();
      });
      await page.waitForFunction(() => document.body.innerText.includes('1 Item') || document.body.innerText.includes('1x'));
      
      // Click decrement (-)
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const minusBtn = btns.find(b => b.innerHTML.includes('minus') || b.textContent === '-');
        if (minusBtn) minusBtn.click();
      });
      
      await page.waitForFunction(() => !document.body.innerText.includes('1 Item') && !document.body.innerText.includes('1x'));
      const text = await page.evaluate(() => document.body.innerText);
      assert(!text.includes("1x Nasi Lemak"));
    }
  },
  {
    name: "T1.17: Calculating correct cart total",
    run: async (page, baseUrl) => {
      await setupPageMocks(page, initialMenuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      
      await page.evaluate(() => {
        const item1El = Array.from(document.querySelectorAll('div')).find(el => el.textContent.includes('Nasi Lemak'));
        item1El.querySelector('button').click();
        
        const item2El = Array.from(document.querySelectorAll('div')).find(el => el.textContent.includes('Teh Tarik'));
        item2El.querySelector('button').click();
      });
      
      await page.waitForFunction(() => document.body.innerText.includes('2 Items'));
      const text = await page.evaluate(() => document.body.innerText);
      // Total should be 12.50 + 3.50 = 16.00
      assert(text.includes("16.00"));
    }
  },
  {
    name: "T1.18: Navigating to checkout page from menu page",
    run: async (page, baseUrl) => {
      await setupPageMocks(page, initialMenuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      
      await page.evaluate(() => {
        const itemEl = Array.from(document.querySelectorAll('div')).find(el => el.textContent.includes('Nasi Lemak'));
        itemEl.querySelector('button').click();
      });
      
      await clickButton(page, "Checkout");
      await page.waitForSelector('form');
      const url = page.url();
      assert(url.includes('/checkout'));
    }
  },
  {
    name: "T1.19: Rendering correct checkout inputs",
    run: async (page, baseUrl) => {
      await setupPageMocks(page, initialMenuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      await page.evaluate(() => {
        const itemEl = Array.from(document.querySelectorAll('div')).find(el => el.textContent.includes('Nasi Lemak'));
        itemEl.querySelector('button').click();
      });
      await clickButton(page, "Checkout");
      await page.waitForSelector('form');
      
      const inputs = await page.evaluate(() => {
        return {
          nameExists: !!document.querySelector('input[type="text"]'),
          phoneExists: !!document.querySelector('input[type="tel"]'),
          notesExists: !!document.querySelector('textarea')
        };
      });
      assert(inputs.nameExists);
      assert(inputs.phoneExists);
      assert(inputs.notesExists);
    }
  },
  {
    name: "T1.20: Ordering without pre-booking (takeaway)",
    run: async (page, baseUrl) => {
      await setupPageMocks(page, initialMenuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      await page.evaluate(() => {
        const itemEl = Array.from(document.querySelectorAll('div')).find(el => el.textContent.includes('Nasi Lemak'));
        itemEl.querySelector('button').click();
      });
      await clickButton(page, "Checkout");
      await page.waitForSelector('form');
      
      const text = await page.evaluate(() => document.body.innerText);
      assert(text.includes("Takeaway"));
    }
  },
  {
    name: "T1.21: Submitting checkout order creation",
    run: async (page, baseUrl) => {
      await setupPageMocks(page, initialMenuDb);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      await page.evaluate(() => {
        const itemEl = Array.from(document.querySelectorAll('div')).find(el => el.textContent.includes('Nasi Lemak'));
        itemEl.querySelector('button').click();
      });
      await clickButton(page, "Checkout");
      await page.waitForSelector('form');
      
      await fillInput(page, 'input[required]', "Takeaway Customer");
      await clickButton(page, "Place Order");
      
      await page.waitForFunction(() => document.body.innerText.includes('Success') || document.body.innerText.includes('Receipt') || document.body.innerText.includes('Order No'));
      const dbState = await page.evaluate(() => window.mockDb);
      const orders = Object.values(dbState.orders);
      assert.strictEqual(orders.length, 1);
      assert.strictEqual(orders[0].customerName, "Takeaway Customer");
      assert.strictEqual(orders[0].status, "pending");
    }
  },
  {
    name: "T1.22: Accessing the Admin Login screen",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/login');
      await page.waitForSelector('input[type="email"]');
      const text = await page.evaluate(() => document.body.innerText);
      assert(text.includes("Owner Portal") || text.includes("Admin") || text.includes("Login"));
    }
  },
  {
    name: "T1.23: Submitting login with authorized email",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/login');
      await page.waitForSelector('input[type="email"]');
      
      await fillInput(page, 'input[type="email"]', "admin@cafebella.com");
      await fillInput(page, 'input[type="password"]', "password123");
      await clickButton(page, 'button[type="submit"]');
      
      await page.waitForFunction(() => page.url().includes('/dashboard'));
      const url = page.url();
      assert(url.includes('/dashboard'), `Expected dashboard URL, got ${url}`);
    }
  },
  {
    name: "T1.24: Login rejection for unauthorized email",
    run: async (page, baseUrl) => {
      await setupPageMocks(page);
      await page.goto(baseUrl + '/login');
      await page.waitForSelector('input[type="email"]');
      
      await fillInput(page, 'input[type="email"]', "unauthorized@test.com");
      await fillInput(page, 'input[type="password"]', "password123");
      await clickButton(page, 'button[type="submit"]');
      
      await page.waitForFunction(() => document.body.innerText.includes('Unauthorized') || document.body.innerText.includes('not registered') || document.body.innerText.includes('Invalid'));
      const text = await page.evaluate(() => document.body.innerText);
      assert(text.includes('Unauthorized') || text.includes('not registered') || text.includes('Invalid'));
    }
  },
  {
    name: "T1.25: Checking that logging out redirects to login",
    run: async (page, baseUrl) => {
      // Seed admin config and login
      const dbState = {
        settings: {
          adminConfig: { ownerEmail: 'admin@cafebella.com' }
        }
      };
      const authUser = { uid: 'admin-uid', email: 'admin@cafebella.com' };
      await setupPageMocks(page, dbState, authUser);
      
      await page.goto(baseUrl + '/dashboard/settings');
      await page.waitForSelector('header');
      
      // Let's click the logout button or trigger logout directly
      await clickButton(page, "Log Out");
      await page.waitForFunction(() => page.url().includes('/login'));
      const url = page.url();
      assert(url.includes('/login'));
    }
  }
];
