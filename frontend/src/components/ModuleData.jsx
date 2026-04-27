import "../styles/module-data.css";

const NUMBER_FORMATTERS = new Map();

function toSentenceCase(value) {
    return String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function parseDateValue(value) {
    if (!value) {
        return null;
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value;
    }

    if (typeof value === "string") {
        const normalized = value.includes("T") ? value : value.replace(" ", "T");
        const parsed = new Date(normalized);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    return null;
}

export function formatNumber(value, digits = 1) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    if (typeof value !== "number") {
        return String(value);
    }

    if (!NUMBER_FORMATTERS.has(digits)) {
        NUMBER_FORMATTERS.set(
            digits,
            new Intl.NumberFormat("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: digits,
            }),
        );
    }

    return NUMBER_FORMATTERS.get(digits).format(value);
}

export function formatPercent(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }
    return `${formatNumber(value, 1)}%`;
}

export function formatMinutes(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }
    return `${formatNumber(value, 1)} min`;
}

export function formatCurrency(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }
    return `₹${formatNumber(value, 0)}`;
}

export function formatDateTime(value) {
    const parsed = parseDateValue(value);
    if (!parsed) {
        return value || "—";
    }

    return parsed.toLocaleString([], {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatMaybeList(value) {
    if (Array.isArray(value)) {
        return value.join(", ");
    }
    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }
    if (value === null || value === undefined || value === "") {
        return "—";
    }
    if (typeof value === "number") {
        return Number.isInteger(value) ? formatNumber(value, 0) : formatNumber(value, 1);
    }
    return String(value);
}

export function toneFromValue(value) {
    const normalized = String(value || "").toLowerCase();

    if (/(critical|fault|closed|breach|escalate|danger)/.test(normalized)) {
        return "critical";
    }
    if (/(high|warning|shortage|delayed|unavailable|blocked)/.test(normalized)) {
        return "high";
    }
    if (/(medium|monitor|reserved|review)/.test(normalized)) {
        return "medium";
    }
    if (/(low|ok|open|available|resolved|active|normal|good|serviceable|vfr)/.test(normalized)) {
        return "low";
    }
    return "default";
}

export function StatusTag({ value, tone }) {
    const resolvedTone = tone || toneFromValue(value);
    return <span className={`module-tag tag-${resolvedTone}`}>{toSentenceCase(value || "Unknown")}</span>;
}

export function ModulePage({ summary, generatedAt, loading, error, onRefresh, children }) {
    return (
        <div className="module-page">
            <div className="module-toolbar">
                <div className="module-toolbar-copy">
                    {summary && <p className="module-summary">{summary}</p>}
                    <span className="module-sync">
                        {generatedAt ? `Django sync: ${formatDateTime(generatedAt)}` : "Waiting for Django payload"}
                    </span>
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

export function Panel({ title, subtitle, children, action }) {
    return (
        <section className="module-panel">
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
            {items.map((item) => (
                <div className="module-metric-card" key={item.key || item.label}>
                    <span className="module-metric-label">{item.label}</span>
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
        <Panel title={title} subtitle={subtitle}>
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
