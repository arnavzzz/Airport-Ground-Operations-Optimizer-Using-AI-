import { getCommandCenterData } from "../api";
import {
    DataTable,
    DetailList,
    KeyValuePanel,
    MetricGrid,
    ModulePage,
    StatusTag,
    formatDateTime,
    formatMinutes,
    formatNumber,
    formatPercent,
} from "../components/ModuleData";
import { useModuleData } from "../hooks/useModuleData";

export function CommandCenter() {
    const { data, loading, error, refresh } = useModuleData(getCommandCenterData);
    const kpis = data?.kpis || {};
    const weather = data?.weather || {};

    return (
        <ModulePage
            summary="Command center overview fed directly by the Django notebook runtime."
            generatedAt={data?.generated_at}
            loading={loading}
            error={error}
            onRefresh={refresh}
        >
            <MetricGrid
                items={[
                    { label: "Command Score", value: formatPercent(kpis.command_center_score), tone: "low" },
                    { label: "Active Flights", value: formatNumber(kpis.active_flights, 0) },
                    { label: "High Risk", value: formatNumber(kpis.high_risk_flights, 0), tone: "high" },
                    { label: "Avg Delay Risk", value: formatPercent(kpis.avg_delay_risk), tone: "medium" },
                    { label: "Staff Utilization", value: formatPercent(kpis.staff_utilization_pct) },
                    { label: "Equipment Utilization", value: formatPercent(kpis.equipment_utilization_pct) },
                    { label: "Open Conflicts", value: formatNumber(kpis.open_conflicts, 0), tone: "high" },
                    { label: "Critical Actions", value: formatNumber(kpis.critical_actions, 0), tone: "critical" },
                ]}
            />

            <div className="module-grid module-grid-two">
                <KeyValuePanel
                    title="Weather Snapshot"
                    subtitle="Live conditions driving the current risk mix."
                    items={[
                        { label: "Condition", value: weather.condition || "—" },
                        { label: "Visibility", value: weather.visibility_km ? `${formatNumber(weather.visibility_km, 1)} km` : "—" },
                        { label: "Crosswind", value: weather.crosswind_knots ? `${formatNumber(weather.crosswind_knots, 0)} kt` : "—" },
                        { label: "Storm Probability", value: formatPercent(weather.storm_probability_pct), tone: "medium" },
                    ]}
                />

                <DetailList
                    title="Operational Conflicts"
                    subtitle="Current conflicts surfaced by the command notebook."
                    items={data?.conflicts || []}
                    getTitle={(item) => `${item.asset} · ${item.type}`}
                    getBody={(item) => item.description}
                    getMeta={(item) => formatDateTime(item.time)}
                    getTag={(item) => item.severity}
                    emptyMessage="No active conflicts in the current payload."
                />
            </div>

            <DataTable
                title="Top Risk Flights"
                subtitle="Flights ranked by current command center risk score."
                rows={data?.top_risks || []}
                maxRows={10}
                columns={[
                    { key: "flight_id", label: "Flight" },
                    { key: "airline", label: "Airline" },
                    { key: "gate", label: "Gate" },
                    { key: "status", label: "Status", render: (value) => <StatusTag value={value} /> },
                    { key: "arrival_delay_min", label: "Arrival Delay", render: (value) => formatMinutes(value) },
                    { key: "risk_score", label: "Risk Score", render: (value) => formatPercent(value) },
                    { key: "risk_level", label: "Risk Level", render: (value) => <StatusTag value={value} /> },
                ]}
            />

            <DataTable
                title="Recommended Actions"
                subtitle="Operational actions prioritized by the backend notebook."
                rows={data?.actions || []}
                maxRows={12}
                columns={[
                    { key: "priority_rank", label: "Priority" },
                    { key: "flight_id", label: "Flight" },
                    { key: "action_type", label: "Action", render: (value) => value?.replace(/_/g, " ") || "—" },
                    { key: "risk_level", label: "Level", render: (value) => <StatusTag value={value} /> },
                    { key: "recommendation", label: "Recommendation" },
                ]}
            />
        </ModulePage>
    );
}
