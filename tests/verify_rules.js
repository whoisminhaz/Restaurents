// Verification script for new Firestore security rules.
// Runs the simulator logic matching the actual firestore.rules.

class RuleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RuleError';
  }
}

// Simulates Firestore map/list behavior
function hasKey(map, key) {
  if (map === null || map === undefined) return false;
  return key in map;
}

function inListOrMap(val, listOrMap) {
  if (Array.isArray(listOrMap)) {
    return listOrMap.includes(val);
  }
  if (listOrMap && typeof listOrMap === 'object') {
    return val in listOrMap;
  }
  return false;
}

// Actual rules implementation translated to JS
class RulesEvaluator {
  constructor(auth, dbState) {
    this.auth = auth;
    this.dbState = dbState;
  }

  isSuperAdmin() {
    return this.auth != null && 
           this.auth.token != null && 
           this.auth.token.email === "minhazuddin7827@gmail.com";
  }

  isAuthorized() {
    if (this.isSuperAdmin()) {
      return true;
    }

    if (this.auth === null || this.auth === undefined) {
      return false;
    }

    const path = '/databases/$(database)/documents/settings/adminConfig';
    const doc = this.dbState[path];
    if (!doc) {
      return false; // exists() is false
    }

    const data = doc;
    const email = this.auth.token.email;

    // ('allowedEmails' in get(...).data && request.auth.token.email in get(...).data.allowedEmails)
    const term1 = hasKey(data, 'allowedEmails') && inListOrMap(email, data.allowedEmails);

    // ('ownerEmail' in get(...).data && request.auth.token.email == get(...).data.ownerEmail)
    const term2 = hasKey(data, 'ownerEmail') && email === data.ownerEmail;

    return term1 || term2;
  }

  allowUpdate(resourceData, requestResourceData) {
    // isAuthorized() || branch2 || branch3
    let authorized = false;
    try {
      authorized = this.isAuthorized();
    } catch (e) {
      console.log(`      [Crash]: ${e.message}`);
      authorized = false;
    }

    if (authorized) return true;

    // branch 2: public cancellation
    // request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']) &&
    // request.resource.data.status == 'cancelled'
    let branch2 = false;
    const affectedKeys = [];
    for (const key of Object.keys({ ...resourceData, ...requestResourceData })) {
      if (resourceData[key] !== requestResourceData[key]) {
        affectedKeys.push(key);
      }
    }
    const hasOnlyStatus = affectedKeys.length === 1 && affectedKeys[0] === 'status';
    branch2 = hasOnlyStatus && requestResourceData.status === 'cancelled';

    if (branch2) return true;

    // branch 3: public linkOrderId
    // request.resource.data.diff(resource.data).affectedKeys().hasOnly(['linkedOrderId']) &&
    // !('linkedOrderId' in resource.data)
    const hasOnlyLinkedOrderId = affectedKeys.length === 1 && affectedKeys[0] === 'linkedOrderId';
    const notInResource = !('linkedOrderId' in resourceData);
    const branch3 = hasOnlyLinkedOrderId && notInResource;

    return branch3;
  }
}

// Define test cases
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

const tests = [
  {
    name: "Scenario 9: Owner accesses when allowedEmails is missing (Should SUCCEED)",
    auth: { token: { email: 'owner@restaurant.com' } },
    dbState: dbWithMissingAllowedEmails,
    resourceData: { name: "John", status: "pending" },
    requestResourceData: { name: "John", status: "confirmed" },
    expected: true
  },
  {
    name: "Scenario 10: Super Admin accesses when allowedEmails is missing (Should SUCCEED)",
    auth: { token: { email: 'minhazuddin7827@gmail.com' } },
    dbState: dbWithMissingAllowedEmails,
    resourceData: { name: "John", status: "pending" },
    requestResourceData: { name: "John", status: "confirmed" },
    expected: true
  },
  {
    name: "Scenario 10: Super Admin accesses under complete config (Should SUCCEED)",
    auth: { token: { email: 'minhazuddin7827@gmail.com' } },
    dbState: dbWithFullConfig,
    resourceData: { name: "John", status: "pending" },
    requestResourceData: { name: "John", status: "confirmed" },
    expected: true
  },
  {
    name: "Unauthenticated cancellations (Should SUCCEED)",
    auth: null,
    dbState: dbWithFullConfig,
    resourceData: { name: "John", status: "pending" },
    requestResourceData: { name: "John", status: "cancelled" },
    expected: true
  },
  {
    name: "Unauthenticated other update (Should FAIL)",
    auth: null,
    dbState: dbWithFullConfig,
    resourceData: { name: "John", status: "pending" },
    requestResourceData: { name: "John", status: "confirmed" },
    expected: false
  },
  {
    name: "Unauthenticated order linking - allowed (Should SUCCEED)",
    auth: null,
    dbState: dbWithFullConfig,
    resourceData: { name: "John", status: "pending" },
    requestResourceData: { name: "John", status: "pending", linkedOrderId: "order_123" },
    expected: true
  },
  {
    name: "Unauthenticated order linking - modify other field (Should FAIL)",
    auth: null,
    dbState: dbWithFullConfig,
    resourceData: { name: "John", status: "pending" },
    requestResourceData: { name: "John", status: "cancelled", linkedOrderId: "order_123" },
    expected: false
  },
  {
    name: "Unauthenticated order linking - override existing linkedOrderId (Should FAIL)",
    auth: null,
    dbState: dbWithFullConfig,
    resourceData: { name: "John", status: "pending", linkedOrderId: "order_123" },
    requestResourceData: { name: "John", status: "pending", linkedOrderId: "order_456" },
    expected: false
  }
];

let allPassed = true;
console.log("=== EMPIRICAL VERIFICATION OF NEW FIRESTORE RULES ===");
for (const tc of tests) {
  const evaler = new RulesEvaluator(tc.auth, tc.dbState);
  const res = evaler.allowUpdate(tc.resourceData, tc.requestResourceData);
  const passed = res === tc.expected;
  if (!passed) allPassed = false;
  console.log(`[${passed ? "PASS" : "FAIL"}] ${tc.name}`);
  console.log(`      Result: ${res} | Expected: ${tc.expected}`);
}

if (allPassed) {
  console.log("\nALL TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
} else {
  console.log("\nSOME TESTS FAILED!");
  process.exit(1);
}
