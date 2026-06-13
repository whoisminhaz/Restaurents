import assert from 'assert';
import { setupPageMocks, seedDb, loginAsAdmin, logout, fillInput, clickButton, submitBookingForm } from './helpers.js';

const menuDb = {
  menu: {
    item_1: { name: 'Nasi Lemak', price: 10.00, category: 'mains', available: true, description: 'Delicious', names: { en: 'Nasi Lemak' } },
    item_2: { name: 'Teh Tarik', price: 5.00, category: 'drinks', available: true, description: 'Sweet', names: { en: 'Teh Tarik' } }
  }
};

export const tests = [
  {
    name: "T3.1: Settings propagation: requirePreOrderForBooking redirects booking to /order",
    run: async (page, baseUrl) => {
      const dbState = {
        settings: {
          master: { bookingEnabled: true, tables: 5, requirePreOrderForBooking: true }
        }
      };
      await setupPageMocks(page, dbState);
      await page.goto(baseUrl + '/book');
      await page.waitForSelector('input[name="name"]');
      
      await submitBookingForm(page, {
        name: "PreOrder Customer",
        phone: "+60123456777",
        date: new Date().toISOString().split('T')[0],
        time: "19:00",
        guests: 3,
        notes: "Preorder test"
      });
      
      // Should redirect to /order
      await page.waitForFunction(() => page.url().includes('/order'));
      const url = page.url();
      assert(url.includes('/order'), `Expected URL to include /order, got ${url}`);
      
      // LocalStorage should contain pendingReservation
      const pending = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('pendingReservation'));
      });
      assert.strictEqual(pending.name, "PreOrder Customer");
      assert.strictEqual(pending.phone, "+60123456777");
    }
  },
  {
    name: "T3.2: Table sync with orders: checkout sets finalTable as Pending Table for pre-order",
    run: async (page, baseUrl) => {
      const dbState = {
        settings: {
          master: { bookingEnabled: true, tables: 5, requirePreOrderForBooking: true }
        },
        ...menuDb
      };
      await setupPageMocks(page, dbState);
      
      // Simulate booking first to set up pendingReservation
      await page.goto(baseUrl + '/book');
      await submitBookingForm(page, {
        name: "PreOrder Sync Customer",
        phone: "+60123456778",
        date: new Date().toISOString().split('T')[0],
        time: "19:00",
        guests: 4
      });
      
      await page.waitForFunction(() => page.url().includes('/order'));
      
      // Add item to cart and go to checkout
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      await page.evaluate(() => document.querySelector('button').click());
      await clickButton(page, "Checkout");
      
      // Check finalTable on checkout page is "Pending Table"
      await page.waitForSelector('form');
      const checkoutText = await page.evaluate(() => document.body.innerText);
      assert(checkoutText.includes("Dine-In (Pending Table)") || checkoutText.includes("Pending Table") || checkoutText.includes("dineIn"));
      
      // Submit order
      await clickButton(page, "Place Order");
      await page.waitForFunction(() => document.body.innerText.includes('Success') || document.body.innerText.includes('Receipt'));
      
      // Verify finalTable in mockDb orders
      const dbVal = await page.evaluate(() => window.mockDb);
      const orders = Object.values(dbVal.orders);
      assert.strictEqual(orders[0].table, "Pending Table");
    }
  },
  {
    name: "T3.3: Discount calculation: activePrice correctly reflects discountPercent",
    run: async (page, baseUrl) => {
      const dbState = {
        settings: {
          master: { bookingEnabled: true, tables: 5, discountPercent: 20 } // 20% discount
        },
        ...menuDb
      };
      await setupPageMocks(page, dbState);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      
      // Add Nasi Lemak (original price: 10.00, discounted price should be 8.00)
      await page.evaluate(() => {
        document.querySelector('button').click();
      });
      
      await page.waitForFunction(() => document.body.innerText.includes('1 Item'));
      const text = await page.evaluate(() => document.body.innerText);
      // Verify the active price of 8.00 is shown
      assert(text.includes("8.00"), `Expected discounted price 8.00, page text was: ${text}`);
    }
  },
  {
    name: "T3.4: Tax calculation: checkout total correctly adds taxPercent",
    run: async (page, baseUrl) => {
      const dbState = {
        settings: {
          master: { bookingEnabled: true, tables: 5, taxPercent: 10 } // 10% tax
        },
        ...menuDb
      };
      await setupPageMocks(page, dbState);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      await page.evaluate(() => document.querySelector('button').click()); // add Nasi Lemak (10.00)
      
      await clickButton(page, "Checkout");
      await page.waitForSelector('form');
      
      // Nasi Lemak = 10.00. Tax = 1.00. Total = 11.00.
      const text = await page.evaluate(() => document.body.innerText);
      assert(text.includes("11.00"), `Expected total with 10% tax to be 11.00, page text: ${text}`);
    }
  },
  {
    name: "T3.5: Pre-order checkout flow: link created order with created reservation",
    run: async (page, baseUrl) => {
      const dbState = {
        settings: {
          master: { bookingEnabled: true, tables: 5, requirePreOrderForBooking: true }
        },
        ...menuDb
      };
      await setupPageMocks(page, dbState);
      
      // 1. Fill booking form
      await page.goto(baseUrl + '/book');
      await submitBookingForm(page, {
        name: "Combined Customer",
        phone: "+60123456779",
        date: "2026-06-20",
        time: "14:00",
        guests: 2,
        notes: "All-in-one test"
      });
      
      await page.waitForFunction(() => page.url().includes('/order'));
      
      // 2. Add menu item
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      await page.evaluate(() => document.querySelector('button').click());
      await clickButton(page, "Checkout");
      await page.waitForSelector('form');
      
      // 3. Complete checkout
      await clickButton(page, "Place Order");
      await page.waitForFunction(() => document.body.innerText.includes('Success') || document.body.innerText.includes('Receipt'));
      
      // 4. Assert in mockDb that the order is linked to reservation
      const finalDb = await page.evaluate(() => window.mockDb);
      const orders = Object.values(finalDb.orders);
      const reservations = Object.values(finalDb.reservations);
      
      assert.strictEqual(orders.length, 1);
      assert.strictEqual(reservations.length, 1);
      assert.strictEqual(reservations[0].name, "Combined Customer");
      assert.strictEqual(reservations[0].linkedOrderId, orders[0].orderNumber);
    }
  }
];
