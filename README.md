# 🌱 Moolam — మూలం

> **"Far from home. Never from roots."**
> Reddy Community Fund — Progressive Web App

A mobile-first PWA for 15 village members to track monthly contributions (₹1,000/month), development plans, and announcements. Backed by Firebase (100% free).

---

## ✨ Features

| Feature | Members | Admin / Treasurer |
|---|---|---|
| Install as phone app (PWA) | ✅ | ✅ |
| View total fund collected | ✅ | ✅ |
| See own payment status | ✅ | ✅ |
| Month-wise contributions | ✅ | ✅ |
| Mark / unmark payments | ❌ | ✅ |
| View & add development plans | ✅ | ✅ add |
| Advance plan status | ❌ | ✅ |
| View & post announcements | ✅ | ✅ post |
| Secure login (email + password) | ✅ | ✅ |
| Works offline (cached shell) | ✅ | ✅ |

---

## 🚀 Deploy in 8 Steps

### STEP 1 — Install Node.js
https://nodejs.org → download LTS (v18+)

### STEP 2 — Create Firebase Project (FREE)
1. Go to https://console.firebase.google.com
2. **Add project** → name it `moolam` → proceed
3. Click **Web icon (</>)** → Register app as `moolam-web`
4. Copy the `firebaseConfig` block (you'll need it in Step 4)

### STEP 3 — Enable Firebase Services

**Authentication:**
- Left sidebar → Authentication → Get Started
- Email/Password → Enable → Save

**Firestore Database:**
- Left sidebar → Firestore Database → Create Database
- Production mode → Region: `asia-south1` (India) → Enable

### STEP 4 — Configure .env
```bash
cp .env.example .env
```
Fill in `.env` with your Firebase values:
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=moolam.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=moolam
VITE_FIREBASE_STORAGE_BUCKET=moolam.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### STEP 5 — Seed the Database
Download a service account key:
1. Firebase Console → Project Settings (⚙️) → Service Accounts
2. Generate new private key → save as `scripts/serviceAccountKey.json`
3. In `scripts/seed.mjs`, uncomment Option B lines (serviceAccount import)

```bash
npm install
npm install firebase-admin
node scripts/seed.mjs
```
This creates all 15 Auth accounts + Firestore data.

### STEP 6 — Deploy Firestore Rules
Firebase Console → Firestore → Rules tab → paste `firestore.rules` → Publish

### STEP 7 — Build & Deploy
```bash
npm install -g firebase-tools
firebase login
firebase use --add          # select your moolam project
npm run build
firebase deploy --only hosting
```
🎉 Live at: `https://moolam.web.app`

### STEP 8 — Share with Members
Send each member:
- App link: `https://reddys-moolam.web.app`
- Their email & password (privately, via WhatsApp)

---

## 📲 How Members Install It (PWA)

**Android (Chrome):**
1. Open `https://moolam.web.app` in Chrome
2. Tap the "Install Moolam App" banner that appears
3. Or: 3-dot menu → "Add to Home screen"
4. Moolam icon appears on home screen ✅

**iPhone (Safari):**
1. Open `https://moolam.web.app` in Safari
2. Tap Share button (📤)
3. Tap "Add to Home Screen"
4. Tap "Add" — Moolam icon appears ✅

---

## 👥 Member Login Credentials

> ⚠️ Share passwords privately (one by one on WhatsApp).
> Ask each member to change their password after first login.

---

## ✏️ Customise for Your Group

1. **Edit member names/emails** → `src/data/members.js`
2. **Change monthly amount** → `MONTHLY_AMOUNT` in `src/data/members.js`
3. **Change admin** → `ADMIN_EMAILS` in `src/data/members.js`
4. Then re-run `node scripts/seed.mjs`

---

## 💰 Total Cost → ₹0/month

Firebase free (Spark) plan covers this easily:
- Auth: free up to 10,000 users/month
- Firestore: free 50,000 reads/day, 20,000 writes/day
- Hosting: free 10 GB/month bandwidth

---

## 📁 Project Structure

```
moolam/
├── public/
│   ├── manifest.json      ← PWA manifest
│   ├── sw.js              ← Service Worker (offline cache)
│   ├── icon-192.png       ← App icon
│   ├── icon-512.png       ← App icon (large)
│   └── icon-180.png       ← Apple touch icon
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Layout.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Contributions.jsx
│   │   ├── Plans.jsx
│   │   ├── Announcements.jsx
│   │   └── InstallPrompt.jsx  ← "Add to Home Screen" banner
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useToast.js
│   ├── data/members.js    ← Edit member names here
│   ├── firebase.js
│   ├── App.jsx
│   └── index.css
├── scripts/seed.mjs       ← One-time DB setup
├── firestore.rules
├── firebase.json
└── .env.example
```

---

*Moolam మూలం v1.0 — Built with React + Vite + Firebase*
