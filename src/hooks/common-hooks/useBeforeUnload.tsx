'use client';

import { useCallback, useEffect } from 'react';

const useBeforeUnload = (hasUnsavedChanges = false) => {
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Prevent the default behavior and show confirmation dialog
        e.preventDefault();
        // Set returnValue - modern browsers ignore custom messages
        e.returnValue = true;
        // Return the same value for legacy browser support
        return true;
      }
    },
    [hasUnsavedChanges],
  );

  useEffect(() => {
    // Only add listener when there are unsaved changes
    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, handleBeforeUnload]);
};

export default useBeforeUnload;
