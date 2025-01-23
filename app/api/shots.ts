import axios from './axios';
import { ReadShotDto, CreateShotDto } from './generated';

export interface EditShotDto extends Partial<CreateShotDto> {}

export const shotsApi = {
  get: async (id: string) => {
    const response = await axios.get<ReadShotDto>(`/shots/${id}`);
    return response.data;
  },

  getAll: async (userId: string) => {
    const response = await axios.get<ReadShotDto[]>(`/shots/many/${userId}`);
    return response.data;
  },

  create: async (shot: CreateShotDto) => {
    const response = await axios.post<ReadShotDto>('/shots/one', shot);
    return response.data;
  },

  edit: async (id: string, shot: EditShotDto) => {
    const response = await axios.patch<ReadShotDto>(`/shots/one/${id}`, shot);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete<ReadShotDto>(`/shots/${id}`);
    return response.data;
  }
};
