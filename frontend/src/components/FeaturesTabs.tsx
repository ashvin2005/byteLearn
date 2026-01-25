import React, { useState } from "react";
import GenerateTab from "./features/GenerateTab";
import PersonalizeTab from "./features/PersonalizeTab";
import LearnTab from "./features/LearnTab";
import SaveTab from "./features/SaveTab";
import TrackTab from "./features/TrackTab";
import RepeatTab from "./features/RepeatTab";

const TABS = [
  { label: "Generate", component: <GenerateTab /> },
  { label: "Personalize", component: <PersonalizeTab /> },
  { label: "Learn", component: <LearnTab /> },
  { label: "Save", component: <SaveTab /> },
  { label: "Track", component: <TrackTab /> },
  { label: "Repeat", component: <RepeatTab /> },
];

export default function FeaturesTabs() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="min-h-[100vh] w-full flex flex-col items-center justify-center relative ">
      <div className=" w-full max-w-full  ">
        <div
          className="backdrop-blur-lg bg-white/10  w-full   rounded-3xl p-4 relative"
          // style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.22)', border: '1px solid rgba(255,255,255,0.18)' }}
        >
          {TABS[activeTab].component}
        </div>
      </div>
      {/* Tab Switcher */}
      <div className="flex justify-center w-full absolute left-0 " style={{bottom: '6vh'}}>
        <div className="relative flex bg-[#6e6e6e11] rounded-full px-2 py-2 gap-2  ">
          {TABS.map((tab, idx) => (
            <button
              key={tab.label}
              className={`relative px-9 py-2 rounded-full font-semibold transition-all duration-200 text-lg flex items-center justify-center
                ${activeTab === idx
                  ? " z-10"
                  : " z-0"}
              `}
              style={{
                fontFamily: 'inherit',
                backgroundColor: activeTab === idx ? 'rgba(255,255,255,0.09)' : 'transparent',
                color: activeTab === idx ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.5)',
                transition: 'all 200ms ease-in-out'
              }}
              onClick={() => setActiveTab(idx)}
            >
              {tab.label}
              {activeTab === idx && (
                <span className="absolute left-2 right-2 -bottom-1 h-1 rounded-full  " style={{zIndex:2}} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
