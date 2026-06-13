// Firestore rules simulation script for empirical verification of rules logic.
// This script simulates the Firestore Security Rules evaluator and test cases.

class RuleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RuleError';
  }
}

// Helper to simulate Firestore map and field access
function getField(map, key) {
  if (map === null || map === undefined) {
    throw new RuleError(`Accessing field "${key}" on null/undefined map`);
  }
  if (!(key in map)) {
    throw new RuleError(`Field "${key}" does not exist in map`);
  }
  return map[key];
}

// Simulated diff object
class MapDiff {
  constructor(before, after) {
    this.before = before || {};
    this.after = after || {};
  }

  affectedKeys() {
    const keys = new Set();
    // Keys in after but not in before (added)
    for (const k of Object.keys(this.after)) {
      if (!(k in this.before)) {
        keys.add(k);
      } else if (JSON.stringify(this.before[k]) !== JSON.stringify(this.after[k])) {
        // modified
        keys.add(k);
      }
    }
    // Keys in before but not in after (removed)
    for (const k of Object.keys(this.before)) {
      if (!(k in this.after)) {
        keys.add(k);
      }
    }
    return {
      hasOnly: (allowedList) => {
        const allowedSet = new Set(allowedList);
        for (const k of keys) {
          if (!allowedSet.has(k)) {
            return false;
          }
        }
        return true;
      },
      keys: () => Array.from(keys)
    };
  }
}

// Simulate get() and exists() functions
class MockDb {
  constructor(documents) {
    this.documents = documents || {};
  }

  exists(path) {
    return path in this.documents;
  }

  get(path) {
    if (!this.exists(path)) {
      throw new RuleError(`Document does not exist at path: ${path}`);
    }
    return {
      data: this.documents[path]
    };
  }
}

// Rules Context
class RulesContext {
  constructor(auth, dbState) {
    this.request = {
      auth: auth,
      resource: null // set per request
    };
    this.db = new MockDb(dbState);
  }

  exists(path) {
    return this.db.exists(path);
  }

  get(path) {
    return this.db.get(path);
  }

  // Helper to safely access request.auth.token.email
  getAuthEmail() {
    if (this.request.auth === null || this.request.auth === undefined) {
      throw new RuleError("Accessing auth.token.email when auth is null");
    }
    const token = getField(this.request.auth, 'token');
    return getField(token, 'email');
  }

  isSuperAdmin() {
    try {
      if (this.request.auth === null) return false;
      const email = this.getAuthEmail();
      return email === "minhazuddin7827@gmail.com";
    } catch (e) {
      if (e instanceof RuleError) {
        return false; // Safely return false or throw? In rules, if any sub-expr fails it aborts.
      }
      throw e;
    }
  }

  isAuthorized() {
    // isSuperAdmin() || (request.auth != null && exists(...) && (...))
    if (this.isSuperAdmin()) {
      return true;
    }

    if (this.request.auth === null) {
      return false;
    }

    const path = '/databases/$(database)/documents/settings/adminConfig';
    if (!this.exists(path)) {
      return false;
    }

    const adminConfigDoc = this.get(path);
    const data = adminConfigDoc.data;

    // Evaluate: request.auth.token.email in get(...).data.allowedEmails ||
    //           ('ownerEmail' in get(...).data && request.auth.token.email == get(...).data.ownerEmail)
    //
    // WARNING: In Firestore, if allowedEmails is not in data, data.allowedEmails throws a runtime error.
    // Let's simulate this exactly.
    const email = this.getAuthEmail();

    // First operand of ||
    let lhs;
    try {
      const allowedEmails = getField(data, 'allowedEmails');
      if (!Array.isArray(allowedEmails)) {
        throw new RuleError("allowedEmails is not a list");
      }
      lhs = allowedEmails.includes(email);
    } catch (e) {
      // Any RuleError in field access or evaluation throws and bubbles up, failing the whole isAuthorized()
      throw e;
    }

    if (lhs) {
      return true;
    }

    // Second operand of ||
    const hasOwnerEmail = 'ownerEmail' in data;
    if (hasOwnerEmail) {
      const ownerEmail = getField(data, 'ownerEmail');
      return email === ownerEmail;
    }

    return false;
  }

  allowUpdate(resourceData, requestResourceData) {
    this.request.resource = { data: requestResourceData };
    const resource = { data: resourceData };

    // isAuthorized()
    let authorized = false;
    try {
      authorized = this.isAuthorized();
    } catch (e) {
      // runtime error in isAuthorized makes it fail immediately
      console.log(`      [Runtime Error in isAuthorized]: ${e.message}`);
      authorized = false;
    }

    if (authorized) {
      return true;
    }

    // Branch 2:
    // request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']) &&
    // request.resource.data.status == 'cancelled'
    let branch2 = false;
    try {
      const diff = new MapDiff(resource.data, requestResourceData);
      const affectedStatus = diff.affectedKeys().hasOnly(['status']);
      // Accessing request.resource.data.status
      const statusVal = getField(requestResourceData, 'status');
      branch2 = affectedStatus && (statusVal === 'cancelled');
    } catch (e) {
      // runtime error makes this branch fail
      branch2 = false;
    }

    if (branch2) {
      return true;
    }

    // Branch 3:
    // request.resource.data.diff(resource.data).affectedKeys().hasOnly(['linkedOrderId']) &&
    // !('linkedOrderId' in resource.data)
    let branch3 = false;
    try {
      const diff = new MapDiff(resource.data, requestResourceData);
      const affectedLinkedOrder = diff.affectedKeys().hasOnly(['linkedOrderId']);
      const notInResource = !('linkedOrderId' in resource.data);
      branch3 = affectedLinkedOrder && notInResource;
    } catch (e) {
      branch3 = false;
    }

    return branch3;
  }
}

// --- Run Simulation Tests ---
console.log("=== FIRESTORE RULES SIMULATION TESTS ===");

const dbWithFullConfig = {
  '/databases/$(database)/documents/settings/adminConfig': {
    allowedEmails: ['admin@restaurant.com'],
    ownerEmail: 'owner@restaurant.com'
  }
};

const dbWithMissingAllowedEmails = {
  '/databases/$(database)/documents/settings/adminConfig': {
    ownerEmail: 'owner@restaurant.com'
  }
};

function runTest(name, auth, dbState, resourceData, requestResourceData, expectedResult) {
  const ctx = new RulesContext(auth, dbState);
  let result = false;
  try {
    result = ctx.allowUpdate(resourceData, requestResourceData);
  } catch (e) {
    result = false;
  }
  const statusStr = result === expectedResult ? "PASS" : "FAIL";
  console.log(`[${statusStr}] ${name}`);
  console.log(`      Result: ${result} (Expected: ${expectedResult})`);
}

// 1. Public user updates status to 'cancelled'
runTest(
  "Public user cancels reservation",
  null, // public user (no auth)
  dbWithFullConfig,
  { name: "John", status: "pending" },
  { name: "John", status: "cancelled" },
  true
);

// 2. Public user updates status to 'confirmed'
runTest(
  "Public user tries to confirm reservation",
  null,
  dbWithFullConfig,
  { name: "John", status: "pending" },
  { name: "John", status: "confirmed" },
  false
);

// 3. Public user updates status to 'cancelled' AND modifies another field (guestCount)
runTest(
  "Public user cancels and modifies guestCount",
  null,
  dbWithFullConfig,
  { name: "John", status: "pending", guestCount: 4 },
  { name: "John", status: "cancelled", guestCount: 99 },
  false
);

// 4. Public user sets linkedOrderId when it's not set
runTest(
  "Public user sets linkedOrderId (not set initially)",
  null,
  dbWithFullConfig,
  { name: "John", status: "pending" },
  { name: "John", status: "pending", linkedOrderId: "order_123" },
  true
);

// 5. Public user updates linkedOrderId when it's already set
runTest(
  "Public user updates linkedOrderId (already set)",
  null,
  dbWithFullConfig,
  { name: "John", status: "pending", linkedOrderId: "order_123" },
  { name: "John", status: "pending", linkedOrderId: "order_456" },
  false
);

// 6. Public user sets linkedOrderId AND modifies another field (guestCount)
runTest(
  "Public user sets linkedOrderId and modifies guestCount",
  null,
  dbWithFullConfig,
  { name: "John", status: "pending" },
  { name: "John", status: "pending", linkedOrderId: "order_123", guestCount: 5 },
  false
);

// 7. Owner bypass works when allowedEmails is present
runTest(
  "Owner accesses with complete config",
  { token: { email: 'owner@restaurant.com' } },
  dbWithFullConfig,
  { name: "John", status: "pending" },
  { name: "John", status: "confirmed" }, // owner should be able to make any changes
  true
);

// 8. Owner bypass fails when allowedEmails is missing (Vulnerability check)
runTest(
  "Owner accesses when allowedEmails is missing from config (vulnerability/runtime failure)",
  { token: { email: 'owner@restaurant.com' } },
  dbWithMissingAllowedEmails,
  { name: "John", status: "pending" },
  { name: "John", status: "confirmed" }, // Should fail because rules evaluation crashed
  false
);

// 9. Super Admin bypass works under complete config
runTest(
  "Super Admin accesses with complete config",
  { token: { email: 'minhazuddin7827@gmail.com' } },
  dbWithFullConfig,
  { name: "John", status: "pending" },
  { name: "John", status: "confirmed" },
  true
);

// 10. Super Admin bypass works even when allowedEmails is missing
runTest(
  "Super Admin accesses when allowedEmails is missing",
  { token: { email: 'minhazuddin7827@gmail.com' } },
  dbWithMissingAllowedEmails,
  { name: "John", status: "pending" },
  { name: "John", status: "confirmed" },
  true
);
