import { useEffect, useMemo, useState } from 'react';
import { Text } from '@priority-software/priority-style-react';
import { getAllTasks } from './services/restService';
import { transformToCustomerInbox } from './shared/utils/transformTasks';
import type { CustnotesaResponse } from './types/api';
import { PRIORITIES } from './config/constants';

function App() {
  const [tasks, setTasks] = useState<CustnotesaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        const data = await getAllTasks(controller.signal);
        setTasks(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => controller.abort();
  }, []);

  const customerInboxes = useMemo(() => transformToCustomerInbox(tasks), [tasks]);

  if (loading) {
    return <Text skin="paragraph-1">Loading tasks...</Text>;
  }

  if (error) {
    return <Text skin="paragraph-1" textColor="danger-500">Error: {error}</Text>;
  }

  return (
    <div style={{ padding: '16px' }}>
      <Text skin="header-1">Customer Task Inbox</Text>
      <Text skin="paragraph-1" style={{ marginBottom: '16px' }}>
        {customerInboxes.length} customers loaded, {tasks.length} total tasks
      </Text>

      {customerInboxes.map(customer => (
        <div key={customer.customerCode} style={{ marginBottom: '12px', padding: '8px', border: '1px solid #eee', borderRadius: '4px' }}>
          <Text skin="paragraph-1">
            <strong>{customer.customerName}</strong>
            {' — '}
            {customer.openTaskCount} open tasks
            {customer.highestPriority && (
              <span style={{
                marginLeft: '8px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: PRIORITIES[customer.highestPriority].bgColor,
                fontSize: '12px',
              }}>
                {PRIORITIES[customer.highestPriority].label}
              </span>
            )}
            {!customer.highestPriority && (
              <span style={{
                marginLeft: '8px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: '#4CAF50',
                color: 'white',
                fontSize: '12px',
              }}>
                No open tasks
              </span>
            )}
          </Text>
        </div>
      ))}
    </div>
  );
}

export default App;
