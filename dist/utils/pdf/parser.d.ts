declare function pdfParser(source: string): Promise<{
    content: string;
    metadata: {
        pages: string;
        title: string;
        author: string;
        size: string;
        source: string;
        filename: string;
        extension: string;
        createdAt: string;
        modifiedAt: string;
    };
}>;
export default pdfParser;
//# sourceMappingURL=parser.d.ts.map