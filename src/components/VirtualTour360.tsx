"use client";

import { useEffect, useRef, useState } from "react";
import type { Tour360 } from "@/lib/properties";

declare global {
  interface Window {
    pannellum: any;
  }
}

interface VirtualTour360Props {
  tour: Tour360;
}

function createSceneHotspot(hotSpotDiv: HTMLElement, label: string) {
  hotSpotDiv.classList.add("tour360-hotspot");
  hotSpotDiv.innerHTML = `
    <div class="flex flex-col items-center gap-1.5 select-none">
      <div class="w-9 h-9 rounded-full bg-champagne flex items-center justify-center shadow-lg shadow-black/50 ring-2 ring-obsidian/50 text-obsidian transition-transform duration-200 hover:scale-110">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
      <span class="px-2.5 py-1 rounded-full bg-obsidian/90 border border-champagne/30 text-ivory text-[11px] font-medium tracking-wide whitespace-nowrap shadow-lg shadow-black/40">${label}</span>
    </div>
  `;
}

let pannellumLoadPromise: Promise<void> | null = null;

function loadPannellum(): Promise<void> {
  if (typeof window !== "undefined" && window.pannellum) {
    return Promise.resolve();
  }
  if (!pannellumLoadPromise) {
    pannellumLoadPromise = new Promise((resolve, reject) => {
      if (!document.querySelector('link[href="/pannellum.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/pannellum.css";
        document.head.appendChild(link);
      }
      const existingScript = document.querySelector('script[src="/pannellum.js"]');
      if (existingScript) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "/pannellum.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("No se pudo cargar el visor 360°"));
      document.body.appendChild(script);
    });
  }
  return pannellumLoadPromise;
}

export default function VirtualTour360({ tour }: VirtualTour360Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [activeScene, setActiveScene] = useState(tour.firstScene);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsReady(false);
    setActiveScene(tour.firstScene);

    const scenes: Record<string, unknown> = {};
    for (const [sceneId, scene] of Object.entries(tour.scenes)) {
      scenes[sceneId] = {
        panorama: scene.panorama,
        hotSpots: scene.hotspots.map((h) => ({
          pitch: h.pitch,
          yaw: h.yaw,
          type: "scene",
          sceneId: h.sceneId,
          text: h.text,
          targetPitch: 0,
          targetYaw: 0,
          targetHfov: 120,
          cssClass: "pnlm-pointer",
          createTooltipFunc: createSceneHotspot,
          createTooltipArgs: tour.sceneLabels[h.sceneId] ?? h.text,
        })),
      };
    }

    loadPannellum()
      .then(() => {
        if (cancelled || !containerRef.current || !window.pannellum) return;
        const viewer = window.pannellum.viewer(containerRef.current, {
          firstScene: tour.firstScene,
          scenes,
          autoLoad: true,
          autoRotate: -2,
          hfov: 120,
          minHfov: 50,
          maxHfov: 120,
          compass: false,
          showZoomCtrl: true,
          mouseZoom: true,
          draggable: true,
        });
        viewerRef.current = viewer;
        viewer.on("scenechange", (sceneId: string) => setActiveScene(sceneId));
        viewer.on("load", () => setIsReady(true));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      viewerRef.current?.destroy?.();
      viewerRef.current = null;
    };
  }, [tour]);

  return (
    <div>
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-obsidian">
        <div ref={containerRef} className="absolute inset-0" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-obsidian/80 text-ivory/50 text-sm">
            Cargando tour 360°...
          </div>
        )}
      </div>

      <div className="bg-obsidian border-b border-ivory/5">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.entries(tour.scenes).map(([sceneId, scene]) => (
              <button
                key={sceneId}
                onClick={() => viewerRef.current?.loadScene(sceneId)}
                className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  activeScene === sceneId
                    ? "border-champagne"
                    : "border-ivory/10 opacity-50 hover:opacity-100"
                }`}
              >
                <img
                  src={scene.panorama}
                  alt={tour.sceneLabels[sceneId] ?? sceneId}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
