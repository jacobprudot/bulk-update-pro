import { useState, useEffect } from 'react';
import mondaySDK from 'monday-sdk-js';

const monday = mondaySDK();

export const useMonday = () => {
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    monday.listen('context', (res) => {
      setContext(res.data);
      setLoading(false);
    });

    monday.get('context').then((res) => {
      setContext(res.data);
      setLoading(false);
    });
  }, []);

  return {
    monday,
    context,
    loading
  };
};
