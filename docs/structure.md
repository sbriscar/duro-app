# Duro App Structure

## Authentication
- /src/app/(auth)/* - Auth routes (login, signup, etc.)
- /src/contexts/AuthContext.tsx - Auth state management
- /src/components/AuthGuard.tsx - Protected route wrapper

## Chat
- /src/app/api/chat/route.ts - OpenAI integration
- /src/components/ChatInterface.tsx - Main chat UI
- /src/lib/chatService.ts - Firebase chat service

## Components
- Form components (ErrorMessage, FormField, etc.)
- Loading states (LoadingButton, LoadingSpinner)
- Auth components (ProtectedRoute, SessionExpiry) 