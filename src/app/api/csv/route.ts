import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";

import { RetrievalQAChain } from "langchain/chains";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: Request) {
  try {
    //Get the input data passed as Formdata
    const params = await request.formData();
    const doc = params.get("doc");
    const fileUrl = params.get("templateUrl");

    //Load the Doc and CSV Template
    //First Step Download the Uploaded CSV Template
    const response = await fetch(fileUrl! as string);
    if (!response.ok) {
      return Response.error();
    }
    const csvBlob = await response.blob();
    const csvLoader = new CSVLoader(csvBlob);
    const csvData = await csvLoader.load();
    // console.log(csvData);

    //Now Load the Doc File Sent From Front End
    const docLoader = new DocxLoader(doc!);
    const docData = await docLoader.load();
    // console.log(docData);

    //Create Vector Stores For Both Files
    const docVectorStore = await MemoryVectorStore.fromDocuments(
      docData,
      new OpenAIEmbeddings()
    );
    const csvVectorStore = await MemoryVectorStore.fromDocuments(
      csvData,
      new OpenAIEmbeddings()
    );

    //Initialize the Model (Open AI text-davinci-001 has been used)
    const model = new OpenAI({
      openAIApiKey: OPENAI_API_KEY,
      maxTokens: 256,
      // temperature: 0.1,
    });

    const csvChain = RetrievalQAChain.fromLLM(
      model,
      csvVectorStore.asRetriever()
    );
    const csvRes = await csvChain.call({
      query: `You are supposed to answer questions from data provided. What are the available columns ? Just output the columns wihtout any extra text or information`,
    });

    // console.log(csvRes.text);

    const docChain = RetrievalQAChain.fromLLM(
      model,
      docVectorStore.asRetriever()
    );
    const docRes = await docChain.call({
      query: `Analyse the given data and summarise the data relevant to ${csvRes.text} columns, Output must be in JSON format, do not add any explainations or column names or any extra information just output the pure JSON format`,
    });

    const data = JSON.parse(docRes.text);
    return new Response(
      JSON.stringify({
        data: data,
        columns: csvRes.text,
      })
    );
  } catch (e) {
    console.log(e);
    return Response.error();
  }
}
