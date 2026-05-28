import { AdminLayout } from "@/components/admin/AdminLayout";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { connectDB } from "@/lib/mongodb";
import { requireAdminPage } from "@/lib/adminGuard";
import { defaultGalleryItems } from "@/lib/galleryDefaults";
import GalleryImageModel from "@/models/GalleryImage";

export const dynamic = "force-dynamic";

async function getGalleryItems() {
  try {
    await connectDB();
    const count = await GalleryImageModel.countDocuments();
    if (count === 0) {
      await GalleryImageModel.insertMany(defaultGalleryItems);
    }
    const items = await GalleryImageModel.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    return items.map((item) => ({
      _id: item._id.toString(),
      title: item.title,
      caption: item.caption,
      partnerLabel: item.partnerLabel,
      imageUrl: item.imageUrl,
      sortOrder: item.sortOrder,
      isPublished: item.isPublished,
    }));
  } catch {
    return defaultGalleryItems.map((item, index) => ({
      _id: `demo-${index}`,
      ...item,
    }));
  }
}

export default async function AdminGalleryPage() {
  await requireAdminPage();
  const items = await getGalleryItems();

  return (
    <AdminLayout>
      <GalleryManager initialItems={items} />
    </AdminLayout>
  );
}
