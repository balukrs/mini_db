import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

import path from 'path';

function isCSV(file: string) {
  return path.extname(file).toLowerCase() === '.csv';
}

async function* csvParser(source: string) {
  if (!isCSV(source)) {
    throw Error('Not Csv file');
  }
  const rl = createInterface({
    input: createReadStream(source),
    crlfDelay: Infinity,
  });

  //   const firstLine = await new Promise<string>((resolve) => {
  //     rl.once('line', (line) => {
  //       resolve(line);
  //     });
  //   });

  //   if (!firstLine.includes(',')) {
  //     throw Error('Not Csv file');
  //   }

  const unquoteField = (str: string) => {
    if (str.startsWith('"') && str.endsWith('"')) {
      str = str.slice(1, -1);
    }
    return str.replaceAll('""', '"');
  };

  let isHeader = true;
  let headers: string[] = [];

  for await (const line of rl) {
    if (isHeader) {
      if (!line.includes(',')) throw Error('Not a CSV file');
      headers = line.split(',');
      isHeader = false;
      continue;
    }
    yield line
      .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
      .reduce<Record<string, string>>((acc, item, inx) => {
        acc[`${headers[inx]}`] = unquoteField(item);
        return acc;
      }, {});
  }
}

export default csvParser;
