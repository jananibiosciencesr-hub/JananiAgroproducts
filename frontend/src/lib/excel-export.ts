import * as XLSX from "xlsx";

/**
 * Downloads data as a genuine Microsoft Excel workbook (.xlsx).
 * Guarantees that Windows opens it directly in Microsoft Excel (never Notepad).
 *
 * @param data Array of objects (key-value rows) or 2D array of headers & values
 * @param sheetName Name of the sheet inside the workbook (e.g. "Categories", "Orders")
 * @param filename File name without or with extension (e.g. "Janani_Categories_2026-11-12")
 */
export function downloadExcelSheet<T extends Record<string, any> | any[]>(
  data: T[],
  sheetName: string,
  filename: string
): boolean {
  if (!data || data.length === 0) {
    return false;
  }

  try {
    // 1. Create worksheet from either 2D array or object array
    const ws = Array.isArray(data[0])
      ? XLSX.utils.aoa_to_sheet(data as any[][])
      : XLSX.utils.json_to_sheet(data);

    // 2. Auto-fit column widths so text is clearly visible in Excel without truncation
    if (ws["!ref"]) {
      const range = XLSX.utils.decode_range(ws["!ref"]);
      const colWidths: { wch: number }[] = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxLen = 12;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
          if (cell && cell.v !== undefined && cell.v !== null) {
            const str = String(cell.v);
            if (str.length > maxLen) {
              maxLen = Math.min(str.length + 3, 60);
            }
          }
        }
        colWidths.push({ wch: maxLen });
      }
      ws["!cols"] = colWidths;
    }

    // 3. Create workbook and append worksheet
    const wb = XLSX.utils.book_new();
    const safeSheetName = (sheetName || "Sheet1").slice(0, 31).replace(/[\\/?*[\]]/g, "");
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName);

    // 4. Generate binary XLSX buffer and trigger download as true .xlsx
    const cleanFilename = filename.toLowerCase().endsWith(".xlsx") ? filename : `${filename}.xlsx`;
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = cleanFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("Excel generation error:", err);
    return false;
  }
}

