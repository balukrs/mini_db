import fs from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';
import path from 'node:path';
import { textNormalizer } from '../text_normalizer.js';

async function pdfParser(source: string) {
  const buffer = await fs.readFile(source);
  const stats = await fs.stat(source);
  const parser = new PDFParse({ data: buffer });

  const result = await parser.getInfo({ parsePageInfo: true });

  const metadata = {
    pages: String(result.total),
    title: String(result.info?.Title),
    author: String(result.info?.Author),
    size: String(stats.size),
    source: source,
    filename: path.basename(source),
    extension: path.extname(source),
    createdAt: stats.birthtime.toISOString(),
    modifiedAt: stats.mtime.toISOString(),
  };

  const raw = await parser.getText();

  await parser.destroy();

  return { content: textNormalizer(raw.text), metadata };
}

export default pdfParser;
