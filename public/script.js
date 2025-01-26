// 切换登录和注册表单
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // 移除所有 tab 的 active 类
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        // 移除所有 form 的 active 类
        document.querySelectorAll('.form').forEach(f => f.classList.remove('active'));
        
        // 添加当前 tab 的 active 类
        tab.classList.add('active');
        // 显示对应的表单
        const formId = tab.dataset.tab + 'Form';
        document.getElementById(formId).classList.add('active');
    });
});

// 注册功能
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('注册成功，请登录');
            // 切换到登录表单
            document.querySelector('[data-tab="login"]').click();
        } else {
            alert(data.message || '注册失败');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('注册失败，请稍后重试');
    }
});

// 登录功能
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username);
            showAttendancePanel();
            showAdminPanel();
        } else {
            const data = await response.json();
            alert(data.message || '登录失败');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('登录失败，请稍后重试');
    }
});

// 签到功能
document.getElementById('checkInBtn').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('请先登录');
        return;
    }

    try {
        const response = await fetch('/api/attendance/checkin', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById('checkInStatus').textContent = 
                `签到成功！时间：${new Date().toLocaleString()}`;
            document.getElementById('checkInBtn').disabled = true;
        } else {
            alert(data.message || '签到失败');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('签到失败，请稍后重试');
    }
});

// 退出登录
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.reload();
});

function showAttendancePanel() {
    document.querySelector('.form-container').style.display = 'none';
    document.querySelector('.attendance-panel').style.display = 'block';
    const username = localStorage.getItem('username');
    document.getElementById('userWelcome').textContent = `欢迎，${username}`;
}

async function showAdminPanel() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/users/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        if (data.role === 'admin') {
            document.querySelector('.admin-panel').style.display = 'block';
            initAdminFeatures();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function initAdminFeatures() {
    document.getElementById('queryBtn').addEventListener('click', async () => {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(
                `/api/attendance/records?startDate=${startDate}&endDate=${endDate}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const records = await response.json();
            displayRecords(records);
        } catch (error) {
            console.error('Error:', error);
            alert('获取记录失败，请稍后重试');
        }
    });
}

function displayRecords(records) {
    const tbody = document.querySelector('#recordsTable tbody');
    tbody.innerHTML = '';

    records.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.userId.username}</td>
            <td>${new Date(record.date).toLocaleDateString()}</td>
            <td>${new Date(record.checkInTime).toLocaleTimeString()}</td>
        `;
        tbody.appendChild(row);
    });
}

// 检查是否已登录
const token = localStorage.getItem('token');
if (token) {
    showAttendancePanel();
    showAdminPanel();
} 