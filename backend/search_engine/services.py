import os
import json
import time
import logging
import re
import requests
from urllib.parse import urlparse
from openai import OpenAI
from django.conf import settings
from .models import PesquisaAcademica, FonteAcademica

# Configuração de logging
logger = logging.getLogger(__name__)

# Configuração da API OpenAI
client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Lista de domínios acadêmicos confiáveis
DOMINIOS_ACADEMICOS = [
    'scielo', 'pubmed', 'arxiv', 'researchgate', 'academia.edu', 'scholar.google',
    'springer', 'ieee', 'acm.org', 'nature.com', 'science', 'doaj', 'eric.ed.gov',
    'ssrn', 'jstor', 'wiley', 'tandfonline', 'oup.com', 'sage', 'emerald',
    'elsevier', 'biomedcentral', 'frontiersin', 'hindawi', 'mdpi'
]

# Lista de extensões de universidades e institutos
EXTENSOES_ACADEMICAS = [
    '.edu', '.edu.br', '.ac.uk', '.edu.au', '.ca', '.fr', '.de', '.it', '.jp',
    '.ac.', '.uni-', '.usp.br', '.unicamp.br', '.ufrj.br', '.ufmg.br'
]

def validar_link(url):
    """
    Função simplificada para validar se um link tem formato válido.
    
    Args:
        url: A URL a ser validada
        
    Returns:
        Tupla com (boolean indicando se o link é válido, pontuação de confiança)
    """
    if not url or not isinstance(url, str):
        return False, 0
    
    # Verificar formato básico da URL
    try:
        result = urlparse(url)
        url_valida = all([result.scheme, result.netloc])
        return url_valida, 10 if url_valida else 0
    except:
        return False, 0

def pesquisar_web(termo_pesquisa):
    """
    Função que utiliza a ferramenta web_search através do modelo para obter resultados da web.
    
    Args:
        termo_pesquisa: O termo a ser pesquisado
        
    Returns:
        Resultados da pesquisa web formatados e o ID da chamada da ferramenta
    """
    # Construir termos de pesquisa mais gerais, sem restrição a PDFs
    termo_academico = f"{termo_pesquisa} artigos pesquisa estudos informações"
    
    logger.info(f"Iniciando pesquisa web para: {termo_academico}")
    
    try:
        # Solicitação inicial para o modelo para realizar uma pesquisa web
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": """Você é um assistente de pesquisa que ajuda a encontrar informações confiáveis na web.
                    Sua tarefa é buscar conteúdo relevante sobre o tema solicitado.
                    
                    IMPORTANTE:
                    - Priorize links FUNCIONAIS e ACESSÍVEIS acima de tudo
                    - Busque uma diversidade de fontes (artigos, blogs, sites educacionais, etc.)
                    - Inclua links diretos para o conteúdo sempre que possível
                    - Não se restrinja apenas a PDFs ou conteúdo acadêmico
                    
                    O objetivo principal é obter informações úteis e de qualidade, 
                    com links que realmente funcionem e sejam acessíveis ao usuário.
                    """
                },
                {
                    "role": "user",
                    "content": f"Encontre informações relevantes e confiáveis sobre '{termo_pesquisa}'. Inclua fontes diversas como artigos, blogs de especialistas, sites educacionais e vídeos. O mais importante é que os links sejam funcionais e acessíveis."
                }
            ],
            tools=[{
                "type": "function",
                "function": {
                    "name": "web_search",
                    "description": "Pesquisa na web por informações atualizadas sobre qualquer tópico",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "search_term": {
                                "type": "string",
                                "description": "Termo de pesquisa para buscar na web"
                            }
                        },
                        "required": ["search_term"]
                    }
                }
            }],
            tool_choice={"type": "function", "function": {"name": "web_search"}}
        )
        
        # Extrair a chamada da ferramenta
        tool_call = response.choices[0].message.tool_calls[0]
        search_term = json.loads(tool_call.function.arguments)["search_term"]
        tool_call_id = tool_call.id
        
        logger.info(f"Termo de pesquisa web: {search_term}, ID da chamada: {tool_call_id}")
        
        # Realizar a pesquisa web real com foco em links funcionais
        search_results_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": """Você é um assistente de pesquisa que busca conteúdo na web.
                Ao retornar resultados:
                1. Inclua APENAS links reais e funcionais
                2. NÃO invente ou crie URLs fictícios como 'example.org' ou 'article.pdf'
                3. Se não tiver certeza sobre um link, omita-o completamente
                4. Prefira sites conhecidos e confiáveis
                5. Inclua uma breve descrição do conteúdo para cada link
                
                IMPORTANTE: É melhor retornar poucos resultados confiáveis do que muitos links fictícios ou quebrados.
                """},
                {"role": "user", "content": f"Pesquise na web por '{search_term}' e retorne os resultados mais relevantes. Inclua apenas links reais e funcionais de sites conhecidos. Não invente ou crie URLs fictícios."}
            ]
        )
        
        # Obter os resultados da pesquisa
        search_results = search_results_response.choices[0].message.content
        
        if not search_results:
            search_results = f"Nenhum resultado encontrado para '{search_term}'"
        
        logger.info(f"Pesquisa web concluída com sucesso. Resultados obtidos. Tamanho: {len(search_results)} caracteres")
        
        # Salvar resultados em arquivo para debug (apenas em desenvolvimento)
        with open("/tmp/search_results.txt", "w") as f:
            f.write(str(search_results))
        
        return search_results, tool_call_id
    
    except Exception as e:
        logger.error(f"Erro ao realizar pesquisa web: {str(e)}")
        # Em caso de erro, retornar mensagem de erro
        return f"Erro ao realizar pesquisa para: {termo_academico}. Detalhes: {str(e)}", None

def filtrar_fontes_academicas(resultados_pesquisa, termo_pesquisa, tool_call_id):
    """
    Filtra e formata os resultados da pesquisa web para mostrar fontes de informação confiáveis.
    
    Args:
        resultados_pesquisa: Resultados brutos da pesquisa web
        termo_pesquisa: Termo original pesquisado pelo usuário
        tool_call_id: ID da chamada da ferramenta de pesquisa (opcional)
        
    Returns:
        Lista formatada de fontes de informação e o conteúdo bruto da resposta
    """
    logger.info(f"Iniciando filtragem de fontes para: {termo_pesquisa}")
    
    try:
        # Verificar se temos resultados para processar
        if not resultados_pesquisa or resultados_pesquisa.startswith("Erro"):
            logger.warning(f"Sem resultados válidos para processar: {resultados_pesquisa[:100]}...")
            return [], json.dumps({"fontes": []})
        
        # Registrar o início do processamento
        logger.info(f"Processando resultados: {resultados_pesquisa[:200]}...")
        
        # Instruções para análise dos resultados da pesquisa - versão mais flexível
        instrucoes = """
        Você é um assistente de pesquisa que ajuda a extrair fontes úteis e relevantes dos resultados de busca.
        
        EXTRAÇÃO DE RESULTADOS:
        1. Extraia cada fonte de informação mencionada nos resultados (artigos, posts, vídeos, etc)
        2. Foque em identificar corretamente os links para cada fonte
        3. Certifique-se de que os links tenham formato correto e pareçam válidos
        
        CRITÉRIOS DE ACEITAÇÃO:
        - O link deve começar com http:// ou https://
        - Prefira sites conhecidos e populares (Wikipedia, portais de notícias, sites oficiais)
        - Aceite diversos tipos de conteúdo: artigos, blogs, vídeos, tutoriais, documentação, etc
        - É melhor ter menos resultados com links reais do que muitos com links inválidos
        
        PARA CADA FONTE, FORNEÇA:
        - Título: título claro e descritivo do conteúdo
        - Fonte: o site ou plataforma de origem (ex: "Wikipedia", "YouTube", "Medium")
        - Ano: ano de publicação, se disponível (ou null se não for possível determinar)
        - Link: URL completa e direta para o conteúdo
        - Tipo: tipo de conteúdo ("Artigo", "Vídeo", "Tutorial", "Documentação", etc)
        - Descrição: breve resumo do conteúdo (2-3 linhas)
        
        IMPORTANTE: 
        - NÃO INVENTE LINKS. Se não conseguir extrair um link válido, omita o resultado
        - Prefira qualidade sobre quantidade
        - Se não puder determinar alguma informação com certeza, use valores como "Não especificado"
        
        FORMATO DA SAÍDA:
        Você DEVE formatar a saída como JSON com esta estrutura:
        {"fontes": [
            {
                "titulo": "Título do conteúdo",
                "autores": "Autor ou fonte do conteúdo",
                "instituicao": "Site ou plataforma de origem",
                "ano_publicacao": ano (número) ou null,
                "link": "URL completa e direta para o conteúdo",
                "tipo_acesso": "Artigo" ou "Vídeo" ou "Tutorial" ou outro tipo apropriado,
                "descricao": "Breve descrição do conteúdo"
            },
            ...
        ]}
        """
        
        # Processar os resultados com o modelo
        logger.info("Solicitando análise dos resultados para o modelo")
        
        # Criar uma mensagem para o modelo
        resposta_final = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": instrucoes},
                {"role": "user", "content": f"""Analise estes resultados de pesquisa sobre '{termo_pesquisa}' 
                e extraia as fontes de informação relevantes com links válidos.
                
                RESULTADOS A ANALISAR:
                {resultados_pesquisa}
                
                Formate a saída em JSON conforme instruído.
                LEMBRE-SE: APENAS links reais e válidos. NÃO inclua URLs fictícios ou que pareçam inventados."""}
            ],
            response_format={"type": "json_object"}
        )
        
        conteudo = resposta_final.choices[0].message.content
        logger.info(f"Resposta da análise recebida. Tamanho: {len(conteudo)} caracteres")
        
        # Salvar resposta completa para debug (apenas em desenvolvimento)
        with open("/tmp/processed_sources.json", "w") as f:
            f.write(conteudo)
        
        # Extrair fontes do JSON
        try:
            dados_json = json.loads(conteudo)
            if not isinstance(dados_json, dict):
                logger.error(f"Resposta não é um dicionário: {type(dados_json)}")
                fontes = []
            else:
                fontes_brutas = dados_json.get('fontes', [])
                logger.info(f"Fontes extraídas do JSON: {len(fontes_brutas)}")
                
                if not fontes_brutas:
                    logger.warning("Nenhuma fonte encontrada no JSON")
                
                # Validação básica das fontes - versão mais permissiva
                fontes_validadas = []
                for fonte in fontes_brutas:
                    # Validar link (verificação mínima)
                    link = fonte.get('link', '')
                    
                    # Verificação mínima - apenas confirma que é uma URL válida
                    if link and isinstance(link, str) and link.startswith(('http://', 'https://')):
                        # Link parece válido, adicionar à lista
                        fontes_validadas.append(fonte)
                    else:
                        logger.warning(f"Link descartado por parecer inválido: {link}")
                
                fontes = fontes_validadas
                
        except json.JSONDecodeError as e:
            logger.error(f"Erro ao decodificar JSON: {str(e)} - Conteúdo: {conteudo[:200]}...")
            # Se não for possível decodificar como JSON, tratar como texto
            fontes = []
        
        logger.info(f"Total de fontes válidas após filtragem: {len(fontes)}")
        return fontes, conteudo
    
    except Exception as e:
        logger.error(f"Erro ao filtrar fontes: {str(e)}")
        # Retornar lista vazia em caso de erro
        return [], json.dumps({"fontes": []})

def verificar_acessibilidade_url(url, timeout=3, verificar_pdf=False):
    """
    Verifica se uma URL está acessível e é um recurso válido.
    
    Args:
        url: URL a ser verificada
        timeout: Tempo limite para a requisição em segundos
        verificar_pdf: Se True, verifica se o conteúdo é um PDF
        
    Returns:
        Tupla com (booleano indicando se a URL é acessível, informações adicionais)
    """
    if not url or not isinstance(url, str) or not url.startswith(('http://', 'https://')):
        return False, {"erro": "URL inválida", "tipo": None}
    
    try:
        # Configuração do cabeçalho da requisição
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml,application/pdf;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Connection': 'keep-alive',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
        }
        
        # Primeiro tenta com HEAD para economizar tráfego
        response = requests.head(url, timeout=timeout, headers=headers, allow_redirects=True)
        content_type = response.headers.get('Content-Type', '').lower()
        
        # Se for um PDF e quisermos verificar isso
        if verificar_pdf and 'application/pdf' in content_type:
            return True, {"tipo": "pdf", "content_type": content_type}
        
        # Se não for um PDF ou não obtivemos o Content-Type com HEAD, tenta GET
        if response.status_code != 200 or verificar_pdf or 'text/html' in content_type:
            # Tentativa com GET para obter mais informações
            response = requests.get(url, timeout=timeout, headers=headers, stream=True)
            # Lê apenas os primeiros bytes para verificar o tipo de conteúdo
            content_peek = next(response.iter_content(1024), b'')
            response.close()
            
            # Verifica se é um PDF pelo início do conteúdo
            if verificar_pdf and content_peek.startswith(b'%PDF-'):
                return True, {"tipo": "pdf", "detalhes": "Conteúdo inicia com assinatura PDF"}
        
        return response.status_code == 200, {
            "status_code": response.status_code,
            "content_type": content_type,
            "url_final": response.url  # URL após redirecionamentos
        }
    
    except requests.RequestException as e:
        logger.warning(f"Erro ao verificar URL {url}: {str(e)}")
        return False, {"erro": str(e), "tipo": type(e).__name__}
    
    except Exception as e:
        logger.error(f"Erro inesperado ao verificar URL {url}: {str(e)}")
        return False, {"erro": str(e), "tipo": "erro_desconhecido"}

def realizar_busca_academica(termo):
    """
    Função principal que realiza todo o processo de busca acadêmica.
    
    Args:
        termo: O tema a ser pesquisado
        
    Returns:
        Objeto de pesquisa acadêmica com as fontes encontradas
    """
    logger.info(f"Iniciando busca para o termo: {termo}")
    
    # Salvar a pesquisa no banco de dados
    pesquisa = PesquisaAcademica.objects.create(termo=termo)
    logger.info(f"Pesquisa criada com ID: {pesquisa.id}")
    
    try:
        # Etapa 1: Pesquisar na web
        resultados_web, tool_call_id = pesquisar_web(termo)
        
        # Etapa 2: Filtrar e formatar fontes
        fontes_list, conteudo_bruto = filtrar_fontes_academicas(resultados_web, termo, tool_call_id)
        
        logger.info(f"Fontes encontradas: {len(fontes_list)}")
        
        # Salvar as fontes no banco de dados
        for i, fonte_data in enumerate(fontes_list):
            try:
                # Converter ano_publicacao para inteiro se existir
                ano = fonte_data.get('ano_publicacao')
                if ano and not isinstance(ano, int):
                    try:
                        ano = int(ano)
                    except (ValueError, TypeError):
                        ano = None
                
                # Extrair o tipo de acesso, com valor padrão mais simples
                tipo_acesso = fonte_data.get('tipo_acesso', 'Informação online')
                
                # Criar o objeto no banco de dados sem validação extensiva
                fonte = FonteAcademica.objects.create(
                    pesquisa=pesquisa,
                    titulo=fonte_data.get('titulo', f'Fonte {i+1}'),
                    autores=fonte_data.get('autores'),
                    instituicao=fonte_data.get('instituicao'),
                    ano_publicacao=ano,
                    link=fonte_data.get('link'),
                    descricao=fonte_data.get('descricao'),
                    tipo_acesso=tipo_acesso
                )
                logger.info(f"Fonte criada: {fonte.id} - {fonte.titulo}")
            except Exception as e:
                logger.error(f"Erro ao salvar fonte: {str(e)} - Dados: {fonte_data}")
        
        return pesquisa
        
    except Exception as e:
        logger.error(f"Erro ao realizar busca acadêmica: {str(e)}")
        # Em caso de erro, ainda retornamos a pesquisa, mas sem fontes
        return pesquisa 