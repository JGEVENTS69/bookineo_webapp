export interface Box {
    id: string;
    title: string;
    description: string;
    created_at: string;
    image_url?: string;
  }
  
  export interface BoxVisit {
    id: string;
    box_id: string;
    visitor_id: string;
    visited_at: string;
    comment?: string;
    rating?: number;
  }