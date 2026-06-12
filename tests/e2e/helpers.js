// Puppeteer E2E helpers for Restaurant reservation system tests

/**
 * Injects initial database and authentication state before the page loads.
 * This runs before any scripts on the page execute.
 */
export async function setupPageMocks(page, initialDbState = {}, initialAuthUser = null) {
  await page.evaluateOnNewDocument((dbState, authUser) => {
    window.mockDb = {
      settings: {
        master: { bookingEnabled: true, tables: 5 },
        adminConfig: { ownerEmail: 'admin@cafebella.com' }
      },
      reservations: {},
      orders: {},
      menu: {},
      ...dbState
    };
    window.mockAuth = {
      currentUser: authUser
    };
  }, initialDbState, initialAuthUser);
}

/**
 * Dynamic seeding of database state on the fly.
 */
export async function seedDb(page, dbState) {
  await page.evaluate((state) => {
    window.mockDb = window.mockDb || {};
    for (const [coll, data] of Object.entries(state)) {
      window.mockDb[coll] = window.mockDb[coll] || {};
      for (const [docId, docVal] of Object.entries(data)) {
        window.mockDb[coll][docId] = docVal;
      }
      if (window.triggerListeners) {
        window.triggerListeners(coll);
      }
    }
  }, dbState);
}

/**
 * Dynamic injection of auth state on the fly.
 */
export async function loginAsAdmin(page, email = 'admin@cafebella.com') {
  await page.evaluate((userEmail) => {
    const user = { uid: 'mock-uid', email: userEmail };
    window.mockAuth = window.mockAuth || {};
    window.mockAuth.currentUser = user;
    if (window.triggerAuthChange) {
      window.triggerAuthChange(user);
    }
  }, email);
}

/**
 * Log out of auth session.
 */
export async function logout(page) {
  await page.evaluate(() => {
    window.mockAuth = window.mockAuth || {};
    window.mockAuth.currentUser = null;
    if (window.triggerAuthChange) {
      window.triggerAuthChange(null);
    }
  });
}

/**
 * Fill input field helper.
 */
export async function fillInput(page, selector, text) {
  await page.waitForSelector(selector, { visible: true });
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  if (text !== '') {
    await page.type(selector, text);
  }
}

/**
 * Click button helper, searching by CSS selector or text value.
 */
export async function clickButton(page, selectorOrText) {
  try {
    // Try to treat it as a direct selector first
    await page.waitForSelector(selectorOrText, { timeout: 500 });
    await page.click(selectorOrText);
    return;
  } catch (e) {
    // If that fails, look for button or link by text content
    const clicked = await page.evaluate((text) => {
      const elements = Array.from(document.querySelectorAll('button, a, input[type="submit"], [role="button"]'));
      const match = elements.find(el => 
        el.textContent.trim().toLowerCase().includes(text.toLowerCase()) || 
        (el.value && el.value.trim().toLowerCase().includes(text.toLowerCase()))
      );
      if (match) {
        match.click();
        return true;
      }
      return false;
    }, selectorOrText);
    if (!clicked) {
      throw new Error(`Could not click button with selector or text: "${selectorOrText}"`);
    }
  }
}

/**
 * Submit the customer booking form using provided data.
 */
export async function submitBookingForm(page, data) {
  if (data.name !== undefined) await fillInput(page, 'input[name="name"]', data.name);
  if (data.phone !== undefined) await fillInput(page, 'input[name="phone"]', data.phone);
  if (data.date !== undefined) await fillInput(page, 'input[name="date"]', data.date);
  if (data.time !== undefined) {
    await page.waitForSelector('select[name="time"]');
    await page.select('select[name="time"]', data.time);
  }
  if (data.guests !== undefined) {
    await page.waitForSelector('select[name="guests"]', { timeout: 1000 }).catch(() => {});
    await page.select('select[name="guests"]', String(data.guests));
  }
  if (data.notes !== undefined) await fillInput(page, 'textarea[name="notes"]', data.notes);
  
  await clickButton(page, 'button[type="submit"]');
}
