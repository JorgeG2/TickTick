import type { NoiseType } from './noise';

export interface Sound {
  id: string;
  label: string;
  /** `stream` fetches a file; `noise` is generated in the browser. */
  kind: 'stream' | 'noise';
  /** Streamed source. Every URL here was checked for a live response. */
  url?: string;
  noise?: NoiseType;
}

/**
 * Ambience streams from Google's public sound library. The player loops
 * whichever sound is playing, so short clips repeat seamlessly.
 */
const GOOGLE = 'https://actions.google.com/sounds/v1';

export const AMBIENCE_SOUNDS: Sound[] = [
  { id: 'rain', label: 'Rain', kind: 'stream', url: `${GOOGLE}/weather/rain_on_roof.ogg` },
  { id: 'heavy-rain', label: 'Heavy Rain', kind: 'stream', url: `${GOOGLE}/weather/rain_heavy_loud.ogg` },
  { id: 'cafe', label: 'Café', kind: 'stream', url: `${GOOGLE}/ambiences/coffee_shop.ogg` },
  { id: 'waves', label: 'Ocean Waves', kind: 'stream', url: `${GOOGLE}/water/waves_crashing_on_rock_beach.ogg` },
  {
    id: 'storm',
    label: 'Distant Storm',
    kind: 'stream',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  },
];

/** Generated in-browser, so these never depend on the network. */
export const NOISE_SOUNDS: Sound[] = [
  { id: 'white', label: 'White Noise', kind: 'noise', noise: 'white' },
  { id: 'pink', label: 'Pink Noise', kind: 'noise', noise: 'pink' },
  { id: 'brown', label: 'Brown Noise', kind: 'noise', noise: 'brown' },
];

export const ALL_SOUNDS: Sound[] = [...AMBIENCE_SOUNDS, ...NOISE_SOUNDS];
