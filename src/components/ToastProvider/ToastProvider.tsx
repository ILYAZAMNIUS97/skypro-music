'use client';

import { Toaster } from 'react-hot-toast';
import styles from './ToastProvider.module.css';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: styles.toast,
        success: {
          className: styles.toastSuccess,
          iconTheme: {
            primary: '#1ed760',
            secondary: '#ffffff',
          },
        },
        error: {
          className: styles.toastError,
          iconTheme: {
            primary: '#e22134',
            secondary: '#ffffff',
          },
        },
        loading: {
          className: styles.toastLoading,
        },
      }}
    />
  );
}
