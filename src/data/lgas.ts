import { LGA } from '../types';

export const LAGOS_LGAS: LGA[] = [
  // Mainland
  { name: 'Agege', zone: 'mainland' },
  { name: 'Ajeromi-Ifelodun', zone: 'mainland' },
  { name: 'Alimosho', zone: 'mainland' },
  { name: 'Amuwo-Odofin', zone: 'mainland' },
  { name: 'Apapa', zone: 'mainland' },
  { name: 'Ifako-Ijaiye', zone: 'mainland' },
  { name: 'Ikeja', zone: 'mainland' },
  { name: 'Kosofe', zone: 'mainland' },
  { name: 'Mushin', zone: 'mainland' },
  { name: 'Oshodi-Isolo', zone: 'mainland' },
  { name: 'Shomolu', zone: 'mainland' },
  { name: 'Surulere', zone: 'mainland' },
  
  // Island
  { name: 'Eti-Osa', zone: 'island' },
  { name: 'Lagos Island', zone: 'island' },
  { name: 'Lagos Mainland', zone: 'island' },
  
  // Outskirt
  { name: 'Badagry', zone: 'outskirt' },
  { name: 'Epe', zone: 'outskirt' },
  { name: 'Ibeju-Lekki', zone: 'outskirt' },
  { name: 'Ikorodu', zone: 'outskirt' },
];

// Distance matrix between major LGAs (in kilometers)
export const DISTANCE_MATRIX: { [key: string]: { [key: string]: number } } = {
  'Ikeja': {
    'Victoria Island': 22,
    'Lekki': 28,
    'Surulere': 18,
    'Apapa': 15,
    'Ikorodu': 35,
    'Badagry': 45,
  },
  'Victoria Island': {
    'Ikeja': 22,
    'Lekki': 12,
    'Surulere': 25,
    'Apapa': 18,
    'Ikorodu': 40,
  },
  'Lekki': {
    'Ikeja': 28,
    'Victoria Island': 12,
    'Surulere': 30,
    'Ikorodu': 25,
  },
  'Surulere': {
    'Ikeja': 18,
    'Victoria Island': 25,
    'Lekki': 30,
    'Apapa': 12,
  },
  'Apapa': {
    'Ikeja': 15,
    'Victoria Island': 18,
    'Surulere': 12,
    'Ikorodu': 45,
  },
  'Ikorodu': {
    'Ikeja': 35,
    'Victoria Island': 40,
    'Lekki': 25,
    'Apapa': 45,
  },
};