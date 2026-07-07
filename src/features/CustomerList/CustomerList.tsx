import { CustomerRow } from './CustomerRow';
import { EmptyState } from '../../shared/components/EmptyState';
import type { CustomerListProps } from './types';
import styles from './CustomerList.module.scss';

export function CustomerList({ customers, selectedCustomerCode, onSelectCustomer }: CustomerListProps) {
  if (customers.length === 0) {
    return (
      <div className={styles.panel}>
        <EmptyState message="No customers found" />
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {customers.map(customer => (
        <CustomerRow
          key={customer.customerCode}
          customer={customer}
          isSelected={customer.customerCode === selectedCustomerCode}
          onSelect={onSelectCustomer}
        />
      ))}
    </div>
  );
}
