/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {

    fontFamily: {
      sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      display: ["'Outfit'", "system-ui", "sans-serif"],
      mono: ["'JetBrains Mono'", "monospace"],
    },


    extend: {
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },


      colors: {

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },


        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },


        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },


        brand: {
          50: "#fdf4ff",
          100: "#fae8ff",
          200: "#f5d0fe",
          300: "#f0abfc",
          400: "#e879f9",
          500: "#d946ef",   
          600: "#c026d3",
          700: "#a21caf",
          800: "#86198f",
          900: "#701a75",
          950: "#4a044e",
        },
        cyan: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",   
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        surface: {
          0: "#050505",    
          1: "#0a0a0a",    
          2: "#121212",    
          3: "#171717",    
          4: "#262626",    
          5: "#404040",    
          6: "#525252",    
        },
        ink: {
          primary: "#f1f3f9",
          secondary: "#9ba3be",
          muted: "#5c6585",
          disabled: "#363d55",
        },
      },

      borderRadius: {
        none: "0",
        xs: "0.25rem",
        sm: "calc(var(--radius) - 4px)",
        DEFAULT: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "1.25rem",
        full: "9999px",
      },

      
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.875rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },

      boxShadow: {
        "glow-sm": "0 0 12px 2px rgba(217, 70, 239, 0.25)",
        "glow": "0 0 20px 4px rgba(217, 70, 239, 0.35)",
        "glow-lg": "0 0 40px 8px rgba(217, 70, 239, 0.4)",
        "glow-cyan": "0 0 20px 4px rgba(45, 212, 191, 0.3)",
        "card": "0 1px 3px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.6), 0 8px 32px rgba(217, 70, 239, 0.15)",
        "panel": "inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.06)",
      },

      backdropBlur: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "40px",
        "3xl": "64px",
      },

      maxWidth: {
        screen: "100vw",
        prose: "65ch",
        "8xl": "88rem",
        "9xl": "96rem",
      },

      keyframes: {
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },

        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px 2px rgba(217, 70, 239, 0.3)" },
          "50%": { boxShadow: "0 0 24px 6px rgba(217, 70, 239, 0.6)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "border-beam": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },

      animation: {
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-up": "fade-up 0.4s ease-out",
        "fade-down": "fade-down 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "border-beam": "border-beam 4s ease infinite",
      },

      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #d946ef 0%, #2dd4bf 100%)",
        "brand-gradient-dark": "linear-gradient(135deg, #a21caf 0%, #0d9488 100%)",
        "brand-radial": "radial-gradient(ellipse at center, rgba(217, 70, 239, 0.15) 0%, transparent 70%)",
        "surface-gradient": "linear-gradient(180deg, #0a0a0a 0%, #050505 100%)",
        "card-gradient": "linear-gradient(145deg, #121212 0%, #0a0a0a 100%)",
        "shimmer-gradient": "linear-gradient(90deg, transparent 0%, rgba(217, 70, 239, 0.08) 50%, transparent 100%)",
        "hero-glow": "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(217, 70, 239, 0.3) 0%, transparent 60%)",
        "cyan-glow": "radial-gradient(ellipse 60% 40% at 80% 20%, rgba(45, 212, 191, 0.15) 0%, transparent 60%)",
      },

      transitionDuration: {
        "50": "50ms",
        "75": "75ms",
        "150": "150ms",
        "250": "250ms",
        "350": "350ms",
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "1000": "1000ms",
      },

      zIndex: {
        "1": "1",
        "2": "2",
        "5": "5",
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
        "modal": "1000",
        "toast": "1100",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};
