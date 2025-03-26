import axios from 'axios';
import { PesquisaAcademica, PesquisaInput } from '../types';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const pesquisarAcademico = async (input: PesquisaInput): Promise<PesquisaAcademica> => {
  try {
    const response = await api.post('/pesquisa/', input);
    return response.data;
  } catch (error) {
    console.error('Erro ao realizar pesquisa:', error);
    throw error;
  }
};

export const obterHistorico = async (): Promise<PesquisaAcademica[]> => {
  try {
    const response = await api.get('/historico/');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    throw error;
  }
};

export default api; 