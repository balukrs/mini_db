import DocumentStore, {} from './storage/documentStore.js';
import Chunkstore from './storage/chunkStore.js';
import VectorStore from './storage/vectorStore.js';
import { EventEmitter } from 'node:events';
import { extractErrorMessage } from './utils/extract_error_message.js';
import checkFileType from './utils/mime_check.js';
class MiniVectorDatabase extends EventEmitter {
    location;
    name;
    chunkConfiguration;
    vectorConfigurations;
    doc;
    chunk;
    vector;
    isReady;
    constructor({ location, name, chunkConfiguration, vectorConfigurations, }) {
        super();
        this.location = location;
        this.name = name;
        this.chunkConfiguration = chunkConfiguration;
        this.vectorConfigurations = vectorConfigurations;
        this.isReady = false;
    }
    async init() {
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
                chunk_overlap: this.chunkConfiguration.overlap || 0,
                chunk_size: this.chunkConfiguration.size || 500,
                separators: this.chunkConfiguration.separators || [
                    '\n\n',
                    '\n',
                    '. ',
                    ' ',
                ],
            });
            await this.chunk.init();
            this.vector = new VectorStore({
                location: this.location,
                cacheDir: this.vectorConfigurations.cacheDir || './models',
                name: this.name,
                chunk: this.chunk,
                searchlimit: this.vectorConfigurations.searchLimit || 5,
            });
            await this.vector.init(this.vectorConfigurations.model || 'Xenova/all-MiniLM-L6-v2');
            this.emit('status', 'ready');
            this.isReady = true;
        }
        catch (error) {
            this.emit('error', extractErrorMessage(error));
            console.error(error);
            throw error;
        }
    }
    async ingest(filePath) {
        try {
            if (!this.isReady)
                throw new Error('Vector Db not ready');
            this.emit('ingest', 'in-progress');
            const file_type = checkFileType(filePath);
            let dataid = null;
            if (file_type === 'Text File') {
                dataid = await this.doc.textInjector(filePath);
            }
            else if (file_type === 'PDF File') {
                dataid = await this.doc.pdfInjector(filePath);
            }
            else if (file_type === 'CSV File') {
                dataid = await this.doc.csvInjector(filePath);
            }
            else {
                throw new Error('File type not supported');
            }
            if (!dataid)
                throw new Error('Parser failed');
            let chunks = [];
            if (Array.isArray(dataid)) {
                chunks = await this.chunk.addMultiple({ documentId: dataid });
            }
            else if (dataid) {
                chunks = await this.chunk.add({ documentId: dataid });
            }
            if (chunks?.length) {
                await this.vector.embeddIds({ chunkId: chunks });
                this.emit('ingest', 'done');
                return dataid;
            }
            return null;
        }
        catch (error) {
            this.emit('error', extractErrorMessage(error));
            console.error(error);
            throw error;
        }
    }
    async query(text) {
        try {
            if (!this.isReady)
                throw new Error('Vector Db not ready');
            this.emit('query', 'in-progress');
            const data = await this.vector.searchVectors(text);
            if (!data)
                return [];
            const result = await Promise.all(data.map(async (item) => {
                const [chunkId, score] = item;
                const chunk = await this.chunk.get(chunkId);
                if (!chunk)
                    throw new Error(`Data integrity error: chunk not found for id ${chunkId}`);
                return {
                    content: chunk.content,
                    score,
                    chunkId,
                    documentId: chunk.documentId,
                };
            }));
            this.emit('query', 'done');
            return result;
        }
        catch (error) {
            this.emit('error', extractErrorMessage(error));
            console.error(error);
            throw error;
        }
    }
    async deleteDoc(id) {
        try {
            if (!this.isReady)
                throw new Error('Vector Db not ready');
            this.emit('delete', 'in-progress');
            await this.doc.deleteItem(id);
            const chunks = (await this.chunk.list()).filter((item) => item.documentId === id);
            await this.chunk.deleteMultipleItem(chunks);
            await this.vector.deleteMultipleItem(chunks);
            this.emit('delete', 'done');
        }
        catch (error) {
            this.emit('error', extractErrorMessage(error));
            console.error(error);
            throw error;
        }
    }
    async listDoc() {
        try {
            if (!this.isReady)
                throw new Error('Vector Db not ready');
            const docs = this.doc.list();
            return docs;
        }
        catch (error) {
            this.emit('error', extractErrorMessage(error));
            console.error(error);
            throw error;
        }
    }
    async getDoc(id) {
        try {
            if (!this.isReady)
                throw new Error('Vector Db not ready');
            const doc = this.doc.get(id);
            return doc;
        }
        catch (error) {
            this.emit('error', extractErrorMessage(error));
            console.error(error);
            throw error;
        }
    }
}
export {};
export default MiniVectorDatabase;
//# sourceMappingURL=index.js.map