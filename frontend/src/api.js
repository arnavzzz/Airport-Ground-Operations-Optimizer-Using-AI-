const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const LOCAL_API_BASE_URL = "http://127.0.0.1:8000";

function resolveApiBaseUrl() {
    if (configuredApiBaseUrl) {
        return configuredApiBaseUrl.replace(/\/$/, "");
    }

    if (typeof window === "undefined") {
        return "";
    }

    const { protocol, hostname, port } = window.location;
    const localHosts = new Set(["", "localhost", "127.0.0.1", "::1", "[::1]"]);
    const isLocalPage = localHosts.has(hostname);

    if (protocol === "file:" || (isLocalPage && port !== "8000")) {
        return LOCAL_API_BASE_URL;
    }

    return "";
}

const API_BASE_URL = resolveApiBaseUrl();

const MODULE_ENDPOINTS = {
    "command-center": "/api/command-center/",
    "flight-operations": "/api/flight-operations/",
    "human-resources": "/api/human-resources/",
    equipments: "/api/equipments/",
    infrastructure: "/api/infrastructure/",
    "ai-engine": "/api/ai-engine/",
    analytics: "/api/analytics/",
    weather: "/api/weather/",
    notifications: "/api/notifications/",
};

async function request(path, options = {}) {
    const { headers, ...requestOptions } = options;
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...requestOptions,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
    });

    let body = null;
    try {
        body = await response.json();
    } catch {
        body = null;
    }

    if (!response.ok) {
        const message = body?.error || body?.message || `API request failed with ${response.status}`;
        throw new Error(message);
    }

    return body;
}

function unwrapModuleResponse(response) {
    if (response && typeof response === "object" && "data" in response) {
        return response.data;
    }
    return response;
}

export function checkBackendConnection() {
    return request("/api/test/");
}

export async function getModuleData(moduleName) {
    const path = MODULE_ENDPOINTS[moduleName];
    if (!path) {
        throw new Error(`Unknown module endpoint: ${moduleName}`);
    }
    const response = await request(path);
    return unwrapModuleResponse(response);
}

export const getCommandCenterData = () => getModuleData("command-center");
export const getFlightOperationsData = () => getModuleData("flight-operations");
export const getHumanResourcesData = () => getModuleData("human-resources");
export const getEquipmentsData = () => getModuleData("equipments");
export const getInfrastructureData = () => getModuleData("infrastructure");
export const getAIEngineData = () => getModuleData("ai-engine");
export const getAnalyticsData = () => getModuleData("analytics");
export const getWeatherData = () => getModuleData("weather");
export const getNotificationsData = () => getModuleData("notifications");

export async function getLiveFlights() {
    const data = await getFlightOperationsData();
    return data.live_flight_board || [];
}

export async function requestPrediction(payload) {
    const response = await request("/api/predict/", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return unwrapModuleResponse(response);
}
