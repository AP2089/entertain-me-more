export interface Props {
  id: string;
  url: string;
  progressScaleId: string;
  progressCounterId: string;
}

export interface Item {
  site: string;
  subscribed: boolean;
  caption: string;
  image: {
    webp: string;
    any: string;
  }
}

export interface Data {
  site: string;
  subscribed: boolean;
}