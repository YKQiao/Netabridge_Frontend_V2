"use client";

import { useEffect, useMemo, useState, memo, useId } from "react";
import Particles from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";
import { initParticles } from "@/lib/particles";

interface HeaderParticlesProps {
  className?: string;
}

// Memoize to prevent re-renders from parent state changes
const HeaderParticles = memo(function HeaderParticles({ className }: HeaderParticlesProps) {
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
          value: 18,
          density: { enable: true, width: 1200, height: 56 },
        },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 0.25 },
        size: { value: { min: 0.5, max: 1.5 } },
        links: {
          enable: true,
          distance: 90,
          color: "#ffffff",
          opacity: 0.2,
          width: 0.5,
        },
        move: {
          enable: true,
          speed: 0.2,
          direction: "none",
          random: false,
          straight: false,
          outModes: { default: "bounce" },
          bounce: true,
        },
      },
      interactivity: {
        detectsOn: "canvas",
        events: {
          onHover: {
            enable: true,
            mode: "grab",
          },
          onClick: { enable: false },
          resize: { enable: true },
        },
        modes: {
          grab: {
            distance: 80,
            links: {
              opacity: 0.4,
              blink: false,
            },
          },
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
      id={`header-particles-${uniqueId}`}
      className={className}
      options={options}
    />
  );
});

export default HeaderParticles;
