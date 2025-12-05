import { NextRequest, NextResponse } from 'next/server';
import { TRANSCODE_SERVICES, ServiceStatus } from '../config';

async function checkServiceHealth(healthUrl: string): Promise<{ isHealthy: boolean; responseTime?: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        isHealthy: false,
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
    
    const data = await response.json();
    const isHealthy = data.ok === true || data.healthy === true || data.status === 'ok';
    
    return {
      isHealthy,
      responseTime,
      error: isHealthy ? undefined : 'Health check returned false'
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      isHealthy: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}



export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Check health of all services in parallel
    const healthCheckPromises = TRANSCODE_SERVICES.map(async (service): Promise<ServiceStatus> => {
      const healthResult = await checkServiceHealth(service.healthUrl);
      
      return {
        priority: service.priority,
        name: service.name,
        healthUrl: service.healthUrl,
        transcodeUrl: service.transcodeUrl,
        isHealthy: healthResult.isHealthy,
        responseTime: healthResult.responseTime,
        error: healthResult.error,
        lastChecked: new Date().toISOString()
      };
    });
    
    const serviceStatuses = await Promise.all(healthCheckPromises);
    
    // Find the active service (first healthy one by priority)
    const activeService = serviceStatuses
      .filter(s => s.isHealthy)
      .sort((a, b) => a.priority - b.priority)[0];
    
    const totalResponseTime = Date.now() - startTime;
    const healthyCount = serviceStatuses.filter(s => s.isHealthy).length;
    const totalCount = serviceStatuses.length;
    
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      totalResponseTime: `${totalResponseTime}ms`,
      summary: {
        healthyServices: healthyCount,
        totalServices: totalCount,
        systemStatus: healthyCount > 0 ? 'operational' : 'degraded',
        activeService: activeService ? {
          name: activeService.name,
          priority: activeService.priority,
          transcodeUrl: activeService.transcodeUrl,
          responseTime: `${activeService.responseTime}ms`
        } : null
      },
      services: serviceStatuses.sort((a, b) => a.priority - b.priority)
    };
    
    // Return different HTTP status based on system health
    const httpStatus = healthyCount > 0 ? 200 : 503;
    
    return NextResponse.json(response, { status: httpStatus });
    
  } catch (error) {
    console.error('Error in transcode status check:', error);
    return NextResponse.json(
      { 
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Failed to check service status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}