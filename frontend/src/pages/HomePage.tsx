import React, { useState } from 'react';
import PesquisaForm from '../components/PesquisaForm';
import ResultadoPesquisa from '../components/ResultadoPesquisa';
import { PesquisaAcademica } from '../types';

const HomePage: React.FC = () => {
  const [pesquisaAtual, setPesquisaAtual] = useState<PesquisaAcademica | null>(null);

  const handlePesquisaRealizada = (pesquisa: PesquisaAcademica) => {
    setPesquisaAtual(pesquisa);
  };

  return (
    <>
      <PesquisaForm onPesquisaRealizada={handlePesquisaRealizada} />
      <ResultadoPesquisa pesquisa={pesquisaAtual} />
    </>
  );
};

export default HomePage; 