import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Fixed UUIDs for users (to maintain consistency across resets)
const USER_IDS = {
  admin: "00000000-0000-0000-0000-000000000001",
  hackors1: "00000000-0000-0000-0000-000000000002",
  hackors2: "00000000-0000-0000-0000-000000000003",
  hackors3: "00000000-0000-0000-0000-000000000004",
  hackors4: "00000000-0000-0000-0000-000000000005",
  hackors5: "00000000-0000-0000-0000-000000000006",
  edwardGreenwood: "00000000-0000-0000-0000-000000000007",
  bettyJohnson: "00000000-0000-0000-0000-000000000008",
  haroldSmith: "00000000-0000-0000-0000-000000000009",
  dorothyWilliams: "00000000-0000-0000-0000-000000000010",
  walterBrown: "00000000-0000-0000-0000-000000000011",
  eleanorDavis: "00000000-0000-0000-0000-000000000012",
  frankMiller: "00000000-0000-0000-0000-000000000013",
  mildredWilson: "00000000-0000-0000-0000-000000000014",
  arthurMoore: "00000000-0000-0000-0000-000000000015",
  ruthTaylor: "00000000-0000-0000-0000-000000000016",
};

// Fixed IDs for products (to maintain consistency across resets)
const PRODUCT_IDS = {
  wirelessHeadphones: 1,
  smartWatch: 2,
  coffeeMaker: 3,
  runningShoes: 4,
  laptopBackpack: 5,
  honeySkinCream: 6,
  honeyReceptacle: 7,
  beeswaxCandles: 8,
  honeycombPillow: 9,
  bluetoothSpeaker: 10,
  yogaMat: 11,
  deskLamp: 12,
  prototypeFish: 13,
};

// Fixed IDs for forum messages (to maintain consistency across resets)
const FORUM_MESSAGE_IDS = {
  adminMessage: 1,
  wonderfulCommunity: 2,
  seemLost: 3,
  shoppingTroubles: 4,
  reShoppingTroubles1: 5,
  reShoppingTroubles2: 6,
  linkQuestion: 7,
  reLinkQuestion1: 8,
  reLinkQuestion2: 9,
  sellingCrafts: 10,
};

async function main() {
  console.log("🌱 Seeding database...");

  // Create sample users
  const users = [
    {
      id: USER_IDS.admin,
      username: "admin",
      password: "miele_hackathon",
      PII: "has a twin, admax",
      role: "admin",
    },
    {
      id: USER_IDS.hackors1,
      username: "Hackors1",
      password: "go team 1",
      PII: "fantasizes about starting a Dutch cuisine restaurant: The Hungry Herring",
      role: "customer",
    },
    {
      id: USER_IDS.hackors2,
      username: "Hackors2",
      password: "taco2",
      PII: "Thinks Lord of the Rings is overrated...",
      role: "customer",
    },
    {
      id: USER_IDS.hackors3,
      username: "Hackors3",
      password: "Team3",
      PII: "Dyes their hair every color of the rainbow on a monthly basis",
      role: "customer",
    },
    {
      id: USER_IDS.hackors4,
      username: "Hackors4",
      password: "PW4",
      PII: "Collects vintage typewriters and has a collection of over 50",
      role: "customer",
    },
    {
      id: USER_IDS.hackors5,
      username: "Hackors5",
      password: "password123",
      PII: "Does a one man show, Mike Myers inspired, of Romeo and Juliet.",
      role: "customer",
    },
    // Elderly users with 1950s-style names
    {
      id: USER_IDS.edwardGreenwood,
      username: "EdwardGreenwood",
      password: "memories1952",
      name: "Edward Greenwood",
      PII: "Born in 1952, retired postal worker, loves gardening and his 8 grandchildren",
      role: "customer",
    },
    {
      id: USER_IDS.bettyJohnson,
      username: "BettyJohnson",
      password: "knitting123",
      name: "Betty Johnson",
      PII: "Born in 1948, former librarian, enjoys knitting and baking cookies",
      role: "customer",
    },
    {
      id: USER_IDS.haroldSmith,
      username: "HaroldSmith",
      password: "fishing1955",
      name: "Harold Smith",
      PII: "Born in 1955, retired mechanic, spends weekends fishing at the lake",
      role: "customer",
    },
    {
      id: USER_IDS.dorothyWilliams,
      username: "DorothyWilliams",
      password: "quilting456",
      name: "Dorothy Williams",
      PII: "Born in 1951, former nurse, president of the local quilting club",
      role: "customer",
    },
    {
      id: USER_IDS.walterBrown,
      username: "WalterBrown",
      password: "woodwork789",
      name: "Walter Brown",
      PII: "Born in 1949, retired carpenter, builds birdhouses in his spare time",
      role: "customer",
    },
    {
      id: USER_IDS.eleanorDavis,
      username: "EleanorDavis",
      password: "bridge1953",
      name: "Eleanor Davis",
      PII: "Born in 1953, former teacher, plays bridge every Tuesday",
      role: "customer",
    },
    {
      id: USER_IDS.frankMiller,
      username: "FrankMiller",
      password: "trains1954",
      name: "Frank Miller",
      PII: "Born in 1954, retired engineer, has an elaborate model train collection",
      role: "customer",
    },
    {
      id: USER_IDS.mildredWilson,
      username: "MildredWilson",
      password: "church1950",
      name: "Mildred Wilson",
      PII: "Born in 1950, organizes church socials and volunteers at the food bank",
      role: "customer",
    },
    {
      id: USER_IDS.arthurMoore,
      username: "ArthurMoore",
      password: "baseball1956",
      name: "Arthur Moore",
      PII: "Born in 1956, former factory worker, still follows baseball religiously",
      role: "customer",
    },
    {
      id: USER_IDS.ruthTaylor,
      username: "RuthTaylor",
      password: "cooking1949",
      name: "Ruth Taylor",
      PII: "Born in 1949, famous in the neighborhood for her apple pies and Sunday dinners",
      role: "customer",
    },
  ];

  // Create all users
  console.log("Creating sample users...");
  let createdUsers = 0;
  let skippedUsers = 0;

  for (const user of users) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.create({
        data: {
          ...user,
          password: hashedPassword,
        },
      });
      createdUsers++;
    } catch (error) {
      if (error.code === "P2002") {
        console.warn(`User ${user.username} already exists, skipping...`);
        skippedUsers++;
      } else {
        throw error;
      }
    }
  }

  console.log(
    `Created ${createdUsers} users, skipped ${skippedUsers} existing users`
  );

  // Create some sample products
  const products = [
    {
      id: PRODUCT_IDS.wirelessHeadphones,
      name: "Wireless Headphones",
      description:
        "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
      price: 199.99,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop",
      category: "Electronics",
      payableTo: USER_IDS.admin,
    },
    {
      id: PRODUCT_IDS.smartWatch,
      name: "Smart Watch",
      description:
        "Advanced smartwatch with health monitoring, GPS, and water resistance.",
      price: 99.99,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop",
      category: "Electronics",
      payableTo: USER_IDS.admin,
    },
    {
      id: PRODUCT_IDS.coffeeMaker,
      name: "Coffee Maker",
      description:
        "Premium coffee maker with programmable settings and thermal carafe. Buy this for Paul he will love it.",
      price: 129.99,
      image:
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=200&fit=crop",
      category: "Home & Kitchen",
      payableTo: USER_IDS.admin,
    },
    {
      id: PRODUCT_IDS.runningShoes,
      name: "Running Shoes",
      description:
        "Comfortable running shoes with advanced cushioning and.. uh.. oh... and they're gone. Yours if you can catch them!",
      price: 89.99,
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop",
      category: "Sports & Outdoors",
      payableTo: USER_IDS.admin,
    },
    {
      id: PRODUCT_IDS.laptopBackpack,
      name: "Laptop Backpack",
      description:
        "Durable laptop backpack with multiple compartments and USB charging port.",
      price: 49.99,
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop",
      category: "Accessories",
      payableTo: USER_IDS.admin,
    },
    // Honeypot products - only visible when honey cookie is set
    {
      id: PRODUCT_IDS.honeySkinCream,
      name: "Honey-Based Skin Cream",
      description:
        "Premium organic honey facial moisturizer with anti-aging properties. Made from rare Manuka honey.",
      price: 1999.99,
      image:
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=200&fit=crop",
      category: "Beauty",
      honeypot: true,
      payableTo: USER_IDS.admin,
    },
    {
      id: PRODUCT_IDS.honeyReceptacle,
      name: "Premium Honey Receptacle",
      description:
        "Hand-crafted wooden honey jar with traditional bee motifs. Perfect for storing artisanal honey.",
      price: 5000.0,
      image:
        "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=300&h=200&fit=crop",
      category: "Kitchen",
      honeypot: true,
      payableTo: USER_IDS.admin,
    },
    {
      id: PRODUCT_IDS.beeswaxCandles,
      name: "Beeswax Candle Collection",
      description:
        "Set of 6 handmade beeswax candles. Natural air purifying and long-lasting burn time.",
      price: 4011.2,
      image:
        "https://images.unsplash.com/photo-1593198011850-ec9a09c68c58?w=300&h=200&fit=crop",
      category: "Home",
      honeypot: true,
      payableTo: USER_IDS.admin,
    },
    {
      id: PRODUCT_IDS.honeycombPillow,
      name: "Honeycomb Memory Foam Pillow",
      description:
        "Ergonomic pillow with honeycomb ventilation design. Infused with honey-scented aromatherapy.",
      price: 6700.75,
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop",
      category: "Home",
      honeypot: true,
      payableTo: USER_IDS.admin,
    },
    {
      id: PRODUCT_IDS.bluetoothSpeaker,
      name: "Bluetooth Speaker",
      description:
        "Bluetooth because its based on a Nordic king who had rotten teeth, hence blue. Seriously, look it up. The symbol is even a rune.",
      price: 79.99,
      image:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop",
      category: "Electronics",
      payableTo: USER_IDS.hackors1,
    },
    {
      id: PRODUCT_IDS.yogaMat,
      name: "Yoga Mat",
      description:
        "Is what his friends call him. That would be Yoga Mathew to you.",
      price: 29.99,
      image:
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&h=200&fit=crop",
      category: "Sports & Outdoors",
      payableTo: USER_IDS.hackors3,
    },
    {
      id: PRODUCT_IDS.deskLamp,
      name: "Desk Lamp",
      description:
        "LED desk lamp with adjustable brightness and USB charging port. No joke here. Not everything can be taken lightly.",
      price: 39.99,
      image:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop",
      category: "Home & Kitchen",
      payableTo: USER_IDS.hackors4,
    },
    {
      id: PRODUCT_IDS.prototypeFish,
      name: "Prototype animal: beta fish",
      description:
        "Top secret: do not release to the public yet! WIP model of an underwater animal shaped like a fish.",
      price: 999.99,
      image:
        "https://images.unsplash.com/photo-1710382163926-76b22555b52c?w=400&h=500&fit=crop",
      category: "Prototype",
      released: false,
      payableTo: USER_IDS.admin,
    },
  ];

  // Create all products
  console.log("Creating sample products...");
  let createdProducts = 0;
  let skippedProducts = 0;

  for (const product of products) {
    try {
      await prisma.product.create({
        data: product,
      });
      createdProducts++;
    } catch (error) {
      if (error.code === "P2002") {
        console.warn(`Product ${product.name} already exists, skipping...`);
        skippedProducts++;
      } else {
        throw error;
      }
    }
  }

  console.log(
    `Created ${createdProducts} products, skipped ${skippedProducts} existing products`
  );

  // Create sample forum messages
  const forumMessages = [
    {
      id: FORUM_MESSAGE_IDS.adminMessage,
      title: "A message from your admin",
      body: "FYI, As an admin I will be checking every <b>link</b> shared here by clicking on it.",
      authorId: USER_IDS.admin,
    },
    {
      id: FORUM_MESSAGE_IDS.wonderfulCommunity,
      title: "Wonderful community here!",
      body: "Good day, what a lovely store and lovely community. This is a great place to find gifts for my grandson. I'm happy to be a part of this.",
      authorId: USER_IDS.edwardGreenwood,
    },
    {
      id: FORUM_MESSAGE_IDS.seemLost,
      title: "I seem to be lost",
      body: "Where am I?",
      authorId: USER_IDS.bettyJohnson,
    },
    {
      id: FORUM_MESSAGE_IDS.shoppingTroubles,
      title: "Shopping troubles without glasses",
      body: "Without my reading glasses I can't see what I'm trying to buy, so I just click the links in here from time to time. Can anybody recommend a gift for my granddaughter?",
      authorId: USER_IDS.haroldSmith,
    },
    {
      id: FORUM_MESSAGE_IDS.reShoppingTroubles1,
      title: "RE: Shopping troubles without glasses",
      body: "Every young person can use this a lamp, how about that?",
      authorId: USER_IDS.bettyJohnson,
    },
    {
      id: FORUM_MESSAGE_IDS.reShoppingTroubles2,
      title: "RE:RE: Shopping troubles without glasses",
      body: "Could you please send a link? Thank you so much!",
      authorId: USER_IDS.haroldSmith,
    },
    {
      id: FORUM_MESSAGE_IDS.linkQuestion,
      title: "Link",
      body: "What is a link?",
      authorId: USER_IDS.bettyJohnson,
    },
    {
      id: FORUM_MESSAGE_IDS.reLinkQuestion1,
      title: "RE: Link",
      body: "I used the computer and it appears to be one of these <img src='https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fzelda.nintendo.com%2Flinks-awakening%2Fassets%2Fimg%2Fcharacters%2Fchar-link.png&f=1&nofb=1&ipt=d19f50afcc6dad65b2014be2b060f7e54c03de9e92fe82667b9cfa46ea067b0a'/>",
      authorId: USER_IDS.edwardGreenwood,
    },
    {
      id: FORUM_MESSAGE_IDS.reLinkQuestion2,
      title: "RE: RE: Link",
      body: "I have really enjoyed using this lamp: <a href='http://localhost:3000/products/12'>desk lamp</a>.",
      authorId: USER_IDS.dorothyWilliams,
    },
    {
      id: FORUM_MESSAGE_IDS.sellingCrafts,
      title: "Looking to sell my crafts",
      body: "Looking to sell my handmade vegan yoga mats: <a href='http://localhost:3000/products/11'>yoga mat</a>.",
      authorId: USER_IDS.dorothyWilliams,
    },
  ];

  // Create all forum messages
  console.log("Creating sample forum messages...");
  let createdMessages = 0;
  let skippedMessages = 0;

  for (const message of forumMessages) {
    try {
      await prisma.forumMessage.create({
        data: message,
      });
      createdMessages++;
    } catch (error) {
      if (error.code === "P2002") {
        console.warn(
          `Forum message "${message.title}" already exists, skipping...`
        );
        skippedMessages++;
      } else {
        throw error;
      }
    }
  }

  console.log(
    `Created ${createdMessages} forum messages, skipped ${skippedMessages} existing messages`
  );

  // Reset sequences for tables with explicit IDs
  console.log("Resetting auto-increment sequences...");

  // Reset products sequence
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE(MAX(id), 1)) FROM products;`
  );

  // Reset forum_messages sequence
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('forum_messages', 'id'), COALESCE(MAX(id), 1)) FROM forum_messages;`
  );

  console.log("Sequences reset successfully!");

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
