import axios from './axios';
import { ReadBeanDto, CreateBeanDto } from './generated';

export interface EditBeanDto extends Partial<CreateBeanDto> {}

export const beansApi = {
  get: async (id: string) => {
    const response = await axios.get<ReadBeanDto>(`/beans/${id}`);
    return response.data;
  },

  getAll: async (userId: string) => {
    const response = await axios.get<ReadBeanDto[]>(`/beans/many/${userId}`);
    return response.data;
  },

  create: async (shot: CreateBeanDto) => {
    const response = await axios.post<ReadBeanDto>('/beans', shot);
    return response.data;
  },

  edit: async (id: string, shot: EditBeanDto) => {
    const response = await axios.patch<ReadBeanDto>(`/beans/one/${id}`, shot);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete<ReadBeanDto>(`/beans/${id}`);
    return response.data;
  }
};
