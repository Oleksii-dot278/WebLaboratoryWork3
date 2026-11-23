import { NOISE_LIMITS, isValidNoiseLevel } from '../config.js';
import { NoiseMeasurement } from './NoiseMeasurement.js';

export class NoiseSensor {
  constructor(id, district, location, noiseLevel) {
    if (!NoiseSensor.isValidNoiseLevel(noiseLevel)) {
      throw new RangeError(`Некоректний рівень шуму: ${noiseLevel}`);
    }
    this.id = id;
    this.district = district;
    this.location = location;
    this.noiseLevel = noiseLevel;
    this.measurements = [];
  }

  getStatus() {
    if (this.noiseLevel <= NOISE_LIMITS.normalMax) return 'normal';
    if (this.noiseLevel <= NOISE_LIMITS.warningMax) return 'warning';
    return 'critical';
  }

  updateNoiseLevel(value) {
    if (!NoiseSensor.isValidNoiseLevel(value)) {
      throw new RangeError(`Некоректний рівень шуму: ${value}`);
    }
    this.noiseLevel = value;
  }

  addMeasurement(measurement) {
    if (!(measurement instanceof NoiseMeasurement)) {
      throw new TypeError("Очікується об'єкт NoiseMeasurement");
    }
    if (!measurement.isValid()) {
      throw new RangeError(`Некоректне вимірювання: ${measurement.value}`);
    }
    this.measurements.push(measurement);
    this.noiseLevel = measurement.value;
  }

  static isValidNoiseLevel(value) {
    return isValidNoiseLevel(value);
  }

  static fromObject(data) {
    const required = ['id', 'district', 'location', 'noiseLevel'];
    for (const key of required) {
      if (!(key in data)) throw new Error(`Бракує поля "${key}"`);
    }
    return new NoiseSensor(data.id, data.district, data.location, data.noiseLevel);
  }
}
