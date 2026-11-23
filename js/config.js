
export const NOISE_LIMITS = Object.freeze({
  normalMax: 55,   
  warningMax: 70,  
  validMin: 0,     
  validMax: 200
});

export function isValidNoiseLevel(value) {
  return Number.isFinite(value) &&
    value >= NOISE_LIMITS.validMin && value <= NOISE_LIMITS.validMax;
}
