

const noiseLevels = [
  42, 55, 61, 78, 83, 67, 49, 72, 91, 58, 64, 76,
  53, 47, 88, 69, 74, 82, 95, 51, 71, -1, 85, 63,
  79, 39, 141, 86
];

const warningLevel = 70;
const criticalLevel = 85;
const minValidLevel = 30;
const maxValidLevel = 130;

function isValidLevel(level, min, max) {
  return Number.isFinite(level) && level >= min && level <= max;
}

function calculateAverage(data, min, max) {
  let sum = 0;
  let count = 0;
  for (const level of data) {
    if (!isValidLevel(level, min, max)) continue;
    sum += level;
    count++;
  }
  return count === 0 ? null : sum / count;
}

function findMinimum(data, min, max) {
  let result = null;
  for (const level of data) {
    if (!isValidLevel(level, min, max)) continue;
    if (result === null || level < result) result = level; 
  }
  return result;
}

function findMaximum(data, min, max) {
  let result = null;
  for (const level of data) {
    if (!isValidLevel(level, min, max)) continue;
    if (result === null || level > result) result = level;
  }
  return result;
}

const countByCategory = function (data, limits) {
  const counts = { valid: 0, invalid: 0, normal: 0, warning: 0, critical: 0 };
  for (const level of data) {
    if (!isValidLevel(level, limits.min, limits.max)) {
      counts.invalid++;
      continue;
    }
    counts.valid++;
    if (level <= limits.warning) counts.normal++;
    else if (level <= limits.critical) counts.warning++;
    else counts.critical++;
  }
  return counts;
};

function findFirstCritical(data, critical, min, max) {
  for (let i = 0; i < data.length; i++) {
    if (isValidLevel(data[i], min, max) && data[i] > critical) {
      return { value: data[i], position: i + 1 };
    }
  }
  return null;
}

function findRecovery(data, warning, critical, min, max) {
  const first = findFirstCritical(data, critical, min, max);
  if (first === null) return null;

  let i = first.position;
  let safeStreak = 0;
  while (i < data.length && safeStreak < 3) {
    if (isValidLevel(data[i], min, max) && data[i] <= warning) {
      safeStreak++;
    } else {
      safeStreak = 0; 
    }
    i++; 
  }
  return safeStreak === 3 ? { position: i } : null;
}

function findFirstValid(data, min, max) {
  if (data.length === 0) return null; 
  let i = 0;
  do {
    if (isValidLevel(data[i], min, max)) {
      return { value: data[i], position: i + 1 };
    }
    i++;
  } while (i < data.length);
  return null;
}

function findInvalid(data, min, max) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (!isValidLevel(data[i], min, max)) {
      result.push({ position: i + 1, value: data[i] });
    }
  }
  return result;
}


const statusLabel = value => `Рівень: ${value} dB`; 
const isAbove = (value, threshold) => value > threshold; 

function analyze(data, limits, counter) {
  return counter(data, limits);
}

const formatNumber = (value, digits = 2) =>
  value === null ? 'немає даних' : value.toFixed(digits).replace('.', ',');

function printReport(data) {
  const limits = {
    min: minValidLevel, max: maxValidLevel,
    warning: warningLevel, critical: criticalLevel
  };
  const counts = analyze(data, limits, countByCategory); 
  const average = calculateAverage(data, minValidLevel, maxValidLevel);
  const minimum = findMinimum(data, minValidLevel, maxValidLevel);
  const maximum = findMaximum(data, minValidLevel, maxValidLevel);
  const firstCritical = findFirstCritical(data, criticalLevel, minValidLevel, maxValidLevel);
  const recovery = findRecovery(data, warningLevel, criticalLevel, minValidLevel, maxValidLevel);
  const invalid = findInvalid(data, minValidLevel, maxValidLevel);
  const exceeded = counts.warning + counts.critical;

  console.group('Акустична варта — звіт моніторингу');
  console.log(`Пороги: попередження > ${warningLevel} dB; критичний рівень > ${criticalLevel} dB`);
  console.log(`Усього вимірювань: ${data.length}`);
  console.log(`Коректних: ${counts.valid}`);
  console.log(`Некоректних: ${counts.invalid}`);

  console.table({
    'Без перевищення': { 'Кількість': counts.normal },
    'Попередження': { 'Кількість': counts.warning },
    'Критичні': { 'Кількість': counts.critical }
  });

  console.log(`Середній рівень: ${average === null ? 'немає даних' : formatNumber(average) + ' dB'}`);
  console.log(`Мінімальний рівень: ${minimum === null ? 'немає даних' : minimum + ' dB'}`);
  console.log(`Максимальний рівень: ${maximum === null ? 'немає даних' : maximum + ' dB'}`);

  console.log(
    firstCritical
      ? `Перше критичне вимірювання: ${firstCritical.value} dB, позиція ${firstCritical.position}`
      : 'Перше критичне вимірювання: не знайдено'
  );
  console.log(
    recovery
      ? `Відновлення — три безпечні вимірювання поспіль: позиція ${recovery.position}`
      : 'Відновлення — три безпечні вимірювання поспіль: не знайдено'
  );

  if (exceeded > 0) {
    console.warn(`Поріг ${warningLevel} dB перевищено у ${exceeded} вимірюваннях.`);
  }
  if (invalid.length > 0) {
    const list = invalid.map(item => `позиція ${item.position} (${item.value} dB)`).join(', ');
    console.error(`Некоректні дані: ${list}.`);
  }

  let conclusion;
  if (counts.valid === 0) {
    conclusion = 'немає коректних даних для аналізу.';
  } else if (counts.critical === 0) {
    conclusion = 'критичних вимірювань не зафіксовано.';
  } else {
    conclusion = `зафіксовано ${counts.critical} критичних вимірювань; ` +
      (recovery ? `стійке відновлення настало на позиції ${recovery.position}.`
                : 'після першого з них стійкого відновлення не виявлено.');
  }
  console.log(`Висновок: ${conclusion}`);
  console.groupEnd();
}

printReport(noiseLevels);

console.group('Тести окремих наборів');
printReport([]);
printReport([-1, 141]);
printReport([70, 85, 86]);
printReport([90, 60, 65, 80, 50, 55, 60]);
console.groupEnd();
console.log('firstValid:', findFirstValid(noiseLevels, minValidLevel, maxValidLevel));
console.log(statusLabel(72), isAbove(72, warningLevel));

