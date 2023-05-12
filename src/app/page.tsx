"use client";

import Chat from "./components/Chat";
import CSVCreator from "./components/CSVCreator";
import UploadFile from "./components/uploadFile";
import * as Tabs from "@radix-ui/react-tabs";

export default function Home() {
  return (
    <main className="flex bg-gray-100 min-h-screen flex-col items-center p-6 md:p-24 lg:p-24 overscroll-contain ">
      <div className="text-center">
        <h1 className="text-lg font-bold">Brand Bot1</h1>

        <div className="flex justify-center space-x-4">
          <UploadFile />
          <CSVCreator />
        </div>
      </div>

      {/* <Tabs.Root
        className="flex flex-col w-[100%] md:w-[60%] xl:w-[60%]  mt-4 "
        defaultValue="tab1"
      >
        <Tabs.List
          className="shrink-0 flex border-b border-mauve6"
          aria-label="Manage your account"
        >
          <Tabs.Trigger
            className="bg-none px-5 h-[45px] flex-1 flex items-center justify-center text-[15px] leading-none text-mauve11 select-none first:rounded-tl-md last:rounded-tr-md hover:text-violet11 data-[state=active]:text-blue-400 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative data-[state=active]:focus:shadow-[0_0_0_2px] data-[state=active]:focus:shadow-black outline-none cursor-default"
            value="tab1"
          >
            CSV Creator
          </Tabs.Trigger>
          <Tabs.Trigger
            className="bg-none px-5 h-[45px] flex-1 flex items-center justify-center text-[15px] leading-none text-mauve11 select-none first:rounded-tl-md last:rounded-tr-md hover:text-violet11 data-[state=active]:text-blue-400 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative data-[state=active]:focus:shadow-[0_0_0_2px] data-[state=active]:focus:shadow-black outline-none cursor-default"
            value="tab2"
          >
            Document Chat
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content
          className="grow p-5 bg-none rounded-b-md outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
          value="tab1"
        >
          <CSVCreator />
        </Tabs.Content>
        <Tabs.Content
          className="grow p-5 bg-none rounded-b-md outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
          value="tab2"
        >
          <Chat />
        </Tabs.Content>
      </Tabs.Root> */}

      <Chat />
      {/* <CSVCreator /> */}
    </main>
  );
}
