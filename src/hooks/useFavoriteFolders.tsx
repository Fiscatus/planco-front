import { useState, useEffect, useCallback } from 'react';

const FAVORITE_FOLDERS_KEY = 'favoriteFolders';

export const useFavoriteFolders = () => {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Carregar favoritos do localStorage ao montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITE_FOLDERS_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setFavoriteIds(new Set(ids));
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos do localStorage:', error);
    }
  }, []);

  // Verificar se uma pasta é favorita
  const isFavorite = useCallback(
    (folderId: string) => {
      return favoriteIds.has(folderId);
    },
    [favoriteIds]
  );

  // Alternar favorito de uma pasta
  const toggleFavorite = useCallback(
    (folderId: string) => {
      setFavoriteIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(folderId)) {
          newSet.delete(folderId);
        } else {
          newSet.add(folderId);
        }

        // Salvar no localStorage
        try {
          const idsArray = Array.from(newSet);
          localStorage.setItem(FAVORITE_FOLDERS_KEY, JSON.stringify(idsArray));
        } catch (error) {
          console.error('Erro ao salvar favoritos no localStorage:', error);
        }

        return newSet;
      });
    },
    []
  );

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

