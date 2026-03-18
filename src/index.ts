import DocumentStore, { type DocumentType } from './storage/documentStore.js';
import Chunkstore from './storage/chunkStore.js';
import VectorStore from './storage/vectorStore.js';
import { EventEmitter } from 'node:events';
import { extractErrorMessage } from './utils/extract_error_message.js';
import checkFileType from './utils/mime_check.js';

export type SupportedModels = 'Xenova/all-MiniLM-L6-v2';

export type QueryResult = {
  content: string;
  score: number;
  chunkId: string;
  documentId: string;
};

export type MiniVectorDatabaseProps = {
  location: string;
  name: string;
  chunkConfiguration?: {
    overlap?: number;
    size?: number;
    separators?: string[];
  };
  vectorConfigurations: {
    cacheDir: string;
    searchLimit?: number;
    model: SupportedModels;
  };
};

class MiniVectorDatabase extends EventEmitter {
  location: string;
  name: string;
  chunkConfiguration:
    | {
        overlap?: number;
        size?: number;
        separators?: string[];
      }
    | undefined;
  vectorConfigurations: {
    cacheDir: string;
    searchLimit?: number;
    model: SupportedModels;
  };
  private doc!: DocumentStore;
  private chunk!: Chunkstore;
  private vector!: VectorStore;
  isReady: boolean;
  constructor({
    location,
    name,
    chunkConfiguration,
    vectorConfigurations,
  }: MiniVectorDatabaseProps) {
    super();
    this.location = location;
    this.name = name;
    this.chunkConfiguration = chunkConfiguration;
    this.vectorConfigurations = vectorConfigurations;
    this.isReady = false;
  }
  async init(): Promise<void> {
    try {
      this.emit('status', 'in-progress');
      this.doc = new DocumentStore({
        location: this.location,
        name: this.name,
      });

      await this.doc.init();

      this.chunk = new Chunkstore({
        location: this.location,
        document: this.doc,
        name: this.name,
        chunk_overlap: this.chunkConfiguration?.overlap || 0,
        chunk_size: this.chunkConfiguration?.size || 500,
        separators: this.chunkConfiguration?.separators || [
          '\n\n',
          '\n',
          '. ',
          ' ',
        ],
      });

      await this.chunk.init();

      this.vector = new VectorStore({
        location: this.location,
        cacheDir: this.vectorConfigurations?.cacheDir || './models',
        name: this.name,
        chunk: this.chunk,
        searchlimit: this.vectorConfigurations?.searchLimit || 5,
      });

      await this.vector.init(
        this.vectorConfigurations.model || 'Xenova/all-MiniLM-L6-v2',
      );
      this.emit('status', 'ready');
      this.isReady = true;
    } catch (error) {
      this.emit('error', extractErrorMessage(error));
      console.error(error);
      throw error;
    }
  }

  async ingest(filePath: string): Promise<string | string[] | null> {
    try {
      if (!this.isReady) throw new Error('Vector Db not ready');
      this.emit('ingest', 'in-progress');
      const file_type = checkFileType(filePath);
      let dataid = null;
      if (file_type === 'Text File') {
        dataid = await this.doc.textInjector(filePath);
      } else if (file_type === 'PDF File') {
        dataid = await this.doc.pdfInjector(filePath);
      } else if (file_type === 'CSV File') {
        dataid = await this.doc.csvInjector(filePath);
      } else {
        throw new Error('File type not supported');
      }

      if (!dataid) throw new Error('Parser failed');

      let chunks: string[] | undefined = [];
      if (Array.isArray(dataid)) {
        chunks = await this.chunk.addMultiple({ documentId: dataid });
      } else if (dataid) {
        chunks = await this.chunk.add({ documentId: dataid });
      }

      if (chunks?.length) {
        await this.vector.embeddIds({ chunkId: chunks });
        this.emit('ingest', 'done');
        return dataid;
      }
      return null;
    } catch (error) {
      this.emit('error', extractErrorMessage(error));
      console.error(error);
      throw error;
    }
  }

  async query(text: string): Promise<QueryResult[]> {
    try {
      if (!this.isReady) throw new Error('Vector Db not ready');
      this.emit('query', 'in-progress');
      const data = await this.vector.searchVectors(text);
      if (!data) return [];
      const result = await Promise.all(
        data.map(async (item) => {
          const [chunkId, score] = item;
          const chunk = await this.chunk.get(chunkId);
          if (!chunk)
            throw new Error(
              `Data integrity error: chunk not found for id ${chunkId}`,
            );

          return {
            content: chunk.content,
            score,
            chunkId,
            documentId: chunk.documentId,
          };
        }),
      );
      this.emit('query', 'done');
      return result;
    } catch (error) {
      this.emit('error', extractErrorMessage(error));
      console.error(error);
      throw error;
    }
  }

  async deleteDoc(id: string): Promise<void> {
    try {
      if (!this.isReady) throw new Error('Vector Db not ready');
      this.emit('delete', 'in-progress');
      await this.doc.deleteItem(id);
      const chunks = (await this.chunk.list()).filter(
        (item) => item.documentId === id,
      );
      await this.chunk.deleteMultipleItem(chunks);
      await this.vector.deleteMultipleItem(chunks);
      this.emit('delete', 'done');
    } catch (error) {
      this.emit('error', extractErrorMessage(error));
      console.error(error);
      throw error;
    }
  }

  async listDoc(): Promise<DocumentType[]> {
    try {
      if (!this.isReady) throw new Error('Vector Db not ready');
      const docs = this.doc.list();
      return docs;
    } catch (error) {
      this.emit('error', extractErrorMessage(error));
      console.error(error);
      throw error;
    }
  }

  async getDoc(id: string): Promise<DocumentType | undefined> {
    try {
      if (!this.isReady) throw new Error('Vector Db not ready');
      const doc = this.doc.get(id);
      return doc;
    } catch (error) {
      this.emit('error', extractErrorMessage(error));
      console.error(error);
      throw error;
    }
  }
}

export { type DocumentType };
export default MiniVectorDatabase;
