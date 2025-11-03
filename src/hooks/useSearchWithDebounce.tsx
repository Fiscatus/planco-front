import { useCallback, useEffect, useState } from 'react';

import { useDebounce } from './useDebounce';
import { useSearchParams } from 'react-router-dom';

export const useSearchWithDebounce = (paramName: string, delay: number = 300) => {
  const [urlParams, setUrlParams] = useSearchParams();
  const [search, setSearch] = useState(urlParams.get(paramName) || '');
  const debouncedSearch = useDebounce(search, delay);

  // Sincronizar o search com a URL quando ela mudar
  useEffect(() => {
    const urlValue = urlParams.get(paramName) || '';
    if (search !== urlValue) {
      setSearch(urlValue);
    }
  }, [urlParams, paramName]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    const newParams = new URLSearchParams(urlParams);
    newParams.set(paramName, value);
    newParams.set('page', '1');
    setUrlParams(newParams, { replace: true });
  }, [urlParams, setUrlParams, paramName]);

  return {
    search,
    debouncedSearch,
    handleSearchChange
  };
};
