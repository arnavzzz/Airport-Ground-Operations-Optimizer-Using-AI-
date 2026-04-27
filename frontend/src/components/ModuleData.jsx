import "../styles/module-data.css";
import { formatDateTime, formatMaybeList, toSentenceCase, toneFromValue } from "./moduleFormatters";

export function StatusTag({ value, tone }) {
    const resolvedTone = tone || toneFromValue(value);
    return (
        <span className={`module-tag tag-${resolvedTone}`} title={toSentenceCase(value || "Unknown")}>
            {toSentenceCase(value || "Unknown")}
        </span>
    );
}

export function ModulePage({ summary, generatedAt, loading, error, onRefresh, children }) {
    const syncLabel = generatedAt ? `Django sync: ${formatDateTime(generatedAt)}` : "Waiting for Django payload";

    return (
        <div className="module-page">
            <div className="module-toolbar">
                <div className="module-toolbar-copy">
                    <span className="module-live-pill">
                        <span className="module-live-dot" />
                        Live operations
                    </span>
                    {summary && <p className="module-summary">{summary}</p>}
                    <span className="module-sync">{syncLabel}</span>
                </div>
                <button className="module-refresh" type="button" onClick={onRefresh} disabled={loading}>
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {loading && <div className="module-banner module-banner-info">Loading notebook data from Django...</div>}
            {error && <div className="module-banner module-banner-error">{error}</div>}

            {children}
        </div>
    );
}

export function Panel({ title, subtitle, children, action, className = "" }) {
    return (
        <section className={`module-panel ${className}`.trim()}>
            {(title || subtitle || action) && (
                <div className="module-panel-head">
                    <div>
                        {title && <h3 className="module-panel-title">{title}</h3>}
                        {subtitle && <p className="module-panel-subtitle">{subtitle}</p>}
                    </div>
                    {action}
                </div>
            )}
            {children}
        </section>
    );
}

export function MetricGrid({ items = [] }) {
    if (!items.length) {
        return null;
    }

    return (
        <div className="module-metric-grid">
            {items.map((item, index) => (
                <div
                    className={[
                        "module-metric-card",
                        `metric-${item.tone || "default"}`,
                        item.featured || index === 0 ? "metric-feature" : "",
                    ].filter(Boolean).join(" ")}
                    key={item.key || item.label}
                >
                    <span className="module-metric-label">
                        <span className="module-metric-dot" />
                        {item.label}
                    </span>
                    <strong className={`module-metric-value tone-${item.tone || "default"}`}>{item.value}</strong>
                    {item.hint && <span className="module-metric-hint">{item.hint}</span>}
                </div>
            ))}
        </div>
    );
}

export function KeyValuePanel({ title, subtitle, items = [] }) {
    return (
        <Panel title={title} subtitle={subtitle}>
            <div className="module-kv-grid">
                {items.map((item) => (
                    <div className="module-kv-item" key={item.key || item.label}>
                        <span className="module-kv-label">{item.label}</span>
                        <strong className={`module-kv-value tone-${item.tone || "default"}`}>{item.value}</strong>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

export function DetailList({
    title,
    subtitle,
    items = [],
    getTitle,
    getBody,
    getMeta,
    getTag,
    emptyMessage = "No items available.",
    maxItems = 8,
}) {
    const visibleItems = items.slice(0, maxItems);

    return (
        <Panel title={title} subtitle={subtitle}>
            {!visibleItems.length ? (
                <div className="module-empty">{emptyMessage}</div>
            ) : (
                <div className="module-list">
                    {visibleItems.map((item, index) => (
                        <div className="module-list-item" key={item.id || item.event_id || item.flight_id || item.rule_id || index}>
                            <div className="module-list-head">
                                <strong className="module-list-title">{getTitle(item)}</strong>
                                {getTag && <StatusTag value={getTag(item)} />}
                            </div>
                            {getBody && <p className="module-list-body">{getBody(item)}</p>}
                            {getMeta && <span className="module-list-meta">{getMeta(item)}</span>}
                        </div>
                    ))}
                </div>
            )}
        </Panel>
    );
}

export function DataTable({
    title,
    subtitle,
    columns = [],
    rows = [],
    emptyMessage = "No rows available.",
    maxRows = 10,
}) {
    const visibleRows = rows.slice(0, maxRows);

    return (
        <Panel title={title} subtitle={subtitle} className="module-panel-table">
            {!visibleRows.length ? (
                <div className="module-empty">{emptyMessage}</div>
            ) : (
                <div className="module-table-wrap">
                    <table className="module-table">
                        <thead>
                            <tr>
                                {columns.map((column) => (
                                    <th key={column.key || column.label}>{column.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {visibleRows.map((row, index) => (
                                <tr key={row.id || row.flight_id || row.employee_id || row.event_id || row.rule_id || index}>
                                    {columns.map((column) => (
                                        <td key={column.key || column.label}>
                                            {column.render
                                                ? column.render(row[column.key], row)
                                                : formatMaybeList(row[column.key])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Panel>
    );
}
