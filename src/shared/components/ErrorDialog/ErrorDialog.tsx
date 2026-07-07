import { Dialog, Text } from '@priority-software/priority-style-react';
import type { ErrorDialogProps } from './types';
import styles from './ErrorDialog.module.scss';

export function ErrorDialog({ message, onClose }: ErrorDialogProps) {
  if (!message) return null;

  return (
    <Dialog
      isOpen={!!message}
      onClose={onClose}
      title={<Text skin="subtitle-1">Error</Text>}
      content={<Text skin="paragraph-1">{message}</Text>}
      footer={
        <button onClick={onClose} className={styles.okButton}>
          OK
        </button>
      }
      size="small"
    />
  );
}
