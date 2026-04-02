import React from "react";
import { createRoot } from "react-dom/client";
import BridgeUI from "./components/BridgeUI";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
            <BridgeUI />
            <Sonner />
        </TooltipProvider>
    </ThemeProvider>
  </React.StrictMode>
);