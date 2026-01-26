// types/window.d.ts (create this file if it doesn't exist)
import type { Clerk } from "@clerk/clerk-js";

declare global {
  interface Window {
    Clerk?: Clerk;
  }
}

export {};
