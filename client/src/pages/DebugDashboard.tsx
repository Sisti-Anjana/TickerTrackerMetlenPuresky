import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DebugDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebugData();
  }, []);

  const fetchDebugData = async () => {
    try {
      console.log('🔎︎ Fetching debug data...');
      const response = await api.get('/tickets');
      console.log('📊 Raw API Response:', response.data);
      
      setRawData(response.data);
      setTickets(response.data?.tickets || []);
    } catch (error) {
      console.error('❌ Debug fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading debug data...</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>🐛 Debug Dashboard</h1>
      <p>This page helps debug what data is being returned from the API.</p>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>📊 Raw API Response:</h2>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '1rem', 
          borderRadius: '4px', 
          overflow: 'auto',
          maxHeight: '300px'
        }}>
          {JSON.stringify(rawData, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>🎫 Tickets Count: {tickets.length}</h2>
      </div>

      {tickets.length > 0 && (
        <div>
          <h2>⌕ First Ticket Analysis:</h2>
          <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Field</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Value</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(tickets[0]).map(([key, value]) => (
                <tr key={key}>
                  <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>{key}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    {value === null ? 'NULL' : 
                     value === undefined ? 'UNDEFINED' : 
                     typeof value === 'object' ? JSON.stringify(value) : 
                     String(value)}
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{typeof value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>🔄 Actions:</h2>
        <button 
          onClick={fetchDebugData}
          style={{ 
            padding: '0.5rem 1rem', 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Data
        </button>
        <button 
          onClick={() => window.location.href = '/dashboard'}
          style={{ 
            padding: '0.5rem 1rem', 
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            marginLeft: '1rem',
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default DebugDashboard;