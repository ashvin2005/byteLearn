import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, SetStateAction } from "react";

// Utility to convert hex color to rgba with opacity
type HexColor = string;
function hexToRgba(hex: HexColor, alpha: number) {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

import RotatingText from "@/components/RotatingText/RotatingText";

export default function LandingPage() {
  // Create a ref for the container holding the RotatingText
  const containerRef = useRef(null);
  // Track the active text index
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTextIndex, setActiveTextIndex] = useState(0);
  const rotatingTexts = ["Addictive", "Personalized", "Cool", "Fun", "Stick"];

  // Color palette for each rotating word
  const rotatingColors = [
    "#7dd3fc", // blue-300
    "#fbbf24", // yellow-400
    "#34d399", // green-400
    "#f472b6", // pink-400
    "#f87171", // red-400
  ];
  // State to track the current width
  const [containerWidth, setContainerWidth] = useState(0);
  // State for mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1100);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Custom handler to sync with text rotation
  const handleTextChange = (index: SetStateAction<number>) => {
    setActiveTextIndex(index);
  };

  // Effect to update the width based on current text
  useEffect(() => {
    // Create a temporary div to measure text width
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.visibility = "hidden";
    tempDiv.style.fontWeight = "bold";
    // Responsive font size for measuring
    tempDiv.style.fontSize = isMobile ? "2.5rem" : "8rem";
    tempDiv.className =
      "px-2 sm:px-2 md:px-3 overflow-hidden text-black py-0.5 sm:py-1 md:py-2 rounded-lg";
    tempDiv.textContent = rotatingTexts[activeTextIndex];
    document.body.appendChild(tempDiv);
    // Measure the width
    const width = tempDiv.getBoundingClientRect().width;
    setContainerWidth(isMobile ? width * 1.08 : width * 0.78);
    document.body.removeChild(tempDiv);
  }, [activeTextIndex, isMobile]);

  return (
    <>
      <motion.div
        initial={{ backgroundColor: "rgba(0,0,0,1)" }}
        animate={{
          backgroundColor: `${hexToRgba(rotatingColors[activeTextIndex], 0.12)}`,
        }}
        transition={{ duration: 0.5 }}
        className="min-h-screen w-full"
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      />
      <nav
        className="fixed top-0 left-0 w-full bg-transparent bg-opacity-0 backdrop-blur-3xl p-4 z-10"
        style={{ zIndex: 10 }}
      >
        <div className="container mx-auto flex flex-col sm:grid sm:grid-cols-3 items-center w-full">
          {/* Logo left */}
          <div className="flex items-center w-full sm:w-auto justify-between">
            <Link to="/">
              <span className="text-xl font-semibold tracking-tight text-white">
                ByteLearn
              </span>
            </Link>
            {/* Hamburger for mobile */}
            <button
              className="sm:hidden bg-transparent text-white focus:outline-none"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Nav links center (hidden on mobile) */}
          <div className="hidden sm:flex justify-center">
            <div className="flex space-x-8">
              {/* <a href="#features" className="text-white hover:text-cyan-300 transition-colors">Features</a>
              <a href="#testimonials" className="text-white hover:text-cyan-300 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-white hover:text-cyan-300 transition-colors">Pricing</a>
              <a href="#team" className="text-white hover:text-cyan-300 transition-colors">Team</a> */}
            </div>
          </div>

          {/* Auth buttons right (hidden on mobile) */}
          <div className="hidden sm:flex justify-end items-center space-x-4">
            <Link to="/SignIn">
              <Button
                className="bg-transparent text-white shadow-none border-none px-4 py-2 transition-colors hover:text-cyan-300"
                style={{ background: "transparent" }}
              >
                Login
              </Button>
            </Link>
            <Link to="/SignUp">
              <motion.button
                className="px-4 rounded-3xl text-white font-semibold shadow-md border-none focus:outline-none focus:ring-offset-2 focus:ring-cyan-300 transition-colors"
                style={{
                  background: rotatingColors[activeTextIndex],
                  color: "#000",
                }}
                animate={{ backgroundColor: rotatingColors[activeTextIndex] }}
                transition={{ duration: 0.4 }}
              >
                Create Account
              </motion.button>
            </Link>
          </div>

          {/* Mobile menu (dropdown) */}
          {showMobileMenu && (
            <div className="sm:hidden w-full mt-4 flex flex-col items-center space-y-4 bg-black bg-opacity-90 rounded-lg p-4">
              <a
                href="#features"
                className="text-white hover:text-cyan-300 transition-colors w-full text-center"
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="text-white hover:text-cyan-300 transition-colors w-full text-center"
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                className="text-white hover:text-cyan-300 transition-colors w-full text-center"
              >
                Pricing
              </a>
              <a
                href="#team"
                className="text-white hover:text-cyan-300 transition-colors w-full text-center"
              >
                Team
              </a>
              <Link to="/SignIn" className="w-full text-center">
                <Button
                  className="bg-transparent text-white shadow-none border-none px-4 py-2 transition-colors hover:text-cyan-300 w-full"
                  style={{ background: "transparent" }}
                >
                  Login
                </Button>
              </Link>
              <Link to="/SignUp" className="w-full text-center">
                <motion.button
                  className="px-4 py-2 rounded-3xl text-white font-semibold shadow-md border-none focus:outline-none focus:ring-offset-2 focus:ring-cyan-300 transition-colors w-full"
                  style={{
                    background: rotatingColors[activeTextIndex],
                    color: "#000",
                  }}
                  animate={{ backgroundColor: rotatingColors[activeTextIndex] }}
                  transition={{ duration: 0.4 }}
                >
                  Create Account
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      <section
        className="flex items-center justify-center"
        style={{ minHeight: "calc(100vh - 64px)", paddingTop: "64px" }}
      >
        <div className="container mx-auto flex flex-col items-center justify-center px-2 sm:px-4">
          {!isMobile ? (
            <p
              className={`font-bold text-white text-center break-words ${isMobile ? "text-2xl xs:text-3xl" : "text-4xl xs:text-5xl sm:text-6xl md:text-8xl"}`}
            >
              Learning but,
            </p>
          ) : null}
          {isMobile ? (
            <div className="flex flex-col items-center font-bold text-white mt-4 w-full">
              <span className="block text-2xl xs:text-3xl text-center w-full">
                Learning but,
              </span>
              <span className="block text-2xl xs:text-3xl text-center w-full mt-1">
                Make it
              </span>
              <span className="block text-2xl xs:text-3xl text-center w-full mt-1">
                <motion.span
                  ref={containerRef}
                  className="inline-block px-2 py-1 rounded-xl"
                  initial={{ backgroundColor: rotatingColors[activeTextIndex] }}
                  animate={{ backgroundColor: rotatingColors[activeTextIndex] }}
                  transition={{ duration: 0.4 }}
                >
                  <RotatingText
                    texts={rotatingTexts}
                    mainClassName="text-black text-2xl xs:text-3xl font-bold"
                    staggerFrom="last"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                    onNext={(index) => handleTextChange(index)}
                  />
                </motion.span>
              </span>
            </div>
          ) : (
            <div className="flex justify-center items-center text-4xl xs:text-5xl sm:text-6xl md:text-8xl font-bold text-white mt-4">
              <span className="flex flex-row items-center">
                Make it&nbsp;
                <motion.div
                  ref={containerRef}
                  className="relative overflow-hidden rounded-xl"
                  initial={{
                    width: 0,
                    backgroundColor: rotatingColors[activeTextIndex],
                  }}
                  animate={{
                    width: containerWidth,
                    backgroundColor: rotatingColors[activeTextIndex],
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    duration: 0.5,
                  }}
                >
                  <RotatingText
                    texts={rotatingTexts}
                    mainClassName="text-black overflow-hidden py-0.5 sm:py-1 md:py-1 justify-center"
                    staggerFrom="last"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                    onNext={(index) => handleTextChange(index)}
                  />
                </motion.div>
              </span>
            </div>
          )}
        </div>
      </section>
      {/* <section
        id="features"
        className="flex items-center justify-center"
        style={{ minHeight: 'calc(100vh)' }}
      >
        <div className="container mx-auto flex flex-col items-center justify-center">
          FeaturesTabs tabbed flowchart
          <FeaturesTabs />
        </div>
      </section> */}
    </>
  );
}

