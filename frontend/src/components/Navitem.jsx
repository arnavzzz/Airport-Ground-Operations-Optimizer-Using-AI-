export default function Navitem({ item, active, setActive }) {
    const isActive = active === item.id;
    const g = item.glass || {};

    const activeStyle = isActive
        ? {
            background: g.bg || "rgba(167,139,250,0.18)",
            borderColor: g.border || "rgba(167,139,250,0.35)",
            color: g.text || "#c4b5fd",
            boxShadow: `0 12px 28px ${g.glow || "rgba(167,139,250,0.15)"}, inset 0 1px 0 rgba(255,255,255,0.12)`,
        }
        : {};

    return (
        <button
            type="button"
            className={`nav-item ${isActive ? "active" : ""}`}
            data-id={item.id}
            style={activeStyle}
            onClick={() => setActive(item.id)}
            aria-current={isActive ? "page" : undefined}
        >
            {isActive && (
                <span
                    className="nav-accent-bar"
                    style={{ background: g.accent || "#a78bfa" }}
                />
            )}

            {isActive && g.weatherBg && (
                <span className="nav-weather-shimmer" />
            )}

            <span
                className="nav-icon"
                style={isActive ? { color: g.iconTint || g.text || "currentColor" } : {}}
                aria-hidden="true"
            >
                {item.icon}
            </span>
            <span className="nav-item-label">{item.label}</span>
            {item.badge && (
                <span
                    className="badge"
                    style={isActive
                        ? { background: `linear-gradient(135deg, ${g.accent || "#a78bfa"}, ${g.border || "#60a5fa"})` }
                        : {}
                    }
                >
                    {item.badge > 9 ? "9+" : item.badge}
                </span>
            )}
        </button>
    );
}
