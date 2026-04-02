import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

export default defineConfig(({ mode }) => {
  const isElectron = process.env.ELECTRON === 'true' || mode === 'electron';

  const baseConfig = {
    base: './', // Use relative path for all builds to ensure assets resolve correctly when opened from file system or Electron
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      dyadComponentTagger(),
      react(),
      isElectron && electron([
        {
          // Main-process entry point of the Electron App.
          entry: 'electron/main.ts',
          // @ts-ignore TS2353: 'onready' does not exist on type 'ElectronOptions'.
          onready(options: any) {
            options.spawn();
          },
          vite: {
            build: {
              outDir: 'dist-electron',
            },
          },
        },
        {
          entry: 'electron/preload.ts',
          // @ts-ignore TS2353: 'onready' does not exist on type 'ElectronOptions'.
          onready(options: any) {
            // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete, 
            // instead of restarting the entire Electron App.
            options.reload();
          },
          vite: {
            build: {
              outDir: 'dist-electron',
            },
          },
        },
      ]),
      isElectron && renderer(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  };

  // If we are building the bridge UI specifically (e.g., via a custom npm script)
  if (mode === 'bridge-ui') {
    return {
      ...baseConfig,
      build: {
        ...baseConfig.build,
        outDir: 'public/downloads/hems-dispatch/ui',
        emptyOutDir: true,
        rollupOptions: {
          input: 'src/bridge-main.tsx', // Use a dedicated entry file for the bridge
          output: {
            entryFileNames: `assets/[name].js`,
            chunkFileNames: `assets/[name].js`,
            assetFileNames: `assets/[name].[ext]`
          }
        }
      }
    };
  }

  return baseConfig;
});