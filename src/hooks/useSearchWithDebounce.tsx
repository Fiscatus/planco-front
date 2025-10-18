import { useCallback, useState } from 'react';

import { useDebounce } from './useDebounce';
import { useSearchParams } from 'react-router-dom';

export const useSearchWithDebounce = (paramName: string, delay: number = 300) => {
  const [urlParams, setUrlParams] = useSearchParams();
  const [search, setSearch] = useState(urlParams.get(paramName) || '');
  const debouncedSearch = useDebounce(search, delay);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    urlParams.set(paramName, value);
    urlParams.set('page', '1');
    setUrlParams(urlParams, { replace: true });
  }, [urlParams, setUrlParams, paramName]);

  return {
    search,
    debouncedSearch,
    handleSearchChange
  };
};
