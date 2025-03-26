import os
from openai import OpenAI
import time
import sys
import json
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Configuração da API OpenAI
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("Chave da API OpenAI não encontrada. Verifique o arquivo .env.")

client = OpenAI(api_key=api_key)

def pesquisar_web(termo_pesquisa):
    """
    Função que utiliza a ferramenta web_search através do modelo para obter resultados da web.
    
    Args:
        termo_pesquisa: O termo a ser pesquisado
        
    Returns:
        Resultados da pesquisa web formatados
    """
    # Construir termos de pesquisa acadêmicos
    termo_academico = f"{termo_pesquisa} artigos científicos estudos acadêmicos pesquisa"
    
    try:
        # Simular animação de carregamento
        print("Consultando a web", end="")
        for _ in range(3):
            time.sleep(0.5)
            print(".", end="", flush=True)
        print("\n")
        
        # Solicitação inicial para o modelo para realizar uma pesquisa web
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Você é um assistente de pesquisa acadêmica. Use a ferramenta web_search para encontrar artigos científicos e estudos acadêmicos sobre o tema solicitado. Priorize fontes acadêmicas confiáveis."
                },
                {
                    "role": "user",
                    "content": f"Encontre estudos acadêmicos, artigos científicos e publicações confiáveis sobre: {termo_academico}"
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
        
        # Em um ambiente real, usaríamos uma API de busca aqui
        # Simular o retorno da pesquisa web
        print(f"Pesquisando: {search_term}")
        
        # Simular o resultado da pesquisa web
        search_results = f"Resultados da pesquisa web para: {search_term}"
        
        return search_results, tool_call.id
    
    except Exception as e:
        print(f"Erro ao realizar pesquisa web: {str(e)}")
        return f"Erro na pesquisa: {str(e)}", None

def filtrar_fontes_academicas(resultados_pesquisa, termo_pesquisa, tool_call_id):
    """
    Filtra e formata os resultados da pesquisa web para mostrar apenas fontes acadêmicas confiáveis.
    
    Args:
        resultados_pesquisa: Resultados brutos da pesquisa web
        termo_pesquisa: Termo original pesquisado pelo usuário
        tool_call_id: ID da chamada da ferramenta de pesquisa
        
    Returns:
        Lista formatada de fontes acadêmicas
    """
    try:
        # Simular processamento
        print("Filtrando fontes acadêmicas confiáveis", end="")
        for _ in range(3):
            time.sleep(0.5)
            print(".", end="", flush=True)
        print("\n")
        
        # Instruções para o modelo processar e filtrar os resultados
        instrucoes = """
        Você é um assistente especializado em pesquisa acadêmica. Sua tarefa é analisar os resultados da pesquisa web e extrair apenas fontes acadêmicas confiáveis.
        
        Regras para seleção:
        1. Priorize artigos científicos, estudos peer-reviewed e publicações de instituições reconhecidas
        2. Inclua apenas fontes como:
           - Revistas científicas indexadas (journals)
           - Repositórios acadêmicos (SciELO, PubMed, etc.)
           - Publicações de universidades e institutos de pesquisa
           - Artigos de órgãos governamentais de pesquisa
           - Teses e dissertações de programas de pós-graduação
        
        3. Exclua:
           - Blogs não acadêmicos
           - Sites comerciais
           - Conteúdo de opinião sem embasamento científico
           - Fontes sem credibilidade acadêmica
        
        Para cada fonte selecionada, forneça:
        - Título completo do estudo/artigo (com link)
        - Autores (quando disponíveis)
        - Instituição/Revista
        - Ano de publicação
        - Breve descrição do conteúdo (3-4 linhas)
        
        Formate a saída em lista, ordenada por relevância, com no máximo 8 fontes.
        """
        
        # Processar os resultados com o modelo
        resposta_final = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": instrucoes},
                {"role": "user", "content": f"Processe estes resultados de pesquisa sobre '{termo_pesquisa}' e forneça apenas fontes acadêmicas de qualidade:"},
                {"role": "assistant", "content": None, "tool_calls": [{"id": tool_call_id, "type": "function", "function": {"name": "web_search", "arguments": json.dumps({"search_term": termo_pesquisa})}}]},
                {"role": "tool", "tool_call_id": tool_call_id, "content": resultados_pesquisa}
            ]
        )
        
        return resposta_final.choices[0].message.content
    
    except Exception as e:
        return f"Erro ao filtrar fontes acadêmicas: {str(e)}"

def busca_academica(tema):
    """
    Função principal que realiza todo o processo de busca acadêmica.
    
    Args:
        tema: O tema a ser pesquisado
        
    Returns:
        Resultados formatados com fontes acadêmicas
    """
    # Etapa 1: Pesquisar na web
    resultados_web, tool_call_id = pesquisar_web(tema)
    if tool_call_id is None:
        return "Não foi possível realizar a pesquisa web. Por favor, tente novamente mais tarde."
    
    # Etapa 2: Filtrar e formatar fontes acadêmicas
    fontes_academicas = filtrar_fontes_academicas(resultados_web, tema, tool_call_id)
    
    return fontes_academicas

def interface_usuario():
    """
    Interface de linha de comando para o motor de busca acadêmica.
    """
    # Header
    print("\n" + "="*70)
    print(" "*20 + "🔍 MOTOR DE BUSCA ACADÊMICA 🔍")
    print(" "*10 + "Encontrando estudos e artigos científicos confiáveis")
    print("="*70)
    print("\nDigite 'sair' a qualquer momento para encerrar o programa.\n")
    
    # Loop principal
    while True:
        # Obter tema de pesquisa
        tema = input("\n📚 Digite o tema que deseja pesquisar: ")
        
        # Verificar comando de saída
        if tema.lower() in ['sair', 'exit', 'quit']:
            print("\nEncerrando o programa. Obrigado por utilizar o Motor de Busca Acadêmica!")
            break
        
        # Verificar se o tema é válido
        if len(tema.strip()) < 3:
            print("⚠️ Por favor, digite um tema de pesquisa mais específico (mínimo de 3 caracteres).")
            continue
        
        # Realizar a pesquisa acadêmica
        print(f"\n🔎 Iniciando pesquisa acadêmica sobre: '{tema}'")
        resultados = busca_academica(tema)
        
        # Exibir resultados
        print("\n" + "="*70)
        print(" "*20 + "📋 RESULTADOS DA PESQUISA 📋")
        print("="*70 + "\n")
        print(resultados)
        print("\n" + "="*70)
        print("💡 DICA: Para resultados mais específicos, use termos técnicos precisos.")
        print("   Exemplo: ao invés de 'câncer', tente 'imunoterapia para câncer de pulmão'")
        print("="*70)

if __name__ == "__main__":
    try:
        interface_usuario()
    except KeyboardInterrupt:
        print("\n\nPrograma interrompido pelo usuário. Até a próxima!")
        sys.exit(0) 