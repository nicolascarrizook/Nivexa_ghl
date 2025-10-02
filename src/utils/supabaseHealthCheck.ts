import { supabase } from '../config/supabase';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
    duration?: number;
    details?: any;
  }[];
  timestamp: string;
  environment: {
    supabaseUrl: string;
    hasAnonKey: boolean;
    userAgent: string;
  };
}

export class SupabaseHealthChecker {
  /**
   * Perform comprehensive health check of Supabase connectivity and configuration
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const checks: HealthCheckResult['checks'] = [];

    // Environment check
    const envCheck = await this.checkEnvironment();
    checks.push(envCheck);

    // Basic connectivity check
    const connectivityCheck = await this.checkConnectivity();
    checks.push(connectivityCheck);

    // Auth service check
    const authCheck = await this.checkAuthService();
    checks.push(authCheck);

    // Database access check
    const dbCheck = await this.checkDatabaseAccess();
    checks.push(dbCheck);

    // Determine overall status
    const hasFailures = checks.some(check => check.status === 'fail');
    const hasWarnings = checks.some(check => check.status === 'warn');
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (hasFailures) {
      overallStatus = 'unhealthy';
    } else if (hasWarnings) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'NOT_SET',
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        userAgent: navigator.userAgent,
      }
    };
  }

  private async checkEnvironment(): Promise<HealthCheckResult['checks'][0]> {
    const checkStart = Date.now();
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const issues: string[] = [];

      if (!supabaseUrl) {
        issues.push('VITE_SUPABASE_URL not set');
      } else if (!supabaseUrl.startsWith('https://')) {
        issues.push('VITE_SUPABASE_URL should use HTTPS');
      } else if (!supabaseUrl.includes('.supabase.co')) {
        issues.push('VITE_SUPABASE_URL doesn\'t appear to be a valid Supabase URL');
      }

      if (!anonKey) {
        issues.push('VITE_SUPABASE_ANON_KEY not set');
      } else if (!anonKey.startsWith('eyJ')) {
        issues.push('VITE_SUPABASE_ANON_KEY doesn\'t appear to be a valid JWT');
      }

      return {
        name: 'Environment Configuration',
        status: issues.length === 0 ? 'pass' : 'fail',
        message: issues.length === 0 ? 'All environment variables are properly configured' : `Configuration issues: ${issues.join(', ')}`,
        duration: Date.now() - checkStart,
        details: {
          url: supabaseUrl,
          hasKey: !!anonKey,
          keyLength: anonKey?.length || 0,
          issues
        }
      };
    } catch (error) {
      return {
        name: 'Environment Configuration',
        status: 'fail',
        message: 'Failed to check environment configuration',
        duration: Date.now() - checkStart,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  private async checkConnectivity(): Promise<HealthCheckResult['checks'][0]> {
    const checkStart = Date.now();
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return {
          name: 'Basic Connectivity',
          status: 'fail',
          message: `Connection failed: ${error.message}`,
          duration: Date.now() - checkStart,
          details: { 
            error: error.message,
            status: (error as any).status,
            code: (error as any).code
          }
        };
      }

      return {
        name: 'Basic Connectivity',
        status: 'pass',
        message: 'Successfully connected to Supabase',
        duration: Date.now() - checkStart,
        details: { hasSession: !!data.session }
      };
    } catch (error) {
      return {
        name: 'Basic Connectivity',
        status: 'fail',
        message: 'Network connectivity issue',
        duration: Date.now() - checkStart,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  private async checkAuthService(): Promise<HealthCheckResult['checks'][0]> {
    const checkStart = Date.now();
    
    try {
      // Test auth endpoints accessibility
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const authUrl = `${baseUrl}/auth/v1/settings`;
      
      const response = await fetch(authUrl, {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const settings = await response.json();
        return {
          name: 'Auth Service',
          status: 'pass',
          message: 'Auth service is accessible and configured',
          duration: Date.now() - checkStart,
          details: {
            status: response.status,
            emailEnabled: settings.external?.email !== false,
            signupDisabled: settings.disable_signup === true,
            autoconfirm: settings.autoconfirm === true
          }
        };
      } else if (response.status === 403) {
        return {
          name: 'Auth Service',
          status: 'warn',
          message: 'Auth service accessible but permissions limited',
          duration: Date.now() - checkStart,
          details: { status: response.status, statusText: response.statusText }
        };
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        return {
          name: 'Auth Service',
          status: 'fail',
          message: `Auth service check failed (${response.status})`,
          duration: Date.now() - checkStart,
          details: { 
            status: response.status, 
            statusText: response.statusText,
            error: errorText
          }
        };
      }
    } catch (error) {
      return {
        name: 'Auth Service',
        status: 'fail',
        message: 'Failed to check auth service',
        duration: Date.now() - checkStart,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  private async checkDatabaseAccess(): Promise<HealthCheckResult['checks'][0]> {
    const checkStart = Date.now();
    
    try {
      // Try to access a simple query that should work with basic permissions
      const { data, error } = await supabase
        .rpc('auth.uid'); // This should be available to check user context

      if (error && !error.message.includes('permission denied')) {
        return {
          name: 'Database Access',
          status: 'warn',
          message: `Limited database access: ${error.message}`,
          duration: Date.now() - checkStart,
          details: { 
            error: error.message,
            hint: error.hint,
            possibleCause: 'Row Level Security policies may be restricting access'
          }
        };
      }

      return {
        name: 'Database Access',
        status: 'pass',
        message: 'Database is accessible',
        duration: Date.now() - checkStart,
        details: { queryResult: data }
      };
    } catch (error) {
      return {
        name: 'Database Access',
        status: 'fail',
        message: 'Database connectivity failed',
        duration: Date.now() - checkStart,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }
}

// Export singleton instance
export const supabaseHealthChecker = new SupabaseHealthChecker();