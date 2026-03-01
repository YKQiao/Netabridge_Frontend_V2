import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

/**
 * Global tracks if engine is already init to avoid re-initializing
 * which can cause canvas cleared or double canvas issues.
 */
let engineInitialized = false;

/**
 * Initializes the tsparticles engine.
 * Should be called in useEffect of components using Particles.
 */
export const initParticles = async () => {
    if (engineInitialized) return;

    await initParticlesEngine(async (engine) => {
        // loadSlim installs only the features needed for most cases
        // but keeps the bundle size small.
        await loadSlim(engine);
    });

    engineInitialized = true;
};
