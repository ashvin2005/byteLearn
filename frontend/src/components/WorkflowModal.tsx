import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Stepper from "./Stepper";
import StepOne from "./steps/StepOne";
import StepTwo from "./steps/StepTwo";
import StepThree from "./steps/StepThree";
import StepFour from "./steps/StepFour";
import StepFive from "./steps/StepFive";
import {
  createCourse,
  prepareCourseData,
} from "@/services/courseService";
import { sendPdfForProcessing } from "@/services/pdfService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { API_BASE_URL } from "@/config/api";

interface WorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WorkflowModal: React.FC<WorkflowModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [textPrompt, setTextPrompt] = useState("");
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState(1);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [technicalTerms, setTechnicalTerms] = useState<
    Array<{ name: string; color: string }>
  >([]);
  const [chapterNames, setChapterNames] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfResponse, setPdfResponse] = useState<any>(null);

  // Array of distinct colors for pills
  const pillColors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#45B7D1", // Blue
    "#96CEB4", // Green
    "#FFEEAD", // Yellow
    "#D4A5A5", // Pink
    "#9B59B6", // Purple
    "#3498DB", // Light Blue
    "#E67E22", // Orange
    "#2ECC71", // Emerald
  ];

  // Reset all state when modal is closed
  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      setSelectedFiles([]);
      setTextPrompt("");
      setSelectedMethods([]);
      setSkillLevel(1);
      setChapterNames([]);
    }
  }, [open]);

  const processPdfFile = async (file: File) => {
    try {
      if (!file) {
        console.error("No file provided");
        return;
      }

      setIsProcessing(true);
      const formData = new FormData();
      formData.append("course_pdf", file);

      // Add book PDF if it exists (index 0)
      if (selectedFiles[0]) {
        formData.append(
          "book_pdf_name",
          selectedFiles[0].name.replace(".pdf", "").replace(" ", "_")
        );
      }

      const response = await sendPdfForProcessing(formData);

      if (response) {
        setPdfResponse(response);
        setWelcomeMessage(response.welcome_message || "");
        setCourseTitle(response.course_title || "");

        if (response.course_content?.Chapters) {
          const extractedChapters = Object.keys(
            response.course_content.Chapters
          )
            .map((key) => {
              const name = key.includes(":") ? key.split(":")[1]?.trim() : key.trim();
              return name;
            })
            .filter(Boolean);

          setChapterNames(extractedChapters);
        }

        // Extract all terms from the keywords response
        const {
          technical_terms = [],
          skills = [],
          technologies = [],
        } = response.keywords || {};

        // Combine all terms into a single array
        const allTerms = [...technical_terms, ...skills, ...technologies]
          .map((term) => term.trim())
          .filter((term) => term.length > 0);

        // Remove duplicates and map to objects with colors
        const uniqueTerms = Array.from(new Set(allTerms)).map(
          (term, index) => ({
            name: term,
            color: pillColors[index % pillColors.length],
          })
        );

        setTechnicalTerms(uniqueTerms);
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      setWelcomeMessage("Error processing your PDF. Please try again.");
      setTechnicalTerms([]);
    } finally {
      setIsProcessing(false);
    }
  };
  // Process the PDF when the user uploads it
  // Book PDF (index 0) is required, Course PDF (index 1) is optional
  useEffect(() => {
    const fileToProcess = selectedFiles[1] || selectedFiles[0];
    if (fileToProcess && !pdfResponse && !isProcessing) {
      processPdfFile(fileToProcess);
    }
  }, [selectedFiles]);

  const handleNext = async () => {
    if (currentStep === 5) {
      const generateUUID = () => {
        const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          }
        );
        return uuid;
      };

      const uuid = generateUUID();

      // Use the book PDF (index 0) instead of course PDF (index 1)
      const file = selectedFiles[0];
      if (!file) {
        console.error("No book PDF selected");
        toast({
          title: "Error",
          description: "Please select a book PDF file",
          variant: "destructive",
        });
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          toast({
            title: "Error",
            description: "You must be logged in to create a course.",
            variant: "destructive",
          });
          return;
        }

        // Ensure we have course content before creating
        if (!pdfResponse?.course_content?.Chapters || Object.keys(pdfResponse.course_content.Chapters).length === 0) {
          toast({
            title: "Missing Course Content",
            description: "PDF processing hasn't completed yet. Please wait for the content to be generated before creating the course.",
            variant: "destructive",
          });
          return;
        }

        // First, save the course data to Supabase with only the required fields
        const courseData = {
          course_id: uuid, // Use the generated UUID directly
          course_name: courseTitle || pdfResponse?.course_title || "Untitled Course",
          metadata: "",
          chapters_json: {
            chapters: chapterNames,
          },
          skill_level: skillLevel,
          teaching_pattern: selectedMethods,
          user_prompt: textPrompt,
          progress: 0,
          user_id: user.id,
          course_content: pdfResponse?.course_content,
          keywords: pdfResponse?.keywords || {},
        };

        const { data: newCourse, error } = await createCourse(courseData);

        if (error) {
          console.error("Failed to save course data:", error);
          toast({
            title: "Error",
            description: "Failed to create course. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // After course creation, upload the file
        const BookformData = new FormData();
        BookformData.append("file", file);
        BookformData.append("document_type", "book");
        // Ensure consistent naming by replacing spaces with underscores
        const documentName = file.name.replace(".pdf", "").replace(/\s+/g, "_");
        BookformData.append("document_name", documentName);
        BookformData.append("extract_images", "true");
        BookformData.append("extract_text", "true");
        BookformData.append("save_json", "true");
        BookformData.append("course_id", uuid);
        BookformData.append("user_id", user.id);

        toast({
          title: "Success",
          description: `Course Generation of "${courseTitle}" is now in progress !`,
          variant: "default",
          className:
            "text-green-500 [&>div>div:first-child]:text-green-500 [&>div>div:last-child]:text-white",
        });

        onOpenChange(false);


        const response = await fetch(
          `${API_BASE_URL}/api/upload_and_process2`,
          {
            method: "POST",
            body: BookformData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Upload failed with status:", response.status, "Error:", errorData);
          throw new Error(`Upload failed: ${errorData.message || response.statusText}`);
        }

        await response.json();

        // Create a Map to store chapter names and their topic IDs
        const chapterTopicIdsMap = new Map<string, string[]>();

        // Extract topic information from course content if available
        if (pdfResponse?.course_content?.Chapters) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const topicInfo: { chapterTopicIds: Record<string, string[]>; topicNames: Record<string, any> } = {
            chapterTopicIds: {},
            topicNames: {},
          };

          // Get the chapter IDs and their associated topic IDs from the newCourse response
          if (newCourse.chapters_json?.chapters) {
            for (const chapterId of newCourse.chapters_json.chapters) {
              // Fetch the chapter details to get its name and topic IDs
              const { data: chapterData, error: chapterError } = await supabase
                .from("chapters")
                .select("chapter_name, topics_json")
                .eq("chapter_id", chapterId)
                .single();

              if (chapterError) {
                console.error("Error fetching chapter data:", chapterError);
                continue;
              }

              if (chapterData) {
                const chapterName = chapterData.chapter_name;
                const topicIds = chapterData.topics_json?.topic_ids || [];

                // Store the topic IDs in the map
                chapterTopicIdsMap.set(chapterName, topicIds);
                topicInfo.topicNames[chapterName] = Object.values(
                  pdfResponse.course_content.Chapters[
                  `Chapter: ${chapterName}`
                  ] || {}
                );
              }
            }
          }

          // Prepare course data for backend
          const courseCallbackData = {
            course_id: newCourse.course_id,
            teaching_pattern: selectedMethods,
            user_prompt: textPrompt,
            skill_level: skillLevel,
            topic_info: topicInfo,
          };

          // Prepare the data for backend processing with topic IDs
          prepareCourseData(
            courseCallbackData,
            chapterTopicIdsMap
          );
        }

        toast({
          title: "Success",
          description: `Course "${courseTitle}" created successfully!`,
          variant: "default",
          className:
            "text-green-500 [&>div>div:first-child]:text-green-500 [&>div>div:last-child]:text-white",
        });

        onOpenChange(false);
      } catch (error) {
        console.error("Error in handleNext:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/30 backdrop-blur-[10px]" />
      <DialogContent
        className="
          max-w-[94vh] h-[94vh] 
          bg-zinc-900/95 border-zinc-800/50 
          backdrop-blur-lg
          fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]
          shadow-xl
          animate-in fade-in-0 zoom-in-95
          p-5
          flex flex-col
        "
      >
        <DialogHeader className="mb-0">
          <DialogTitle className="text-2xl font-bold text-white text-center">
            Create Learning Flow
          </DialogTitle>
          {/* <DialogDescription className="text-gray-400">
            Follow the steps to create your personalized learning experience
          </DialogDescription> */}
        </DialogHeader>

        <div className="mt-2">
          <Stepper currentStep={currentStep} totalSteps={5} />
        </div>

        <div className="flex-1 overflow-y-auto mt-4 ">
          {currentStep === 1 && (
            <StepOne
              selectedFiles={selectedFiles}
              onFilesChange={setSelectedFiles}
              className="animate-in fade-in-50"
            />
          )}
          {currentStep === 2 && (
            <StepTwo
              textPrompt={textPrompt}
              onTextPromptChange={setTextPrompt}
              className="animate-in fade-in-50"
            />
          )}
          {currentStep === 3 && (
            <StepThree
              className="animate-in fade-in-50"
              welcomeMessage={welcomeMessage}
              technicalTerms={technicalTerms}
              courseTitle={courseTitle}
              onCourseTitleChange={setCourseTitle}
              isProcessing={isProcessing}
            />
          )}
          {currentStep === 4 && (
            <StepFour
              selectedMethods={selectedMethods}
              onMethodsChange={setSelectedMethods}
              className="animate-in fade-in-50"
            />
          )}
          {currentStep === 5 && (
            <StepFive
              skillLevel={skillLevel}
              onSkillLevelChange={setSkillLevel}
              className="animate-in fade-in-50"
            />
          )}
        </div>

        <div className=" flex justify-between bg-zinc  border-zinc-800 pt-0">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              disabled={currentStep === 1 && selectedFiles.length === 0}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleNext}>Complete</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowModal;
