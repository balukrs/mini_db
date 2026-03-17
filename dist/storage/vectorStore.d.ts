import { type FeatureExtractionPipeline } from '@xenova/transformers';
import Chunkstore, { type ChunkType } from './chunkStore.js';
type Props = {
    cacheDir: string;
    location: string;
    name: string;
    chunk: Chunkstore;
    searchlimit: number;
};
type VectorTypeRequest = {
    chunkId: string;
};
type VectorTypeRequestMultiple = {
    chunkId: string[];
};
declare class VectorStore {
    extractor: FeatureExtractionPipeline | undefined;
    cacheDir: string;
    location: string;
    name: string;
    path: string;
    chunk: Chunkstore;
    searchlimit: number;
    constructor({ cacheDir, location, name, chunk, searchlimit }: Props);
    private openFile;
    init(model: string): Promise<void>;
    private readFile;
    private createFile;
    deleteMultipleItem(data: ChunkType[]): Promise<void>;
    embedd(data: VectorTypeRequest): Promise<void>;
    embeddIds(data: VectorTypeRequestMultiple): Promise<void>;
    embeddAll(): Promise<void>;
    private cosineSimilarity;
    searchVectors(query: string): Promise<[string, number][]>;
}
export default VectorStore;
//# sourceMappingURL=vectorStore.d.ts.map