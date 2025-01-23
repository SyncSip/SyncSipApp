import axios from './axios';
import { ReadGrinderDto, CreateGrinderDto } from './generated';

export interface EditSGrinderDto extends Partial<CreateGrinderDto> {}

export const grindersApi = {
  get: async (id: string) => {
    const response = await axios.get<ReadGrinderDto>(`/grinders/${id}`);
    return response.data;
  },

  getAll: async (userId: string) => {
    const response = await axios.get<ReadGrinderDto[]>(`/grinders/many/${userId}`);
    return response.data;
  },

  create: async (shot: CreateGrinderDto) => {
    const response = await axios.post<ReadGrinderDto>('/grinders/one', shot);
    return response.data;
  },

  edit: async (id: string, shot: EditSGrinderDto) => {
    const response = await axios.patch<ReadGrinderDto>(`/grinders/one/${id}`, shot);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete<ReadGrinderDto>(`/grinders/${id}`);
    return response.data;
  }
};
