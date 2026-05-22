const mongoose = require("mongoose");
const fs = require("fs");

function loadLocalEnv() {
  if (!fs.existsSync(".env.local")) return;
  const lines = fs.readFileSync(".env.local", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

loadLocalEnv();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL;
const EMAIL_TO_UPGRADE = process.env.ADMIN_EMAIL;

const userSchema = new mongoose.Schema(
  {
    email: String,
    role: String,
  },
  { collection: "users" }
);

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

async function elevateToAdmin() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI or MONGODB_URL in .env.local");
    process.exit(1);
  }

  if (!EMAIL_TO_UPGRADE) {
    console.error("Set ADMIN_EMAIL in .env.local before running this script.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    const user = await UserModel.findOne({ email: EMAIL_TO_UPGRADE });

    if (!user) {
      console.log(`User with email ${EMAIL_TO_UPGRADE} not found.`);
      return;
    }

    user.role = "admin";
    await user.save();
    console.log(`Successfully upgraded ${EMAIL_TO_UPGRADE} to admin.`);
  } catch (error) {
    console.error("Error connecting or updating:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => undefined);
  }
}

elevateToAdmin();
