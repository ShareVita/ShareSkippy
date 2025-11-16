import { StaticImageData } from "next/image";

export interface linkTypes {
  name: string;
  link: string;
}
export interface legalTypes {
  name: string;
  link: string;
}
export interface testimonialTypes {
  id: number;
  name: string;
  text: string;
  testimonial: string;
  dog: StaticImageData;
}

export interface whySkippyTypes {
  id: number;
  title: string;
  para: string;
}
