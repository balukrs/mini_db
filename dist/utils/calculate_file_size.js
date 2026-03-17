import fs from 'node:fs/promises';
import path from 'node:path';
export async function calculateFileSize(source) {
    const items = await fs.readdir(source, { withFileTypes: true });
    let size = 0;
    for (const item of items) {
        const srcPath = path.join(source, item.name);
        if (item.isDirectory()) {
            size += await calculateFileSize(srcPath);
        }
        else {
            size += (await fs.stat(srcPath)).size;
        }
    }
    return size;
}
//# sourceMappingURL=calculate_file_size.js.map