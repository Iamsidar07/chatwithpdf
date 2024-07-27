"use client";
import { ChevronDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, storage } from "@/firebase";
import { Document as TDocument } from "./DrapAndDrop";
import { getDownloadURL, ref } from "firebase/storage";
import { useAuth } from "@clerk/nextjs";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const PdfView = () => {
  const { userId } = useAuth();
  const params = useParams();
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [document, setDocument] = useState<TDocument>();
  const [url, setUrl] = useState<string>();

  const getDocument = useCallback(async () => {
    if (!params.documentId) return;
    const docRef = doc(db, "documents", params.documentId as string);
    const docSnap = await getDoc(docRef);
    const url = await getDownloadURL(ref(storage, `/pdfs/${userId}`));
    console.log(url);
    setUrl(url);
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(data);
      if (data) {
        setDocument({ id: docSnap.id, ...data } as TDocument);
      }
    }
  }, [params?.documentId, userId]);

  useEffect(() => {
    getDocument();
  }, [getDocument]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const handleGoToPreviousPage = () => {
    setPageNumber((previousPageNumber) => {
      if (previousPageNumber === 1) return 1;
      return previousPageNumber - 1;
    });
  };

  const handleGoToNexPage = () => {
    setPageNumber((previousPageNumber) => {
      if (previousPageNumber === numPages) return numPages;
      return previousPageNumber + 1;
    });
  };

  const handlePageNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageNumber(Number(e.target.value) === 0 ? 1 : Number(e.target.value));
  };

  return (
    <div className="w-full h-full flex flex-col items-center bg-white/10 gap-1">
      <div className="flex items-center justify-between gap-2 px-4 py-1.5 w-full max-w-2xl mx-auto bg-white/75 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <div className="truncate">{document?.name}</div>
          <div className="flex items-center gap-2">
            <Button
              disabled={pageNumber === 1}
              onClick={handleGoToPreviousPage}
              variant="outline"
            >
              <ChevronLeft />
            </Button>
            <Input
              defaultValue={1}
              onChange={handlePageNumberChange}
              type="number"
              className="max-w-16"
              min={1}
              max={numPages}
            />
            <Button
              disabled={pageNumber === numPages}
              onClick={handleGoToNexPage}
              variant="outline"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>

        <DropdownMenu>
          <Button variant="outline">
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2">
                {scale * 100}% <ChevronDown />
              </div>
            </DropdownMenuTrigger>
          </Button>
          <DropdownMenuContent>
            <DropdownMenuLabel>Zoom</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setScale(1)}>
              100%
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setScale(1.25)}>
              125%
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setScale(1.5)}>
              150%
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1 overflow-y-auto ">
        <Document
          loading={<Loader2 className="w-6 h-6 mt-8 mx-auto animate-spin" />}
          file={document?.url}
          onLoadError={(e) => console.log(e)}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page className="shadow-lg" pageNumber={pageNumber} scale={scale} />
        </Document>
      </div>
    </div>
  );
};

export default PdfView;
