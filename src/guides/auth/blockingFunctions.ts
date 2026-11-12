/**
 * Google Cloud Identity Platform & Firebase Auth Blocking Cloud Functions (2nd Gen)
 * 
 * Blocking functions execute synchronously during the authentication lifecycle:
 * - beforeUserCreated: Fires before a user record is saved to Identity Platform.
 *   Use to enforce domain allowlists, validate custom compliance rules, or inject initial claims.
 * - beforeUserSignedIn: Fires before a token is minted and returned to the client.
 *   Use to audit session context, restrict unverified logins, or update dynamic claims.
 * 
 * Deployment Instructions:
 *   Copy this file into your Firebase Functions codebase (e.g. `functions/src/index.ts`)
 *   and deploy via: `firebase deploy --only functions`
 */

// -----------------------------------------------------------------------------
// Type Definitions (Compatible with firebase-functions/v2/identity)
// -----------------------------------------------------------------------------

export interface AuthUserRecord {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  disabled?: boolean;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export interface AuthBlockingEvent {
  data: AuthUserRecord;
  credential?: {
    providerId: string;
    password?: string;
    signInMethod?: string;
  };
  ipAddress?: string;
  userAgent?: string;
}

export interface BlockingResponse {
  customClaims?: Record<string, unknown>;
  displayName?: string;
  emailVerified?: boolean;
  disabled?: boolean;
}

export interface BlockingOptions {
  region?: string;
  timeoutSeconds?: number;
  memory?: '128MiB' | '256MiB' | '512MiB' | '1GiB';
  maxInstances?: number;
}

export class HttpsError extends Error {
  constructor(
    public readonly code:
      | 'invalid-argument'
      | 'permission-denied'
      | 'unauthenticated'
      | 'already-exists'
      | 'internal',
    message: string
  ) {
    super(message);
    this.name = 'HttpsError';
  }
}

/**
 * Signature wrapper replicating firebase-functions/v2/identity's beforeUserCreated
 */
export function beforeUserCreated(
  options: BlockingOptions,
  handler: (event: AuthBlockingEvent) => Promise<BlockingResponse | void>
): (event: AuthBlockingEvent) => Promise<BlockingResponse | void> {
  // In production deployed to Cloud Functions, this is imported from 'firebase-functions/v2/identity'
  return handler;
}

/**
 * Signature wrapper replicating firebase-functions/v2/identity's beforeUserSignedIn
 */
export function beforeUserSignedIn(
  options: BlockingOptions,
  handler: (event: AuthBlockingEvent) => Promise<BlockingResponse | void>
): (event: AuthBlockingEvent) => Promise<BlockingResponse | void> {
  // In production deployed to Cloud Functions, this is imported from 'firebase-functions/v2/identity'
  return handler;
}

// -----------------------------------------------------------------------------
// Production Blocking Handlers
// -----------------------------------------------------------------------------

// Allowed institutional and corporate email domains
const ALLOWED_EMAIL_DOMAINS: readonly string[] = [
  'dtu.ac.in',
  'iitd.ac.in',
  'trust.edu',
  'techieteachers.org'
];

/**
 * Blocking Function: beforeUserCreated
 * 
 * Enforces email domain restrictions and attaches verified initial custom claims.
 * If this function throws an HttpsError, the user is NOT created in Firebase.
 */
export const enforceDomainAndAssignClaims = beforeUserCreated(
  {
    region: 'asia-southeast1'
  },
  async (event: AuthBlockingEvent): Promise<BlockingResponse> => {
    const user = event.data;
    const email = user.email?.trim().toLowerCase();

    // 1. Mandatory Email Presence Guard
    if (!email) {
      throw new HttpsError(
        'invalid-argument',
        'Registration rejected: A verified email address is required to create an account.'
      );
    }

    // 2. Academic / Corporate Domain Restriction
    const domain = email.split('@')[1] || '';
    const isDomainAllowed = ALLOWED_EMAIL_DOMAINS.includes(domain);

    if (!isDomainAllowed) {
      throw new HttpsError(
        'permission-denied',
        `Registration restricted: Only institutional email addresses from authorized domains (${ALLOWED_EMAIL_DOMAINS.join(', ')}) are permitted.`
      );
    }

    // 3. Password Complexity Verification (for password-based providers)
    if (event.credential?.providerId === 'password') {
      const password = event.credential.password;
      if (password && password.length < 8) {
        throw new HttpsError(
          'invalid-argument',
          'Password security policy: Passwords must contain a minimum of 8 characters.'
        );
      }
    }

    // 4. Return Custom Claims & User Attribute Mutations
    // These claims are embedded directly into the minted Firebase JWT token.
    return {
      customClaims: {
        role: domain === 'trust.edu' ? 'faculty' : 'student',
        registeredVia: 'IdentityPlatformBlockV2',
        institutionDomain: domain
      },
      displayName: user.displayName || email.split('@')[0],
      emailVerified: user.emailVerified || event.credential?.providerId === 'google.com'
    };
  }
);

/**
 * Blocking Function: beforeUserSignedIn
 * 
 * Audits every sign-in attempt before granting access tokens.
 * Can enforce IP geofencing, multi-factor status, or refresh dynamic user entitlements.
 */
export const auditSessionOnSignIn = beforeUserSignedIn(
  {
    region: 'asia-southeast1'
  },
  async (event: AuthBlockingEvent): Promise<BlockingResponse> => {
    const user = event.data;

    // 1. Enforce Email Verification prior to application access
    // (Exempting OAuth providers like Google that natively guarantee verification)
    const isGoogleAuth = event.credential?.providerId === 'google.com';
    if (!user.emailVerified && !isGoogleAuth) {
      throw new HttpsError(
        'unauthenticated',
        'Email verification required: Please verify your email via the confirmation link sent to your inbox before signing in.'
      );
    }

    // 2. Audit metadata and update dynamic claims on sign-in
    return {
      customClaims: {
        lastLoginTimestamp: Date.now(),
        ipAddress: event.ipAddress || 'unknown'
      }
    };
  }
);
