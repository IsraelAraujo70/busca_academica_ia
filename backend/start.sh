#!/bin/bash

# Instalar dependências
echo "Instalando dependências..."
pip3 install -r requirements.txt

# Aplicar migrações
echo "Aplicando migrações..."
python3 manage.py migrate

# Coletar arquivos estáticos
echo "Coletando arquivos estáticos..."
python3 manage.py collectstatic --noinput

# Iniciar servidor
echo "Iniciando servidor Django..."
python3 manage.py runserver 