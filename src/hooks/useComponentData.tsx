import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services';

type ComponentContext = {
  processId: string;
  stageId: string;
  componentKey: string;
};

// ==================== FORMS ====================
export const useForm = (context: ComponentContext, enabled = true) => {
  return useQuery({
    queryKey: ['form', context],
    enabled,
    queryFn: async () => {
      const response = await api.get('/forms', { params: context });
      return response.data;
    }
  });
};

export const useSubmitForm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ context, data }: { context: ComponentContext; data: any }) => {
      const response = await api.put('/forms', data, { params: context });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['form', variables.context] });
    }
  });
};

// ==================== FILES ====================
export const useFiles = (context: ComponentContext, enabled = true) => {
  return useQuery({
    queryKey: ['files', context],
    enabled,
    queryFn: async () => {
      const response = await api.get('/files', { params: context });
      return response.data;
    }
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, context, category }: { file: File; context: ComponentContext; category: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(context).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('category', category);
      
      const response = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['files', variables.context] });
    }
  });
};

export const useSendFileToApproval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ fileId, context }: { fileId: string; context: ComponentContext }) => {
      const response = await api.post(`/files/${fileId}/send-to-approval`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['files', variables.context] });
      queryClient.invalidateQueries({ queryKey: ['approval-pending', variables.context.processId] });
      queryClient.invalidateQueries({ queryKey: ['approval-history', variables.context.processId] });
    }
  });
};

export const useFilesByProcess = (processId: string, enabled = true) => {
  return useQuery({
    queryKey: ['files-by-process', processId],
    enabled: !!processId && enabled,
    staleTime: 0,
    queryFn: async () => {
      const response = await api.get('/files/by-process', { params: { processId } });
      return response.data;
    }
  });
};

export const useDownloadFile = () => {
  return useMutation({
    mutationFn: async ({ fileId, inline = false }: { fileId: string; inline?: boolean }) => {
      const response = await api.get(`/files/${fileId}/download`, {
        params: { inline: inline.toString() }
      });
      return response.data;
    }
  });
};

// ==================== TIMELINE ====================
export const useTimeline = (context: ComponentContext, filters?: any, enabled = true) => {
  return useQuery({
    queryKey: ['timeline', context, filters],
    enabled,
    queryFn: async () => {
      const response = await api.get('/timeline', { 
        params: { ...context, ...filters } 
      });
      return response.data;
    }
  });
};

export const useCreateTimelineEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ context, data }: { context: ComponentContext; data: any }) => {
      const response = await api.post('/timeline', { ...context, ...data });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timeline', variables.context] });
    }
  });
};

export const useUpdateTimelineEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data, context }: { id: string; data: any; context: ComponentContext }) => {
      const response = await api.patch(`/timeline/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timeline', variables.context] });
    }
  });
};

export const useDeleteTimelineEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, context }: { id: string; context: ComponentContext }) => {
      await api.delete(`/timeline/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timeline', variables.context] });
    }
  });
};

// ==================== CHECKLIST ====================
export const useChecklist = (context: ComponentContext, enabled = true) => {
  return useQuery({
    queryKey: ['checklist', context],
    enabled,
    queryFn: async () => {
      const response = await api.get('/checklist', { params: context });
      return response.data;
    }
  });
};

export const useCreateChecklistItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ context, data }: { context: ComponentContext; data: any }) => {
      const response = await api.post('/checklist', { ...context, ...data });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist', variables.context] });
    }
  });
};

export const useUpdateChecklistItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data, context }: { id: string; data: any; context: ComponentContext }) => {
      const response = await api.patch(`/checklist/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist', variables.context] });
    }
  });
};

export const useToggleChecklistItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, context }: { id: string; context: ComponentContext }) => {
      const response = await api.patch(`/checklist/${id}/toggle`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist', variables.context] });
    }
  });
};

export const useDeleteChecklistItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, context }: { id: string; context: ComponentContext }) => {
      await api.delete(`/checklist/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist', variables.context] });
    }
  });
};

// ==================== COMMENTS ====================
export const useComments = (context: ComponentContext, filters?: any, enabled = true) => {
  return useQuery({
    queryKey: ['comments', context, filters],
    enabled,
    queryFn: async () => {
      const response = await api.get('/comments', { 
        params: { ...context, ...filters } 
      });
      return response.data;
    }
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ context, data, file }: { context: ComponentContext; data: any; file?: File }) => {
      const formData = new FormData();
      Object.entries(context).forEach(([key, value]) => formData.append(key, value));
      formData.append('text', data.text || '');
      if (file) formData.append('file', file);
      
      const response = await api.post('/comments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.context] });
    }
  });
};

// ==================== APPROVALS ====================
export const useApprovals = (context: { instanceId: string; stageId: string; componentKey: string }, enabled = true) => {
  return useQuery({
    queryKey: ['approvals', context],
    enabled,
    queryFn: async () => {
      const response = await api.get('/approvals', { params: context });
      return response.data;
    }
  });
};

export const usePendingApproval = (processId: string, enabled = true) => {
  return useQuery({
    queryKey: ['approval-pending', processId],
    enabled,
    staleTime: 0,
    queryFn: async () => {
      const response = await api.get('/approvals/pending', { 
        params: { processId } 
      });
      return response.data;
    }
  });
};

export const useApprovalHistory = (processId: string, enabled = true) => {
  return useQuery({
    queryKey: ['approval-history', processId],
    enabled,
    staleTime: 0,
    queryFn: async () => {
      const response = await api.get('/approvals/history', { params: { processId } });
      return response.data;
    }
  });
};

export const useResolveApproval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ processId, approved, reason }: { processId: string; approved: boolean; reason?: string }) => {
      const response = await api.patch('/approvals/resolve', { 
        processId, 
        approved, 
        reason 
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approval-pending', variables.processId] });
      queryClient.invalidateQueries({ queryKey: ['approval-history', variables.processId] });
    }
  });
};

// ==================== SIGNATURES ====================
export const useSignature = (context: ComponentContext, enabled = true) => {
  return useQuery({
    queryKey: ['signature', context],
    enabled,
    queryFn: async () => {
      const response = await api.get('/signatures', { params: context });
      return response.data;
    }
  });
};

export const useSetSignatories = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ context, signatoryIds }: { context: ComponentContext; signatoryIds: string[] }) => {
      const response = await api.put('/signatures/signatories', { signatoryIds }, { params: context });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['signature', variables.context] });
    }
  });
};

export const useSignDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (context: ComponentContext) => {
      const response = await api.post('/signatures/sign', {}, { params: context });
      return response.data;
    },
    onSuccess: (_, context) => {
      queryClient.invalidateQueries({ queryKey: ['signature', context] });
    }
  });
};
