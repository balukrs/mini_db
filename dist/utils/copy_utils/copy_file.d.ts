import type { ReadStream, WriteStream } from 'node:fs';
import { type FileHandle } from 'node:fs/promises';
type Props = {
    source: string;
    destination: string;
    endCallback?: ((val: number) => void) | undefined;
    disableProgress: boolean;
};
declare class CopyFiles {
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
    constructor({ source, destination, endCallback, disableProgress, }: Props);
    private _openFile;
    private _createStream;
    copyFile(): Promise<void>;
    pauseCopy(): void;
    resumeCopy(): void;
}
export default CopyFiles;
//# sourceMappingURL=copy_file.d.ts.map