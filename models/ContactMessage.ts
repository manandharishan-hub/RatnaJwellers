import mongoose, { Document, Model } from "mongoose";

export interface ContactMessageDoc extends Document {
  name: string;
  email: string;
  message: string;
  status: "new" | "reviewed";
}

const contactMessageSchema = new mongoose.Schema<ContactMessageDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["new", "reviewed"], default: "new" },
  },
  { timestamps: true }
);

const ContactMessageModel =
  (mongoose.models.ContactMessage as Model<ContactMessageDoc>) ||
  mongoose.model<ContactMessageDoc>("ContactMessage", contactMessageSchema, "contact_messages");

export default ContactMessageModel;
