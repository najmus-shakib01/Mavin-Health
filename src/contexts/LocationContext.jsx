import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const LocationContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used within a LocationProvider");
  return context;
};

// Small fetch helper with timeout to avoid hanging requests
const fetchWithTimeout = async (url, options = {}, timeoutMs = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
};

const normalizeCountryCode = (code) => {
  if (!code) return null;
  const trimmed = String(code).trim().toUpperCase();
  // Expect ISO-3166 alpha-2
  return /^[A-Z]{2}$/.test(trimmed) ? trimmed : null;
};

// eslint-disable-next-line react/prop-types
export const LocationProvider = ({ children }) => {
  const [countryCode, setCountryCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateCountryCode = useCallback((code) => {
    const normalized = normalizeCountryCode(code) || "US";
    setCountryCode(normalized);
    localStorage.setItem("userCountryCode", normalized);
  }, []);

  const fetchCountryCode = useCallback(async () => {
    const services = [
      {
        url: "https://api.country.is/",
        type: "json",
        pick: (data) => data?.country,
      },
      {
        url: "https://ipapi.co/json/",
        type: "json",
        pick: (data) => data?.country_code,
      },
      {
        // NOTE: ipapi.co/country/ returns plain text (e.g. "US")
        url: "https://ipapi.co/country/",
        type: "text",
        pick: (text) => text,
      },
    ];

    for (const svc of services) {
      try {
        const res = await fetchWithTimeout(
          svc.url,
          {
            method: "GET",
            headers: {
              Accept: svc.type === "json" ? "application/json" : "text/plain",
            },
          },
          6000
        );

        if (!res.ok) continue;

        let raw;
        if (svc.type === "json") raw = await res.json();
        else raw = await res.text();

        const picked = svc.pick(raw);
        const normalized = normalizeCountryCode(picked);

        if (normalized) return normalized;
      } catch (e) {
        console.error(e);
        continue;
      }
    }

    throw new Error("All geolocation services failed");
  }, []);

  useEffect(() => {
    let mounted = true;

    const detectCountry = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const detected = await fetchCountryCode();
        if (!mounted) return;

        setCountryCode(detected);
        localStorage.setItem("userCountryCode", detected);
      } catch (err) {
        console.error("Country detection failed:", err);
        if (!mounted) return;

        setError("Failed to detect location");

        const savedCountry = localStorage.getItem("userCountryCode");
        setCountryCode(normalizeCountryCode(savedCountry) || "US");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    detectCountry();
    return () => {
      mounted = false;
    };
  }, [fetchCountryCode]);

  const value = useMemo(
    () => ({
      countryCode,
      isLoading,
      error,
      isUSA: countryCode === "US",
      isSaudiArabia: countryCode === "SA",
      updateCountryCode,
    }),
    [countryCode, isLoading, error, updateCountryCode]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};
