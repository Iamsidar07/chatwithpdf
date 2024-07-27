"use client";

import React from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatFooter from "./ChatFooter";
import { useChat } from "ai/react";

const ChatView = () => {
  const { handleInputChange, handleSubmit, input, messages } = useChat({
    onFinish(message) {
      console.log(message);
    },
  });

  return (
    <div className="w-full h-full overflow-auto flex flex-col">
      <div className="border-b">
        <ChatHeader />
      </div>
      <div className="flex-1 overflow-auto">
        <MessageList messages={messages} />
      </div>
      <div className="border-t transparent">
        <ChatFooter
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          input={input}
        />
      </div>
    </div>
  );
};

export default ChatView;
