import { getNotificationsData } from "../api";
import {
    DataTable,
    DetailList,
    KeyValuePanel,
    MetricGrid,
    ModulePage,
    StatusTag,
    formatDateTime,
    formatNumber,
} from "../components/ModuleData";
import { useModuleData } from "../hooks/useModuleData";

export function Notifications() {
    const { data, loading, error, refresh } = useModuleData(getNotificationsData);
    const kpis = data?.kpis || {};
    const severityCounts = data?.severity_counts || {};
    const categoryCounts = data?.category_counts || {};

    return (
        <ModulePage
            summary="Notifications now renders the backend alert feed, escalation state, and deduped KPI counts from Django."
            generatedAt={data?.generated_at}
            loading={loading}
            error={error}
            onRefresh={refresh}
        >
            <MetricGrid
                items={[
                    { label: "Active Alerts", value: formatNumber(kpis.active_alerts, 0), tone: "high" },
                    { label: "Unread Alerts", value: formatNumber(kpis.unread_alerts, 0), tone: "high" },
                    { label: "Critical Unread", value: formatNumber(kpis.critical_unread, 0), tone: "critical" },
                    { label: "Critical Unacked", value: formatNumber(kpis.critical_unacknowledged, 0), tone: "critical" },
                    { label: "SLA Breaches", value: formatNumber(kpis.sla_breaches, 0), tone: "high" },
                    { label: "Duplicates Suppressed", value: formatNumber(kpis.duplicates_suppressed, 0), tone: "low" },
                    { label: "Avg Priority", value: formatNumber(kpis.average_priority_score, 1) },
                ]}
            />

            <div className="module-grid module-grid-two">
                <KeyValuePanel
                    title="Severity Counts"
                    subtitle="Unread/active severity breakdown from the backend."
                    items={Object.entries(severityCounts).map(([key, value]) => ({
                        key,
                        label: key,
                        value: formatNumber(value, 0),
                        tone: key,
                    }))}
                />

                <KeyValuePanel
                    title="Category Counts"
                    subtitle="Alert categories currently represented in the feed."
                    items={Object.entries(categoryCounts).map(([key, value]) => ({
                        key,
                        label: key,
                        value: formatNumber(value, 0),
                    }))}
                />
            </div>

            <DataTable
                title="Visible Alerts"
                subtitle="Current alert queue after dedupe and notebook filtering."
                rows={data?.visible_alerts || []}
                maxRows={12}
                columns={[
                    { key: "timestamp", label: "Time", render: (value) => formatDateTime(value) },
                    { key: "cat", label: "Category" },
                    { key: "detected_sev", label: "Severity", render: (value) => <StatusTag value={value} /> },
                    { key: "title", label: "Title" },
                    { key: "location", label: "Location" },
                    { key: "affected_flights", label: "Flights" },
                    { key: "priority_score", label: "Priority" },
                    { key: "acknowledged", label: "Ack", render: (value) => (value ? "Yes" : "No") },
                ]}
            />

            <div className="module-grid module-grid-two">
                <DetailList
                    title="Escalations"
                    subtitle="Alerts currently in escalation state."
                    items={data?.escalations || []}
                    getTitle={(item) => `${item.title} · ${item.owner || item.route_to || item.source}`}
                    getBody={(item) => `${item.body} Route: ${item.route_to || "—"}`}
                    getMeta={(item) => `${item.location} · SLA ${item.sla_remaining_min ?? "—"} min`}
                    getTag={(item) => item.detected_sev}
                    maxItems={10}
                />

                <DetailList
                    title="Recommendations"
                    subtitle="Workflow improvements suggested by the notifications notebook."
                    items={data?.recommendations || []}
                    getTitle={(item) => `${item.area} · ${item.action}`}
                    getBody={(item) => item.reason}
                    getMeta={(item) => item.priority}
                    getTag={(item) => item.priority}
                    maxItems={8}
                />
            </div>
        </ModulePage>
    );
}
