/**
 * Formats a BigInt as a human-readable number (with K, M, B suffixes)
 * @param {BigInt} value - The value to format
 * @returns {string} - Formatted string
 */
export function formatNumber(value) {
  if (value < 1000) return value.toString();

  const units = [
    '', 'thousand', 'million', 'billion', 'trillion',
    'quadrillion', 'quintillion', 'sextillion', 'septillion',
    'octillion', 'nonillion', 'decillion', 'undecillion',
    'duodecillion', 'tredecillion', 'quattuordecillion', 'quindecillion',
    'sexdecillion', 'septendecillion', 'octodecillion', 'novemdecillion',
    'vigintillion', 'unvigintillion', 'duovigintillion', 'trevigintillion',
    'quattuorvigintillion', 'quinvigintillion', 'sexvigintillion', 'septenvigintillion',
    'octovigintillion', 'novemvigintillion', 'trigintillion', 'untrigintillion',
    'duotrigintillion'
  ];

  let unitIndex = 0;
  let currentValue = BigInt(value);

  // Find the appropriate unit
  while (currentValue >= 1000n && unitIndex < units.length - 1) {
    currentValue = currentValue / 1000n;
    unitIndex++;
  }

  if (unitIndex === 0) {
    return currentValue.toString();
  }

  // For display, we need to calculate the decimal portion
  // Get the value before the last division
  let displayValue = BigInt(value);
  for (let i = 0; i < unitIndex - 1; i++) {
    displayValue = displayValue / 1000n;
  }

  // Now displayValue is in the thousands for our target unit
  // Divide by 1000 with decimal precision
  const wholePart = displayValue / 1000n;
  const remainder = displayValue % 1000n;

  if (remainder === 0n) {
    return `${wholePart}${units[unitIndex]}`;
  }

  // Calculate decimal places (up to 2)
  const decimal1 = (remainder * 10n) / 1000n;
  const decimal2 = (remainder * 100n) / 1000n % 10n;

  if (decimal1 === 0n && decimal2 === 0n) {
    return `${wholePart} ${units[unitIndex]}`;
  }

  if (decimal2 === 0n) {
    return `${wholePart}.${decimal1} ${units[unitIndex]}`;
  }

  return `${wholePart}.${decimal1}${decimal2} ${units[unitIndex]}`;
}

/**
 * Formats milliseconds as a human-readable time string
 * @param {number} ms - Milliseconds
 * @returns {string} - Formatted time string (HH:MM:SS)
 */
export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
}

/**
 * Formats a decimal number with commas
 * @param {number} value - The value to format
 * @returns {string} - Formatted string
 */
export function formatDecimal(value) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

/**
 * Multiplies a decimal number by a BigInt
 * @param {number} a - The decimal number
 * @param {BigInt} b - The BigInt
 * @returns {BigInt} - The result of the multiplication
 */
export function multiplyDecimalBigint(a, b) {
  // Scale decimal by a power of 10, multiply, then scale back
  const scale = 100n; // For 2 decimal places
  const scaledDecimal = BigInt(Math.round(a * Number(scale)));
  return (b * scaledDecimal) / scale;
}

/**
 * 
 * @param {number} timestamp - The date to round down
 * @returns - The date rounded down to the nearest tenth of a second
 */
export function roundDownDateToTenths(timestamp) {
  const roundedTimestamp = Math.floor(timestamp / 100) * 100;
  return new Date(roundedTimestamp).getTime();
}