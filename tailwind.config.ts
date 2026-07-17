import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F3F4F6",
        surface: "#FFFFFF",
        ink: "#0E1116",
        inkSoft: "#171B24",
        muted: "#5B6472",
        muted2: "#8A92A0",
        line: "#E3E6EB",
        line2: "#2A3040",
        iris: "#3D2CE0",
        irisBright: "#6B5BFF",
        irisTint: "#EEEBFF",
        live: "#129E74",
        liveTint: "#E4F5EE",
        signal: "#E8552B",
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "sans-serif"],
        body: ["var(--font-plex)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
        tc: ["var(--font-noto-tc)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
