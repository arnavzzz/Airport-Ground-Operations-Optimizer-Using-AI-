export default function Header({ active }) {
    const titleMap = {
        commandcenter: "Command Center",
        flightoperations: "Flight Operation",
        humanresources: "Human Resources",
        infrastructures: "Infrastructure",
        equipments: "Equipment",
        aienginepage: "AI Engine",
        analyticspage: "Analytics",
        weatherpage: "Weather",
        notifications: "Notifications",
    };

    return (
        <header className="page-header">
            <div className="header-left">
                <h1 className="header-title">{titleMap[active] ?? "Page"}</h1>
                <span className="header-breadcrumb">
          GroundFlow Optimizer / {titleMap[active]}
        </span>
            </div>
            <div className="header-right">
                {/* <div className="header-search">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span>Search…</span>
                </div> */}
                <div className="header-avatar">A</div>
            </div>
        </header>
    );
}