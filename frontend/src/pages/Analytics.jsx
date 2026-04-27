import { getAnalyticsData } from "../api";
import {
    DataTable,
    DetailList,
    MetricGrid,
    ModulePage,
    formatCurrency,
    formatMinutes,
    formatNumber,
    formatPercent,
} from "../components/ModuleData";
import { useModuleData } from "../hooks/useModuleData";

export function AnalyticsPage() {
    const { data, loading, error, refresh } = useModuleData(getAnalyticsData);
    const kpis = data?.kpis || {};

    return (
        <ModulePage
            summary="Analytics is now using the Django analytics endpoint for cost, trend, and delay-cause reporting."
            generatedAt={data?.generated_at}
            loading={loading}
            error={error}
            onRefresh={refresh}
        >
            <MetricGrid
                items={[
                    { label: "Flights Analyzed", value: formatNumber(kpis.flights_analyzed, 0) },
                    { label: "Fuel Saved", value: formatCurrency(kpis.fuel_cost_saved), tone: "low" },
                    { label: "Penalty Avoided", value: formatCurrency(kpis.delay_penalty_avoided), tone: "low" },
                    { label: "Avg Turnaround", value: formatMinutes(kpis.avg_turnaround_min) },
                    { label: "Turnaround Gain", value: formatMinutes(kpis.turnaround_improvement_min), tone: "low" },
                    { label: "Delay Minutes Avoided", value: formatMinutes(kpis.delay_minutes_avoided), tone: "low" },
                    { label: "Delay vs Manual", value: formatMinutes(kpis.delay_reduction_vs_manual_min) },
                    { label: "AI Coverage", value: formatPercent(kpis.ai_coverage_pct) },
                    { label: "On-Time Rate", value: formatPercent(kpis.on_time_rate_pct) },
                ]}
            />

            <DataTable
                title="Period Comparison"
                subtitle="Current metrics compared with the previous reporting period."
                rows={data?.period_comparison || []}
                maxRows={12}
                columns={[
                    { key: "metric", label: "Metric", render: (value) => value?.replace(/_/g, " ") || "—" },
                    { key: "current", label: "Current", render: (value) => formatNumber(value, 1) },
                    { key: "previous", label: "Previous", render: (value) => formatNumber(value, 1) },
                    { key: "delta", label: "Delta", render: (value) => formatNumber(value, 1) },
                    { key: "delta_pct", label: "Delta %", render: (value) => formatPercent(value) },
                ]}
            />

            <div className="module-grid module-grid-two">
                <DataTable
                    title="Top Delay Causes"
                    subtitle="Largest delay drivers observed by the analytics notebook."
                    rows={data?.top_delay_causes || []}
                    maxRows={8}
                    columns={[
                        { key: "delay_cause", label: "Cause" },
                        { key: "flights", label: "Flights" },
                        { key: "avg_delay_min", label: "Avg Delay", render: (value) => formatMinutes(value) },
                        { key: "avoided_delay_min", label: "Avoided", render: (value) => formatMinutes(value) },
                        { key: "penalty_avoided", label: "Penalty Avoided", render: (value) => formatCurrency(value) },
                        { key: "share_pct", label: "Share", render: (value) => formatPercent(value) },
                    ]}
                />

                <DetailList
                    title="Recommendations"
                    subtitle="Analytics actions suggested by the backend notebook."
                    items={data?.recommendations || []}
                    getTitle={(item) => `${item.type} · ${item.message}`}
                    getBody={(item) => item.recommendation}
                    getMeta={(item) => `Priority ${item.priority_rank || "—"}`}
                    getTag={(item) => item.severity}
                    maxItems={8}
                />
            </div>

            <DataTable
                title="Turnaround Trend"
                subtitle="Recent daily turnaround trend from the analytics payload."
                rows={data?.turnaround_trend || []}
                maxRows={10}
                columns={[
                    { key: "date", label: "Date" },
                    { key: "flights", label: "Flights" },
                    { key: "avg_turnaround_min", label: "Avg Turnaround", render: (value) => formatMinutes(value) },
                    { key: "avg_delay_min", label: "Avg Delay", render: (value) => formatMinutes(value) },
                    { key: "fuel_cost_saved", label: "Fuel Saved", render: (value) => formatCurrency(value) },
                    { key: "on_time_rate_pct", label: "On-Time", render: (value) => formatPercent(value) },
                ]}
            />

            <DataTable
                title="Resource Utilization"
                subtitle="Utilization history by shared operational resource."
                rows={data?.resource_utilization_history || []}
                maxRows={8}
                columns={[
                    { key: "resource_type", label: "Resource" },
                    { key: "avg_utilization_pct", label: "Avg Utilization", render: (value) => formatPercent(value) },
                    { key: "max_utilization_pct", label: "Peak Utilization", render: (value) => formatPercent(value) },
                    { key: "total_idle_hours", label: "Idle Hours", render: (value) => formatNumber(value, 1) },
                    { key: "overload_days", label: "Overload Days" },
                ]}
            />
        </ModulePage>
    );
}
