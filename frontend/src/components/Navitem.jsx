export default function Navitem({ item, active, setActive }) {

    const isActive = active === item.id;
    const g = item.glass || {};

    const activeStyle = isActive
        ? {
            background: g.bg || "rgba(167,139,250,0.18)",
            borderColor: g.border || "rgba(167,139,250,0.35)",
            color: g.text || "#c4b5fd",
            boxShadow: `0 0 24px ${g.glow || "rgba(167,139,250,0.15)"}, inset 0 1px 0 rgba(255,255,255,0.1)`,
        }
        : {};

    return (
        <div
            className={`nav-item ${active === item.id ? "active" : ""}`}
            data-id={item.id}
            style = {activeStyle}
            onClick={() => setActive(item.id)}
        >
        {/* Accent left bar */}
            {isActive && (
                <span
                    className="nav-accent-bar"
                    style={{ background: g.accent || "#a78bfa" }}
                />
            )}
 
            {/* Weather shimmer overlay */}
            {isActive && g.weatherBg && (
                <span className="nav-weather-shimmer" />
            )}
 
            <div
                className="nav-icon"
                style={isActive ? { color: g.iconTint || g.text || "currentColor" } : {}}
            >
                {item.icon}
            </div>
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
        </div>
    );
}