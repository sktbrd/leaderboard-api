"use client";

import { useEffect, useMemo, useState } from "react";

type HealthStatus = "operational" | "degraded" | "down";

type ServiceHealth = {
  id: string;
  name: string;
  category: string;
  description: string;
  healthUrl: string;
  isHealthy: boolean;
  responseTime?: number;
  error?: string;
  lastChecked: string;
  authStatus?: string;
  rcInfo?: string;
};

type StatusResponse = {
  status: HealthStatus;
  timestamp: string;
  summary?: {
    healthy: number;
    total: number;
  };
  services: ServiceHealth[];
  error?: string;
};

const STATUS_TEXT: Record<
  HealthStatus,
  { label: string; tone: "ok" | "warn" | "down" }
> = {
  operational: { label: "All systems operational", tone: "ok" },
  degraded: { label: "Some services are degraded", tone: "warn" },
  down: { label: "Systems unavailable", tone: "down" },
};

const POLL_MS = 30000;

export default function StatusPage() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const load = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch("/api/status");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = (await res.json()) as StatusResponse;
      setData(json);
      setFetchError(null);
    } catch (error) {
      setFetchError(
        error instanceof Error ? error.message : "Failed to load status"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(id);
  }, []);

  const machines = useMemo(() => {
    if (!data) return [];

    const groups: {
      id: string;
      label: string;
      location: string;
      description: string;
      image: string;
      services: ServiceHealth[];
    }[] = [
      {
        id: "macmini",
        label: "Mac Mini M4",
        location: "Primary edge node",
        description: "Handles Instagram pulls, VSC node access, and fallback services.",
        image: "/macmini.png",
        services: [],
      },
      {
        id: "raspi",
        label: "Raspberry Pi",
        location: "Secondary edge node",
        description: "Lightweight worker keeping IG downloads alive.",
        image: "/raspberry.png",
        services: [],
      },
      {
        id: "oracle",
        label: "Oracle Cloud",
        location: "Primary cloud node",
        description: "High-availability transcoding and API uptime.",
        image: "/oracle-server.png",
        services: [],
      },
      {
        id: "other",
        label: "Shared Services",
        location: "External providers",
        description: "Everything that lives outside the main hardware stack.",
        image: "/oracle-server.png",
        services: [],
      },
    ];

    const byId = groups.reduce(
      (acc, group) => {
        acc[group.id] = group;
        return acc;
      },
      {} as Record<string, (typeof groups)[number]>
    );

    data.services.forEach((service) => {
      const url = service.healthUrl.toLowerCase();
      const name = service.name.toLowerCase();

      if (url.includes("minivlad") || name.includes("mac mini") || name.includes("vsc")) {
        byId.macmini.services.push(service);
        return;
      }

      if (url.includes("vladsberry") || name.includes("raspberry")) {
        byId.raspi.services.push(service);
        return;
      }

      if (url.includes("oracle") || url.includes("sslip.io") || name.includes("oracle")) {
        byId.oracle.services.push(service);
        return;
      }

      byId.other.services.push(service);
    });

    return groups.filter((group) => group.services.length > 0);
  }, [data]);

  const overallStatus = data?.status ?? "degraded";
  const statusCopy = STATUS_TEXT[overallStatus];
  const lastUpdated = data?.timestamp
    ? new Date(data.timestamp).toLocaleTimeString()
    : "–";

  return (
    <div className="wrapper">
      <div className="shell">
        <header className="hero">
          <p className="kicker">Skatehive Systems</p>
          <div className="title-row">
            <h1 className="title">Status Overview</h1>
            <span className={`pill ${statusCopy.tone}`}>
              <span
                className="status-dot"
                style={{ background: statusDotColor(overallStatus) }}
              />
              {statusCopy.label}
            </span>
          </div>
          <p className="subtitle">
            Hardware-level health, organized by the machines powering Skatehive.
          </p>
          <div className="banner">
            <div className="banner-status">
              <span
                className="status-dot"
                style={{ background: statusDotColor(overallStatus) }}
              />
              {statusCopy.label}
            </div>
            <div className="meta">
              <span>Last check: {lastUpdated}</span>
              {data?.summary && (
                <span>
                  Healthy: {data.summary.healthy}/{data.summary.total}
                </span>
              )}
              {loading && <span className="loading">Refreshing…</span>}
            </div>
          </div>
        </header>

        <div className="refresh-row">
          <button className="refresh-button" onClick={() => load()}>
            Refresh now
          </button>
          <span>Auto-refresh every {Math.round(POLL_MS / 1000)}s.</span>
          {fetchError && <span className="error">Fetch error: {fetchError}</span>}
        </div>

        {machines.length === 0 && !loading ? (
          <p className="error">No services to display.</p>
        ) : (
          <div className="machine-grid">
            {machines.map((machine) => (
              <section className="machine-card" key={machine.id}>
                <div className="machine-media">
                  <img
                    src={machine.image}
                    alt={machine.label}
                    className="machine-image"
                  />
                  <div className="machine-overlay" />
                  <div className="machine-header">
                    <p className="machine-label">{machine.label}</p>
                    <p className="machine-location">{machine.location}</p>
                    <p className="machine-description">{machine.description}</p>
                  </div>
                </div>

                <div className="machine-body">
                  {machine.services.map((service) => (
                    <article className="service-card" key={service.id}>
                      <div className="service-top">
                        <div className="service-info">
                          <span className={`tag ${tagClass(service.category)}`}>
                            {service.category}
                          </span>
                          <div className="name">{service.name}</div>
                          <p className="description">{service.description}</p>
                        </div>
                        <span
                          className={`pill ${service.isHealthy ? "ok" : "down"}`}
                        >
                          <span
                            className="status-dot"
                            style={{
                              background: statusDotColor(
                                service.isHealthy ? "operational" : "down"
                              ),
                            }}
                          />
                          {service.isHealthy ? "Operational" : "Unavailable"}
                        </span>
                      </div>

                      <div className="divider" />

                      <div className="status-row">
                        <code className="endpoint">{service.healthUrl}</code>
                        <div className="time">
                          {service.responseTime
                            ? `${service.responseTime} ms`
                            : "No response"}
                        </div>
                      </div>

                      {service.rcInfo && <div className="error">{service.rcInfo}</div>}
                      {service.error && <div className="error">{service.error}</div>}
                      {service.authStatus && (
                        <div className="meta">
                          <span>Auth: {service.authStatus}</span>
                        </div>
                      )}
                      <div className="meta">
                        <span>
                          Checked: {new Date(service.lastChecked).toLocaleTimeString()}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        :global(body) {
          background: #000000;
        }

        .wrapper {
          min-height: 100vh;
          background:
            radial-gradient(circle at 5% 15%, rgba(60, 255, 200, 0.3), transparent 45%),
            radial-gradient(circle at 90% 20%, rgba(92, 192, 255, 0.25), transparent 50%),
            linear-gradient(160deg, #05070c 0%, #03040b 45%, #000000 100%);
          color: #e7f2ff;
          padding: 56px 20px 80px;
          font-family: "Space Grotesk", "Sora", "Segoe UI", sans-serif;
        }

        .shell {
          max-width: 1180px;
          margin: 0 auto;
        }

        .hero {
          background: linear-gradient(135deg, rgba(28, 42, 64, 0.95), rgba(9, 15, 23, 0.95));
          color: #e7f2ff;
          border-radius: 22px;
          padding: 32px 34px;
          box-shadow: 0 20px 60px rgba(3, 7, 18, 0.6);
          border: 1px solid rgba(60, 255, 200, 0.3);
        }

        .kicker {
          text-transform: uppercase;
          letter-spacing: 0.24em;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 10px;
          opacity: 0.8;
        }

        .title-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
        }

        .title {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .subtitle {
          margin-top: 8px;
          font-size: 15px;
          color: rgba(231, 242, 255, 0.7);
        }

        .banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 18px;
          background: rgba(5, 8, 14, 0.8);
          color: #e7f2ff;
          border-radius: 14px;
          padding: 12px 16px;
          gap: 12px;
          flex-wrap: wrap;
          border: 1px solid rgba(92, 192, 255, 0.2);
        }

        .banner-status {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          box-shadow: 0 0 0 6px rgba(60, 255, 200, 0.18);
        }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 700;
        }

        .ok {
          background: #3cffc8;
          color: #001012;
        }

        .warn {
          background: #ffd55a;
          color: #130f00;
        }

        .down {
          background: #ff5c69;
          color: #110004;
        }

        .meta {
          display: flex;
          gap: 14px;
          align-items: center;
          font-size: 13px;
          color: rgba(231, 242, 255, 0.7);
        }

        .machine-grid {
          margin-top: 32px;
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }

        .machine-card {
          border-radius: 22px;
          background: rgba(15, 20, 28, 0.88);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 420px;
          box-shadow: 0 20px 60px rgba(3, 7, 18, 0.6);
          border: 1px solid rgba(92, 192, 255, 0.2);
          backdrop-filter: blur(12px);
        }

        .machine-media {
          position: relative;
          min-height: 180px;
        }

        .machine-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
          filter: saturate(1.1) contrast(1.1);
        }

        .machine-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(6, 9, 16, 0.1) 0%, rgba(6, 9, 16, 0.9) 85%);
        }

        .machine-header {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px 18px 20px;
          color: #f4f7ff;
        }

        .machine-label {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .machine-location {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          opacity: 0.8;
          margin-top: 6px;
        }

        .machine-description {
          font-size: 13px;
          color: rgba(231, 242, 255, 0.75);
          margin-top: 8px;
          line-height: 1.4;
        }

        .machine-body {
          padding: 18px;
          display: grid;
          gap: 14px;
        }

        .service-card {
          background: rgba(15, 20, 28, 0.96);
          border-radius: 16px;
          padding: 14px;
          display: grid;
          gap: 10px;
          border: 1px solid rgba(60, 255, 200, 0.2);
          box-shadow: 0 10px 24px rgba(2, 7, 16, 0.5);
        }

        .service-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: flex-start;
        }

        .service-info {
          flex: 1;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(60, 255, 200, 0.2);
          color: #3cffc8;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .tag-core {
          background: rgba(60, 255, 200, 0.2);
          color: #3cffc8;
        }

        .tag-video {
          background: rgba(92, 192, 255, 0.25);
          color: #9dd8ff;
        }

        .tag-auth {
          background: rgba(255, 213, 90, 0.25);
          color: #ffe39a;
        }

        .tag-storage {
          background: rgba(92, 192, 255, 0.25);
          color: #9dd8ff;
        }

        .tag-api {
          background: rgba(255, 92, 105, 0.2);
          color: #ffc2c7;
        }

        .tag-database {
          background: rgba(255, 143, 92, 0.2);
          color: #ffc2a3;
        }

        .name {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin-top: 6px;
          color: #e7f2ff;
        }

        .description {
          font-size: 13px;
          color: rgba(231, 242, 255, 0.7);
          line-height: 1.45;
        }

        .status-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
        }

        .endpoint {
          font-family: "JetBrains Mono", "SFMono-Regular", ui-monospace, monospace;
          background: rgba(0, 0, 0, 0.7);
          color: #3cffc8;
          border-radius: 8px;
          padding: 6px 8px;
          font-size: 11px;
          overflow-wrap: anywhere;
        }

        .time {
          font-size: 12px;
          color: #e7f2ff;
          font-weight: 700;
        }

        .error {
          color: #ff5c69;
          font-size: 12px;
          line-height: 1.4;
        }

        .divider {
          height: 1px;
          background: rgba(60, 255, 200, 0.25);
          margin: 4px 0 2px;
        }

        .refresh-row {
          margin-top: 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          color: rgba(231, 242, 255, 0.7);
          font-size: 13px;
        }

        .refresh-button {
          padding: 8px 14px;
          border-radius: 12px;
          border: 1px solid rgba(60, 255, 200, 0.4);
          background: rgba(60, 255, 200, 0.15);
          color: #3cffc8;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.2s ease;
        }

        .refresh-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(60, 255, 200, 0.2);
        }

        .loading {
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .hero {
            padding: 26px 24px;
          }

          .machine-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .banner {
            align-items: flex-start;
          }

          .status-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .service-top {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

function statusDotColor(status: HealthStatus) {
  switch (status) {
    case "operational":
      return "#3cffc8";
    case "degraded":
      return "#ffd55a";
    default:
      return "#ff5c69";
  }
}

function tagClass(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes("video") || lower.includes("transcode")) return "tag-video";
  if (lower.includes("auth") || lower.includes("signup")) return "tag-auth";
  if (lower.includes("database") || lower.includes("db")) return "tag-database";
  if (lower.includes("storage")) return "tag-storage";
  if (lower.includes("api")) return "tag-api";
  if (lower.includes("core")) return "tag-core";
  return "";
}
