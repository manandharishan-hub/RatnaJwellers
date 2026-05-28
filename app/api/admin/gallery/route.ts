import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/serverAuth";
import { defaultGalleryItems } from "@/lib/galleryDefaults";
import GalleryImageModel from "@/models/GalleryImage";

const gallerySchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Title is required."),
  caption: z.string().trim().optional().default(""),
  partnerLabel: z.string().trim().optional().default("Mr/Ms Supranational"),
  imageUrl: z.string().trim().min(1, "Image is required."),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
  isPublished: z.boolean().optional().default(true),
});

async function seedGalleryIfEmpty() {
  const count = await GalleryImageModel.countDocuments();
  if (count > 0) return;
  await GalleryImageModel.insertMany(defaultGalleryItems);
}

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  await connectDB();
  await seedGalleryIfEmpty();
  const items = await GalleryImageModel.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  await connectDB();
  const parsed = gallerySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Invalid gallery item." }, { status: 400 });
  }

  const item = await GalleryImageModel.create(parsed.data);
  return NextResponse.json({ item }, { status: 201 });
}

export async function PUT(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  await connectDB();
  const parsed = gallerySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Invalid gallery item." }, { status: 400 });
  }
  if (!parsed.data.id || !mongoose.Types.ObjectId.isValid(parsed.data.id)) {
    return NextResponse.json({ message: "Invalid gallery item id." }, { status: 400 });
  }

  const { id, ...update } = parsed.data;
  const item = await GalleryImageModel.findByIdAndUpdate(id, update, { new: true });
  if (!item) {
    return NextResponse.json({ message: "Gallery item not found." }, { status: 404 });
  }
  return NextResponse.json({ item });
}

export async function DELETE(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  await connectDB();
  const { id } = await request.json();
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid gallery item id." }, { status: 400 });
  }

  await GalleryImageModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
