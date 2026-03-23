// src/data/members.js
// ─────────────────────────────────────────────────────────────
//  UPDATE these names, emails & roles for your actual group.
//  Each member will sign in with their email + a password
//  that YOU set for them via Firebase Console → Authentication.
// ─────────────────────────────────────────────────────────────

export const MEMBERS_SEED = [
  { name: 'Raghu Ram Reddy T',     email: 'trrr.1993@gmail.com',  password: 'Moolam@1234',  role: 'Admin / Treasurer', initials: 'RRR' },
  { name: 'Chaitanya Kumar Reddy',   email: 'tckr.1990@gmail.com',  password: 'Moolam@1234',  role: 'Member',            initials: 'CKR' },
  { name: 'Siva Kumar Reddy',   email: 'sivakumarreddychalla@gmail.com', password: 'Moolam@1234',  role: 'Member',            initials: 'SKR' },
  { name: 'Sarvesh Reddy',     email: 'challasarvesh7@gmail.com',  password: 'Moolam@1234',  role: 'Member',            initials: 'SR' },
  { name: 'Sivaram Reddy',     email: 'sivaram4@gmail.com',  password: 'Moolam@1234',  role: 'Member',            initials: 'SRR' },
  { name: 'Chinnu',     email: 'challaraghuram45@gmail.com',  password: 'Moolam@1234',  role: 'Member',            initials: 'CRR' },
];

// Months the fund is active (extend as needed)
export const FUND_MONTHS = [
  "Apr '26", "May '26", "Jun '26", "Jul '26",
  "Aug '26", "Sep '26", "Oct '26", "Nov '26",
  "Dec '26", "Jan '27", "Feb '27", "Mar '27",
];

export const MONTHLY_AMOUNT = 1000; // ₹ per member per month

export const ADMIN_EMAILS = ['trrr.1993@gmail.com']; // emails with admin powers
