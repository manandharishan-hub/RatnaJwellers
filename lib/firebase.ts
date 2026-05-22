import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

if (!projectId || !clientEmail || !privateKey || !storageBucket) {
  throw new Error("Firebase storage environment variables are required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket,
  });
}

export const firebaseStorage = admin.storage().bucket();

export async function uploadImageToFirebase(name: string, buffer: Buffer, contentType: string) {
  const file = firebaseStorage.file(name);
  await file.save(buffer, {
    contentType,
    validation: "md5",
  });
  await file.makePublic();
  return file.publicUrl();
}
