import { ChainTool, JsonSpec } from "langchain/tools";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

import { JSONLoader } from "langchain/document_loaders/fs/json";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain, VectorDBQAChain } from "langchain/chains";
import {
  createJsonAgent,
  initializeAgentExecutorWithOptions,
  JsonToolkit,
} from "langchain/agents";

export async function POST(request: Request) {
  const model = new OpenAI({
    openAIApiKey: OPENAI_API_KEY,
    temperature: 0,
    // modelName: "gpt-3.5-turbo",
  });
  const params = await request.json();
  const input = params.input;
  const history = params.chatHistory;
  const fileUrl = params.templateUrl ?? "empty";
  const templates = params.templates;

  //Convert templates into a vecotr store
  let tjson = { ...templates };

  //Chat History Vector Store and Tools Creation
  let hjson = { ...history };
  //   const str = JSON.stringify(json);
  //   const bytes = new TextEncoder().encode(str);
  //   const blob = new Blob([bytes], {
  //     type: "application/json;charset=utf-8",
  //   });
  //   const histLoader = new JSONLoader(blob);
  //   const historyDocs = await histLoader.load();
  //   const hdocVectorStore = await MemoryVectorStore.fromDocuments(
  //     historyDocs,
  //     new OpenAIEmbeddings()
  //   );

  //   const tempInput =
  //     "Get all the template names, just the names without any extra information";
  //   const toolkit = new JsonToolkit(new JsonSpec(tjson));
  //   const executor = createJsonAgent(model, toolkit);
  //   const tresult = await executor.call({ input: tempInput });
  //   console.log(`Got output ${tresult.output}`);

  //   const histInput =
  //     "Get the data like chat history format. Don't add additional information just output as a JSON format";
  //   const htoolkit = new JsonToolkit(new JsonSpec(hjson));
  //   const hexecutor = createJsonAgent(model, htoolkit);
  //   const hresult = await hexecutor.call({ input: histInput });
  //   console.log(`Got output ${hresult.output}`);
  //   console.log(historyDocs);

  //   //Getting templates details and finalising
  //   const tempChain = RetrievalQAChain.fromLLM(
  //     model,

  //     hdocVectorStore.asRetriever()
  //   );
  //   const tRes = await tempChain.call({
  //     query: `Give me the provided data -- Output the data`,
  //   });
  //   console.log(`template : ${tRes.text}`);

  //Getting chat history details and finalising
  //   const historyChain = RetrievalQAChain.fromLLM(
  //     model,
  //     tdocVectorStore.asRetriever()
  //   );
  //   const hRes = await historyChain.call({
  //     query: `Analyse the given data and get the chat history, output in this format {
  // 		"user":"hello",
  // 		"system":"hey therer"
  // 	} JSON format`,
  //   });
  //   console.log(`history : ${hRes.text}`);

  const res = await model.call(
    `You are branding bot, you are used to get ideas about branding and create data based on the provided data.
  	 If you want the chat history you can look up in this ${JSON.stringify(
       hjson
     )}. 
	 If the user asks about about the Branding templates or templates details you 
	 should only answer from these template names ${JSON.stringify(tjson)}.
	 
	 If the user greets or asks for help ask them to choose a template from the provided dropdown and
	 Upload a doc file to get started, let the users know that the system will automatically
	 create a CSV file according to the template selected.

	 These are the step by step instructions to create ana automated CSV -
		1 - Click on Create CSV File
		2 - Select a template from the templates drop down.
		3 - Upload the relavant doc to get the data and create a CSV 
		4 - Generated CSV file will be downloaded automatically
	 Help the user with the information provided above.
	 Answer the questions according to : ${input} `
  );

  //   console.log(res);

  return new Response(res);
  //   return new Response("res");
}
