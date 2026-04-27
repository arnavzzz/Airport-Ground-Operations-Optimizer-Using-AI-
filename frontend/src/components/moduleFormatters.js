const NUMBER_FORMATTERS = new Map();

export function toSentenceCase(value) {
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
        return "N/A";
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
        return "N/A";
    }
    return `${formatNumber(value, 1)}%`;
}

export function formatMinutes(value) {
    if (value === null || value === undefined || value === "") {
        return "N/A";
    }
    return `${formatNumber(value, 1)} min`;
}

export function formatCurrency(value) {
    if (value === null || value === undefined || value === "") {
        return "N/A";
    }
    return `Rs ${formatNumber(value, 0)}`;
}

export function formatDateTime(value) {
    const parsed = parseDateValue(value);
    if (!parsed) {
        return value || "N/A";
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
        return "N/A";
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
