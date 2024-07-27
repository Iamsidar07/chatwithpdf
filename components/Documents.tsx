"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Archive } from "lucide-react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@clerk/nextjs";
import DeleteDocument from "./DeleteDocument";
import Link from "next/link";

interface Document {
  id: string;
  createdAt: Timestamp;
  url: string;
  name: string;
  userId: string;
  namespace: string;
  status: string;
}

const DocumentItem = ({
  id,
  name,
  createdAt,
}: {
  id: string;
  name: string;
  createdAt: Timestamp;
}) => {
  return (
    <Link href={`/chats/${id}`} className="w-full">
      <div className="bg-white/30 w-full md:max-w-sm mx-auto aspect-square  border rounded-xl flex flex-col p-4 lg:p-6">
        <div className="flex-1">
          <h3 className="text-sm text-gray-500 font-semibold">{name}</h3>
          <p className="text-sm text-gray-500 opacity-80">
            {createdAt.toDate().toLocaleTimeString()}
          </p>
        </div>
        <DeleteDocument id={id} />
      </div>
    </Link>
  );
};

const Documents = () => {
  const { userId } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const getDocument = (userId: string) => {
    const q = query(
      collection(db, "documents"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Document,
      );
      setDocuments(data);
      console.log(data);
    });
    return unsubscribe;
  };

  useEffect(() => {
    if (userId) {
      const unsubscribe = getDocument(userId);
      return () => unsubscribe();
    }
  }, [userId]);

  return (
    <>
      {documents?.map((document) => (
        <DocumentItem key={document.id} {...document} />
      ))}
    </>
  );
};

export default Documents;
