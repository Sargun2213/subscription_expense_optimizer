import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for demo account...');

  // Demo user credentials
  const demoEmail = 'demo@suboptimizer.io';
  const demoPassword = 'DemoPassword123!';

  // Clean existing demo user if present
  const existing = await prisma.user.findUnique({
    where: { email: demoEmail }
  });

  if (existing) {
    console.log('Found existing demo user. Removing old records...');
    await prisma.user.delete({
      where: { email: demoEmail }
    });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(demoPassword, salt);

  const demoUser = await prisma.user.create({
    data: {
      email: demoEmail,
      name: 'Alex Rivera (Demo)',
      passwordHash,
      preferredCurrency: 'USD',
      timezone: 'America/New_York',
      preferences: {
        create: {
          emailNotifications: true,
          renewalAlertDays: 7,
          weeklyDigest: true,
          theme: 'light'
        }
      }
    }
  });

  console.log(`Created demo user: ${demoUser.email} (ID: ${demoUser.id})`);

  // Today's date reference
  const now = new Date();

  const addDays = (d: Date, days: number) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + days);
    return copy;
  };

  const subtractMonths = (d: Date, months: number) => {
    const copy = new Date(d);
    copy.setMonth(copy.getMonth() - months);
    return copy;
  };

  // Seed realistic subscriptions with various frequencies, usage assessments, and categories
  const sampleSubscriptions = [
    {
      name: 'GitHub Copilot Enterprise',
      category: 'Developer Tools',
      costAmount: 39.00,
      currency: 'USD',
      billingFrequency: 'MONTHLY',
      billingStartDate: subtractMonths(now, 10),
      nextBillingDate: addDays(now, 5),
      status: 'ACTIVE',
      paymentMethod: 'Corporate Visa ****4129',
      notes: 'Daily AI code completion and chat for backend team',
      usageAssessment: 'ACTIVE'
    },
    {
      name: 'AWS Cloud Hosting',
      category: 'Infrastructure',
      costAmount: 184.50,
      currency: 'USD',
      billingFrequency: 'MONTHLY',
      billingStartDate: subtractMonths(now, 14),
      nextBillingDate: addDays(now, 12),
      status: 'ACTIVE',
      paymentMethod: 'Corporate Amex ****9012',
      notes: 'Production clusters and RDS databases',
      usageAssessment: 'ACTIVE'
    },
    {
      name: 'Figma Organization',
      category: 'Design',
      costAmount: 90.00,
      currency: 'USD',
      billingFrequency: 'QUARTERLY',
      billingStartDate: subtractMonths(now, 9),
      nextBillingDate: addDays(now, 8),
      status: 'ACTIVE',
      paymentMethod: 'Mastercard ****3412',
      notes: 'Design system libraries and prototyping seats',
      usageAssessment: 'MODERATE'
    },
    {
      name: 'Netflix Premium (4K)',
      category: 'Streaming',
      costAmount: 22.99,
      currency: 'USD',
      billingFrequency: 'MONTHLY',
      billingStartDate: subtractMonths(now, 24),
      nextBillingDate: addDays(now, 3),
      status: 'ACTIVE',
      paymentMethod: 'Personal Visa ****8821',
      notes: 'Family entertainment profile',
      usageAssessment: 'ACTIVE'
    },
    {
      name: 'Hulu + Disney+ Bundle',
      category: 'Streaming',
      costAmount: 19.99,
      currency: 'USD',
      billingFrequency: 'MONTHLY',
      billingStartDate: subtractMonths(now, 6),
      nextBillingDate: addDays(now, 18),
      status: 'ACTIVE',
      paymentMethod: 'Personal Visa ****8821',
      notes: 'Secondary streaming bundle. Rarely watched in past 2 months.',
      usageAssessment: 'UNUSED' // Trigger optimizer recommendation!
    },
    {
      name: 'Dropbox Pro 2TB',
      category: 'Cloud Storage',
      costAmount: 119.88,
      currency: 'USD',
      billingFrequency: 'YEARLY',
      billingStartDate: subtractMonths(now, 11),
      nextBillingDate: addDays(now, 10), // Renews in 10 days!
      status: 'ACTIVE',
      paymentMethod: 'Paypal',
      notes: 'Legacy files backup. Switched most work to Google Drive.',
      usageAssessment: 'LOW' // Trigger optimizer recommendation for high cost + low usage & upcoming renewal!
    },
    {
      name: 'Google Workspace Business Standard',
      category: 'Cloud Storage',
      costAmount: 24.00,
      currency: 'USD',
      billingFrequency: 'MONTHLY',
      billingStartDate: subtractMonths(now, 18),
      nextBillingDate: addDays(now, 22),
      status: 'ACTIVE',
      paymentMethod: 'Corporate Visa ****4129',
      notes: 'Primary business email, Meet, and Drive storage',
      usageAssessment: 'ACTIVE'
    },
    {
      name: 'Spotify Family Plan',
      category: 'Entertainment',
      costAmount: 16.99,
      currency: 'USD',
      billingFrequency: 'MONTHLY',
      billingStartDate: subtractMonths(now, 30),
      nextBillingDate: addDays(now, 14),
      status: 'ACTIVE',
      paymentMethod: 'Apple Pay',
      notes: 'Family music streaming account',
      usageAssessment: 'ACTIVE'
    },
    {
      name: 'The New York Times All Access',
      category: 'News & Media',
      costAmount: 4.00,
      currency: 'USD',
      billingFrequency: 'WEEKLY',
      billingStartDate: subtractMonths(now, 4),
      nextBillingDate: addDays(now, 2),
      status: 'ACTIVE',
      paymentMethod: 'Apple Pay',
      notes: 'Weekly journalism subscription',
      usageAssessment: 'ACTIVE'
    },
    {
      name: 'Gym & Fitness Club Membership',
      category: 'Health & Wellness',
      costAmount: 85.00,
      currency: 'USD',
      billingFrequency: 'MONTHLY',
      billingStartDate: subtractMonths(now, 5),
      nextBillingDate: addDays(now, 1),
      status: 'PAUSED',
      paymentMethod: 'Direct Debit',
      notes: 'Currently traveling; paused for summer quarter',
      usageAssessment: 'LOW'
    },
    {
      name: 'Adobe Creative Cloud All Apps',
      category: 'Design',
      costAmount: 59.99,
      currency: 'USD',
      billingFrequency: 'MONTHLY',
      billingStartDate: subtractMonths(now, 8),
      nextBillingDate: addDays(now, 15),
      status: 'ACTIVE',
      paymentMethod: 'Corporate Amex ****9012',
      notes: 'Only using Photoshop occasionally. Illustrator and Premiere unused.',
      usageAssessment: 'LOW' // Optimizer trigger: high cost with low usage
    }
  ];

  for (const item of sampleSubscriptions) {
    await prisma.subscription.create({
      data: {
        userId: demoUser.id,
        ...item
      }
    });
  }

  console.log(`Seeded ${sampleSubscriptions.length} subscriptions for demo user.`);
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
