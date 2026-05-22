import { NextResponse } from "next/server";
import { firstZodMessage, jsonError } from "@/lib/apiErrors";
import { serializeAddress } from "@/lib/dto";
import { connectDB } from "@/lib/mongodb";
import { requireUser } from "@/lib/serverAuth";
import { addressSchema } from "@/lib/validation";
import UserModel from "@/models/User";

function serializeAddresses(user: any) {
  return { items: (user.addresses ?? []).map((address: any) => serializeAddress(address)) };
}

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  await connectDB();
  const profile = await UserModel.findById(user!.id).select("addresses").lean();
  if (!profile) return jsonError("User not found.", 404);
  return NextResponse.json(serializeAddresses(profile));
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const parsed = addressSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error, "Invalid address data."), 400);
  }

  await connectDB();
  const profile = await UserModel.findById(user!.id);
  if (!profile) return jsonError("User not found.", 404);

  if (parsed.data.isDefault || profile.addresses.length === 0) {
    profile.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }
  profile.addresses.push({ ...parsed.data, isDefault: parsed.data.isDefault || profile.addresses.length === 0 });
  await profile.save();

  return NextResponse.json(serializeAddresses(profile.toObject()), { status: 201 });
}

export async function PUT(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const parsed = addressSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error, "Invalid address data."), 400);
  }
  if (!parsed.data._id) return jsonError("Address id is required.", 400);

  await connectDB();
  const profile = await UserModel.findById(user!.id);
  if (!profile) return jsonError("User not found.", 404);

  const address = profile.addresses.id(parsed.data._id);
  if (!address) return jsonError("Address not found.", 404);

  if (parsed.data.isDefault) {
    profile.addresses.forEach((entry) => {
      entry.isDefault = false;
    });
  }
  address.set(parsed.data);
  await profile.save();

  return NextResponse.json(serializeAddresses(profile.toObject()));
}

export async function DELETE(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { addressId } = await request.json();
  if (!addressId) return jsonError("Address id is required.", 400);

  await connectDB();
  const profile = await UserModel.findById(user!.id);
  if (!profile) return jsonError("User not found.", 404);

  const address = profile.addresses.id(addressId);
  if (!address) return jsonError("Address not found.", 404);
  const wasDefault = address.isDefault;
  address.deleteOne();
  if (wasDefault && profile.addresses.length > 0) {
    profile.addresses[0].isDefault = true;
  }
  await profile.save();

  return NextResponse.json(serializeAddresses(profile.toObject()));
}
