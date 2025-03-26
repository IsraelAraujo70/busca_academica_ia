import React, { useState } from 'react';
import Historico from '../components/Historico';
import ResultadoPesquisa from '../components/ResultadoPesquisa';
import { PesquisaAcademica } from '../types';
import { Grid, Box, Paper, Typography } from '@mui/material';
import { Search } from 'lucide-react';

const HistoricoPage: React.FC = () => {
  const [pesquisaSelecionada, setPesquisaSelecionada] = useState<PesquisaAcademica | null>(null);

  const handlePesquisaSelecionada = (pesquisa: PesquisaAcademica) => {
    setPesquisaSelecionada(pesquisa);
  };

  return (
    <Box sx={{ p: 2, width: '100%', maxWidth: '1400px', mx: 'auto' }}>
      <Grid container spacing={3}>
        {/* Coluna da esquerda - Resultados da pesquisa */}
        <Grid item xs={12} md={8}>
          {pesquisaSelecionada ? (
            <ResultadoPesquisa pesquisa={pesquisaSelecionada} />
          ) : (
            <Paper 
              sx={{ 
                height: '100%', 
                minHeight: '300px',
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center',
                p: 3,
                borderRadius: 3,
                background: 'rgba(30,30,30,0.5)'
              }}
            >
              <Search size={40} color="#3a86ff" opacity={0.7} />
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ mt: 2, textAlign: 'center' }}
              >
                Selecione uma pesquisa do histórico para visualizar os resultados
              </Typography>
            </Paper>
          )}
        </Grid>

        {/* Coluna da direita - Histórico */}
        <Grid item xs={12} md={4}>
          <Historico onPesquisaSelecionada={handlePesquisaSelecionada} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default HistoricoPage; 