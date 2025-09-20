// Thay YOUR_SPREADSHEET_ID bằng ID của file MaintenanceDB
const SPREADSHEET_ID = "1nP3WoDEkkXtxPCgD_jN3NG3SP3MVuUvlCRtsCsgjfss";
const SHEET_NAME     = "Records";

function doGet() {
  return HtmlService
    .createHtmlOutputFromFile("index")
    .setTitle("Quản lý bảo trì máy tính");
}

function getRecords() {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const [headers, ...rows] = sheet.getDataRange().getValues();
  return rows.map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    return obj;
  });
}

function submitRecord(data) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  sheet.appendRow([
    new Date(),           // Timestamp
    data.machines,        // Danh sách máy, phân tách bởi ", "
    data.status,          // Trạng thái bảo trì
    data.schedule         // Ngày giờ bảo trì
  ]);
  return { status: "success" };
}