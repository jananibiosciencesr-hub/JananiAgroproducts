import React, { useState, useEffect } from "react";
import { RotateCcw, Sparkles, Sprout, Image as ImageIcon } from "lucide-react";

export function GrowingPlantAnimation() {
  const [animationKey, setAnimationKey] = useState(0);
  const [showPhoto, setShowPhoto] = useState(false);
  const [stage, setStage] = useState<"germinating" | "rooting" | "foliage" | "flourishing">("flourishing");

  // Lifecycle timer to track stages for UI badges
  useEffect(() => {
    if (showPhoto) return;
    setStage("germinating");
    const t1 = setTimeout(() => setStage("rooting"), 1200);
    const t2 = setTimeout(() => setStage("foliage"), 2600);
    const t3 = setTimeout(() => setStage("flourishing"), 4400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [animationKey, showPhoto]);

  const handleReplay = () => {
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Outer Glow Halo Ring */}
      <div className="relative group">
        <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-[#075B32]/30 via-[#7FBE25]/25 to-[#D99A12]/30 blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Main Circular Container */}
        <div className="relative size-60 sm:size-72 md:size-80 rounded-full overflow-hidden shadow-2xl shadow-[#064A29]/25 bg-[#0f0b08] select-none cursor-pointer"
             onClick={handleReplay}
             title="Click to replay plant growth animation">

          {showPhoto ? (
            /* Original Photo View */
            <div className="w-full h-full relative">
              <img
                src="/images/sprout_roots_circle.jpg"
                alt="Plant Sprout Root Health"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#064A29]/30 via-transparent to-transparent pointer-events-none" />
            </div>
          ) : (
            /* SVG Growing Plant Animation */
            <svg
              key={animationKey}
              viewBox="0 0 400 400"
              className="w-full h-full"
              style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}
            >
              <defs>
                {/* Underground Soil Gradient */}
                <radialGradient id="soilBg" cx="50%" cy="75%" r="65%">
                  <stop offset="0%" stopColor="#2d1c10" />
                  <stop offset="50%" stopColor="#1e130a" />
                  <stop offset="100%" stopColor="#0c0704" />
                </radialGradient>

                {/* Above Ground Atmosphere Gradient */}
                <linearGradient id="skyAtmosphere" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f5faf2" stopOpacity="0.95" />
                  <stop offset="55%" stopColor="#e8f4e2" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#c7e3bd" stopOpacity="0.85" />
                </linearGradient>

                {/* Golden Morning Sunlight */}
                <linearGradient id="sunBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.45" />
                  <stop offset="40%" stopColor="#FEEBC8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>

                {/* Root Color Gradient (Ivory to Fresh Plant Green) */}
                <linearGradient id="tapRootGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#A8D977" />
                  <stop offset="30%" stopColor="#F4FBEB" />
                  <stop offset="75%" stopColor="#E2F4D0" />
                  <stop offset="100%" stopColor="#C1E79C" />
                </linearGradient>

                {/* Lateral Root Gradient */}
                <linearGradient id="lateralRootGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EAF8DC" />
                  <stop offset="100%" stopColor="#B3E285" />
                </linearGradient>

                {/* Stem Gradient */}
                <linearGradient id="stemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#6DB831" />
                  <stop offset="40%" stopColor="#4FAE2A" />
                  <stop offset="100%" stopColor="#7FBE25" />
                </linearGradient>

                {/* Main Leaf Gradient */}
                <linearGradient id="leafGradLeft" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#2E7D32" />
                  <stop offset="50%" stopColor="#43A047" />
                  <stop offset="100%" stopColor="#7CB342" />
                </linearGradient>

                <linearGradient id="leafGradRight" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2A732D" />
                  <stop offset="50%" stopColor="#3FA73F" />
                  <stop offset="100%" stopColor="#81C784" />
                </linearGradient>

                {/* Leaf Highlight Sheen */}
                <linearGradient id="leafHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>

                {/* Bio-Nutrient Glow Filter */}
                <filter id="bioGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <style>{`
                /* ================= PLANT ANIMATION KEYFRAMES ================= */
                @keyframes growTapRoot {
                  0% { stroke-dashoffset: 200; opacity: 0; }
                  15% { opacity: 1; }
                  100% { stroke-dashoffset: 0; opacity: 1; }
                }

                @keyframes growBranchRoot {
                  0% { stroke-dashoffset: 150; opacity: 0; }
                  20% { opacity: 1; }
                  100% { stroke-dashoffset: 0; opacity: 1; }
                }

                @keyframes fadeInRootHair {
                  0% { opacity: 0; transform: scale(0.6); }
                  100% { opacity: 0.65; transform: scale(1); }
                }

                @keyframes growMainStem {
                  0% { stroke-dashoffset: 160; opacity: 0; }
                  20% { opacity: 1; }
                  100% { stroke-dashoffset: 0; opacity: 1; }
                }

                @keyframes sproutCotyledonLeft {
                  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
                  60% { transform: scale(1.15) rotate(6deg); opacity: 1; }
                  100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }

                @keyframes sproutCotyledonRight {
                  0% { transform: scale(0) rotate(45deg); opacity: 0; }
                  60% { transform: scale(1.15) rotate(-6deg); opacity: 1; }
                  100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }

                @keyframes sproutTrueLeafLeft {
                  0% { transform: scale(0) rotate(-60deg); opacity: 0; }
                  65% { transform: scale(1.2) rotate(8deg); opacity: 1; }
                  100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }

                @keyframes sproutTrueLeafRight {
                  0% { transform: scale(0) rotate(60deg); opacity: 0; }
                  65% { transform: scale(1.2) rotate(-8deg); opacity: 1; }
                  100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }

                @keyframes sproutTopBud {
                  0% { transform: scale(0); opacity: 0; }
                  70% { transform: scale(1.25); opacity: 1; }
                  100% { transform: scale(1); opacity: 1; }
                }

                @keyframes organicSway {
                  0%, 100% { transform: rotate(0deg); }
                  33% { transform: rotate(1.8deg) translateY(-1px); }
                  66% { transform: rotate(-1.5deg) translateY(0px); }
                }

                @keyframes nutrientTravel1 {
                  0% { transform: translate(198px, 350px) scale(0.6); opacity: 0; }
                  15% { opacity: 1; }
                  60% { transform: translate(199px, 200px) scale(1); opacity: 0.9; }
                  90% { transform: translate(198px, 115px) scale(0.8); opacity: 0.8; }
                  100% { transform: translate(160px, 95px) scale(0); opacity: 0; }
                }

                @keyframes nutrientTravel2 {
                  0% { transform: translate(110px, 290px) scale(0.5); opacity: 0; }
                  20% { opacity: 0.9; }
                  50% { transform: translate(175px, 225px) scale(0.9); opacity: 0.9; }
                  80% { transform: translate(200px, 130px) scale(0.8); opacity: 0.8; }
                  100% { transform: translate(245px, 90px) scale(0); opacity: 0; }
                }

                @keyframes nutrientTravel3 {
                  0% { transform: translate(295px, 295px) scale(0.5); opacity: 0; }
                  25% { opacity: 0.9; }
                  55% { transform: translate(220px, 225px) scale(0.9); opacity: 0.9; }
                  85% { transform: translate(200px, 105px) scale(0.85); opacity: 0.85; }
                  100% { transform: translate(200px, 60px) scale(0); opacity: 0; }
                }

                @keyframes pulseGlowRing {
                  0%, 100% { opacity: 0.25; transform: scale(0.98); }
                  50% { opacity: 0.55; transform: scale(1.02); }
                }

                @keyframes sunRayShimmer {
                  0%, 100% { opacity: 0.35; }
                  50% { opacity: 0.6; }
                }

                /* Animation Class Assignments */
                .anim-tap-root {
                  stroke-dasharray: 200;
                  animation: growTapRoot 1.8s cubic-bezier(0.25, 1, 0.5, 1) 0.3s forwards;
                }
                .anim-branch-left-1 {
                  stroke-dasharray: 150;
                  animation: growBranchRoot 1.6s cubic-bezier(0.25, 1, 0.5, 1) 0.8s forwards;
                }
                .anim-branch-right-1 {
                  stroke-dasharray: 150;
                  animation: growBranchRoot 1.6s cubic-bezier(0.25, 1, 0.5, 1) 0.9s forwards;
                }
                .anim-branch-left-2 {
                  stroke-dasharray: 150;
                  animation: growBranchRoot 1.5s cubic-bezier(0.25, 1, 0.5, 1) 1.2s forwards;
                }
                .anim-branch-right-2 {
                  stroke-dasharray: 150;
                  animation: growBranchRoot 1.5s cubic-bezier(0.25, 1, 0.5, 1) 1.3s forwards;
                }
                .anim-root-hairs {
                  animation: fadeInRootHair 1.4s ease-out 1.7s forwards;
                  transform-origin: 200px 260px;
                }

                .anim-main-stem {
                  stroke-dasharray: 160;
                  animation: growMainStem 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.7s forwards;
                }

                .anim-cotyledon-left {
                  animation: sproutCotyledonLeft 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 1.5s forwards;
                  transform-origin: 198px 165px;
                }
                .anim-cotyledon-right {
                  animation: sproutCotyledonRight 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 1.7s forwards;
                  transform-origin: 202px 160px;
                }

                .anim-true-leaf-left {
                  animation: sproutTrueLeafLeft 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) 2.2s forwards;
                  transform-origin: 198px 125px;
                }
                .anim-true-leaf-right {
                  animation: sproutTrueLeafRight 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) 2.4s forwards;
                  transform-origin: 202px 115px;
                }

                .anim-top-bud {
                  animation: sproutTopBud 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 2.9s forwards;
                  transform-origin: 200px 85px;
                }

                .anim-sway-group {
                  transform-origin: 200px 200px;
                  animation: organicSway 5s ease-in-out 3.5s infinite;
                }

                .anim-nutrient-1 {
                  animation: nutrientTravel1 3.8s ease-in-out 3.2s infinite;
                }
                .anim-nutrient-2 {
                  animation: nutrientTravel2 4.2s ease-in-out 3.7s infinite;
                }
                .anim-nutrient-3 {
                  animation: nutrientTravel3 3.6s ease-in-out 4.1s infinite;
                }
                .anim-sunray {
                  animation: sunRayShimmer 4s ease-in-out infinite;
                }
              `}</style>

              {/* 1. ATMOSPHERE / ABOVE-GROUND BACKGROUND */}
              <rect x="0" y="0" width="400" height="200" fill="url(#skyAtmosphere)" />

              {/* Soft Golden Sunlight Beam */}
              <polygon
                points="0,0 180,0 280,200 40,200"
                fill="url(#sunBeam)"
                className="anim-sunray"
              />

              {/* 2. RICH ORGANIC SOIL BACKGROUND */}
              <rect x="0" y="196" width="400" height="204" fill="url(#soilBg)" />

              {/* Soil Crumb Texture & Mineral Flecks */}
              <g opacity="0.35">
                <circle cx="65" cy="235" r="2.5" fill="#4a301d" />
                <circle cx="110" cy="320" r="3" fill="#3b2516" />
                <circle cx="150" cy="245" r="2" fill="#5c3c24" />
                <circle cx="85" cy="285" r="2.5" fill="#422917" />
                <circle cx="230" cy="340" r="3" fill="#3b2516" />
                <circle cx="275" cy="240" r="2.5" fill="#5c3c24" />
                <circle cx="320" cy="310" r="3" fill="#4a301d" />
                <circle cx="340" cy="230" r="2" fill="#422917" />
                <circle cx="180" cy="370" r="2.5" fill="#5c3c24" />
                <circle cx="215" cy="365" r="3" fill="#3b2516" />
                {/* Organic Bio-Nutrient Mineral Grains (Golden/Lime speckles) */}
                <circle cx="95" cy="345" r="1.5" fill="#D99A12" opacity="0.6" />
                <circle cx="170" cy="280" r="1.5" fill="#7FBE25" opacity="0.7" />
                <circle cx="235" cy="270" r="1.5" fill="#E7A91A" opacity="0.6" />
                <circle cx="305" cy="335" r="1.5" fill="#7FBE25" opacity="0.7" />
                <circle cx="260" cy="360" r="1.5" fill="#D99A12" opacity="0.6" />
              </g>

              {/* Soil Surface Crust (Texture & Organic Humus Layer) */}
              <path
                d="M 0 196 Q 50 194, 100 197 T 200 196 T 300 197 T 400 195 L 400 206 L 0 206 Z"
                fill="#2b1a0d"
              />
              <path
                d="M 0 197 Q 70 195, 140 198 T 260 196 T 400 197"
                stroke="#5c3d22"
                strokeWidth="2.5"
                fill="none"
              />

              {/* 3. UNDERGROUND ROOT SYSTEM (Animated Growth) */}
              <g id="rootsSystem">
                {/* Delicate Deep Root Hairs Network */}
                <g className="anim-root-hairs" opacity="0" stroke="#d5f2be" strokeWidth="1" fill="none">
                  {/* Left root hairs */}
                  <path d="M 170 230 Q 155 235, 145 245" />
                  <path d="M 150 245 Q 135 255, 125 268" />
                  <path d="M 130 265 Q 115 272, 105 285" />
                  <path d="M 160 270 Q 145 285, 135 305" />
                  <path d="M 185 280 Q 170 295, 160 320" />
                  <path d="M 190 315 Q 175 330, 168 350" />
                  {/* Right root hairs */}
                  <path d="M 230 230 Q 245 235, 255 245" />
                  <path d="M 250 245 Q 265 255, 275 268" />
                  <path d="M 270 265 Q 285 272, 295 285" />
                  <path d="M 240 270 Q 255 285, 265 305" />
                  <path d="M 215 280 Q 230 295, 240 320" />
                  <path d="M 210 315 Q 225 330, 232 350" />
                </g>

                {/* Sub Lateral Branch Roots */}
                <path
                  d="M 145 255 Q 130 280, 105 310"
                  stroke="url(#lateralRootGrad)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                  className="anim-branch-left-2"
                  opacity="0"
                />
                <path
                  d="M 175 270 Q 160 300, 140 335"
                  stroke="url(#lateralRootGrad)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                  className="anim-branch-left-2"
                  opacity="0"
                />
                <path
                  d="M 255 255 Q 270 280, 295 310"
                  stroke="url(#lateralRootGrad)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                  className="anim-branch-right-2"
                  opacity="0"
                />
                <path
                  d="M 225 270 Q 240 300, 260 335"
                  stroke="url(#lateralRootGrad)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                  className="anim-branch-right-2"
                  opacity="0"
                />

                {/* Main Lateral Roots (Left & Right) */}
                <path
                  d="M 200 215 Q 170 230, 135 255 T 85 295"
                  stroke="url(#lateralRootGrad)"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  fill="none"
                  className="anim-branch-left-1"
                  opacity="0"
                />
                <path
                  d="M 200 218 Q 230 230, 265 255 T 315 295"
                  stroke="url(#lateralRootGrad)"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  fill="none"
                  className="anim-branch-right-1"
                  opacity="0"
                />

                {/* Primary Central Taproot (Deep Penetration) */}
                <path
                  d="M 200 198 Q 202 235, 198 280 T 201 360"
                  stroke="url(#tapRootGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                  className="anim-tap-root"
                  opacity="0"
                />
              </g>

              {/* 4. BIO-ACTIVE NUTRIENT PARTICLES (Flowing from Roots to Leaves) */}
              <g id="nutrientParticles" filter="url(#bioGlow)">
                {/* Particle 1: Golden Energy Node */}
                <circle cx="0" cy="0" r="3.2" fill="#E7A91A" className="anim-nutrient-1" opacity="0" />
                {/* Particle 2: Fresh Emerald Bio-stimulant Node */}
                <circle cx="0" cy="0" r="3" fill="#4FAE2A" className="anim-nutrient-2" opacity="0" />
                {/* Particle 3: Bright Lime Micro-nutrient Node */}
                <circle cx="0" cy="0" r="2.8" fill="#A0E842" className="anim-nutrient-3" opacity="0" />
              </g>

              {/* Germination Seed Base Coat in Soil */}
              <ellipse
                cx="200"
                cy="200"
                rx="6"
                ry="4"
                fill="#3e2916"
                stroke="#5c3d22"
                strokeWidth="1.5"
              />

              {/* 5. ABOVE-GROUND SPROUT & LEAVES (With Organic Breeze Sway) */}
              <g className="anim-sway-group">
                {/* Main Green Seedling Stem */}
                <path
                  d="M 200 200 Q 197 155, 201 125 T 200 85"
                  stroke="url(#stemGrad)"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  fill="none"
                  className="anim-main-stem"
                  opacity="0"
                />

                {/* Seedling Cotyledon Leaf (Left) */}
                <g className="anim-cotyledon-left" opacity="0">
                  <path
                    d="M 198 165 C 175 160, 155 152, 148 158 C 142 165, 160 178, 198 167 Z"
                    fill="url(#leafGradLeft)"
                  />
                  <path
                    d="M 198 165 Q 172 162, 153 158"
                    stroke="#1E5E20"
                    strokeWidth="1.2"
                    fill="none"
                  />
                  {/* Dewdrop reflection */}
                  <circle cx="162" cy="162" r="1.5" fill="#FFFFFF" opacity="0.8" />
                </g>

                {/* Seedling Cotyledon Leaf (Right) */}
                <g className="anim-cotyledon-right" opacity="0">
                  <path
                    d="M 202 160 C 225 155, 245 147, 252 153 C 258 160, 240 173, 202 162 Z"
                    fill="url(#leafGradRight)"
                  />
                  <path
                    d="M 202 160 Q 228 157, 247 153"
                    stroke="#1E5E20"
                    strokeWidth="1.2"
                    fill="none"
                  />
                  {/* Dewdrop reflection */}
                  <circle cx="238" cy="157" r="1.5" fill="#FFFFFF" opacity="0.8" />
                </g>

                {/* True Serrated Leaf (Left - Large & Detailed) */}
                <g className="anim-true-leaf-left" opacity="0">
                  <path
                    d="M 198 125 C 170 120, 140 105, 125 108 C 115 110, 118 122, 135 130 C 155 138, 185 136, 198 127 Z"
                    fill="url(#leafGradLeft)"
                  />
                  {/* Natural serrations edge overlay */}
                  <path
                    d="M 198 125 C 165 116, 138 100, 125 108 C 120 115, 135 125, 150 128 T 198 127"
                    fill="url(#leafHighlight)"
                  />
                  {/* Leaf Main Vein */}
                  <path
                    d="M 198 125 Q 160 118, 126 109"
                    stroke="#194D18"
                    strokeWidth="1.8"
                    fill="none"
                  />
                  {/* Side Veins */}
                  <path d="M 180 123 Q 170 115, 160 113" stroke="#256e24" strokeWidth="1" fill="none" />
                  <path d="M 165 120 Q 155 112, 145 110" stroke="#256e24" strokeWidth="1" fill="none" />
                  <path d="M 175 125 Q 165 132, 155 133" stroke="#256e24" strokeWidth="1" fill="none" />
                  <path d="M 155 121 Q 145 128, 138 127" stroke="#256e24" strokeWidth="1" fill="none" />
                  {/* Glistening Dewdrop */}
                  <circle cx="148" cy="115" r="2.2" fill="#FFFFFF" opacity="0.85" />
                  <circle cx="147" cy="114" r="0.8" fill="#FFFFFF" />
                </g>

                {/* True Serrated Leaf (Right - Large & Detailed) */}
                <g className="anim-true-leaf-right" opacity="0">
                  <path
                    d="M 202 115 C 230 110, 260 95, 275 98 C 285 100, 282 112, 265 120 C 245 128, 215 126, 202 117 Z"
                    fill="url(#leafGradRight)"
                  />
                  {/* Sunlight Sheen */}
                  <path
                    d="M 202 115 C 235 106, 262 90, 275 98 C 280 105, 265 115, 250 118 T 202 117"
                    fill="url(#leafHighlight)"
                  />
                  {/* Leaf Main Vein */}
                  <path
                    d="M 202 115 Q 240 108, 274 99"
                    stroke="#194D18"
                    strokeWidth="1.8"
                    fill="none"
                  />
                  {/* Side Veins */}
                  <path d="M 220 113 Q 230 105, 240 103" stroke="#256e24" strokeWidth="1" fill="none" />
                  <path d="M 235 110 Q 245 102, 255 100" stroke="#256e24" strokeWidth="1" fill="none" />
                  <path d="M 225 115 Q 235 122, 245 123" stroke="#256e24" strokeWidth="1" fill="none" />
                  <path d="M 245 111 Q 255 118, 262 117" stroke="#256e24" strokeWidth="1" fill="none" />
                  {/* Glistening Dewdrop */}
                  <circle cx="250" cy="107" r="2.2" fill="#FFFFFF" opacity="0.85" />
                  <circle cx="249" cy="106" r="0.8" fill="#FFFFFF" />
                </g>

                {/* Apical Growing Bud & Tender Young Leaves (Top Center) */}
                <g className="anim-top-bud" opacity="0">
                  {/* Left tender leaf */}
                  <path
                    d="M 200 85 C 190 75, 185 62, 188 56 C 193 54, 198 68, 200 85 Z"
                    fill="#7FBE25"
                  />
                  {/* Right tender leaf */}
                  <path
                    d="M 200 85 C 210 75, 215 62, 212 56 C 207 54, 202 68, 200 85 Z"
                    fill="#8FD42E"
                  />
                  {/* Central shoot tip */}
                  <circle cx="200" cy="84" r="2" fill="#A8E84B" />
                </g>
              </g>

              {/* Circular Vignette Border */}
              <circle
                cx="200"
                cy="200"
                r="198"
                fill="none"
                stroke="#064A29"
                strokeWidth="4"
                opacity="0.25"
              />
            </svg>
          )}

          {/* Top-Right Interactive Stage Badge */}
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#075B32]/90 text-white backdrop-blur-md shadow-xs">
              <Sparkles className="size-3 text-[#E7A91A] animate-pulse" />
              {showPhoto
                ? "Photo"
                : stage === "germinating"
                ? "Sprouting"
                : stage === "rooting"
                ? "Root Health"
                : stage === "foliage"
                ? "Foliage"
                : "Bio-Active"}
            </span>
          </div>

          {/* Bottom Floating Root Health Pill */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-black/60 text-white/90 backdrop-blur-md">
              <Sprout className="size-3.5 text-[#7FBE25]" />
              <span>Bio-Active Root Technology</span>
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons Strip Below The Circle */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {/* Replay Growth Button */}
        <button
          type="button"
          onClick={handleReplay}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#075B32] bg-[#f4f7f2] hover:bg-[#ebf3e7] hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <RotateCcw className="size-3.5 text-[#4FAE2A]" />
          <span>Replay Growth</span>
        </button>

        {/* Toggle Animation / Photo Button */}
        <button
          type="button"
          onClick={() => setShowPhoto((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 hover:text-[#075B32] transition-all shadow-xs cursor-pointer"
        >
          <ImageIcon className="size-3.5 text-slate-400" />
          <span>{showPhoto ? "Live Animation" : "Original Photo"}</span>
        </button>
      </div>
    </div>
  );
}
