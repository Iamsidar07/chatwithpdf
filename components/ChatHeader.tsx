import Image from "next/image";
import React from "react";

const ChatHeader = () => {
  return (
    <div className="w-full bg-white/75 backdrop-blur-lg px-2 py-3.5 flex items-center gap-1">
      <Image
        src="/og.webp"
        alt="logo"
        width={30}
        height={30}
        className="object-contain rounded-full"
      />
      Chat with pdf
    </div>
  );
};

export default ChatHeader;
