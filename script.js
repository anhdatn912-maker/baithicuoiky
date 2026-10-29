// 1. Hàm cập nhật thời gian thực & đồng bộ lịch tuần
function updateRealTime() {
    const now = new Date();
    const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const dateString = now.toLocaleDateString('vi-VN', dateOptions);
    const timeString = now.toLocaleTimeString('vi-VN');

    const badgeElements = document.querySelectorAll('.badge');
    badgeElements.forEach(badge => {
        if (badge.textContent.includes('/') || badge.textContent.includes('Hôm nay') || badge.textContent.includes('Đang tải')) {
            badge.textContent = `Hôm nay: ${dateString} - ${timeString}`;
        }
    });

    const currentDay = now.getDay();
    const dayColumns = document.querySelectorAll('.day-column');
    
    if (dayColumns.length === 7) {
        dayColumns.forEach((col, index) => {
            col.classList.remove('today');
            let jsIndexToColIndex = (currentDay === 0) ? 6 : currentDay - 1;
            if (index === jsIndexToColIndex) {
                col.classList.add('today');
            }
        });
    }
}

updateRealTime();
setInterval(updateRealTime, 1000);

// 2. Tính năng tương tác lọc danh sách cây & bài viết cẩm nang
const filterButtons = document.querySelectorAll('.filter-btn');
const filterCards = document.querySelectorAll('.plant-detailed-card');

if (filterButtons.length > 0 && filterCards.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            filterCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (!filterValue || filterValue === 'all' || cardCategory === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// 3. Xử lý bật/tắt bảng thông báo & thêm nhắc hẹn mới
const notifBtn = document.getElementById('notifBtn');
const notifDropdown = document.getElementById('notifDropdown');

if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
            notifDropdown.classList.remove('active');
        }
    });
}

// Hàm thêm nhắc hẹn từ form trong menu thông báo
function addReminder() {
    const titleInput = document.getElementById('remindTitle');
    const timeInput = document.getElementById('remindTime');
    const notifList = document.getElementById('notifList');

    if (!titleInput.value.trim()) {
        alert('Vui lòng nhập nội dung nhắc hẹn!');
        return;
    }

    const newNotif = document.createElement('div');
    newNotif.className = 'notif-item unread';
    newNotif.innerHTML = `
        <i class="fa-solid fa-clock text-green"></i>
        <div>
            <p><strong>Nhắc hẹn:</strong> ${titleInput.value}</p>
            <span class="notif-time">${timeInput.value ? new Date(timeInput.value).toLocaleString('vi-VN') : 'Vừa xong'}</span>
        </div>
    `;

    notifList.insertBefore(newNotif, notifList.firstChild);

    titleInput.value = '';
    timeInput.value = '';

    alert('Đã thêm lịch nhắc hẹn thành công!');
}

// --- Tính năng Sao lưu & Khôi phục dữ liệu tài khoản ---
function exportData() {
    const backupData = {
        gardens: localStorage.getItem('urban_gardens') || 'Dữ liệu mẫu vườn phố đô thị',
        reminders: localStorage.getItem('urban_reminders') || 'Danh sách nhắc hẹn mặc định',
        exportDate: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `urbangarden_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    
    alert('Đã tải xuống file sao lưu tài khoản thành công!');
}

function importData() {
    const fileInput = document.getElementById('importFile');
    if (!fileInput || fileInput.files.length === 0) {
        alert('Vui lòng chọn một tệp sao lưu (.json) hợp lệ!');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.gardens) {
                localStorage.setItem('urban_gardens', importedData.gardens);
            }
            if (importedData.reminders) {
                localStorage.setItem('urban_reminders', importedData.reminders);
            }
            alert('Khôi phục dữ liệu tài khoản thành công! Hệ thống sẽ tải lại trang.');
            location.reload();
        } catch (error) {
            alert('Tệp tin sao lưu không đúng định dạng!');
        }
    };
    reader.readAsText(file);
}

// --- Kiểm tra trạng thái đăng nhập để thay đổi giao diện Header ---
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUserName = localStorage.getItem('currentUserName') || 'Thành viên';
    
    // Tìm vị trí nút đăng nhập trong header
    const loginBtn = document.querySelector('.btn-login');
    
    if (isLoggedIn === 'true' && loginBtn) {
        // Tạo giao diện hiển thị tên người dùng và nút Đăng xuất
        const userContainer = document.createElement('div');
        userContainer.style.display = 'flex';
        userContainer.style.alignItems = 'center';
        userContainer.style.gap = '10px';
        
        userContainer.innerHTML = `
            <span style="font-size: 0.9rem; font-weight: 600; color: #2e7d32;">
                <i class="fa-solid fa-circle-user" style="font-size: 1.1rem; margin-right: 4px;"></i>${currentUserName}
            </span>
            <button id="logoutBtn" style="background: #e53935; color: white; border: none; padding: 5px 10px; border-radius: 15px; font-size: 0.8rem; cursor: pointer;" title="Đăng xuất">
                Thoát
            </button>
        `;
        
        // Thay thế nút đăng nhập cũ bằng giao diện tài khoản mới
        loginBtn.replaceWith(userContainer);

        // Xử lý sự kiện đăng xuất
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            alert('Đã đăng xuất tài khoản thành công!');
            window.location.href = 'index.html';
        });
    }
});

// --- Hàm tạo lịch tháng tự động ---
function renderMonthlyCalendar() {
    const gridMonth = document.getElementById('calendarGridMonth');
    const monthTitle = document.getElementById('monthTitle');
    
    if (!gridMonth) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 - 11
    const todayDate = now.getDate();

    // Đặt tiêu đề tên tháng và năm
    const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    if (monthTitle) {
        monthTitle.innerHTML = `📅 Lịch Biểu Chăm Sóc - ${monthNames[month]} Năm ${year}`;
    }

    // Ngày đầu tiên của tháng và tổng số ngày trong tháng
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0: Chủ nhật, 1: Thứ 2...
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Điều chỉnh index để bắt đầu từ Thứ Hai (Thứ 2 = 0, Chủ nhật = 6)
    let startingSpace = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    let calendarHTML = '';

    // Thêm các ô trống đầu tháng nếu tháng không bắt đầu từ Thứ Hai
    for (let i = 0; i < startingSpace; i++) {
        calendarHTML += `<div class="calendar-day-cell empty"></div>`;
    }

    // Mẫu một số lịch trình chăm sóc mẫu minh họa trong tháng
    const sampleTasks = {
        2: "Tưới nước rau muống",
        5: "Bón phân cà chua bi",
        10: "Kiểm tra sâu xà lách",
        15: "Xới đất chậu hoa",
        20: "Bổ sung dinh dưỡng thủy canh",
        25: "Tưới toàn bộ vườn",
        28: "Cắt tỉa lá úa"
    };

    // Tạo các ô ngày trong tháng
    for (let day = 1; day <= totalDays; day++) {
        let isToday = (day === todayDate) ? 'today' : '';
        let taskHtml = sampleTasks[day] ? `<div class="day-task-item">${sampleTasks[day]}</div>` : '';

        calendarHTML += `
            <div class="calendar-day-cell ${isToday}">
                <div class="day-number">${day}</div>
                <div class="day-tasks">
                    ${taskHtml}
                </div>
            </div>
        `;
    }

    gridMonth.innerHTML = calendarHTML;
}

// Gọi hàm chạy khi tải trang
window.addEventListener('DOMContentLoaded', () => {
    renderMonthlyCalendar();
});

// --- Tự động tải và hiển thị danh sách cây đã thêm từ localStorage ---
window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('myPlantsContainer');
    if (container) {
        const savedPlants = JSON.parse(localStorage.getItem('urban_plants')) || [];
        
        savedPlants.forEach(plant => {
            const plantCard = document.createElement('div');
            plantCard.className = 'plant-detailed-card';
            plantCard.setAttribute('data-category', plant.category);
            
            plantCard.innerHTML = `
                <img src="${plant.image}" alt="${plant.name}">
                <div class="plant-content">
                    <span class="location-tag">${plant.location}</span>
                    <h3>${plant.name}</h3>
                    <p class="plant-status text-green"><i class="fa-solid fa-circle-check"></i> Sinh trưởng tốt • Đã cập nhật</p>
                    <ul class="plant-specs">
                        <li><span>Ngày gieo trồng:</span> ${plant.date}</li>
                        <li><span>Chu kỳ tưới:</span> ${plant.cycle}</li>
                    </ul>
                    <div class="progress-bar"><div class="progress" style="width: 60%;"></div></div>
                    <div class="card-actions">
                        <a href="nhat-ky.html" class="btn-outline" style="text-decoration: none;">Xem nhật ký</a>
                        <button class="btn-icon" onclick="deletePlant(${plant.id})" title="Xóa chậu cây"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            container.appendChild(plantCard);
        });
    }

    // Kích hoạt bộ lọc sau khi đã load dữ liệu
    initFilterSystem();
});

// Hàm lọc danh mục khu vực
function initFilterSystem() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const plantCards = document.querySelectorAll('.plant-detailed-card');

    if (filterButtons.length > 0 && plantCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter');

                plantCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    if (!filterValue || filterValue === 'all' || cardCategory === filterValue) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
}

// Hàm xóa chậu cây cá nhân đã thêm
function deletePlant(id) {
    if (confirm('Bạn có chắc chắn muốn xóa chậu cây này khỏi vườn không?')) {
        let savedPlants = JSON.parse(localStorage.getItem('urban_plants')) || [];
        savedPlants = savedPlants.filter(p => p.id !== id);
        localStorage.setItem('urban_plants', JSON.stringify(savedPlants));
        alert('Đã xóa chậu cây thành công!');
        location.reload();
    }
}

// --- Tính năng Ghi chú trực tiếp vào các ô ngày trong Lịch Tháng ---
let selectedDayKey = null;

function renderMonthlyCalendar() {
    const gridMonth = document.getElementById('calendarGridMonth');
    const monthTitle = document.getElementById('monthTitle');
    
    if (!gridMonth) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 - 11
    const todayDate = now.getDate();

    const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    if (monthTitle) {
        monthTitle.innerHTML = `📅 Lịch Biểu Chăm Sóc - ${monthNames[month]} Năm ${year}`;
    }

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    let startingSpace = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    let calendarHTML = '';

    for (let i = 0; i < startingSpace; i++) {
        calendarHTML += `<div class="calendar-day-cell empty" style="cursor: default;"></div>`;
    }

    // Lấy danh sách ghi chú đã lưu từ localStorage
    let savedNotes = JSON.parse(localStorage.getItem('urban_calendar_notes')) || {};

    for (let day = 1; day <= totalDays; day++) {
        let isToday = (day === todayDate) ? 'today' : '';
        let dayKey = `${year}-${month + 1}-${day}`;
        let noteText = savedNotes[dayKey] ? `<div class="day-task-item"><i class="fa-solid fa-note-sticky"></i> ${savedNotes[dayKey]}</div>` : '';

        calendarHTML += `
            <div class="calendar-day-cell ${isToday}" onclick="openNoteModal('${dayKey}', ${day})">
                <div class="day-number">${day}</div>
                <div class="day-tasks">
                    ${noteText}
                </div>
            </div>
        `;
    }

    gridMonth.innerHTML = calendarHTML;
}

// Mở hộp thoại nhập ghi chú
function openNoteModal(dayKey, dayNumber) {
    selectedDayKey = dayKey;
    const modal = document.getElementById('noteModal');
    const title = document.getElementById('modalDateTitle');
    const textarea = document.getElementById('noteContentInput');

    if (modal && title && textarea) {
        title.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Ghi chú ngày ${dayNumber}`;
        
        let savedNotes = JSON.parse(localStorage.getItem('urban_calendar_notes')) || {};
        textarea.value = savedNotes[dayKey] || '';
        
        modal.style.display = 'flex';
    }
}

// Đóng hộp thoại
function closeNoteModal() {
    const modal = document.getElementById('noteModal');
    if (modal) modal.style.display = 'none';
}

// Lưu ghi chú vào LocalStorage
function saveNoteForDay() {
    const textarea = document.getElementById('noteContentInput');
    if (!textarea || !selectedDayKey) return;

    let savedNotes = JSON.parse(localStorage.getItem('urban_calendar_notes')) || {};
    const content = textarea.value.trim();

    if (content) {
        savedNotes[selectedDayKey] = content;
    } else {
        delete savedNotes[selectedDayKey]; // Xóa nếu để trống
    }

    localStorage.setItem('urban_calendar_notes', JSON.stringify(savedNotes));
    closeNoteModal();
    renderMonthlyCalendar(); // Vẽ lại lịch để hiện ghi chú
    alert('Đã lưu ghi chú cho ngày thành công!');
}

// Gọi hàm chạy khi tải trang
window.addEventListener('DOMContentLoaded', () => {
    renderMonthlyCalendar();
});