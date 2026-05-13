var config = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                heading: ["Syne", "sans-serif"],
                sans: ["DM Sans", "sans-serif"],
                mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
            },
            colors: {
                "bg-primary": "rgb(var(--color-bg-primary) / <alpha-value>)",
                "bg-surface": "rgb(var(--color-bg-surface) / <alpha-value>)",
                "bg-elevated": "rgb(var(--color-bg-elevated) / <alpha-value>)",
                "border-subtle": "rgb(var(--color-border-subtle) / <alpha-value>)",
                "accent-blue": "rgb(var(--color-accent-blue) / <alpha-value>)",
                "accent-purple": "rgb(var(--color-accent-purple) / <alpha-value>)",
                success: "rgb(var(--color-success) / <alpha-value>)",
                warning: "rgb(var(--color-warning) / <alpha-value>)",
                danger: "rgb(var(--color-danger) / <alpha-value>)",
                "text-primary": "rgb(var(--color-text-primary) / <alpha-value>)",
                "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
                "text-hint": "rgb(var(--color-text-hint) / <alpha-value>)"
            },
            boxShadow: {
                glow: "0 18px 60px rgba(108, 143, 255, 0.18)",
                panel: "0 18px 50px rgba(0, 0, 0, 0.18)"
            },
            keyframes: {
                shimmer: {
                    "0%": { backgroundPosition: "-420px 0" },
                    "100%": { backgroundPosition: "420px 0" }
                }
            },
            animation: {
                shimmer: "shimmer 1.5s infinite linear"
            }
        }
    },
    plugins: []
};
export default config;
