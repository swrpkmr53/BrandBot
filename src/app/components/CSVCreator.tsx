import { firestore } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { IStoredFile } from "./uploadFile";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Cross2Icon, UploadIcon, FileIcon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";

interface Props {}

const CSVCreator: NextPage<Props> = () => {
  const db = firestore;

  const [templates, setTemplates] = useState<IStoredFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [docFile, setDOCFile] = useState<File | null>();

  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const [createdCSV, setCreatedCSV] = useState<Blob | null>(null);
  const [open, setOpen] = useState(false);

  const fethcData = () => {
    setLoading(true);
    const col = collection(db, "CSVFiles");

    const unsub = onSnapshot(
      col,
      (snapshot) => {
        const templates = snapshot.docs.map((doc) => {
          return { ...doc.data(), id: doc.id } as IStoredFile;
        });
        setTemplates(templates);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        console.log(error);
      }
    );
  };

  useEffect(() => {
    fethcData();
  }, []);

  const startProcess = async () => {
    if (docFile && selectedTemplate) {
      try {
        setProcessing(true);
        console.log(selectedTemplate);
        const formData = new FormData();
        formData.append("doc", docFile);
        formData.append("templateUrl", selectedTemplate);
        const res = await fetch("/api/csv/", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        const csv = csvmaker(data.data);
        download(csv);
        console.log(data);
      } catch (e) {
        console.log(e);
        toast.error(`Oops ! Something Went Wrong: ${e}`);
      } finally {
        setProcessing(false);
      }
    }
  };

  const download = (data: any) => {
    // Creating a Blob for having a csv file format
    // and passing the data with type
    const blob = new Blob([data], { type: "text/csv" });

    // Creating an object for downloading url
    const url = window.URL.createObjectURL(blob);

    // Creating an anchor(a) tag of HTML
    const a = document.createElement("a");

    // Passing the blob downloading url
    a.setAttribute("href", url);

    // Setting the anchor tag attribute for downloading
    // and passing the download file name
    a.setAttribute("download", "download.csv");

    // Performing a download with click
    a.click();
  };
  const csvmaker = (data: any) => {
    // Empty array for storing the values
    let csvRows = [];

    // Headers is basically a keys of an
    // object which is id, name, and
    // profession
    const headers = Object.keys(data);

    // As for making csv format, headers
    // must be separated by comma and
    // pushing it into array
    csvRows.push(headers.join(","));

    // Pushing Object values into array
    // with comma separation
    const values = Object.values(data)
      .map((d) => (Array.isArray(d) ? d[0] : d))
      .join(",");
    csvRows.push(values);

    // Returning the array joining with new line
    return csvRows.join("\n");
  };
  return (
    <div className="">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button className=" hover:bg-slate-200 inline-flex h-[35px] items-center justify-center space-x-2 rounded-[4px] bg-slate-300 px-[15px] text-sm font-medium leading-none focus:border  focus:border-slate-400 focus:outline-none">
            <p> Create CSV File</p>
            <FileIcon className="text-blue-400" />
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0" />
          <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
            <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
              Create a CSV File
            </Dialog.Title>
            <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
              Upload a DOC file
            </Dialog.Description>

            <ToastContainer />
            {loading ? (
              <p>Fetching templates...</p>
            ) : (
              <div className="flex flex-col space-y-2">
                <label>Select a template</label>
                <select
                  name="templates"
                  id="temps"
                  className="p-2 bg-slate-200 rounded-md"
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option disabled selected>
                    {" "}
                    --Select a CSV Template --{" "}
                  </option>
                  {templates.map((temp, i) => (
                    <option key={i} value={temp.fileStorage.downloadUrl}>
                      {temp.templateName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <fieldset className="mb-[15px] mt-4">
              <p className=" w-full text-left text-[15px]">Select Doc File</p>
              <label
                className=" w-full text-center text-[15px] flex justify-center items-center mt-2 h-12 border border-dotted border-slate-400 rounded-md "
                htmlFor="docfile"
              >
                <UploadIcon className="" />
              </label>
              <input
                // className=" focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none  outline-none focus:border  focus:border-slate-400"
                id="docfile"
                type="file"
                accept=".docx"
                hidden
                onChange={(e) => {
                  const files = e.target.files;
                  console.log(files ? files[0] : "");

                  if (files) {
                    setDOCFile(files[0]);
                  }
                }}
              />
              {docFile ? (
                <button
                  className="inline-flex space-x-2 text-xs items-center px-2 bg-gray-200 rounded-sm py-2 mt-2"
                  onClick={() => setDOCFile(null)}
                >
                  <p>{docFile.name}</p>
                  <Cross2Icon />
                </button>
              ) : (
                ""
              )}
            </fieldset>

            <div className="mt-[25px] flex justify-end">
              <button
                className="bg-green-300 text-green11 text-sm hover:bg-green5 focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:border  focus:border-slate-400 focus:outline-none"
                disabled={processing}
                onClick={startProcess}
              >
                {processing ? (
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
                  "Start Process"
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

export default CSVCreator;
