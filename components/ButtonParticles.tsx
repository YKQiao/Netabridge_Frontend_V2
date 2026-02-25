"use client";

import { useEffect, useMemo, useState, memo, useId } from "react";
import Particles from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";
import { initParticles } from "@/lib/particles";

interface ButtonParticlesProps {
  className?: string;
}

// Memoize to prevent re-renders from parent state changes
const ButtonParticles = memo(function ButtonParticles({ className }: ButtonParticlesProps) {
  const [init, setInit] = useState(false);
  const uniqueId = useId();

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
          value: 20,
          density: { enable: true, width: 400, height: 100 },
        },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 0.5 },
        size: { value: { min: 0.5, max: 1.5 } },
        links: {
          enable: true,
          distance: 50,
          color: "#ffffff",
          opacity: 0.3,
          width: 0.5,
        },
        move: {
          enable: true,
          speed: 0.4,
          direction: "none",
          random: false,
          straight: false,
          outModes: { default: "bounce" },
          bounce: true,
        },
      },
      // Disable ALL interactivity
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
      id={`btn-particles-${uniqueId}`}
      className={className}
      options={options}
    />
  );
});

export default ButtonParticles;
