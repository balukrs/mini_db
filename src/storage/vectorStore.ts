import fs from 'node:fs/promises';
import { extractErrorMessage } from '../utils/extract_error_message.js';
import crypto from 'node:crypto';
import {
  pipeline,
  env,
  type FeatureExtractionPipeline,
  type DataArray,
} from '@xenova/transformers';
import Chunkstore, { type ChunkType } from './chunkStore.js';

type Props = {
  cacheDir: string;
  location: string;
  name: string;
  chunk: Chunkstore;
  searchlimit: number;
};

type VectorType = {
  id: string;
  chunkId: string;
  embedding: DataArray;
};
type VectorTypeRequest = {
  chunkId: string;
};
type VectorTypeRequestMultiple = {
  chunkId: string[];
};

class VectorStore {
  extractor: FeatureExtractionPipeline | undefined;
  cacheDir: string;
  location: string;
  name: string;
  path: string;
  chunk: Chunkstore;
  searchlimit: number;
  constructor({ cacheDir, location, name, chunk, searchlimit }: Props) {
    this.cacheDir = cacheDir;
    this.location = location;
    this.name = name;
    this.path = `${this.location}/vectors/${this.name}.json`;
    this.chunk = chunk;
    this.searchlimit = searchlimit;
  }

  private async openFile() {
    try {
      await fs.access(this.path);
      return true;
    } catch {
      return false;
    }
  }

  async init(model: string) {
    try {
      env.cacheDir = this.cacheDir;
      this.extractor = await pipeline('feature-extraction', model);
    } catch (error) {
      console.error(extractErrorMessage(error));
      throw error;
    }
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

  private async readFile(): Promise<VectorType[]> {
    try {
      const contents = await fs.readFile(this.path, { encoding: 'utf8' });
      return JSON.parse(contents);
    } catch (error) {
      console.error(extractErrorMessage(error));
      throw error;
    }
  }

  private async createFile(data: VectorType[] | null) {
    try {
      await fs.mkdir(`${this.location}/vectors`, { recursive: true });
      await fs.writeFile(this.path, JSON.stringify(data ?? []), {
        flag: data ? 'w' : 'wx',
      });
    } catch (error) {
      console.error(extractErrorMessage(error));
      throw error;
    }
  }

  async deleteMultipleItem(data: ChunkType[]) {
    const contents = await this.readFile();
    const ids = new Set(data.map((d) => d.id));
    const req = contents.filter((item) => !ids.has(item.chunkId));
    await this.createFile(req);
  }

  async embedd(data: VectorTypeRequest) {
    try {
      const reqText = await this.chunk.get(data.chunkId);
      const contents = await this.readFile();

      if (!this.extractor) throw new Error('VectorStore not initialized');
      if (!reqText?.content) throw new Error(`Chunk ${data.chunkId} not found`);

      const id = crypto.randomUUID();
      const embedding = await this.extractor(reqText.content);
      await this.createFile([
        ...contents,
        { id, chunkId: data.chunkId, embedding: embedding.data },
      ]);
    } catch (error) {
      console.error(extractErrorMessage(error));
      throw error;
    }
  }

  async embeddIds(data: VectorTypeRequestMultiple) {
    try {
      for (const id of data.chunkId) {
        await this.embedd({ chunkId: id });
      }
    } catch (error) {
      console.error(extractErrorMessage(error));
      throw error;
    }
  }

  async embeddAll() {
    try {
      const data = await this.chunk.list();
      if (!this.extractor) throw new Error('VectorStore not initialized');
      if (!data.length) throw new Error(`Chunks not found`);
      let result: VectorType[] = [];

      for (const content of data) {
        const id = crypto.randomUUID();
        const embedding = await this.extractor(content.content);
        result.push({ id, chunkId: content.id, embedding: embedding.data });
      }
      await this.createFile(result);
    } catch (error) {
      console.error(extractErrorMessage(error));
      throw error;
    }
  }

  private cosineSimilarity(a: DataArray, b: DataArray): number {
    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {
      dot += a[i]! * b[i]!;
      magA += a[i]! * a[i]!;
      magB += b[i]! * b[i]!;
    }

    const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
    if (magnitude === 0) return 0;

    return dot / magnitude;
  }

  async searchVectors(query: string) {
    try {
      const contents = await this.readFile();
      const result = new Map<string, number>();
      if (!this.extractor) throw new Error('VectorStore not initialized');
      if (!contents.length) throw new Error(`Vectors not found`);

      const queryEmbedd = await this.extractor(query);

      for (const content of contents) {
        const score = this.cosineSimilarity(
          queryEmbedd.data,
          content.embedding,
        );
        result.set(content.chunkId, score);
      }
      return [...result.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, this.searchlimit);
    } catch (error) {
      console.error(extractErrorMessage(error));
      throw error;
    }
  }
}

export default VectorStore;
