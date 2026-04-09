import NavItem from "./Navitem";
import { navItems } from "../navItems.jsx";

const groups = ["Main Menu", "Management"];

export default function Sidebar({ active, setActive }) {
    return (
        <aside className="glass-sidebar">
            {/* Logo header */}
            <div className="sidebar-header">
                <div className="logo-area">
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                            <polygon points="12,2 22,20 2,20" />
                        </svg>
                    </div>
                    <div>
                        <div className="logo-text">Luminary</div>
                        <div className="logo-sub">Workspace</div>
                    </div>
                </div>
            </div>

            {/* Grouped nav items */}
            <nav className="nav-section">
                {groups.map((group) => (
                    <div key={group} className="nav-group">
                        <div className="nav-label">{group}</div>
                        {navItems
                            .filter((item) => item.group === group)
                            .map((item) => (
                                <NavItem
                                    key={item.id}
                                    item={item}
                                    active={active}
                                    setActive={setActive}
                                />
                            ))}
                    </div>
                ))}
            </nav>

            {/* Sign in footer */}
            <div className="sidebar-footer">
                <div className="sign-in-btn">
                    <div className="avatar-ring">
                        <div className="avatar-inner">G</div>
                    </div>
                    <div className="sign-in-info">
                        <div className="sign-in-name">Guest User</div>
                        <div className="sign-in-action">Sign in to your account</div>
                    </div>
                    <div className="sign-in-arrow">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </div>
            </div>
        </aside>
    );
}