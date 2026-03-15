import fs from 'node:fs/promises';
import path from 'node:path';
import CopyFiles from './copy_file.js';
import { extractErrorMessage } from '../extract_error_message.js';
import { calculateFileSize } from '../calculate_file_size.js';

type Props = {
  source: string;
  destination: string;
};

class CopyFolders {
  source: string;
  destination: string;
  error: string;
  copied: number;
  progress: number;
  private _activeCopy: CopyFiles | null;
  constructor({ source, destination }: Props) {
    this.source = source;
    this.destination = destination;
    this.error = '';
    this.copied = 0;
    this.progress = 0;
    this._activeCopy = null;
  }

  private async _copyInit(
    source: string,
    destination: string,
    totalSize: number,
  ) {
    let src = source || this.source;
    let dest = destination || this.destination;

    if (src && dest) {
      await fs.mkdir(dest, { recursive: true });

      const items = await fs.readdir(src, { withFileTypes: true });
      const barLength = 30;
      for (const item of items) {
        const srcPath = path.join(src, item.name);
        const destPath = path.join(dest, item.name);

        if (item.isDirectory()) {
          await this._copyInit(srcPath, destPath, totalSize);
        } else {
          const copy = new CopyFiles({
            source: srcPath,
            destination: destPath,
            disableProgress: true,
            endCallback: (val) => {
              this.copied += val;
              this.progress = Math.round((this.copied / totalSize) * 100);

              const filled = Math.round(this.progress * (barLength / 100));
              const empty = barLength - filled;

              const bar = '█'.repeat(filled) + '░'.repeat(empty);
              process.stdout.write(`\r [${bar}] ${this.progress} %`);
            },
          });
          this._activeCopy = copy;
          await copy.copyFile();
        }
      }
    }
  }

  async copyFolder() {
    if (this.source && this.destination) {
      const totalSize = await calculateFileSize(this.source);

      const onStdinData = (key: string | Buffer) => {
        if (key === 'p') {
          this._activeCopy?.pauseCopy();
        }
        if (key === 'r') {
          this._activeCopy?.resumeCopy();
        }
        if (key === '\u0003') {
          process.exit();
        }
      };

      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', onStdinData);

      try {
        process.stdout.write(`\n Copy Started - Pause(p) / Resume (r) \n`);
        await this._copyInit(this.source, this.destination, totalSize);
        process.stdout.write(`\n Copy Completed\n`);
      } catch (error) {
        this.error = extractErrorMessage(error).message;
        throw error;
      } finally {
        process.stdin.removeListener('data', onStdinData);
      }
    }
  }
}

export default CopyFolders;
