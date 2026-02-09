export type Folder = {
  _id: string;
  name: string;
  description?: string;
  observations?: string;
  isDefault?: boolean;
  isPermanent?: boolean;
  isFavorite?: boolean;
  processCount?: number;
  createdAt?: string;
  updatedAt?: string;
  year?: string;
};

export type PaginatedFolders = {
  folders: Folder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateFolderDto = {
  name: string;
  observations?: string;
  year?: number;
};

export type UpdateFolderDto = {
  name?: string;
  observations?: string;
  year?: number;
  isFavorite?: boolean;
};

export type FilterFoldersDto = {
  page?: number;
  limit?: number;
  search?: string;
  year?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type ToggleFavoriteResponse = {
  message: string;
  folder: Folder;
};
