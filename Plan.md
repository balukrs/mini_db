# MCPStore Build Plan

## Core Concept

The system is a pipeline:

```
Ingest (CSV/text) → Chunk → Embed → Store
Query → Embed → Search vectors → Re-rank → Return context
```

---

## Phase 1: Document Storage - Done

Build a `DocumentStore` that saves and retrieves documents as JSON files on disk.

- Each document gets an ID, content, and metadata
- Store as `.json` files in a data directory
- Operations: save, get, list, delete
- Uses `fs/promises` (already familiar from copy utils)
- **Utils used:** `extract_error_message.ts`, `calculate_file_size.ts`, `csv/parser.ts` (for ingesting CSV as documents)

## Phase 2: Chunking - In Progress

Split documents into smaller pieces for accurate retrieval.

- Build a `ChunkStore` that splits a document by paragraph, sentence count, or character limit
- Each chunk keeps a reference back to its parent document ID
- Key learning: semantic search works better on small text segments than full documents

## Phase 3: Embeddings & Vector Search

The core AI retrieval piece.

- An embedding is an array of numbers representing the meaning of text (e.g. `[0.12, -0.45, 0.78, ...]`)
- Generate embeddings via an external API (OpenAI, Cohere, or local model like Ollama)
- Build a `VectorStore` that stores chunks alongside their embedding vectors
- Implement cosine similarity search (~10 lines of math)
- Query flow: text → embedding → compare against stored vectors → return top N matches

## Phase 4: Metadata & Filtering

Filter candidates by metadata (source, date, tags) before vector search runs.

- Makes search faster and more relevant
- Build a `MetadataIndex` for querying by document properties

## Phase 5: Session Memory

Store conversation history so the MCP server can provide context across turns.

- Append-only log per session ID
- Build a `SessionManager` with create, append, get, list operations

## Phase 6: Backup & Export

- Use `backup/backup.ts` → zip and export the entire data directory
- Use `copy_utils/` → snapshot/replicate the store to another location

---

## Utility Mapping

| Utility                    | Role in MCPStore                         |
| -------------------------- | ---------------------------------------- |
| `csv/parser.ts`            | Document ingestion pipeline              |
| `backup/backup.ts`         | Store backup/export                      |
| `copy_utils/`              | Store snapshots/replication              |
| `log_analyser.ts`          | Logging queries, tracking usage patterns |
| `calculate_file_size.ts`   | Store size monitoring                    |
| `extract_error_message.ts` | Shared error handling                    |

---

## Target File Structure

```
src/
├── core/
│   └── MCPStore.ts          ← main facade class
├── storage/
│   ├── documentStore.ts     ← Phase 1
│   └── chunkStore.ts        ← Phase 2
├── vector/
│   ├── vectorStore.ts       ← Phase 3
│   └── cosineSimilarity.ts  ← pure math function
├── metadata/
│   └── metadataIndex.ts     ← Phase 4
├── session/
│   └── sessionManager.ts    ← Phase 5
├── utils/                   ← existing utils
└── index.ts
```
