import ChatView from "@/components/ChatView";
import PdfView from "@/components/PdfView";
import React from "react";

interface Props {
  params: {
    documentId: string;
  };
}

const ChatPage = ({ params }: Props) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-center w-full border h-[calc(100vh-64px)] overflow-auto">
      <div className="hidden md:flex md:w-[60%] md:border-r">
        <PdfView />
      </div>
      <div className="w-full md:w-[40%] max-h-full bg-white">
        <ChatView />
      </div>
    </div>
  );
};

export default ChatPage;
