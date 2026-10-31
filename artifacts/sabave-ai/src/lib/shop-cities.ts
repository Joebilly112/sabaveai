export type ShopCity = {
  id: 'shah-alam' | 'petaling-jaya' | 'johor-bahru';
  name: string;
  lat: number;
  lng: number;
  level: 'unhealthy' | 'moderate' | 'good';
  levelLabel: string;
  tooltip: string;
  color: string;
};

/** Exact coordinates. Shah Alam and Petaling Jaya sit a few kilometres apart on the Selangor coast; Johor Bahru is the southern tip of the peninsula. */
export const shopCities: ShopCity[] = [
  {
    id: 'shah-alam',
    name: 'Shah Alam',
    lat: 3.0733,
    lng: 101.5185,
    level: 'unhealthy',
    levelLabel: 'Unhealthy',
    tooltip: 'Shah Alam · Unhealthy haze in 3 days',
    color: '#F08A3C',
  },
  {
    id: 'petaling-jaya',
    name: 'Petaling Jaya',
    lat: 3.1073,
    lng: 101.6067,
    level: 'moderate',
    levelLabel: 'Moderate',
    tooltip: 'Petaling Jaya · Moderate tomorrow',
    color: '#E0A82E',
  },
  {
    id: 'johor-bahru',
    name: 'Johor Bahru',
    lat: 1.4927,
    lng: 103.7414,
    level: 'good',
    levelLabel: 'Good',
    tooltip: 'Johor Bahru · Good today',
    color: '#2BB673',
  },
];

/** Far enough back that the full disc, including the rim, sits inside the square frame. */
export const malaysiaView = { lat: 4.8, lng: 102.2, altitude: 2.35 };
