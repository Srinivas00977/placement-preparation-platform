import React, { useEffect, useRef } from 'react';

interface Beam {
  x: number;
  y: number;
  length: number;
  width: number;
  speed: number;
  angle: number; // in radians
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
  color: [number, number, number]; // rgb
}

export const AIBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates (default off-screen)
    const mouse = { x: -1000, y: -1000, radius: 240 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initBeams();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Color Palette: Emerald (#10b981), Teal (#14b8a6), and Cyan (#06b6d4)
    const beamColors: [number, number, number][] = [
      [16, 185, 129], // Emerald
      [20, 184, 166], // Teal
      [6, 182, 212],  // Cyan
      [16, 185, 129], // Emerald (secondary)
    ];

    let beams: Beam[] = [];
    const beamCount = 14;

    const initBeams = () => {
      beams = [];
      const baseAngle = (-38 * Math.PI) / 180;

      for (let i = 0; i < beamCount; i++) {
        const color = beamColors[i % beamColors.length];
        const widthVal = Math.random() * 85 + 55;
        const lengthVal = Math.random() * 650 + 650;
        const speed = Math.random() * 0.45 + 0.35;
        const angle = baseAngle + ((Math.random() - 0.5) * 6 * Math.PI) / 180;

        beams.push({
          x: Math.random() * (width + 600) - 200,
          y: Math.random() * (height + 600) - 200,
          length: lengthVal,
          width: widthVal,
          speed,
          angle,
          baseAlpha: Math.random() * 0.08 + 0.07,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.015 + 0.008,
          color,
        });
      }
    };

    initBeams();

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < beams.length; i++) {
        const b = beams[i];

        if (!prefersReducedMotion) {
          b.pulsePhase += b.pulseSpeed;

          const dx = Math.cos(b.angle) * b.speed;
          const dy = Math.sin(b.angle) * b.speed;
          b.x += dx;
          b.y += dy;

          const pad = 400;
          if (b.x < -pad) b.x = width + pad;
          if (b.x > width + pad) b.x = -pad;
          if (b.y < -pad) b.y = height + pad;
          if (b.y > height + pad) b.y = -pad;
        }

        const pulse = 0.75 + 0.25 * Math.sin(b.pulsePhase);
        let alpha = b.baseAlpha * pulse;

        const mdx = b.x - mouse.x;
        const mdy = b.y - mouse.y;
        const mouseDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mouseDist < mouse.radius) {
          alpha += (1 - mouseDist / mouse.radius) * 0.06;
        }

        const startX = b.x;
        const startY = b.y;
        const endX = b.x + Math.cos(b.angle) * b.length;
        const endY = b.y + Math.sin(b.angle) * b.length;

        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        const [r, g, bColor] = b.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${bColor}, 0)`);
        gradient.addColorStop(0.2, `rgba(${r}, ${g}, ${bColor}, ${alpha * 0.5})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${bColor}, ${alpha})`);
        gradient.addColorStop(0.8, `rgba(${r}, ${g}, ${bColor}, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${bColor}, 0)`);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = b.width;
        ctx.lineCap = 'round';
        ctx.shadowColor = `rgba(${r}, ${g}, ${bColor}, ${alpha * 0.8})`;
        ctx.shadowBlur = 35;
        ctx.stroke();
      }

      ctx.restore();

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none bg-[#030303] transition-colors duration-500"
    >
      {/* LAYER 0: SPATIAL AMBIENT MESH / ARCHITECTURAL BLUR LAYER (-z-20) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
        {/* Soft Warm Emerald Ambient Glow */}
        <div
          className="absolute -top-[12%] left-[10%] w-[55vw] h-[50vw] max-w-[850px] max-h-[800px] rounded-full blur-[140px] opacity-[0.16] pointer-events-none will-change-transform"
          style={{
            background: 'radial-gradient(circle, #10b981 0%, rgba(16,185,129,0) 70%)',
            animation: 'aurora-drift-1 25s ease-in-out infinite alternate',
          }}
        />

        {/* Soft Cyan Refraction Bulb */}
        <div
          className="absolute top-[28%] -right-[10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[750px] rounded-full blur-[150px] opacity-[0.13] pointer-events-none will-change-transform"
          style={{
            background: 'radial-gradient(circle, #06b6d4 0%, rgba(6,182,212,0) 70%)',
            animation: 'aurora-drift-2 28s ease-in-out infinite alternate',
          }}
        />

        {/* Deep Violet & Obsidian Atmospheric Shadow */}
        <div
          className="absolute -bottom-[15%] left-[20%] w-[50vw] h-[50vw] max-w-[750px] max-h-[700px] rounded-full blur-[160px] opacity-[0.11] pointer-events-none will-change-transform"
          style={{
            background: 'radial-gradient(circle, #6366f1 0%, rgba(99,102,241,0) 70%)',
            animation: 'aurora-drift-3 32s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* LAYER 1: 21st.dev-STYLE LIGHT BEAMS CANVAS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* LAYER 2: SUBTLE TECH GRID OVERLAY */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#141416_1px,transparent_1px),linear-gradient(to_bottom,#141416_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_35%,#000_50%,transparent_100%)] opacity-[0.14] pointer-events-none z-0"
      />

      {/* LAYER 3: SOFT WARM-EMERALD & DEEP OBSIDIAN GRADIENT VIGNETTE (-z-10) */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(circle at 50% 32%, rgba(3, 3, 3, 0.25) 0%, rgba(3, 3, 3, 0.78) 72%, #030303 100%)',
        }}
      />
    </div>
  );
};

export default AIBackground;
