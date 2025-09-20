document.addEventListener("DOMContentLoaded", () => {
  const roomsDiv       = document.getElementById("rooms");
  const machinesElems  = roomsDiv.querySelectorAll(".machines");
  const selectedInput  = document.getElementById("selectedMachines");
  const countInput     = document.getElementById("machineCount");
  const form           = document.getElementById("scheduleForm");
  const statusSelect   = document.getElementById("status");
  const scheduleInput  = document.getElementById("schedule");
  const scheduleList   = document.getElementById("scheduleList");

  let selectedMachines = [];

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
  
  // 1. Khởi tạo 40 máy cho mỗi phòng
  machinesElems.forEach(machinesDiv => {
    const roomName = machinesDiv.parentElement.dataset.room;
    for (let i = 1; i <= 40; i++) {
      const span = document.createElement("span");
      span.className = "machine";
      span.textContent = "💻";
      span.dataset.id = `${roomName}-${i}`;
      machinesDiv.appendChild(span);
    }
  });

  // 2. Bắt sự kiện click để chọn/bỏ chọn máy
  roomsDiv.addEventListener("click", e => {
    if (!e.target.classList.contains("machine")) return;
    const id = e.target.dataset.id;
    if (e.target.classList.toggle("selected")) {
      selectedMachines.push(id);
    } else {
      selectedMachines = selectedMachines.filter(x => x !== id);
    }
    updateSelectionForm();
  });

  // 3. Cập nhật ô hiển thị máy đã chọn và tổng số máy
  function updateSelectionForm() {
    selectedInput.value = selectedMachines.join(", ");
    countInput.value = selectedMachines.length;
  }

  // 4. Tải danh sách lịch đã lưu từ Google Sheet
  function loadRecords() {
    google.script.run
      .withSuccessHandler(renderScheduleList)
      .getRecords();
  }

  // 5. Hiển thị danh sách lên lịch
  function renderScheduleList(records) {
    scheduleList.innerHTML = "";
    if (records.length === 0) {
      scheduleList.innerHTML = "<li>Chưa có lịch nào.</li>";
      return;
    }
    records.forEach(r => {
      const li = document.createElement("li");
      li.textContent = `${r.Timestamp} – ${r.Machines} – ${r.Status} – ${r.Schedule}`;
      scheduleList.appendChild(li);
    });
  }

  // 6. Xử lý submit form: lưu lên Google Sheet
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (selectedMachines.length === 0) {
      alert("Vui lòng chọn ít nhất một máy!");
      return;
    }
    const data = {
      machines: selectedMachines.join(", "),
      status:   statusSelect.value,
      schedule: scheduleInput.value
    };
    google.script.run
      .withSuccessHandler(res => {
        if (res.status === "success") {
          alert("✅ Đã lưu lịch bảo trì!");
          // reset lựa chọn
          selectedMachines = [];
          document.querySelectorAll(".machine.selected")
            .forEach(el => el.classList.remove("selected"));
          updateSelectionForm();
          form.reset();
          loadRecords();
        }
      })
      .submitRecord(data);
  });

  // Chạy lần đầu
  updateSelectionForm();
  loadRecords();
});
