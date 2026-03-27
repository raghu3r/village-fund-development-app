// scripts/seed.mjs
// ─────────────────────────────────────────────────────────────────────────────
//  Run ONCE after you create your Firebase project to:
//    1. Create Firebase Auth accounts for all 15 members
//    2. Write their profile documents into Firestore /members/{uid}
//    3. Seed the initial development plans
//    4. Seed welcome announcement
//
//  Usage:
//    node scripts/seed.mjs
//
//  Requirements:
//    npm install firebase-admin   (run from project root)
//    Set GOOGLE_APPLICATION_CREDENTIALS env var to your service-account JSON
//    OR place serviceAccountKey.json in this folder and update the path below.
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth }             from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync }        from 'fs';
import { fileURLToPath }       from 'url';
import { dirname, join }       from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load service account ──────────────────────────────────────────────────────
// Option A: set env var GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json
// Option B: put serviceAccountKey.json next to this file and uncomment below:
const serviceAccount = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

// initializeApp();   // uses GOOGLE_APPLICATION_CREDENTIALS automatically
const adminAuth = getAuth();
const db        = getFirestore();

// ── Member definitions ────────────────────────────────────────────────────────
const MEMBERS = [
  { name: 'Raghu Ram Reddy T',     email: 'trrr.1993@gmail.com', password: 'Moolam@1234',   role: 'Admin / Treasurer', initials: 'RRR' },
  { name: 'Chaitanya Kumar Reddy',   email: 'tckr.1990@gmail.com', password: 'Moolam@1234',  role: 'Member',            initials: 'CKR' },
  { name: 'Siva Kumar Reddy',   email: 'sivakumarreddychalla@gmail.com', password: 'Moolam@1234', role: 'Member',            initials: 'SKR' },
  { name: 'Sarvesh Reddy',     email: 'challasarvesh7@gmail.com',  password: 'Moolam@1234',  role: 'Member',            initials: 'SR' },
  { name: 'Sivaram Reddy',     email: 'sivaram4@gmail.com',  password: 'Moolam@1234',  role: 'Member',            initials: 'SRR' },
  { name: 'Chinnu',     email: 'challaraghuram45@gmail.com',  password: 'Moolam@1234',  role: 'Member',            initials: 'CRR' },
  { name: 'Yughandar Reddy',     email: 'yogi.challa@gmail.com',  password: 'Moolam@1234',  role: 'Admin / Treasurer',            initials: 'YR' },
];

// ── Initial plans ─────────────────────────────────────────────────────────────
const INITIAL_PLANS = [
  // { name: 'Village Borewells',      icon: '💧', desc: 'Drill 2 borewells for clean drinking water supply to all households.', status: 'planned', budget: TBD, category: 'Water'          },
  // { name: 'Street Lights (Solar)',  icon: '💡', desc: 'Install solar-powered LED street lights on main road and 3 lanes.',    status: 'planned', budget: 30000, category: 'Infrastructure' },
  // { name: 'Youth Sports Ground',    icon: '⚽', desc: 'Level the vacant land near temple and create a basic sports ground.',  status: 'planned', budget: 25000, category: 'Youth'          },
  { name: 'Village Library Corner', icon: '📚', desc: 'Set up a small reading corner with books and digital access.',         status: 'planned', budget: 15000, category: 'Education'      },
  { name: 'Chinta chettu arugu Repair',  icon: '🛕', desc: 'Repair and whitewash the old arugu',      status: 'planned',    budget: 1000, category: 'Culture'        },
  // { name: 'Monthly Sanitation Drive', icon: '🧹', desc: 'Monthly cleanliness drive and waste-management awareness.',          status: 'ongoing', budget: 8000,  category: 'Health'         },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

async function createMember(m) {
  let uid;
  try {
    const existing = await adminAuth.getUserByEmail(m.email);
    uid = existing.uid;
    // ← ADD THIS LINE to always update password
    await adminAuth.updateUser(uid, { password: m.password });
    console.log(`  ↩  Auth exists (password updated): ${m.email}`);
  } catch {
    const created = await adminAuth.createUser({ 
      email: m.email, 
      password: m.password, 
      displayName: m.name 
    });
    uid = created.uid;
    console.log(`  ✅ Auth created: ${m.email}`);
  }

  await db.collection('members').doc(uid).set({
    name:     m.name,
    email:    m.email,
    role:     m.role,
    initials: m.initials || getInitials(m.name),
    joinedAt: Timestamp.now(),
  }, { merge: true });

  console.log(`  📄 Firestore member doc written: ${m.name}`);
  return uid;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌿  Moolam మూలం — Database Seed Script\n');

  // 1. Create members
  console.log('👥  Creating member accounts…');
  for (const m of MEMBERS) await createMember(m);

  // 2. Seed plans
  console.log('\n🗺   Seeding development plans…');
  const plansRef = db.collection('plans');
  for (const p of INITIAL_PLANS) {
    await plansRef.add({ ...p, createdAt: Timestamp.now() });
    console.log(`  ✅ Plan: ${p.name}`);
  }

  // 3. Seed welcome announcement
  console.log('\n📢  Seeding welcome announcement…');
  await db.collection('announcements').add({
    title:     'Welcome to Gram Sabha Fund! 🎉',
    body:      'All members have successfully joined. We will start collecting ₹1,000/month from April 2026. Check the Funds tab to track contributions and the Plans tab to see our development roadmap.',
    author:    'RaghuRam Reddy',
    createdAt: Timestamp.now(),
  });

  console.log('\n✅  Seed complete! All members, plans, and announcements created.\n');
  console.log('📋  Member login credentials:\n');
  MEMBERS.forEach(m => {
    console.log(`  ${m.name.padEnd(18)} | ${m.email.padEnd(28)} | ${m.password}`);
  });
  console.log('\n⚠️   Share passwords privately with each member and ask them to change it.\n');
}

main().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
