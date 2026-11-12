import { cleanPrintText, type ReceiptLayout } from "./receipt";
import { PrintError, type PrinterProfile } from "./types";

const PC850 = [
  "ÇüéâäàåçêëèïîìÄÅ",
  "ÉæÆôöòûùÿÖÜø£Ø×ƒ",
  "áíóúñÑªº¿®¬½¼¡«»",
  "░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐",
  "└┴┬├─┼ãÃ╚╔╩╦╠═╬¤",
  "ðÐÊËÈıÍÎÏ┘┌█▄¦Ì▀",
  "ÓßÔÒõÕµþÞÚÛÙýÝ¯´",
  "­±‗¾¶§÷¸°¨·¹³²■ ",
].join("");

function encode(text: string, encoding: PrinterProfile["encoding"]) {
  return Array.from(cleanPrintText(text), character => {
    const ascii = character.charCodeAt(0);
    if (ascii >= 32 && ascii <= 126) return ascii;
    if (encoding === "cp858" && character === "€") return 0xd5;
    const index = PC850.indexOf(character);
    if (index < 0 || (encoding === "cp858" && index === 0x55)) throw new PrintError("incompatible");
    return index + 128;
  });
}

function wrap(text: string, columns: number) {
  const lines: string[] = [];
  let rest = text;
  while (rest.length > columns) {
    const boundary = rest.lastIndexOf(" ", columns);
    const end = boundary > 0 ? boundary : columns;
    lines.push(rest.slice(0, end));
    rest = rest.slice(end).trimStart();
  }
  return [...lines, rest];
}

/** ESC/POS text mode. Optional commands are enabled by the configured capabilities. */
export function renderEscPos(layout: ReceiptLayout, profile: PrinterProfile): Uint8Array {
  const bytes: number[] = [];
  const columns = profile.width === 58 ? 32 : 42;
  for (let copy = 0; copy < profile.copies; copy++) {
    bytes.push(27, 64, 27, 77, 0, 27, 116, profile.encoding === "cp858" ? 19 : 2);
    for (const line of layout.lines) {
      const text = line.separator ? "-".repeat(columns) : cleanPrintText(line.text);
      // Reject unrepresentable characters before splitting UTF-16 strings.
      encode(text, profile.encoding);
      bytes.push(27, 97, Number(line.center), 27, 69, Number(line.bold), 29, 33, Number(line.size >= 11));
      for (const row of wrap(text, columns)) bytes.push(...encode(row, profile.encoding), 10);
    }
    bytes.push(27, 69, 0, 29, 33, 0);
    if (layout.qr && profile.capabilities.qr) {
      // QR store has an explicit byte length. Keep its payload printable ASCII.
      if (!/^[ -~]{1,128}$/.test(layout.qr)) throw new PrintError("invalid");
      const data = Array.from(new TextEncoder().encode(layout.qr));
      bytes.push(27, 97, 1);
      bytes.push(29, 40, 107, 4, 0, 49, 65, 50, 0); // Model 2
      bytes.push(29, 40, 107, 3, 0, 49, 67, 4); // Module size
      bytes.push(29, 40, 107, data.length + 3, 0, 49, 80, 48, ...data);
      bytes.push(29, 40, 107, 3, 0, 49, 81, 48, 10);
    }
    bytes.push(27, 97, 0, 27, 100, 4);
    if (profile.cut && profile.capabilities.cut) bytes.push(29, 86, 0);
  }
  return Uint8Array.from(bytes);
}
