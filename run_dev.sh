#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para encerrar processos ao terminar o script
cleanup() {
  echo -e "${YELLOW}Encerrando processos...${NC}"
  
  if [ ! -z "$BACKEND_PID" ]; then
    echo -e "${YELLOW}Encerrando o servidor Django (PID: $BACKEND_PID)...${NC}"
    kill $BACKEND_PID 2>/dev/null
  fi
  
  if [ ! -z "$FRONTEND_PID" ]; then
    echo -e "${YELLOW}Encerrando o servidor React (PID: $FRONTEND_PID)...${NC}"
    kill $FRONTEND_PID 2>/dev/null
  fi
  
  echo -e "${GREEN}Todos os processos encerrados. Até logo!${NC}"
  exit 0
}

# Configurar para executar cleanup quando o script for encerrado
trap cleanup SIGINT SIGTERM EXIT

# Verificar se o diretório do backend existe
if [ ! -d "backend" ]; then
  echo -e "${RED}Erro: O diretório 'backend' não foi encontrado!${NC}"
  exit 1
fi

# Verificar se o diretório do frontend existe
if [ ! -d "frontend" ]; then
  echo -e "${RED}Erro: O diretório 'frontend' não foi encontrado!${NC}"
  exit 1
fi

# Iniciar o backend
echo -e "${YELLOW}Iniciando o servidor Django...${NC}"
cd backend
python3 manage.py runserver 8000 &
BACKEND_PID=$!

# Aguardar um pouco para o backend iniciar
sleep 2

# Verificar se o backend iniciou com sucesso
if ! ps -p $BACKEND_PID > /dev/null; then
  echo -e "${RED}Erro ao iniciar o servidor Django!${NC}"
  exit 1
fi

echo -e "${GREEN}Servidor Django rodando em http://localhost:8000 (PID: $BACKEND_PID)${NC}"

# Voltar para o diretório raiz e iniciar o frontend
cd ../frontend
echo -e "${YELLOW}Iniciando o servidor React...${NC}"
npm start &
FRONTEND_PID=$!

# Aguardar um pouco para o frontend iniciar
sleep 5

# Verificar se o frontend iniciou com sucesso
if ! ps -p $FRONTEND_PID > /dev/null; then
  echo -e "${RED}Erro ao iniciar o servidor React!${NC}"
  exit 1
fi

echo -e "${GREEN}Servidor React rodando em http://localhost:3000 (PID: $FRONTEND_PID)${NC}"

echo -e "${GREEN}Ambiente de desenvolvimento rodando com sucesso!${NC}"
echo -e "${YELLOW}Pressione Ctrl+C para encerrar ambos os servidores.${NC}"

# Manter o script rodando
wait 