interface User {
  description: string;
  favourites_count: number;
  followers_count: number;
  friends_count: number;
  id: number;
  lang: string;
  listed_count: number;
  location: string;
  name: string;
  profile_image_url: string;
  profile_image_url_https: string;
  screen_name: string;
  statuses_count: number;
}

export interface Tweet {
  created_at: string;
  favorite_count: number;
  id: number;
  lang: string;
  retweet_count: number;
  text: string;
  timestamp_ms: number;
  user: User;
}

interface DataPoint {
  name: string;
  value: number|string;
}

interface Series {
  name: string;
  series: DataPoint[];
}

export interface Aggregates {
  languages: DataPoint[];
  time: Series;
  stats: DataPoint[];
}

export interface Hashtag {
  hashtag: string;
  count: number;
}

export interface Link {
  link: string;
  count: number;
}
