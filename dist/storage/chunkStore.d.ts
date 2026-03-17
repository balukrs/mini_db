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
declare class Chunkstore {
    location: string;
    name: string;
    path: string;
    chunk_size: number;
    chunk_overlap: number;
    separators: string[];
    document: DocumentStore;
    constructor({ location, name, chunk_size, chunk_overlap, separators, document, }: Props);
    private openFile;
    init(): Promise<void>;
    private readFile;
    private createFile;
    add(data: ChunkTypeRequest): Promise<string[]>;
    addMultiple(data: ChunkTypeRequestMultiple): Promise<string[]>;
    get(data: string): Promise<ChunkType | undefined>;
    list(): Promise<ChunkType[]>;
    deleteItem(data: string): Promise<void>;
    deleteMultipleItem(data: ChunkType[]): Promise<void>;
    delete(): Promise<void>;
}
export default Chunkstore;
//# sourceMappingURL=chunkStore.d.ts.map