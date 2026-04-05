export interface Collection {
  id: string;
  name: string;
  description?: string;
  slug: string;
  createdAt: string;
  documentCount: number;
}

export interface CreateCollectionInput {
  title: string;
  description?: string;
}
