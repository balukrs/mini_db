import type { ReadStream, WriteStream } from 'node:fs';
import fs, { type FileHandle } from 'node:fs/promises';
import { extractErrorMessage } from '../extract_error_message.js';

type Props = {
  source: string;
  destination: string;
  endCallback?: ((val: number) => void) | undefined;
  disableProgress: boolean;
};

class CopyFiles {
  source: string;
  destination: string;
  error: string;
  sourceFileHandler: FileHandle | null;
  destinationFileHandler: FileHandle | null;
  sourceStream: ReadStream | null;
  destStream: WriteStream | null;
  status: 'not_started' | 'started' | 'paused' | 'ended' | 'error';
  progress: number;
  endCallback?: ((val: number) => void) | undefined;
  disableProgress: boolean;
  constructor({
    source,
    destination,
    endCallback,
    disableProgress = false,
  }: Props) {
    this.source = source;
    this.destination = destination;
    this.error = '';
    this.sourceFileHandler = null;
    this.destinationFileHandler = null;
    this.sourceStream = null;
    this.destStream = null;
    this.status = 'not_started';
    this.progress = 0;
    this.endCallback = endCallback;
    this.disableProgress = disableProgress;
  }

  private async _openFile(
    location: string,
    type: 'r' | 'w',
  ): Promise<FileHandle | null> {
    let fileHandle = null;
    try {
      fileHandle = await fs.open(location, type);
    } catch (error) {
      this.error = `Error Reading file - ${location}: ${extractErrorMessage(error).message}`;
      fileHandle = null;
      this.status = 'error';
    }
    return fileHandle;
  }

  private _createStream(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        this.sourceFileHandler = await this._openFile(this.source, 'r');
        this.destinationFileHandler = await this._openFile(
          this.destination,
          'w',
        );

        if (!this.sourceFileHandler || !this.destinationFileHandler) {
          this.status = 'error';
          this.error = 'Error Creating Streams';
          reject(new Error(this.error));
          return;
        }

        if (!this.disableProgress) {
          process.stdin.setRawMode(true);
          process.stdin.resume();
          process.stdin.setEncoding('utf8');
          process.stdin.on('data', (key) => {
            if (key === 'p') {
              this.pauseCopy();
            }
            if (key === 'r') {
              this.resumeCopy();
            }
            if (key === '\u0003') {
              process.exit();
            }
          });
        }

        const { size } = await this.sourceFileHandler.stat();

        this.sourceStream = this.sourceFileHandler.createReadStream();
        this.destStream = this.destinationFileHandler.createWriteStream();

        this.status = 'started';
        if (!this.disableProgress) {
          process.stdout.write(`\n Copy Started - Pause(p) / Resume (r) \n`);
        }

        let copied = 0;
        const barLength = 30;
        this.sourceStream.on('data', (chunk) => {
          this.endCallback?.(chunk.length);
          const canContinue = this.destStream?.write(chunk);

          copied += chunk.length;
          this.progress = Math.round((copied / size) * 100);

          const filled = this.progress * (barLength / 100);
          const empty = barLength - filled;

          const bar = '█'.repeat(filled) + '░'.repeat(empty);

          if (!this.disableProgress) {
            process.stdout.write(`\r [${bar}] ${this.progress} %`);
          }

          if (!canContinue) {
            this.sourceStream?.pause();
            return;
          }
        });

        this.destStream.on('drain', () => {
          if (this.status !== 'paused') {
            this.resumeCopy();
          }
        });

        this.sourceStream.on('end', () => {
          this.destStream?.end();
        });

        this.destStream.on('finish', () => {
          this.status = 'ended';
          resolve();
        });

        this.sourceStream.on('error', (err) => {
          this.status = 'error';
          this.error = `Source stream error: ${err.message}`;
          reject(err);
        });

        this.destStream.on('error', (err) => {
          this.status = 'error';
          this.error = `Destination stream error: ${err.message}`;
          reject(err);
        });
      } catch (error) {
        this.status = 'error';
        this.error = `Error Creating Streams: ${extractErrorMessage(error).message}`;
        this.sourceFileHandler = null;
        this.destinationFileHandler = null;
        this.sourceStream = null;
        this.destStream = null;
        reject(error);
      }
    });
  }

  async copyFile() {
    try {
      await this._createStream();
    } catch (error) {
      this.status = 'error';
      this.error = extractErrorMessage(error).message;
      throw error;
    }
  }

  pauseCopy() {
    if (this.sourceStream) {
      this.sourceStream.pause();
      this.status = 'paused';
    }
  }

  resumeCopy() {
    if (this.sourceStream) {
      this.sourceStream.resume();
      this.status = 'started';
    }
  }
}

export default CopyFiles;
