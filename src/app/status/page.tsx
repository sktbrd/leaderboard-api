"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./status.module.css";

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
  { label: string; tone: keyof typeof styles }
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
        image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80",
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
    <div className={styles.wrapper}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <p className={styles.kicker}>Skatehive Systems</p>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Status Overview</h1>
            <span className={`${styles.pill} ${styles[statusCopy.tone]}`}>
              <span
                className={styles.statusDot}
                style={{ background: statusDotColor(overallStatus) }}
              />
              {statusCopy.label}
            </span>
          </div>
          <p className={styles.subtitle}>
            Hardware-level health, organized by the machines powering Skatehive.
          </p>
          <div className={styles.banner}>
            <div className={styles.bannerStatus}>
              <span
                className={styles.statusDot}
                style={{ background: statusDotColor(overallStatus) }}
              />
              {statusCopy.label}
            </div>
            <div className={styles.meta}>
              <span>Last check: {lastUpdated}</span>
              {data?.summary && (
                <span>
                  Healthy: {data.summary.healthy}/{data.summary.total}
                </span>
              )}
              {loading && <span className={styles.loading}>Refreshing…</span>}
            </div>
          </div>
        </header>

        <div className={styles.refreshRow}>
          <button className={styles.refreshButton} onClick={() => load()}>
            Refresh now
          </button>
          <span>Auto-refresh every {Math.round(POLL_MS / 1000)}s.</span>
          {fetchError && (
            <span className={styles.error}>Fetch error: {fetchError}</span>
          )}
        </div>

        {machines.length === 0 && !loading ? (
          <p className={styles.error}>No services to display.</p>
        ) : (
          <div className={styles.machineGrid}>
            {machines.map((machine) => (
              <section className={styles.machineCard} key={machine.id}>
                <div className={styles.machineMedia}>
                  <img
                    src={machine.image}
                    alt={machine.label}
                    className={styles.machineImage}
                  />
                  <div className={styles.machineOverlay} />
                  <div className={styles.machineHeader}>
                    <p className={styles.machineLabel}>{machine.label}</p>
                    <p className={styles.machineLocation}>{machine.location}</p>
                    <p className={styles.machineDescription}>
                      {machine.description}
                    </p>
                  </div>
                </div>

                <div className={styles.machineBody}>
                  {machine.services.map((service) => (
                    <article className={styles.serviceCard} key={service.id}>
                      <div className={styles.serviceTop}>
                        <div className={styles.serviceInfo}>
                          <span
                            className={`${styles.tag} ${getCategoryTagClass(
                              service.category,
                              styles
                            )}`}
                          >
                            {service.category}
                          </span>
                          <div className={styles.name}>{service.name}</div>
                          <p className={styles.description}>
                            {service.description}
                          </p>
                        </div>
                        <span
                          className={`${styles.pill} ${
                            styles[service.isHealthy ? "ok" : "down"]
                          }`}
                        >
                          <span
                            className={styles.statusDot}
                            style={{
                              background: statusDotColor(
                                service.isHealthy ? "operational" : "down"
                              ),
                            }}
                          />
                          {service.isHealthy ? "Operational" : "Unavailable"}
                        </span>
                      </div>

                      <div className={styles.divider} />

                      <div className={styles.statusRow}>
                        <code className={styles.endpoint}>
                          {service.healthUrl}
                        </code>
                        <div className={styles.time}>
                          {service.responseTime
                            ? `${service.responseTime} ms`
                            : "No response"}
                        </div>
                      </div>

                      {service.rcInfo && (
                        <div className={styles.error}>{service.rcInfo}</div>
                      )}
                      {service.error && (
                        <div className={styles.error}>{service.error}</div>
                      )}
                      {service.authStatus && (
                        <div className={styles.meta}>
                          <span>Auth: {service.authStatus}</span>
                        </div>
                      )}
                      <div className={styles.meta}>
                        <span>
                          Checked:{" "}
                          {new Date(service.lastChecked).toLocaleTimeString()}
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
    </div>
  );
}

function statusDotColor(status: HealthStatus) {
  switch (status) {
    case "operational":
      return "#a8ff60";
    case "degraded":
      return "#ffd700";
    default:
      return "#ff4444";
  }
}

function getCategoryIcon(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes("video") || lower.includes("transcode")) return "🎬";
  if (lower.includes("auth") || lower.includes("signup")) return "🔐";
  if (lower.includes("database") || lower.includes("db")) return "💾";
  if (lower.includes("storage")) return "📦";
  if (lower.includes("api")) return "🔌";
  if (lower.includes("core")) return "⚙️";
  return "🖥️";
}

function getCategoryTagClass(
  category: string,
  styles: Record<string, string>
): string {
  const lower = category.toLowerCase();
  if (lower.includes("video") || lower.includes("transcode"))
    return styles.tagVideo;
  if (lower.includes("auth") || lower.includes("signup")) return styles.tagAuth;
  if (lower.includes("database") || lower.includes("db"))
    return styles.tagDatabase;
  if (lower.includes("storage")) return styles.tagStorage;
  if (lower.includes("api")) return styles.tagApi;
  if (lower.includes("core")) return styles.tagCore;
  return styles.tag;
}
