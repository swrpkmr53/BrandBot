import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";

import { RetrievalQAChain } from "langchain/chains";
import fs from "fs";
import path from "path";
import { headers } from "next/dist/client/components/headers";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_CSV_URL =
  "https://firebasestorage.googleapis.com/v0/b/filevision-ai.appspot.com/o/2018.csv?alt=media&token=33121156-d2a1-4e0a-80bf-f3cfd633fb95";

export async function POST(request: Request) {
  try {
    const params = await request.json();
    const input = params.input;
    const fileUrl = params.fileUrl;

    const URL = fileUrl ? fileUrl : DEFAULT_CSV_URL;
    const response = await fetch(URL);

    if (!response.ok) {
      return Response.error();
    }

    const blob = await response.blob();
    const loader = new CSVLoader(blob);
    const docs = await loader.load();
    const vectorStore = await MemoryVectorStore.fromDocuments(
      docs,
      new OpenAIEmbeddings()
    );
    const model = new OpenAI({
      openAIApiKey: OPENAI_API_KEY,
      maxTokens: 256,
      // temperature: 0.1,
    });
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
    const res = await chain.call({
      query: `Always try to provide answer with the dataset provided. You are supposed to answer questions from data provided. ${input}`,
    });

    return new Response(res.text);
  } catch (e) {
    console.log(e);
    return Response.error();
  }
}
