export const navItems = [
    {
        id: "commandcenter",
        label: "Command Center",
        glass: {
            bg: "rgba(20, 20, 25, 0.65)",
            border: "rgba(255, 255, 255, 0.22)",
            text: "#f0f0f5",
            glow: "rgba(200, 200, 220, 0.12)",
            accent: "rgba(255,255,255,0.7)",
            iconTint: "#e2e8f0",
        },
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
    },
    {
        id: "flightoperations",
        label: "Flight Operation",
        glass: {
            bg: "rgba(109, 40, 217, 0.28)",
            border: "rgba(139, 92, 246, 0.55)",
            text: "#ddd6fe",
            glow: "rgba(139, 92, 246, 0.2)",
            accent: "#a78bfa",
            iconTint: "#c4b5fd",
        },
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.5l-9-9-4 4-6-6" /><polyline points="17 16.5 22 16.5 22 11.5" />
            </svg>
        ),
    },
    {
        id: "humanresources",
        label: "Human Resources",
        glass: {
            bg: "rgba(147, 51, 234, 0.28)",
            border: "rgba(192, 86, 255, 0.55)",
            text: "#e9d5ff",
            glow: "rgba(168, 85, 247, 0.2)",
            accent: "#c084fc",
            iconTint: "#d8b4fe",
        },
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        id: "equipments",
        label: "Equipment",
        glass: {
            bg: "rgba(185, 28, 28, 0.28)",
            border: "rgba(239, 68, 68, 0.55)",
            text: "#fecaca",
            glow: "rgba(239, 68, 68, 0.2)",
            accent: "#f87171",
            iconTint: "#fca5a5",
        },
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
        ),
    },
    {
        id: "infrastructures",
        label: "Infrastructure",
        glass: {
            bg: "rgba(21, 128, 61, 0.28)",
            border: "rgba(34, 197, 94, 0.55)",
            text: "#bbf7d0",
            glow: "rgba(34, 197, 94, 0.2)",
            accent: "#4ade80",
            iconTint: "#86efac",
        },
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        ),
    },
    {
        id: "aienginepage",
        label: "AI Engine",
        glass: {
            bg: "rgba(29, 78, 216, 0.28)",
            border: "rgba(59, 130, 246, 0.55)",
            text: "#bfdbfe",
            glow: "rgba(59, 130, 246, 0.2)",
            accent: "#60a5fa",
            iconTint: "#93c5fd",
        },
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a7 7 0 0 1-7 7H9a7 7 0 0 1-7-7H1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2z" />
                <circle cx="7.5" cy="14.5" r="1.5" /><circle cx="16.5" cy="14.5" r="1.5" />
            </svg>
        ),
    },
    {
        id: "analyticspage",
        label: "Analytics",
        glass: {
            bg: "rgba(8, 145, 178, 0.28)",
            border: "rgba(6, 182, 212, 0.55)",
            text: "#a5f3fc",
            glow: "rgba(6, 182, 212, 0.2)",
            accent: "#22d3ee",
            iconTint: "#67e8f9",
        },
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
            </svg>
        ),
    },
    {
        id: "weatherpage",
        label: "Weather",
        glass: {
            bg: "linear-gradient(135deg, rgba(14,116,144,0.4), rgba(56,189,248,0.3))",
            border: "rgba(125, 211, 252, 0.5)",
            text: "#e0f2fe",
            glow: "rgba(56, 189, 248, 0.25)",
            accent: "#7dd3fc",
            iconTint: "#bae6fd",
            weatherBg: true,
        },
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
            </svg>
        ),
    },
    {
        id: "notifications",
        label: "Notifications",
        badge: 12,
        glass: {
            bg: "rgba(29, 78, 216, 0.28)",
            border: "rgba(99, 102, 241, 0.55)",
            text: "#c7d2fe",
            glow: "rgba(99, 102, 241, 0.2)",
            accent: "#818cf8",
            iconTint: "#a5b4fc",
        },
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
        ),
    },
];