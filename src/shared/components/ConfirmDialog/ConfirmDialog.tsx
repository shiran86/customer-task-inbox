import { Dialog, Text } from '@priority-software/priority-style-react';
import type { ConfirmDialogProps } from './types';
import styles from './ConfirmDialog.module.scss';

export function ConfirmDialog({ isOpen, message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title={<Text skin="subtitle-1">Confirm</Text>}
      content={<Text skin="paragraph-1">{message}</Text>}
      footer={
        <div className={styles.footer}>
          <button onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.confirmButton}>
            Yes
          </button>
        </div>
      }
      size="small"
    />
  );
}
