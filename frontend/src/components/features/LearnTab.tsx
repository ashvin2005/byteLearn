import SegoeUI from "@/assets/bookmark.png"

export default function LearnTab() {
  return (
    <div className="relative h-[60vh] w-full rounded-lg">
      <img
        src={SegoeUI}
        className="absolute inset-0 h-full w-full object-cover rounded-2xl"
        alt="book mark"
      />
    </div>
  );
}
