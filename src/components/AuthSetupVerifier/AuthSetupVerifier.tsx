import React, { useState, useEffect } from 'react';
import { supabase } from '@config/supabase';

interface AuthCheck {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export const AuthSetupVerifier: React.FC = () => {
  const [checks, setChecks] = useState<AuthCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const runChecks = async () => {
    setIsRunning(true);
    const newChecks: AuthCheck[] = [];

    // Check 1: Basic Supabase connection
    try {
      const { error } = await supabase.from('architects').select('count', { count: 'exact', head: true });
      if (error) throw error;
      
      newChecks.push({
        name: 'Supabase Connection',
        status: 'success',
        message: 'Successfully connected to Supabase'
      });
    } catch (error) {
      newChecks.push({
        name: 'Supabase Connection',
        status: 'error',
        message: 'Failed to connect to Supabase',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    // Check 2: Auth service
    try {
      const { error } = await supabase.auth.getSession();
      newChecks.push({
        name: 'Auth Service',
        status: error ? 'error' : 'success',
        message: error ? 'Auth service error' : 'Auth service is available',
        details: error?.message
      });
    } catch (error) {
      newChecks.push({
        name: 'Auth Service',
        status: 'error',
        message: 'Auth service failed',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    // Check 3: Profiles table
    try {
      const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      newChecks.push({
        name: 'Profiles Table',
        status: error ? 'error' : 'success',
        message: error ? 'Profiles table not accessible' : 'Profiles table exists and accessible',
        details: error?.message
      });
    } catch (error) {
      newChecks.push({
        name: 'Profiles Table',
        status: 'error',
        message: 'Profiles table check failed',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    // Check 4: Test signup capability
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            firstName: 'Test',
            lastName: 'User'
          }
        }
      });

      if (error) {
        newChecks.push({
          name: 'User Signup Test',
          status: 'error',
          message: 'Signup test failed',
          details: error.message
        });
      } else {
        newChecks.push({
          name: 'User Signup Test',
          status: 'success',
          message: 'Signup test successful',
          details: `Created test user: ${data.user?.id}`
        });

        // Clean up test user if possible
        if (data.user?.id) {
          try {
            await supabase.auth.admin.deleteUser(data.user.id);
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    } catch (error) {
      newChecks.push({
        name: 'User Signup Test',
        status: 'error',
        message: 'Signup test exception',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    setChecks(newChecks);
    
    // Determine overall status
    const hasErrors = newChecks.some(check => check.status === 'error');
    const hasWarnings = newChecks.some(check => check.status === 'warning');
    
    if (hasErrors) {
      setOverallStatus('error');
    } else if (hasWarnings) {
      setOverallStatus('pending');
    } else {
      setOverallStatus('success');
    }
    
    setIsRunning(false);
  };

  useEffect(() => {
    // Auto-run checks on mount
    runChecks();
  }, []);

  const getStatusIcon = (status: AuthCheck['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'pending': return '⏳';
    }
  };

  const getStatusColor = (status: AuthCheck['status']) => {
    switch (status) {
      case 'success': return 'text-gray-600';
      case 'error': return 'text-gray-600';
      case 'warning': return 'text-gray-600';
      case 'pending': return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg ">
      <h2 className="text-2xl font-bold mb-4">Auth Setup Verification</h2>
      
      <div className="mb-4">
        <button
          onClick={runChecks}
          disabled={isRunning}
          className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-900 disabled:opacity-50"
        >
          {isRunning ? 'Running Checks...' : 'Run Checks'}
        </button>
      </div>

      {checks.length > 0 && (
        <div className="space-y-3">
          <div className={`p-3 rounded-lg ${
            overallStatus === 'success' ? 'bg-gray-100 border-l-4 border-gray-200' :
            overallStatus === 'error' ? 'bg-gray-100 border-l-4 border-gray-200' :
            'bg-gray-100 border-l-4 border-gray-200'
          }`}>
            <h3 className="font-semibold">
              {overallStatus === 'success' && '🎉 Auth setup is working correctly!'}
              {overallStatus === 'error' && '❌ Auth setup has issues that need attention'}
              {overallStatus === 'pending' && '⚠️ Auth setup has some warnings'}
            </h3>
          </div>

          {checks.map((check, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getStatusIcon(check.status)}</span>
                  <div>
                    <h4 className="font-medium">{check.name}</h4>
                    <p className={`text-sm ${getStatusColor(check.status)}`}>
                      {check.message}
                    </p>
                    {check.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                          Show details
                        </summary>
                        <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                          {check.details}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {overallStatus === 'error' && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg">
          <h3 className="font-semibold text-gray-600 mb-2">Next Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
            <li>Run the SQL fix in your Supabase dashboard</li>
            <li>Check the DATABASE_AUTH_SETUP.md guide</li>
            <li>Verify your environment variables are correct</li>
            <li>Ensure email auth is enabled in Supabase settings</li>
          </ol>
        </div>
      )}

      {isRunning && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-200"></div>
        </div>
      )}
    </div>
  );
};