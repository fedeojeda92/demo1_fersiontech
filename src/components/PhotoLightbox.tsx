"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from "lucide-react";

const MIN_SCALE = 1;
const MAX_SCALE = 4;

interface PhotoLightboxProps {
  images: string[];
  index: number;
  alt: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export default function PhotoLightbox({ images, index, alt, onIndexChange, onClose }: PhotoLightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const goTo = (newIndex: number) => {
    resetView();
    onIndexChange(newIndex);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") {
        setScale(1);
        setPan({ x: 0, y: 0 });
        onIndexChange(index === 0 ? images.length - 1 : index - 1);
      } else if (e.key === "ArrowRight") {
        setScale(1);
        setPan({ x: 0, y: 0 });
        onIndexChange(index === images.length - 1 ? 0 : index + 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, images.length, onIndexChange, onClose]);

  const zoomBy = (delta: number) => {
    setScale((s) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + delta));
      if (next === MIN_SCALE) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await containerRef.current.requestFullscreen();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    zoomBy(e.deltaY < 0 ? 0.4 : -0.4);
  };

  const handleDoubleClick = () => {
    if (scale > 1) resetView();
    else setScale(2.5);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const { startX, startY, panX, panY } = dragState.current;
    setPan({ x: panX + (e.clientX - startX), y: panY + (e.clientY - startY) });
  };

  const handlePointerUp = () => {
    dragState.current = null;
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-obsidian/95 backdrop-blur-sm flex items-center justify-center"
    >
      <div
        className="absolute inset-0 overflow-hidden touch-none"
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt={alt}
          draggable={false}
          className="w-full h-full object-contain select-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            cursor: scale > 1 ? "grab" : "zoom-in",
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
        />
      </div>

      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 bg-ivory/10 backdrop-blur-sm rounded-full flex items-center justify-center text-ivory hover:bg-ivory/20 transition-colors border border-ivory/10"
      >
        <X size={20} />
      </button>

      <div className="absolute top-6 left-6 flex gap-3">
        <button
          onClick={() => zoomBy(-0.6)}
          disabled={scale <= MIN_SCALE}
          className="w-12 h-12 bg-ivory/10 backdrop-blur-sm rounded-full flex items-center justify-center text-ivory hover:bg-ivory/20 transition-colors border border-ivory/10 disabled:opacity-30 disabled:hover:bg-ivory/10"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={() => zoomBy(0.6)}
          disabled={scale >= MAX_SCALE}
          className="w-12 h-12 bg-ivory/10 backdrop-blur-sm rounded-full flex items-center justify-center text-ivory hover:bg-ivory/20 transition-colors border border-ivory/10 disabled:opacity-30 disabled:hover:bg-ivory/10"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={toggleFullscreen}
          className="w-12 h-12 bg-ivory/10 backdrop-blur-sm rounded-full flex items-center justify-center text-ivory hover:bg-ivory/20 transition-colors border border-ivory/10"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={() => goTo(index === 0 ? images.length - 1 : index - 1)}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-ivory/10 backdrop-blur-sm rounded-full flex items-center justify-center text-ivory hover:bg-ivory/20 transition-colors border border-ivory/10"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => goTo(index === images.length - 1 ? 0 : index + 1)}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-ivory/10 backdrop-blur-sm rounded-full flex items-center justify-center text-ivory hover:bg-ivory/20 transition-colors border border-ivory/10"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-obsidian/80 backdrop-blur-sm text-ivory text-sm rounded-full border border-ivory/10">
            {index + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
