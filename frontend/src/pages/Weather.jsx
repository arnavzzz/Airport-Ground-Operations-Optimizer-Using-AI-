import { getWeatherData } from "../api";
import {
    DataTable,
    DetailList,
    KeyValuePanel,
    MetricGrid,
    ModulePage,
    StatusTag,
} from "../components/ModuleData";
import {
    formatMinutes,
    formatNumber,
    formatPercent,
} from "../components/moduleFormatters";
import { useModuleData } from "../hooks/useModuleData";

export function WeatherPage() {
    const { data, loading, error, refresh } = useModuleData(getWeatherData);
    const kpis = data?.kpis || {};
    const airport = data?.airport || {};
    const current = data?.current || {};

    return (
        <ModulePage
            summary="Weather has been switched over to the Django weather notebook payload instead of direct browser API calls."
            generatedAt={data?.generated_at}
            loading={loading}
            error={error}
            onRefresh={refresh}
        >
            <MetricGrid
                items={[
                    { label: "Airport", value: kpis.airport || airport.code || "—" },
                    { label: "Condition", value: kpis.condition || "—" },
                    { label: "Temperature", value: kpis.temperature_c ? `${formatNumber(kpis.temperature_c, 1)} °C` : "—" },
                    { label: "Wind", value: kpis.wind_kt ? `${formatNumber(kpis.wind_kt, 1)} kt` : "—" },
                    { label: "Crosswind", value: kpis.crosswind_kt ? `${formatNumber(kpis.crosswind_kt, 1)} kt` : "—", tone: "medium" },
                    { label: "Visibility", value: kpis.visibility_m ? `${formatNumber(kpis.visibility_m, 0)} m` : "—" },
                    { label: "Risk Band", value: kpis.risk_band || "—", tone: "medium" },
                    { label: "Preferred Runway", value: kpis.preferred_runway || "—", tone: "low" },
                    { label: "Forecast Delay", value: formatMinutes(kpis.forecast_delay_min_next_24h), tone: "high" },
                ]}
            />

            <div className="module-grid module-grid-two">
                <KeyValuePanel
                    title="Airport Weather Snapshot"
                    subtitle="Current backend weather state for the selected airport."
                    items={[
                        { label: "Airport Name", value: airport.name || "—" },
                        { label: "Elevation", value: airport.elevation_ft ? `${formatNumber(airport.elevation_ft, 0)} ft` : "—" },
                        { label: "Humidity", value: current.humidity_pct ? `${formatNumber(current.humidity_pct, 0)}%` : "—" },
                        { label: "Pressure", value: current.pressure_hpa ? `${formatNumber(current.pressure_hpa, 0)} hPa` : "—" },
                        { label: "Wind Direction", value: current.wind_compass || "—" },
                        { label: "Gust", value: current.gust_kt ? `${formatNumber(current.gust_kt, 1)} kt` : "—" },
                    ]}
                />

                <DetailList
                    title="Weather Alerts"
                    subtitle="Active weather and runway alerts from the backend."
                    items={data?.alerts || []}
                    getTitle={(item) => item.title}
                    getBody={(item) => item.message}
                    getMeta={(item) => item.type}
                    getTag={(item) => item.severity}
                    maxItems={6}
                />
            </div>

            <DataTable
                title="Runway Suitability"
                subtitle="Runway recommendation output from the weather model."
                rows={data?.runways || []}
                maxRows={6}
                columns={[
                    { key: "runway", label: "Runway" },
                    { key: "active_end", label: "Active End" },
                    { key: "ils_cat", label: "ILS" },
                    { key: "crosswind_kt", label: "Crosswind", render: (value) => `${formatNumber(value, 1)} kt` },
                    { key: "headwind_kt", label: "Headwind", render: (value) => `${formatNumber(value, 1)} kt` },
                    { key: "suitability_score", label: "Score", render: (value) => formatPercent(value) },
                    { key: "status", label: "Status", render: (value) => <StatusTag value={value} /> },
                ]}
            />

            <DataTable
                title="Capacity Forecast"
                subtitle="Weather-driven movement capacity forecast for upcoming hours."
                rows={data?.capacity_forecast || []}
                maxRows={12}
                columns={[
                    { key: "timestamp", label: "Time" },
                    { key: "risk_band", label: "Risk", render: (value) => <StatusTag value={value} /> },
                    { key: "arrival_departure_capacity", label: "Capacity" },
                    { key: "expected_movements", label: "Expected Moves" },
                    { key: "weather_queue", label: "Queue" },
                    { key: "expected_delay_min", label: "Delay", render: (value) => formatMinutes(value) },
                    { key: "preferred_runway", label: "Preferred Runway" },
                ]}
            />

            <DetailList
                title="Recommendations"
                subtitle="Weather actions recommended by the backend notebook."
                items={data?.recommendations || []}
                getTitle={(item) => `${item.area} · ${item.action}`}
                getBody={(item) => item.reason}
                getMeta={(item) => item.priority}
                getTag={(item) => item.priority}
                maxItems={8}
            />
        </ModulePage>
    );
}
