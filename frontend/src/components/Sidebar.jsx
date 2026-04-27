import NavItem from "./Navitem";
import { navItems } from "../navItems.jsx";

export default function Sidebar({ active, setActive }) {
    return (
        <aside className="glass-sidebar" aria-label="Primary navigation">
            <div className="sidebar-header">
                <div className="logo-area">
                    <div className="logo-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                        </svg>
                    </div>
                    <div>
                        <div className="logo-text">GroundFlow</div>
                        <div className="logo-sub">Optimizer</div>
                    </div>
                </div>
                <div className="sidebar-system-card">
                    <span className="system-card-label">Ops mode</span>
                    <strong>Live Control</strong>
                    <span>AI assisted planning</span>
                </div>
            </div>

            <nav className="nav-section">
                <div className="nav-group-label">Operations</div>
                <div className="nav-group">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.id}
                            item={item}
                            active={active}
                            setActive={setActive}
                        />
                    ))}
                </div>
            </nav>
        </aside>
    );
}
