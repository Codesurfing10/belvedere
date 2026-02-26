import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const ownerHash = await bcrypt.hash("password", 10);
  const guestHash = await bcrypt.hash("password", 10);
  const adminHash = await bcrypt.hash("password", 10);
  const managerHash = await bcrypt.hash("password", 10);

  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      email: "owner@example.com",
      name: "Alice Owner",
      role: "OWNER",
      passwordHash: ownerHash,
    },
  });

  const guest = await prisma.user.upsert({
    where: { email: "guest@example.com" },
    update: {},
    create: {
      email: "guest@example.com",
      name: "Bob Guest",
      role: "GUEST",
      passwordHash: guestHash,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Carol Admin",
      role: "ADMIN",
      passwordHash: adminHash,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: {},
    create: {
      email: "manager@example.com",
      name: "Dave Manager",
      role: "MANAGER",
      passwordHash: managerHash,
    },
  });

  const propertyManager = await prisma.propertyManager.upsert({
    where: { userId: managerUser.id },
    update: {},
    create: {
      userId: managerUser.id,
      bio: "Experienced vacation rental manager with 10+ years in the Northeast region.",
      rating: 4.8,
      reviewCount: 24,
    },
  });

  await prisma.serviceRegion.deleteMany({ where: { managerId: propertyManager.id } });
  await prisma.serviceRegion.createMany({
    data: [
      { managerId: propertyManager.id, region: "Northeast" },
      { managerId: propertyManager.id, region: "Burlington, VT 05401" },
      { managerId: propertyManager.id, region: "05401" },
      { managerId: propertyManager.id, region: "05402" },
    ],
  });

  // --- Extra demo managers for zip-code search ---
  const manager2Hash = await bcrypt.hash("password", 10);
  const manager3Hash = await bcrypt.hash("password", 10);

  const managerUser2 = await prisma.user.upsert({
    where: { email: "manager2@example.com" },
    update: {},
    create: {
      email: "manager2@example.com",
      name: "Elena Ramirez",
      role: "MANAGER",
      passwordHash: manager2Hash,
    },
  });

  const managerUser3 = await prisma.user.upsert({
    where: { email: "manager3@example.com" },
    update: {},
    create: {
      email: "manager3@example.com",
      name: "Marco Sullivan",
      role: "MANAGER",
      passwordHash: manager3Hash,
    },
  });

  const pm2 = await prisma.propertyManager.upsert({
    where: { userId: managerUser2.id },
    update: {},
    create: {
      userId: managerUser2.id,
      bio: "Specializing in beachfront and Gulf Coast vacation rentals since 2015.",
      rating: 4.6,
      reviewCount: 18,
    },
  });

  const pm3 = await prisma.propertyManager.upsert({
    where: { userId: managerUser3.id },
    update: {},
    create: {
      userId: managerUser3.id,
      bio: "West Coast luxury property management with a focus on guest experience.",
      rating: 4.9,
      reviewCount: 31,
    },
  });

  await prisma.serviceRegion.deleteMany({ where: { managerId: pm2.id } });
  await prisma.serviceRegion.createMany({
    data: [
      { managerId: pm2.id, region: "Southeast" },
      { managerId: pm2.id, region: "Miami, FL 33101" },
      { managerId: pm2.id, region: "33101" },
      { managerId: pm2.id, region: "33102" },
      { managerId: pm2.id, region: "33109" },
    ],
  });

  await prisma.serviceRegion.deleteMany({ where: { managerId: pm3.id } });
  await prisma.serviceRegion.createMany({
    data: [
      { managerId: pm3.id, region: "West Coast" },
      { managerId: pm3.id, region: "Los Angeles, CA 90210" },
      { managerId: pm3.id, region: "90210" },
      { managerId: pm3.id, region: "90211" },
      { managerId: pm3.id, region: "90212" },
    ],
  });

  const property = await prisma.property.upsert({
    where: { id: "prop-seed-001" },
    update: {},
    create: {
      id: "prop-seed-001",
      name: "Lakeview Cottage",
      address: "123 Lakeview Dr, Burlington, VT 05401",
      ownerId: owner.id,
      description: "A cozy lakefront cottage perfect for family getaways.",
      autoApprove: false,
    },
  });

  const toiletries = await prisma.catalogCategory.upsert({
    where: { id: "cat-toiletries" },
    update: {},
    create: { id: "cat-toiletries", name: "Toiletries", description: "Personal care essentials" },
  });
  const foodBev = await prisma.catalogCategory.upsert({
    where: { id: "cat-food-bev" },
    update: {},
    create: { id: "cat-food-bev", name: "Food & Beverages", description: "Snacks, drinks and pantry staples" },
  });
  const sporting = await prisma.catalogCategory.upsert({
    where: { id: "cat-sporting" },
    update: {},
    create: { id: "cat-sporting", name: "Sporting Equipment", description: "Outdoor and sports gear" },
  });
  const amenities = await prisma.catalogCategory.upsert({
    where: { id: "cat-amenities" },
    update: {},
    create: { id: "cat-amenities", name: "Vacation Amenities", description: "Extras to make your stay special" },
  });

  const shampoo = await prisma.product.upsert({
    where: { id: "prod-shampoo" },
    update: {},
    create: { id: "prod-shampoo", name: "Shampoo & Conditioner Set", categoryId: toiletries.id, price: 8.99, unit: "set", description: "Hotel-quality 2-in-1 shampoo and conditioner" },
  });
  const soapBar = await prisma.product.upsert({
    where: { id: "prod-soap" },
    update: {},
    create: { id: "prod-soap", name: "Soap Bar (3-pack)", categoryId: toiletries.id, price: 5.49, unit: "pack", description: "Gentle moisturizing soap bars" },
  });
  const toothpaste = await prisma.product.upsert({
    where: { id: "prod-toothpaste" },
    update: {},
    create: { id: "prod-toothpaste", name: "Toothpaste & Toothbrush Kit", categoryId: toiletries.id, price: 6.99, unit: "kit", description: "Travel toothpaste and disposable toothbrush" },
  });

  const coffee = await prisma.product.upsert({
    where: { id: "prod-coffee" },
    update: {},
    create: { id: "prod-coffee", name: "Ground Coffee (12oz)", categoryId: foodBev.id, price: 12.99, unit: "bag", description: "Premium medium roast ground coffee" },
  });
  const snackBox = await prisma.product.upsert({
    where: { id: "prod-snacks" },
    update: {},
    create: { id: "prod-snacks", name: "Snack Assortment Box", categoryId: foodBev.id, price: 24.99, unit: "box", description: "Curated selection of 20 snacks" },
  });
  await prisma.product.upsert({
    where: { id: "prod-water" },
    update: {},
    create: { id: "prod-water", name: "Bottled Water (24-pack)", categoryId: foodBev.id, price: 9.99, unit: "case", description: "Purified spring water" },
  });

  const kayak = await prisma.product.upsert({
    where: { id: "prod-kayak" },
    update: {},
    create: { id: "prod-kayak", name: "Single Kayak Rental (day)", categoryId: sporting.id, price: 45.00, unit: "day", description: "One-day single kayak rental with paddle" },
  });
  await prisma.product.upsert({
    where: { id: "prod-bikes" },
    update: {},
    create: { id: "prod-bikes", name: "Bicycle Rental (day)", categoryId: sporting.id, price: 25.00, unit: "day", description: "Mountain bike rental for the day" },
  });
  await prisma.product.upsert({
    where: { id: "prod-fishing" },
    update: {},
    create: { id: "prod-fishing", name: "Fishing Rod & Tackle Kit", categoryId: sporting.id, price: 18.99, unit: "kit", description: "Complete beginner fishing kit" },
  });

  await prisma.product.upsert({
    where: { id: "prod-boardgames" },
    update: {},
    create: { id: "prod-boardgames", name: "Board Game Collection", categoryId: amenities.id, price: 19.99, unit: "set", description: "5 classic board games for family fun" },
  });
  await prisma.product.upsert({
    where: { id: "prod-candles" },
    update: {},
    create: { id: "prod-candles", name: "Scented Candle Set", categoryId: amenities.id, price: 22.99, unit: "set", description: "3 luxury soy wax candles" },
  });
  await prisma.product.upsert({
    where: { id: "prod-flowers" },
    update: {},
    create: { id: "prod-flowers", name: "Fresh Flower Arrangement", categoryId: amenities.id, price: 34.99, unit: "arrangement", description: "Seasonal fresh flowers" },
  });

  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 30);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 7);

  const reservation = await prisma.reservation.upsert({
    where: { id: "res-seed-001" },
    update: {},
    create: {
      id: "res-seed-001",
      propertyId: property.id,
      guestId: guest.id,
      checkIn,
      checkOut,
      status: "UPCOMING",
    },
  });

  const template = await prisma.inventoryTemplate.upsert({
    where: { propertyId: property.id },
    update: {},
    create: {
      propertyId: property.id,
      name: "Standard Lakeview Cottage Package",
      description: "Default supply list for all guests",
    },
  });

  await prisma.inventoryTemplateItem.deleteMany({ where: { templateId: template.id } });
  await prisma.inventoryTemplateItem.createMany({
    data: [
      { templateId: template.id, productId: shampoo.id, quantity: 2, required: true },
      { templateId: template.id, productId: soapBar.id, quantity: 2, required: true },
      { templateId: template.id, productId: coffee.id, quantity: 1, required: false },
      { templateId: template.id, productId: snackBox.id, quantity: 1, required: false },
      { templateId: template.id, productId: kayak.id, quantity: 1, required: false },
    ],
  });

  console.log("Seed complete!");
  console.log(`Reservation ID for guest testing: ${reservation.id}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
