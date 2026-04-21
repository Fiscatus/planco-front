import { useCallback, useState } from 'react';
import { api } from '@/services';
import type { Org, UpdateOrgDto } from '@/globals/types';

export const useOrg = () => {
  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrg = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Org>('/orgs/me');
      setOrg(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrg = useCallback(async (dto: UpdateOrgDto): Promise<Org> => {
    setLoading(true);
    try {
      const { data } = await api.put<Org>('/orgs/me', dto);
      setOrg(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLogo = useCallback(async (file: File): Promise<Org> => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post<Org>('/orgs/me/logo', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setOrg(prev => prev ? { ...prev, logoUrl: data.logoUrl, logoKey: data.logoKey } : prev);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { org, loading, fetchOrg, updateOrg, updateLogo };
};
