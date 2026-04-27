import { getAIEngineData } from "../api";
import {
    DataTable,
    DetailList,
    KeyValuePanel,
    MetricGrid,
    ModulePage,
    StatusTag,
    formatCurrency,
    formatMinutes,
    formatNumber,
    formatPercent,
} from "../components/ModuleData";
import { useModuleData } from "../hooks/useModuleData";

export function AIEnginePage() {
    const { data, loading, error, refresh } = useModuleData(getAIEngineData);
    const kpis = data?.kpis || {};
    const metrics = data?.model_metrics || {};

    return (
        <ModulePage
            summary="AI engine metrics, live predictions, and conflict resolution are now hydrated from Django."
            generatedAt={data?.generated_at}
            loading={loading}
            error={error}
            onRefresh={refresh}
        >
            <MetricGrid
                items={[
                    { label: "Turnaround Score", value: formatPercent(kpis.turnaround_optimization_score) },
                    { label: "Resource Efficiency", value: formatPercent(kpis.resource_efficiency_score), tone: "low" },
                    { label: "Delay Prevention", value: formatPercent(kpis.delay_prevention_rate_pct) },
                    { label: "Predictive Accuracy", value: formatPercent(kpis.predictive_accuracy_pct), tone: "low" },
                    { label: "Parallel Ops", value: formatPercent(kpis.parallel_operations_score) },
                    { label: "Open Conflicts", value: formatNumber(kpis.open_conflicts, 0), tone: "high" },
                    { label: "Resolved Conflicts", value: formatNumber(kpis.resolved_conflicts, 0), tone: "low" },
                    { label: "Resolution Rate", value: formatPercent(kpis.resolution_rate_pct) },
                    { label: "High Risk Flights", value: formatNumber(kpis.high_risk_live_flights, 0), tone: "high" },
                    { label: "Penalty Cost Today", value: formatCurrency(kpis.delay_penalty_cost_today), tone: "medium" },
                    { label: "Penalty Avoided", value: formatCurrency(kpis.delay_penalty_cost_avoided), tone: "low" },
                ]}
            />

            <div className="module-grid module-grid-two">
                <KeyValuePanel
                    title="Model Metrics"
                    subtitle="Current quality and classification metrics."
                    items={[
                        { label: "Delay MAE", value: formatMinutes(metrics.delay_mae_min), tone: "medium" },
                        { label: "Delay R²", value: formatNumber(metrics.delay_r2, 2) },
                        { label: "Risk Accuracy", value: formatPercent(metrics.risk_accuracy_pct), tone: "low" },
                        { label: "Risk Precision", value: formatPercent(metrics.risk_precision_pct) },
                        { label: "Risk Recall", value: formatPercent(metrics.risk_recall_pct) },
                        { label: "Risk F1", value: formatPercent(metrics.risk_f1_pct) },
                    ]}
                />

                <DetailList
                    title="Priority Rules"
                    subtitle="Decision rules currently driving the AI engine."
                    items={data?.priority_rules || []}
                    getTitle={(item) => `${item.priority}. ${item.name}`}
                    getBody={(item) => `${item.condition} -> ${item.action}`}
                    getMeta={(item) => item.rule_id}
                    maxItems={6}
                />
            </div>

            <DataTable
                title="Live Predictions"
                subtitle="Predicted delay risk and cost for live flights."
                rows={data?.live_predictions || []}
                maxRows={12}
                columns={[
                    { key: "flight_id", label: "Flight" },
                    { key: "airline", label: "Airline" },
                    { key: "predicted_delay_min", label: "Predicted Delay", render: (value) => formatMinutes(value) },
                    { key: "delay_risk_probability", label: "Risk Probability", render: (value) => formatPercent((value || 0) * 100) },
                    { key: "risk_level", label: "Risk", render: (value) => <StatusTag value={value} /> },
                    { key: "prediction_uncertainty_min", label: "Uncertainty", render: (value) => formatMinutes(value) },
                    { key: "dominant_risk_driver", label: "Driver" },
                    { key: "predicted_penalty_cost", label: "Penalty Cost", render: (value) => formatCurrency(value) },
                ]}
            />

            <div className="module-grid module-grid-two">
                <DetailList
                    title="Conflict Feed"
                    subtitle="Live conflicts being handled by the AI engine."
                    items={data?.conflicts || []}
                    getTitle={(item) => `${item.flight_id} · ${item.type}`}
                    getBody={(item) => `${item.agent}: ${item.message}`}
                    getMeta={(item) => item.conflict_id}
                    getTag={(item) => item.severity}
                    maxItems={10}
                />

                <DetailList
                    title="Delay Learning Feed"
                    subtitle="Patterns learned from past delay causes."
                    items={data?.past_delay_learning_feed || []}
                    getTitle={(item) => `${item.delay_cause} · ${formatNumber(item.incidents, 0)} incidents`}
                    getBody={(item) => `${item.learned_pattern} ${item.recommended_rule}`}
                    getMeta={(item) => `${formatMinutes(item.avg_delay)} average · ${formatMinutes(item.avoided_minutes)} avoided`}
                    maxItems={8}
                />
            </div>

            <DataTable
                title="Resolution Log"
                subtitle="Actions taken by the multi-agent resolution layer."
                rows={data?.multi_agent_resolution_log || []}
                maxRows={12}
                columns={[
                    { key: "resolution_id", label: "Resolution" },
                    { key: "flight_id", label: "Flight" },
                    { key: "agent", label: "Agent" },
                    { key: "action", label: "Action" },
                    { key: "status", label: "Status", render: (value) => <StatusTag value={value} /> },
                    { key: "estimated_minutes_saved", label: "Saved", render: (value) => formatMinutes(value) },
                ]}
            />
        </ModulePage>
    );
}
