export interface Sound {
  id: string;
  label: string;
  /** `stream` fetches a file; `noise` is generated in the browser. */
  kind: 'stream' | 'noise';
  /** Streamed source. Every URL here was checked for a live response. */
  url?: string;
  /** For generated sounds: low-pass cutoff in Hz, applied to brown noise. */
  lowpassHz?: number;
}

/**
 * Ambience streams from Google's public sound library. The player loops
 * whichever sound is playing, so clips repeat continuously.
 */
const GOOGLE = 'https://actions.google.com/sounds/v1';

export const AMBIENCE_SOUNDS: Sound[] = [
  { id: 'rain', label: 'Rain', kind: 'stream', url: `${GOOGLE}/weather/rain_on_roof.ogg` },
  { id: 'heavy-rain', label: 'Heavy Rain', kind: 'stream', url: `${GOOGLE}/weather/rain_heavy_loud.ogg` },
  { id: 'thunderstorm', label: 'Thunderstorm', kind: 'stream', url: `${GOOGLE}/weather/thunderstorm.ogg` },
  // No snow-specific recording exists in the library; a blizzard is mostly
  // howling wind, which this is.
  { id: 'snow-storm', label: 'Snow Storm', kind: 'stream', url: `${GOOGLE}/weather/desert_howling_wind.ogg` },
  { id: 'summer-nights', label: 'Summer Nights', kind: 'stream', url: `${GOOGLE}/ambiences/july_night.ogg` },
  { id: 'morning', label: 'Morning', kind: 'stream', url: `${GOOGLE}/animals/june_songbirds.ogg` },
  { id: 'campfire', label: 'Campfire', kind: 'stream', url: `${GOOGLE}/ambiences/fire.ogg` },
  { id: 'ocean-waves', label: 'Ocean Waves', kind: 'stream', url: `${GOOGLE}/water/waves_crashing_on_rock_beach.ogg` },
  { id: 'cafe', label: 'Café', kind: 'stream', url: `${GOOGLE}/ambiences/coffee_shop.ogg` },
  { id: 'street-traffic', label: 'Street Traffic', kind: 'stream', url: `${GOOGLE}/transportation/city_traffic.ogg` },
  { id: 'boiling', label: 'Boiling', kind: 'stream', url: `${GOOGLE}/household/kettle_boil.ogg` },
];

/** Generated in-browser, so these never depend on the network. */
export const NOISE_SOUNDS: Sound[] = [
  { id: 'brown', label: 'Brown Noise', kind: 'noise' },
  // Brown noise rolled off hard reads as submerged, low-frequency swell.
  { id: 'deep-ocean', label: 'Deep Ocean', kind: 'noise', lowpassHz: 200 },
];

export const ALL_SOUNDS: Sound[] = [...AMBIENCE_SOUNDS, ...NOISE_SOUNDS];
