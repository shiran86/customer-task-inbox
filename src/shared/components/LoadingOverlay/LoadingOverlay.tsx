import LottieImport from 'lottie-react';
import loadingAnimation from '../../../assets/loadingIndicator.json';
import styles from './LoadingOverlay.module.scss';

const Lottie = (LottieImport as unknown as { default: typeof LottieImport }).default ?? LottieImport;

export function LoadingOverlay() {
  return (
    <div className={styles.overlay}>
      <Lottie animationData={loadingAnimation} className={styles.loader} />
    </div>
  );
}
