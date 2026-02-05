export default function GenerateTab() {
  return (

<div className="flex flex-col items-center justify-center w-full h-full min-h-[40vh] select-none">
  <div className="flex items-center justify-center gap-10 mb-6 w-full max-w-xl">
    {/* Input nodes */}
    <div className="flex flex-col items-center">
      <div className="bg-[#202534] text-white rounded-full w-20 h-20 flex items-center justify-center border border-gray-600 shadow-sm mb-2 font-semibold">Topic</div>
    </div>
    <div className="flex flex-col items-center">
      <div className="bg-[#202534] text-white rounded-full w-20 h-20 flex items-center justify-center border border-gray-600 shadow-sm mb-2 font-semibold">Level</div>
    </div>
    <div className="flex flex-col items-center">
      <div className="bg-[#202534] text-white rounded-full w-20 h-20 flex items-center justify-center border border-gray-600 shadow-sm mb-2 font-semibold">Preferences</div>
    </div>
  </div>
  {/* Arrows */}
  <div className="flex items-center justify-center gap-10 w-full max-w-xl mb-2">
    {[1,2,3].map((_,i) => (
      <svg key={i} width="40" height="30" viewBox="0 0 40 30" className="mx-2">
        <line x1="20" y1="0" x2="20" y2="25" stroke="#888" strokeWidth="2" />
        <polygon points="15,25 25,25 20,30" fill="#888" />
      </svg>
    ))}
  </div>
  {/* Output node */}
  <div className="flex items-center justify-center mt-2">
    <div className="bg-[#23283A] text-white rounded-xl px-10 py-5 border border-gray-500 shadow-md font-bold text-lg tracking-wide">
      Generated Course
    </div>
  </div>
</div>
  );
}

