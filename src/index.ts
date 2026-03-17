import DocumentStore from './storage/documentStore.js';
import Chunkstore from './storage/chunkStore.js';
import VectorStore from './storage/vectorStore.js';

type SupportedModels = 'Xenova/all-MiniLM-L6-v2';

type Props = {
  location: string;
  name: string;
  chunkConfiguration: {
    overlap: number;
    size: number;
    seperators: string[];
  };
  vectorConfigurations: {
    cacheDir: string;
    searchLimit: number;
    model: SupportedModels;
  };
};

class MiniVectorDatabase {
  location: string;
  name: string;
  chunkConfiguration: {
    overlap: number;
    size: number;
    seperators: string[];
  };
  vectorConfigurations: {
    cacheDir: string;
    searchLimit: number;
    model: SupportedModels;
  };
  doc: DocumentStore | null;
  chunk: Chunkstore | null;
  constructor({
    location,
    name,
    chunkConfiguration,
    vectorConfigurations,
  }: Props) {
    this.location = location;
    this.name = name;
    this.chunkConfiguration = chunkConfiguration;
    this.vectorConfigurations = vectorConfigurations;
    this.doc = null;
    this.chunk = null;
  }
  async init() {
    try {
      this.doc = new DocumentStore({
        location: this.location,
        name: this.name,
      });

      await this.doc.init();

      this.chunk = new Chunkstore({
        location: this.location,
        document: this.doc,
        name: this.name,
        chunk_overlap: this.chunkConfiguration.overlap || 0,
        chunk_size: this.chunkConfiguration.size || 500,
        separators: this.chunkConfiguration.seperators || [
          '\n\n',
          '\n',
          '. ',
          ' ',
        ],
      });

      await this.chunk.init();

      const vector = new VectorStore({
        location: this.location,
        cacheDir: this.vectorConfigurations.cacheDir || './models',
        name: this.name,
        chunk: this.chunk,
        searchlimit: this.vectorConfigurations.searchLimit || 5,
      });

      await vector.init(
        this.vectorConfigurations.model || 'Xenova/all-MiniLM-L6-v2',
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default MiniVectorDatabase;
