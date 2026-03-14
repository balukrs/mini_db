import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

async function logAnalyse(source: string) {
  const rl = createInterface({
    input: createReadStream(source),
    crlfDelay: Infinity,
  });

  const counts = { total: 0, info: 0, warn: 0, error: 0 };

  for await (const line of rl) {
    if (line.includes('INFO')) counts.info++;
    if (line.includes('ERROR')) counts.error++;
    if (line.includes('WARN')) counts.warn++;
    counts.total++;
  }

  return counts;
}

export default logAnalyse;
