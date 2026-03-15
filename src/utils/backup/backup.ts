import fs from 'node:fs/promises';
import archiver from 'archiver';

import { calculateFileSize } from '../calculate_file_size.js';

function getTimestamp() {
  const now = new Date();

  return now.toISOString().replace(/:/g, '-').split('.')[0];
}

async function backupFilesFolders(source: string, destination: string) {
  const timestamp = getTimestamp();

  const fileHandle = await fs.open(
    `${destination}/backup_${timestamp}.zip`,
    'w',
  );

  const totalSize = await calculateFileSize(source);

  const output = fileHandle.createWriteStream();
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  archive.pipe(output);

  archive.on('error', function (err) {
    throw err;
  });

  output.on('close', function () {
    process.stdout.write(
      `\n ${archive.pointer() * 0.000001} mb - total bytes compressed - Done \n`,
    );
    process.stdout.write(`\n ${totalSize * 0.000001} mb - total bytes \n`);
  });

  const barLength = 30;
  let totalProcessed = 0;

  archive.on('data', (chunk) => {
    totalProcessed += chunk.length;

    let progress = Math.min(
      Math.round((totalProcessed / totalSize) * 100),
      100,
    );

    const filled = Math.round(progress * (barLength / 100));
    const empty = barLength - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    process.stdout.write(`\r [${bar}] ${progress} %`);
  });

  archive.directory(source, false);
  await archive.finalize();
}

export default backupFilesFolders;
