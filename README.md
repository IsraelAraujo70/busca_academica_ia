# Motor de Busca Acadêmica

Um aplicativo web para busca de artigos científicos e fontes acadêmicas confiáveis, utilizando integração com processamento de linguagem natural avançado.

## Estrutura do Projeto

O projeto consiste em duas partes principais:

- **Backend**: API REST desenvolvida com Django, responsável pelo processamento das pesquisas e integração com a API da OpenAI
- **Frontend**: Interface de usuário desenvolvida com Next.js, TypeScript e Tailwind CSS

## Recursos

- Pesquisa de conteúdo acadêmico com resultados de alta qualidade
- Filtragem de fontes acadêmicas confiáveis
- Interface de usuário moderna e responsiva
- Histórico de pesquisas realizadas
- API REST para integração com outros sistemas

## Pré-requisitos

- Python 3.8+
- Node.js 18+
- Pip (gerenciador de pacotes Python)
- NPM (gerenciador de pacotes Node.js)

## Instalação

### Backend

```bash
# Navegar para o diretório do backend
cd backend

# Instalar dependências
pip install -r requirements.txt

# Executar migrações
python manage.py migrate

# Iniciar o servidor
python manage.py runserver
```

O backend estará disponível em http://localhost:8000

### Frontend

```bash
# Navegar para o diretório do frontend
cd frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em http://localhost:3000

## Execução Simplificada

Para iniciar tanto o backend quanto o frontend com um único comando, use:

```bash
# Tornar o script executável (apenas na primeira vez)
chmod +x run_dev.sh

# Executar o ambiente de desenvolvimento
./run_dev.sh
```

## Tecnologias

### Backend
- Django
- Django REST Framework
- OpenAI API
- SQLite (desenvolvimento) / PostgreSQL (produção)

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Heroicons 