import { useState, useEffect, useCallback } from 'react';

const FAVORITE_FLOW_MODELS_KEY = 'favoriteFlowModels';

export const useFavoriteFlowModels = () => {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

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

  const isFavorite = useCallback(
    (modelId: string) => favoriteIds.has(modelId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback((modelId: string) => {
    setFavoriteIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }

      try {
        localStorage.setItem(FAVORITE_FLOW_MODELS_KEY, JSON.stringify(Array.from(newSet)));
      } catch (error) {
        console.error('Erro ao salvar favoritos no localStorage:', error);
      }

      return newSet;
    });
  }, []);

  const sortModels = useCallback(
    <T extends { _id: string; isDefaultPlanco?: boolean }>(models: T[]): T[] => {
      return [...models].sort((a, b) => {
        if (a.isDefaultPlanco) return -1;
        if (b.isDefaultPlanco) return 1;
        
        const aFav = favoriteIds.has(a._id);
        const bFav = favoriteIds.has(b._id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        
        return 0;
      });
    },
    [favoriteIds]
  );

  return {
    isFavorite,
    toggleFavorite,
    sortModels
  };
};
