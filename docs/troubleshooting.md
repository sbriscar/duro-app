# Troubleshooting Guide

## Common Issues

### Authentication
1. Email verification not received
   - Check spam folder
   - Verify email format
   - Check Firebase console logs

2. Login fails
   - Verify email is verified
   - Check credentials
   - Clear browser cache

### Chat
1. Messages not sending
   - Check OpenAI API key
   - Verify Firebase rules
   - Check network connection

2. History not loading
   - Check Firestore permissions
   - Verify user authentication
   - Check database indexes

### Development
1. Build errors
   - Run `npm install`
   - Clear .next directory
   - Check TypeScript errors

2. Environment issues
   - Verify .env.local exists
   - Check all required variables
   - Restart development server 