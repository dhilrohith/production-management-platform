export interface SearchResultItem {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  metadata?: Record<string, any>;
}

export interface ISearchEngine {
  search(companyId: string, query: string, limit?: number): Promise<SearchResultItem[]>;
}

export const SEARCH_ENGINE_TOKEN = 'ISearchEngine';
