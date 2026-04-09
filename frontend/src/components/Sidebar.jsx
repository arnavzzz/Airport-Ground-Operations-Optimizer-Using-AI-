import {useState } from "react";

const navItems = [
    {
        id: "dashboard",
        label: "Dashboard",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
    },
    {
        id: "analytics",
        label: "Analytics",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
            </svg>
        ),
    },
    {
        id: "projects",
        label: "Projects",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
        ),
    },
    {
        id: "messages",
        label: "Messages",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        badge: 4,
    },
    {
        id: "calendar",
        label: "Calendar",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
    },
    {
        id: "team",
        label: "Team",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        id: "files",
        label: "Files",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
            </svg>
        ),
    },
    {
        id: "settings",
        label: "Settings",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
    },
    {
        id: "notifications",
        label: "Notifications",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
        ),
        badge: 12,
    },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  .app-wrapper {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
    position: relative;
    overflow: hidden;
  }

  .app-wrapper::before {
    content: '';
    position: absolute;
    top: -200px; left: -200px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(120, 80, 255, 0.35) 0%, transparent 70%);
    pointer-events: none;
    animation: drift1 8s ease-in-out infinite alternate;
  }

  .app-wrapper::after {
    content: '';
    position: absolute;
    bottom: -100px; right: -100px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(0, 200, 255, 0.25) 0%, transparent 70%);
    pointer-events: none;
    animation: drift2 10s ease-in-out infinite alternate;
  }

  @keyframes drift1 {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(80px, 60px) scale(1.15); }
  }
  @keyframes drift2 {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(-60px, -80px) scale(1.1); }
  }

  .glass-sidebar {
    position: relative;
    z-index: 10;
    width: 240px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    border-right: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 4px 0 40px rgba(0, 0, 0, 0.3), inset 1px 0 0 rgba(255,255,255,0.08);
    padding: 0;
    overflow: hidden;
  }

  .glass-sidebar::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  }

  .sidebar-header {
    padding: 28px 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .logo-area {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #a78bfa, #60a5fa);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(167, 139, 250, 0.4);
    flex-shrink: 0;
  }

  .logo-icon svg {
    width: 18px;
    height: 18px;
    color: white;
    fill: white;
  }

  .logo-text {
    font-family: 'Syne', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: 0.02em;
  }

  .logo-sub {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 400;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 1px;
  }

  .nav-section {
    flex: 1;
    padding: 16px 12px;
    overflow-y: auto;
    scrollbar-width: none;
  }

  .nav-section::-webkit-scrollbar { display: none; }

  .nav-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.28);
    padding: 0 8px;
    margin-bottom: 8px;
    margin-top: 4px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 12px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    margin-bottom: 2px;
    border: 1px solid transparent;
    color: rgba(255, 255, 255, 0.55);
    user-select: none;
  }

  .nav-item:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .nav-item.active {
    background: rgba(167, 139, 250, 0.18);
    border-color: rgba(167, 139, 250, 0.35);
    color: #c4b5fd;
    box-shadow: 0 0 20px rgba(167, 139, 250, 0.12), inset 0 1px 0 rgba(255,255,255,0.1);
  }

  .nav-item.active::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 60%;
    background: linear-gradient(180deg, #a78bfa, #60a5fa);
    border-radius: 0 4px 4px 0;
  }

  .nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .nav-item:hover .nav-icon,
  .nav-item.active .nav-icon {
    transform: scale(1.1);
  }

  .nav-item-label {
    font-size: 14px;
    font-weight: 400;
    flex: 1;
    transition: font-weight 0.15s;
    letter-spacing: 0.01em;
  }

  .nav-item.active .nav-item-label {
    font-weight: 500;
  }

  .badge {
    background: linear-gradient(135deg, #a78bfa, #60a5fa);
    color: white;
    font-size: 10px;
    font-weight: 600;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
    box-shadow: 0 2px 8px rgba(167,139,250,0.5);
    letter-spacing: 0;
  }

  .sidebar-footer {
    padding: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .sign-in-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.25s ease;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.75);
    user-select: none;
    position: relative;
    overflow: hidden;
  }

  .sign-in-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(167,139,250,0.15), rgba(96,165,250,0.15));
    opacity: 0;
    transition: opacity 0.25s;
  }

  .sign-in-btn:hover {
    border-color: rgba(167,139,250,0.4);
    color: white;
    box-shadow: 0 4px 20px rgba(167,139,250,0.2);
  }

  .sign-in-btn:hover::before { opacity: 1; }

  .avatar-ring {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #a78bfa, #60a5fa);
    padding: 1.5px;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  .avatar-inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(30, 20, 60, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    color: #c4b5fd;
    font-family: 'Syne', sans-serif;
  }

  .sign-in-info {
    flex: 1;
    position: relative;
    z-index: 1;
  }

  .sign-in-name {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.9);
    line-height: 1.2;
  }

  .sign-in-action {
    font-size: 11px;
    color: rgba(255,255,255,0.45);
    margin-top: 1px;
  }

  .sign-in-arrow {
    display: flex;
    align-items: center;
    color: rgba(255,255,255,0.35);
    transition: transform 0.2s, color 0.2s;
    position: relative;
    z-index: 1;
  }

  .sign-in-btn:hover .sign-in-arrow {
    transform: translateX(3px);
    color: #a78bfa;
  }

  .main-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
  }

  .content-card {
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    padding: 48px;
    text-align: center;
    max-width: 400px;
  }

  .content-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: white;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #c4b5fd, #93c5fd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .content-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.45);
    line-height: 1.6;
  }

  .content-tab-name {
    display: inline-block;
    margin-top: 16px;
    padding: 6px 16px;
    background: rgba(167,139,250,0.15);
    border: 1px solid rgba(167,139,250,0.3);
    border-radius: 20px;
    font-size: 13px;
    color: #c4b5fd;
    font-weight: 500;
  }
`;

export default function GlassNav() {
    const [active, setActive] = useState("dashboard");

    const activeItem = navItems.find((n) => n.id === active);

    return (
        <>
            <style>{styles}</style>
            <div className="app-wrapper">
                <aside className="glass-sidebar">
                    {/* Header */}
                    <div className="sidebar-header">
                        <div className="logo-area">
                            <div className="logo-icon">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <polygon points="12,2 22,20 2,20" />
                                </svg>
                            </div>
                            <div>
                                <div className="logo-text">Luminary</div>
                                <div className="logo-sub">Workspace</div>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="nav-section">
                        <div className="nav-label">Main Menu</div>
                        {navItems.slice(0, 5).map((item) => (
                            <div
                                key={item.id}
                                className={`nav-item ${active === item.id ? "active" : ""}`}
                                onClick={() => setActive(item.id)}
                            >
                                <div className="nav-icon">{item.icon}</div>
                                <span className="nav-item-label">{item.label}</span>
                                {item.badge && <span className="badge">{item.badge > 9 ? "9+" : item.badge}</span>}
                            </div>
                        ))}

                        <div className="nav-label" style={{ marginTop: 20 }}>Management</div>
                        {navItems.slice(5).map((item) => (
                            <div
                                key={item.id}
                                className={`nav-item ${active === item.id ? "active" : ""}`}
                                onClick={() => setActive(item.id)}
                            >
                                <div className="nav-icon">{item.icon}</div>
                                <span className="nav-item-label">{item.label}</span>
                                {item.badge && <span className="badge">{item.badge > 9 ? "9+" : item.badge}</span>}
                            </div>
                        ))}
                    </nav>

                    {/* Sign In Footer */}
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

                {/* Main content area */}
                <main className="main-content">
                    <div className="content-card">
                        <div className="content-title">
                            {activeItem?.label}
                        </div>
                        <p className="content-sub">
                            Your {activeItem?.label.toLowerCase()} content will appear here. Select any tab from the sidebar to explore.
                        </p>
                        <span className="content-tab-name">/{active}</span>
                    </div>
                </main>
            </div>
        </>
    );
}