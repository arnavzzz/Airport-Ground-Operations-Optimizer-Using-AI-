import { getHumanResourcesData } from "../api";
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

export function HumanResources() {
    const { data, loading, error, refresh } = useModuleData(getHumanResourcesData);
    const kpis = data?.kpis || {};

    return (
        <ModulePage
            summary="Human resources now reads staffing, fatigue, assignments, and recommendations from Django."
            generatedAt={data?.generated_at}
            loading={loading}
            error={error}
            onRefresh={refresh}
        >
            <MetricGrid
                items={[
                    { label: "Total Staff", value: formatNumber(kpis.total_staff, 0) },
                    { label: "Active Staff", value: formatNumber(kpis.active_staff, 0), tone: "low" },
                    { label: "Available Staff", value: formatNumber(kpis.available_staff, 0) },
                    { label: "On Leave", value: formatNumber(kpis.on_leave, 0), tone: "medium" },
                    { label: "Sick", value: formatNumber(kpis.sick, 0), tone: "high" },
                    { label: "High Fatigue", value: formatNumber(kpis.high_fatigue_staff, 0), tone: "high" },
                    { label: "Avg Fatigue", value: formatPercent(kpis.avg_fatigue_score), tone: "medium" },
                    { label: "Fill Rate", value: formatPercent(kpis.assignment_fill_rate_pct) },
                    { label: "Shift Compliance", value: formatPercent(kpis.shift_compliance_pct) },
                    { label: "HR Score", value: formatPercent(kpis.hr_operation_score), tone: "low" },
                ]}
            />

            <DataTable
                title="Role Capacity"
                subtitle="Demand and staffing coverage for the next 90-minute window."
                rows={data?.role_capacity || []}
                maxRows={8}
                columns={[
                    { key: "role", label: "Role" },
                    { key: "total_staff", label: "Total" },
                    { key: "eligible_staff", label: "Eligible" },
                    { key: "high_fatigue_staff", label: "High Fatigue" },
                    { key: "demand_next_90m", label: "Demand" },
                    { key: "capacity_gap", label: "Gap" },
                    { key: "utilization_pct", label: "Utilization", render: (value) => formatPercent(value) },
                    { key: "capacity_status", label: "Status", render: (value) => <StatusTag value={value} /> },
                ]}
            />

            <DataTable
                title="Fatigue Watchlist"
                subtitle="Staff most likely to need reassignment or intervention."
                rows={data?.fatigue_watchlist || []}
                maxRows={12}
                columns={[
                    { key: "name", label: "Name" },
                    { key: "role", label: "Role" },
                    { key: "shift", label: "Shift" },
                    { key: "hours_worked", label: "Hours Worked", render: (value) => formatNumber(value, 1) },
                    { key: "continuous_hours", label: "Continuous", render: (value) => formatNumber(value, 1) },
                    { key: "fatigue_score", label: "Fatigue", render: (value) => formatPercent(value) },
                    { key: "fatigue_level", label: "Level", render: (value) => <StatusTag value={value} /> },
                    { key: "current_gate", label: "Gate" },
                ]}
            />

            <div className="module-grid module-grid-two">
                <DetailList
                    title="Activity Feed"
                    subtitle="Latest crew actions from the backend activity stream."
                    items={data?.activity_feed || []}
                    getTitle={(item) => `${item.name} · ${item.activity}`}
                    getBody={(item) => `${item.role} · ${item.employee_id}`}
                    getMeta={(item) => item.time}
                    getTag={(item) => item.severity}
                    maxItems={10}
                />

                <DetailList
                    title="Recommendations"
                    subtitle="Staffing actions suggested by the HR notebook."
                    items={data?.recommendations || []}
                    getTitle={(item) => `${item.role || item.type} · ${item.message}`}
                    getBody={(item) => item.recommendation}
                    getMeta={(item) => `Priority ${item.priority_rank || "—"}`}
                    getTag={(item) => item.severity}
                    maxItems={10}
                />
            </div>

            <DataTable
                title="Task Assignments"
                subtitle="Coverage of crew assignments on flight-linked tasks."
                rows={data?.assignments || []}
                maxRows={10}
                columns={[
                    { key: "task_id", label: "Task" },
                    { key: "flight_id", label: "Flight" },
                    { key: "role", label: "Role" },
                    { key: "required_staff", label: "Required" },
                    { key: "assigned_count", label: "Assigned" },
                    { key: "coverage_pct", label: "Coverage", render: (value) => formatPercent(value) },
                    { key: "assignment_status", label: "Status", render: (value) => <StatusTag value={value} /> },
                ]}
            />
        </ModulePage>
    );
}
