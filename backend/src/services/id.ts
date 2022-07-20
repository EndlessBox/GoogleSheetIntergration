import {nanoid} from 'nanoid';

export const nanoIDNS = [
  "automation", 
] as const;

export type ID = ReturnType<typeof id>;

export default function id(prefix: typeof nanoIDNS[number]){
  return `${prefix}_${nanoid()}` as const;
}
