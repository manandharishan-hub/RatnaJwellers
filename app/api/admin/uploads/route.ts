import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/serverAuth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXTENSIONS_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function saveImageLocally(name: string, bytes: Buffer) {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, name), bytes);
  return `/uploads/products/${name}`;
}

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Image file is required." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ message: "Only JPEG, PNG, or WebP images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ message: "Image must be 5MB or smaller." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = EXTENSIONS_BY_TYPE[file.type] ?? "jpg";
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  let url: string;

  try {
    const { uploadImageToFirebase } = await import("@/lib/firebase");
    url = await uploadImageToFirebase(`products/${fileName}`, bytes, file.type);
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      console.error("Image upload failed.", error);
      return NextResponse.json({ message: "Image upload failed." }, { status: 500 });
    }
    url = await saveImageLocally(fileName, bytes);
  }

  return NextResponse.json({ url });
}
