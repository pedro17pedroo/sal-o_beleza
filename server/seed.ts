import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDatabase() {
  try {
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername("admin");
    
    if (existingAdmin) {
      console.log("✓ Admin user already exists");
      return;
    }

    // Create admin user
    const hashedPassword = await hashPassword("admin123");
    
    const adminUser = await storage.createUser({
      username: "admin",
      password: hashedPassword,
      name: "Administrador",
      email: "admin@salao.com",
      role: "admin"
    });

    console.log("✓ Admin user created successfully");
    console.log("  Username: admin");
    console.log("  Password: admin123");
    console.log("  ⚠️  IMPORTANT: Change the default password after first login!");
    
    return adminUser;
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("🌱 Database seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Database seeding failed:", error);
      process.exit(1);
    });
}