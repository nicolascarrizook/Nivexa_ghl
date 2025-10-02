import { useState } from 'react';
import { projectService } from '../../modules/projects/services/ProjectService';
import type { ProjectFormData } from '../../modules/projects/types/project.types';

export const TestDatabaseConnection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    try {
      // Test basic connection
      console.log('🔍 Testing database connection...');
      const projects = await projectService.getProjects();
      setResult(`✅ Connection successful! Found ${projects.length} projects in database.`);
    } catch (err) {
      console.error('❌ Database connection test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateProject = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    try {
      // Test project creation
      console.log('🔍 Testing project creation...');
      
      const testProjectData: ProjectFormData = {
        projectName: 'Test Project ' + Date.now(),
        projectType: 'construction',
        estimatedValue: 1000000,
        description: 'Test project created by database integration test',
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        clientPhone: '+1234567890',
        propertyAddress: 'Test Address 123',
        propertyType: 'residential',
        city: 'Test City',
        zipCode: '12345',
        totalAmount: 1000000,
        downPaymentAmount: 200000,
        downPaymentPercentage: 20,
        downPaymentDate: new Date().toISOString().split('T')[0],
        installmentCount: 12,
        installmentAmount: 66666.67,
        paymentFrequency: 'monthly',
        firstPaymentDate: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        estimatedEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        termsAccepted: true,
      };

      const newProject = await projectService.createProjectFromForm(testProjectData);
      setResult(`✅ Project created successfully! ID: ${newProject?.id}, Code: ${newProject?.code}`);
    } catch (err) {
      console.error('❌ Project creation test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Database Integration Test</h2>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="bg-gray-900 hover:bg-gray-900 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Testing...' : 'Test Database Connection'}
          </button>
        </div>
        
        <div>
          <button
            onClick={testCreateProject}
            disabled={isLoading}
            className="bg-gray-100 hover:bg-gray-100 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Creating...' : 'Test Project Creation'}
          </button>
        </div>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded-lg">
            <p className="text-gray-600">{result}</p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded-lg">
            <p className="text-gray-600 font-medium">Error:</p>
            <p className="text-gray-600 font-mono text-sm">{error}</p>
            <div className="mt-2 p-2 bg-gray-100 border border-gray-200 rounded">
              <p className="text-gray-600 text-sm">
                <strong>Setup Required:</strong> Make sure your Supabase database is configured with the proper schema. 
                Run the migration script: <code className="font-mono">npx tsx scripts/setup-database.ts</code>
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Setup Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Ensure your <code className="font-mono">.env</code> file has valid Supabase credentials</li>
          <li>Run the database setup script: <code className="font-mono">npx tsx scripts/setup-database.ts</code></li>
          <li>Or manually execute the SQL from <code className="font-mono">database/migrations/001_initial_schema.sql</code></li>
          <li>Click "Test Database Connection" to verify everything is working</li>
        </ol>
      </div>
    </div>
  );
};