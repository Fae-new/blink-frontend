export interface Collection {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: number;
  collection_id: number;
  parent_id: number | null;
  name: string;
  item_type: 'folder' | 'request';
  sort_order: number;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url?: string;
  headers?: string; // JSON string in tree response
  body?: string;
  created_at: string;
  updated_at: string;
  children?: Item[]; // Only in tree response
}

export interface CollectionTree extends Collection {
  children: Item[];
}
