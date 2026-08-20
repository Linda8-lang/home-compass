import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ExcelJS from "exceljs";

/**
 * Loads a workbook from raw XLSX bytes via a temp file rather than
 * `workbook.xlsx.load(buffer)` — @types/node's Buffer<T> generic is
 * invariant in a way that makes ArrayBuffer-derived buffers structurally
 * incompatible with exceljs's declared `Buffer` param across separately
 * resolved @types/node copies. `readFile(path)` sidesteps that entirely.
 */
export async function loadWorkbookFromBytes(body: ArrayBuffer): Promise<ExcelJS.Workbook> {
  const tmpPath = path.join(os.tmpdir(), `ingest-${process.pid}-${Date.now()}.xlsx`);
  fs.writeFileSync(tmpPath, new Uint8Array(body));
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(tmpPath);
    return workbook;
  } finally {
    fs.rmSync(tmpPath, { force: true });
  }
}
