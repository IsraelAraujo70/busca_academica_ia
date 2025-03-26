export interface FonteAcademica {
  id: number;
  titulo: string;
  autores: string | null;
  instituicao: string | null;
  ano_publicacao: number | null;
  link: string | null;
  descricao: string | null;
  tipo_acesso: string | null;
}

export interface PesquisaAcademica {
  id: number;
  termo: string;
  data_pesquisa: string;
  fontes: FonteAcademica[];
}

export interface PesquisaInput {
  termo: string;
} 