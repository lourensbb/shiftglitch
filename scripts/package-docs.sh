#!/usr/bin/env node
// Regenerates shiftglitch-package.zip at the project root.
// Run from the project root: node scripts/package-docs.sh
// (or: npm run package-docs if added to package.json scripts)

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'shiftglitch-package.zip');

const FILES = [
  'JOURNAL.md',
  'REPORT.md',
  'README.md',
  'replit.md',
  'PLANNING_EBOOK.md',
  'MARKETING_PLAN.md',
];

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function buildZip(outputPath, files) {
  const parts = [];
  const centralDir = [];
  let offset = 0;

  const now = new Date();
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);

  for (const file of files) {
    const filePath = path.join(ROOT, file);
    if (!fs.existsSync(filePath)) {
      console.error('Missing file:', file);
      process.exit(1);
    }
    const content = fs.readFileSync(filePath);
    const compressed = zlib.deflateRawSync(content, { level: 6 });
    const nameBytes = Buffer.from(file, 'utf8');
    const crc = crc32(content);

    const lfh = Buffer.alloc(30 + nameBytes.length);
    lfh.writeUInt32LE(0x04034b50, 0);
    lfh.writeUInt16LE(20, 4);
    lfh.writeUInt16LE(0, 6);
    lfh.writeUInt16LE(8, 8);
    lfh.writeUInt16LE(dosTime, 10);
    lfh.writeUInt16LE(dosDate, 12);
    lfh.writeUInt32LE(crc, 14);
    lfh.writeUInt32LE(compressed.length, 18);
    lfh.writeUInt32LE(content.length, 22);
    lfh.writeUInt16LE(nameBytes.length, 26);
    lfh.writeUInt16LE(0, 28);
    nameBytes.copy(lfh, 30);

    parts.push(lfh);
    parts.push(compressed);

    const cde = Buffer.alloc(46 + nameBytes.length);
    cde.writeUInt32LE(0x02014b50, 0);
    cde.writeUInt16LE(20, 4);
    cde.writeUInt16LE(20, 6);
    cde.writeUInt16LE(0, 8);
    cde.writeUInt16LE(8, 10);
    cde.writeUInt16LE(dosTime, 12);
    cde.writeUInt16LE(dosDate, 14);
    cde.writeUInt32LE(crc, 16);
    cde.writeUInt32LE(compressed.length, 20);
    cde.writeUInt32LE(content.length, 24);
    cde.writeUInt16LE(nameBytes.length, 28);
    cde.writeUInt16LE(0, 30);
    cde.writeUInt16LE(0, 32);
    cde.writeUInt16LE(0, 34);
    cde.writeUInt16LE(0, 36);
    cde.writeUInt32LE(0, 38);
    cde.writeUInt32LE(offset, 42);
    nameBytes.copy(cde, 46);

    centralDir.push(cde);
    offset += lfh.length + compressed.length;
  }

  const centralDirBuf = Buffer.concat(centralDir);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDirBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  const finalBuf = Buffer.concat([...parts, centralDirBuf, eocd]);
  fs.writeFileSync(outputPath, finalBuf);

  console.log('Created:', outputPath);
  console.log('Size:', finalBuf.length, 'bytes');
  for (const file of files) {
    console.log(' -', file);
  }
}

buildZip(OUTPUT, FILES);
