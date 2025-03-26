import React, { useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress, Paper, Fade } from '@mui/material';
import { motion } from 'framer-motion';
import { Search, AlertCircle } from 'lucide-react';
import { pesquisarAcademico } from '../services/api';
import { PesquisaAcademica } from '../types';

interface PesquisaFormProps {
  onPesquisaRealizada: (pesquisa: PesquisaAcademica) => void;
}

const PesquisaForm: React.FC<PesquisaFormProps> = ({ onPesquisaRealizada }) => {
  const [termo, setTermo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (termo.trim().length < 3) {
      setErro('O termo de pesquisa deve ter pelo menos 3 caracteres.');
      return;
    }
    
    setErro(null);
    setCarregando(true);
    
    try {
      const resultado = await pesquisarAcademico({ termo });
      onPesquisaRealizada(resultado);
    } catch (error: any) {
      setErro(error.response?.data?.termo?.[0] || 'Erro ao realizar pesquisa. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 3, 
          background: 'linear-gradient(145deg, rgba(40,40,45,0.9) 0%, rgba(25,25,30,0.9) 100%)',
          backdropFilter: 'blur(10px)',
          width: '100%', 
          maxWidth: 800, 
          mx: 'auto', 
          mb: 4 
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            mb: 3,
            textAlign: 'center',
            background: 'linear-gradient(90deg, #3a86ff, #ff006e)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Busca Acadêmica
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              label="Digite seu termo de pesquisa"
              variant="outlined"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              error={!!erro}
              helperText={erro ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AlertCircle size={16} />
                  <span>{erro}</span>
                </Box>
              ) : null}
              disabled={carregando}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease'
                },
                '& .MuiOutlinedInput-root.Mui-focused': {
                  boxShadow: '0 0 0 2px rgba(58, 134, 255, 0.25)'
                }
              }}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={carregando}
                sx={{ 
                  height: 56, 
                  px: 3,
                  boxShadow: '0 4px 14px 0 rgba(58, 134, 255, 0.3)' 
                }}
                startIcon={carregando ? <CircularProgress size={20} color="inherit" /> : <Search size={20} />}
              >
                {carregando ? 'Pesquisando...' : 'Pesquisar'}
              </Button>
            </motion.div>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default PesquisaForm; 