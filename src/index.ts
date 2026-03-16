import DocumentStore from './storage/documentStore.js';
import Chunkstore from './storage/chunkStore.js';

const doc = new DocumentStore({
  location: '/Users/balukrishnar/Downloads/test',
  name: 'test',
});

await doc.init();

// await doc.pdfInjector('/Users/balukrishnar/Downloads/sample.pdf');

const chunk = new Chunkstore({
  location: '/Users/balukrishnar/Downloads/test',
  document: doc,
  name: 'test',
  chunk_overlap: 0,
  chunk_size: 500,
  separators: ['\n\n', '\n', '. ', ' '],
});

await chunk.init();

await chunk.add({ documentId: 'a45fc1d6-e1c1-49fc-9793-8a94819991a1' });
