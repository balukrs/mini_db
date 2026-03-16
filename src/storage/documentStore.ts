import fs from 'node:fs/promises';
import { extractErrorMessage } from '../utils/extract_error_message.js';
import crypto from 'node:crypto';
import csvParser from '../utils/csv/parser.js';
import textParser from '../utils/text/parser.js';
import pdfParser from '../utils/pdf/parser.js';

type Props = {
  location: string;
  name: string;
};
type DocumentType = {
  id: string;
  content: string;
  metadata: Record<string, string>;
};
type DocumentTypeRequest = {
  content: string;
  metadata: Record<string, string>;
};

class DocumentStore {
  location: string;
  name: string;
  path: string;
  constructor({ location, name }: Props) {
    this.location = location;
    this.name = name;
    this.path = `${this.location}/data/${this.name}.json`;
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

  private async readFile(): Promise<DocumentType[]> {
    try {
      const contents = await fs.readFile(this.path, { encoding: 'utf8' });
      return JSON.parse(contents);
    } catch (error) {
      console.error(extractErrorMessage(error));
      throw error;
    }
  }

  private async createFile(data: DocumentType[] | null) {
    try {
      await fs.mkdir(`${this.location}/data`, { recursive: true });
      await fs.writeFile(this.path, JSON.stringify(data ?? []), {
        flag: data ? 'w' : 'wx',
      });
    } catch (error) {
      console.error(extractErrorMessage(error));
      throw error;
    }
  }

  async add(data: DocumentTypeRequest) {
    const contents = await this.readFile();
    const id = crypto.randomUUID();
    contents.push({ id, ...data });
    await this.createFile(contents);
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

  async delete() {
    try {
      await fs.unlink(this.path);
      console.log(`Document deleted: ${this.name}`);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async csvInjector(source: string) {
    const contents = await this.readFile();
    try {
      const data = await csvParser(source);
      let arr: DocumentType[] = [];
      for await (const line of data) {
        if (line?.content && line?.metadata) {
          const id = crypto.randomUUID();
          arr.push({
            id,
            content: line.content,
            metadata: JSON.parse(line.metadata),
          });
        } else continue;
      }
      if (arr.length) {
        await this.createFile([...contents, ...arr]);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async textInjector(source: string) {
    try {
      const data = await textParser(source);
      const contents = await this.readFile();

      if (data.content) {
        const id = crypto.randomUUID();
        await this.createFile([
          ...contents,
          { id, content: data.content, metadata: data.metadata },
        ]);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async pdfInjector(source: string) {
    try {
      const data = await pdfParser(source);
      const contents = await this.readFile();

      if (data.content) {
        const id = crypto.randomUUID();
        await this.createFile([
          ...contents,
          { id, content: data.content, metadata: data.metadata },
        ]);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

export default DocumentStore;
