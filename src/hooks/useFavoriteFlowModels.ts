import { useCallback, useEffect, useState } from 'react';

const FAVORITE_FLOW_MODELS_KEY = 'favoriteFlowModels';

export const useFavoriteFlowModels = () => {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Carregar favoritos do localStorage ao montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITE_FLOW_MODELS_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setFavoriteIds(new Set(ids));
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos do localStorage:', error);
    }
  }, []);

  // Verificar se um modelo é favorito
  const isFavorite = useCallback(
    (flowModelId: string) => {
      return favoriteIds.has(flowModelId);
    },
    [favoriteIds]
  );

  // Alternar favorito de um modelo
  const toggleFavorite = useCallback((flowModelId: string) => {
    setFavoriteIds((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(flowModelId)) {
        newSet.delete(flowModelId);
      } else {
        newSet.add(flowModelId);
      }

      // Salvar no localStorage
      try {
        const idsArray = Array.from(newSet);
        localStorage.setItem(FAVORITE_FLOW_MODELS_KEY, JSON.stringify(idsArray));
      } catch (error) {
        console.error('Erro ao salvar favoritos no localStorage:', error);
      }

      return newSet;
    });
  }, []);

  // Obter todos os IDs favoritos
  const getFavoriteIds = useCallback(() => {
    return Array.from(favoriteIds);
  }, [favoriteIds]);

  return {
    isFavorite,
    toggleFavorite,
    getFavoriteIds
  };
};
