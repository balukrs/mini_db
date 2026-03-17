export const textNormalizer = (text) => {
    return text
        .replace(/\r\n/g, '\n') // normalize Windows line endings
        .replace(/\n{3,}/g, '\n\n') // collapse 3+ newlines to 2 (keep paragraphs)
        .replace(/[ \t]+/g, ' ') // collapse multiple spaces/tabs (not newlines)
        .trim();
};
//# sourceMappingURL=text_normalizer.js.map