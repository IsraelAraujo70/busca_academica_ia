# Motor de Busca Acadêmica - Backend

Este é o backend de um motor de busca acadêmica construído com Django e OpenAI, que permite encontrar estudos e artigos científicos sobre diversos temas.

## Características

- API REST para pesquisa de conteúdo acadêmico
- Utiliza a API da OpenAI para processamento de linguagem natural
- Armazenamento de histórico de pesquisas
- Interface web integrada para buscas

## Requisitos

- Python 3.8+
- pip (gerenciador de pacotes Python)

## Configuração do Ambiente

1. Clone o repositório
2. Configure o arquivo `.env` com suas credenciais (já existe um arquivo de exemplo)

## Executando o Servidor

### Método 1: Usando o script de inicialização

```bash
# Na pasta backend
./start.sh
```

### Método 2: Executando os comandos manualmente

```bash
# Na pasta backend
pip3 install -r requirements.txt
python3 manage.py migrate
python3 manage.py collectstatic --noinput
python3 manage.py runserver
```

O servidor estará disponível em http://127.0.0.1:8000

## Executando com Docker (Opcional)

Se você tiver Docker instalado e configurado corretamente:

```bash
# Na pasta backend
docker-compose up --build
```

## Endpoints da API

- `GET /api/` - Página inicial da aplicação
- `POST /api/pesquisa/` - Realizar uma nova pesquisa acadêmica
  - Corpo da requisição: `{"termo": "seu termo de pesquisa"}`
- `GET /api/historico/` - Obter histórico de pesquisas

## Desenvolvimento

### Estrutura do Projeto

```
backend/
├── config/              # Configurações do projeto Django
├── search_engine/       # Aplicativo principal
│   ├── migrations/      # Migrações do banco de dados
│   ├── templates/       # Templates HTML
│   ├── models.py        # Modelos de dados
│   ├── services.py      # Lógica de negócios
│   ├── views.py         # Views da API
│   └── urls.py          # Configuração de rotas
├── .env                 # Variáveis de ambiente
├── Dockerfile           # Configuração do Docker
├── docker-compose.yml   # Configuração do Docker Compose
├── manage.py            # Script de gerenciamento do Django
├── start.sh             # Script de inicialização rápida
└── requirements.txt     # Dependências do projeto
```

## Licença

Este projeto está licenciado sob a licença MIT. 