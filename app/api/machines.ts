import axios from './axios';
import { CreateMachineDto, ReadMachineDto } from './generated';

export interface EditMachineDto extends Partial<CreateMachineDto> {}

export const machinesApi = {
  get: async (id: string) => {
    const response = await axios.get<ReadMachineDto>(`/machines/${id}`);
    return response.data;
  },

  getAll: async (userId: string) => {
    const response = await axios.get<ReadMachineDto[]>(`/machines/many/${userId}`);
    return response.data;
  },

  create: async (shot: CreateMachineDto) => {
    console.log("CREATE: ", shot)
    const response = await axios.post<ReadMachineDto>('/machines', shot);
    return response.data;
  },

  edit: async (id: string, shot: EditMachineDto) => {
    const response = await axios.patch<ReadMachineDto>(`/machines/one/${id}`, shot);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete<ReadMachineDto>(`/machines/${id}`);
    return response.data;
  }
};
