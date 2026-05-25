const DEFAULT_API_BASE = "/api";
const DEFAULT_API_PORTS = ["8000"];
const DEFAULT_VIDEO_PORTS = ["8002", "8003", "8004"];
const API_BASE_STORAGE_KEY = "active_api_base";
const VIDEO_ORIGIN_STORAGE_KEY = "active_video_origin";

const unique = (items) => Array.from(new Set(items.filter(Boolean)));

const parseCsv = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeTrailingSlash = (url) => String(url || "").replace(/\/$/, "");

const isLocalHost = (host) => host === "localhost" || host === "127.0.0.1";

const normalizeApiBaseHost = (base) => {
  try {
    if (typeof window === "undefined") return base;
    const originHost = window.location.hostname;
    const url = new URL(base);

    // Keep API host aligned with the frontend host (localhost vs 127.0.0.1)
    // so session cookies are reused for CSRF-protected requests.
    if (
      (originHost === "localhost" && url.hostname === "127.0.0.1") ||
      (originHost === "127.0.0.1" && url.hostname === "localhost")
    ) {
      url.hostname = originHost;
      return url.toString().replace(/\/$/, "");
    }

    return base;
  } catch {
    return base;
  }
};

export const API_BASE = normalizeApiBaseHost(
  import.meta.env.VITE_API_URL || DEFAULT_API_BASE,
);

const getApiBaseCandidates = () => {
  const originHost =
    typeof window !== "undefined" ? window.location.hostname : "localhost";
  const envList = parseCsv(import.meta.env.VITE_API_URLS);
  const configured = import.meta.env.VITE_API_URL || DEFAULT_API_BASE;
  const localCandidates = DEFAULT_API_PORTS.map(
    (port) => `http://${originHost}:${port}/api`,
  );

  return unique(
    [configured, ...envList, ...localCandidates].map((base) =>
      normalizeApiBaseHost(normalizeTrailingSlash(base)),
    ),
  );
};

let activeApiBase =
  (typeof window !== "undefined" &&
    localStorage.getItem(API_BASE_STORAGE_KEY)) ||
  API_BASE;

let activeVideoOrigin =
  (typeof window !== "undefined" &&
    localStorage.getItem(VIDEO_ORIGIN_STORAGE_KEY)) ||
  null;

const getOrderedApiBases = () => {
  const candidates = getApiBaseCandidates();
  const preferred = normalizeApiBaseHost(normalizeTrailingSlash(activeApiBase));
  return unique([preferred, ...candidates]);
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 2500) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
};

const markActiveApiBase = (base) => {
  activeApiBase = base;
  if (typeof window !== "undefined") {
    localStorage.setItem(API_BASE_STORAGE_KEY, base);
  }
};

const markActiveVideoOrigin = (origin) => {
  activeVideoOrigin = origin;
  if (typeof window !== "undefined") {
    localStorage.setItem(VIDEO_ORIGIN_STORAGE_KEY, origin);
  }
};

let resolvingApiBasePromise = null;

const resolveApiBase = async () => {
  if (resolvingApiBasePromise) {
    return resolvingApiBasePromise;
  }

  resolvingApiBasePromise = (async () => {
    const candidates = getOrderedApiBases();

    for (const base of candidates) {
      try {
        const response = await fetchWithTimeout(`${base}/auth/csrf`, {
          method: "GET",
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        if (response.ok) {
          markActiveApiBase(base);
          return base;
        }
      } catch {
        // Try next candidate.
      }
    }

    throw new Error(
      "Cannot connect to API server. Start backend and check API ports.",
    );
  })();

  try {
    return await resolvingApiBasePromise;
  } finally {
    resolvingApiBasePromise = null;
  }
};

export const getActiveApiBase = async () => resolveApiBase();

export const getActiveApiBaseSync = () => activeApiBase || API_BASE;

const getApiOrigin = () => {
  try {
    const base = getActiveApiBaseSync();
    if (/^https?:\/\//i.test(base)) {
      return new URL(base).origin;
    }

    if (typeof window !== "undefined") {
      return window.location.origin;
    }

    return "";
  } catch {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }

    return "";
  }
};

export const resolveMediaUrl = (rawUrl) => {
  if (!rawUrl) return "";

  if (rawUrl.startsWith("data:") || rawUrl.startsWith("blob:")) {
    return rawUrl;
  }

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return normalizeLocalDevUrlHost(rawUrl);
  }

  const base = getApiOrigin();
  const path = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  return normalizeLocalDevUrlHost(`${base}${path}`);
};

export const findBestProductMatch = (products, query) => {
  const normalizedQuery = String(query || "")
    .trim()
    .toLowerCase();
  if (!normalizedQuery || !Array.isArray(products)) return null;

  const exactMatch = products.find((product) => {
    const name = String(product?.name || "")
      .trim()
      .toLowerCase();
    const tone = String(product?.tone || "")
      .trim()
      .toLowerCase();
    const category = String(product?.category || "")
      .trim()
      .toLowerCase();
    return (
      name === normalizedQuery ||
      tone === normalizedQuery ||
      category === normalizedQuery
    );
  });

  if (exactMatch) return exactMatch;

  return (
    products.find((product) => {
      const haystack = [product?.name, product?.tone, product?.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    }) || null
  );
};

export const normalizeLocalDevUrlHost = (rawUrl) => {
  try {
    if (typeof window === "undefined" || !rawUrl) return rawUrl;
    const originHost = window.location.hostname;
    const url = new URL(rawUrl, window.location.origin);

    if (
      (originHost === "localhost" && url.hostname === "127.0.0.1") ||
      (originHost === "127.0.0.1" && url.hostname === "localhost")
    ) {
      url.hostname = originHost;
    }

    return url.toString();
  } catch {
    return rawUrl;
  }
};

const isLikelyNetworkError = (error) =>
  error?.name === "AbortError" ||
  error?.name === "TypeError" ||
  /network|fetch|connect/i.test(String(error?.message || ""));

const runWithApiFallback = async (runner) => {
  let lastConnectivityError = null;
  const bases = getOrderedApiBases();

  for (const base of bases) {
    try {
      const result = await runner(base);
      markActiveApiBase(base);
      return result;
    } catch (error) {
      if (error?.isApiBaseFailure || isLikelyNetworkError(error)) {
        lastConnectivityError = error;
        continue;
      }
      throw error;
    }
  }

  if (lastConnectivityError) {
    throw new Error(
      "Cannot connect to API server on known ports. Start backend and refresh.",
    );
  }

  throw new Error("Request failed.");
};

const csrfTokenByBase = new Map();

const ensureCsrfToken = async (base) => {
  const cached = csrfTokenByBase.get(base);
  if (cached) return cached;

  let response;
  try {
    response = await fetch(`${base}/auth/csrf`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    });
  } catch (error) {
    error.isApiBaseFailure = true;
    throw error;
  }

  if (!response.ok) {
    const error = new Error("Failed to initialize session.");
    error.isApiBaseFailure = true;
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  const csrfToken = data?.token || null;

  if (!csrfToken) {
    throw new Error("Missing CSRF token from server response.");
  }

  csrfTokenByBase.set(base, csrfToken);
  return csrfToken;
};

export const apiPost = async (path, payload, retryCount = 0) => {
  return runWithApiFallback(async (base) => {
    const token = await ensureCsrfToken(base);
    const response = await fetch(`${base}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-TOKEN": token || "",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (response.status === 419 && retryCount === 0) {
      csrfTokenByBase.delete(base);
      return apiPost(path, payload, 1);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || "Request failed.";
      const error = new Error(message);
      error.details = data;
      throw error;
    }

    return data;
  });
};

export const apiGet = async (path) => {
  return runWithApiFallback(async (base) => {
    const response = await fetch(`${base}${path}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || "Request failed.";
      const error = new Error(message);
      error.details = data;
      throw error;
    }

    return data;
  });
};

export const apiGetBlob = async (path) => {
  return runWithApiFallback(async (base) => {
    const response = await fetch(`${base}${path}`, {
      method: "GET",
      headers: {
        Accept: "*/*",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        // ignore
      }
      const message = (parsed && parsed.message) || text || "Request failed.";
      const error = new Error(message);
      error.details = parsed || text;
      throw error;
    }

    const blob = await response.blob();
    return blob;
  });
};
export const apiPut = async (path, payload, retryCount = 0) => {
  return runWithApiFallback(async (base) => {
    const token = await ensureCsrfToken(base);
    const response = await fetch(`${base}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-TOKEN": token || "",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (response.status === 419 && retryCount === 0) {
      csrfTokenByBase.delete(base);
      return apiPut(path, payload, 1);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || "Request failed.";
      const error = new Error(message);
      error.details = data;
      throw error;
    }

    return data;
  });
};

export const apiDelete = async (path, retryCount = 0) => {
  return runWithApiFallback(async (base) => {
    const token = await ensureCsrfToken(base);
    const response = await fetch(`${base}${path}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "X-CSRF-TOKEN": token || "",
      },
      credentials: "include",
    });

    if (response.status === 419 && retryCount === 0) {
      csrfTokenByBase.delete(base);
      return apiDelete(path, 1);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || "Request failed.";
      const error = new Error(message);
      error.details = data;
      throw error;
    }

    return data;
  });
};

// FormData API for file uploads
export const apiPostFormData = async (path, formData, retryCount = 0) => {
  return runWithApiFallback(async (base) => {
    const token = await ensureCsrfToken(base);
    const response = await fetch(`${base}${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "X-CSRF-TOKEN": token || "",
      },
      credentials: "include",
      body: formData,
    });

    if (response.status === 419 && retryCount === 0) {
      csrfTokenByBase.delete(base);
      return apiPostFormData(path, formData, 1);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || "Request failed.";
      const error = new Error(message);
      error.details = data;
      throw error;
    }

    return data;
  });
};

// FormData API for PUT requests with files
export const apiPutFormData = async (path, formData, retryCount = 0) => {
  return runWithApiFallback(async (base) => {
    const token = await ensureCsrfToken(base);
    const response = await fetch(`${base}${path}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "X-CSRF-TOKEN": token || "",
      },
      credentials: "include",
      body: formData,
    });

    if (response.status === 419 && retryCount === 0) {
      csrfTokenByBase.delete(base);
      return apiPutFormData(path, formData, 1);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || "Request failed.";
      const error = new Error(message);
      error.details = data;
      throw error;
    }

    return data;
  });
};

const getVideoPortCandidates = (seedPort) => {
  const configured = parseCsv(import.meta.env.VITE_VIDEO_PORTS);
  return unique([seedPort, ...configured, ...DEFAULT_VIDEO_PORTS]);
};

const canReachOrigin = async (origin) => {
  try {
    await fetchWithTimeout(
      `${origin}/`,
      {
        method: "GET",
        mode: "no-cors",
        cache: "no-store",
      },
      1600,
    );
    return true;
  } catch {
    return false;
  }
};

const getVideoOriginCandidates = ({
  seedPort = "8002",
  rawUrl,
  urlCandidates = [],
} = {}) => {
  const host =
    typeof window !== "undefined" ? window.location.hostname : "localhost";
  const seedPorts = getVideoPortCandidates(seedPort);
  const envVideoBase = import.meta.env.VITE_VIDEO_CALL_URL;

  const derivedFromPorts = seedPorts.flatMap((port) => [
    `http://${host}:${port}`,
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
  ]);

  const rawOrigins = [activeVideoOrigin, envVideoBase, rawUrl, ...urlCandidates]
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(normalizeLocalDevUrlHost(value), window.location.origin)
          .origin;
      } catch {
        return null;
      }
    });

  return unique([...rawOrigins, ...derivedFromPorts]);
};

const resolveVideoOrigin = async (options = {}) => {
  const candidates = getVideoOriginCandidates(options);
  for (const origin of candidates) {
    if (!origin) continue;
    if (await canReachOrigin(origin)) {
      markActiveVideoOrigin(origin);
      return origin;
    }
  }
  return null;
};

export const getRuntimeConnectionStatus = async () => {
  let apiBase = null;
  let videoOrigin = null;

  try {
    apiBase = await resolveApiBase();
  } catch {
    apiBase = null;
  }

  try {
    videoOrigin = await resolveVideoOrigin();
  } catch {
    videoOrigin = activeVideoOrigin;
  }

  const apiPort = apiBase ? new URL(apiBase).port || "80" : null;
  const videoPort = videoOrigin ? new URL(videoOrigin).port || "80" : null;

  return {
    apiConnected: Boolean(apiBase),
    apiBase,
    apiPort,
    videoConnected: Boolean(videoOrigin),
    videoOrigin,
    videoPort,
  };
};

export const resolveDynamicJoinUrl = async (rawUrl, urlCandidates = []) => {
  const normalized = normalizeLocalDevUrlHost(rawUrl);
  if (!normalized || typeof window === "undefined") return normalized;

  let parsed;
  try {
    parsed = new URL(normalized, window.location.origin);
  } catch {
    return normalized;
  }

  const envVideoBase = import.meta.env.VITE_VIDEO_CALL_URL;
  if (envVideoBase) {
    try {
      const overrideBase = new URL(normalizeLocalDevUrlHost(envVideoBase));
      parsed.protocol = overrideBase.protocol;
      parsed.hostname = overrideBase.hostname;
      parsed.port = overrideBase.port;
    } catch {
      // Keep parsed as-is when override is invalid.
    }
  }

  if (!isLocalHost(parsed.hostname)) {
    return parsed.toString();
  }

  const resolvedOrigin = await resolveVideoOrigin({
    seedPort: parsed.port || "8002",
    rawUrl: normalized,
    urlCandidates,
  });

  if (resolvedOrigin) {
    const origin = new URL(resolvedOrigin);
    parsed.protocol = origin.protocol;
    parsed.hostname = origin.hostname;
    parsed.port = origin.port;
  }

  return parsed.toString();
};

export const openDynamicJoinUrl = async (rawUrl, urlCandidates = []) => {
  const popup =
    typeof window !== "undefined" ? window.open("about:blank", "_blank") : null;
  const finalUrl = await resolveDynamicJoinUrl(rawUrl, urlCandidates);

  if (!finalUrl) {
    if (popup) popup.close();
    throw new Error("Missing join link for this consultation.");
  }

  if (popup) {
    popup.location.href = finalUrl;
    return;
  }

  if (typeof window !== "undefined") {
    window.open(finalUrl, "_blank");
  }
};
