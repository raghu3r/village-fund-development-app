// scripts/clear-payments.mjs
// Clears all payment records from Firestore /payments collection

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const serviceAccount = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

async function clearPayments() {
  console.log('\n🗑️   Clearing all payment records…\n');
  
  const paymentsRef = db.collection('payments');
  const snapshot = await paymentsRef.get();
  
  if (snapshot.empty) {
    console.log('✅ No payment records found. Database is clean!');
    return;
  }
  
  let count = 0;
  for (const doc of snapshot.docs) {
    await doc.ref.delete();
    console.log(`  🗑️   Deleted: ${doc.id}`);
    count++;
  }
  
  console.log(`\n✅ Cleared ${count} payment document(s).\n`);
}

clearPayments().catch(err => { console.error('❌ Error:', err); process.exit(1); });
