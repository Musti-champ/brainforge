export interface APIResponse<T = any> {
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
}

export async function testAPIRequest(options: {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
}): Promise<APIResponse> {
  const response = await fetch("/api/test-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchQuote() {
  const response = await fetch("/api/proxy/quotes");
  if (!response.ok) {
    throw new Error("Failed to fetch quote");
  }
  return response.json();
}

export async function fetchWeather(city: string, apiKey: string) {
  const response = await fetch(`/api/proxy/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`);
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  return response.json();
}
