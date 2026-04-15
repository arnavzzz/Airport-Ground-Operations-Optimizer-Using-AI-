import NavItem from "./Navitem";
import { navItems } from "../navItems.jsx";

export default function Sidebar({ active, setActive }) {
    return (
        <aside className="glass-sidebar">
            {/* Logo header */}
            <div className="sidebar-header">
                <div className="logo-area">
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                        </svg>
                    </div>
                    <div>
                        <div className="logo-text">GroundFlow</div>
                        <div className="logo-sub">Optimizer</div>
                    </div>
                </div>
            </div>

            {/* Flat nav — no section labels */}
            <nav className="nav-section">
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