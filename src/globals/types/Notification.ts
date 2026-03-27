export type NotificationCategory = 'processo' | 'gerencia' | 'usuario' | 'sistema';

export type AppNotification = {
  _id: string;
  userId: string;
  orgId: string;
  category: NotificationCategory;
  type: string;
  title: string;
  body: string;
  read: boolean;
  readAt: string | null;
  starred: boolean;
  archived: boolean;
  archivedAt: string | null;
  actorId: string | null;
  actorName: string | null;
  processId: string | null;
  processNumber: string | null;
  processObject: string | null;
  resourceType: string | null;
  resourceId: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedNotifications = {
  items: AppNotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unread: number;
  starred: number;
};

export type NotificationFilters = {
  category?: NotificationCategory;
  type?: string;
  read?: boolean;
  starred?: boolean;
  archived?: boolean;
  search?: string;
  page?: number;
  limit?: number;
};
