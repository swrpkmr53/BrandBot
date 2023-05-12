import { firestore } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { NextPage } from "next";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IStoredFile } from "./uploadFile";
interface Props {}

interface IMessage {
  id?: string;
  message: string;
  isUserMessage: boolean;
}

const Chat: NextPage<Props> = () => {
  const db = firestore;
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([
    {
      message: "Hey there ! How may I help you ?",
      isUserMessage: false,
    },
  ]);

  const [templates, setTemplates] = useState<IStoredFile[]>([]);
  const [tloading, setTLoading] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const chat = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    // toast.error(`Something Went Wrong!..`);
    if (input.length > 3 && e.key === "Enter" && !loading) {
      try {
        setLoading(true);

        const res = await fetch("/api/newchat/", {
          method: "POST",
          body: JSON.stringify({
            input: input,
            chatHistory: messages,
            templateUrl: selectedTemplate,
            templates: templates,
          }),
        });
        if (!res.ok) {
          toast.error(`Something Went Wrong!..${res.statusText}`);
          return;
        }
        const data = await res.text();
        const usrMsg: IMessage = {
          message: input,
          isUserMessage: true,
        };
        const msg: IMessage = {
          message: data,
          isUserMessage: false,
        };

        setMessages((msgs) => [...msgs, usrMsg, msg]);
        setInput("");
      } catch (e) {
        console.log(e);
        toast.error(`Something Went Wrong!..${e}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const fethcData = () => {
    setTLoading(true);
    const col = collection(db, "CSVFiles");

    const unsub = onSnapshot(
      col,
      (snapshot) => {
        const templates = snapshot.docs.map((doc) => {
          return { ...doc.data(), id: doc.id } as IStoredFile;
        });
        setTemplates(templates);
        setTLoading(false);
      },
      (error) => {
        setTLoading(false);
        console.log(error);
      }
    );
  };

  useEffect(() => {
    fethcData();
  }, []);

  return (
    <div className="min-w-full">
      <ToastContainer />
      {/* {tloading ? (
        <p>Fetching templates...</p>
      ) : (
        <div className="flex flex-col space-y-2">
          <label>Select a CSV</label>
          <select
            name="templates"
            id="temps"
            className="p-2 bg-slate-200 rounded-md"
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option disabled selected>
              {" "}
              --Select a CSV --{" "}
            </option>
            {templates.map((temp, i) => (
              <option key={i} value={temp.fileStorage.downloadUrl}>
                {temp.templateName}
              </option>
            ))}
          </select>
        </div>
      )} */}
      <div className="mt-4 bg-gray-200 shadow-lg  shadow-gray-400  rounded-md p-5 w-[100%]   min-h-[85vh] md:min-h-[85vh] lg:min-h-[80vh] max-h-[90vh] md:max-h-[85vh] lg:max-h-[80vh]  flex flex-col justify-between">
        <div className="overflow-y-scroll">
          {messages.map((msg, i) => (
            <div className=" mt-4" key={i}>
              <div
                className={`flex p-2 rounded-md items-start ${
                  msg.isUserMessage
                    ? "bg-slate-300 bg-opacity-50"
                    : "bg-none border border-slate-300 bg-opacity-30"
                }`}
              >
                <div
                  className={`p-1 mr-4 rounded-full bg-slate-300  ${
                    msg.isUserMessage ? "text-gray-600" : "  text-blue-400"
                  }`}
                >
                  {msg.isUserMessage ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M14 6H6v8h8V6z" />
                      <path
                        fillRule="evenodd"
                        d="M9.25 3V1.75a.75.75 0 011.5 0V3h1.5V1.75a.75.75 0 011.5 0V3h.5A2.75 2.75 0 0117 5.75v.5h1.25a.75.75 0 010 1.5H17v1.5h1.25a.75.75 0 010 1.5H17v1.5h1.25a.75.75 0 010 1.5H17v.5A2.75 2.75 0 0114.25 17h-.5v1.25a.75.75 0 01-1.5 0V17h-1.5v1.25a.75.75 0 01-1.5 0V17h-1.5v1.25a.75.75 0 01-1.5 0V17h-.5A2.75 2.75 0 013 14.25v-.5H1.75a.75.75 0 010-1.5H3v-1.5H1.75a.75.75 0 010-1.5H3v-1.5H1.75a.75.75 0 010-1.5H3v-.5A2.75 2.75 0 015.75 3h.5V1.75a.75.75 0 011.5 0V3h1.5zM4.5 5.75c0-.69.56-1.25 1.25-1.25h8.5c.69 0 1.25.56 1.25 1.25v8.5c0 .69-.56 1.25-1.25 1.25h-8.5c-.69 0-1.25-.56-1.25-1.25v-8.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <p className={` font-light text-sm`}>{msg.message}</p>
              </div>
            </div>
          ))}

          {/* <div className="flex  p-2 rounded-md">
          <div className="bg-slate-900 rounded-full  p-1 mr-4">
            
          </div>
          <p>Hey there !</p>
        </div> */}
        </div>
        <div className="flex w-full mt-4">
          <div className="relative bg-slate-400 bg-opacity-30  p-2  rounded-md flex items-center flex-1">
            <input
              type="text"
              className={`w-full bg-transparent block p-1 focus:outline-none text-slate-900  text-sm `}
              placeholder="ask anything"
              onKeyDown={(e) => chat(e)}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoFocus
              value={input}
            />

            {loading ? (
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-slate-300"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 mr-4 text-slate-500"
              >
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            )}
          </div>
          <button className="p-1 ml-2 bg-slate-400 bg-opacity-30 rounded-md px-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
              <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
