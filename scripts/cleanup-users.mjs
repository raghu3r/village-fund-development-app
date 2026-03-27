// scripts/cleanup-users.mjs
// Deletes ALL Firebase Auth users + Firestore member docs
// that are NOT in your KEEP_EMAILS list below.
// ─────────────────────────────────────────────────────────

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth }             from 'firebase-admin/auth';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }        from 'fs';
import { dirname, join }       from 'path';
import { fileURLToPath }       from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));
initializeApp({ credential: cert(sa) });

const auth = getAuth();
const db   = getFirestore();

// ─── EDIT THIS LIST — emails you want to KEEP ────────────
const KEEP_EMAILS = [
  'trrr.1993@gmail.com',       // Raghu Ram Reddy T (Admin)
  'tckr.1990@gmail.com',       // Chaitanya Kumar Reddy
  'sivakumarreddychalla@gmail.com',
  'challasarvesh7@gmail.com',
  'sivaram4@gmail.com',
  'challaraghuram45@gmail.com',
  'yogi.challa@gmail.com',       // Yughandar Reddy (Admin)
];
// ─────────────────────────────────────────────────────────

const keepSet = new Set(KEEP_EMAILS.map(e => e.toLowerCase().trim()));

console.log('\n🌿 Moolam — Cleanup Script');
console.log(`   Keeping ${keepSet.size} members, deleting the rest...\n`);

// ── 1. Get all Auth users ─────────────────────────────────
let allUsers = [];
let pageToken;
do {
  const result = await auth.listUsers(1000, pageToken);
  allUsers = allUsers.concat(result.users);
  pageToken = result.pageToken;
} while (pageToken);

console.log(`📋 Total users in Firebase Auth: ${allUsers.length}`);

// ── 2. Separate keep vs delete ────────────────────────────
const toDelete = allUsers.filter(u => !keepSet.has(u.email?.toLowerCase()));
const toKeep   = allUsers.filter(u =>  keepSet.has(u.email?.toLowerCase()));

console.log(`✅ Keeping  : ${toKeep.length} users`);
console.log(`🗑  Deleting : ${toDelete.length} users\n`);

if (toDelete.length === 0) {
  console.log('Nothing to delete — all clean! ✅');
  process.exit(0);
}

// ── 3. Show what will be deleted ─────────────────────────
console.log('Users to be deleted:');
toDelete.forEach(u => console.log(`  ✗  ${u.email || '(no email)'} — ${u.uid}`));
console.log('');

// ── 4. Delete Auth accounts ───────────────────────────────
console.log('🔐 Deleting Auth accounts...');
const uidsToDelete = toDelete.map(u => u.uid);

// Firebase allows batch delete of up to 1000 at a time
for (let i = 0; i < uidsToDelete.length; i += 1000) {
  const batch = uidsToDelete.slice(i, i + 1000);
  const result = await auth.deleteUsers(batch);
  console.log(`   Deleted ${result.successCount} accounts`);
  if (result.failureCount > 0) {
    console.log(`   ⚠️  Failed: ${result.failureCount}`);
    result.errors.forEach(e => console.log('   ', e.error.message));
  }
}

// ── 5. Delete Firestore member docs ───────────────────────
console.log('\n📄 Cleaning Firestore member docs...');
const membersSnap = await db.collection('members').get();
let deletedDocs = 0;

for (const docSnap of membersSnap.docs) {
  const data = docSnap.data();
  const email = data.email?.toLowerCase();
  if (!keepSet.has(email)) {
    await db.collection('members').doc(docSnap.id).delete();
    console.log(`   🗑  Deleted doc: ${data.email || docSnap.id}`);
    deletedDocs++;
  }
}

console.log(`   Deleted ${deletedDocs} Firestore docs`);

// ── 6. Summary ────────────────────────────────────────────
console.log('\n✅ Cleanup complete!');
console.log(`   Auth accounts kept  : ${toKeep.length}`);
console.log(`   Auth accounts deleted: ${toDelete.length}`);
console.log(`   Firestore docs deleted: ${deletedDocs}`);
console.log('\n🌿 Only your members remain.\n');