declare const config: {
    darkMode: ["class"];
    content: string[];
    theme: {
        extend: {
            fontFamily: {
                heading: [string, string];
                sans: [string, string];
                mono: [string, string, string, string];
            };
            colors: {
                "bg-primary": string;
                "bg-surface": string;
                "bg-elevated": string;
                "border-subtle": string;
                "accent-blue": string;
                "accent-purple": string;
                success: string;
                warning: string;
                danger: string;
                "text-primary": string;
                "text-muted": string;
                "text-hint": string;
            };
            boxShadow: {
                glow: string;
                panel: string;
            };
            keyframes: {
                shimmer: {
                    "0%": {
                        backgroundPosition: string;
                    };
                    "100%": {
                        backgroundPosition: string;
                    };
                };
            };
            animation: {
                shimmer: string;
            };
        };
    };
    plugins: never[];
};
export default config;
