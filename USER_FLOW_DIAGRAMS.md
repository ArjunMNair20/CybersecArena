# User Flow Diagrams (User-facing actions only)

These diagrams show only what the user does — no internal services or implementation details.

## Block Diagram (user actions)

```mermaid
flowchart LR
  A[Visit site / Landing page] --> B{New or returning?}
  B -- New --> C[Sign up]
  B -- Returning --> D[Login]
  C --> E[Dashboard]
  D --> E[Dashboard]
  E --> F[CTF]
  E --> G[Phish Hunt]
  E --> H[Tools]
  F --> I[Play challenge]
  G --> J[Play phishing simulation]
  H --> K[Open toolset]
  I --> L[View profile / Leaderboard]
  J --> L
  K --> L
```

## Flowchart (linear user journey)

```mermaid
flowchart TD
  Start([Start]) --> Visit[Visit site]
  Visit --> NewUser{New user?}
  NewUser -- Yes --> Signup[Signup]
  NewUser -- No --> Login[Login]
  Signup --> Dashboard[Dashboard]
  Login --> Dashboard
  Dashboard --> Choice{Choose activity}
  Choice --> CTF[CTF]
  Choice --> Phish[Phish Hunt]
  Choice --> Tools[Tools]
  CTF --> Participate[Participate in challenge]
  Phish --> Participate
  Tools --> UseTools[Use tools]
  Participate --> Profile[View profile / Leaderboard]
  UseTools --> Profile
  Profile --> Logout[Logout]
  Logout --> End([End])
```

## Notes
- Shows only user-visible steps: signup/login → dashboard → select CTF/Phish Hunt/Tools → participate → view profile/leaderboard → logout.

