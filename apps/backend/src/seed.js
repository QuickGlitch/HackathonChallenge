import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create sample users
  const users = [
    {
      username: "Hackors1",
      password: "go team 1",
      PII: "fantasizes about starting a Dutch cuisine restaurant: The Hungry Herring",
      role: "customer",
    },
    {
      username: "Hackors2",
      password: "taco2",
      PII: "Things Lord of the Rings is overrated...",
      role: "customer",
    },
    {
      username: "Hackors3",
      password: "Team3",
      PII: "Dyes their hair every color of the rainbow on a monthly basis",
      role: "customer",
    },
    {
      username: "Hackors4",
      password: "PW4",
      PII: "Collects vintage typewriters and has a collection of over 50",
      role: "customer",
    },
    {
      username: "Hackors5",
      password: "password123",
      PII: "Does a one man show, Mike Myers inspired, of Romeo and Juliet.",
      role: "customer",
    },
    // Elderly users with 1950s-style names
    {
      username: "EdwardGreenwood",
      password: "memories1952",
      name: "Edward Greenwood",
      PII: "Born in 1952, retired postal worker, loves gardening and his 8 grandchildren",
      role: "customer",
    },
    {
      username: "BettyJohnson",
      password: "knitting123",
      name: "Betty Johnson",
      PII: "Born in 1948, former librarian, enjoys knitting and baking cookies",
      role: "customer",
    },
    {
      username: "HaroldSmith",
      password: "fishing1955",
      name: "Harold Smith",
      PII: "Born in 1955, retired mechanic, spends weekends fishing at the lake",
      role: "customer",
    },
    {
      username: "DorothyWilliams",
      password: "quilting456",
      name: "Dorothy Williams",
      PII: "Born in 1951, former nurse, president of the local quilting club",
      role: "customer",
    },
    {
      username: "WalterBrown",
      password: "woodwork789",
      name: "Walter Brown",
      PII: "Born in 1949, retired carpenter, builds birdhouses in his spare time",
      role: "customer",
    },
    {
      username: "EleanorDavis",
      password: "bridge1953",
      name: "Eleanor Davis",
      PII: "Born in 1953, former teacher, plays bridge every Tuesday",
      role: "customer",
    },
    {
      username: "FrankMiller",
      password: "trains1954",
      name: "Frank Miller",
      PII: "Born in 1954, retired engineer, has an elaborate model train collection",
      role: "customer",
    },
    {
      username: "MildredWilson",
      password: "church1950",
      name: "Mildred Wilson",
      PII: "Born in 1950, organizes church socials and volunteers at the food bank",
      role: "customer",
    },
    {
      username: "ArthurMoore",
      password: "baseball1956",
      name: "Arthur Moore",
      PII: "Born in 1956, former factory worker, still follows baseball religiously",
      role: "customer",
    },
    {
      username: "RuthTaylor",
      password: "cooking1949",
      name: "Ruth Taylor",
      PII: "Born in 1949, famous in the neighborhood for her apple pies and Sunday dinners",
      role: "customer",
    },
  ];

  // Check if users already exist
  const existingUsersCount = await prisma.user.count();
  const elderlyUsersCount = await prisma.user.count({
    where: {
      username: {
        in: [
          "EdwardGreenwood",
          "BettyJohnson",
          "HaroldSmith",
          "DorothyWilliams",
          "WalterBrown",
          "EleanorDavis",
          "FrankMiller",
          "MildredWilson",
          "ArthurMoore",
          "RuthTaylor",
        ],
      },
    },
  });

  if (existingUsersCount > 0 && elderlyUsersCount === 0) {
    console.log("Creating elderly users...");
    // Only create the elderly users
    const elderlyUsers = users.slice(5); // Get the elderly users (from index 5 onwards)

    for (const user of elderlyUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.create({
        data: {
          ...user,
          password: hashedPassword,
        },
      });
    }

    console.log(`✅ Created ${elderlyUsers.length} elderly users!`);
  } else if (existingUsersCount === 0) {
    console.log("Creating all sample users...");

    for (const user of users) {
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await prisma.user.create({
        data: {
          ...user,
          password: hashedPassword,
        },
      });
    }

    console.log(`✅ Created ${users.length} sample users!`);
  } else {
    console.log("All users already exist, skipping user creation...");
  }

  // Create some sample products
  const products = [
    {
      name: "Wireless Headphones",
      description:
        "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
      price: 199.99,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop",
      category: "Electronics",
      sellerId: 1,
    },
    {
      name: "Smart Watch",
      description:
        "Advanced smartwatch with health monitoring, GPS, and water resistance.",
      price: 299.99,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop",
      category: "Electronics",
      sellerId: 1,
    },
    {
      name: "Coffee Maker",
      description:
        "Premium coffee maker with programmable settings and thermal carafe.",
      price: 129.99,
      image:
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=200&fit=crop",
      category: "Home & Kitchen",
      sellerId: 2,
    },
    {
      name: "Running Shoes",
      description:
        "Comfortable running shoes with advanced cushioning and breathable material.",
      price: 89.99,
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop",
      category: "Sports & Outdoors",
      sellerId: 2,
    },
    {
      name: "Laptop Backpack",
      description:
        "Durable laptop backpack with multiple compartments and USB charging port.",
      price: 49.99,
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop",
      category: "Accessories",
      sellerId: 3,
    },
    {
      name: "Bluetooth Speaker",
      description:
        "Portable Bluetooth speaker with 360-degree sound and waterproof design.",
      price: 79.99,
      image:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop",
      category: "Electronics",
      sellerId: 3,
    },
    {
      name: "Yoga Mat",
      description:
        "Non-slip yoga mat made from eco-friendly materials with carrying strap.",
      price: 29.99,
      image:
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&h=200&fit=crop",
      category: "Sports & Outdoors",
      sellerId: 4,
    },
    {
      name: "Desk Lamp",
      description:
        "LED desk lamp with adjustable brightness and USB charging port.",
      price: 39.99,
      image:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop",
      category: "Home & Kitchen",
      sellerId: 5,
    },
  ];

  // Check if products already exist
  const existingProducts = await prisma.product.count();

  if (existingProducts > 0) {
    console.log("Products already exist, skipping seed...");
  } else {
    console.log("Creating sample products...");

    for (const product of products) {
      await prisma.product.create({
        data: product,
      });
    }

    console.log(`✅ Created ${products.length} sample products!`);
  }

  // Create sample forum messages
  const forumMessages = [
    {
      title: "Wonderful community here!",
      body: "Good day, what a lovely store and lovely community. This is a great place to find gifts for my grandson. I'm happy to be a part of this.",
      authorId: 7, // EdwardGreenwood
    },
    {
      title: "I seem to be lost",
      body: "Where am I?",
      authorId: 8, // BettyJohnson
    },
    {
      title: "Shopping troubles without glasses",
      body: "Without my reading glasses I can't see what I'm trying to buy, so I just click the links in here from time to time. Can anybody recommend a gift for my granddaughter?",
      authorId: 9, // HaroldSmith
    },
  ];

  // Check if forum messages already exist
  const existingMessages = await prisma.forumMessage.count();
  const specificMessages = await prisma.forumMessage.count({
    where: {
      title: {
        in: [
          "Wonderful community here!",
          "I seem to be lost",
          "Shopping troubles without glasses",
        ],
      },
    },
  });

  if (existingMessages > 0 && specificMessages === 0) {
    console.log("Creating additional forum messages...");

    for (const message of forumMessages) {
      await prisma.forumMessage.create({
        data: message,
      });
    }

    console.log(`✅ Created ${forumMessages.length} sample forum messages!`);
  } else if (existingMessages === 0) {
    console.log("Creating sample forum messages...");

    for (const message of forumMessages) {
      await prisma.forumMessage.create({
        data: message,
      });
    }

    console.log(`✅ Created ${forumMessages.length} sample forum messages!`);
  } else {
    console.log(
      "Forum messages already exist, skipping forum message creation..."
    );
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
