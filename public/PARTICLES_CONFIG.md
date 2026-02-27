# NetaBridge Interactive Particles Configuration

This document describes how to configure the particles background to match the marketing site with click-to-add functionality.

## Current Configuration (neta-main login)

The login page uses a static particles configuration with no interactivity.

## Marketing Site Configuration (with click-to-add)

To add the ability to click and create one particle at a time, use this configuration:

```tsx
import { useEffect, useMemo, useState, memo } from "react";
import Particles from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";
import { initParticles } from "@/lib/particles";

const ParticlesBackground = memo(function ParticlesBackground({ className }) {
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
          limit: { mode: "delete", value: 120 }, // Cap to prevent lag
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
          speed: 0.3,
          direction: "none",
          random: false,
          straight: false,
          outModes: { default: "bounce" },
          bounce: true,
        },
      },
      interactivity: {
        detectsOn: "window",
        events: {
          onHover: { enable: true, mode: "grab" }, // Particles follow/connect to cursor
          onClick: { enable: true, mode: "push" }, // Click to add particles
          resize: { enable: true },
        },
        modes: {
          grab: {
            distance: 150, // How far cursor attracts particles
            links: {
              opacity: 0.3, // Lines connecting to cursor
            },
          },
          push: {
            quantity: 1, // Add one particle at a time
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
      id="tsparticles-bg"
      className={className}
      options={options}
    />
  );
});

export default ParticlesBackground;
```

## Key Differences from Static Version

| Setting | Static (Login) | Interactive (Marketing) |
|---------|---------------|------------------------|
| `onHover.enable` | `false` | `true` |
| `onHover.mode` | - | `"grab"` |
| `modes.grab.distance` | - | `150` |
| `onClick.enable` | `false` | `true` |
| `onClick.mode` | - | `"push"` |
| `modes.push.quantity` | - | `1` |
| `number.limit` | - | `{ mode: "delete", value: 120 }` |

## Required Dependencies

```bash
npm install @tsparticles/react @tsparticles/slim tsparticles
```

## Initialization Helper (lib/particles.ts)

```ts
import { tsParticles } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

let initialized = false;

export async function initParticles() {
  if (initialized) return;
  await loadSlim(tsParticles);
  initialized = true;
}
```

## Usage

```tsx
import dynamic from "next/dynamic";

const ParticlesBackground = dynamic(() => import("@/components/Particles"), {
  ssr: false,
});

// In your component:
<ParticlesBackground className="absolute inset-0 z-0" />
```

## Notes

- The `limit` setting prevents performance issues by capping particles at 120
- `detectsOn: "window"` ensures clicks are detected across the entire viewport
- `onHover: { enable: false }` keeps the calm, static movement when not clicking
- Particles bounce off edges rather than disappearing (`outModes: { default: "bounce" }`)
