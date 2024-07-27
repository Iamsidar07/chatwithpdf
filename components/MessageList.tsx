import { cn } from "@/lib/utils";
import { Bot, UserIcon } from "lucide-react";
import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { Message as AIMessage } from "ai";

interface MessageListProps {
  messages: AIMessage[];
}

const Message = ({ message }: { message: AIMessage }) => {
  return (
    <div
      className={cn("w-full max-w-[90%]", {
        "ml-auto": message.role === "user",
      })}
    >
      <div
        className={cn("bg-black text-white rounded p-2", {
          "bg-white ring-1 ring-gray-900/10 text-black":
            message.role === "user",
        })}
      >
        <MarkdownRenderer content={message.content} />
      </div>
      {message.role === "user" ? (
        <UserIcon className={"mt-2 text-gray-500 ml-auto"} />
      ) : (
        <Bot className={"mt-2 text-gray-500"} />
      )}
    </div>
  );
};

const MessageList = ({ messages }: MessageListProps) => {
  return (
    <div className="w-full h-full flex flex-col gap-2 p-2">
      {messages?.map((msg, i) => <Message key={i} message={msg} />)}
    </div>
  );
};

export default MessageList;
