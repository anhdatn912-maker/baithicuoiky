// ==========================================================================
// 1. THỜI GIAN THỰC & ĐỒNG BỘ LỊCH TUẦN
// ==========================================================================
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


// ==========================================================================
// 2. HỆ THỐNG THÔNG BÁO & ĐẶT NHẮC HẸN NHANH
// ==========================================================================
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

function addReminder() {
    const titleInput = document.getElementById('remindTitle');
    const timeInput = document.getElementById('remindTime');
    const notifList = document.getElementById('notifList');

    if (!titleInput || !titleInput.value.trim()) {
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

    if (notifList) {
        notifList.insertBefore(newNotif, notifList.firstChild);
    }

    titleInput.value = '';
    if (timeInput) timeInput.value = '';

    alert('Đã thêm lịch nhắc hẹn thành công!');
}


// ==========================================================================
// 3. TỰ ĐỘNG TẢI DANH SÁCH CÂY TRỒNG & BỘ LỌC
// ==========================================================================
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
                    <div class="card-actions" style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                        <a href="nhat-ky.html" class="btn-outline" style="text-decoration: none;">Xem nhật ký</a>
                        <button class="btn-icon" onclick="deletePlant(${plant.id})" title="Xóa chậu cây" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1rem;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            container.appendChild(plantCard);
        });
    }

    initFilterSystem();
    renderMonthlyCalendar();
});

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

function deletePlant(id) {
    if (confirm('Bạn có chắc chắn muốn xóa chậu cây này khỏi vườn không?')) {
        let savedPlants = JSON.parse(localStorage.getItem('urban_plants')) || [];
        savedPlants = savedPlants.filter(p => p.id !== id);
        localStorage.setItem('urban_plants', JSON.stringify(savedPlants));
        alert('Đã xóa chậu cây thành công!');
        location.reload();
    }
}


// ==========================================================================
// 4. LỊCH THÁNG & GHI CHÚ TRỰC TIẾP TRÊN Ô NGÀY
// ==========================================================================
let selectedDayKey = null;

function renderMonthlyCalendar() {
    const gridMonth = document.getElementById('calendarGridMonth');
    const monthTitle = document.getElementById('monthTitle');
    
    if (!gridMonth) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
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

function closeNoteModal() {
    const modal = document.getElementById('noteModal');
    if (modal) modal.style.display = 'none';
}

function saveNoteForDay() {
    const textarea = document.getElementById('noteContentInput');
    if (!textarea || !selectedDayKey) return;

    let savedNotes = JSON.parse(localStorage.getItem('urban_calendar_notes')) || {};
    const content = textarea.value.trim();

    if (content) {
        savedNotes[selectedDayKey] = content;
    } else {
        delete savedNotes[selectedDayKey];
    }

    localStorage.setItem('urban_calendar_notes', JSON.stringify(savedNotes));
    closeNoteModal();
    renderMonthlyCalendar();
    alert('Đã lưu ghi chú cho ngày thành công!');
}


// ==========================================================================
// 5. XỬ LÝ ĐĂNG KÝ, ĐĂNG NHẬP & HIỂN THỊ TÀI KHOẢN
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    // A. Xử lý Đăng ký
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('fullname').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            localStorage.setItem('registeredName', name);
            localStorage.setItem('registeredEmail', email);
            localStorage.setItem('registeredPassword', password);

            alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
            window.location.href = 'dang-nhap.html';
        });
    }

    // B. Xử lý Đăng nhập
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('email').value;
            const passInput = document.getElementById('password').value;

            const savedEmail = localStorage.getItem('registeredEmail');
            const savedPass = localStorage.getItem('registeredPassword');
            const savedName = localStorage.getItem('registeredName') || 'Gia chủ Xanh';

            if ((savedEmail && emailInput === savedEmail && passInput === savedPass) || (!savedEmail)) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUserName', savedName);
                
                alert('Đăng nhập thành công! Chào mừng bạn trở lại khu vườn.');
                window.location.href = 'index.html';
            } else {
                alert('Sai tài khoản hoặc mật khẩu! Vui lòng kiểm tra lại.');
            }
        });
    }

    // C. Hiển thị trạng thái tài khoản trên Header
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUserName = localStorage.getItem('currentUserName') || 'Thành viên';
    const loginBtn = document.querySelector('.btn-login');
    
    if (isLoggedIn === 'true' && loginBtn) {
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
        
        loginBtn.replaceWith(userContainer);

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('isLoggedIn');
                alert('Đã đăng xuất tài khoản thành công!');
                window.location.href = 'index.html';
            });
        }
    }
});