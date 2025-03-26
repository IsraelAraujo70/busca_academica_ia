import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Divider,
  Grid,
  Alert,
  Paper,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Users, 
  Building, 
  Calendar, 
  ExternalLink, 
  BookOpen,
  AlertCircle,
  Download,
  File,
  FileDigit,
  BookText,
  Archive,
  Globe,
  Info
} from 'lucide-react';
import { PesquisaAcademica, FonteAcademica } from '../types';

interface ResultadoPesquisaProps {
  pesquisa?: PesquisaAcademica | null;
}

const ResultadoPesquisa: React.FC<ResultadoPesquisaProps> = ({ pesquisa: pesquisaProp }) => {
  const { id } = useParams<{ id: string }>();
  const [pesquisaData, setPesquisaData] = useState<PesquisaAcademica | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Se recebemos a pesquisa como prop, usamos ela diretamente
  const pesquisa = pesquisaProp || pesquisaData;

  useEffect(() => {
    // Se recebemos a pesquisa como prop, não precisamos fazer o fetch
    if (pesquisaProp) {
      setLoading(false);
      return;
    }
    
    // Se não temos ID nem prop, não há o que buscar
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchPesquisa = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/pesquisas/${id}/`);
        if (!response.ok) {
          throw new Error('Erro ao buscar resultados');
        }
        const data = await response.json();
        setPesquisaData(data);
      } catch (err) {
        setError('Ocorreu um erro ao buscar os resultados da pesquisa');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPesquisa();
  }, [id, pesquisaProp]);

  // Função para determinar o ícone e cor com base no tipo de acesso
  const getTipoAcessoInfo = (tipoAcesso: string | null | undefined) => {
    if (!tipoAcesso) return { icon: <File size={20} />, color: '#888', label: 'Não especificado' };
    
    const tipoLower = tipoAcesso.toLowerCase();
    if (tipoLower.includes('pdf')) {
      return { icon: <FileDigit size={20} />, color: '#ff5252', label: 'PDF disponível' };
    } else if (tipoLower.includes('artigo')) {
      return { icon: <BookText size={20} />, color: '#2e7d32', label: 'Artigo' };
    } else if (tipoLower.includes('blog') || tipoLower.includes('texto')) {
      return { icon: <Globe size={20} />, color: '#1976d2', label: tipoAcesso };
    } else if (tipoLower.includes('tutorial') || tipoLower.includes('guia')) {
      return { icon: <Info size={20} />, color: '#f57c00', label: tipoAcesso };
    }
    
    return { icon: <FileText size={20} />, color: '#1976d2', label: tipoAcesso };
  };

  // Função para verificar se o link é provavelmente um PDF
  const isPdfLink = (link: string | null | undefined) => {
    if (!link) return false;
    return link.toLowerCase().endsWith('.pdf') || 
          link.toLowerCase().includes('/pdf/') || 
          link.toLowerCase().includes('pdf=') ||
          link.toLowerCase().includes('type=pdf');
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '800px' }}>
          <Box sx={{ height: '32px', bgcolor: 'rgba(200,200,200,0.2)', borderRadius: 1, width: '75%', mb: 3 }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <Box key={i} sx={{ mb: 3 }}>
              <Box sx={{ height: '24px', bgcolor: 'rgba(200,200,200,0.2)', borderRadius: 1, width: '50%', mb: 1.5 }} />
              <Box sx={{ height: '16px', bgcolor: 'rgba(200,200,200,0.1)', borderRadius: 1, width: '100%', mb: 1 }} />
              <Box sx={{ height: '16px', bgcolor: 'rgba(200,200,200,0.1)', borderRadius: 1, width: '83%' }} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" sx={{ mb: 2 }}>
          Erro
        </Typography>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (!pesquisa) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Nenhum resultado encontrado
        </Typography>
        <Typography>A pesquisa não foi encontrada ou não possui resultados.</Typography>
      </Box>
    );
  }

  // Variantes para animação
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mt: 4, 
        width: '100%', 
        maxWidth: 800, 
        mx: 'auto',
        p: 3,
        borderRadius: 3,
        background: 'rgba(30,30,30,0.5)'
      }}
    >
      <Box sx={{ mb: 3 }}>
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
          <BookOpen size={24} />
          Resultados para: <span style={{ fontStyle: 'italic' }}>"{pesquisa.termo}"</span>
        </Typography>
      </Box>

      {pesquisa.fontes.length === 0 ? (
        <Alert 
          severity="info" 
          icon={<AlertCircle size={24} />} 
          sx={{ 
            mt: 2,
            borderRadius: 2,
            bgcolor: 'rgba(30, 136, 229, 0.15)'
          }}
        >
          Nenhum resultado acadêmico encontrado para essa pesquisa. Isso pode ocorrer devido a limitações da API OpenAI ou porque o termo não retornou resultados acadêmicos.
        </Alert>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {pesquisa.fontes.map((fonte, index) => {
            const tipoAcessoInfo = getTipoAcessoInfo(fonte.tipo_acesso);
            const ehPdf = isPdfLink(fonte.link);
            
            return (
              <motion.div key={fonte.id || index} variants={itemVariants}>
                <Card 
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    overflow: 'hidden',
                    background: 'linear-gradient(145deg, rgba(40,40,45,0.9) 0%, rgba(30,30,35,0.9) 100%)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    borderLeft: `4px solid ${tipoAcessoInfo.color}`,
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        gutterBottom
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          mb: 0
                        }}
                      >
                        <FileText size={20} color="#3a86ff" />
                        {fonte.titulo}
                      </Typography>
                      
                      <Chip
                        icon={tipoAcessoInfo.icon}
                        label={tipoAcessoInfo.label}
                        size="small"
                        sx={{ 
                          bgcolor: `${tipoAcessoInfo.color}22`,
                          color: tipoAcessoInfo.color,
                          fontWeight: 'medium',
                          border: `1px solid ${tipoAcessoInfo.color}44`
                        }}
                      />
                    </Box>
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {fonte.autores && (
                        <Grid item xs={12} sm={6}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1 
                            }}
                          >
                            <Users size={16} />
                            <strong>Autores:</strong> {fonte.autores}
                          </Typography>
                        </Grid>
                      )}
                      
                      {fonte.instituicao && (
                        <Grid item xs={12} sm={6}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1 
                            }}
                          >
                            <Building size={16} />
                            <strong>Instituição:</strong> {fonte.instituicao}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                    
                    {fonte.descricao && (
                      <>
                        <Typography variant="body2" paragraph>
                          {fonte.descricao}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                      </>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {fonte.ano_publicacao && (
                          <Chip 
                            icon={<Calendar size={14} />}
                            label={`Publicado em ${fonte.ano_publicacao}`} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            sx={{ borderRadius: '16px' }}
                          />
                        )}
                      </Box>
                      
                      {fonte.link && (
                        <Button
                          variant="contained"
                          color={ehPdf ? "error" : "primary"}
                          size="small"
                          href={fonte.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={ehPdf ? <FileDigit size={16} /> : <ExternalLink size={16} />}
                          endIcon={ehPdf && <Download size={14} />}
                          sx={{ 
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 'medium',
                            boxShadow: ehPdf ? '0 4px 14px 0 rgba(244, 67, 54, 0.3)' : '0 4px 14px 0 rgba(58, 134, 255, 0.3)'
                          }}
                        >
                          {ehPdf ? 'Baixar PDF' : 'Acessar fonte'}
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </Paper>
  );
};

export default ResultadoPesquisa; 