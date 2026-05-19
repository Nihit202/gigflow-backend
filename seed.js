/**
 * GigFlow — Database Seed Script
 * --------------------------------
 * Run: node seed.js
 * Make sure your backend .env is configured with MONGODB_URI
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// ── Inline models (no imports needed) ──────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    role: { type: String, enum: ['admin', 'sales'], default: 'sales' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    status: { type: String, enum: ['New', 'Contacted', 'Qualified', 'Lost'] },
    source: { type: String, enum: ['Website', 'Instagram', 'Referral'] },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Lead = mongoose.model('Lead', leadSchema);

// ── Sample Users ────────────────────────────────────────────────────────────

const USERS = [
  {
    name: 'Arjun Mehta',
    email: 'admin@gigflow.dev',
    password: 'Admin@1234',
    role: 'admin',
  },
  {
    name: 'Priya Sharma',
    email: 'priya@gigflow.dev',
    password: 'Sales@1234',
    role: 'sales',
  },
  {
    name: 'Rohan Das',
    email: 'rohan@gigflow.dev',
    password: 'Sales@1234',
    role: 'sales',
  },
];

// ── Sample Leads ────────────────────────────────────────────────────────────

const LEADS_TEMPLATE = [
  // New leads
  {
    name: 'Aarav Patel',
    email: 'aarav.patel@techcorp.in',
    status: 'New',
    source: 'Website',
    notes: 'Visited the pricing page 3 times. Interested in the enterprise plan.',
  },
  {
    name: 'Sneha Kapoor',
    email: 'sneha.k@designstudio.com',
    status: 'New',
    source: 'Instagram',
    notes: 'DM\'d us via Instagram after seeing the reel. Wants a demo call.',
  },
  {
    name: 'Vikram Nair',
    email: 'vikram@startupventures.io',
    status: 'New',
    source: 'Referral',
    notes: 'Referred by Ananya Singh. Looking for CRM for 15-person team.',
  },
  {
    name: 'Meera Joshi',
    email: 'meera.joshi@ecommercehub.com',
    status: 'New',
    source: 'Website',
    notes: 'Downloaded the whitepaper. Follow up in 2 days.',
  },
  {
    name: 'Kabir Malhotra',
    email: 'kabir@malhotragroup.co',
    status: 'New',
    source: 'Instagram',
    notes: 'Commented on sponsored post. Mid-sized textile business.',
  },
  {
    name: 'Tara Singh',
    email: 'tara.singh@freelance.dev',
    status: 'New',
    source: 'Referral',
    notes: 'Freelancer expanding her team. Needs 5 seats.',
  },

  // Contacted leads
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@fintech.in',
    status: 'Contacted',
    source: 'Website',
    notes: 'Called on Monday. Very interested. Sent pricing deck. Awaiting reply.',
  },
  {
    name: 'Ananya Iyer',
    email: 'ananya@iyer-consulting.com',
    status: 'Contacted',
    source: 'Referral',
    notes: 'Had a 30-min intro call. Evaluating 3 other tools. Check back next week.',
  },
  {
    name: 'Siddharth Rao',
    email: 'sidd.rao@cloudworks.io',
    status: 'Contacted',
    source: 'Instagram',
    notes: 'Replied to DM. Scheduled demo for Friday 3pm.',
  },
  {
    name: 'Nisha Gupta',
    email: 'nisha@guptaretail.com',
    status: 'Contacted',
    source: 'Website',
    notes: 'Email opened 4 times. No reply yet. Try WhatsApp.',
  },
  {
    name: 'Aryan Khanna',
    email: 'aryan.khanna@mediagroup.in',
    status: 'Contacted',
    source: 'Referral',
    notes: 'Intro call done. Needs approval from CFO. Timeline: 2 weeks.',
  },
  {
    name: 'Divya Menon',
    email: 'divya@menon-architecture.com',
    status: 'Contacted',
    source: 'Website',
    notes: 'Architecture firm. 8 employees. Contacted via email sequence.',
  },

  // Qualified leads
  {
    name: 'Aditya Bansal',
    email: 'aditya@bansaltech.com',
    status: 'Qualified',
    source: 'Referral',
    notes: 'Budget confirmed ₹2L/year. Decision maker in the call. Proposal sent.',
  },
  {
    name: 'Kavya Reddy',
    email: 'kavya.reddy@healthplus.in',
    status: 'Qualified',
    source: 'Website',
    notes: 'Healthcare startup. 40 users. Legal reviewing contract. Close expected Friday.',
  },
  {
    name: 'Ishaan Sharma',
    email: 'ishaan@sharmalogistics.com',
    status: 'Qualified',
    source: 'Instagram',
    notes: 'Logistics company. Ready to sign. Needs custom onboarding package.',
  },
  {
    name: 'Pooja Choudhary',
    email: 'pooja.c@edutechplatform.io',
    status: 'Qualified',
    source: 'Referral',
    notes: 'EdTech platform. 200+ users needed. Negotiating annual pricing.',
  },
  {
    name: 'Manav Kapoor',
    email: 'manav@kapoorinfra.co',
    status: 'Qualified',
    source: 'Website',
    notes: 'Infrastructure firm. Big deal — ₹5L ARR. Final call with CEO next Tuesday.',
  },

  // Lost leads
  {
    name: 'Ritu Agarwal',
    email: 'ritu@agarwaltextiles.com',
    status: 'Lost',
    source: 'Instagram',
    notes: 'Went with a competitor. Cheaper pricing was the reason. Revisit in 6 months.',
  },
  {
    name: 'Shiv Kumar',
    email: 'shiv.kumar@oldschoolbiz.com',
    status: 'Lost',
    source: 'Referral',
    notes: 'Not tech-savvy. Decided to stick with Excel. Not a fit right now.',
  },
  {
    name: 'Preethi Nambiar',
    email: 'preethi@nambiarconsult.in',
    status: 'Lost',
    source: 'Website',
    notes: 'Budget cut. Project put on hold until Q3. Keep warm.',
  },
  {
    name: 'Gaurav Sinha',
    email: 'gaurav@sinhaenterprises.com',
    status: 'Lost',
    source: 'Instagram',
    notes: 'No response after 4 follow-ups. Marking as lost. Try again in 3 months.',
  },
  {
    name: 'Falak Mirza',
    email: 'falak@mirzadesigns.in',
    status: 'Lost',
    source: 'Referral',
    notes: 'Chose in-house solution. Lost to build-vs-buy decision.',
  },
];

// ── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gigflow';
    console.log('\n🌱 GigFlow Seeder Starting...');
    console.log(`📦 Connecting to: ${uri}\n`);

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log('🗑️  Cleared existing users and leads\n');

    // Create users with hashed passwords
    console.log('👤 Creating users...');
    const createdUsers = [];
    for (const userData of USERS) {
      const hashed = await bcrypt.hash(userData.password, 12);
      const user = await User.create({ ...userData, password: hashed });
      createdUsers.push(user);
      console.log(`   ✓ ${user.name} (${user.role}) — ${user.email}`);
    }

    // Assign leads to users (distribute across sales users)
    const adminUser = createdUsers.find((u) => u.role === 'admin');
    const salesUsers = createdUsers.filter((u) => u.role === 'sales');

    console.log('\n📋 Creating leads...');
    let i = 0;
    for (const leadData of LEADS_TEMPLATE) {
      // Alternate between sales users; a few assigned to admin
      const assignTo = i % 5 === 0 ? adminUser : salesUsers[i % salesUsers.length];
      const lead = await Lead.create({ ...leadData, createdBy: assignTo._id });
      console.log(
        `   ✓ [${lead.status.padEnd(9)}] ${lead.name} — via ${lead.source}`
      );
      i++;
    }

    // Summary
    console.log('\n' + '═'.repeat(55));
    console.log('🎉 Seed complete!\n');
    console.log('📊 Summary:');
    console.log(`   Users created  : ${createdUsers.length}`);
    console.log(`   Leads created  : ${LEADS_TEMPLATE.length}`);
    console.log('\n🔑 Login credentials:');
    console.log('   ┌─────────────────────────────────────────────┐');
    for (const u of USERS) {
      const roleLabel = u.role === 'admin' ? '👑 Admin' : '💼 Sales';
      console.log(`   │ ${roleLabel.padEnd(10)} ${u.email.padEnd(24)} ${u.password} │`);
    }
    console.log('   └─────────────────────────────────────────────┘');
    console.log('\n🚀 Open http://localhost:3000 and log in!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
