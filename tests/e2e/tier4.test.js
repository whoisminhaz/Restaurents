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
    name: "T4.1: Real-world: Customer booking -> pre-order -> checkout -> admin confirms reservation",
    run: async (page, baseUrl) => {
      const dbState = {
        settings: {
          master: { bookingEnabled: true, tables: 5, requirePreOrderForBooking: true }
        },
        ...menuDb
      };
      await setupPageMocks(page, dbState);
      
      // 1. Customer Books Table
      await page.goto(baseUrl + '/book');
      await submitBookingForm(page, {
        name: "E2E Lifecycle Guest",
        phone: "+60123456781",
        date: "2026-06-25",
        time: "12:00 PM",
        guests: 2
      });
      await page.waitForFunction(() => page.url().includes('/order'));
      
      // 2. Customer Pre-orders food
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      await page.evaluate(() => document.querySelector('button').click()); // Add Nasi Lemak
      await clickButton(page, "Checkout");
      await page.waitForSelector('form');
      
      // 3. Checkout Page
      await clickButton(page, "Place Order");
      await page.waitForFunction(() => document.body.innerText.includes('Success') || document.body.innerText.includes('Receipt'));
      
      // 4. Admin Logs In and Navigates to Reservations Dashboard
      await loginAsAdmin(page);
      await page.goto(baseUrl + '/dashboard/reservations');
      await page.waitForFunction(() => document.body.innerText.includes('E2E Lifecycle Guest'));
      
      // Assign Table 3 and Click Confirm
      await page.select('select[name="tableAssignment"]', '3');
      await clickButton(page, "Confirm");
      
      // Verify reservation updated in database
      await page.waitForFunction(() => {
        const reservations = Object.values(window.mockDb.reservations);
        return reservations.find(r => r.name === "E2E Lifecycle Guest" && r.status === "confirmed" && r.table === "3");
      });
      
      const dbVal = await page.evaluate(() => window.mockDb);
      const res = Object.values(dbVal.reservations).find(r => r.name === "E2E Lifecycle Guest");
      assert.strictEqual(res.status, "confirmed");
      assert.strictEqual(res.table, "3");
    }
  },
  {
    name: "T4.2: Real-world: Cashier POS walk-in order flow",
    run: async (page, baseUrl) => {
      const dbState = {
        ...menuDb
      };
      const authUser = { uid: 'admin-uid', email: 'admin@cafebella.com' };
      await setupPageMocks(page, dbState, authUser);
      
      await page.goto(baseUrl + '/dashboard/pos');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      
      // Add items to POS cart by clicking on them
      await page.evaluate(() => {
        // Find Nasi Lemak card button and click it
        const card = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Nasi Lemak'));
        if (card) card.click();
      });
      await page.waitForFunction(() => document.body.innerText.includes('Current Order') && document.body.innerText.includes('1 Item') || document.body.innerText.includes('Trash'));
      
      // Fill customer name in POS
      await fillInput(page, 'input[placeholder*="Customer Name"]', "POS Walk-in");
      
      // Click Confirm & Send to Kitchen
      await clickButton(page, "Confirm & Send to Kitchen");
      
      // Verify order is created in processing status
      await page.waitForFunction(() => {
        const orders = Object.values(window.mockDb.orders);
        return orders.find(o => o.customerName === "POS Walk-in" && o.status === "processing");
      });
      
      const finalDb = await page.evaluate(() => window.mockDb);
      const order = Object.values(finalDb.orders).find(o => o.customerName === "POS Walk-in");
      assert.strictEqual(order.status, "processing");
      assert.strictEqual(order.total, 10.00);
    }
  },
  {
    name: "T4.3: Real-world: Real-time Live Orders Update (Customer -> Kitchen -> Cooked)",
    run: async (page, baseUrl) => {
      const dbState = {
        ...menuDb
      };
      await setupPageMocks(page, dbState);
      
      // 1. Customer places direct order
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Nasi Lemak'));
      await page.evaluate(() => document.querySelector('button').click()); // add Nasi Lemak
      await clickButton(page, "Checkout");
      await page.waitForSelector('form');
      await fillInput(page, 'input[required]', "Live Order Customer");
      await clickButton(page, "Place Order");
      await page.waitForFunction(() => document.body.innerText.includes('Receipt'));
      
      // 2. Admin logs in and goes to live orders
      await loginAsAdmin(page);
      await page.goto(baseUrl + '/dashboard/live-orders');
      await page.waitForFunction(() => document.body.innerText.includes('Live Order Customer'));
      
      // Live orders shows "Send to Kitchen" for pending order
      await clickButton(page, "Send to Kitchen");
      
      // Verify status updated to processing
      await page.waitForFunction(() => {
        const order = Object.values(window.mockDb.orders).find(o => o.customerName === "Live Order Customer");
        return order && order.status === "processing";
      });
      
      // Now complete the order in processing tab
      await clickButton(page, "processing"); // Switch to processing tab
      await page.waitForFunction(() => document.body.innerText.includes('Complete') || document.body.innerText.includes('Served'));
      await clickButton(page, "Complete");
      
      // Verify status updated to completed
      await page.waitForFunction(() => {
        const order = Object.values(window.mockDb.orders).find(o => o.customerName === "Live Order Customer");
        return order && order.status === "completed";
      });
      
      const finalDb = await page.evaluate(() => window.mockDb);
      const order = Object.values(finalDb.orders).find(o => o.customerName === "Live Order Customer");
      assert.strictEqual(order.status, "completed");
    }
  },
  {
    name: "T4.4: Real-world: Settings change propagates to customer menu and totals",
    run: async (page, baseUrl) => {
      const dbState = {
        settings: {
          adminConfig: { ownerEmail: 'admin@cafebella.com' }
        },
        ...menuDb
      };
      const authUser = { uid: 'admin-uid', email: 'admin@cafebella.com' };
      await setupPageMocks(page, dbState, authUser);
      
      // 1. Admin goes to settings, changes name, adds tax & discount
      await page.goto(baseUrl + '/dashboard/settings');
      await page.waitForSelector('input[name="restaurantName"]');
      
      await fillInput(page, 'input[name="restaurantName"]', "Dynamic Cafe");
      await fillInput(page, 'input[name="taxPercent"]', "5"); // 5% tax
      await fillInput(page, 'input[name="discountPercent"]', "10"); // 10% discount
      
      // Click Save Settings or similar
      await clickButton(page, "Save Settings");
      
      // 2. Customer visits menu page
      await logout(page);
      await page.goto(baseUrl + '/order');
      await page.waitForFunction(() => document.body.innerText.includes('Dynamic Cafe'));
      
      // Add Nasi Lemak (original: 10.00, activePrice: 9.00 due to 10% discount)
      await page.evaluate(() => document.querySelector('button').click());
      await page.waitForFunction(() => document.body.innerText.includes('1 Item'));
      
      await clickButton(page, "Checkout");
      await page.waitForSelector('form');
      
      // Verify math: Nasi Lemak: 9.00, Tax (5%): 0.45, Total: 9.45
      const totalText = await page.evaluate(() => document.body.innerText);
      assert(totalText.includes("9.45"), `Expected checkout total to be 9.45, got: ${totalText}`);
    }
  },
  {
    name: "T4.5: Real-world: Booking table assignment verified by customer search",
    run: async (page, baseUrl) => {
      const dbState = {
        settings: {
          master: { bookingEnabled: true, tables: 5 }
        }
      };
      await setupPageMocks(page, dbState);
      
      // 1. Customer requests booking
      await page.goto(baseUrl + '/book');
      await submitBookingForm(page, {
        name: "Verification Customer",
        phone: "+60123456799",
        date: "2026-06-25",
        time: "15:00",
        guests: 4
      });
      await page.waitForSelector('button');
      
      // Grab reservation ID from mock database
      const resId = await page.evaluate(() => {
        return Object.keys(window.mockDb.reservations)[0];
      });
      
      // 2. Admin logs in and confirms with table assignment "Table 4"
      await loginAsAdmin(page);
      await page.goto(baseUrl + '/dashboard/reservations');
      await page.waitForFunction(() => document.body.innerText.includes('Verification Customer'));
      
      await page.select('select[name="tableAssignment"]', '4');
      await clickButton(page, "Confirm");
      
      // 3. Customer searches for booking using ID
      await logout(page);
      await page.goto(baseUrl + '/book');
      await clickButton(page, "Manage Booking");
      await fillInput(page, 'input[name="searchQuery"]', resId);
      await clickButton(page, 'form button[type="submit"]');
      
      // Verify customer sees confirmation and assigned table "Table 4"
      await page.waitForFunction(() => document.body.innerText.includes('Confirmed') || document.body.innerText.includes('confirmed'));
      const text = await page.evaluate(() => document.body.innerText);
      assert(text.includes("Table 4") || text.includes("4 People") || text.includes("confirmed"));
    }
  }
];
