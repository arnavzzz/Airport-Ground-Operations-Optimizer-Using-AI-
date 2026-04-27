const PAGE_META = {
    commandcenter: {
        title: "Command Center",
        eyebrow: "Airport control tower",
        summary: "Live operational overview and exception handling",
    },
    flightoperations: {
        title: "Flight Operation",
        eyebrow: "Airside flow",
        summary: "Gates, runway usage, turnaround and delay risk",
    },
    humanresources: {
        title: "Human Resources",
        eyebrow: "Workforce control",
        summary: "Shift capacity, fatigue risk and role coverage",
    },
    infrastructures: {
        title: "Infrastructure",
        eyebrow: "Airport assets",
        summary: "Gates, bays, belts, GPUs and runway availability",
    },
    equipments: {
        title: "Equipment",
        eyebrow: "Ground support",
        summary: "Fleet availability, utilization and maintenance risk",
    },
    aienginepage: {
        title: "AI Engine",
        eyebrow: "Decision intelligence",
        summary: "Prediction, optimization and conflict resolution",
    },
    analyticspage: {
        title: "Analytics",
        eyebrow: "Performance review",
        summary: "Trends, savings, causes and model improvement",
    },
    weatherpage: {
        title: "Weather",
        eyebrow: "MET operations",
        summary: "Visibility, wind, runway suitability and capacity impact",
    },
    notifications: {
        title: "Notifications",
        eyebrow: "Alert feed",
        summary: "Severity routing, acknowledgement and escalation",
    },
};

export default function Header({ active, backendStatus }) {
    const meta = PAGE_META[active] ?? {
        title: "Page",
        eyebrow: "Operations",
        summary: "Airport operating surface",
    };
    const statusState = backendStatus?.state || "checking";
    const statusLabel = statusState === "connected"
        ? "Backend connected"
        : statusState === "offline"
            ? "Backend offline"
            : "Checking backend";
    const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <header className="page-header">
            <div className="header-left">
                <span className="header-eyebrow">{meta.eyebrow}</span>
                <h1 className="header-title">{meta.title}</h1>
                <span className="header-breadcrumb">{meta.summary}</span>
            </div>
            <div className="header-right">
                <div className="header-time" aria-label="Local time">
                    <span>Local</span>
                    <strong>{timestamp}</strong>
                </div>
                <div className={`backend-status status-${statusState}`} title={backendStatus?.message || statusLabel}>
                    <span className="backend-status-dot" />
                    <span>{statusLabel}</span>
                </div>
                <div className="header-avatar" title="AA Profile" aria-label="AA profile">
                    <img src="/profile-picture.png" alt="" aria-hidden="true" />
                    <span>AA</span>
                </div>
            </div>
        </header>
    );
}
