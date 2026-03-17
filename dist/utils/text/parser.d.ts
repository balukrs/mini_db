declare function textParser(source: string): Promise<{
    content: string;
    metadata: {
        source: string;
        filename: string;
        extension: string;
        size: string;
        createdAt: string;
        modifiedAt: string;
    };
}>;
export default textParser;
//# sourceMappingURL=parser.d.ts.map