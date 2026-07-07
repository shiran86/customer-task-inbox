import { Text } from '@priority-software/priority-style-react';
import type { EmptyStateProps } from './types';
import styles from './EmptyState.module.scss';

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <Text skin="paragraph-1" textColor="primary-700">{message}</Text>
    </div>
  );
}
