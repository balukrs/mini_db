# copy-utils

A stream-based file copy utility built with Node.js. Copies files using read/write streams with backpressure handling and real-time progress tracking.

## Features

- Stream-based copying with proper backpressure management
- Real-time progress bar in the terminal
- Interactive controls during copy:
  - `p` — Pause
  - `r` — Resume
  - `Ctrl+C` — Exit
- Works with any filesystem path including mounted network drives (SMB, NFS, etc.)

## Usage

```ts
import CopyFiles from './copy_utils/index.js';

const copy = new CopyFiles({
  source: '/path/to/source/file.txt',
  destination: '/path/to/destination/file.txt',
});

await copy.copyFile();
```

```bash
npm run dev
```

## How It Works

The `CopyFiles` class opens the source and destination using `fs.open()`, creates read/write streams, and pipes data chunk by chunk. If the write stream's internal buffer fills up, the read stream is paused until a `drain` event fires — preventing memory buildup on slow destinations.

## Future Scope

- **Folder copy** — A `CopyFolder` class that recursively traverses directories, creates the destination folder structure, and delegates individual file copies to `CopyFiles`
- **Return a Promise from `copyFile()`** — Resolve on `finish`, reject on `error`, so callers can properly `await` completion
- **Move stdin/pause-resume controls up** — Decouple interactive controls from `CopyFiles` so they can be managed at a higher level (e.g., by `CopyFolder`)
- **Overall progress tracking** — Track total bytes across all files in a folder copy, not just per-file
- **Auto-create destination directories** — Use `fs.mkdir({ recursive: true })` so callers don't need to pre-create paths
- **Retry on network errors** — Resume-from-offset logic for transient failures on network mounts
- **Configurable concurrency** — Option to copy multiple files in parallel for local-to-local transfers
