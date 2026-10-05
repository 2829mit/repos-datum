import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  findRepresentativeByEmail, 
  DEFAULT_REPOS_PASSWORD, 
  ReposRepresentative,
  REPOS_REPRESENTATIVES 
} from '../constants/representatives';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth instance
export const auth = getAuth(app);

// Firestore instance targeting specified firestoreDatabaseId with long-polling to prevent proxy/iframe connection timeout
const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, dbId);

// Test connection in background per Firebase skill guidelines without blocking
async function testConnection() {
  try {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000));
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      timeoutPromise
    ]);
  } catch (error) {
    // Gracefully handled; client will operate in offline/cache mode until connection is active
  }
}
testConnection();

export interface AuthLoginResult {
  success: boolean;
  user?: User;
  representative?: ReposRepresentative;
  role?: 'sales' | 'guest';
  message?: string;
}

export interface UnifiedLoginResult {
  success: boolean;
  role?: 'sales' | 'guest';
  name?: string;
  email?: string;
  message?: string;
}

/**
 * Unified login handler: Accepts email OR username (including old credentials)
 * Supports legacy users (salesrepos, prerna, etc.) as well as all 49 Repos representatives
 * Does not expose passwords in errors or UI
 */
export const authenticateUserOrEmail = async (
  identifier: string, 
  password: string
): Promise<UnifiedLoginResult> => {
  const input = (identifier || '').trim().toLowerCase();
  const pwd = (password || '').trim();

  if (!input) {
    return { success: false, message: 'Please enter User ID or Email' };
  }
  if (!pwd) {
    return { success: false, message: 'Please enter Password' };
  }

  // 1. Check legacy user IDs
  const legacyUsers = [
    { username: 'salesrepos', name: 'Sales Repos', email: 'salesrepos@reposenergy.com', validPwd: ['repos@123'] },
    { username: 'prerna', name: 'Prerna Kumari', email: 'prerna@reposenergy.com', validPwd: ['prerna@123', 'repos@123'] },
    { username: 'burhan', name: 'Burhan Cyclewala', email: 'burhan@reposenergy.com', validPwd: ['repos@123'] },
    { username: 'malvika', name: 'Malvika Sharma', email: 'malvika@reposenergy.com', validPwd: ['repos@123'] },
    { username: 'chetan', name: 'Chetan Walunj', email: 'chetan.walunj@reposenergy.com', validPwd: ['repos@123'] },
    { username: 'aditi', name: 'Aditi Walunj', email: 'aditi.walunj@reposenergy.com', validPwd: ['repos@123'] },
  ];

  const matchedLegacy = legacyUsers.find(u => u.username === input);
  if (matchedLegacy) {
    if (matchedLegacy.validPwd.includes(pwd) || matchedLegacy.validPwd.includes(pwd.toLowerCase())) {
      trySignInOrCreate(matchedLegacy.email, DEFAULT_REPOS_PASSWORD).catch(() => {});
      return {
        success: true,
        role: 'sales',
        name: matchedLegacy.name,
        email: matchedLegacy.email
      };
    } else {
      return { success: false, message: 'Invalid credentials' };
    }
  }

  // 2. Check 49 Repos Representatives:
  // - Match email
  // - Match username (part before @)
  // - Match employee full name
  // - Match employee first name
  let matchedRep = (REPOS_REPRESENTATIVES || []).find(r => r.email?.toLowerCase() === input);
  if (!matchedRep) {
    matchedRep = (REPOS_REPRESENTATIVES || []).find(r => r.email?.toLowerCase().split('@')[0] === input);
  }
  if (!matchedRep) {
    matchedRep = (REPOS_REPRESENTATIVES || []).find(r => r.name?.toLowerCase() === input);
  }
  if (!matchedRep) {
    matchedRep = (REPOS_REPRESENTATIVES || []).find(r => r.name?.toLowerCase().split(' ')[0] === input);
  }
  if (!matchedRep && input.length >= 3) {
    matchedRep = (REPOS_REPRESENTATIVES || []).find(r => 
      r.name?.toLowerCase().includes(input) || 
      r.email?.toLowerCase().includes(input)
    );
  }

  if (matchedRep) {
    const isPwdCorrect = pwd === DEFAULT_REPOS_PASSWORD || pwd.toLowerCase() === 'repos@123';
    if (!isPwdCorrect) {
      return { success: false, message: 'Invalid credentials' };
    }

    trySignInOrCreate(matchedRep.email, DEFAULT_REPOS_PASSWORD).catch(() => {});

    return {
      success: true,
      role: 'sales',
      name: matchedRep.name,
      email: matchedRep.email
    };
  }

  // 3. Fallback for any email with standard password
  if (input.includes('@') && (pwd === DEFAULT_REPOS_PASSWORD || pwd.toLowerCase() === 'repos@123')) {
    const fallbackName = input.split('@')[0]
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    trySignInOrCreate(input, DEFAULT_REPOS_PASSWORD).catch(() => {});

    return {
      success: true,
      role: 'sales',
      name: fallbackName || 'Representative',
      email: input
    };
  }

  return { success: false, message: 'Invalid credentials' };
};

async function trySignInOrCreate(email: string, pass: string) {
  try {
    if (!auth || !email) return;
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (err: any) {
    const code = err?.code;
    if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
      try {
        await createUserWithEmailAndPassword(auth, email, pass);
      } catch {
        // Safe ignore
      }
    }
  }
}

/**
 * Log in with Repos employee email and password
 * Automatically registers the user in Firebase Auth if it's their first login
 */
export const loginWithReposEmail = async (email: string, password: string): Promise<AuthLoginResult> => {
  const normalizedEmail = email.trim().toLowerCase();
  const rep = findRepresentativeByEmail(normalizedEmail);

  if (!rep) {
    return {
      success: false,
      message: 'Email not recognized as a registered Repos Representative.'
    };
  }

  // Ensure default password or custom password
  if (password !== DEFAULT_REPOS_PASSWORD && password.length < 6) {
    return {
      success: false,
      message: 'Invalid password. Default password is ' + DEFAULT_REPOS_PASSWORD
    };
  }

  try {
    // Attempt sign in
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    return {
      success: true,
      user: userCredential.user,
      representative: rep,
      role: 'sales'
    };
  } catch (error: any) {
    const errorCode = error?.code;
    // If user does not exist in Firebase Auth yet, auto-create account
    if (
      errorCode === 'auth/user-not-found' || 
      errorCode === 'auth/invalid-credential' ||
      errorCode === 'auth/invalid-login-credentials'
    ) {
      try {
        const newCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        return {
          success: true,
          user: newCredential.user,
          representative: rep,
          role: 'sales'
        };
      } catch (createError: any) {
        // If create fails because email-already-in-use, password might have been wrong
        if (createError?.code === 'auth/email-already-in-use') {
          return {
            success: false,
            message: 'Incorrect password for ' + normalizedEmail + '. Default is ' + DEFAULT_REPOS_PASSWORD
          };
        }
        return {
          success: false,
          message: createError?.message || 'Authentication failed'
        };
      }
    }
    return {
      success: false,
      message: error?.message || 'Login failed'
    };
  }
};

export const logoutRepos = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign out error:', err);
  }
};

export const onReposAuthStateChange = (callback: (user: User | null, representative?: ReposRepresentative) => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (user && user.email) {
      const rep = findRepresentativeByEmail(user.email);
      callback(user, rep);
    } else {
      callback(null);
    }
  });
};
