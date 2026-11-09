import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌿 Seeding BOTANIQUE database...\n');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'face-oils' },
      update: {},
      create: { name: 'Face Oils', slug: 'face-oils', description: 'Botanical face oils', sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'balms' },
      update: {},
      create: { name: 'Balms', slug: 'balms', description: 'Repair and nourishing balms', sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'gels' },
      update: {},
      create: { name: 'Gels', slug: 'gels', description: 'Soothing gels', sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'serums' },
      update: {},
      create: { name: 'Serums', slug: 'serums', description: 'Targeted treatment serums', sortOrder: 4 },
    }),
    prisma.category.upsert({
      where: { slug: 'lip-care' },
      update: {},
      create: { name: 'Lip Care', slug: 'lip-care', description: 'Botanical lip care', sortOrder: 5 },
    }),
  ]);

  const [faceOilsCat, balmsCat, gelsCat, serumsCat, lipCareCat] = categories;

  // Create products
  const products = [
    {
      name: 'Rose Face Oil',
      slug: 'rose-face-oil',
      shortDesc: 'A lightweight botanical face oil formulated with Rosehip, Jojoba, and Squalane.',
      description: `Rose Face Oil is a thoughtfully formulated botanical face oil from BOTANIQUE. It is composed of a selection of plant-derived oils and botanical extracts.

Ingredients include Squalane, known for its lightweight texture; Jojoba Seed Oil, a wax ester similar to the skin's natural sebum; Rosehip Seed Oil, rich in essential fatty acids; Rose Extract for its botanical properties; and Tocopherol (a form of Vitamin E), which serves as an antioxidant in the formulation.

This product has not been clinically tested or dermatologically approved. Claims about skin improvement are not made.

Recommended for adult external use only. Perform a patch test before use. Not suitable for use on broken or inflamed skin. Keep out of reach of children.`,
      categoryId: faceOilsCat.id,
      price: 1450,
      size: '30',
      unit: 'ml',
      stock: 50,
      sku: 'BOT-RFO-30',
      isPublished: true,
      isFeatured: true,
      safetyNotes: 'For external use only. Perform a patch test before first use. If irritation occurs, discontinue use. Keep out of reach of children.',
      sortOrder: 1,
      ingredients: [
        { name: 'Squalane', sortOrder: 1 },
        { name: 'Jojoba Seed Oil', sortOrder: 2 },
        { name: 'Rosehip Seed Oil', sortOrder: 3 },
        { name: 'Rose Extract', sortOrder: 4 },
        { name: 'Tocopherol', sortOrder: 5 },
      ],
    },
    {
      name: 'Shea Repair Balm',
      slug: 'shea-repair-balm',
      shortDesc: 'A rich botanical balm with Shea Butter, Calendula, and Tocopherol.',
      description: `Shea Repair Balm is a dense botanical balm from BOTANIQUE, formulated with plant butters, natural wax, and botanical extracts.

The formulation includes Shea Butter, a plant-derived butter; Sunflower Seed Oil; Beeswax, which provides the balm's structure; Calendula Extract; and Tocopherol as an antioxidant component.

This product contains Beeswax and is not suitable for those following a vegan lifestyle.

This product has not been clinically tested or dermatologically approved.

For external use only. Perform a patch test before first use. If irritation occurs, discontinue use. Keep out of reach of children.`,
      categoryId: balmsCat.id,
      price: 850,
      size: '50',
      unit: 'g',
      stock: 60,
      sku: 'BOT-SRB-50',
      isPublished: true,
      isFeatured: true,
      safetyNotes: 'For external use only. Contains Beeswax — not vegan. Patch test before first use.',
      sortOrder: 2,
      ingredients: [
        { name: 'Shea Butter', sortOrder: 1 },
        { name: 'Sunflower Seed Oil', sortOrder: 2 },
        { name: 'Beeswax', sortOrder: 3 },
        { name: 'Calendula Extract', sortOrder: 4 },
        { name: 'Tocopherol', sortOrder: 5 },
      ],
    },
    {
      name: 'Aloe Calm Gel',
      slug: 'aloe-calm-gel',
      shortDesc: 'A lightweight botanical gel with Aloe Vera, Glycerin, and Panthenol.',
      description: `Aloe Calm Gel is a lightweight botanical gel from BOTANIQUE, composed of Aloe Vera Leaf Juice, Glycerin, Xanthan Gum (a gelling agent), Panthenol (Provitamin B5), and a preservative system.

The preservative system composition is not specified in the current working formulation.

This product is not preservative-free.

This product has not been clinically tested or dermatologically approved. No claims are made about its suitability for specific skin conditions.

For external use only. Perform a patch test before first use. If irritation occurs, discontinue use. Keep out of reach of children.`,
      categoryId: gelsCat.id,
      price: 650,
      size: '50',
      unit: 'g',
      stock: 75,
      sku: 'BOT-ACG-50',
      isPublished: true,
      isFeatured: true,
      safetyNotes: 'For external use only. Contains a preservative system. Patch test before first use.',
      sortOrder: 3,
      ingredients: [
        { name: 'Aloe Vera Leaf Juice', sortOrder: 1 },
        { name: 'Glycerin', sortOrder: 2 },
        { name: 'Xanthan Gum', sortOrder: 3 },
        { name: 'Panthenol', sortOrder: 4 },
        { name: 'Preservative system (composition not specified)', sortOrder: 5 },
      ],
    },
    {
      name: 'Vitamin Glow Serum',
      slug: 'vitamin-glow-serum',
      shortDesc: 'A lightweight botanical serum with Niacinamide, Hyaluronate, and Panthenol.',
      description: `Vitamin Glow Serum is a lightweight serum from BOTANIQUE formulated with Glycerin, Niacinamide, Panthenol, Sodium Hyaluronate, and a preservative system.

Niacinamide is a form of Vitamin B3. Sodium Hyaluronate is a salt form of Hyaluronic Acid. Panthenol is Provitamin B5. The preservative system composition is not specified in the current working formulation.

This product is not preservative-free.

No ingredient concentrations are stated. This product has not been clinically tested or dermatologically approved.

For external use only. Perform a patch test before first use. If irritation occurs, discontinue use. Keep out of reach of children.`,
      categoryId: serumsCat.id,
      price: 1100,
      size: '30',
      unit: 'ml',
      stock: 45,
      sku: 'BOT-VGS-30',
      isPublished: true,
      isFeatured: true,
      safetyNotes: 'For external use only. Contains a preservative system. Patch test before first use.',
      sortOrder: 4,
      ingredients: [
        { name: 'Glycerin', sortOrder: 1 },
        { name: 'Niacinamide', sortOrder: 2 },
        { name: 'Panthenol', sortOrder: 3 },
        { name: 'Sodium Hyaluronate', sortOrder: 4 },
        { name: 'Preservative system (composition not specified)', sortOrder: 5 },
      ],
    },
    {
      name: 'Herbal Lip Balm',
      slug: 'herbal-lip-balm',
      shortDesc: 'A nourishing botanical lip balm with Beeswax, Shea Butter, and Coconut Oil.',
      description: `Herbal Lip Balm is a botanical lip care product from BOTANIQUE, formulated with Beeswax, Shea Butter, Coconut Oil, Sunflower Seed Oil, and Tocopherol.

This product contains Beeswax and is not suitable for those following a vegan lifestyle.

This product has not been clinically tested or dermatologically approved.

For external use on lips only. Perform a patch test before first use. Discontinue if irritation or allergic reaction occurs. Keep out of reach of children.`,
      categoryId: lipCareCat.id,
      price: 350,
      size: '15',
      unit: 'g',
      stock: 100,
      sku: 'BOT-HLB-15',
      isPublished: true,
      isFeatured: false,
      safetyNotes: 'For external use on lips only. Contains Beeswax — not vegan. Patch test before first use.',
      sortOrder: 5,
      ingredients: [
        { name: 'Beeswax', sortOrder: 1 },
        { name: 'Shea Butter', sortOrder: 2 },
        { name: 'Coconut Oil', sortOrder: 3 },
        { name: 'Sunflower Seed Oil', sortOrder: 4 },
        { name: 'Tocopherol', sortOrder: 5 },
      ],
    },
  ];

  for (const product of products) {
    const { ingredients, ...productData } = product;
    const existing = await prisma.product.findUnique({ where: { slug: productData.slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          ...productData,
          ingredients: { create: ingredients },
        },
      });
      console.log(`  ✅ Created product: ${productData.name}`);
    } else {
      console.log(`  ⏭️  Product already exists: ${productData.name}`);
    }
  }

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@botanique.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Botanique2024';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashed,
        firstName: 'Admin',
        lastName: 'BOTANIQUE',
        role: 'ADMIN',
      },
    });
    console.log(`  ✅ Created admin user: ${adminEmail}`);
  }

  // Default site settings
  const defaultSettings = [
    { key: 'site_name', value: 'BOTANIQUE', description: 'Website name' },
    { key: 'support_email', value: '', description: 'Support email (configure before publishing)' },
    { key: 'support_phone', value: '', description: 'Support phone (configure before publishing)' },
    { key: 'announcement_text', value: 'Free delivery on orders above ₹999 within Bengaluru', description: 'Announcement bar text' },
    { key: 'announcement_active', value: 'false', description: 'Show announcement bar' },
    { key: 'currency', value: 'INR', description: 'Site currency' },
    { key: 'returns_policy_active', value: 'false', description: 'Returns policy is live (requires business approval)' },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // Default FAQs
  const faqs = [
    { question: 'Are BOTANIQUE products vegan?', answer: 'The Rose Face Oil, Aloe Calm Gel, and Vitamin Glow Serum do not contain animal-derived ingredients based on current formulations. The Shea Repair Balm and Herbal Lip Balm contain Beeswax and are not vegan.', category: 'Products', sortOrder: 1 },
    { question: 'Do you test on animals?', answer: 'BOTANIQUE does not test its products on animals.', category: 'Products', sortOrder: 2 },
    { question: 'Are your products safe for sensitive skin?', answer: 'We recommend performing a patch test on a small area of skin before first use. If you have specific skin concerns, conditions, or known allergies, please consult a dermatologist before use. Our products are not clinically tested or dermatologically approved.', category: 'Safety', sortOrder: 3 },
    { question: 'How should I do a patch test?', answer: 'Apply a small amount of product to the inner forearm or behind the ear. Leave for 24 hours without washing the area. If you experience any redness, itching, burning, or discomfort, do not use the product and consult a healthcare professional.', category: 'Safety', sortOrder: 4 },
    { question: 'What are your shipping charges and timelines?', answer: 'Delivery charges and timelines depend on your delivery location and are configured by our team. We currently deliver to serviceable PIN codes within India. Estimated delivery for Bengaluru is 2–5 business days after fulfillment, and 4–8 business days for other locations. These are estimates and not guaranteed delivery commitments.', category: 'Shipping', sortOrder: 5 },
    { question: 'What is your return policy?', answer: 'Our returns process is currently under review. We consider return requests for unopened, unused products within seven calendar days of delivery. This policy is pending final approval by the business. Please contact our support team to understand the current return process before returning any item.', category: 'Returns', sortOrder: 6 },
    { question: 'How do I track my order?', answer: 'Once your order has been shipped, you will receive tracking information from us. You can also view your order status in your account under Order History.', category: 'Orders', sortOrder: 7 },
    { question: 'Can I cancel my order?', answer: 'Cancellation requests can be submitted for orders that have not yet been processed for fulfillment. Please contact us as soon as possible if you wish to cancel. Once an order has been dispatched, cancellation is not possible.', category: 'Orders', sortOrder: 8 },
  ];

  for (const faq of faqs) {
    const existing = await prisma.fAQ.findFirst({ where: { question: faq.question } });
    if (!existing) {
      await prisma.fAQ.create({ data: faq });
    }
  }

  // Default shipping zones
  const zones = [
    {
      name: 'Bengaluru',
      pincodes: ['560001', '560002', '560003', '560004', '560005', '560006', '560007', '560008', '560009', '560010', '560011', '560012', '560013', '560014', '560015', '560016', '560017', '560018', '560019', '560020', '560021', '560022', '560023', '560024', '560025', '560026', '560027', '560028', '560029', '560030', '560032', '560034', '560037', '560038', '560040', '560041', '560043', '560045', '560047', '560048', '560049', '560050', '560051', '560052', '560053', '560054', '560055', '560056', '560057', '560058', '560059', '560060', '560061', '560062', '560063', '560064', '560065', '560066', '560067', '560068', '560069', '560070', '560071', '560072', '560073', '560074', '560075', '560076', '560077', '560078', '560079', '560080', '560081', '560082', '560083', '560084', '560085', '560086', '560087', '560088', '560089', '560090', '560091', '560092', '560093', '560094', '560095', '560096', '560097', '560098', '560099', '560100'],
      deliveryCharge: 0,
      estimatedDays: '2–5 business days after fulfillment',
    },
    {
      name: 'Rest of India',
      pincodes: [],
      deliveryCharge: 80,
      estimatedDays: '4–8 business days after fulfillment',
    },
  ];

  for (const zone of zones) {
    const existing = await prisma.shippingZone.findFirst({ where: { name: zone.name } });
    if (!existing) {
      await prisma.shippingZone.create({ data: zone });
      console.log(`  ✅ Created shipping zone: ${zone.name}`);
    }
  }

  console.log('\n🌿 BOTANIQUE database seeded successfully!\n');
  console.log(`   Admin login: ${adminEmail}`);
  console.log(`   Password:    ${adminPassword}`);
  console.log('\n   ⚠️  Change the admin password before deploying to production.\n');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

