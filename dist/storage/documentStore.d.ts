type Props = {
    location: string;
    name: string;
};
export type DocumentType = {
    id: string;
    content: string;
    metadata: Record<string, string>;
};
type DocumentTypeRequest = {
    content: string;
    metadata: Record<string, string>;
};
declare class DocumentStore {
    location: string;
    name: string;
    path: string;
    constructor({ location, name }: Props);
    private openFile;
    init(): Promise<void>;
    private readFile;
    private createFile;
    add(data: DocumentTypeRequest): Promise<void>;
    get(data: string): Promise<DocumentType | undefined>;
    list(): Promise<DocumentType[]>;
    deleteItem(data: string): Promise<void>;
    delete(): Promise<void>;
    csvInjector(source: string): Promise<string[]>;
    textInjector(source: string): Promise<string | null>;
    pdfInjector(source: string): Promise<string | null>;
}
export default DocumentStore;
//# sourceMappingURL=documentStore.d.ts.map