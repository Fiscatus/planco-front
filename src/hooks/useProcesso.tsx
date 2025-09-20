import type { Processo } from '@/globals/types';
import { api } from '@/services';

type FetchProcessoParams = {
  page?: number;
  limit?: number;
  term?: string;
  status?: 'ativo' | 'inativo';
};

type FetchProcessoResponse = {
  data: Processo[];
  total: number;
};

const useProcesso = () => {
  const fetchProcessos = async ({
    page = 1,
    limit = 10,
    term = '',
    status
  }: FetchProcessoParams): Promise<FetchProcessoResponse> => {
    const { data } = await api.get('/processos', {
      params: {
        page,
        limit,
        term,
        status
      }
    });
    return data;
  };

  const deleteProcesso = async (id: string) => {
    await api.delete(`/processos/${id}`);
  };

  return {
    fetchProcessos,
    deleteProcesso
  };
};

export { useProcesso };
