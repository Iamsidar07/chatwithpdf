import { NextRequest } from "next/server";
import { CoreMessage, ImagePart, Message, streamText, UserContent } from "ai";
import { google } from "@ai-sdk/google";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { CohereEmbeddings } from "@langchain/cohere";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY, // In Node.js defaults to process.env.COHERE_API_KEY
  batchSize: 48, // Default value if omitted is 48. Max value is 96
  model: "embed-english-v3.0",
});

export const POST = async (req: NextRequest) => {
  try {
    const {
      messages,
      namespace,
    }: {
      messages: Message[];
      namespace?: string;
    } = await req.json();
    // @ts-ignore
    const lastMessage = messages[messages?.length - 1];

    const formatCoreMessage = (messages: Message[]) =>
      messages.map(
        (msg) => ({ role: msg.role, content: msg.content }) as CoreMessage,
      );
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace,
    });

    /* Search the vector DB independently with metadata filters */
    const results = await vectorStore.similaritySearch("pinecone", 2, {});
    const contextContent = results
      .map((result) => result.pageContent)
      .join("\n");
    const prompt: UserContent = [
      {
        type: "text",
        text: `
        <question>
        ${lastMessage.content}
        </question>
        <context>
        ${contextContent}
        </context>
        `,
      },
    ];

    const result = await streamText({
      model: google("models/gemini-1.5-flash-latest"),
      system: `
        You are an AI assistant who helps people find answers to their questions based on the given context. The context may includes text, images, and YouTube video transcriptions. Use all provided information to provide a comprehensive response.
        - Answer questions based on the context.
        - Reference images when relevant.
        - Integrate transcriptions and text seamlessly into your answers.
        - Be friendly and engaging.
      `,
      messages: [
        ...formatCoreMessage(messages),
        { role: "user", content: prompt },
      ],
      onFinish: async ({ text }) => {},
    });
    return result.toAIStreamResponse();
  } catch (error) {
    console.log(error);
    throw error;
  }
};
