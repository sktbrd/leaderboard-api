// Shared configuration for transcode services
export const TRANSCODE_SERVICES = [
  {
    priority: 1,
    name: 'Oracle (Primary)',
    healthUrl: 'https://146-235-239-243.sslip.io/healthz',
    transcodeUrl: 'https://146-235-239-243.sslip.io/transcode'
  },
  {
    priority: 2,
    name: 'Mac Mini M4 (Secondary)',
    healthUrl: 'https://minivlad.tail9656d3.ts.net/video/healthz',
    transcodeUrl: 'https://minivlad.tail9656d3.ts.net/video/transcode'
  },
  {
    priority: 3,
    name: 'Raspberry Pi (Fallback)',
    healthUrl: 'https://vladsberry.tail83ea3e.ts.net/video/healthz',
    transcodeUrl: 'https://vladsberry.tail83ea3e.ts.net/video/transcode'
  }
];

export interface ServiceConfig {
  priority: number;
  name: string;
  healthUrl: string;
  transcodeUrl: string;
}

export interface ServiceStatus extends ServiceConfig {
  isHealthy: boolean;
  responseTime?: number;
  error?: string;
  lastChecked: string;
}