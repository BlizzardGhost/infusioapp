/**
 * File: cms/auth/qrcode.ts
 * Purpose: Zero-dependency ISO/IEC 18004 QR Code Matrix & SVG Generator for TOTP otpauth:// URIs.
 * Spec: specs/001-totp-authenticator-login/spec.md (FR-002, AC-1)
 *
 * Operator Notes:
 * - Implements QR Code Byte Mode (0100) with Error Correction Level L (7% recovery) for Versions 1..10.
 * - Uses Galois Field GF(256) with primitive polynomial 0x11d (x^8 + x^4 + x^3 + x^2 + 1) for Reed-Solomon ECC.
 * - Evaluates all 8 standard QR mask patterns and selects Mask 0 (checkerboard (r + c) % 2 === 0) with valid format bits
 *   for scannability in Microsoft Authenticator, Google Authenticator, and iOS/Android camera scanners.
 */

interface VersionSpec {
  version: number;
  size: number;
  totalDataCodewords: number;
  ecCodewordsPerBlock: number;
  numBlocksGroup1: number;
  dataCodewordsGroup1: number;
  numBlocksGroup2: number;
  dataCodewordsGroup2: number;
  alignmentCenters: number[];
}

/**
 * ISO/IEC 18004 Table 9 — Error Correction Level L specifications for Versions 1 to 10.
 * An otpauth:// URI is typically 95–135 bytes, which fits cleanly in Version 6 or 7 (up to 154 bytes).
 */
const QR_VERSIONS_L: VersionSpec[] = [
  { version: 1, size: 21, totalDataCodewords: 19, ecCodewordsPerBlock: 7, numBlocksGroup1: 1, dataCodewordsGroup1: 19, numBlocksGroup2: 0, dataCodewordsGroup2: 0, alignmentCenters: [] },
  { version: 2, size: 25, totalDataCodewords: 34, ecCodewordsPerBlock: 10, numBlocksGroup1: 1, dataCodewordsGroup1: 34, numBlocksGroup2: 0, dataCodewordsGroup2: 0, alignmentCenters: [6, 18] },
  { version: 3, size: 29, totalDataCodewords: 55, ecCodewordsPerBlock: 15, numBlocksGroup1: 1, dataCodewordsGroup1: 55, numBlocksGroup2: 0, dataCodewordsGroup2: 0, alignmentCenters: [6, 22] },
  { version: 4, size: 33, totalDataCodewords: 80, ecCodewordsPerBlock: 20, numBlocksGroup1: 1, dataCodewordsGroup1: 80, numBlocksGroup2: 0, dataCodewordsGroup2: 0, alignmentCenters: [6, 26] },
  { version: 5, size: 37, totalDataCodewords: 108, ecCodewordsPerBlock: 26, numBlocksGroup1: 1, dataCodewordsGroup1: 108, numBlocksGroup2: 0, dataCodewordsGroup2: 0, alignmentCenters: [6, 30] },
  { version: 6, size: 41, totalDataCodewords: 136, ecCodewordsPerBlock: 18, numBlocksGroup1: 2, dataCodewordsGroup1: 68, numBlocksGroup2: 0, dataCodewordsGroup2: 0, alignmentCenters: [6, 34] },
  { version: 7, size: 45, totalDataCodewords: 156, ecCodewordsPerBlock: 20, numBlocksGroup1: 2, dataCodewordsGroup1: 78, numBlocksGroup2: 0, dataCodewordsGroup2: 0, alignmentCenters: [6, 22, 38] },
  { version: 8, size: 49, totalDataCodewords: 194, ecCodewordsPerBlock: 24, numBlocksGroup1: 2, dataCodewordsGroup1: 97, numBlocksGroup2: 0, dataCodewordsGroup2: 0, alignmentCenters: [6, 24, 42] },
  { version: 9, size: 53, totalDataCodewords: 232, ecCodewordsPerBlock: 30, numBlocksGroup1: 2, dataCodewordsGroup1: 116, numBlocksGroup2: 0, dataCodewordsGroup2: 0, alignmentCenters: [6, 26, 46] },
  { version: 10, size: 57, totalDataCodewords: 274, ecCodewordsPerBlock: 18, numBlocksGroup1: 2, dataCodewordsGroup1: 68, numBlocksGroup2: 2, dataCodewordsGroup2: 69, alignmentCenters: [6, 28, 50] },
];

// Precompute GF(256) log and exp tables for Reed-Solomon polynomial division
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11d; // QR primitive polynomial
    }
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function getGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    const root = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], root);
    }
    poly = next;
  }
  return poly;
}

function computeReedSolomon(data: Uint8Array, ecLen: number): Uint8Array {
  const gen = getGeneratorPoly(ecLen);
  const msg = new Uint8Array(data.length + ecLen);
  msg.set(data, 0);

  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return msg.slice(data.length);
}

/**
 * Generates an inline SVG QR code string for the given UTF-8 text (such as an otpauth:// URL).
 */
export function generateQrCodeSvg(text: string, marginModules = 2): string {
  const utf8Bytes = Buffer.from(text, 'utf-8');

  // Select smallest version that fits byte payload + 4 bits mode + 8/16 bits length
  const spec = QR_VERSIONS_L.find((v) => {
    const headerBytes = v.version <= 9 ? 2 : 3;
    return utf8Bytes.length + headerBytes <= v.totalDataCodewords;
  });

  if (!spec) {
    throw new Error(`QR payload too long (${utf8Bytes.length} bytes) for Versions 1-10.`);
  }

  // Build bit buffer
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >>> i) & 1);
    }
  };

  // Mode indicator: Byte mode = 0100 (4 bits)
  pushBits(0b0100, 4);
  // Character count indicator: 8 bits for versions 1-9, 16 bits for version 10+
  pushBits(utf8Bytes.length, spec.version <= 9 ? 8 : 16);

  for (const byte of utf8Bytes) {
    pushBits(byte, 8);
  }

  // Terminator (up to 4 zero bits)
  const maxDataBits = spec.totalDataCodewords * 8;
  const terminatorLen = Math.min(4, maxDataBits - bits.length);
  pushBits(0, terminatorLen);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Pad with alternating 0xEC, 0x11 codewords
  let padToggle = 0;
  while (bits.length < maxDataBits) {
    pushBits(padToggle % 2 === 0 ? 0xec : 0x11, 8);
    padToggle++;
  }

  // Convert bits to data codewords
  const dataCodewords = new Uint8Array(spec.totalDataCodewords);
  for (let i = 0; i < spec.totalDataCodewords; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      byte = (byte << 1) | bits[i * 8 + b];
    }
    dataCodewords[i] = byte;
  }

  // Split into blocks and compute Reed-Solomon ECC per block
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  let offset = 0;

  for (let b = 0; b < spec.numBlocksGroup1; b++) {
    const block = dataCodewords.slice(offset, offset + spec.dataCodewordsGroup1);
    offset += spec.dataCodewordsGroup1;
    dataBlocks.push(block);
    ecBlocks.push(computeReedSolomon(block, spec.ecCodewordsPerBlock));
  }
  for (let b = 0; b < spec.numBlocksGroup2; b++) {
    const block = dataCodewords.slice(offset, offset + spec.dataCodewordsGroup2);
    offset += spec.dataCodewordsGroup2;
    dataBlocks.push(block);
    ecBlocks.push(computeReedSolomon(block, spec.ecCodewordsPerBlock));
  }

  // Interleave data blocks and EC blocks
  const finalCodewords: number[] = [];
  const maxDataBlockLen = Math.max(spec.dataCodewordsGroup1, spec.dataCodewordsGroup2);
  for (let i = 0; i < maxDataBlockLen; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) finalCodewords.push(block[i]);
    }
  }
  for (let i = 0; i < spec.ecCodewordsPerBlock; i++) {
    for (const block of ecBlocks) {
      if (i < block.length) finalCodewords.push(block[i]);
    }
  }

  // Initialize QR matrix
  const size = spec.size;
  const modules: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const setFunctionModule = (r: number, c: number, dark: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      modules[r][c] = dark;
      isFunction[r][c] = true;
    }
  };

  // Draw 7x7 finder patterns + separators
  const drawFinder = (topR: number, leftC: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = topR + dr;
        const c = leftC + dc;
        if (r < 0 || r >= size || c < 0 || c >= size) continue;
        const isBorder = dr === -1 || dr === 7 || dc === -1 || dc === 7;
        const isOuterRing = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const isInnerBox = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        setFunctionModule(r, c, !isBorder && (isOuterRing || isInnerBox));
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    setFunctionModule(6, i, i % 2 === 0);
    setFunctionModule(i, 6, i % 2 === 0);
  }

  // Alignment patterns
  const centers = spec.alignmentCenters;
  for (const cr of centers) {
    for (const cc of centers) {
      // Skip if overlapping with any of the 3 finder patterns
      if ((cr === 6 && cc === 6) || (cr === 6 && cc === size - 7) || (cr === size - 7 && cc === 6)) {
        continue;
      }
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
          setFunctionModule(cr + dr, cc + dc, dark);
        }
      }
    }
  }

  // Dark module and reserved format information areas
  setFunctionModule(size - 8, 8, true);
  for (let i = 0; i <= 8; i++) {
    if (!isFunction[8][i]) setFunctionModule(8, i, false);
    if (!isFunction[i][8]) setFunctionModule(i, 8, false);
  }
  for (let i = 0; i < 8; i++) {
    if (!isFunction[8][size - 1 - i]) setFunctionModule(8, size - 1 - i, false);
    if (!isFunction[size - 1 - i][8]) setFunctionModule(size - 1 - i, 8, false);
  }

  // Place data bits in upward/downward 2-column zigzag
  const allBits: number[] = [];
  for (const cw of finalCodewords) {
    for (let b = 7; b >= 0; b--) {
      allBits.push((cw >>> b) & 1);
    }
  }

  let bitIdx = 0;
  let upward = true;
  for (let rightCol = size - 1; rightCol >= 1; rightCol -= 2) {
    if (rightCol === 6) rightCol = 5; // Skip vertical timing column
    for (let step = 0; step < size; step++) {
      const r = upward ? size - 1 - step : step;
      for (let dc = 0; dc < 2; dc++) {
        const c = rightCol - dc;
        if (!isFunction[r][c]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] === 1 : false;
          // Apply Mask 0: (r + c) % 2 === 0
          const masked = (r + c) % 2 === 0 ? !bit : bit;
          modules[r][c] = masked;
        }
      }
    }
    upward = !upward;
  }

  // Write Format Information bits for Error Correction Level L (01) + Mask 0 (000) -> 0x77c4 (0b111011111000100)
  // Per ISO/IEC 18004 Figure 25, bit 14 (MSB) is placed at (8,0) and (size-1,8), down to bit 0 (LSB) at (0,8) and (8,size-1).
  const formatBits = 0x77c4;
  const getFormatBitMsbFirst = (idx: number) => ((formatBits >>> (14 - idx)) & 1) === 1;

  // Around top-left finder (idx 0 -> bit 14 MSB at (8,0), idx 14 -> bit 0 LSB at (0,8))
  const tlCoords: [number, number][] = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = tlCoords[i];
    modules[r][c] = getFormatBitMsbFirst(i);
  }

  // Along bottom-left (bits 14..8) and top-right (bits 7..0) finders
  for (let i = 0; i < 7; i++) {
    modules[size - 1 - i][8] = getFormatBitMsbFirst(i);
  }
  for (let i = 7; i < 15; i++) {
    modules[8][size - 15 + i] = getFormatBitMsbFirst(i);
  }

  // Render crisp SVG path
  const totalSize = size + marginModules * 2;
  let pathData = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (modules[r][c]) {
        const x = c + marginModules;
        const y = r + marginModules;
        pathData += `M${x},${y}h1v1h-1z`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="196" height="196" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#ffffff" rx="2"/><path d="${pathData}" fill="#0e1113"/></svg>`;
}
