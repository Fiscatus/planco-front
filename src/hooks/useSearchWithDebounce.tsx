import { useCallback, useEffect, useRef, useState } from 'react';

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
    // Só sincronizar se:
    // 1. Não estivermos digitando
    // 2. O valor da URL for diferente do search atual
    // 3. O search atual já está sincronizado com o debouncedSearch (usuário parou de digitar)
    if (!isUserTypingRef.current && search !== urlValue && search === debouncedSearch) {
      setSearch(urlValue);
    }
  }, [urlParams, paramName, search, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = useCallback((value: string) => {
    isUserTypingRef.current = true;
    setSearch(value);
    // Não atualizar URL imediatamente, apenas atualizar o estado local
    // A URL será atualizada pelo useEffect com debouncedSearch
  }, []);

  // Atualizar URL apenas quando o debouncedSearch mudar (após delay)
  useEffect(() => {
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
    handleSearchChange
  };
};
