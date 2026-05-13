# Office Work Tracker

A production-ready React + Firebase work log app for daily tasks, meetings, time logs, history, stats, search, exports, and mobile-first tracking.

## Setup

1. Clone / download project
2. npm install
3. Copy .env.example to .env.local
4. Fill Firebase config from:
   console.firebase.google.com →
   Project Settings → General → Your apps
5. Enable Firestore in Firebase console
6. Enable Google Auth in Firebase console
7. npm run dev → open localhost:5173

## Firebase

Project ID: `office-work-tracker-1f186`

Client-side Firebase configuration is read from `.env.local`, with the project's Web app config included as a fallback for local development. Do not place service account credentials in this web app.

If the browser shows `auth/invalid-api-key`, your `.env.local` is missing or has the wrong Web app config. Use Firebase Console → Project Settings → General → Your apps, then copy the Web config values into `.env.local`. A Firebase service account JSON/private key is not valid for this React browser app.

Firestore security rules to paste in Firebase Console → Firestore → Rules:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write:
        if request.auth != null &&
           request.auth.uid == userId;
    }
  }
}
```

## Scripts

- `npm run dev` starts the local app at `localhost:5173`
- `npm run build` runs TypeScript checks and creates the production bundle
- `npm run preview` serves the production bundle locally

## Notes

- Data is stored under `users/{userId}/entries/{entryId}`.
- Firestore reads are manual page-load or button-triggered fetches.
- CSV export includes a UTF-8 BOM for Hindi and Devanagari support.
