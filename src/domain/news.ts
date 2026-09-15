export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  relatedTickers: string[];
  url: string | null;
}
