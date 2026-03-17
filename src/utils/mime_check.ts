import mime from 'mime-types';

function checkFileType(filePath: string) {
  const type = mime.lookup(filePath);

  if (type === 'text/plain') return 'Text File';
  if (type === 'application/pdf') return 'PDF File';
  if (type === 'text/csv') return 'CSV File';
  if (type === 'application/rtf' || type === 'text/rtf') return 'Text File';

  return 'Unknown File';
}

export default checkFileType;
