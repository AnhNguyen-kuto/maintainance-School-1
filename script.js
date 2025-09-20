document.addEventListener("DOMContentLoaded", () => {
  const roomsDiv      = document.getElementById("rooms");
  const selInput      = document.getElementById("selectedMachines");
  const cntInput      = document.getElementById("machineCount");
  const form          = document.getElementById("scheduleForm");
  const statusSelect  = document.getElementById("status");
  const scheduleInput = document.getElementById("schedule");
  const scheduleList  = document.getElementById("scheduleList");
  const exportBtn     = document.getElementById("exportCsv");

  let records = JSON.parse(localStorage.getItem("records") || "[]");
  let selectedMachines = [];

  // Khởi tạo biểu tượng 40 máy cho mỗi phòng
  roomsDiv.querySelectorAll(".machines").forEach(div => {
    const roomName = div.parentElement.dataset.room;
    for (let i = 1; i <= 40; i++) {
      const span = document.createElement("span");
      span.className   = "machine";
      span.textContent = "💻";
      span.dataset.id  = `${roomName}-${i}`;
      div.appendChild(span);
    }
  });

  // Chọn / bỏ chọn máy
  roomsDiv.addEventListener("click", e => {
    if (!e.target.classList.contains("machine")) return;
    const id = e.target.dataset.id;
    if (e.target.classList.toggle("selected")) {
      selectedMachines.push(id);
    } else {
      selectedMachines = selectedMachines.filter(x => x !== id);
    }
    selInput.value = selectedMachines.join(", ");
    cntInput.value = selectedMachines.length;
  });

  // Hiển thị danh sách lịch từ localStorage
  function renderList() {
    scheduleList.innerHTML = "";
    if (records.length === 0) {
      scheduleList.innerHTML = "<li>Chưa có lịch nào.</li>";
      return;
    }
    records.forEach(r => {
      const li = document.createElement("li");
      li.textContent = `${r.timestamp} – ${r.machines} – ${r.status} – ${r.schedule}`;
      scheduleList.appendChild(li);
    });
  }

  // Xử lý submit form
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (selectedMachines.length === 0) {
      alert("Vui lòng chọn ít nhất một máy!");
      return;
    }
    const rec = {
      timestamp: new Date().toLocaleString(),
      machines:  selectedMachines.join(", "),
      status:    statusSelect.value,
      schedule:  scheduleInput.value.replace("T", " ")
    };
    records.push(rec);
    localStorage.setItem("records", JSON.stringify(records));

    // reset và cập nhật UI
    selectedMachines = [];
    roomsDiv.querySelectorAll(".machine.selected")
      .forEach(el => el.classList.remove("selected"));
    selInput.value = "";
    cntInput.value = "";
    form.reset();
    renderList();
  });

  // Xuất file CSV
  exportBtn.addEventListener("click", () => {
    if (records.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }
    const header = ["Timestamp", "Machines", "Status", "Schedule"];
    const rows = records.map(r =>
      [r.timestamp, r.machines, r.status, r.schedule]
        .map(field => `"${field.replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `maintenance_records_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Khởi chạy
  renderList();
});