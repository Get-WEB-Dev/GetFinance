import { deflateSync } from "node:zlib";

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, checksum]);
}

/** A real, decodable PNG. Noisy images don't compress, so they come out large. */
export function makePng(width: number, height: number, noisy: boolean): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // colour type: RGB

  const rowLength = width * 3 + 1;
  const raw = Buffer.alloc(rowLength * height);
  let seed = 12345;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width * 3; x++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      raw[y * rowLength + 1 + x] = noisy ? seed >>> 24 : 200;
    }
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** A file that starts with the PDF signature but is the requested size. */
export function makePdfOfSize(bytes: number): Buffer {
  const buffer = Buffer.alloc(bytes);
  buffer.write("%PDF-1.4\n");
  return buffer;
}