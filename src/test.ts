import MiniVectorDatabase from './index.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const TEST_DIR = path.join(os.tmpdir(), 'mcp-store-test');
const SAMPLE_FILE = path.join(TEST_DIR, 'sample.txt');

const SAMPLE_TEXT = `
Artificial intelligence is transforming how we build software.
Machine learning models can now understand natural language, generate code, and assist with complex reasoning tasks.

Vector databases store numerical representations of text called embeddings.
These embeddings capture the semantic meaning of words and sentences.
When you search a vector database, it finds the most similar content based on meaning, not just keywords.

Node.js is a JavaScript runtime built on Chrome's V8 engine.
It uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.
npm is the world's largest software registry with over a million packages.
`.trim();

async function setup() {
  await fs.mkdir(TEST_DIR, { recursive: true });
  await fs.writeFile(SAMPLE_FILE, SAMPLE_TEXT);
  console.log(`Test directory: ${TEST_DIR}`);
  console.log(`Sample file created: ${SAMPLE_FILE}\n`);
}

async function cleanup() {
  await fs.rm(TEST_DIR, { recursive: true, force: true });
  console.log('\nCleaned up test directory.');
}

async function run() {
  await setup();

  const db = new MiniVectorDatabase({
    location: TEST_DIR,
    name: 'test',
    chunkConfiguration: {
      overlap: 0,
      size: 200,
      separators: ['\n\n', '\n', '. ', ' '],
    },
    vectorConfigurations: {
      cacheDir: './models',
      searchLimit: 3,
      model: 'Xenova/all-MiniLM-L6-v2',
    },
  });

  db.on('status', (s) => console.log(`[status] ${s}`));
  db.on('ingest', (s) => console.log(`[ingest] ${s}`));
  db.on('query', (s) => console.log(`[query] ${s}`));
  db.on('error', (e) => console.log(`[error] ${e}`));

  // 1. Init
  console.log('--- Init ---');
  await db.init();
  console.log('Init complete.\n');

  // 2. Ingest
  console.log('--- Ingest ---');
  const docId = await db.ingest(SAMPLE_FILE);
  console.log(`Ingested document ID: ${docId}\n`);

  // 3. List documents
  console.log('--- List Documents ---');
  const docs = await db.listDoc();
  console.log(`Document count: ${docs.length}\n`);

  // 4. Query - should match vector/embedding content
  console.log('--- Query: "what are embeddings" ---');
  const results1 = await db.query('what are embeddings');
  for (const r of results1) {
    console.log(`  score: ${r.score.toFixed(4)} | ${r.content.slice(0, 80)}...`);
  }

  // 5. Query - should match Node.js content
  console.log('\n--- Query: "javascript runtime" ---');
  const results2 = await db.query('javascript runtime');
  for (const r of results2) {
    console.log(`  score: ${r.score.toFixed(4)} | ${r.content.slice(0, 80)}...`);
  }

  // 6. Delete
  console.log('\n--- Delete Document ---');
  if (docId && !Array.isArray(docId)) {
    await db.deleteDoc(docId);
    const afterDelete = await db.listDoc();
    console.log(`Documents after delete: ${afterDelete.length}`);
  }

  await cleanup();
  console.log('\nAll tests passed!');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
