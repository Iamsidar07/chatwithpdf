import { db, storage } from "@/firebase";
import { auth } from "@clerk/nextjs/server";
import { CohereEmbeddings } from "@langchain/cohere";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { doc, Timestamp, updateDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { userId } = auth();
  const formData = await req.formData();
  const id = formData.get("id") as string;
  const file = formData.get("file") as File;

  const docRef = doc(db, "documents", id);
  try {
    // create doc
    await setDoc(docRef, {
      name: file.name,
      userId,
      createdAt: Timestamp.now(),
      status: "UPLOADING",
    });

    const arrayBuffer = await file.arrayBuffer();
    // upload pdf
    const storageRef = ref(storage, `pdfs/${userId}`);
    const res = await uploadBytes(storageRef, arrayBuffer);
    console.log(res.ref);
    const url = await getDownloadURL(storageRef);
    console.log({ url });
    await updateDoc(docRef, {
      url,
      status: "PROCESSING",
    });
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    const loader = new PDFLoader(blob, {
      splitPages: true,
      parsedItemSeparator: "",
    });
    const docs = await loader.load();
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

    const embeddings = new CohereEmbeddings({
      apiKey: process.env.COHERE_API_KEY, // In Node.js defaults to process.env.COHERE_API_KEY
      batchSize: 48, // Default value if omitted is 48. Max value is 96
      model: "embed-english-v3.0",
    });

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
      maxConcurrency: 5, // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
      namespace: id,
    });

    await updateDoc(docRef, {
      status: "SUCCESS",
    });

    return NextResponse.json({ status: "success" }, { status: 201 });
  } catch (error: any) {
    console.log("failed to upload", error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
};
