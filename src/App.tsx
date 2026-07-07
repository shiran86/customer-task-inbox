import { useEffect, useMemo, useState, useCallback } from 'react';
import { Text, Dialog } from '@priority-software/priority-style-react';
import LottieImport from 'lottie-react';

const Lottie = (LottieImport as unknown as { default: typeof LottieImport }).default ?? LottieImport;
import loadingAnimation from './assets/loadingIndicator.json';
import { getAllTasks } from './services/restService';
import { transformToCustomerInbox } from './shared/utils/transformTasks';
import type { CustnotesaResponse } from './types/api';
import { PRIORITIES } from './config/constants';

function App() {
  const [tasks, setTasks] = useState<CustnotesaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const customerInboxes = useMemo(() => transformToCustomerInbox(tasks), [tasks]);

  const handleErrorClose = useCallback(() => {
    setError(null);
  }, []);

  return (
    <>
      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 9999,
        }}>
          <Lottie animationData={loadingAnimation} style={{ width: 120, height: 120 }} />
        </div>
      )}

      <Dialog
        isOpen={!!error}
        onClose={handleErrorClose}
        title={<Text skin="paragraph-1"><strong>Error</strong></Text>}
        content={<Text skin="paragraph-1">{error}</Text>}
        footer={
          <button
            onClick={handleErrorClose}
            style={{
              padding: '8px 24px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#3B37E6',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            OK
          </button>
        }
        size="small"
      />

      <div style={{ padding: '16px' }}>
        <Text skin="subtitle-1">Customer Task Inbox</Text>
        <Text skin="paragraph-1" style={{ marginBottom: '16px' }}>
          {customerInboxes.length} customers loaded, {tasks.length} total tasks
        </Text>

        {customerInboxes.map(customer => (
          <div key={customer.customerCode} style={{ marginBottom: '12px', padding: '8px', border: '1px solid #eee', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text skin="paragraph-1">
              <strong>{customer.customerName}</strong>
            </Text>
            {customer.openTaskCount > 0 && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '1px solid #333',
                fontSize: '12px',
                fontWeight: 'bold',
              }}>
                {customer.openTaskCount}
              </span>
            )}
            {customer.highestPriority && (
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: PRIORITIES[customer.highestPriority].bgColor,
                fontSize: '12px',
              }}>
                {PRIORITIES[customer.highestPriority].label}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
