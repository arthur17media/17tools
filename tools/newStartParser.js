const fs = require('fs');
const readline = require('readline');
const { saveData } = require('./utils');

const [inputFilePath, outputFilePath] = process.argv.slice(2);

if (!inputFilePath || !outputFilePath) {
  console.error('usage: yarn newStartParser <inputFilePath> <outputFilePath>');
  return;
}

const reader = readline.createInterface({
  input: fs.createReadStream(inputFilePath),
});

const LEADER_BORAD_NAME = '榜單';
const data = [];

let columNames = [];
let firstLine = true;

reader.on('line', (line) => {
  if (firstLine) {
    columNames = line.split(',');
    firstLine = false;
    return;
  }

  data.push(parseLine(line));
});

reader.on('close', () =>
  saveData(outputFilePath, data)
    .then(() => console.log('Done.'))
);

function parseLine(line) {
  const values = line.split(',');

  return values.reduce((acc, value, index) => ({
    ...acc,
    [columNames[index]]: columNames[index] === LEADER_BORAD_NAME
      ? parseLeaderBoard(value)
      : value,
  }), {});
}

function parseLeaderBoard(text) {
  const results = [];

  text.replace(/\ID:"+([^"]*)"+(?:\s?rank:(\d+)\s?)?(?:\s?score:(\d+)\s?)?/g, (_, userID, rank, score) => {
    results.push({
      userID,
      rank,
      score,
    });
  });

  return results;
}