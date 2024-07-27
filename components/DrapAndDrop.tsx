"use client";

import { Check, Loader, PlusIcon, Ship, Upload } from "lucide-react";
import React, { useEffect, useState, useTransition } from "react";
import Dropzone from "react-dropzone";
import { toast } from "sonner";
import { nanoid } from "nanoid";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { db, storage } from "@/firebase";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, Timestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useAuth } from "@clerk/nextjs";
import createEmbeddingsAndStore from "@/actions/createEmbeddingsAndStore";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CohereEmbeddings } from "@langchain/cohere";

enum Status {
  Uploading,
  Uploaded,
  Error,
  Processing,
}

export interface Document {
  id?: string;
  createdAt: Timestamp;
  url: string;
  name: string;
  userId: string;
  namespace: string;
  status: Status;
}

const DrapAndDrop = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [loadingMsgAndIcon, setLoadingMsgAndIcon] = useState({
    icon: <Ship className="w-4 h-4 text-gray-500 md:w-8 md:h-8 mx-auto" />,
    msg: "Uploading...",
  });

  const getDocument = (id: string) => {
    const ref = doc(db, "documents", id);
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const data = snapshot.data();
      console.log("from snapshot: ", data);
      setStatus(data?.status);
    });
    return unsubscribe;
  };

  useEffect(() => {
    if (currentDocId) {
      const unsubscribe = getDocument(currentDocId);
      return () => unsubscribe();
    }
  }, [currentDocId]);
  useEffect(() => {
    switch (status) {
      case "UPLOADING":
        setLoadingMsgAndIcon({
          icon: (
            <Upload className="w-4 h-4 text-gray-500 md:w-8 md:h-8 mx-auto" />
          ),
          msg: "Uploading...",
        });
        break;
      case "PROCESSING":
        setLoadingMsgAndIcon({
          icon: (
            <Loader className="w-4 h-4 text-gray-500 md:w-8 md:h-8 mx-auto animate-spin" />
          ),
          msg: "Creating embedding...",
        });
        break;
      case "SUCCESS":
        setLoadingMsgAndIcon({
          icon: (
            <Check className="w-4 h-4 text-gray-500 md:w-8 md:h-8 mx-auto" />
          ),
          msg: "Successfully created",
        });
        break;
      case "FAILED":
        setLoadingMsgAndIcon({
          icon: (
            <Ship className="w-4 h-4 text-gray-500 md:w-8 md:h-8 mx-auto" />
          ),
          msg: "Something went wrong",
        });
        break;
    }
  }, [status]);

  const handleDropFile = (files: File[]) => {
    console.log(files);
    if (files.length === 0) return;
    setFile(files[0]);
    console.log("file", files[0]);
    const id = nanoid();
    setCurrentDocId(id);
    startTransition(async () => {
      const file = files[0];
      console.log("file", file);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("id", id);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        console.log("data", data);
        if (!res.ok) {
          toast.error(data.message);
          return;
        }
        toast.success("Document created");
        router.push(`/chats/${id}`);
      } catch (error) {
        console.log("Failed to create doc", error);
        toast.error("Failed to create doc");
        return;
      }
    });
  };

  return (
    <div className="w-full h-full">
      <Dropzone onDrop={(acceptedFiles) => handleDropFile(acceptedFiles)}>
        {({ getRootProps, getInputProps }) => (
          <section>
            <div {...getRootProps()} className="w-full h-full">
              <input accept=".pdf" {...getInputProps()} />
              <div className="bg-white/30 w-full md:max-w-xs mx-auto border rounded-xl grid place-items-center h-full">
                <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  <PlusIcon className="w-4 h-4 text-gray-500 md:w-8 md:h-8" />
                  <p className="text-sm text-gray-500 mt-2">
                    Add a new document
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </Dropzone>

      <Dialog open={isPending} onOpenChange={setIsOpen}>
        <DialogContent className="w-full sm:w-96 p-4 sm:p-8">
          <DialogHeader>
            <DialogTitle>{loadingMsgAndIcon.icon}</DialogTitle>
            <DialogDescription>{loadingMsgAndIcon.msg}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrapAndDrop;
