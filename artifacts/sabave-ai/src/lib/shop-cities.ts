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

export type CityCoord = { name: string; lat: number; lon: number };

function listedCity(name: string): CityCoord {
  const city = shopCities.find((item) => item.name === name);
  if (!city) throw new Error(`Missing shop city ${name}`);
  return { name: city.name, lat: city.lat, lon: city.lng };
}

/** Cities offered during shop setup. Shah Alam, Petaling Jaya and Johor Bahru reuse the map coordinates. */
export const onboardingCities: CityCoord[] = [
  listedCity('Shah Alam'),
  listedCity('Petaling Jaya'),
  { name: 'Kuala Lumpur', lat: 3.139, lon: 101.6869 },
  { name: 'Subang Jaya', lat: 3.0565, lon: 101.5851 },
  { name: 'Klang', lat: 3.0449, lon: 101.4456 },
  listedCity('Johor Bahru'),
  { name: 'Penang/George Town', lat: 5.4141, lon: 100.3288 },
  { name: 'Ipoh', lat: 4.5975, lon: 101.0901 },
  { name: 'Seremban', lat: 2.7297, lon: 101.9381 },
  { name: 'Melaka', lat: 2.1896, lon: 102.2501 },
  { name: 'Kuantan', lat: 3.8077, lon: 103.326 },
  { name: 'Kota Kinabalu', lat: 5.9804, lon: 116.0735 },
  { name: 'Kuching', lat: 1.5535, lon: 110.3593 },
];

/** Far enough back that the full disc, including the rim, sits inside the square frame. */
export const malaysiaView = { lat: 4.8, lng: 102.2, altitude: 2.35 };

/** Closer than the landing globe, so the auth panel is a zoomed view of the peninsula. */
export const malaysiaCloseup = { lat: 3.55, lng: 101.95, altitude: 0.55 };
