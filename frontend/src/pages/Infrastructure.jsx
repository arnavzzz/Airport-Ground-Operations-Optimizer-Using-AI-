import { getInfrastructureData } from "../api";
import {
    DataTable,
    DetailList,
    MetricGrid,
    ModulePage,
    StatusTag,
} from "../components/ModuleData";
import {
    formatNumber,
    formatPercent,
} from "../components/moduleFormatters";
import { useModuleData } from "../hooks/useModuleData";

export function Infrastructures() {
    const { data, loading, error, refreshedAt, refresh } = useModuleData(getInfrastructureData);
    const kpis = data?.kpis || {};

    return (
        <ModulePage
            summary="Infrastructure assets now render from the Django infrastructure notebook output."
            generatedAt={data?.generated_at}
            refreshedAt={refreshedAt}
            loading={loading}
            error={error}
            onRefresh={refresh}
        >
            <MetricGrid
                items={[
                    { label: "Total Gates", value: formatNumber(kpis.total_gates, 0) },
                    { label: "Available Gates", value: formatNumber(kpis.available_gates, 0), tone: "low" },
                    { label: "Total Bays", value: formatNumber(kpis.total_bays, 0) },
                    { label: "Available Bays", value: formatNumber(kpis.available_bays, 0), tone: "low" },
                    { label: "Active Runways", value: formatNumber(kpis.active_runways, 0) },
                    { label: "Fault GPUs", value: formatNumber(kpis.fault_gpus, 0), tone: "high" },
                    { label: "GPU Health", value: formatPercent(kpis.avg_gpu_health_pct) },
                    { label: "Gate Assignment", value: formatPercent(kpis.gate_assignment_rate_pct), tone: "medium" },
                    { label: "Bay Assignment", value: formatPercent(kpis.bay_assignment_rate_pct), tone: "medium" },
                    { label: "Open Conflicts", value: formatNumber(kpis.open_conflicts, 0), tone: "high" },
                ]}
            />

            <DataTable
                title="Asset Summary"
                subtitle="Assignment pressure across gates, bays, and GPUs."
                rows={data?.asset_summary || []}
                maxRows={6}
                columns={[
                    { key: "asset_type", label: "Asset" },
                    { key: "usable", label: "Usable" },
                    { key: "assigned", label: "Assigned" },
                    { key: "waitlisted", label: "Waitlisted" },
                    { key: "assignment_rate_pct", label: "Assignment", render: (value) => formatPercent(value) },
                    { key: "usable_utilization_pct", label: "Utilization", render: (value) => formatPercent(value) },
                    { key: "status", label: "Status", render: (value) => <StatusTag value={value} /> },
                ]}
            />

            <div className="module-grid module-grid-two">
                <DataTable
                    title="Runways"
                    subtitle="Runway status and hourly capacity from the backend module."
                    rows={data?.runways || []}
                    maxRows={4}
                    columns={[
                        { key: "runway_id", label: "Runway" },
                        { key: "length_m", label: "Length (m)" },
                        { key: "surface", label: "Surface" },
                        { key: "capacity_per_hour", label: "Capacity / Hr" },
                        { key: "status", label: "Status", render: (value) => <StatusTag value={value} /> },
                    ]}
                />

                <DetailList
                    title="Conflicts"
                    subtitle="Infrastructure conflicts currently flagged by Django."
                    items={data?.conflicts || []}
                    getTitle={(item) => `${item.flight_id || item.asset} · ${item.type}`}
                    getBody={(item) => item.message}
                    getMeta={(item) => item.asset}
                    getTag={(item) => item.severity}
                    maxItems={10}
                />
            </div>

            <DataTable
                title="Gate Register"
                subtitle="Current gate inventory surfaced by the infrastructure notebook."
                rows={data?.gates || []}
                maxRows={12}
                columns={[
                    { key: "gate_id", label: "Gate" },
                    { key: "terminal", label: "Terminal" },
                    { key: "gate_type", label: "Type" },
                    { key: "status", label: "Status", render: (value) => <StatusTag value={value} /> },
                    { key: "jet_bridge", label: "Jet Bridge", render: (value) => (value ? "Yes" : "No") },
                ]}
            />

            <DataTable
                title="Runway Pressure"
                subtitle="Per-hour runway loading used by the backend allocation logic."
                rows={data?.runway_pressure || []}
                maxRows={12}
                columns={[
                    { key: "runway_id", label: "Runway" },
                    { key: "hour", label: "Hour" },
                    { key: "movements", label: "Movements" },
                    { key: "capacity_per_hour", label: "Capacity" },
                    { key: "utilization_pct", label: "Utilization", render: (value) => formatPercent(value) },
                    { key: "status", label: "Status", render: (value) => <StatusTag value={value} /> },
                ]}
            />

            <DetailList
                title="Recommendations"
                subtitle="Suggested infrastructure actions ranked by severity."
                items={data?.recommendations || []}
                getTitle={(item) => `${item.asset} · ${item.message}`}
                getBody={(item) => item.recommendation}
                getMeta={(item) => `Priority ${item.priority_rank || "—"}`}
                getTag={(item) => item.severity}
                maxItems={10}
            />
        </ModulePage>
    );
}
