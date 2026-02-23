# 🛡️ Cybersec Arena - Complete Platform Documentation

## Table of Contents
1. [Overview](#overview)
2. [Frontend vs Backend](#frontend-vs-backend)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [Database & APIs](#database--apis)
8. [Authentication Flow](#authentication-flow)
9. [Key Services](#key-services)
10. [Pages and Features](#pages-and-features)
11. [How Everything Works Together](#how-everything-works-together)

---

## Overview

**Cybersec Arena** is a comprehensive cybersecurity learning platform that provides interactive CTF (Capture The Flag) challenges, quizzes, leaderboards, threat analysis, and educational content for cybersecurity enthusiasts of all levels.

### Key Features:
- 🎮 CTF Challenges (Web, Cryptography, Forensics, Reverse Engineering, Binary)
- 🧠 AI-Powered Quiz Bot with difficulty levels
- 📋 Phishing Hunt simulations
- 🔐 Code Security challenges
- 🎯 Weekly challenges
- 📊 Real-time leaderboards
- 🔍 Threat Radar analysis system
- 📰 Cybersecurity news feed
- 👤 User profiles with progress tracking
- 🏆 Badge and achievement system

---

## Frontend vs Backend

### **FRONTEND** ⚡
**What it is:** The user interface and client-side application that runs in the browser.

**Technology:** React 18 with TypeScript and Vite
- **React**: UI framework for building interactive components
- **TypeScript**: Type-safe JavaScript for better code quality
- **Vite**: Ultra-fast build tool and development server
- **React Router**: Client-side navigation
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Beautiful SVG icons

**Where it lives:** `/src` folder

**What it does:**
1. Renders the user interface
2. Manages user interactions (clicks, forms, navigation)
3. Displays data fetched from backend
4. Handles authentication locally (with help from Supabase)
5. Manages component state and user session
6. Caches data locally (localStorage) for performance

---

### **BACKEND** 🔧
**What it is:** The server-side application that processes requests and manages data.

**Technology:** Node.js with Express.js
- **Express**: Web framework for building APIs
- **Node.js**: JavaScript runtime for server-side execution

**Where it lives:** `/server` and `/dev-server.js`

**What it does:**
1. Receives HTTP requests from the frontend
2. Processes data and business logic
3. Communicates with the database (Supabase)
4. Performs calculations (threat analysis, quiz generation)
5. Sends responses back to frontend in JSON format
6. Handles file processing and analysis

**Key Backend Features:**
- **Threat Radar Engine** (`threatAnalysisEngine.js`): Analyzes security symptoms and threats
- **Chat Server** (`chatserver.js`): Handles real-time messaging if needed
- **API Endpoints**: RESTful endpoints for various operations

---

## Technology Stack

### Frontend Stack:
```
React 18.3.1          - UI Framework
TypeScript 5.5.3      - Type safety
Vite 5.4.2            - Build tool
React Router 6.26.2   - Navigation
Tailwind CSS 3.4.1    - Styling
Lucide React 0.344    - Icons
```

### Backend Stack:
```
Node.js               - Runtime
Express.js            - Web framework
CORS                  - Cross-Origin Resource Sharing
```

### Database:
```
Supabase (PostgreSQL) - Cloud database with auth
```

### Deployment:
```
Electron              - Desktop app support
Docker                - Containerization
```

---

## Project Structure

```
cybersec-arena/
│
├── src/                          # FRONTEND CODE
│   ├── App.tsx                   # Main app component with routing
│   ├── main.tsx                  # React entry point
│   ├── index.css                 # Global styles
│   │
│   ├── components/               # Reusable React components
│   │   ├── AnimatedBackground.tsx
│   │   ├── Layout.tsx            # Main layout wrapper
│   │   ├── ProtectedRoute.tsx    # Auth guard component
│   │   ├── PublicRoute.tsx       # Public pages guard
│   │   └── ... (other UI components)
│   │
│   ├── pages/                    # Page components (full pages)
│   │   ├── Dashboard.tsx         # Home page
│   │   ├── CTF.tsx              # CTF challenges page
│   │   ├── Leaderboard.tsx      # Rankings page
│   │   ├── NewsFeed.tsx         # News page
│   │   ├── Profile.tsx          # User profile page
│   │   ├── Login.tsx            # Login page
│   │   ├── Signup.tsx           # Registration page
│   │   ├── CyberHealthAnalyzer.tsx  # Threat Radar
│   │   └── ... (other pages)
│   │
│   ├── services/                 # Business logic & API calls
│   │   ├── authService.ts       # Authentication logic
│   │   ├── leaderboardService.ts # Leaderboard data
│   │   ├── newsService.ts       # News fetching & caching
│   │   ├── profileService.ts    # User profile data
│   │   ├── BadgeService.ts      # Achievement system
│   │   ├── SoundService.ts      # Audio management
│   │   └── ... (other services)
│   │
│   ├── contexts/                 # React Context API
│   │   ├── AuthContext.tsx      # Global auth state
│   │   └── ... (other contexts)
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── auth.ts              # Auth types
│   │   └── ... (other types)
│   │
│   ├── lib/                      # Utility libraries
│   │   ├── supabase.ts          # Supabase client setup
│   │   └── ... (other utilities)
│   │
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Helper functions
│   ├── config/                   # Configuration files
│   ├── data/                     # Static data
│   │   ├── ctf.ts              # CTF challenge definitions
│   │   └── ... (quiz data, etc)
│   └── assets/                   # Images, fonts, etc
│
├── server/                       # BACKEND CODE
│   ├── index.js                  # Main server entry point
│   ├── threatAnalysisEngine.js   # Threat analysis logic
│   ├── chatserver.js             # Chat/messaging server
│   ├── package.json              # Backend dependencies
│   └── ... (other backend files)
│
├── dev-server.js                 # Development server (runs on port 3001)
│
├── public/                       # Static files
├── dist/                         # Built frontend output
├── node_modules/                 # Dependencies
│
├── package.json                  # Frontend dependencies & scripts
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
│
└── .env                          # Environment variables (secrets)
```

---

## Frontend Architecture

### **Component Hierarchy:**

```
App.tsx (Root)
├── AnimatedBackground          # Full-screen animation
├── AuthProvider                # Auth context provider
└── BrowserRouter (React Router)
    ├── Login Page (Public route)
    ├── Signup Page (Public route)
    └── Layout (Protected parent)
        ├── Sidebar Navigation
        ├── Main Content Area
        └── Child Routes:
            ├── Dashboard
            ├── CTF
            ├── Leaderboard
            ├── News Feed
            ├── Profile
            └── ... (other pages)
```

### **React Context (Global State):**

**AuthContext.tsx** - Manages:
- Current logged-in user
- Authentication status
- Login/Signup/Logout functions
- Auth loading state
- Session management

### **Common Page Flow:**

1. User loads page → `App.tsx` checks auth status
2. If not logged in → Redirects to `/login`
3. If logged in → Loads `Layout` component
4. `Layout` renders sidebar + current page
5. Page component fetches data via services
6. Data displayed in UI
7. User interactions trigger API calls
8. Results update state and re-render

### **Data Flow (Example: CTF Challenge):**

```
CTF.tsx Component
    ↓
User clicks on challenge
    ↓
Challenge details fetched from local data (src/data/ctf.ts)
    ↓
Component renders challenge info
    ↓
User submits flag
    ↓
leaderboardService.syncUserScore() is called
    ↓
API call to Supabase updates database
    ↓
Leaderboard re-fetches and updates UI
```

---

## Backend Architecture

### **Server Structure:**

```
Backend (Node.js + Express)
│
├── dev-server.js (port 3001)
│   ├── POST /api/threat-radar
│   │   ├── Accepts: { symptoms: string }
│   │   ├── Calls: threatAnalysisEngine.extractSymptoms()
│   │   ├── Calls: threatAnalysisEngine.analyzeThreatProfile()
│   │   └── Returns: { analysis, risk_level, detected_symptoms }
│   │
│   └── [Other potential endpoints]
│
├── server/index.js
│   ├── Main server initialization
│   ├── Database migrations
│   └── Setup logic
│
├── threatAnalysisEngine.js
│   ├── extractSymptoms(text)        → Detects security issues from user input
│   ├── analyzeThreatProfile()       → Performs threat analysis
│   ├── calculateRisk()              → Computes risk percentage
│   └── generateRecommendations()    → Provides security advice
│
├── chatserver.js
│   └── WebSocket handling for real-time messaging
│
└── Dockerfile
    └── Container configuration for deployment
```

### **Request Flow (Example: Threat Radar):**

```
Frontend (React Component)
    ↓
User types symptoms and clicks "Analyze"
    ↓
fetch('/api/threat-radar', {
    method: 'POST',
    body: JSON.stringify({ symptoms: userInput })
})
    ↓
Express Backend (port 3001)
    ↓
POST /api/threat-radar handler
    ├── Validates input
    ├── Calls extractSymptoms(symptoms)
    ├── Calls analyzeThreatProfile()
    ├── Calls calculateRisk()
    └── Returns JSON response
    ↓
Frontend receives response
    ↓
React component updates state
    ↓
UI displays analysis results
```

---

## Database & APIs

### **Database: Supabase (PostgreSQL)**

Supabase is a cloud database platform that provides:
- PostgreSQL database
- Built-in authentication
- Real-time data sync
- Auto-generated REST APIs
- Row Level Security (RLS)

**Key Tables:**

1. **users** (Auto-created by Supabase Auth)
   - id (UUID)
   - email
   - password (hashed)
   - created_at

2. **user_profiles**
   - id (FK to users.id)
   - username
   - name
   - email
   - avatar_url
   - created_at
   - updated_at

3. **leaderboard**
   - id
   - user_id (FK)
   - username
   - total_score
   - ctf_score, phish_score, code_score, quiz_score
   - rank
   - last_updated

4. **user_progress**
   - id
   - user_id (FK)
   - ctf_solved (array of challenge IDs)
   - phish_solved
   - code_solved
   - quiz_answered
   - updated_at

5. **badges** / **user_achievements**
   - Track earned badges and achievements
   - Link users to their accomplishments

### **Supabase APIs Used:**

#### Authentication API:
```typescript
// Sign up
supabase.auth.signUp({
    email: 'user@example.com',
    password: 'password123',
    options: { data: { username: 'john' } }
})

// Sign in
supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'password123'
})

// Logout
supabase.auth.signOut()

// Get current session
supabase.auth.getSession()
```

#### Database API:
```typescript
// Read data
supabase.from('leaderboard')
    .select('*')
    .order('total_score', { ascending: false })
    .limit(100)

// Insert data
supabase.from('user_progress')
    .insert({ user_id, ctf_solved: [challenge_id] })

// Update data
supabase.from('leaderboard')
    .update({ total_score: newScore })
    .eq('user_id', userId)

// Delete data
supabase.from('badges')
    .delete()
    .eq('id', badge_id)
```

#### Real-time Subscriptions:
```typescript
// Listen to changes
supabase.from('leaderboard')
    .on('*', (payload) => {
        console.log('Leaderboard updated:', payload)
    })
    .subscribe()
```

### **Backend Custom APIs:**

**Threat Radar API:**
```
Endpoint: POST /api/threat-radar
Port: 3001

Request:
{
    "symptoms": "My computer is running slow and antivirus is disabled"
}

Response:
{
    "detected_symptoms": ["slow_system", "antivirus_disabled", "disk_space_low"],
    "threats": [
        {
            "name": "Malware Infection",
            "severity": "high",
            "description": "...",
            "recommendations": [...]
        },
        ...
    ],
    "overall_risk_level": "high",
    "risk_percentage": 75,
    "recommendations": [...]
}
```

---

## Authentication Flow

### **Sign Up Process:**

```
1. User fills signup form
   ├── Email validation
   ├── Password strength check
   ├── Username validation
   
2. Frontend calls authService.signup(credentials)

3. authService.signup():
   ├── Validates input
   ├── Calls supabase.auth.signUp()
   ├── Creates user_profiles entry
   ├── Creates user_progress entry
   ├── Creates leaderboard entry
   └── Returns { needsConfirmation: true }

4. Supabase sends confirmation email

5. User clicks email link / confirms

6. User can now login
```

### **Login Process:**

```
1. User enters email & password

2. Frontend calls authService.login(credentials)

3. authService.login():
   ├── Validates input
   ├── Calls supabase.auth.signInWithPassword()
   ├── On success:
   │   ├── Stores session in localStorage
   │   ├── Fetches user profile
   │   └── Updates AuthContext
   └── Returns user object

4. App detects authentication
   ├── Redirects from /login to /dashboard

5. AuthContext provides user info to all components
```

### **Session Management:**

```
User visits site
    ↓
AuthContext.useEffect() runs
    ↓
Checks localStorage for auth token
    ↓
If token exists:
    ├── Loads current user from Supabase
    ├── Sets up auth state change listener
    └── Keeps session alive with auto-refresh
    
If token doesn't exist:
    └── User sent to login page
```

---

## Key Services

### **1. authService.ts**
Handles all authentication operations:

```typescript
Methods:
- signup(credentials)           // Register new user
- login(credentials)            // Login user
- logout()                      // Logout user
- getCurrentUser()              // Get current logged-in user
- resendConfirmationEmail()     // Resend confirmation
- checkEmailExists()            // Verify email availability
- validateSignupBasics()        // Input validation
```

### **2. leaderboardService.ts**
Manages leaderboard data:

```typescript
Methods:
- getLeaderboard(limit)         // Fetch all rankings
- syncUserScore(userId, score)  // Update user score
- updateProgress(userId, type)  // Track challenge completion
- getCachedLeaderboard()        // Get from cache
- subscribeToLeaderboard()      // Real-time updates
```

Key Features:
- Multiple fetch strategies (view → query → fallback)
- Caching for performance
- Real-time subscriptions
- Auto-refresh every 10 seconds

### **3. newsService.ts**
Fetches cybersecurity news:

```typescript
Methods:
- getCybersecurityNews()        // Fetch news articles
- refreshInBackground()         // Silent background refresh
- parseReddit()                 // Scrape Reddit
- parseHackerNews()             // Scrape HN
- parseCVE()                    // Get CVE data
- parseNewsAPI()                // Use NewsAPI
```

Features:
- localStorage persistence
- Smart caching (2-minute duration)
- Multiple source aggregation
- Fetch timeout handling

### **4. profileService.ts**
User profile management:

```typescript
Methods:
- getUserProfile(userId)        // Fetch user info
- updateProfile(updates)        // Update user data
- getProgressStats()            // Get achievement data
- updateProfilePicture()        // Avatar upload
```

### **5. BadgeService.ts**
Achievement and badge system:

```typescript
Methods:
- checkAndAwardBadges()         // Award earned badges
- getBadges(userId)             // Fetch user badges
- getAvailableBadges()          // Show all possible badges
- updateBadgeProgress()         // Track progress
```

Badge Categories:
- Challenge Badges (solve X CTF challenges)
- Streak Badges (consecutive correct answers)
- Speed Badges (fastest completion)
- Category Badges (master a category)
- Special Badges (Events, milestones)

---

## Pages and Features

### **1. Dashboard** (`Dashboard.tsx`)
**Purpose:** Home page with overview and quick access

**Components:**
- Welcome message
- Progress summary
- Recent achievements
- Quick action buttons
- Statistics overview

**API Calls:**
- Fetch user profile
- Get progress stats
- Fetch leaderboard rankings

---

### **2. CTF Challenges** (`CTF.tsx`)
**Purpose:** Capture The Flag challenges

**Structure:**
```
5 Categories:
├── Web (SQL Injection, XSS, CSRF)
├── Cryptography (Caesar, RSA, Hash)
├── Forensics (Hex decoding, file analysis)
├── Reverse Engineering (Assembly, binary)
└── Binary (Buffer overflow, exploitation)

3 Difficulty Levels:
├── Easy (1 point)
├── Medium (5 points)
└── Hard (10-15 points)
```

**How it works:**
1. Challenge data loaded from `/src/data/ctf.ts`
2. User selects category → filters displayed
3. Challenge shows:
   - Title
   - Description/Prompt
   - Hints (progressive)
   - Submit area
4. User submits flag
5. Frontend validates against expected flag
6. If correct:
   - Score added to database
   - Leaderboard updates
   - Achievement checked

**Data Source:** Hardcoded in `src/data/ctf.ts` object array

---

### **3. Leaderboard** (`Leaderboard.tsx`)
**Purpose:** Real-time user rankings

**Features:**
- Top 100 users by score
- Filter by category (CTF, Phish, Code, Quiz)
- Real-time update subscriptions
- User search
- Rank display with medals

**Data Flow:**
```
Component mounts
    ↓
Call leaderboardService.getLeaderboard()
    ↓
If cached → show immediately
    ↓
If not cached → fetch from Supabase
    ↓
Subscribe to real-time updates
    ↓
Auto-refresh every 10 seconds
```

**Sync Logic:**
When user solves challenge → calls `syncUserScore()`:
1. Updates leaderboard table
2. Updates user_progress table
3. Triggers badge check
4. Refreshes leaderboard display

---

### **4. News Feed** (`NewsFeed.tsx`)
**Purpose:** Curated cybersecurity news

**Features:**
- Aggregate from multiple sources:
  - Reddit r/cybersecurity
  - Hacker News
  - CVE database
  - NewsAPI
- Cached articles (localStorage)
- Load immediately from cache
- Refresh in background

**Performance Optimization:**
```
User visits News page
    ↓
Show cached articles instantly (<100ms)
    ↓
In background: fetch fresh data
    ↓
Update cache silently
    ↓
Next visit shows fresh news
```

---

### **5. AI Quiz Bot** (`AICyberQuizBot.tsx`)
**Purpose:** AI-generated security quizzes

**Features:**
- 3 difficulty levels (Easy, Medium, Hard)
- Multiple question types
- Real-time scoring
- Progress tracking
- Timer-based challenges

**How it works:**
```
User selects difficulty
    ↓
Quiz service adapts questions
    ↓
Questions displayed one at a time
    ↓
User selects answer
    ↓
Immediate feedback
    ↓
Score calculation
    ↓
Progress saved to database
```

---

### **6. Threat Radar** (`CyberHealthAnalyzer.tsx`)
**Purpose:** Analyze system security

**Features:**
- User describes system issues
- AI analyzes symptoms
- Identifies potential threats
- Provides recommendations

**API Request:**
```
User input: "My computer is slow and making strange noises"
    ↓
POST /api/threat-radar
    ↓
Backend extracts symptoms:
├── Slow system
├── Unusual sounds
└── Potential hardware failure
    ↓
Analyzes threats:
├── Malware (likely)
├── Hardware failure (possible)
└── Overheating (possible)
    ↓
Returns analysis with:
├── Risk percentage
├── Threat descriptions
└── Recommendations
```

---

### **7. Phishing Hunt** (`PhishHunt.tsx`)
**Purpose:** Identify phishing emails

**Challenges:**
- Simulate realistic phishing scenarios
- Identify malicious links
- Spot social engineering tactics
- Analyze email headers

---

### **8. Code Security** (`CodeAndSecure.tsx`)
**Purpose:** Code vulnerability identification

**Challenges:**
- Find SQL injection vulnerabilities
- Identify buffer overflows
- Spot XSS vulnerabilities
- Security best practices

---

### **9. Steganography** (`Steganography.tsx`)
**Purpose:** Hide and extract hidden data

**Features:**
- Embed messages in images
- Extract hidden data
- Various encoding methods
- Practice digital forensics

---

### **10. User Profile** (`Profile.tsx`)
**Purpose:** Personal stats and settings

**Shows:**
- Username and avatar
- Badge collection
- Progress statistics
- Recent achievements
- Solve history
- Settings (theme, notifications, etc)

---

## How Everything Works Together

### **Complete User Journey:**

#### **Step 1: User Signup**
```
1. User visits site → Sees login page
2. Clicks "Sign Up"
3. Fills form: email, password, username
4. Frontend validates input (min length, format, etc)
5. Calls authService.signup()
6. authService sends request to Supabase:
   ├── Supabase.auth.signUp()  → Creates auth user
   ├── Insert to user_profiles
   ├── Insert to user_progress
   └── Insert to leaderboard
7. Supabase sends confirmation email
8. User clicks email link
9. Email confirmed ✓
10. User can now login
```

#### **Step 2: User Login**
```
1. User enters email & password
2. Clicks "Login"
3. authService.login() called
4. Sends credentials to Supabase
5. Supabase validates and returns session token
6. Token stored in localStorage
7. AuthContext updated with user data
8. App redirects to /dashboard
9. User logged in ✓
```

#### **Step 3: Solving CTF Challenge**
```
1. User navigates to CTF page (via sidebar)
2. CTF.tsx loads and renders challenges
3. Data from /src/data/ctf.ts
4. User clicks on a challenge
5. Prompt, hints, and submit area display
6. User submits flag (e.g., "flag{hello}")
7. Frontend checks flag === expected flag
8. If correct:
   ├── Show success message
   ├── Add points to state
   ├── Call leaderboardService.syncUserScore()
   ├── Backend updates Supabase:
   │   ├── Update leaderboard table
   │   ├── Update user_progress table
   │   └── Check for badge conditions
   ├── Leaderboard re-fetches
   ├── User sees updated rank
   └── Badge notification if earned
9. If incorrect:
   └── Show "Incorrect flag, try again"
```

#### **Step 4: Viewing Leaderboard**
```
1. User clicks Leaderboard in sidebar
2. Leaderboard.tsx loads
3. leaderboardService.getLeaderboard() called:
   ├── Checks cache (fastest)
   ├── If cache exists: return immediately
   ├── If empty: fetch from Supabase
   ├── Subscribe to real-time updates
   └── Set auto-refresh interval
4. Component renders top 100 users sorted by score
5. Real-time subscriptions keep it updated
6. Auto-refresh every 10 seconds
7. User can:
   ├── Filter by category
   ├── Search for user
   ├── View user details
   └── Compare progress
```

#### **Step 5: Checking News Feed**
```
1. User clicks News in sidebar
2. NewsFeed.tsx loads
3. newsService.getCybersecurityNews() called:
   ├── Returns cached articles immediately
   └── (Cache loaded from localStorage)
4. Articles display in less than 100ms
5. In background: refreshInBackground() is called:
   ├── Fetches from Reddit
   ├── Fetches from HackerNews
   ├── Fetches from CVE
   ├── Fetches from NewsAPI
   ├── Saves to cache
   └── Updates localStorage
6. Next visit will have fresh news
```

#### **Step 6: Using Threat Radar**
```
1. User navigates to Threat Radar
2. Sees form: "Describe your system issues"
3. User enters: "Computer is slow, fans loud, battery draining"
4. Clicks "Analyze"
5. Frontend sends POST request to /api/threat-radar
6. Backend (Node.js) receives request:
   ├── threatAnalysisEngine.extractSymptoms()
   │   ├── Parses user input
   │   └── Detects keywords
   ├── analyzeThreatProfile() called
   │   ├── Matches symptoms to threats
   │   ├── Calculates risk level
   │   └── Generates recommendations
   └── Returns JSON response
7. Frontend receives analysis:
   ├── Renders threat list
   ├── Shows risk meter
   ├── Displays recommendations
   └── Highlights severity
```

### **Data Flow Diagram:**

```
USER BROWSER (Frontend)
│
├─→ React App
│   ├─ App.tsx (routing)
│   ├─ AuthContext (auth state)
│   ├─ Pages (UI)
│   └─ Components (UI blocks)
│
├─→ Services Layer
│   ├─ authService (auth logic)
│   ├─ leaderboardService (ranking logic)
│   ├─ newsService (news logic)
│   └─ ... (other services)
│
├─→ External APIs
│   │
│   ├─→ Supabase API
│   │   ├─ PostgreSQL Database
│   │   ├─ Authentication
│   │   ├─ Real-time subscriptions
│   │   └─ Storage
│   │
│   └─→ Local Backend API (dev-server.js)
│       ├─ POST /api/threat-radar
│       └─ threatAnalysisEngine.js
│
├─→ Browser Storage
│   ├─ localStorage (auth token, cache)
│   ├─ sessionStorage (temp data)
│   └─ IndexedDB (if needed)
│
└─→ External News Sources
    ├─ Reddit API
    ├─ HackerNews
    ├─ CVE Database
    └─ NewsAPI
```

### **Component Communication:**

```
App Component Tree:
├── AuthProvider
│   └── BrowserRouter
│       ├── Login Page
│       ├── Signup Page
│       └── Layout
│           ├── Sidebar (Navigation)
│           └── Main Content
│               ├── Dashboard
│               ├── CTF
│               ├── Leaderboard
│               ├── News
│               ├── Profile
│               └── ... (other pages)

Data Flow:
Page Component
    ↓ (needs data)
Calls service (leaderboardService, newsService, etc)
    ↓ (service makes API call)
API Response (Supabase or Backend)
    ↓ (data returned)
Service returns data to component
    ↓ (setState in component)
Component re-renders with new data
```

---

## Development Commands

### Frontend Development:
```bash
npm run dev              # Start Vite dev server (port 5173)
npm run dev:backend     # Start backend server (port 3001)
npm run dev:full        # Run both simultaneously
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run typecheck       # Check TypeScript types
```

### Backend Development:
```bash
npm run dev:backend     # Start backend on port 3001
node server/index.js    # Run main server
```

### Environment Variables (.env):
```
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:3001
```

---

## Performance Optimizations

1. **Lazy Loading:** Pages loaded on demand via React.lazy()
2. **Caching:** News and leaderboard cached locally
3. **Code Splitting:** Large vendors split into separate chunks
4. **Background Refresh:** News updates without blocking UI
5. **Real-time Sync:** Leaderboard auto-refreshes every 10 seconds
6. **CSS Optimization:** Tailwind CSS purges unused styles
7. **Image Optimization:** Compressed avatars and thumbnails
8. **API Deduplication:** Service layer prevents duplicate requests

---

## Security Features

1. **Authentication:** Supabase handles password hashing and session management
2. **Authorization:** Protected routes require login
3. **Row Level Security (RLS):** Database policies limit data access
4. **HTTPS:** All production traffic encrypted
5. **Input Validation:** Frontend validates all user inputs
6. **Sanitization:** HTML content sanitized before display
7. **CORS:** Backend configured with proper CORS headers
8. **Environment Variables:** Secrets stored securely, not in code

---

## Conclusion

Cybersec Arena is a full-stack web application with:
- **Frontend:** React + TypeScript (user-facing)
- **Backend:** Node.js + Express (APIs)
- **Database:** Supabase PostgreSQL (data storage)
- **Authentication:** Supabase Auth (user login)
- **Deployment:** Docker + Electron (desktop)

The platform follows modern web development best practices with separation of concerns, component-based architecture, service layer for business logic, and comprehensive error handling.

