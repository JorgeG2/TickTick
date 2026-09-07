export type NoiseType = 'white' | 'pink' | 'brown';

/** Seconds of noise generated per buffer. Long enough that the loop point is
 *  inaudible, short enough to stay cheap to build and hold in memory. */
const BUFFER_SECONDS = 6;

/**
 * Builds a loopable noise buffer. Synthesised rather than streamed so these
 * sounds always work — no network, no CDN that can start returning 403.
 */
export function createNoiseBuffer(ctx: AudioContext, type: NoiseType): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * BUFFER_SECONDS);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  if (type === 'pink') {
    // Paul Kellet's refined pink-noise filter: a bank of one-pole filters
    // summed to approximate a -3dB/octave slope.
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Brown: integrated white noise, giving a -6dB/octave slope.
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}
