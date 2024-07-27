"use server";

import { db, storage } from "@/firebase";
import { Timestamp, doc, updateDoc } from "firebase/firestore";
import { auth } from "@clerk/nextjs/server";
import createEmbeddingsAndStore from "./createEmbeddingsAndStore";
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";

const createDocument = async (id: string, buffer?: File, name?: string) => {
  console.log("createDocument", { id, buffer, name });
  return;
  const docRef = doc(db, "documents", id);
  const { userId } = auth().protect();
  console.log("userId: ", userId);
  try {
    // create doc
    updateDoc(docRef, {
      name: name,
      userId,
      createdAt: Timestamp.now(),
      status: "UPLOADING",
    });
    // upload pdf
    const storageRef = ref(storage, `pdfs/${userId}`);
    await uploadBytes(storageRef, buffer);
    const url = await getDownloadURL(storageRef);
    updateDoc(docRef, {
      url,
      status: "PROCESSING",
    });
    await createEmbeddingsAndStore(buffer, id);
    return { success: true };
  } catch (error) {
    updateDoc(docRef, {
      status: "FAILED",
    });
    console.log("Failed to create doc", error);
    return { success: false };
  }
};

export default createDocument;
