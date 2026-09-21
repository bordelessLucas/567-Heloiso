import type { NewsItem } from '@/src/domain/news';

const MOCK_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'IFIIs e liquidez: o que observar nos relatórios do mês',
    summary:
      'Leitura educacional sobre volume negociado e o papel da liquidez na análise de cotas — sem recomendação de compra ou venda.',
    source: 'Mercado FiiS · Editorial',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    relatedTickers: ['HGLG11', 'XPLG11'],
    url: null,
  },
  {
    id: 'news-2',
    title: 'Vacância em lajes: como interpretar o número no relatório gerencial',
    summary:
      'Vacância isolada não conta a história toda. Compare com contratos, região e tendência dos últimos períodos.',
    source: 'Mercado FiiS · Didático',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    relatedTickers: ['RECT11'],
    url: null,
  },
  {
    id: 'news-3',
    title: 'FIIs de papel e ciclo de juros: glossário rápido',
    summary:
      'Termos frequentes em fundos de recebíveis e por que o cenário macro aparece nos fatos relevantes.',
    source: 'Mercado FiiS · Glossário',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString(),
    relatedTickers: ['KNCR11', 'MXRF11'],
    url: null,
  },
  {
    id: 'news-4',
    title: 'Shoppings e renda variável de aluguel: pontos de leitura',
    summary:
      'Checklist para quem estuda fundos de shoppings: sazonalidade, inadimplência e concentração de lojistas.',
    source: 'Mercado FiiS · Checklist',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 78).toISOString(),
    relatedTickers: ['VISC11', 'HSML11'],
    url: null,
  },
];

/** Fonte estruturada mock — pronta para trocar por feed/API sem mudar a UI. */
export async function listNews(): Promise<NewsItem[]> {
  return MOCK_NEWS.map((item) => ({ ...item }));
}
