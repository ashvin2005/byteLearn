// import { SidebarProvider } from "@/components/ui/sidebar";
// import { Navbar } from "@/components/Navbar";
import { CourseSidebar } from "@/components/CourseSidebar";
import { CourseContent } from "@/components/CourseContent";

const Index = () => {
  return (
    <div className="min-h-screen ">
      {/* <Navbar /> */}
      {/* <SidebarProvider> */}
      {/* <div className="flex min-h-screen "> */}
      <CourseSidebar />

      <CourseContent />
      {/* </div> */}
      {/* </SidebarProvider> */}
    </div>
  );
};

export default Index;
