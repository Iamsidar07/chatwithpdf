"use client";
import React, { useState, useTransition } from "react";
import { Button } from "./ui/button";
import { Loader, SendIcon } from "lucide-react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import { useParams } from "next/navigation";
import { ChatRequestOptions } from "ai";

interface ChatFooterProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (
    e?: { preventDefault: () => void },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  input: string;
}

const ChatFooter = ({
  handleSubmit,
  handleInputChange,
  input,
}: ChatFooterProps) => {
  const params = useParams();

  const [isPending, startTransition] = useTransition();
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => {
      handleSubmit(e, {
        body: {
          namespace: params.documentId as string,
        },
      });
    });
  };
  return (
    <div className="w-full h-full bg-white px-2 py-2.5">
      <form
        onSubmit={handleSendMessage}
        className="w-full h-full flex items-center gap-1"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          type="text"
          placeholder="Type your message here..."
          className="flex-1"
        />
        <Button
          disabled={isPending}
          type="submit"
          className="flex items-center gap-1"
        >
          {isPending ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <SendIcon className="w-4 h-4" />
          )}
          Send
        </Button>
      </form>
    </div>
  );
};

export default ChatFooter;
