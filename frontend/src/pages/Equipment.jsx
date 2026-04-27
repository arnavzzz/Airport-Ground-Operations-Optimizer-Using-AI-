import { getEquipmentsData } from "../api";
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

export function Equipments() {
    const { data, loading, error, refresh } = useModuleData(getEquipmentsData);
    const kpis = data?.kpis || {};

    return (
        <ModulePage
            summary="Equipment inventory, zone coverage, maintenance, and live equipment events now come from Django."
            generatedAt={data?.generated_at}
            loading={loading}
            error={error}
            onRefresh={refresh}
        >
            <MetricGrid
                items={[
                    { label: "Total Units", value: formatNumber(kpis.total_units, 0) },
                    { label: "Serviceable", value: formatNumber(kpis.serviceable_units, 0), tone: "low" },
                    { label: "In Use", value: formatNumber(kpis.in_use_units, 0) },
                    { label: "Maintenance", value: formatNumber(kpis.maintenance_units, 0), tone: "medium" },
                    { label: "Low Fuel", value: formatNumber(kpis.low_fuel_units, 0), tone: "high" },
                    { label: "High Risk Units", value: formatNumber(kpis.high_maintenance_risk_units, 0), tone: "high" },
                    { label: "Fill Rate", value: formatPercent(kpis.assignment_fill_rate_pct) },
                    { label: "Pressure", value: formatPercent(kpis.avg_utilization_pressure_pct), tone: "medium" },
                    { label: "Operation Score", value: formatPercent(kpis.equipment_operation_score), tone: "low" },
                ]}
            />

            <DataTable
                title="Equipment Capacity"
                subtitle="Supply versus demand by equipment type."
                rows={data?.capacity || []}
                maxRows={8}
                columns={[
                    { key: "equipment_type", label: "Equipment" },
                    { key: "serviceable_units", label: "Serviceable" },
                    { key: "maintenance_units", label: "Maintenance" },
                    { key: "low_fuel_units", label: "Low Fuel" },
                    { key: "demand_next_90m", label: "Demand" },
                    { key: "capacity_gap", label: "Gap" },
                    { key: "utilization_pct", label: "Utilization", render: (value) => formatPercent(value) },
                    { key: "capacity_status", label: "Status", render: (value) => <StatusTag value={value} /> },
                ]}
            />

            <div className="module-grid module-grid-two">
                <DetailList
                    title="Live Equipment Feed"
                    subtitle="Recent equipment events from the backend feed."
                    items={data?.live_feed || []}
                    getTitle={(item) => `${item.equipment_id} · ${item.equipment_type}`}
                    getBody={(item) => item.message}
                    getMeta={(item) => `${item.zone} · ${item.time}`}
                    getTag={(item) => item.severity}
                    maxItems={10}
                />

                <DetailList
                    title="Recommendations"
                    subtitle="Actions suggested to relieve capacity pressure and maintenance risk."
                    items={data?.recommendations || []}
                    getTitle={(item) => `${item.asset} · ${item.message}`}
                    getBody={(item) => item.recommendation}
                    getMeta={(item) => `Priority ${item.priority_rank || "—"}`}
                    getTag={(item) => item.severity}
                    maxItems={10}
                />
            </div>

            <DataTable
                title="Maintenance Watchlist"
                subtitle="Equipment most likely to need intervention."
                rows={data?.maintenance_watchlist || []}
                maxRows={12}
                columns={[
                    { key: "equipment_id", label: "Equipment ID" },
                    { key: "equipment_type", label: "Type" },
                    { key: "zone", label: "Zone" },
                    { key: "current_gate", label: "Gate" },
                    { key: "fuel_level_pct", label: "Fuel", render: (value) => formatPercent(value) },
                    { key: "condition_score", label: "Condition", render: (value) => formatPercent(value) },
                    { key: "maintenance_risk_score", label: "Risk", render: (value) => formatPercent(value) },
                    { key: "maintenance_severity", label: "Severity", render: (value) => <StatusTag value={value} /> },
                ]}
            />

            <DataTable
                title="Zone Status"
                subtitle="Serviceable supply and demand by apron zone."
                rows={data?.zone_status || []}
                maxRows={6}
                columns={[
                    { key: "zone", label: "Zone" },
                    { key: "serviceable_supply", label: "Supply" },
                    { key: "demand_next_90m", label: "Demand" },
                    { key: "gap", label: "Gap" },
                    { key: "status", label: "Status", render: (value) => <StatusTag value={value} /> },
                ]}
            />
        </ModulePage>
    );
}
