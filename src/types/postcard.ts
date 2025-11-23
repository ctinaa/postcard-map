export type Postcard = {
  id: string;
  title: string | null;
  image_url: string;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  address?: string | null;
  created_at?: string;
};

