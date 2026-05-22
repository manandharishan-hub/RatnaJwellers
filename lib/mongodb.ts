import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI or MONGODB_URL environment variable inside .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

const cached = global.mongoose || { conn: null, promise: null };

async function seedDefaultSuperAdmin() {
  const UserModel = (await import("@/models/User")).default;
  const defaultAdminEmail = "admin@ratnajewels.com";
  const existingSuperadmin = await UserModel.findOne({ role: "superadmin" });

  if (existingSuperadmin) {
    return;
  }

  const existingByEmail = await UserModel.findOne({ email: defaultAdminEmail });
  if (existingByEmail) {
    if (existingByEmail.role !== "superadmin") {
      existingByEmail.role = "superadmin";
      existingByEmail.name = "Ratna Superadmin";
      existingByEmail.isVerified = true;
      existingByEmail.isBlocked = false;
      await existingByEmail.save();
    }
    return;
  }

  await UserModel.create({
    name: "Ratna Superadmin",
    email: defaultAdminEmail,
    password: "Admin@123",
    role: "superadmin",
    isVerified: true,
    isBlocked: false,
  });
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      dbName: "ratna-jewels",
      bufferCommands: false,
    }).then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  global.mongoose = cached;
  await seedDefaultSuperAdmin();
  return cached.conn;
}
