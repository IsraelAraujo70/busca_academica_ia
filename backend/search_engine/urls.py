from django.urls import path
from .views import PesquisaView, HistoricoPesquisaView

urlpatterns = [
    path('pesquisa/', PesquisaView.as_view(), name='pesquisar'),
    path('historico/', HistoricoPesquisaView.as_view(), name='historico'),
    path('historico', HistoricoPesquisaView.as_view(), name='historico_sem_barra'),
] 