import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";

import { CommandCenter }     from "./pages/CommandCenter";
import { FlightOperations }     from "./pages/FlightOperation";
import { HumanResources }      from "./pages/HumanResources";
import { Infrastructures }      from "./pages/Infrastructure";
import { Equipments }      from "./pages/Equipment";
import { AIEnginePage }          from "./pages/AiEngine";
import { AnalyticsPage }         from "./pages/Analytics";
import { WeatherPage }      from "./pages/Weather";
import { Notifications } from "./pages/Notifications";

import "./styles/sidebar.css";
import "./styles/layout.css";

const pageMap = {
    commandcenter:     CommandCenter,
    flightoperations:     FlightOperations,
    humanresources:      HumanResources,
    infrastructures:      Infrastructures,
    equipments:      Equipments,
    aienginepage:          AIEnginePage,
    analyticspage:         AnalyticsPage,
    weatherpage:      WeatherPage,
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

                {/*{pageMap[active] ?? <Dashboard />}*/}
                <ActivatePage/>

                <Footer />
            </main>
        </div>
    );
}