import { NoiseSensor } from '../models/NoiseSensor.js';

export class MonitoringSystem {
  constructor() {
    this.sensors = [];
  }

  addSensor(sensor) {
    if (!(sensor instanceof NoiseSensor)) {
      throw new TypeError("Можна додавати лише об'єкти NoiseSensor");
    }
    if (this.sensors.some(item => item.id === sensor.id)) {
      throw new Error(`Датчик ${sensor.id} вже існує`);
    }
    this.sensors.push(sensor);
  }

  findSensorById(id) {
    return this.sensors.find(sensor => sensor.id === id);
  }

  getSensorsByDistrict(district) {
    return this.sensors.filter(sensor => sensor.district === district);
  }

  getCriticalSensors() {
    return this.sensors.filter(sensor => sensor.getStatus() === 'critical');
  }

  getAverageNoiseLevel() {
    if (this.sensors.length === 0) return null;
    let sum = 0;
    for (const sensor of this.sensors) sum += sensor.noiseLevel;
    return sum / this.sensors.length;
  }
}
