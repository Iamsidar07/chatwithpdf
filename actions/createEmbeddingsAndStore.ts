"use server";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CohereEmbeddings } from "@langchain/cohere";
import { db, storage } from "@/firebase";
import {
  addDoc,
  collection,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
console.log(process.env.COHERE_API_KEY, "COHERE_API_KEY");

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY, // In Node.js defaults to process.env.COHERE_API_KEY
  batchSize: 48, // Default value if omitted is 48. Max value is 96
  model: "embed-english-v3.0",
});

const createEmbeddingsAndStore = async (blob: Blob, id: string) => {
  const ref = doc(collection(db, "documents", id));
  try {
    const loader = new PDFLoader(blob, {
      splitPages: true,
      parsedItemSeparator: "",
    });
    const docs = await loader.load();
    console.log({ docs });
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
      maxConcurrency: 5, // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
      namespace: id,
    });
    await updateDoc(ref, {
      status: "SUCCESS",
    });
  } catch (e) {
    console.log("failed to create embeddings and store", e);
    await updateDoc(ref, {
      status: "FAILED",
    });
  }
};

export default createEmbeddingsAndStore;
