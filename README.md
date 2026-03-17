# mcp-store-db

A lightweight vector database and RAG storage layer for Node.js. Supports document ingestion, chunking, embedding, and semantic search — all file-based with zero external database dependencies.

## Installation

```bash
npm install mcp-store-db
```

## Quick Start

```typescript
import MiniVectorDatabase from 'mcp-store-db';

const db = new MiniVectorDatabase({
  location: './data',
  name: 'my-store',
  chunkConfiguration: {
    overlap: 0,
    size: 500,
    separators: ['\n\n', '\n', '. ', ' '],
  },
  vectorConfigurations: {
    cacheDir: './models',
    searchLimit: 5,
    model: 'Xenova/all-MiniLM-L6-v2',
  },
});

// Initialize (downloads model on first run)
await db.init();

// Ingest a document (supports .txt, .pdf, .csv)
const docId = await db.ingest('./documents/example.txt');

// Semantic search
const results = await db.query('what is machine learning');
console.log(results);
// [{ content: '...', score: 0.82, chunkId: '...', documentId: '...' }]

// List all documents
const docs = await db.listDoc();

// Get a specific document
const doc = await db.getDoc('document-id');

// Delete a document (cascades to chunks and vectors)
await db.deleteDoc('document-id');
```

## How It Works

```
Ingest: File → Document Store → Chunk Store → Vector Store (embeddings)
Query:  Text → Embed → Cosine Similarity Search → Return ranked chunks
```

The library runs a three-layer pipeline:

1. **Document Store** — stores raw documents with metadata as JSON files
2. **Chunk Store** — splits documents into smaller segments using recursive chunking
3. **Vector Store** — generates embeddings using [Xenova/transformers](https://github.com/xenova/transformers.js) and performs cosine similarity search

All data is stored as JSON files on disk. No database server required.

## API

### `new MiniVectorDatabase(props)`

| Property | Type | Description |
|----------|------|-------------|
| `location` | `string` | Directory path for storing data |
| `name` | `string` | Name of the database instance |
| `chunkConfiguration.size` | `number` | Maximum chunk size in characters |
| `chunkConfiguration.overlap` | `number` | Character overlap between chunks |
| `chunkConfiguration.separators` | `string[]` | Split boundaries in priority order |
| `vectorConfigurations.cacheDir` | `string` | Directory to cache the embedding model |
| `vectorConfigurations.searchLimit` | `number` | Max results returned by `query()` |
| `vectorConfigurations.model` | `SupportedModels` | Embedding model name |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `init()` | `Promise<void>` | Initialize stores and load embedding model |
| `ingest(filePath)` | `Promise<string \| string[] \| null>` | Ingest a file (.txt, .pdf, .csv) and return document ID(s) |
| `query(text)` | `Promise<QueryResult[]>` | Semantic search — returns ranked chunks with scores |
| `listDoc()` | `Promise<DocumentType[]>` | List all documents |
| `getDoc(id)` | `Promise<DocumentType \| undefined>` | Get a document by ID |
| `deleteDoc(id)` | `Promise<void>` | Delete a document and its chunks/vectors |

### Events

The class extends `EventEmitter` and emits:

| Event | Values | Description |
|-------|--------|-------------|
| `status` | `'in-progress'`, `'ready'` | Initialization status |
| `ingest` | `'in-progress'`, `'done'` | Ingestion progress |
| `query` | `'in-progress'`, `'done'` | Query progress |
| `delete` | `'in-progress'`, `'done'` | Deletion progress |
| `error` | `string` | Error message |

### Exported Types

```typescript
import MiniVectorDatabase, {
  type MiniVectorDatabaseProps,
  type QueryResult,
  type DocumentType,
  type SupportedModels,
} from 'mcp-store-db';
```

## Supported File Types

- `.txt` — Plain text files
- `.pdf` — PDF documents
- `.csv` — CSV files (requires `content` and `metadata` columns)

## Supported Models

- `Xenova/all-MiniLM-L6-v2` — 384-dimensional embeddings, good balance of speed and quality

## Requirements

- Node.js >= 18
- ESM project (`"type": "module"` in package.json)

## License

MIT
