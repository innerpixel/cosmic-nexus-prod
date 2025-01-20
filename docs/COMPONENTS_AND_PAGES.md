# Components and Pages Flow Documentation

This document details the structure and flow of components and pages in the Cosmic Nexus application.

## Application Structure

```
src/
├── components/          # Reusable UI components
│   ├── CosmicLogo.vue  # Application logo component
│   ├── Navigation.vue  # Main navigation component
│   └── navigation/     # Navigation-related components
│
├── views/              # Page components
│   ├── About.vue
│   ├── Contact.vue
│   ├── Dashboard.vue
│   ├── Features.vue
│   ├── LandingPage.vue
│   └── auth/          # Authentication-related pages
│
├── layouts/           # Layout templates
├── router/           # Vue Router configuration
├── stores/           # Pinia state management
├── assets/           # Static assets
└── tests/            # Unit and E2E tests
```

## Page Flow

### 1. Public Pages
- **Landing Page** (`LandingPage.vue`)
  - Entry point for non-authenticated users
  - Features overview
  - Call-to-action buttons for registration/login
  
- **About** (`About.vue`)
  - Company/Project information
  - Mission and vision
  
- **Features** (`Features.vue`)
  - Detailed feature list
  - Feature demonstrations
  
- **Contact** (`Contact.vue`)
  - Contact form
  - Support information

### 2. Authentication Flow
Located in `views/auth/`:
1. **Login**
   - Email/password login form
   - Social authentication options
   - Password reset link
   
2. **Register**
   - New user registration form
   - Terms acceptance
   - Email verification initiation
   
3. **Password Reset**
   - Password reset request form
   - Reset token validation
   - New password setup
   
4. **Email Verification**
   - Email verification status
   - Resend verification email option
   
5. **Profile Setup**
   - Initial profile configuration
   - Preferences setup

### 3. Protected Pages
- **Dashboard** (`Dashboard.vue`)
  - User's main workspace
  - Activity overview
  - Quick actions
  - Statistics and metrics

## Component Architecture

### 1. Navigation Components
- **Main Navigation** (`Navigation.vue`)
  - Primary navigation bar
  - Responsive menu system
  - Authentication state-aware
  
- **Navigation Subcomponents**
  - Mobile menu
  - User menu dropdown
  - Notification center

### 2. Shared Components
- **CosmicLogo** (`CosmicLogo.vue`)
  - Application branding
  - Animated logo variations

### 3. Layout System
Located in `layouts/`:
- **Default Layout**
  - Standard page structure
  - Navigation integration
  - Footer placement
  
- **Authentication Layout**
  - Simplified layout for auth pages
  - Focused content area
  - Branding elements

## State Management

### Pinia Stores
Located in `stores/`:
1. **Authentication Store**
   - User session management
   - Authentication state
   - Token handling
   
2. **Application Store**
   - Global app state
   - Theme preferences
   - User settings

## Router Configuration

### Route Guards
- Authentication check
- Role-based access control
- Redirect logic for authenticated users

### Route Structure
```javascript
routes: [
  {
    path: '/',
    component: LandingPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  // Auth routes
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'reset-password', component: PasswordReset },
      { path: 'verify-email', component: EmailVerification }
    ]
  }
]
```

## Component Communication

### 1. Props and Events
- Parent-child component communication
- Event bus for complex scenarios
- Custom events for specific interactions

### 2. Vuex Integration
- Global state access
- Mutations for state changes
- Actions for async operations

## Styling System

### 1. Tailwind Integration
- Utility-first approach
- Custom theme configuration
- Responsive design classes

### 2. Component-Specific Styles
- Scoped CSS
- Tailwind @apply directives
- Dynamic styling based on state

## Best Practices

1. **Component Organization**
   - Single responsibility principle
   - Modular design
   - Reusable components

2. **State Management**
   - Centralized state
   - Computed properties
   - Watchers for side effects

3. **Performance**
   - Lazy loading routes
   - Component chunking
   - Asset optimization

4. **Testing**
   - Unit tests for components
   - E2E tests for critical flows
   - Integration tests for features
