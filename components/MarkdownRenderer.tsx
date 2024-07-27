"use client";
import React from "react";
import { createRoot } from "react-dom/client";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Did you know you can use tildes instead of backticks for code in markdown? ✨
const markdown = `Here is some JavaScript code:

~~~js
console.log('It works!')
~~~
`;

const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <Markdown
      components={{
        code(props) {
          const { children, className, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <SyntaxHighlighter
              {...rest}
              PreTag="div"
              language={match[1]}
              style={dark}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </Markdown>
  );
};

export default MarkdownRenderer;
