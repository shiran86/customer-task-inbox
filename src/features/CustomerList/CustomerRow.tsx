import { useCallback } from 'react';
import { Text } from '@priority-software/priority-style-react';
import { PRIORITIES } from '../../config/constants';
import type { CustomerRowProps } from './types';
import styles from './CustomerList.module.scss';

export function CustomerRow({ customer, isSelected, onSelect }: CustomerRowProps) {
  const handleClick = useCallback(() => {
    onSelect(customer.customerCode);
  }, [onSelect, customer.customerCode]);

  const rowClassName = [
    styles.customerRow,
    isSelected ? styles.selected : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={rowClassName} onClick={handleClick} role="button" tabIndex={0}>
      <Text skin="paragraph-1" componentClasses={styles.customerName}>
        {customer.customerName}
      </Text>
      <div className={styles.rowMeta}>
        {customer.openTaskCount > 0 && (
          <span className={styles.taskCount}>{customer.openTaskCount}</span>
        )}
        {customer.highestPriority && (
          <span
            className={styles.priorityBadge}
            style={{ backgroundColor: PRIORITIES[customer.highestPriority].bgColor }}
          >
            {PRIORITIES[customer.highestPriority].label}
          </span>
        )}
      </div>
    </div>
  );
}
