import { useCallback, useEffect, useState, useRef } from 'react';

import { useDebounce } from './useDebounce';
import { useSearchParams } from 'react-router-dom';

export const useSearchWithDebounce = (paramName: string, delay: number = 300) => {
  const [urlParams, setUrlParams] = useSearchParams();
  const [search, setSearch] = useState(urlParams.get(paramName) || '');
  const debouncedSearch = useDebounce(search, delay);
  const isUserTypingRef = useRef(false);

  // Sincronizar o search com a URL quando ela mudar externamente (não por digitação)
  useEffect(() => {
    const urlValue = urlParams.get(paramName) || '';
    // Só sincronizar se não estivermos digitando e o valor da URL for diferente
    if (!isUserTypingRef.current && search !== urlValue) {
      setSearch(urlValue);
    }
  }, [urlParams, paramName]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = useCallback((value: string) => {
    isUserTypingRef.current = true;
    setSearch(value);
    // Não atualizar URL imediatamente, apenas atualizar o estado local
    // A URL será atualizada pelo useEffect com debouncedSearch
  }, []);

  // Atualizar URL apenas quando o debouncedSearch mudar (após delay)
  useEffect(() => {
    const currentValue = urlParams.get(paramName) || '';
    if (debouncedSearch !== currentValue) {
      const newParams = new URLSearchParams(urlParams);
      if (debouncedSearch.trim() === '') {
        newParams.delete(paramName);
      } else {
        newParams.set(paramName, debouncedSearch);
      }
      newParams.set('page', '1');
      if (paramName === 'deptSearch') {
        newParams.set('deptPage', '1');
      }
      setUrlParams(newParams, { replace: true });
      // Marcar que não estamos mais digitando após atualizar a URL
      isUserTypingRef.current = false;
    }
  }, [debouncedSearch, urlParams, setUrlParams, paramName]);

  return {
    search,
    debouncedSearch,
    handleSearchChange
  };
};
