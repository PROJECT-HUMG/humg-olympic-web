export interface HeroSlideResponse {
  id: string | number;
  label: string;
  title: string;
  imageUrl: string;
}

export interface HeroResponse {
  data: HeroSlideResponse[];
}
