"use client"

import { useState, useRef } from "react"

export function Enhanced3DCard({ 
  title, 

  description,  
  imageSrc 
}: { 
  title: string
  views: string
  description: string
  tags: string[]
  imageSrc: string
}) {
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - left
    const mouseY = e.clientY - top
    const xRotation = ((mouseX - width / 2) / width) * 10
    const yRotation = ((mouseY - height / 2) / height) * 20
    containerRef.current.style.transform = `rotateY(${xRotation}deg) rotateX(${-yRotation}deg)`
  }

  const handleMouseLeave = () => {
    if (!containerRef.current) return
    containerRef.current.style.transform = "rotateY(0deg) rotateX(0deg)"
    setIsHovered(false)
  }

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      className="relative w-full transition-all duration-700 ease-out transform-gpu perspective-1000"
    >
      <div className={`relative w-full transition-all duration-700 ease-out ${
        isHovered ? "aspect-[16/14]" : "aspect-video"
      }`}>
        {/* Background Image */}
        <img
          src={imageSrc}
          alt={title}
          className="object-cover w-full h-full rounded-xl"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4361ee]/30 via-[#7209b7]/30 to-[#3a0ca3]/30 rounded-xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent rounded-xl" />

        {/* Content Container */}
        <div className={`absolute inset-x-0 bottom-0 p-5 transition-all duration-700 ease-out ${
          isHovered ? "translate-y-0" : "translate-y-0"
        }`}>
          {/* Title and Views */}
          <div>
            <div className="flex justify-between items-start mb-0">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <div className="flex items-center gap-1 text-white/90">
              </div>
            </div>
          </div>

          <div>
            <div className={`transition-all duration-700 ease-out overflow-hidden ${
              isHovered ? "max-h-20 opacity-100 mb-4" : "max-h-0 opacity-0"
            }`}>
              <p className="text-white/80 text-sm line-clamp-2">
                {description}
              </p>
            </div>
          </div>

          {/* Tags */}
          {/* <CardItem translateZ="40">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-white/10 text-white/90 border-white/20 backdrop-blur-sm text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardItem> */}
        </div>
      </div>
    </div>
  )
}
