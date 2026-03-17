import { type DocumentType } from './storage/documentStore.js';
import { EventEmitter } from 'node:events';
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
    chunkConfiguration: {
        overlap: number;
        size: number;
        separators: string[];
    };
    vectorConfigurations: {
        cacheDir: string;
        searchLimit: number;
        model: SupportedModels;
    };
};
declare class MiniVectorDatabase extends EventEmitter {
    location: string;
    name: string;
    chunkConfiguration: {
        overlap: number;
        size: number;
        separators: string[];
    };
    vectorConfigurations: {
        cacheDir: string;
        searchLimit: number;
        model: SupportedModels;
    };
    private doc;
    private chunk;
    private vector;
    isReady: boolean;
    constructor({ location, name, chunkConfiguration, vectorConfigurations, }: MiniVectorDatabaseProps);
    init(): Promise<void>;
    ingest(filePath: string): Promise<string | string[] | null>;
    query(text: string): Promise<QueryResult[]>;
    deleteDoc(id: string): Promise<void>;
    listDoc(): Promise<DocumentType[]>;
    getDoc(id: string): Promise<DocumentType | undefined>;
}
export { type DocumentType };
export default MiniVectorDatabase;
//# sourceMappingURL=index.d.ts.map