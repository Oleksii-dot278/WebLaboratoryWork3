import { isValidNoiseLevel } from '../config.js';

export class NoiseMeasurement {
  constructor(value, measuredAt = new Date()) {
    this.value = value;
    this.measuredAt = measuredAt;
  }

  isValid() {
    return isValidNoiseLevel(this.value) && this.measuredAt instanceof Date;
  }

  toString() {
    const time = this.measuredAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    return `${time} -> ${this.value} dB`;
  }
}
