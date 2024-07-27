"use client";
import React, { useTransition } from "react";
import { Button } from "./ui/button";
import { Archive, Loader } from "lucide-react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { toast } from "sonner";

const DeleteDocument = ({ id }: { id: string }) => {
  const [isPending, startTransition] = useTransition();
  const handleDelete = (e: any) => {
    e.stopPropagation();
    startTransition(async () => {
      try {
        console.log("delete");
        const docRef = doc(db, "documents", id);
        await deleteDoc(docRef);
        toast.success("Document deleted successfully");
      } catch (error) {
        console.error("Error deleting document:", error);
        toast.error("Error deleting document");
      }
    });
  };
  return (
    <Button
      disabled={isPending}
      onClick={(e) => handleDelete(e)}
      variant={"destructive"}
      className="flex items-center gap-1"
    >
      {isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Archive />}
      <span className="ml-2">Archive</span>
    </Button>
  );
};

export default DeleteDocument;
