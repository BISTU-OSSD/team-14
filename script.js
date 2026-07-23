// ============================================================
//  第一部分：数据层（localStorage 存储引擎）
//  负责人：成员A
// ============================================================

const STORAGE_KEY = 'animeTracker';

// 默认示例
const DEFAULT_DATA = [
    { id: 1, name: '葬送的芙莉莲', total: 28, current: 12, status: 'watching' },
    { id: 2, name: '迷宫饭', total: 24, current: 24, status: 'completed' },
    { id: 3, name: '药屋少女的呢喃', total: 24, current: 5, status: 'watching' },
];

// 获取所有数据
function getAnimeList() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
        return DEFAULT_DATA;
    }
    try {
        return JSON.parse(data);
    } catch {
        return DEFAULT_DATA;
    }
}

// 保存数据
function saveAnimeList(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// 生成唯一ID
function generateId() {
    return Date.now() + Math.random() * 1000;
}

// 计算状态
function calcStatus(current, total) {
    if (current >= total) return 'completed';
    if (current === 0) return 'plan';
    return 'watching';
}


// 导出供其他函数使用（全局挂载）
window.getAnimeList = getAnimeList;
window.saveAnimeList = saveAnimeList;
window.generateId = generateId;
window.calcStatus = calcStatus;




function setupAddForm() {
    const addBtn = document.getElementById('addBtn');
    const nameInput = document.getElementById('animeName');
    const totalInput = document.getElementById('totalEp');
    const currentInput = document.getElementById('currentEp');

    addBtn.addEventListener('click', function() {
        const name = nameInput.value.trim();
        const total = parseInt(totalInput.value);
        const current = parseInt(currentInput.value) || 0;

        if (!name) { alert('❌ 请输入剧名！'); return; }
        if (!total || total < 1) { alert('❌ 请输入有效的总集数（≥1）！'); return; }

        const list = window.getAnimeList();
        const newItem = {
            id: window.generateId(),
            name: name,
            total: total,
            current: current,
            status: window.calcStatus(current, total),
        };
        list.push(newItem);
        window.saveAnimeList(list);

        nameInput.value = '';
        totalInput.value = '';
        currentInput.value = '0';

        // 触发全局刷新
        window.dispatchEvent(new Event('dataChanged'));
    });
}

document.addEventListener('DOMContentLoaded', setupAddForm);
//  第三部分：卡片渲染与进度更新

function renderCards(list) {
    const container = document.getElementById('cardList');

    if (!list || list.length === 0) {
        container.innerHTML = '<div class="empty-state">🎬 还没有剧集，赶快添加一部吧！</div>';
        return;
    }

    let html = '';
    list.forEach(item => {
        const progress = Math.min(Math.round((item.current / item.total) * 100), 100);
        const statusMap = {
            'watching': '<span class="status-tag watching">⏳ 在看</span>',
            'plan': '<span class="status-tag plan">📅 想看</span>',
            'completed': '<span class="status-tag completed">✅ 已完结</span>'
        };
        html += `
            <div class="card" data-id="${item.id}">
                <h3 title="${item.name}">${item.name}</h3>
                <div class="ep-info">📺 第 ${item.current} 集 / 共 ${item.total} 集</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${progress}%;"></div>
                </div>
                <div class="card-actions">
                    <button class="btn-increase">➕ 看了一集</button>
                    <button class="btn-delete">🗑️ 删除</button>
                </div>
                <div>${statusMap[item.status] || item.status}</div>
            </div>
        `;
    });
    container.innerHTML = html;

    // 事件委托：+1
    container.querySelectorAll('.btn-increase').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.card');
            const id = parseFloat(card.dataset.id);
            window.dispatchEvent(new CustomEvent('increaseEpisode', { detail: { id } }));
        });
    });

    // 事件委托：删除
    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.card');
            const id = parseFloat(card.dataset.id);
            if (confirm('确定要删除这部番剧吗？')) {
                window.dispatchEvent(new CustomEvent('deleteAnime', { detail: { id } }));
            }
        });
    });
}

// 处理 +1
function handleIncrease(e) {
    const id = e.detail.id;
    const list = window.getAnimeList();
    const item = list.find(d => d.id === id);
    if (item) {
        item.current = Math.min(item.current + 1, item.total);
        item.status = window.calcStatus(item.current, item.total);
        window.saveAnimeList(list);
        window.dispatchEvent(new Event('dataChanged'));
    }
}

// 处理删除
function handleDelete(e) {
    const id = e.detail.id;
    let list = window.getAnimeList();
    list = list.filter(d => d.id !== id);
    window.saveAnimeList(list);
    window.dispatchEvent(new Event('dataChanged'));
}

document.addEventListener('increaseEpisode', handleIncrease);
document.addEventListener('deleteAnime', handleDelete);

//  第四部分：Tab 筛选与统计

let currentFilter = 'all';

function setupTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.status;
            window.dispatchEvent(new Event('filterChanged'));
        });
    });
}

function getFilteredList(list) {
    if (currentFilter === 'all') return list;
    return list.filter(item => item.status === currentFilter);
}

function updateStats(list) {
    document.getElementById('totalCount').innerText = list.length;
    const watching = list.filter(item => item.status === 'watching').length;
    document.getElementById('watchingCount').innerText = watching;
}

document.addEventListener('DOMContentLoaded', setupTabs);


// 启动器

// 监听数据变化：只要数据变了（添加、+1、删除），就自动重新渲染列表和统计
document.addEventListener('dataChanged', function() {
    const list = window.getAnimeList();      // 成员A：获取数据
    renderCards(list);                       // 成员C：渲染卡片
    updateStats(list);                       // 成员D：更新统计
});

// 监听筛选变化：点击 Tab 时，重新渲染筛选后的列表
document.addEventListener('filterChanged', function() {
    const list = window.getAnimeList();      // 成员A：获取数据
    const filtered = getFilteredList(list);  // 成员D：按当前 Tab 筛选
    renderCards(filtered);                   // 成员C：渲染筛选后的卡片
    updateStats(list);                       // 成员D：更新统计（总数不变）
});

// 页面加载时的初始化（替换掉旧的只打印日志的占位符）
function renderAll() {
    const list = window.getAnimeList();      // 成员A：获取数据
    renderCards(list);                       // 成员C：第一次显示所有卡片
    updateStats(list);                       // 成员D：第一次更新统计数字
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', renderAll);



function renderAll() {
    console.log('✅ 页面已加载，等待各模块合并完成...');
}

document.addEventListener('DOMContentLoaded', renderAll);

