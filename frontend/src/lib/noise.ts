/** Seconds of noise generated per buffer. Long enough that the loop point is
 *  inaudible, short enough to stay cheap to build and hold in memory. */
const BUFFER_SECONDS = 6;

/**
 * Builds a loopable brown-noise buffer: integrated white noise, giving a
 * -6dB/octave slope with the low-frequency weight that reads as a deep rumble.
 *
 * Synthesised rather than streamed so these sounds always work — no network,
 * and no CDN that can start returning 403 the way the old hotlinks did.
 */
export function createBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * BUFFER_SECONDS);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}
