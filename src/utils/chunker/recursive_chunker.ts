function _recursiveChunker(
  content: string,
  chunk_size: number,
  seperators: string[],
): string[] {
  const [current, ...remaining] = seperators;
  const init_seperator = current;
  if (init_seperator === undefined) return [content];
  const init_chunk = content.split(init_seperator).filter(Boolean);

  const result = [];

  let target_chunk = '';
  for (const piece of init_chunk) {
    if (
      target_chunk.length + piece.length + init_seperator.length >
      chunk_size
    ) {
      result.push(target_chunk);
      target_chunk = piece;
    } else {
      target_chunk = target_chunk ? target_chunk + current + piece : piece;
    }
  }

  if (target_chunk) {
    result.push(target_chunk);
  }

  let target = [];
  for (const chunk of result) {
    if (chunk.length > chunk_size) {
      target.push(..._recursiveChunker(chunk, chunk_size, remaining));
    } else target.push(chunk);
  }

  return target;
}

function recursiveChunker(
  content: string,
  chunk_size: number,
  overlap: number,
  seperators: string[],
): string[] {
  const chunks = _recursiveChunker(content, chunk_size, seperators);

  if (overlap > 0) {
    for (let i = 1; i < chunks.length; i++) {
      const prevData: string = chunks[i - 1]?.slice(-overlap) || '';
      chunks[i] = prevData + chunks[i];
    }
  }

  return chunks.filter((chunk) => chunk.trim().length > 0);
}

export default recursiveChunker;
