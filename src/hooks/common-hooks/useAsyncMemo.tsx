import { useEffect, useState } from 'react';

export default function useAsyncMemo<T>(
  factory: () => Promise<T>,
  deps: React.DependencyList,
): T | undefined {
  const [result, setResult] = useState<T>();

  useEffect(() => {
    let cancelled = false;

    factory()
      .then((value) => {
        if (!cancelled) {
          setResult(value);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          // Optionally, you could setResult(undefined) or keep the previous value
          console.error('useAsyncMemo: factory promise rejected', error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return result;
}
