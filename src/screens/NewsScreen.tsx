import { ModuleScreen } from '@/src/screens/ModuleScreen';

export function NewsScreen() {
  return (
    <ModuleScreen
      title="Notícias"
      subtitle="FIIs, mercado imobiliário e assuntos do ecossistema — fontes estruturadas primeiro."
      emptyTitle="Nenhuma notícia carregada"
      emptyDescription="Prioridade: APIs/feeds. IA só como apoio futuro de filtro/resumo."
      showBack
    />
  );
}
