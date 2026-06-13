// In-memory mock of Firebase SDK for E2E testing
let timestampCounter = 0;
const resolveServerTimestamp = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const newObj = Array.isArray(obj) ? [] : {};
  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === 'object' && val._isServerTimestamp) {
      const date = new Date();
      // Add a tiny increment to keep timestamps unique
      date.setMilliseconds(date.getMilliseconds() + (timestampCounter++ % 1000));
      newObj[key] = {
        toDate: () => date,
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: (date.getTime() % 1000) * 1000000
      };
    } else if (val && typeof val === 'object') {
      newObj[key] = resolveServerTimestamp(val);
    } else {
      newObj[key] = val;
    }
  }
  return newObj;
};

// Listeners for onSnapshot
const listeners = [];

function triggerListeners(collPath) {
  for (const listener of listeners) {
    let matches = false;
    if (listener.ref.type === 'collection' && listener.ref.path === collPath) {
      matches = true;
    } else if (listener.ref.type === 'query' && listener.ref.collectionRef.path === collPath) {
      matches = true;
    }
    if (matches) {
      triggerListener(listener);
    }
  }
}

async function triggerListener(listener) {
  try {
    const snapshot = await getDocs(listener.ref);
    listener.callback(snapshot);
  } catch (err) {
    console.error('Error in onSnapshot listener:', err);
  }
}

// Auth listeners
const authListeners = [];

export function triggerAuthChange(user) {
  if (typeof window !== 'undefined') {
    if (!window.mockAuth) window.mockAuth = {};
    window.mockAuth.currentUser = user;
  }
  for (const listener of authListeners) {
    listener(user);
  }
}

// ----------------------------------------------------
// SDK Exports
// ----------------------------------------------------

// App
export function initializeApp() {
  return {};
}

// App Check
export function initializeAppCheck() {
  return {};
}
export class ReCaptchaEnterpriseProvider {
  constructor(siteKey) {}
}

// Auth
export const auth = { type: 'auth' };
export function getAuth() {
  return auth;
}
export function onAuthStateChanged(authRef, callback) {
  authListeners.push(callback);
  const user = (typeof window !== 'undefined' && window.mockAuth) ? window.mockAuth.currentUser : null;
  callback(user);
  return () => {
    const idx = authListeners.indexOf(callback);
    if (idx !== -1) authListeners.splice(idx, 1);
  };
}
export async function signInWithEmailAndPassword(authRef, email, password) {
  const user = { uid: 'mock-uid', email };
  triggerAuthChange(user);
  return { user };
}
export async function signInWithPopup(authRef, provider) {
  let email = 'admin@cafebella.com';
  if (typeof window !== 'undefined' && window.mockAuth && window.mockAuth.nextPopupUser) {
    email = window.mockAuth.nextPopupUser;
  }
  const user = { uid: 'mock-google-uid', email };
  triggerAuthChange(user);
  return { user };
}
export class GoogleAuthProvider {}
export async function signOut(authRef) {
  triggerAuthChange(null);
  return Promise.resolve();
}
export async function setPersistence(authRef, persistence) {
  return Promise.resolve();
}
export const browserLocalPersistence = 'local';

// Firestore
export const db = { type: 'db' };
export function getFirestore() {
  return db;
}
export function initializeFirestore(app, settings, databaseId) {
  return db;
}

export function collection(dbOrDoc, ...pathSegments) {
  let path = '';
  if (dbOrDoc && dbOrDoc.type === 'doc') {
    path = dbOrDoc.path + '/' + pathSegments.join('/');
  } else {
    path = pathSegments.join('/');
  }
  return { type: 'collection', path };
}

export function doc(dbOrCollection, ...pathSegments) {
  let path = '';
  if (dbOrCollection && dbOrCollection.type === 'collection') {
    path = dbOrCollection.path + '/' + pathSegments.join('/');
  } else {
    path = pathSegments.join('/');
  }
  return { type: 'doc', path };
}

export async function getDoc(docRef) {
  const parts = docRef.path.split('/');
  const coll = parts[0];
  const id = parts[1];
  
  const dbData = (typeof window !== 'undefined' && window.mockDb) ? window.mockDb : {};
  const collData = dbData[coll] || {};
  const data = collData[id];
  
  return {
    exists: () => data !== undefined,
    data: () => (data ? JSON.parse(JSON.stringify(data)) : undefined),
    id
  };
}

export async function setDoc(docRef, data, options = {}) {
  const parts = docRef.path.split('/');
  const coll = parts[0];
  const id = parts[1];
  
  if (typeof window !== 'undefined') {
    if (!window.mockDb) window.mockDb = {};
    if (!window.mockDb[coll]) window.mockDb[coll] = {};
    const resolvedData = resolveServerTimestamp(data);
    if (options.merge && window.mockDb[coll][id]) {
      window.mockDb[coll][id] = { ...window.mockDb[coll][id], ...resolvedData };
    } else {
      window.mockDb[coll][id] = resolvedData;
    }
  }
  triggerListeners(coll);
  return Promise.resolve();
}

export async function updateDoc(docRef, data) {
  const parts = docRef.path.split('/');
  const coll = parts[0];
  const id = parts[1];
  
  if (typeof window !== 'undefined') {
    if (!window.mockDb || !window.mockDb[coll] || window.mockDb[coll][id] === undefined) {
      throw new Error(`Document ${docRef.path} does not exist for updateDoc`);
    }
    const resolvedData = resolveServerTimestamp(data);
    window.mockDb[coll][id] = { ...window.mockDb[coll][id], ...resolvedData };
  }
  triggerListeners(coll);
  return Promise.resolve();
}

export async function deleteDoc(docRef) {
  const parts = docRef.path.split('/');
  const coll = parts[0];
  const id = parts[1];
  
  if (typeof window !== 'undefined' && window.mockDb && window.mockDb[coll]) {
    delete window.mockDb[coll][id];
  }
  triggerListeners(coll);
  return Promise.resolve();
}

export async function addDoc(collectionRef, data) {
  const coll = collectionRef.path;
  const id = 'doc_' + Math.random().toString(36).substr(2, 9);
  
  if (typeof window !== 'undefined') {
    if (!window.mockDb) window.mockDb = {};
    if (!window.mockDb[coll]) window.mockDb[coll] = {};
    const resolvedData = resolveServerTimestamp(data);
    window.mockDb[coll][id] = resolvedData;
  }
  triggerListeners(coll);
  return { id };
}

export function query(collectionRef, ...queryConstraints) {
  return {
    type: 'query',
    collectionRef,
    constraints: queryConstraints
  };
}

export function where(field, operator, value) {
  return { type: 'where', field, operator, value };
}

export function orderBy(field, direction = 'asc') {
  return { type: 'orderBy', field, direction };
}

export function limit(num) {
  return { type: 'limit', limit: num };
}

export async function getDocs(queryOrCollectionRef) {
  let collPath = '';
  let constraints = [];
  
  if (queryOrCollectionRef.type === 'query') {
    collPath = queryOrCollectionRef.collectionRef.path;
    constraints = queryOrCollectionRef.constraints || [];
  } else if (queryOrCollectionRef.type === 'collection') {
    collPath = queryOrCollectionRef.path;
  } else {
    throw new Error('Invalid collection/query reference passed to getDocs');
  }
  
  const dbData = (typeof window !== 'undefined' && window.mockDb) ? window.mockDb : {};
  const collData = dbData[collPath] || {};
  
  let docs = Object.keys(collData).map(id => ({
    id,
    data: collData[id]
  }));
  
  // Apply constraints
  for (const c of constraints) {
    if (c.type === 'where') {
      const { field, operator, value } = c;
      docs = docs.filter(doc => {
        const docVal = doc.data[field];
        if (operator === '==') return docVal === value;
        if (operator === '!=') return docVal !== value;
        if (operator === '>') return docVal > value;
        if (operator === '>=') return docVal >= value;
        if (operator === '<') return docVal < value;
        if (operator === '<=') return docVal <= value;
        if (operator === 'array-contains') {
          return Array.isArray(docVal) && docVal.includes(value);
        }
        return true;
      });
    }
  }
  
  // Apply orderBy
  const orderConstraint = constraints.find(c => c.type === 'orderBy');
  if (orderConstraint) {
    const { field, direction } = orderConstraint;
    docs.sort((a, b) => {
      let valA = a.data[field];
      let valB = b.data[field];
      
      if (valA && typeof valA.toDate === 'function') valA = valA.toDate().getTime();
      if (valB && typeof valB.toDate === 'function') valB = valB.toDate().getTime();
      
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  // Apply limit
  const limitConstraint = constraints.find(c => c.type === 'limit');
  if (limitConstraint) {
    docs = docs.slice(0, limitConstraint.limit);
  }
  
  return {
    docs: docs.map(doc => ({
      id: doc.id,
      data: () => JSON.parse(JSON.stringify(doc.data)),
      exists: () => true
    })),
    empty: docs.length === 0,
    size: docs.length
  };
}

export function onSnapshot(queryOrCollectionRef, next) {
  const listener = {
    ref: queryOrCollectionRef,
    callback: next
  };
  listeners.push(listener);
  
  // Trigger immediately
  triggerListener(listener);
  
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export async function runTransaction(dbRef, updateFunction) {
  const transaction = {
    get: async (docRef) => {
      return getDoc(docRef);
    },
    set: (docRef, data) => {
      const parts = docRef.path.split('/');
      const coll = parts[0];
      const id = parts[1];
      if (typeof window !== 'undefined') {
        if (!window.mockDb) window.mockDb = {};
        if (!window.mockDb[coll]) window.mockDb[coll] = {};
        window.mockDb[coll][id] = resolveServerTimestamp(data);
      }
      triggerListeners(coll);
    },
    update: (docRef, data) => {
      const parts = docRef.path.split('/');
      const coll = parts[0];
      const id = parts[1];
      if (typeof window !== 'undefined') {
        if (!window.mockDb) window.mockDb = {};
        if (!window.mockDb[coll]) window.mockDb[coll] = {};
        window.mockDb[coll][id] = { ...window.mockDb[coll][id], ...resolveServerTimestamp(data) };
      }
      triggerListeners(coll);
    }
  };
  return updateFunction(transaction);
}

export const serverTimestamp = () => ({ _isServerTimestamp: true });

export class Timestamp {
  constructor(seconds, nanoseconds) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }
  static now() {
    const d = new Date();
    return new Timestamp(Math.floor(d.getTime() / 1000), (d.getTime() % 1000) * 1000000);
  }
  static fromDate(date) {
    return new Timestamp(Math.floor(date.getTime() / 1000), (date.getTime() % 1000) * 1000000);
  }
  toDate() {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1000000);
  }
}

// Storage
export const storage = { type: 'storage' };
export function getStorage() {
  return storage;
}

// Initialize in-memory mock storage on window
if (typeof window !== 'undefined') {
  window.mockDb = window.mockDb || {
    settings: {
      master: { bookingEnabled: true, tables: 5 },
      adminConfig: { ownerEmail: 'admin@cafebella.com' }
    },
    reservations: {},
    orders: {},
    menu: {}
  };
  window.mockAuth = window.mockAuth || {
    currentUser: null
  };
  window.triggerAuthChange = triggerAuthChange;
  window.triggerListeners = triggerListeners;
}
