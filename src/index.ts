// import CopyFiles from './copy_utils/copy_file.js';
// import CopyFolders from './copy_utils/copy_folder.js';
import backupFilesFolders from './backup/backup.js';

// const copy = new CopyFiles({
//   source:
//     '/Users/balukrishnar/Desktop/Node Core/Node JS/streams/test_large.txt',
//   destination: '/Users/balukrishnar/Downloads/test/test_large.txt',
// });

// await copy.copyFile();

// const copyFol = new CopyFolders({
//   source: '/Users/balukrishnar/Desktop/Node Core',
//   destination: '/Users/balukrishnar/Downloads/test',
// });

// await copyFol.copyFolder();

await backupFilesFolders(
  '/Users/balukrishnar/Desktop/Node Core',
  '/Users/balukrishnar/Downloads/test',
);
