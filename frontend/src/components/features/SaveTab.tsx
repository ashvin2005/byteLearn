import SegoeUI from "@/assets/bookmark.png"
export default function SaveTab() {
  return (
    <div className="justify-content-center text-white text-center ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 justify-center">
        {/* Card 1 */}
        <div className="bg-[#9292921d] rounded-xl shadow-lg flex flex-col min-h-[30vh]" style={{
          backgroundImage: "url(" + SegoeUI + ")",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        </div>
        <div className="bg-[#9292921d] rounded-xl shadow-lg flex flex-col min-h-[30vh]" style={{
          backgroundImage: "url(" + SegoeUI + ")",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        </div>
        <div className="bg-[#9292921d] rounded-xl shadow-lg flex flex-col min-h-[30vh]" style={{
          backgroundImage: "url(" + SegoeUI + ")",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        </div>
        <div className="bg-[#9292921d] rounded-xl shadow-lg flex flex-col min-h-[30vh]" style={{
          backgroundImage: "url(" + SegoeUI + ")",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        </div>
      </div>
    </div>
  );
}
