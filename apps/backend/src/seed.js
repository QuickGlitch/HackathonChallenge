import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

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
    },
    {
      name: "Smart Watch",
      description:
        "Advanced smartwatch with health monitoring, GPS, and water resistance.",
      price: 299.99,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop",
      category: "Electronics",
    },
    {
      name: "Coffee Maker",
      description:
        "Premium coffee maker with programmable settings and thermal carafe.",
      price: 129.99,
      image:
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=200&fit=crop",
      category: "Home & Kitchen",
    },
    {
      name: "Running Shoes",
      description:
        "Comfortable running shoes with advanced cushioning and breathable material.",
      price: 89.99,
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop",
      category: "Sports & Outdoors",
    },
    {
      name: "Laptop Backpack",
      description:
        "Durable laptop backpack with multiple compartments and USB charging port.",
      price: 49.99,
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop",
      category: "Accessories",
    },
    {
      name: "Bluetooth Speaker",
      description:
        "Portable Bluetooth speaker with 360-degree sound and waterproof design.",
      price: 79.99,
      image:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop",
      category: "Electronics",
    },
    {
      name: "Yoga Mat",
      description:
        "Non-slip yoga mat made from eco-friendly materials with carrying strap.",
      price: 29.99,
      image:
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&h=200&fit=crop",
      category: "Sports & Outdoors",
    },
    {
      name: "Desk Lamp",
      description:
        "LED desk lamp with adjustable brightness and USB charging port.",
      price: 39.99,
      image:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop",
      category: "Home & Kitchen",
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
