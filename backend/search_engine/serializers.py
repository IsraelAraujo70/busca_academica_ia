from rest_framework import serializers
from .models import PesquisaAcademica, FonteAcademica

class FonteAcademicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = FonteAcademica
        fields = ['id', 'titulo', 'autores', 'instituicao', 'ano_publicacao', 'link', 'descricao', 'tipo_acesso']

class PesquisaAcademicaSerializer(serializers.ModelSerializer):
    fontes = FonteAcademicaSerializer(many=True, read_only=True)
    
    class Meta:
        model = PesquisaAcademica
        fields = ['id', 'termo', 'data_pesquisa', 'fontes']

class PesquisaInputSerializer(serializers.Serializer):
    termo = serializers.CharField(max_length=255)
    
    def validate_termo(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("O termo de pesquisa deve ter pelo menos 3 caracteres.")
        return value 