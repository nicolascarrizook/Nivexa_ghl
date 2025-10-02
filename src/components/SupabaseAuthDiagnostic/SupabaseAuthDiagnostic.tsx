import React, { useState } from 'react';
import { supabase } from '../../config/supabase';
import { AuthService } from '../../core/services/AuthService';

interface DiagnosticResult {
  test: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  duration?: number;
}

export const SupabaseAuthDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'complete'>('idle');
  
  const authService = new AuthService();

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const updateResult = (test: string, updates: Partial<DiagnosticResult>) => {
    setResults(prev => prev.map(r => 
      r.test === test ? { ...r, ...updates } : r
    ));
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setResults([]);

    // Test 1: Environment Variables
    await testEnvironmentVariables();
    
    // Test 2: Basic Supabase Connection
    await testBasicConnection();
    
    // Test 3: Auth Configuration
    await testAuthConfiguration();
    
    // Test 4: Database Connectivity
    await testDatabaseConnectivity();
    
    // Test 5: Auth API Endpoints
    await testAuthEndpoints();
    
    // Test 6: Real Authentication Flow
    await testRealAuthFlow();

    setIsRunning(false);
    setOverallStatus('complete');
  };

  const testEnvironmentVariables = async () => {
    const startTime = Date.now();
    addResult({
      test: 'Environment Variables',
      status: 'pending',
      message: 'Checking environment configuration...'
    });

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const issues = [];
      
      if (!supabaseUrl) {
        issues.push('VITE_SUPABASE_URL is missing');
      } else if (!supabaseUrl.startsWith('https://')) {
        issues.push('VITE_SUPABASE_URL should start with https://');
      } else if (!supabaseUrl.includes('supabase.co')) {
        issues.push('VITE_SUPABASE_URL doesn\'t appear to be a valid Supabase URL');
      }
      
      if (!supabaseKey) {
        issues.push('VITE_SUPABASE_ANON_KEY is missing');
      } else if (!supabaseKey.startsWith('eyJ')) {
        issues.push('VITE_SUPABASE_ANON_KEY doesn\'t appear to be a valid JWT token');
      }

      const duration = Date.now() - startTime;
      
      if (issues.length === 0) {
        updateResult('Environment Variables', {
          status: 'success',
          message: 'All environment variables are properly configured',
          details: {
            url: supabaseUrl,
            keyLength: supabaseKey?.length || 0,
            keyPrefix: supabaseKey?.substring(0, 10) + '...'
          },
          duration
        });
      } else {
        updateResult('Environment Variables', {
          status: 'error',
          message: `Configuration issues found: ${issues.join(', ')}`,
          details: { issues, url: supabaseUrl },
          duration
        });
      }
    } catch (error) {
      updateResult('Environment Variables', {
        status: 'error',
        message: 'Failed to check environment variables',
        details: { error: error instanceof Error ? error.message : String(error) },
        duration: Date.now() - startTime
      });
    }
  };

  const testBasicConnection = async () => {
    const startTime = Date.now();
    addResult({
      test: 'Basic Connection',
      status: 'pending',
      message: 'Testing connection to Supabase...'
    });

    try {
      // Test basic connection by getting the current session
      const { data, error } = await supabase.auth.getSession();
      
      const duration = Date.now() - startTime;
      
      if (error) {
        updateResult('Basic Connection', {
          status: 'error',
          message: `Connection failed: ${error.message}`,
          details: { 
            error: error.message,
            status: error.status,
            statusText: (error as any).statusText
          },
          duration
        });
      } else {
        updateResult('Basic Connection', {
          status: 'success',
          message: 'Successfully connected to Supabase',
          details: { 
            hasSession: !!data.session,
            sessionData: data.session ? 'Active session found' : 'No active session'
          },
          duration
        });
      }
    } catch (error) {
      updateResult('Basic Connection', {
        status: 'error',
        message: 'Network or configuration error',
        details: { error: error instanceof Error ? error.message : String(error) },
        duration: Date.now() - startTime
      });
    }
  };

  const testAuthConfiguration = async () => {
    const startTime = Date.now();
    addResult({
      test: 'Auth Configuration',
      status: 'pending',
      message: 'Checking authentication settings...'
    });

    try {
      // Try to access auth admin endpoints to check configuration
      const url = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/settings`;
      
      const response = await fetch(url, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        const settings = await response.json();
        updateResult('Auth Configuration', {
          status: 'success',
          message: 'Auth settings retrieved successfully',
          details: {
            status: response.status,
            settings: {
              disable_signup: settings.disable_signup,
              email_enabled: settings.external?.email,
              autoconfirm: settings.autoconfirm
            }
          },
          duration
        });
      } else {
        const errorText = await response.text();
        updateResult('Auth Configuration', {
          status: response.status === 404 ? 'warning' : 'error',
          message: `Auth settings check failed (${response.status})`,
          details: {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            possibleCause: response.status === 404 ? 'Auth not properly configured' : 'Access denied'
          },
          duration
        });
      }
    } catch (error) {
      updateResult('Auth Configuration', {
        status: 'error',
        message: 'Failed to check auth configuration',
        details: { error: error instanceof Error ? error.message : String(error) },
        duration: Date.now() - startTime
      });
    }
  };

  const testDatabaseConnectivity = async () => {
    const startTime = Date.now();
    addResult({
      test: 'Database Connectivity',
      status: 'pending',
      message: 'Testing database access...'
    });

    try {
      // Test basic database query
      const { data, error } = await supabase
        .from('auth.users')
        .select('count')
        .limit(1);

      const duration = Date.now() - startTime;

      if (error) {
        updateResult('Database Connectivity', {
          status: 'warning',
          message: `Database access limited: ${error.message}`,
          details: { 
            error: error.message,
            hint: error.hint,
            possibleCause: 'This might be expected with Row Level Security'
          },
          duration
        });
      } else {
        updateResult('Database Connectivity', {
          status: 'success',
          message: 'Database is accessible',
          details: { queryResult: data },
          duration
        });
      }
    } catch (error) {
      updateResult('Database Connectivity', {
        status: 'error',
        message: 'Database connectivity failed',
        details: { error: error instanceof Error ? error.message : String(error) },
        duration: Date.now() - startTime
      });
    }
  };

  const testAuthEndpoints = async () => {
    const startTime = Date.now();
    addResult({
      test: 'Auth Endpoints',
      status: 'pending',
      message: 'Testing authentication endpoints...'
    });

    try {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const endpoints = [
        { name: 'signup', url: `${baseUrl}/auth/v1/signup` },
        { name: 'token', url: `${baseUrl}/auth/v1/token` },
        { name: 'user', url: `${baseUrl}/auth/v1/user` }
      ];

      const results = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'HEAD',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
            }
          });
          
          results.push({
            name: endpoint.name,
            url: endpoint.url,
            status: response.status,
            accessible: response.status !== 404
          });
        } catch (err) {
          results.push({
            name: endpoint.name,
            url: endpoint.url,
            status: 'ERROR',
            error: err instanceof Error ? err.message : String(err)
          });
        }
      }

      const duration = Date.now() - startTime;
      const allAccessible = results.every(r => r.accessible);
      
      updateResult('Auth Endpoints', {
        status: allAccessible ? 'success' : 'warning',
        message: `Tested ${results.length} endpoints`,
        details: { endpoints: results },
        duration
      });
    } catch (error) {
      updateResult('Auth Endpoints', {
        status: 'error',
        message: 'Failed to test auth endpoints',
        details: { error: error instanceof Error ? error.message : String(error) },
        duration: Date.now() - startTime
      });
    }
  };

  const testRealAuthFlow = async () => {
    const startTime = Date.now();
    addResult({
      test: 'Authentication Flow',
      status: 'pending',
      message: 'Testing actual signup flow...'
    });

    try {
      // Generate a unique test email
      const testEmail = `test-${Date.now()}@diagnostics.local`;
      const testPassword = 'TestPassword123!';

      const result = await authService.signUp({
        email: testEmail,
        password: testPassword,
        metadata: {
          firstName: 'Test',
          lastName: 'User',
          displayName: 'Test User'
        }
      });

      const duration = Date.now() - startTime;

      if (result.error) {
        const errorDetails = {
          message: result.error.message,
          status: (result.error as any).status,
          statusText: (result.error as any).statusText,
          code: (result.error as any).error_code || (result.error as any).code,
          details: (result.error as any).error_description
        };

        // Specific handling for 500 errors
        if (errorDetails.status === 500) {
          updateResult('Authentication Flow', {
            status: 'error',
            message: '500 Internal Server Error - This indicates a server-side configuration issue',
            details: {
              ...errorDetails,
              possibleCauses: [
                'Email authentication not properly enabled in Supabase dashboard',
                'SMTP configuration missing or incorrect',
                'Database schema issues (missing auth tables)',
                'Row Level Security policies blocking signup',
                'Webhook configuration errors'
              ],
              nextSteps: [
                '1. Check Supabase Dashboard → Authentication → Settings',
                '2. Verify email auth is enabled',
                '3. Check SMTP configuration if email confirmation is required',
                '4. Review database logs in Supabase dashboard',
                '5. Check for any custom auth hooks or triggers'
              ]
            },
            duration
          });
        } else {
          updateResult('Authentication Flow', {
            status: 'error',
            message: `Signup failed: ${result.error.message}`,
            details: errorDetails,
            duration
          });
        }
      } else {
        updateResult('Authentication Flow', {
          status: 'success',
          message: 'Signup completed successfully!',
          details: {
            userId: result.data?.id,
            email: result.data?.email,
            confirmed: result.data?.email_confirmed_at !== null,
            metadata: result.data?.user_metadata
          },
          duration
        });
      }
    } catch (error) {
      updateResult('Authentication Flow', {
        status: 'error',
        message: 'Signup test failed with exception',
        details: { 
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        },
        duration: Date.now() - startTime
      });
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'pending': return '🔄';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'error': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'warning': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'pending': return 'text-gray-600 bg-gray-900 border-gray-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Supabase Authentication Diagnostics
        </h1>
        <p className="text-gray-600">
          Comprehensive testing of Supabase authentication configuration and connectivity
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="bg-gray-900 hover:bg-gray-900 disabled:bg-gray-900 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <span className="animate-spin">🔄</span>
              Running Diagnostics...
            </>
          ) : (
            <>
              🔍 Run Full Diagnostics
            </>
          )}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getStatusIcon(result.status)}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{result.test}</h3>
                    <p className="mt-1">{result.message}</p>
                    {result.duration && (
                      <p className="text-sm opacity-75 mt-1">
                        Completed in {result.duration}ms
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {result.details && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-sm opacity-75 hover:opacity-100">
                    View Details
                  </summary>
                  <div className="mt-2 p-3 bg-black bg-opacity-10 rounded font-mono text-sm overflow-auto">
                    <pre>{JSON.stringify(result.details, null, 2)}</pre>
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {overallStatus === 'complete' && (
        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-bold text-lg mb-4">🎯 Next Steps</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-600 mb-2">🔧 Quick Fix Available</h4>
              <p className="text-sm mb-2">
                We've created an automated fix for common auth issues. Try these solutions:
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Option 1 - Run setup script:</strong>
                  <code className="ml-2 px-2 py-1 bg-gray-100 rounded">npm run setup:auth</code>
                </div>
                <div>
                  <strong>Option 2 - Manual SQL fix:</strong> 
                  <span className="ml-2">Run the SQL in <code>database/quick-auth-fix.sql</code></span>
                </div>
                <div>
                  <strong>Option 3 - Full guide:</strong>
                  <span className="ml-2">Check <code>DATABASE_AUTH_SETUP.md</code> for complete instructions</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-600">If you see 500 Internal Server Error:</h4>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Run the auth setup script above first</li>
                <li>Go to your Supabase Dashboard → Authentication → Settings</li>
                <li>Ensure "Enable email signups" is turned ON</li>
                <li>Check if email confirmation is required and SMTP is configured</li>
                <li>Review any custom auth hooks or database triggers</li>
                <li>Check Supabase logs for detailed error information</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-600">For database connectivity issues:</h4>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Run the auth setup to create required tables and policies</li>
                <li>Verify your Supabase project is active and not paused</li>
                <li>Check that your anon key has the correct permissions</li>
                <li>Review Row Level Security policies</li>
                <li>Ensure auth schema is properly configured</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};