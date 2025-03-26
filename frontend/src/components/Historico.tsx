import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton,
  Card, 
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Badge
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  History, 
  RefreshCw, 
  Clock, 
  Search, 
  AlertTriangle, 
  Info,
  FileSearch
} from 'lucide-react';
import { obterHistorico } from '../services/api';
import { PesquisaAcademica } from '../types';

interface HistoricoProps {
  onPesquisaSelecionada: (pesquisa: PesquisaAcademica) => void;
}

// Animações
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  }
};

const Historico: React.FC<HistoricoProps> = ({ onPesquisaSelecionada }) => {
  const [historico, setHistorico] = useState<PesquisaAcademica[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await obterHistorico();
      setHistorico(dados);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setErro('Não foi possível carregar o histórico de pesquisas. Tente novamente mais tarde.');
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', gap: 2 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <History size={40} color="#3a86ff" />
        </motion.div>
        <Typography color="text.secondary">Carregando histórico...</Typography>
      </Box>
    );
  }

  if (erro) {
    return (
      <Paper sx={{ width: '100%', p: 3, borderRadius: 3, height: '100%', background: 'rgba(30,30,30,0.5)' }}>
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: 'primary.main'
          }}
        >
          <History size={24} />
          Histórico de Pesquisas
        </Typography>
        
        <Alert 
          severity="error" 
          icon={<AlertTriangle size={24} />}
          sx={{ 
            mt: 2, 
            borderRadius: 2,
            bgcolor: 'rgba(211, 47, 47, 0.15)'
          }}
        >
          {erro}
        </Alert>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outlined" 
              onClick={carregarHistorico}
              startIcon={<RefreshCw size={18} />}
              sx={{ borderRadius: 8 }}
            >
              Tentar novamente
            </Button>
          </motion.div>
        </Box>
      </Paper>
    );
  }

  if (historico.length === 0) {
    return (
      <Paper sx={{ width: '100%', p: 3, borderRadius: 3, height: '100%', background: 'rgba(30,30,30,0.5)' }}>
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: 'primary.main'
          }}
        >
          <History size={24} />
          Histórico de Pesquisas
        </Typography>
        
        <Alert 
          severity="info" 
          icon={<Info size={24} />}
          sx={{ 
            mt: 2, 
            borderRadius: 2,
            bgcolor: 'rgba(30, 136, 229, 0.15)'
          }}
        >
          Nenhuma pesquisa realizada ainda.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{ 
        width: '100%',
        p: 3, 
        borderRadius: 3,
        background: 'rgba(30,30,30,0.5)',
        height: '100%',
        maxHeight: '85vh',
        overflow: 'auto'
      }}
    >
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: 'primary.main'
        }}
      >
        <History size={24} />
        Histórico de Pesquisas
      </Typography>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
          <List sx={{ p: 0 }}>
            {historico.map((pesquisa, index) => {
              const dataFormatada = new Date(pesquisa.data_pesquisa).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              
              return (
                <motion.div key={pesquisa.id} variants={itemVariants}>
                  <ListItem 
                    divider={index !== historico.length - 1} 
                    disablePadding
                    sx={{ 
                      '&:hover': { 
                        bgcolor: 'rgba(58, 134, 255, 0.08)' 
                      }
                    }}
                  >
                    <ListItemButton 
                      onClick={() => onPesquisaSelecionada(pesquisa)}
                      sx={{ py: 2 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <FileSearch size={20} color="#3a86ff" />
                      </Box>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {pesquisa.termo}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Clock size={14} />
                            <Typography variant="body2" color="text.secondary" component="span">
                              {dataFormatada}
                            </Typography>
                            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                            <Badge 
                              badgeContent={pesquisa.fontes.length} 
                              color="primary"
                              sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem', height: '16px', minWidth: '16px' } }}
                            >
                              <Search size={14} />
                            </Badge>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                </motion.div>
              );
            })}
          </List>
        </Card>
      </motion.div>
    </Paper>
  );
};

export default Historico; 