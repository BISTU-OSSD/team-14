// ============================================================
//  第一部分：数据层（localStorage 存储引擎）
//  负责人：成员A
// ============================================================

const STORAGE_KEY = 'animeTracker';

// 默认示例数据
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

// ============================================================
//  第二部分：渲染与事件绑定（后续由各成员补充）
//  当前仅为占位，合并后会被完整替换
// ============================================================

function renderAll() {
    console.log('✅ 页面已加载，等待各模块合并完成...');
}

document.addEventListener('DOMContentLoaded', renderAll);

//  第一部分：数据层（localStorage 存储引擎）
const STORAGE_KEY = 'animeTracker';

const DEFAULT_DATA = [
    { id: 1, name: '葬送的芙莉莲', total: 28, current: 12, status: 'watching' },
    { id: 2, name: '迷宫饭', total: 24, current: 24, status: 'completed' },
    { id: 3, name: '药屋少女的呢喃', total: 24, current: 5, status: 'watching' },
];

function getAnimeList() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
        return DEFAULT_DATA;
    }
    try { return JSON.parse(data); } catch { return DEFAULT_DATA; }
}

function saveAnimeList(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function generateId() {
    return Date.now() + Math.random() * 1000;
}

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
            if (confirm('确定要删除这部番吗？')) {
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

