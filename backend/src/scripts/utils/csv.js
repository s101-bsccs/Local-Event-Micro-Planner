const fs = require('fs');
const path = require('path');

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function parseCSV(content) {
  const lines = content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (!lines.length) {
    return [];
  }

  const headers = parseCSVLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);

    return headers.reduce((record, header, index) => {
      record[header] = values[index] ?? '';
      return record;
    }, {});
  });
}

function parseCSVFile(filePath) {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, 'utf8');
  return parseCSV(content);
}

function splitPipeList(value) {
  if (!value) {
    return [];
  }

  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

function printProgress(current, total, label) {
  const ratio = total > 0 ? current / total : 1;
  const width = 24;
  const complete = Math.round(ratio * width);
  const bar = `${'='.repeat(complete)}${' '.repeat(width - complete)}`;
  const percent = Math.round(ratio * 100)
    .toString()
    .padStart(3, ' ');

  process.stdout.write(`\r${label} [${bar}] ${percent}% (${current}/${total})`);

  if (current >= total) {
    process.stdout.write('\n');
  }
}

module.exports = {
  parseCSV,
  parseCSVFile,
  splitPipeList,
  printProgress
};
