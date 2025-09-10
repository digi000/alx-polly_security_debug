# ALX Polly: A Polling Application

Welcome to ALX Polly, a full-stack polling application built with Next.js, TypeScript, and Supabase. This project serves as a practical learning ground for modern web development concepts, with a special focus on identifying and fixing common security vulnerabilities.

## About the Application

ALX Polly allows authenticated users to create, share, and vote on polls. It's a simple yet powerful application that demonstrates key features of modern web development:

-   **Authentication**: Secure user sign-up and login.
-   **Poll Management**: Users can create, view, and delete their own polls.
-   **Voting System**: A straightforward system for casting and viewing votes.
-   **User Dashboard**: A personalized space for users to manage their polls.

The application is built with a modern tech stack:

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Backend & Database**: [Supabase](https://supabase.io/)
-   **UI**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
-   **State Management**: React Server Components and Client Components

---

## �️ Security Audit & Remediation Summary

### Critical Vulnerabilities Discovered & Fixed

#### 1. **Broken Access Control - Admin Panel (HIGH SEVERITY)**
**Vulnerability**: Admin panel fetched all polls directly from client-side using anon key, bypassing server-side access controls.
**Impact**: Any authenticated user could access all polls in the system through the admin panel.
**Fix**: Created secure server actions (`admin-actions.ts`) that verify admin role before allowing access to admin functions.

#### 2. **Insecure Direct Object References - Poll Editing (HIGH SEVERITY)**
**Vulnerability**: Poll edit page didn't verify ownership before allowing edits.
**Impact**: Users could edit any poll by changing the ID in the URL.
**Fix**: Added ownership verification in edit page to ensure only poll owners can edit their polls.

#### 3. **Voting System Vulnerabilities (MEDIUM SEVERITY)**
**Vulnerability**: 
- No duplicate vote prevention
- Anonymous voting allowed without verification
- No validation of poll existence or option validity
**Impact**: Users could vote multiple times, manipulate poll results.
**Fix**: 
- Added duplicate vote checking
- Required authentication for voting
- Added poll and option validation

#### 4. **Cross-Site Scripting (XSS) in Sharing Feature (MEDIUM SEVERITY)**
**Vulnerability**: Poll titles not sanitized before being used in share URLs and social media posts.
**Impact**: Malicious poll titles could execute XSS attacks.
**Fix**: Added title sanitization to remove dangerous characters before sharing.

#### 5. **Mock Data Exposure (LOW SEVERITY)**
**Vulnerability**: Poll detail page used hard-coded mock data instead of real database queries.
**Impact**: Application showed fake data, potential information disclosure.
**Fix**: Replaced mock data with real database queries using secure server actions.

#### 6. **Authentication & Session Management Issues**
**Vulnerability**: 
- No role-based access control
- No brute-force protection
- Weak authentication enforcement
**Impact**: Unauthorized access to admin features, account compromise.
**Fix**: 
- Implemented role-based middleware
- Added rate limiting to auth actions
- Enforced authentication for protected routes

#### 7. **Registration Security Flaws**
**Vulnerability**: 
- No password strength validation
- No check for existing users
- No email verification enforcement
**Impact**: Weak passwords, duplicate accounts, unverified users.
**Fix**: 
- Added strong password requirements
- Implemented existing user checks
- Enforced email verification

#### 8. **Poll Ownership & Authorization Issues**
**Vulnerability**: Poll deletion didn't verify ownership or require authentication.
**Impact**: Any user could delete any poll.
**Fix**: Added authentication and ownership checks for poll deletion.

### Security Measures Implemented

1. **Server-Side Validation**: All critical operations now use server actions with proper validation
2. **Authentication Enforcement**: Protected routes require valid authentication
3. **Authorization Controls**: Role-based access for admin features, ownership checks for poll actions
4. **Input Sanitization**: User inputs sanitized to prevent XSS attacks
5. **Rate Limiting**: Basic protection against brute-force attacks
6. **Data Integrity**: Proper validation of poll data, vote submissions, and user actions

### Remaining Recommendations

1. **Implement persistent rate limiting** using Redis or similar service
2. **Add CSRF protection** for form submissions
3. **Implement proper logging and monitoring** for security events
4. **Add API rate limiting** at the infrastructure level
5. **Regular security audits** and penetration testing
6. **Implement Content Security Policy (CSP)** headers
7. **Add proper error handling** to prevent information leakage

### Database Security Notes

- Ensure Row Level Security (RLS) is enabled in Supabase
- Implement proper database indexes for performance
- Regular backups and access reviews
- Monitor for suspicious database activities

---

## Getting Started

To begin your security audit, you'll need to get the application running on your local machine.

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (v20.x or higher recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   A [Supabase](https://supabase.io/) account (the project is pre-configured, but you may need your own for a clean slate).

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd alx-polly
npm install
```

### 3. Environment Variables

The project uses Supabase for its backend. An environment file `.env.local` is needed.Use the keys you created during the Supabase setup process.

### 4. Running the Development Server

Start the application in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

Good luck, engineer! This is your chance to step into the shoes of a security professional and make a real impact on the quality and safety of this application. Happy hunting!
