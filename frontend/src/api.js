const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`API request failed with ${response.status}`);
    }

    return response.json();
}

export function checkBackendConnection() {
    return request('/api/test/');
}

export function getLiveFlights() {
    return request('/api/flights/');
}

export function requestPrediction(payload) {
    return request('/api/predict/', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}
