"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Stage, Layer, Circle, Text, Rect, Group, Image as KonvaImage } from "react-konva";
import usePresenceStore from "@/store/presenceStore";
import { ZoomIn, Maximize } from "lucide-react";

export default function OfficeCanvas({ userId, userName, layout }) {
  const { users, move } = usePresenceStore();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [myPos, setMyPos] = useState({ x: 500, y: 400 }); 
  const [viewMode, setViewMode] = useState("follow"); // "follow" or "full"
  const [backgroundImage, setBackgroundImage] = useState(null);
  const containerRef = useRef(null);
  const posRef = useRef({ x: 500, y: 400 });

  useEffect(() => {
    const img = new window.Image();
    img.src = "/assets/office-bg.png";
    img.onload = () => setBackgroundImage(img);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
     if (users[userId]) {
         const newPos = { x: users[userId].x, y: users[userId].y };
         setMyPos(newPos);
         posRef.current = newPos;
     }
  }, [userId, users]);

  const handleKeyDown = (e) => {
    const key = e.key.toLowerCase();
    const movementKeys = ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "s", "a", "d"];
    if (!movementKeys.includes(key)) return;
    
    e.preventDefault();
    let { x, y } = posRef.current;
    let nextX = x;
    let nextY = y;
    const step = 20;

    if (key === "arrowup" || key === "w") nextY -= step;
    if (key === "arrowdown" || key === "s") nextY += step;
    if (key === "arrowleft" || key === "a") nextX -= step;
    if (key === "arrowright" || key === "d") nextX += step;
    
    const maxX = backgroundImage?.width || 1000;
    const maxY = backgroundImage?.height || 800;
    nextX = Math.max(20, Math.min(nextX, maxX - 20));
    nextY = Math.max(20, Math.min(nextY, maxY - 20));
    
    const newPos = { x: nextX, y: nextY };
    setMyPos(newPos);
    posRef.current = newPos;
    move(nextX, nextY);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [backgroundImage, layout]);

  // Scaling & Centering Logic
  const { scale, offsetX, offsetY } = useMemo(() => {
    if (!backgroundImage || dimensions.width === 0) return { scale: 1, offsetX: 0, offsetY: 0 };
    
    if (viewMode === "follow") {
        // --- Follow-Camera (Zoomed-in) Logic ---
        const s = 2.5; 
        let offX = dimensions.width / 2 - myPos.x * s;
        let offY = dimensions.height / 2 - myPos.y * s;

        const minX = dimensions.width - backgroundImage.width * s;
        const minY = dimensions.height - backgroundImage.height * s;
        
        if (backgroundImage.width * s > dimensions.width) {
            offX = Math.min(0, Math.max(offX, minX));
        } else {
            offX = (dimensions.width - backgroundImage.width * s) / 2;
        }

        if (backgroundImage.height * s > dimensions.height) {
            offY = Math.min(0, Math.max(offY, minY));
        } else {
            offY = (dimensions.height - backgroundImage.height * s) / 2;
        }

        return { scale: s, offsetX: offX, offsetY: offY };
    } else {
        // --- Full-Map (Overview) Logic ---
        const imgRatio = backgroundImage.width / backgroundImage.height;
        const containerRatio = dimensions.width / dimensions.height;
        let s = containerRatio > imgRatio 
          ? dimensions.height / backgroundImage.height 
          : dimensions.width / backgroundImage.width;
        s = s * 0.95; // Slight padding

        return {
          scale: s,
          offsetX: (dimensions.width - backgroundImage.width * s) / 2,
          offsetY: (dimensions.height - backgroundImage.height * s) / 2
        };
    }
  }, [backgroundImage, dimensions, myPos, viewMode]);

  const handleCanvasClick = (e) => {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (pointer) {
      const x = (pointer.x - offsetX) / scale;
      const y = (pointer.y - offsetY) / scale;
      
      const newPos = { x, y };
      setMyPos(newPos);
      posRef.current = newPos;
      move(x, y);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0a0c16] flex items-center justify-center overflow-hidden outline-none relative" tabIndex={0}>
      
      {/* View Toggle Controls */}
      <div className="absolute top-6 left-6 z-10 flex space-x-2">
         <button 
           onClick={() => setViewMode(viewMode === "follow" ? "full" : "follow")}
           className="glass p-3 rounded-xl glow hover:scale-105 active:scale-95 transition-all text-blue-400 flex items-center space-x-2 border border-blue-500/20"
           title={viewMode === "follow" ? "Switch to Overview" : "Switch to Follow Mode"}
         >
           {viewMode === "follow" ? <Maximize size={18} /> : <ZoomIn size={18} />}
           <span className="text-[10px] font-bold uppercase tracking-widest">{viewMode === "follow" ? "OVERVIEW" : "FOLLOW"}</span>
         </button>
      </div>

      {dimensions.width > 0 && dimensions.height > 0 && (
      <Stage width={dimensions.width} height={dimensions.height} onClick={handleCanvasClick}>
        <Layer>
          <Group x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
            {backgroundImage && (
              <KonvaImage
                image={backgroundImage}
                width={backgroundImage.width}
                height={backgroundImage.height}
                opacity={1}
                shadowBlur={50}
                shadowColor="rgba(0,0,0,0.5)"
              />
            )}

            {Object.entries(users).map(([id, user]) => (
              <Group key={id} x={user.x} y={user.y}>
                {id === userId && (
                  <Circle radius={30} stroke="#3b82f6" strokeWidth={2} dash={[5, 5]} opacity={0.5} />
                )}
                <Group>
                    <Circle
                        radius={24}
                        fillRadialGradientStartRadius={0}
                        fillRadialGradientEndRadius={24}
                        fillRadialGradientColorStops={[
                            0, id === userId ? '#3b82f6' : '#475569', 
                            1, id === userId ? '#1e3a8a' : '#1e293b'
                        ]}
                        stroke="#fff"
                        strokeWidth={2}
                    />
                    <Text
                        text={user.name ? user.name.charAt(0).toUpperCase() : "?"}
                        fontSize={18}
                        fontStyle="bold"
                        fill="#fff"
                        align="center"
                        width={48}
                        offsetX={24}
                        y={-9}
                    />
                </Group>
                <Group y={32}>
                    <Rect x={-50} width={100} height={20} fill="rgba(15, 23, 42, 0.9)" cornerRadius={4} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    <Text text={user.name} fontSize={11} fontStyle="bold" fill="#f8fafc" align="center" width={100} offsetX={50} y={4} />
                </Group>
              </Group>
            ))}
          </Group>
        </Layer>
      </Stage>
      )}
    </div>
  );
}
