import fs from 'node:fs/promises';
import { extractErrorMessage } from '../utils/extract_error_message.js';
import crypto from 'node:crypto';
import recursiveChunker from '../utils/chunker/recursive_chunker.js';
import type DocumentStore from './documentStore.js';

type Props = {
  location: string;
  name: string;
  chunk_size: number;
  chunk_overlap: number;
  separators: string[];
  document: DocumentStore;
};
export type ChunkType = {
  id: string;
  content: string;
  documentId: string;
  index: number;
};
type ChunkTypeRequest = {
  documentId: string;
};
type ChunkTypeRequestMultiple = {
  documentId: string[];
};

class Chunkstore {
  location: string;
  name: string;
  path: string;
  chunk_size: number;
  chunk_overlap: number;
  separators: string[];
  document: DocumentStore;
  constructor({
    location,
    name,
    chunk_size,
    chunk_overlap,
    separators,
    document,
  }: Props) {
    this.location = location;
    this.name = name;
    this.path = `${this.location}/chunks/${this.name}.json`;
    this.chunk_size = chunk_size;
    this.chunk_overlap = chunk_overlap;
    this.separators = separators;
    this.document = document;
  }

  private async openFile() {
    try {
      await fs.access(this.path);
      return true;
    } catch {
      return false;
    }
  }

  async init() {
    const exists = await this.openFile();
    if (exists) {
      return;
    }
    if (this.location && this.name) {
      await this.createFile(null);
    } else {
      throw new Error('Data locations not available');
    }
  }

  private async readFile(): Promise<ChunkType[]> {
    try {
      const contents = await fs.readFile(this.path, { encoding: 'utf8' });
      return JSON.parse(contents);
    } catch (error) {
      console.error(extractErrorMessage(error));
      throw error;
    }
  }

  private async createFile(data: ChunkType[] | null) {
    try {
      await fs.mkdir(`${this.location}/chunks`, { recursive: true });
      await fs.writeFile(this.path, JSON.stringify(data ?? []), {
        flag: data ? 'w' : 'wx',
      });
    } catch (error) {
      console.error(extractErrorMessage(error));
      throw error;
    }
  }

  async add(data: ChunkTypeRequest): Promise<string[]> {
    try {
      const contents = await this.readFile();
      if (data.documentId) {
        const doc = await this.document.get(data.documentId);
        if (doc?.content) {
          const chunks = recursiveChunker(
            doc.content,
            this.chunk_size,
            this.chunk_overlap,
            this.separators,
          );

          const chunkData: ChunkType[] = chunks.map((item, inx) => {
            const id = crypto.randomUUID();
            return {
              id,
              content: item,
              documentId: data.documentId,
              index: inx,
            };
          });
          await this.createFile([...contents, ...chunkData]);
          return chunkData.map((c) => c.id);
        }
      }
      return [];
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async addMultiple(data: ChunkTypeRequestMultiple): Promise<string[]> {
    try {
      const allIds: string[] = [];
      for (const docId of data.documentId) {
        const ids = await this.add({ documentId: docId });
        allIds.push(...ids);
      }
      return allIds;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async get(data: string) {
    const contents = await this.readFile();
    const req = contents.find((item) => item.id === data);
    return req;
  }

  async list() {
    const contents = await this.readFile();
    return contents;
  }

  async deleteItem(data: string) {
    const contents = await this.readFile();
    const req = contents.filter((item) => item.id !== data);
    await this.createFile(req);
  }

  async deleteMultipleItem(data: ChunkType[]) {
    const contents = await this.readFile();
    const ids = new Set(data.map((d) => d.id));
    const req = contents.filter((item) => !ids.has(item.id));
    await this.createFile(req);
  }

  async delete() {
    try {
      await fs.unlink(this.path);
      console.log(`Chunk deleted: ${this.name}`);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

export default Chunkstore;
