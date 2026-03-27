import type { AppNotification } from '@/globals/types';

export const getNotificationLink = (n: AppNotification): string | null => {
  const stageId = n.metadata?.stageId as string | undefined;
  const tabParam = (tab: string) => stageId ? `?stage=${stageId}&tab=${tab}` : '';

  if (n.processId) {
    switch (n.resourceType) {
      case 'comment':   return `/processos-gerencia/${n.processId}${tabParam('comments')}`;
      case 'checklist': return `/processos-gerencia/${n.processId}${tabParam('checklist')}`;
      case 'signature': return `/processos-gerencia/${n.processId}${tabParam('signature')}`;
      case 'approval':  return `/processos-gerencia/${n.processId}${tabParam('approval')}`;
      default:          return `/processos-gerencia/${n.processId}`;
    }
  }

  if (n.resourceType === 'department' && n.resourceId) return `/minhas-gerencias`;
  if (n.resourceType === 'folder' && n.resourceId)     return `/pasta/${n.resourceId}`;
  if (n.resourceType === 'role')                        return `/admin/roles`;

  return null;
};
