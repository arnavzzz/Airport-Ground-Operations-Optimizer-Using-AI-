export default function Navitem({ item, active, setActive }) {
    return (
        <div
            className={`nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => setActive(item.id)}
        >
            <div className="nav-icon">{item.icon}</div>
            <span className="nav-item-label">{item.label}</span>
            {item.badge && (
                <span className="badge">
          {item.badge > 9 ? "9+" : item.badge}
        </span>
            )}
        </div>
    );
}