import { useEffect, useMemo, useState, useCallback } from 'react';
import { getAllTasks } from './services/restService';
import { transformToCustomerInbox } from './shared/utils/transformTasks';
import { CustomerList } from './features/CustomerList';
import { TaskThread } from './features/TaskThread';
import { LoadingOverlay } from './shared/components/LoadingOverlay';
import { ErrorDialog } from './shared/components/ErrorDialog';
import { EmptyState } from './shared/components/EmptyState';
import type { CustnotesaResponse } from './types/api';
import styles from './App.module.scss';

function App() {
  const [tasks, setTasks] = useState<CustnotesaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomerCode, setSelectedCustomerCode] = useState<string | null>(null);
  const [isMobileThreadOpen, setIsMobileThreadOpen] = useState(false);

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

  const selectedCustomer = useMemo(
    () => customerInboxes.find(c => c.customerCode === selectedCustomerCode) ?? null,
    [customerInboxes, selectedCustomerCode]
  );

  const handleSelectCustomer = useCallback((code: string) => {
    setSelectedCustomerCode(code);
    setIsMobileThreadOpen(true);
  }, []);

  const handleBackToList = useCallback(() => {
    setIsMobileThreadOpen(false);
  }, []);

  const handleEditTask = useCallback((taskId: number) => {
    console.log('Edit task:', taskId);
  }, []);

  const handleDeleteTask = useCallback((taskId: number) => {
    console.log('Delete task:', taskId);
  }, []);

  const handleErrorClose = useCallback(() => {
    setError(null);
  }, []);

  return (
    <div className={styles.appContainer}>
      {loading && <LoadingOverlay />}
      <ErrorDialog message={error} onClose={handleErrorClose} />

      <div className={`${styles.leftPanel} ${isMobileThreadOpen ? styles.hiddenOnMobile : ''}`}>
        <CustomerList
          customers={customerInboxes}
          selectedCustomerCode={selectedCustomerCode}
          onSelectCustomer={handleSelectCustomer}
        />
      </div>

      <div className={`${styles.rightPanel} ${!isMobileThreadOpen ? styles.hiddenOnMobile : ''}`}>
        {selectedCustomer ? (
          <>
            <div className={styles.threadHeader}>
              <button
                className={styles.backButton}
                onClick={handleBackToList}
                aria-label="Back to customer list"
              >
                ←
              </button>
              <span className={styles.threadHeaderName}>{selectedCustomer.customerName}</span>
              {selectedCustomer.openTaskCount > 0 && (
                <span className={styles.threadHeaderCount}>{selectedCustomer.openTaskCount}</span>
              )}
            </div>
            <TaskThread
              tasks={selectedCustomer.tasks}
              customerName={selectedCustomer.customerName}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          </>
        ) : (
          <EmptyState message="Select a customer to view tasks" />
        )}
      </div>
    </div>
  );
}

export default App;
