import { useCallback, useEffect, useRef, useState } from 'react';

import { useDebounce } from './useDebounce';
import { useSearchParams } from 'react-router-dom';

export const useSearchWithDebounce = (paramName: string, delay: number = 300) => {
  const [urlParams, setUrlParams] = useSearchParams();
  const [search, setSearch] = useState(urlParams.get(paramName) || '');
  const debouncedSearch = useDebounce(search, delay);
  const isUserTypingRef = useRef(false);
  const isClearingRef = useRef(false);

  useEffect(() => {
    if (isClearingRef.current) return;
    
    const urlValue = urlParams.get(paramName) || '';
    // Só sincronizar se:
    // 1. Não estivermos digitando
    // 2. O valor da URL for diferente do search atual
    // 3. O search atual já está sincronizado com o debouncedSearch (usuário parou de digitar)
    if (!isUserTypingRef.current && search !== urlValue && search === debouncedSearch) {
      setSearch(urlValue);
    }
  }, [urlParams, paramName, search, debouncedSearch]);

  const handleSearchChange = useCallback((value: string) => {
    isClearingRef.current = false;
    isUserTypingRef.current = true;
    setSearch(value);
  }, []);

  const clearSearch = useCallback(() => {
    isClearingRef.current = true;
    isUserTypingRef.current = false;
    setSearch('');
    setTimeout(() => {
      isClearingRef.current = false;
    }, delay + 100);
  }, [delay]);

  useEffect(() => {
    if (isClearingRef.current) return;
    
    setUrlParams((prev) => {
      const currentValue = prev.get(paramName) || '';
      if (debouncedSearch !== currentValue) {
        const newParams = new URLSearchParams(prev);
        if (debouncedSearch.trim() === '') {
          newParams.delete(paramName);
        } else {
          newParams.set(paramName, debouncedSearch);
        }
        newParams.set('page', '1');
        // Marcar que não estamos mais digitando após atualizar a URL
        isUserTypingRef.current = false;
        return newParams;
      }
      return prev;
    });
  }, [debouncedSearch, setUrlParams, paramName]);

  return {
    search,
    debouncedSearch,
    handleSearchChange,
    clearSearch
  };
};
