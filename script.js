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
