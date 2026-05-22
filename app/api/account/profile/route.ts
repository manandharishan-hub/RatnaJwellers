import { NextResponse } from "next/server";
import { firstZodMessage, jsonError } from "@/lib/apiErrors";
import { serializeUserProfile } from "@/lib/dto";
import { connectDB } from "@/lib/mongodb";
import { requireUser } from "@/lib/serverAuth";
import { profileUpdateSchema } from "@/lib/validation";
import UserModel from "@/models/User";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  await connectDB();
  const profile = await UserModel.findById(user!.id).lean();
  if (!profile) return jsonError("User not found.", 404);
  return NextResponse.json(serializeUserProfile(profile));
}

export async function PUT(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const data = await request.json();
  const parsed = profileUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error, "Invalid profile data."), 400);
  }

  await connectDB();
  const profile = await UserModel.findByIdAndUpdate(user!.id, { name: parsed.data.name }, { new: true }).lean();
  if (!profile) return jsonError("User not found.", 404);
  return NextResponse.json(serializeUserProfile(profile));
}
