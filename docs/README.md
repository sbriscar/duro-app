# Duro App Documentation

## Overview
Sports psychology chatbot with authentication and personalized conversations.

## Key Features
- Firebase Authentication with email verification
- OpenAI-powered chat interface
- User profiles and progress tracking
- Personalized sports psychology assistance

## Directory Structure
- /src/app/(auth)/* - Authentication routes
  - /login - Login page with email/password
  - /signup - Registration with email verification
  - /forgot-password - Password reset flow
  - /verify-email - Email verification handling
  - /verify-handler - Post-verification processing
  - /verify-success - Verification success page

- /src/components/* - Reusable components
  - Auth components
    - AuthGuard.tsx - Protected route wrapper
    - ProtectedRoute.tsx - Route-level protection
    - SessionExpiryNotification.tsx - Auth session management
  - Chat components
    - ChatInterface.tsx - Main chat container
    - ChatArea.tsx - Message display area
    - ChatInput.tsx - Message input handling
    - ChatHistory.tsx - Previous conversations
  - Form components
    - ErrorMessage.tsx - Error display
    - FormField.tsx - Input field wrapper
    - LoadingButton.tsx - Button with loading state
    - PasswordInput.tsx - Secure password input

- /src/contexts/* - React contexts
  - AuthContext.tsx - Authentication state management
  - ProfileContext.tsx - User profile state

- /src/lib/* - Core functionality
  - firebase.ts - Firebase initialization and config
  - chatService.ts - Chat operations and storage
  - profileService.ts - User profile management

## Environment Setup
```env
OPENAI_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

## Authentication Flow
1. User registration
   - Email/password signup
   - Verification email sent
   - Redirect to verification page
2. Email verification
   - User clicks email link
   - Verification status updated
   - Redirect to login
3. Login process
   - Credentials validated
   - Session established
   - Redirect to dashboard/chat

## Chat Implementation
- OpenAI integration via API route
- Conversation history stored in Firebase
- System prompt for sports psychology focus
- Real-time message updates

## Backup Strategy
- Daily automated backups
- Critical files backed up:
  - All source code
  - Environment configs
  - Package dependencies
- Backup script: backup-scripts/backup.sh 