# Senior Staff Engineer Guide: Production Firebase Authentication & Identity Platform

This guide documents the enterprise architecture, modular SDK conventions, Flutter companion integration, blocking Cloud Functions, and Local Emulator Suite prototyping for Firebase Authentication.

---

## Architecture Overview

```
                      +-----------------------------+
                      |     Client Layer (React)    |
                      |  Firebase Web Modular v10+  |
                      +--------------+--------------+
                                     |
                                     | OAuth 2.0 / Password Auth
                                     v
+-----------------------+     +-------------------------------+     +----------------------+
|  Flutter Companion    |---->| Google Identity Platform      |<--->| Blocking Functions   |
|  (Riverpod + Streams) |     | (Firebase Auth Core)          |     | (beforeUserCreated)  |
+-----------------------+     +---------------+---------------+     +----------------------+
                                              |
                                              | JWT Token (request.auth)
                                              v
                              +-------------------------------+
                              |    Cloud Firestore Security   |
                              |   (ABAC / Zero-Trust Rules)   |
                              +-------------------------------+
```

---

## 1. Web Client Architecture (TypeScript / Modular SDK v10+)

The Web implementation is encapsulated in `firebase.ts` and `authService.ts`.

### Key Design Patterns:
- **Tree-Shaking**: Never use the `firebase/compat` namespace. All imports are functional (`import { getAuth, signInWithPopup } from 'firebase/auth'`).
- **Singleton Initialization**: `getApps().length === 0 ? initializeApp(config) : getApp()` prevents re-initialization crashes during development hot reload.
- **Strict Error Normalization**: The `normalizeAuthError` helper translates cryptic Firebase codes (`auth/invalid-credential`, `auth/user-disabled`) into user-friendly messages while keeping error logging structured.
- **Safe Memory Disposals**: `subscribeToAuthState` returns an `Unsubscribe` function. Always call this inside `useEffect` cleanup return functions or component unmount hooks.

---

## 2. Flutter Mobile Companion Architecture (Riverpod)

The Flutter implementation in `main.dart` is architected for clean reactive state management:

### Core Principles:
- **`StreamProvider<User?>`**: Uses `FirebaseAuth.instance.authStateChanges()` to broadcast authentication transitions.
- **Declarative Navigation**: The `AuthGatekeeper` widget uses `authState.when()` to switch between `HomeScreen` and `AuthScreen` with zero state leakage.
- **Native Google Sign-In**:
  1. Calls `GoogleSignIn().signIn()` to open the system account chooser.
  2. Extracts `GoogleSignInAuthentication` containing `idToken` and `accessToken`.
  3. Creates `GoogleAuthProvider.credential(accessToken, idToken)`.
  4. Signs into Firebase via `FirebaseAuth.instance.signInWithCredential(credential)`.

---

## 3. Google Cloud Identity Platform: Blocking Cloud Functions

Located in `blockingFunctions.ts`, blocking triggers run **synchronously** during account creation and token issuance.

### Why Use Blocking Functions?
1. **Prevent Fraudulent Signups**: Blocks unauthorized signups before a user record is written to the database.
2. **Domain Allowlists**: Enforces institutional or corporate domain checks (`@university.edu`, `@dtu.ac.in`).
3. **Custom Claims Injection**: Safely embeds roles (`role: 'faculty'`, `role: 'student'`) into the JWT token without exposing administration endpoints to client SDKs.

### Deployment:
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only functions
```

---

## 4. Firestore Security Rules Integration

The security rules in `firestore.rules` bridge directly with Firebase Auth:

1. **Default-Deny Catch-All**:
   ```javascript
   match /{document=**} {
     allow read, write: if false;
   }
   ```
2. **Strict Identity Binding**:
   ```javascript
   match /users/{userId} {
     allow get: if isOwner(userId) || isAdmin();
     allow create: if isOwner(userId) && incoming().uid == userId;
   }
   ```
3. **Email Verification Enforcement**:
   ```javascript
   function isEmailVerified() {
     return request.auth != null && request.auth.token.email_verified == true;
   }
   ```
4. **Token Claim Validation**:
   Inspects `request.auth.token.role` populated by Identity Platform blocking functions.

---

## 5. Local Prototyping: Firebase Local Emulator Suite

Using the local emulator suite allows end-to-end authentication and database testing without internet access, API billing, or polluting production databases.

### Installation & Initialization:
```bash
# 1. Install Firebase CLI globally
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Start Emulators with the provided config
firebase emulators:start --config src/guides/auth/emulatorConfig.json
```

### Emulator Endpoints:
| Service | Local URL / Port | Purpose |
|---|---|---|
| **Emulator UI** | `http://localhost:4000` | Web UI to create mock users, audit tokens, and inspect Firestore |
| **Auth Emulator** | `http://localhost:9099` | Local authentication endpoint |
| **Firestore** | `localhost:8080` | In-memory local Firestore instance |
| **Cloud Functions** | `localhost:5001` | Executes blocking functions locally |

### Client Connection Code:
In your `.env.local` or environment file:
```env
VITE_USE_FIREBASE_EMULATOR=true
VITE_AUTH_EMULATOR_HOST=http://localhost:9099
VITE_FIRESTORE_EMULATOR_HOST=localhost
VITE_FIRESTORE_EMULATOR_PORT=8080
```

---

## 6. Senior Staff Security Checklist

- [x] **No Client-Side Role Elevation**: Roles and admin statuses are never written directly by clients in `createUserWithEmailAndPassword`; always inject them via server-side blocking functions or Firestore admin documents.
- [x] **Strict Verification**: Require `request.auth.token.email_verified == true` for any write or elevated operation.
- [x] **Immutable Fields**: Protect `createdAt`, `uid`, and `email` during updates using `incoming().field == existing().field`.
- [x] **Rate Limiting & Brute Force Protection**: Rely on Identity Platform's built-in account protection and email enumeration protection.
