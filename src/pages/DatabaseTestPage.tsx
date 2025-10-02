import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export function DatabaseTestPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      // Test 1: Check if we can connect
      const { data: testData, error: testError } = await supabase
        .from('projects')
        .select('count')
        .limit(1);

      if (testError) {
        // If error contains "relation does not exist", tables don't exist
        if (testError.message.includes('relation') && testError.message.includes('does not exist')) {
          setStatus('error');
          setMessage('Tables not created yet. Please run the SQL migration.');
          return;
        }
        
        // Other errors
        setStatus('error');
        setMessage(`Database error: ${testError.message}`);
        return;
      }

      // Success - tables exist!
      setStatus('success');
      setMessage('✅ Database is properly configured and tables exist!');
      
      // Get list of tables
      const tableList = [
        'projects',
        'architects', 
        'installments',
        'payments',
        'project_cash',
        'master_cash',
        'admin_cash',
        'cash_movements',
        'fee_collections',
        'contracts'
      ];
      setTables(tableList);

    } catch (error) {
      setStatus('error');
      setMessage(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testCreateProject = async () => {
    try {
      const testProject = {
        code: `PRY-${Date.now()}`,
        name: `Test Project ${new Date().toLocaleTimeString()}`,
        client_name: 'Test Client',
        client_email: 'test@example.com',
        project_type: 'construction',
        status: 'active',
        total_amount: 100000,
        down_payment_amount: 20000,
        installments_count: 12,
        installment_amount: 6666.67,
        metadata: {}
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([testProject])
        .select()
        .single();

      if (error) {
        alert(`Error creating project: ${error.message}`);
        return;
      }

      alert(`✅ Project created successfully!\nID: ${data.id}\nCode: ${data.code}`);
      checkDatabase(); // Refresh status
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Status Check</h1>
        
        <div className={`p-6 rounded-lg mb-6 ${
          status === 'loading' ? 'bg-gray-800' :
          status === 'success' ? 'bg-gray-100' :
          'bg-gray-100'
        }`}>
          <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
          <p className="text-lg">{message}</p>
        </div>

        {status === 'success' && (
          <>
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-4">Available Tables:</h3>
              <div className="grid grid-cols-2 gap-2">
                {tables.map(table => (
                  <div key={table} className="flex items-center">
                    <span className="text-gray-600 mr-2">✓</span>
                    <span>{table}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={testCreateProject}
              className="bg-gray-900 hover:bg-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Test Create Project
            </button>
          </>
        )}

        {status === 'error' && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Setup Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to your Supabase dashboard</li>
              <li>Click on "SQL Editor"</li>
              <li>Copy the SQL from /database/migrations/001_initial_schema.sql</li>
              <li>Remove or comment out the trigger creation lines (they already exist)</li>
              <li>Run the modified SQL</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p className="text-sm text-gray-400">
            Supabase URL: {import.meta.env.VITE_SUPABASE_URL || 'Not set'}
          </p>
        </div>
      </div>
    </div>
  );
}