import DocumentStore from './storage/documentStore.js';

const doc = new DocumentStore({
  location: '/Users/balukrishnar/Downloads/test',
  name: 'test',
});

await doc.init();

const test = await doc.list();

console.log(test);

// await doc.csvInjector('/Users/balukrishnar/Downloads/ai-test.csv');
