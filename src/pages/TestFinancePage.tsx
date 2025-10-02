import { useEffect, useState } from 'react';
import { newCashBoxService } from '@/services/cash/NewCashBoxService';

export function TestFinancePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    testCashService();
  }, []);

  const testCashService = async () => {
    setLoading(true);
    setError(null);
    try {
      // Test getting master cash
      const masterCash = await newCashBoxService.getMasterCash();
      console.log('Master cash:', masterCash);

      // Test getting movements if master cash exists
      if (masterCash) {
        const movements = await newCashBoxService.getCashMovements('master', masterCash.id, 10);
        console.log('Movements:', movements);
        setData({ masterCash, movements });
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Finance Page</h1>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {data && (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p className="font-bold">Success! Cash service is working.</p>
            <p>Master Cash Balance: {data.masterCash?.balance || 0}</p>
            <p>Movements found: {data.movements?.length || 0}</p>
          </div>
          
          <pre className="p-4 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}