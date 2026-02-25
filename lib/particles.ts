// Singleton particles engine initialization
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

let initPromise: Promise<void> | null = null;
let isInitialized = false;

export async function initParticles(): Promise<void> {
  if (isInitialized) return;

  if (!initPromise) {
    initPromise = initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      isInitialized = true;
    });
  }

  return initPromise;
}

export function isParticlesReady(): boolean {
  return isInitialized;
}
