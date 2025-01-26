document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

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
            showAttendancePanel();
            showAdminPanel();
        } else {
            alert('登录失败');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

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
    }
});

function showAttendancePanel() {
    document.querySelector('.login-form').style.display = 'none';
    document.querySelector('.attendance-panel').style.display = 'block';
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