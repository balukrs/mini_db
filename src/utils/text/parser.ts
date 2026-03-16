import fs from 'node:fs/promises';
import path from 'node:path';
import rtfParser from 'rtf-parser';
import { textNormalizer } from '../text_normalizer.js';

async function textParser(source: string) {
  const stats = await fs.stat(source);
  const metadata = {
    source: source,
    filename: path.basename(source),
    extension: path.extname(source),
    size: String(stats.size),
    createdAt: stats.birthtime.toISOString(),
    modifiedAt: stats.mtime.toISOString(),
  };

  const raw = await fs.readFile(source, 'utf-8');

  if (path.extname(source) === '.rtf') {
    const text = await new Promise<string>((resolve, reject) => {
      rtfParser.string(raw, (err, doc: any) => {
        if (err) {
          reject(err);
        }

        const tx = (doc.content as any[])
          .map((paragraph: any) =>
            (paragraph.content as any[])
              .map((span: any) => span.value ?? '')
              .join(''),
          )
          .join('\n');

        resolve(tx);
      });
    });

    return { content: textNormalizer(text), metadata };
  }

  const content = textNormalizer(raw);

  /*   - Paragraphs are still separated by \n\n                                                                                                                                           
  - Lines are still separated by \n  */

  return { content, metadata };
}

export default textParser;
