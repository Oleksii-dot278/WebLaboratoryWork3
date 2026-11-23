import { NoiseSensor } from './models/NoiseSensor.js';
import { NoiseMeasurement } from './models/NoiseMeasurement.js';
import { MobileNoiseSensor } from './models/MobileNoiseSensor.js';
import { MonitoringSystem } from './services/MonitoringSystem.js';

const sensorsData = [
  { id: 'NS-01', district: 'Галицький', location: 'просп. Свободи', noiseLevel: 58 },
  { id: 'NS-02', district: 'Франківський', location: 'вул. Наукова', noiseLevel: 74 },
  { id: 'NS-03', district: 'Шевченківський', location: 'просп. Чорновола', noiseLevel: 83 }
];

const system = new MonitoringSystem();
sensorsData.map(NoiseSensor.fromObject).forEach(sensor => system.addSensor(sensor));

function renderSensorCard(sensor) {
  const status = sensor.getStatus();
  const card = document.createElement('article');
  card.className = `sensor-card ${status}`;

  const rows = [
    ['ID', sensor.id],
    ['Район', sensor.district],
    ['Адреса', sensor.location],
    ['Рівень', `${sensor.noiseLevel} dB`],
    ['Статус', status]
  ];
  for (const [label, value] of rows) {
    const p = document.createElement('p');
    const b = document.createElement('b');
    b.textContent = `${label}: `;
    p.append(b, value);
    card.append(p);
  }
  return card;
}

function render() {
  const list = document.querySelector('#sensor-list');
  const summary = document.querySelector('#summary');
  const district = document.querySelector('#district-filter').value;

  const sensors = district ? system.getSensorsByDistrict(district) : system.sensors;
  list.replaceChildren(...sensors.map(renderSensorCard));

  const avg = system.getAverageNoiseLevel();
  summary.textContent =
    `Датчиків: ${system.sensors.length}. ` +
    `Середній рівень: ${avg === null ? '—' : avg.toFixed(2)} dB. ` +
    `Критичних: ${system.getCriticalSensors().length}.`;
}

function fillControls() {
  const idSelect = document.querySelector('#sensor-id');
  const districtSelect = document.querySelector('#district-filter');
  for (const sensor of system.sensors) idSelect.add(new Option(sensor.id, sensor.id));
  const districts = [...new Set(system.sensors.map(s => s.district))];
  for (const d of districts) districtSelect.add(new Option(d, d));
}

document.querySelector('#measurement-form').addEventListener('submit', event => {
  event.preventDefault();
  const error = document.querySelector('#form-error');
  const sensor = system.findSensorById(document.querySelector('#sensor-id').value);
  const value = Number(document.querySelector('#sensor-value').value);
  try {
    sensor.addMeasurement(new NoiseMeasurement(value));
    error.textContent = '';
    render();
  } catch (e) {
    error.textContent = e.message;
  }
});
document.querySelector('#district-filter').addEventListener('change', render);

fillControls();
render();

const a = new NoiseSensor('T-A', 'Тест', 'вул. А', 50);
const b = new NoiseSensor('T-B', 'Тест', 'вул. Б', 60);
a.updateNoiseLevel(90);
console.log('Екземпляри незалежні:', a.noiseLevel, b.noiseLevel);              
console.log('a.getStatus === b.getStatus:', a.getStatus === b.getStatus);      
console.log('own noiseLevel:', Object.hasOwn(a, 'noiseLevel'));                
console.log('own getStatus:', Object.hasOwn(a, 'getStatus'));                
console.log('на прототипі:', Object.hasOwn(NoiseSensor.prototype, 'getStatus')); 
const mobile = new MobileNoiseSensor('M-01', 'Тест', 'вул. В', 65, 15);
console.log('mobile:', mobile.getStatus(), 'needsCharging =', mobile.needsCharging());

window.system = system;
