from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import PesquisaAcademica
from .serializers import PesquisaAcademicaSerializer, PesquisaInputSerializer
from .services import realizar_busca_academica

class PesquisaView(APIView):
    """View para realizar pesquisas acadêmicas"""
    def post(self, request):
        serializer = PesquisaInputSerializer(data=request.data)
        if serializer.is_valid():
            termo = serializer.validated_data['termo']
            pesquisa = realizar_busca_academica(termo)
            return Response(
                PesquisaAcademicaSerializer(pesquisa).data,
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class HistoricoPesquisaView(APIView):
    """View para listar o histórico de pesquisas"""
    def get(self, request):
        pesquisas = PesquisaAcademica.objects.all().order_by('-data_pesquisa')
        serializer = PesquisaAcademicaSerializer(pesquisas, many=True)
        return Response(serializer.data) 