/**
 * Background scenes for the Pomodoro page.
 *
 * `gradient` scenes are pure CSS, so they always work offline. `photo` and
 * `video` scenes stream from Unsplash / Pexels CDNs. To use your own instead,
 * drop files into `frontend/public/backgrounds/` and add entries pointing at
 * `/backgrounds/<file>` — or paste any URL into the picker's Custom field.
 */

export type BackgroundKind = 'gradient' | 'photo' | 'video';

export interface Background {
  id: string;
  label: string;
  kind: BackgroundKind;
  /** Image/video source. Unused for gradients. */
  src?: string;
  /** Still frame shown in the picker grid for videos. */
  poster?: string;
  /** CSS `background` value for gradients. */
  css?: string;
}

export const GRADIENT_BACKGROUNDS: Background[] = [
  {
    id: 'aurora',
    label: 'Aurora',
    kind: 'gradient',
    css: 'radial-gradient(at 20% 25%, #6366f1 0px, transparent 55%), radial-gradient(at 78% 18%, #8b5cf6 0px, transparent 50%), radial-gradient(at 62% 82%, #0ea5e9 0px, transparent 55%), radial-gradient(at 12% 88%, #ec4899 0px, transparent 45%), #0b0d14',
  },
  {
    id: 'ember',
    label: 'Ember',
    kind: 'gradient',
    css: 'radial-gradient(at 25% 20%, #f59e0b 0px, transparent 50%), radial-gradient(at 80% 30%, #ef4444 0px, transparent 50%), radial-gradient(at 50% 85%, #7c2d12 0px, transparent 55%), #140b06',
  },
  {
    id: 'tide',
    label: 'Tide',
    kind: 'gradient',
    css: 'radial-gradient(at 18% 30%, #06b6d4 0px, transparent 52%), radial-gradient(at 82% 22%, #14b8a6 0px, transparent 48%), radial-gradient(at 55% 88%, #1e3a8a 0px, transparent 55%), #05101a',
  },
  {
    id: 'moss',
    label: 'Moss',
    kind: 'gradient',
    css: 'radial-gradient(at 22% 24%, #10b981 0px, transparent 50%), radial-gradient(at 76% 28%, #84cc16 0px, transparent 45%), radial-gradient(at 48% 86%, #064e3b 0px, transparent 58%), #060f0c',
  },
];

const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/photo-${id}?w=${width}&q=${width > 600 ? 80 : 55}&auto=format&fit=crop`;

const photo = (id: string, label: string, unsplashId: string): Background => ({
  id,
  label,
  kind: 'photo',
  src: unsplash(unsplashId, 2400),
  poster: unsplash(unsplashId, 400),
});

export const PHOTO_BACKGROUNDS: Background[] = [
  photo('alpine', 'Alpine Dusk', '1506905925346-21bda4d32df4'),
  photo('forest', 'Forest Path', '1441974231531-c6227db76b6e'),
  photo('highlands', 'Highlands', '1470071459604-3b5ec3a7fe05'),
  photo('lone-tree', 'Lone Tree', '1502082553048-f009c37129b9'),
  photo('milky-way', 'Night Sky', '1519681393784-d120267933ba'),
  photo('black-sand', 'Black Sand', '1511300636408-a63a89df3482'),
  photo('lake', 'Turquoise Lake', '1497436072909-60f360e1d4b1'),
  photo('still-water', 'Still Water', '1518837695005-2083093ee35b'),
];

const video = (id: string, label: string, pexelsId: string, file: string): Background => ({
  id,
  label,
  kind: 'video',
  src: `https://videos.pexels.com/video-files/${pexelsId}/${file}`,
  poster: `https://images.pexels.com/videos/${pexelsId}/free-video-${pexelsId}.jpg?auto=compress&w=400`,
});

export const VIDEO_BACKGROUNDS: Background[] = [
  video('constellation', 'Constellation', '3129671', '3129671-hd_1920_1080_30fps.mp4'),
  video('waterfall', 'Waterfall', '2098989', '2098989-hd_1920_1080_30fps.mp4'),
  video('coastline', 'Coastline', '1409899', '1409899-hd_1920_1080_25fps.mp4'),
  video('palms', 'Palms', '3576378', '3576378-hd_1920_1080_25fps.mp4'),
  video('tide-pools', 'Tide Pools', '1093662', '1093662-hd_1920_1080_30fps.mp4'),
  video('sunset-hills', 'Sunset Hills', '856973', '856973-hd_1920_1080_25fps.mp4'),
  video('starfield', 'Starfield', '2611250', '2611250-hd_1920_1080_30fps.mp4'),
];

export const ALL_BACKGROUNDS: Background[] = [
  ...GRADIENT_BACKGROUNDS,
  ...PHOTO_BACKGROUNDS,
  ...VIDEO_BACKGROUNDS,
];

export const DEFAULT_BACKGROUND_ID = 'aurora';

export function findBackground(id: string): Background | undefined {
  return ALL_BACKGROUNDS.find((b) => b.id === id);
}

/** Best-effort guess so a pasted custom URL renders as the right element. */
export function guessKindFromUrl(url: string): 'photo' | 'video' {
  return /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(url) ? 'video' : 'photo';
}
