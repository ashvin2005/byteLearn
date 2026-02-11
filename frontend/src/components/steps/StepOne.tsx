import React, { useCallback, useState, useEffect } from "react";

import { Upload, Trash2, FileText } from "lucide-react";
import { Progress } from "../ui/progress";

interface StepOneProps {
  className?: string;
  selectedFiles: File[];
  onFilesChange: (files: File[]) => void;
}

interface FileInfo {
  file: File;
  progress: number;
  pageCount?: number;
  thumbnail?: string;
  error?: string;
}

const StepOne: React.FC<StepOneProps> = ({
  className,
  selectedFiles,
  onFilesChange,
}) => {
  const [fileInfos, setFileInfos] = useState<Record<number, FileInfo>>({});


  useEffect(() => {
    selectedFiles.forEach((file, index) => {
      if (file && !fileInfos[index]) {
        setFileInfos((prev) => ({
          ...prev,
          [index]: { file, progress: 100 },
        }));
        extractPDFInfo(file, index);
      }
    });
  }, []); 

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(2)} MB`;
    return `${(bytes / 1073741824).toFixed(2)} GB`;
  };

  const extractPDFInfo = async (file: File, index: number) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      try {

        const blob = new Blob([arrayBuffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);


        const pdfjsLib = await import("pdfjs-dist");
        const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;


        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });


        const aspectRatio = viewport.width / viewport.height;
        const targetWidth = 200;
        const targetHeight = targetWidth / aspectRatio;

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Could not get canvas context");


        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);


        const scaledViewport = page.getViewport({
          scale: targetWidth / viewport.width,
        });


        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
          background: "white",
        };

        try {
          await page.render(renderContext).promise;
          const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.95);

          setFileInfos((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              pageCount: pdf.numPages,
              thumbnail: thumbnailUrl,
            },
          }));
        } catch (renderError) {
          console.error("Error rendering PDF page:", renderError);
        }

        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error processing PDF:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const MAX_FILE_SIZE = 100;

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const file = event.target.files?.[0];
      if (!file) return;


      if (file.size > MAX_FILE_SIZE * 1024 * 1024) {
        setFileInfos((prev) => ({
          ...prev,
          [index]: {
            file,
            progress: 0,
            error: `File size exceeds ${MAX_FILE_SIZE}MB limit`,
          },
        }));
        return;
      }


      const newFiles = [...selectedFiles];
      newFiles[index] = file;
      onFilesChange(newFiles);


      if (index === 1 && newFiles[0]) {
        const formData = new FormData();
        formData.append('course_pdf', file);
        formData.append('book_pdf_name', newFiles[0].name.replace(".pdf", "").replace(" ", "_"));
        extractPDFInfo(file, index);
      } else {
        extractPDFInfo(file, index);
      }

      setFileInfos((prev) => ({
        ...prev,
        [index]: { file, progress: 0 },
      }));

      extractPDFInfo(file, index);


      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setFileInfos((prev) => ({
          ...prev,
          [index]: { ...prev[index], progress },
        }));
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 300);
    },
    [selectedFiles, onFilesChange]
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      onFilesChange(newFiles);
      setFileInfos((prev) => {
        const newInfos = { ...prev };
        delete newInfos[index];
        return newInfos;
      });
    },
    [selectedFiles, onFilesChange]
  );

  return (
    <div
      className={`${className} py-3 rounded-xl backdrop-blur-sm bg-zinc-900/30 border-zinc-800/50`}
    >
      <div className="space-y-2 w-full px-4">
        <div className="text-center space-y-3">
          <h3 className="text-lg font-semibold text-white">Upload PDF Files</h3>
        </div>

        <div className="space-y-6 w-full">
          {[0, 1].map((index) => (
            <div key={index} className="space-y-3 w-full">
              <p className="text-sm text-gray-400">
                {/* {index + 1}{" "} */}
                {index === 0 ? "Book PDF (Required)" : "Course PDF (Optional)"}
              </p>
              {!fileInfos[index] ? (
                <div className="relative flex flex-col items-center p-8 w-full bg-zinc-800/30 backdrop-blur-md border-2 border-dashed border-zinc-700/50 rounded-xl hover:bg-zinc-800/40 transition-all duration-300 group">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, index)}
                    accept=".pdf"
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    id={`file-upload-${index}`}
                  />
                  <div className="flex flex-col items-center justify-center w-full gap-1">
                    <div className="p-3 rounded-full bg-zinc-700/30 group-hover:bg-zinc-700/50 transition-colors duration-300">
                      <Upload className="h-4 w-4 text-gray-400 group-hover:text-gray-300" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-gray-300 pt-1">
                        Drop your PDF file here or
                        <span className="text-primary ml-1 hover:text-primary/80 cursor-pointer">
                          browse
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`bg-zinc-900/80 rounded-lg p-4 border shadow-lg transition-all duration-300 group w-full ${fileInfos[index].error
                    ? "border-red-500/50 hover:border-red-400/50"
                    : "border-zinc-700/30 hover:border-zinc-600/50"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    {fileInfos[index].thumbnail ? (
                      <div className="w-20 h-28 rounded-lg overflow-hidden bg-zinc-800/50 shadow-lg shadow-black/10 border border-zinc-600/30 backdrop-blur-sm group-hover:border-zinc-500/50 transition-all duration-300">
                        <img
                          src={fileInfos[index].thumbnail}
                          alt="PDF preview"
                          className="w-full h-full object-contain bg-white"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-16 rounded-lg bg-zinc-800/50 shadow-lg shadow-black/10 border border-zinc-600/30 backdrop-blur-sm group-hover:border-zinc-500/50 transition-all duration-300 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-zinc-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate">
                            {fileInfos[index].file.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                              {formatFileSize(fileInfos[index].file.size)}
                            </span>
                            {fileInfos[index].pageCount && (
                              <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                                {fileInfos[index].pageCount} pages
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="p-2 text-zinc-400 hover:text-red-400 transition-colors rounded-full hover:bg-zinc-800/50 -mr-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-3">
                        {fileInfos[index].error ? (
                          <p className="text-xs text-red-400">
                            {fileInfos[index].error}
                          </p>
                        ) : (
                          <Progress
                            value={fileInfos[index].progress}
                            className="h-1 bg-zinc-800/50"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepOne;
