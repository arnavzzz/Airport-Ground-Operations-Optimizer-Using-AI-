import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";

import { Dashboard }     from "./pages/Dashboard";
import { Analytics }     from "./pages/Analytics";
import { Projects }      from "./pages/Projects";
import { Messages }      from "./pages/Messages";
import { Calendar }      from "./pages/Calendar";
import { Team }          from "./pages/Team";
import { Files }         from "./pages/Files";
import { Settings }      from "./pages/Settings";
import { Notifications } from "./pages/Notifications";

import "./styles/sidebar.css";
import "./styles/layout.css";

const pageMap = {
    dashboard:     Dashboard,
    analytics:     Analytics,
    projects:      Projects,
    messages:      Messages,
    calendar:      Calendar,
    team:          Team,
    files:         Files,
    settings:      Settings,
    notifications: Notifications,
};

export default function App() {
    const [active, setActive] = useState("dashboard");

    const ActivatePage = pageMap[active] || Dashboard;

    return (
        <div className="app-wrapper">
            <Sidebar active={active} setActive={setActive} />

            <main className="main-content">
                <Header active={active} />

                {pageMap[active] ?? <Dashboard />}
                <ActivatePage/>

                <Footer />
            </main>
        </div>
    );
}