from django.db import models

class PesquisaAcademica(models.Model):
    """Modelo para armazenar pesquisas acadêmicas realizadas"""
    termo = models.CharField(max_length=255)
    data_pesquisa = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.termo

class FonteAcademica(models.Model):
    """Modelo para armazenar as fontes acadêmicas encontradas"""
    pesquisa = models.ForeignKey(PesquisaAcademica, on_delete=models.CASCADE, related_name='fontes')
    titulo = models.CharField(max_length=500)
    autores = models.CharField(max_length=500, blank=True, null=True)
    instituicao = models.CharField(max_length=255, blank=True, null=True)
    ano_publicacao = models.IntegerField(blank=True, null=True)
    link = models.URLField(max_length=1000, blank=True, null=True)
    descricao = models.TextField(blank=True, null=True)
    tipo_acesso = models.CharField(max_length=100, blank=True, null=True, 
                                 help_text="Tipo de acesso ao documento, ex: PDF, Texto completo, Acesso aberto")
    
    def __str__(self):
        return self.titulo 