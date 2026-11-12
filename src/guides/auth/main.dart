// Production Flutter Companion App Architecture
// Stack: Flutter 3+, flutter_riverpod (v2+), firebase_auth, google_sign_in
// 
// Save as: lib/main.dart or modularize into features/auth/

import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';

// ---------------------------------------------------------------------------
// 1. Dependency Providers & Reactive Auth Pipeline
// ---------------------------------------------------------------------------

/// Exposes the global FirebaseAuth singleton
final firebaseAuthProvider = Provider<FirebaseAuth>((ref) {
  return FirebaseAuth.instance;
});

/// Exposes the centralized AuthService business logic layer
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.watch(firebaseAuthProvider));
});

/// Reactive StreamProvider that emits whenever the user signs in, signs out,
/// or their authentication token updates.
final authStateStreamProvider = StreamProvider<User?>((ref) {
  final auth = ref.watch(firebaseAuthProvider);
  return auth.authStateChanges();
});

// ---------------------------------------------------------------------------
// 2. AuthService Implementation
// ---------------------------------------------------------------------------

class AuthService {
  final FirebaseAuth _auth;
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  AuthService(this._auth);

  /// Registers a user using Email and Password
  Future<UserCredential> registerWithEmail({
    required String email,
    required String password,
    String? displayName,
  }) async {
    try {
      final cred = await _auth.createUserWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );

      if (displayName != null && displayName.isNotEmpty) {
        await cred.user?.updateDisplayName(displayName.trim());
      }

      // Automatically send email verification link
      await cred.user?.sendEmailVerification();
      return cred;
    } on FirebaseAuthException catch (e) {
      throw _mapFirebaseAuthException(e);
    }
  }

  /// Authenticates an existing user via Email and Password
  Future<UserCredential> loginWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
    } on FirebaseAuthException catch (e) {
      throw _mapFirebaseAuthException(e);
    }
  }

  /// Initiates Google Sign-In on Android/iOS/Web, retrieves OAuth credentials,
  /// and authenticates with Firebase Identity Platform.
  Future<UserCredential?> signInWithGoogle() async {
    try {
      // Trigger interactive Google Sign-In UI
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        // User aborted the sign-in modal
        return null;
      }

      // Obtain identity and access tokens
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      // Construct Firebase OAuth credential
      final OAuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Complete Firebase authentication
      return await _auth.signInWithCredential(credential);
    } on FirebaseAuthException catch (e) {
      throw _mapFirebaseAuthException(e);
    } catch (e) {
      throw Exception('Failed to authenticate with Google: $e');
    }
  }

  /// Sends password reset email
  Future<void> sendPasswordReset(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email.trim());
    } on FirebaseAuthException catch (e) {
      throw _mapFirebaseAuthException(e);
    }
  }

  /// Signs out of both Firebase and Google Sign-In SDKs
  Future<void> signOut() async {
    await Future.wait([
      _auth.signOut(),
      _googleSignIn.signOut(),
    ]);
  }

  /// Maps native Firebase Auth codes to clear user-facing exceptions
  String _mapFirebaseAuthException(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
      case 'wrong-password':
      case 'invalid-credential':
        return 'Invalid email or password combination.';
      case 'email-already-in-use':
        return 'An account already exists for this email.';
      case 'invalid-email':
        return 'The email format is invalid.';
      case 'weak-password':
        return 'Password is too weak. Please use at least 8 characters.';
      case 'user-disabled':
        return 'This account has been disabled.';
      default:
        return e.message ?? 'An unexpected authentication error occurred.';
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Application Root & State Dispatcher
// ---------------------------------------------------------------------------

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase (Requires google-services.json / GoogleService-Info.plist)
  await Firebase.initializeApp();

  runApp(
    const ProviderScope(
      child: CompanionAuthApp(),
    ),
  );
}

class CompanionAuthApp extends StatelessWidget {
  const CompanionAuthApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Firebase Companion Auth',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0A0A0A),
        colorScheme: const ColorScheme.dark(
          primary: Colors.white,
          surface: Color(0xFF141414),
        ),
      ),
      home: const AuthGatekeeper(),
    );
  }
}

/// The AuthGatekeeper observes [authStateStreamProvider].
/// Renders [HomeScreen] when authenticated and [AuthScreen] when unauthenticated.
class AuthGatekeeper extends ConsumerWidget {
  const AuthGatekeeper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateStreamProvider);

    return authState.when(
      data: (user) {
        if (user != null) {
          return HomeScreen(user: user);
        }
        return const AuthScreen();
      },
      loading: () => const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: Colors.white),
        ),
      ),
      error: (error, stack) => Scaffold(
        body: Center(
          child: Text('Authentication Stream Error: $error'),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 4. Authenticated Home Screen
// ---------------------------------------------------------------------------

class HomeScreen extends ConsumerWidget {
  final User user;
  const HomeScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Sign Out',
            onPressed: () async {
              await ref.read(authServiceProvider).signOut();
            },
          ),
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircleAvatar(
                radius: 40,
                backgroundImage: user.photoURL != null
                    ? NetworkImage(user.photoURL!)
                    : null,
                child: user.photoURL == null
                    ? const Icon(Icons.person, size: 40)
                    : null,
              ),
              const SizedBox(height: 16),
              Text(
                user.displayName ?? 'Authenticated User',
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                user.email ?? '',
                style: const TextStyle(color: Colors.white70),
              ),
              const SizedBox(height: 8),
              Chip(
                label: Text(
                  user.emailVerified ? 'Email Verified' : 'Email Unverified',
                  style: const TextStyle(fontSize: 12),
                ),
                backgroundColor: user.emailVerified ? Colors.green[900] : Colors.orange[900],
              ),
              const SizedBox(height: 32),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                  minimumSize: const Size(200, 48),
                ),
                icon: const Icon(Icons.logout),
                label: const Text('Sign Out'),
                onPressed: () => ref.read(authServiceProvider).signOut(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 5. Unauthenticated Login & Registration Screen
// ---------------------------------------------------------------------------

class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();

  bool _isSignUp = false;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _submitEmailAuth() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final authService = ref.read(authServiceProvider);
      if (_isSignUp) {
        await authService.registerWithEmail(
          email: _emailController.text,
          password: _passwordController.text,
          displayName: _nameController.text,
        );
      } else {
        await authService.loginWithEmail(
          email: _emailController.text,
          password: _passwordController.text,
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await ref.read(authServiceProvider).signInWithGoogle();
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Card(
              color: const Color(0xFF141414),
              shape: RoundedRectangleBorder(
                side: const BorderSide(color: Colors.white24),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      _isSignUp ? 'Create Account' : 'Welcome Back',
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),

                    // Google OAuth Button
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white30),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      icon: const Icon(Icons.g_mobiledata, size: 28),
                      label: const Text('Continue with Google'),
                      onPressed: _isLoading ? null : _handleGoogleSignIn,
                    ),
                    const SizedBox(height: 16),

                    Row(
                      children: const [
                        Expanded(child: Divider(color: Colors.white24)),
                        Padding(
                          padding: EdgeInsets.symmetric(horizontal: 12),
                          child: Text('OR', style: TextStyle(color: Colors.white38, fontSize: 12)),
                        ),
                        Expanded(child: Divider(color: Colors.white24)),
                      ],
                    ),
                    const SizedBox(height: 16),

                    if (_errorMessage != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: Colors.red[950],
                          border: Border.all(color: Colors.red),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(color: Colors.redAccent, fontSize: 13),
                        ),
                      ),

                    if (_isSignUp) ...[
                      TextField(
                        controller: _nameController,
                        decoration: const InputDecoration(
                          labelText: 'Full Name',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    TextField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                        labelText: 'Email Address',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16),

                    TextField(
                      controller: _passwordController,
                      obscureText: true,
                      decoration: const InputDecoration(
                        labelText: 'Password',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 24),

                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      onPressed: _isLoading ? null : _submitEmailAuth,
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                            )
                          : Text(_isSignUp ? 'Sign Up' : 'Log In'),
                    ),
                    const SizedBox(height: 12),

                    TextButton(
                      onPressed: () => setState(() => _isSignUp = !_isSignUp),
                      child: Text(
                        _isSignUp
                            ? 'Already have an account? Log In'
                            : "Don't have an account? Sign Up",
                        style: const TextStyle(color: Colors.white70),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
