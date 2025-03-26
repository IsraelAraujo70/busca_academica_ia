import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button, IconButton, Tooltip } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Search, History, Github, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

// Componente de animação que envolve outros componentes
const MotionContainer = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'background.paper', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Coffee size={24} /> Busca Acadêmica
          </Typography>
          
          <Button 
            component={RouterLink}
            to="/"
            color="inherit"
            sx={{ 
              mx: 1,
              fontWeight: location.pathname === '/' ? 'bold' : 'normal',
              borderBottom: location.pathname === '/' ? '2px solid' : 'none',
              borderRadius: 0,
              py: 1
            }}
            startIcon={<Search size={18} />}
          >
            Pesquisar
          </Button>
          
          <Button 
            component={RouterLink}
            to="/historico"
            color="inherit"
            sx={{ 
              mx: 1,
              fontWeight: location.pathname === '/historico' ? 'bold' : 'normal',
              borderBottom: location.pathname === '/historico' ? '2px solid' : 'none',
              borderRadius: 0,
              py: 1
            }}
            startIcon={<History size={18} />}
          >
            Histórico
          </Button>
          
          <Tooltip title="GitHub">
            <IconButton 
              color="inherit" 
              component="a" 
              href="https://github.com/IsraelAraujo70/busca_academica_ia" 
              target="_blank"
              sx={{ ml: 1 }}
            >
              <Github size={20} />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <MotionContainer>
          {children}
        </MotionContainer>
      </Container>
      
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          bgcolor: 'background.paper', 
          mt: 'auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            Motor de Busca Acadêmico © {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 