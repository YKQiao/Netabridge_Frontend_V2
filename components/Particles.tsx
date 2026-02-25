"use client";

import { useEffect, useMemo, useState, memo } from "react";
import Particles from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";
import { initParticles } from "@/lib/particles";

interface ParticlesBackgroundProps {
  className?: string;
}

// Memoize to prevent re-renders from parent state changes
const ParticlesBackground = memo(function ParticlesBackground({ className }: ParticlesBackgroundProps) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticles().then(() => {
      setInit(true);
    });
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      particles: {
        number: {
          value: 60,
          density: { enable: true, width: 800, height: 800 },
        },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 0.35 },
        size: { value: { min: 1, max: 2 } },
        links: {
          enable: true,
          distance: 150,
          color: "#ffffff",
          opacity: 0.15,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.3, // Slower speed
          direction: "none",
          random: false,
          straight: false,
          outModes: { default: "bounce" },
          bounce: true,
        },
      },
      // Disable ALL interactivity to prevent resets from user actions
      interactivity: {
        detectsOn: "window",
        events: {
          onHover: { enable: false },
          onClick: { enable: false },
          resize: { enable: true },
        },
      },
      background: { color: "transparent" },
      detectRetina: true,
      smooth: true,
    }),
    []
  );

  if (!init) return null;

  return (
    <Particles
      id="tsparticles-bg"
      className={className}
      options={options}
    />
  );
});

export default ParticlesBackground;
