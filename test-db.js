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

const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;

async function run() {
  if (!uri) {
    console.error("Missing MONGODB_URI or MONGODB_URL in .env.local");
    process.exit(1);
  }

  try {
    console.log("Testing MongoDB connection...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => undefined);
  }
}

run();
