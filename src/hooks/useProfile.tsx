import { useState } from 'react';
import { api } from '@/services';
import type { ChangePasswordDto, UpdateProfileDto, User } from '@/globals/types';

export const useProfile = () => {
  const [loading, setLoading] = useState(false);

  const getMyProfile = async (): Promise<User> => {
    const { data } = await api.get<User>('/users/me');
    return data;
  };

  const updateMyProfile = async (dto: UpdateProfileDto): Promise<User> => {
    setLoading(true);
    try {
      const { data } = await api.put<User>('/users/me', dto);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (dto: ChangePasswordDto): Promise<void> => {
    setLoading(true);
    try {
      await api.post('/users/me/change-password', dto);
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (file: File): Promise<User> => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post<User>('/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } finally {
      setLoading(false);
    }
  };

  return { loading, getMyProfile, updateMyProfile, changePassword, updateAvatar };
};
