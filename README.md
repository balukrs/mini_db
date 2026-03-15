# MCPStore

**MCPStore** is a lightweight Node.js library that acts as a storage and retrieval layer for **MCP (Model Context Protocol) servers**.

It provides primitives for storing and retrieving:

- Documents
- Text chunks
- Vector embeddings
- Metadata
- Session history

The library is designed for **AI retrieval workflows**, enabling MCP servers to perform semantic search and context retrieval efficiently.

---

# Architecture

MCPStore is designed to sit behind an MCP server and power its data retrieval tools.

AI Client
│
▼
MCP Server
│
▼
MCPStore (library)

The MCP server exposes tools like:

- `search_memory`
- `store_document`
- `get_context`

Those tools interact with MCPStore internally.

---

# Features

- Document storage
- Chunk-based document processing
- Vector similarity search
- Metadata filtering
- Session memory management
- Simple JSON persistence
- Lightweight and easy to integrate

---

# Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourname/mcp-store.git
cd mcp-store
npm install
```

mcp-store
│
├── src
│
├── core
│ └── MCPStore.js
│
├── storage
│ ├── documentStore.js
│ ├── chunkStore.js
│ └── vectorStore.js
│
├── vector
│ └── vectorSearch.js
│
├── metadata
│ └── metadataIndex.js
│
├── cache
│ └── lruCache.js
│
├── session
│ └── sessionManager.js
│
├── utils
│ └── cosineSimilarity.js
│
└── index.js

# Retrieval-Augmented Generation (RAG)

MCPStore is designed to support **Retrieval-Augmented Generation (RAG)** workflows used by modern AI systems.

Instead of sending an entire knowledge base to a language model, RAG retrieves only the most relevant pieces of information and supplies them as context to the model.

MCPStore acts as the **retrieval layer** in a RAG pipeline.

---

## RAG Pipeline

User Query
│
▼
Embedding Model
│
▼
MCPStore Vector Search
│
▼
Retrieve Relevant Chunks
│
▼
Context Assembly
│
▼
LLM Prompt
│
▼
Generated Answer

The language model performs **generation**, while MCPStore performs **retrieval**.

---

## Document Ingestion

When documents are added to MCPStore they are processed into smaller pieces called **chunks**.

Chunking improves retrieval accuracy because semantic search works better on smaller text segments.

Example:
Document
│
├── Chunk 1
├── Chunk 2
├── Chunk 3
└── Chunk 4

Each chunk receives an embedding vector and is stored in the vector index.

---

## Vector Retrieval

During search:

1. The query is converted into an embedding
2. MCPStore computes similarity between the query and stored vectors
3. The top matching chunks are returned

Similarity is computed using **cosine similarity**.

---

## Re-Ranking

Vector similarity alone is often insufficient for accurate retrieval.

MCPStore supports **re-ranking**, where retrieved chunks are scored again using additional signals such as:

- metadata relevance
- keyword overlap
- document source priority
- recency

Example ranking flow:

Vector Search → Top 20 chunks
│
▼
Re-ranking stage
│
▼
Top 5 chunks returned as context

Re-ranking improves the quality of the final context provided to the language model.

---

## Context Assembly

After retrieval and ranking, MCPStore assembles a context block that can be passed to an LLM.

Example:
Context:
• Transformers rely on self-attention mechanisms.
• Attention computes weighted representations of tokens.
• Multi-head attention improves representation capacity.

This context is then used by the LLM to generate a response.

---

## Example RAG Workflow

```javascript
const embedding = await embed(query)

const context = await store.getContext(embedding)

const response = await llm.generate({
  query,
  context
})

In this workflow:
	•	MCPStore handles retrieval
	•	The LLM handles generation



---

💡 After adding this section, your README now clearly shows that the project supports:

- **Vector search**
- **Chunking**
- **RAG**
- **Context retrieval**
- **Re-ranking**

These are exactly the **core concepts used in real AI retrieval systems**.

---


```
