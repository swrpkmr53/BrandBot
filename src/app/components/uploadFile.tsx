import { NextPage } from "next";
import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Progress from "@radix-ui/react-progress";

import { Cross2Icon, UploadIcon } from "@radix-ui/react-icons";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { fireStorage, firestore } from "@/lib/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
interface Props {}

export interface IStoredFile {
  id?: string;
  templateName: string;
  fileStorage: {
    path: string;
    downloadUrl: string;
  };
  dateUploaded: string;
}

const UploadFile: NextPage<Props> = () => {
  const storage = fireStorage;
  const db = firestore;
  const [csvFile, setCSVFile] = useState<File | null>();
  const [fileName, setFileName] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [percentage, setPercentage] = useState<number>(0);
  const [open, setOpen] = React.useState(false);

  const uploadFile = () => {
    if (csvFile && fileName.length >= 2) {
      try {
        setSaving(true);
        let path = `CSVFiles/${Timestamp.now().seconds}_${csvFile.name}`;
        let storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, csvFile);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.floor(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setPercentage(progress);
          },
          (error) => {
            throw error;
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(
              async (downloadURL) => {
                const col = collection(firestore, "CSVFiles");
                const fileData: IStoredFile = {
                  templateName: fileName,
                  fileStorage: {
                    path: path,
                    downloadUrl: downloadURL,
                  },
                  dateUploaded: new Date().toDateString(),
                };
                await addDoc(col, fileData);
                toast.success("File Uploaded Successfully!");
                setCSVFile(null);
                setFileName("");
                setSaving(false);
                setOpen(false);
              }
            );
          }
        );
      } catch (e) {
        console.log(e);
        toast.error(`Something went wrong: ${e}`);
      } finally {
      }
    }
  };

  return (
    <div>
      <ToastContainer />
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button className=" hover:bg-slate-200 inline-flex h-[35px] items-center justify-center space-x-2 rounded-[4px] bg-slate-300 px-[15px] text-sm font-medium leading-none focus:border  focus:border-slate-400 focus:outline-none">
            <p> Upload Template File</p>
            <UploadIcon className="text-blue-400" />
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0" />
          <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
            <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
              Upload CSV File
            </Dialog.Title>
            <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
              Upload the CSV file to cloud - Give a suitable template name
            </Dialog.Description>
            <fieldset className="mb-[15px]">
              <label
                className=" w-[90px] text-right text-[15px]"
                htmlFor="name"
              >
                Template Name
              </label>
              <input
                className=" mt-2 bg-slate-200 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none  outline-none focus:border  focus:border-slate-400"
                id="name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </fieldset>
            <fieldset className="mb-[15px]">
              <p className=" w-full text-left text-[15px]">Select CSV File</p>
              <label
                className=" w-full text-center text-[15px] flex justify-center items-center mt-2 h-12 border border-dotted border-slate-400 rounded-md "
                htmlFor="csvfile"
              >
                <UploadIcon className="" />
              </label>
              <input
                // className=" focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none  outline-none focus:border  focus:border-slate-400"
                id="csvfile"
                type="file"
                accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                hidden
                onChange={(e) => {
                  const files = e.target.files;
                  console.log(files ? files[0] : "");

                  if (files) {
                    setCSVFile(files[0]);
                  }
                }}
              />
              {csvFile ? (
                <button
                  className="inline-flex space-x-2 text-xs items-center px-2 bg-gray-200 rounded-sm py-2 mt-2"
                  onClick={() => setCSVFile(null)}
                >
                  <p>{csvFile.name}</p>
                  <Cross2Icon />
                </button>
              ) : (
                ""
              )}
            </fieldset>

            {percentage > 0 && percentage < 100 ? (
              <Progress.Root
                className="relative overflow-hidden bg-slate-400 rounded-md w-full h-[15px]"
                style={{
                  // Fix overflow clipping in Safari
                  // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
                  transform: "translateZ(0)",
                }}
                value={percentage}
              >
                <Progress.Indicator
                  className="bg-blue-400 w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]"
                  style={{ transform: `translateX(-${100 - percentage}%)` }}
                />
              </Progress.Root>
            ) : (
              ""
            )}

            <div className="mt-[25px] flex justify-end">
              <button
                className="bg-green-300 text-green11 text-sm hover:bg-green5 focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:border  focus:border-slate-400 focus:outline-none"
                disabled={saving}
                onClick={uploadFile}
              >
                {saving ? (
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className="inline w-4 h-4  text-gray-200 animate-spin dark:text-gray-600 fill-slate-300"
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
                  "Save template"
                )}
              </button>
            </div>
            <Dialog.Close asChild>
              <button
                className=" hover:bg-violet4 bg-red-50  absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:border  focus:border-slate-400 focus:outline-none"
                aria-label="Close"
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default UploadFile;
