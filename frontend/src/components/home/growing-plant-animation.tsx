import React, { useState, useEffect } from "react";

interface GrowthStage {
  id: number;
  key: string;
  name: string;
  image: string;
  desc: string;
}

const GROWTH_STAGES: GrowthStage[] = [
  {
    id: 0,
    key: "soil",
    name: "Fertile Soil",
    image: "/images/soil_base.jpg",
    desc: "Bio-active soil bed rich in organic carbon and beneficial microbes",
  },
  {
    id: 1,
    key: "germination",
    name: "Germination",
    image: "/images/sprout_stage1.jpg",
    desc: "Radicle root penetrates downward while shoot cracks the soil surface",
  },
  {
    id: 2,
    key: "seedling",
    name: "Young Sprout",
    image: "/images/sprout_stage2.jpg",
    desc: "Stem lengthens upward and cotyledons unfurl towards sunlight",
  },
  {
    id: 3,
    key: "flourishing",
    name: "Full Growth",
    image: "/images/sprout_roots_circle.jpg",
    desc: "Flourishing plant with deep lateral root hairs and lush green leaves",
  },
];

export function GrowingPlantAnimation() {
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [cycleKey, setCycleKey] = useState<number>(0);

  // Seamless continuous natural growth sequence
  useEffect(() => {
    let s1: NodeJS.Timeout;
    let s2: NodeJS.Timeout;
    let s3: NodeJS.Timeout;
    let sLoop: NodeJS.Timeout;

    setCurrentStage(0);

    s1 = setTimeout(() => setCurrentStage(1), 1400);
    s2 = setTimeout(() => setCurrentStage(2), 2800);
    s3 = setTimeout(() => setCurrentStage(3), 4400);
    sLoop = setTimeout(() => {
      setCycleKey((prev) => prev + 1);
    }, 8000);

    return () => {
      clearTimeout(s1);
      clearTimeout(s2);
      clearTimeout(s3);
      clearTimeout(sLoop);
    };
  }, [cycleKey]);

  const handleSelectStage = (idx: number) => {
    setCurrentStage(idx);
    setCycleKey((prev) => prev + 1);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Outer Halo Glow */}
      <div className="relative group">
        <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-[#075B32]/35 via-[#7FBE25]/30 to-[#D99A12]/35 blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Circular Growing Plant Container */}
        <div
          className="relative size-60 sm:size-72 md:size-80 rounded-full overflow-hidden shadow-2xl shadow-[#064A29]/30 bg-[#0e0a07] select-none cursor-pointer"
          onClick={() => setCycleKey((prev) => prev + 1)}
          title="Natural plant growth cycle"
        >
          {/* Layered Photorealistic Growth Stages */}
          {GROWTH_STAGES.map((stg) => {
            const isActive = currentStage === stg.id;
            const isPassed = currentStage >= stg.id;

            return (
              <div
                key={stg.id}
                className={`absolute inset-0 transition-all duration-1000 ease-out ${
                  isActive
                    ? "opacity-100 scale-100 z-10"
                    : isPassed
                    ? "opacity-0 scale-105 z-0"
                    : "opacity-0 scale-95 z-0"
                }`}
              >
                <img
                  src={stg.image}
                  alt={stg.name}
                  loading="eager"
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    stg.id === 3 ? "hover:scale-105" : ""
                  }`}
                />
              </div>
            );
          })}

          {/* Organic Sunlight & Dew Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#064A29]/25 via-transparent to-[#ffffff]/10 pointer-events-none z-20" />

          {/* Bio-Nutrient Flow Energy Overlay (SVG particles flowing along roots and stem) */}
          {currentStage >= 1 && (
            <svg
              viewBox="0 0 400 400"
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
            >
              <defs>
                <filter id="nutrientGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <style>{`
                @keyframes pulseEnergy1 {
                  0% { transform: translate(200px, 360px) scale(0.4); opacity: 0; }
                  20% { opacity: 0.9; }
                  60% { transform: translate(200px, 210px) scale(1); opacity: 0.9; }
                  90% { transform: translate(195px, 120px) scale(0.8); opacity: 0.8; }
                  100% { transform: translate(165px, 90px) scale(0); opacity: 0; }
                }
                @keyframes pulseEnergy2 {
                  0% { transform: translate(120px, 280px) scale(0.4); opacity: 0; }
                  25% { opacity: 0.85; }
                  65% { transform: translate(195px, 210px) scale(0.9); opacity: 0.9; }
                  90% { transform: translate(205px, 110px) scale(0.85); opacity: 0.85; }
                  100% { transform: translate(245px, 85px) scale(0); opacity: 0; }
                }
                @keyframes pulseEnergy3 {
                  0% { transform: translate(280px, 280px) scale(0.4); opacity: 0; }
                  25% { opacity: 0.85; }
                  65% { transform: translate(205px, 210px) scale(0.9); opacity: 0.9; }
                  90% { transform: translate(200px, 100px) scale(0.85); opacity: 0.85; }
                  100% { transform: translate(200px, 60px) scale(0); opacity: 0; }
                }
                .flow-node-1 { animation: pulseEnergy1 3.2s ease-in-out infinite; }
                .flow-node-2 { animation: pulseEnergy2 3.6s ease-in-out 0.8s infinite; }
                .flow-node-3 { animation: pulseEnergy3 3.4s ease-in-out 1.5s infinite; }
              `}</style>

              <g filter="url(#nutrientGlow)">
                {/* Glowing bio-nutrient energy nodes */}
                <circle cx="0" cy="0" r="3.5" fill="#E7A91A" className="flow-node-1" />
                <circle cx="0" cy="0" r="3" fill="#7FBE25" className="flow-node-2" />
                <circle cx="0" cy="0" r="3.2" fill="#4FAE2A" className="flow-node-3" />
              </g>
            </svg>
          )}
        </div>
      </div>

      {/* Stage Timeline Buttons */}
      <div className="mt-3.5 flex items-center gap-1.5 bg-[#f4f7f2] p-1 rounded-full shadow-xs">
        {GROWTH_STAGES.map((stg) => (
          <button
            key={stg.id}
            type="button"
            onClick={() => handleSelectStage(stg.id)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              currentStage === stg.id
                ? "bg-[#075B32] text-white shadow-xs"
                : "text-slate-600 hover:text-[#075B32] hover:bg-[#ebf3e7]"
            }`}
          >
            {stg.name}
          </button>
        ))}
      </div>
    </div>
  );
}
