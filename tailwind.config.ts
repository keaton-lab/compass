import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        panel: "var(--panel)",
        "panel-strong": "var(--panel-strong)",
        "panel-border": "var(--panel-border)",
        muted: "var(--muted)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "bg-secondary": "var(--bg-secondary)",
        accent: "var(--accent)",
        "accent-alpha": "var(--accent-alpha)",
        "accent-border": "var(--accent-border)",
      },
      screens: {
        'xsm': '390px',
      },
    },
  },
  plugins: [],
};
export default config;
