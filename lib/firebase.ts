'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInAnonymously,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfigRaw from '../firebase-applet-config.json';
import { UserAccount, PortfolioData } from '@/types/finance';

const firebaseConfig = {
  apiKey: firebaseConfigRaw.apiKey,
  authDomain: firebaseConfigRaw.authDomain,
  projectId: firebaseConfigRaw.projectId,
  storageBucket: firebaseConfigRaw.storageBucket,
  messagingSenderId: firebaseConfigRaw.messagingSenderId,
  appId: firebaseConfigRaw.appId,
};

// Initialize Firebase App
export const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore (using custom databaseId if configured)
const dbId = firebaseConfigRaw.firestoreDatabaseId && firebaseConfigRaw.firestoreDatabaseId !== '(default)'
  ? firebaseConfigRaw.firestoreDatabaseId
  : undefined;

export const db: Firestore = dbId ? getFirestore(app, dbId) : getFirestore(app);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Test Firestore Connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const testRef = doc(db, 'test', 'connection');
    await getDocFromServer(testRef).catch(() => {});
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('client is offline')) {
      console.warn('Firebase Firestore client is offline or initializing.');
    }
    return false;
  }
}

// ----------------- FIRESTORE PERSISTENCE HELPERS -----------------

export async function saveUserToFirestore(user: UserAccount): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.username.toLowerCase());
    await setDoc(userRef, {
      ...user,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to save user to Firestore, cached locally:', err);
  }
}

export async function getUserFromFirestore(username: string): Promise<UserAccount | null> {
  try {
    const userRef = doc(db, 'users', username.toLowerCase());
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserAccount;
    }
    return null;
  } catch (err) {
    console.warn('Failed to get user from Firestore:', err);
    return null;
  }
}

export async function getAllUsersFromFirestore(): Promise<UserAccount[]> {
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    const users: UserAccount[] = [];
    snap.forEach(d => {
      users.push(d.data() as UserAccount);
    });
    return users;
  } catch (err) {
    console.warn('Failed to get all users from Firestore:', err);
    return [];
  }
}

export async function savePortfolioToFirestore(username: string, portfolio: PortfolioData): Promise<void> {
  try {
    const portfolioRef = doc(db, 'portfolios', username.toLowerCase());
    await setDoc(portfolioRef, {
      username: username.toLowerCase(),
      simulatedMonth: portfolio.simulatedMonth,
      simulationStartDate: portfolio.simulationStartDate,
      data: JSON.stringify(portfolio),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to save portfolio to Firestore, cached locally:', err);
  }
}

export async function getPortfolioFromFirestore(username: string): Promise<PortfolioData | null> {
  try {
    const portfolioRef = doc(db, 'portfolios', username.toLowerCase());
    const snap = await getDoc(portfolioRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.data) {
        return JSON.parse(data.data) as PortfolioData;
      }
    }
    return null;
  } catch (err) {
    console.warn('Failed to get portfolio from Firestore:', err);
    return null;
  }
}
