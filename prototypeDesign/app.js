/**
 * Geek Tab - 主应用逻辑
 * 
 * 包含所有核心功能：数据管理、界面渲染、用户交互
 */

// === 全局状态 ===
let db = JSON.parse(JSON.stringify(DEFAULT_DB));      // 网站数据库
let config = JSON.parse(JSON.stringify(DEFAULT_CONFIG)); // 用户配置
let activeCategory = 'dev';                            // 当前激活的分类

// ========================================
// 应用初始化
// ========================================

/**
 * 应用初始化函数
 * 按顺序执行所有初始化步骤
 */
function init() {
  loadData();              // 加载本地数据
  applyAllSettings();      // 应用用户设置
  
  setupClock();            // 设置时钟
  renderTabs();            // 渲染分类导航
  renderGrid();            // 渲染网站卡片
  setupSpotlight();        // 设置聚光灯效果
  setupSearch();           // 设置搜索功能
  setupKeyboardShortcuts(); // 设置快捷键
}

// ========================================
// 数据管理
// ========================================

/**
 * 从localStorage加载数据
 */
function loadData() {
  // 加载网站数据
  const savedDb = localStorage.getItem(DB_KEY);
  if (savedDb) {
    try { 
       const parsed = JSON.parse(savedDb);
       db = parsed;
       // 确保搜索引擎数据完整
       if(!db.engines || !db.engines.g) {
         db.engines = JSON.parse(JSON.stringify(DEFAULT_DB.engines));
       }
    } catch(e) { 
      console.error('数据加载失败:', e); 
    }
  } else {
    saveDb(); // 首次使用，保存默认数据
  }

  // 加载用户配置
  const savedCfg = localStorage.getItem(CFG_KEY);
  if (savedCfg) {
    try { 
      config = { ...config, ...JSON.parse(savedCfg) }; 
    } catch(e) {
      console.error('配置加载失败:', e);
    }
  } else {
    // 根据浏览器语言设置默认语言
    if(navigator.language.startsWith('zh')) config.locale = 'zh-CN';
    saveConfig();
  }
  
  // 确保当前分类存在
  if(db.categories.length > 0 && !db.categories.find(c => c.key === activeCategory)) {
    activeCategory = db.categories[0].key;
  }
}

/**
 * 保存网站数据到localStorage
 */
function saveDb() { 
  localStorage.setItem(DB_KEY, JSON.stringify(db)); 
}

/**
 * 保存用户配置到localStorage
 */
function saveConfig() { 
  localStorage.setItem(CFG_KEY, JSON.stringify(config)); 
}

// === 设置应用逻辑 ===
function applyAllSettings() {
  const root = document.documentElement;
  
  // 1. Colors
  root.style.setProperty('--primary-color', config.primaryColor);
  root.style.setProperty('--text-main', config.textColor);
  
  // 2. Background
  const bgLayer = document.getElementById('bgLayer');
  const ambient = document.querySelector('.ambient-light');
  
  if (config.bgType === 'default') {
    bgLayer.style.backgroundImage = 'none';
    ambient.style.opacity = '1';
  } else {
    ambient.style.opacity = '0';
    let url = config.bgValue;
    if (config.bgType === 'unsplash') url = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070';
    bgLayer.style.backgroundImage = `url('${url}')`;
  }
  
  // 3. Overlay
  root.style.setProperty('--overlay-opacity', config.overlayOpacity / 100);
  document.getElementById('opacityVal').innerText = config.overlayOpacity + '%';

  // 4. UI Sync
  document.getElementById('opacitySlider').value = config.overlayOpacity;
  document.getElementById('textColorInput').value = config.textColor;
  
  // Background buttons
  document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('btn-bg-default').classList.toggle('active', config.bgType === 'default');
  document.getElementById('btn-bg-unsplash').classList.toggle('active', config.bgType === 'unsplash');
  
  // Language buttons
  document.getElementById('btn-lang-zh').classList.toggle('active', config.locale === 'zh-CN');
  document.getElementById('btn-lang-en').classList.toggle('active', config.locale === 'en-US');
  
  renderEngineList();
  // force clock update
  const now = new Date();
  document.getElementById('clock').innerText = now.toLocaleTimeString(config.locale, { hour12: false });
}

// === UI Actions (Settings) ===
window.setConfig = (key, val) => {
  config[key] = val;
  saveConfig();
  applyAllSettings();
};

window.updateOpacity = (val) => setConfig('overlayOpacity', val);
window.setTheme = (hex) => setConfig('primaryColor', hex);
window.setTextColor = (hex) => setConfig('textColor', hex);
window.setLocale = (lang) => setConfig('locale', lang);

window.handleBgUpload = (input) => {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      config.bgType = 'url';
      config.bgValue = e.target.result;
      saveConfig();
      applyAllSettings();
    } catch(e) { alert('图片文件过大！'); }
  };
  reader.readAsDataURL(file);
};

window.addEngine = () => {
  const key = document.getElementById('newEngineKey').value.trim();
  const name = document.getElementById('newEngineName').value.trim();
  const url = document.getElementById('newEngineUrl').value.trim();
  
  if(key && name && url) {
    db.engines[key] = { name, url };
    saveDb();
    renderEngineList();
    document.getElementById('newEngineKey').value = '';
    document.getElementById('newEngineName').value = '';
    document.getElementById('newEngineUrl').value = '';
  } else {
    alert('请填写所有字段');
  }
};

window.deleteEngine = (key) => {
  if(confirm(`确定移除引擎 /${key}?`)) {
    delete db.engines[key];
    saveDb();
    renderEngineList();
  }
};

function renderEngineList() {
  const list = document.getElementById('engineList');
  list.innerHTML = Object.entries(db.engines).map(([key, engine]) => `
    <div class="engine-item">
      <div class="engine-info">
        <span class="engine-key">/${key}</span> ${engine.name}
      </div>
      <button class="del-engine-btn" onclick="deleteEngine('${key}')">×</button>
    </div>
  `).join('');
  
  const helper = document.getElementById('commandHelper');
  helper.innerHTML = Object.entries(db.engines).map(([key, engine]) => `
     <div class="cmd-item" onclick="useEngine('${key}')">
        <span>${engine.name}</span> <span class="cmd-key">/${key}</span>
     </div>
  `).join('');
}

window.useEngine = (key) => {
   const input = document.getElementById('searchInput');
   input.value = `/${key} `;
   input.focus();
};

window.downloadConfig = () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({db, config}));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", "geek_tab_backup.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

window.resetAll = () => {
  if(confirm('确定重置所有数据？此操作不可撤销。')) {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(CFG_KEY);
    location.reload();
  }
};

// === Modals Logic ===
window.openModal = (id) => {
  document.getElementById(id).classList.add('visible');
};
window.closeModal = (id) => {
  document.getElementById(id).classList.remove('visible');
};
window.handleModalClick = (e, id) => {
  if(e.target.id === id) closeModal(id);
};
window.openSettings = () => openModal('settingsModal');
window.switchSettingTab = (tabName) => {
   document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
   document.getElementById(`tab-${tabName}`).classList.add('active');
   document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
   event.target.classList.add('active');
};

// === Add Site Logic ===
window.openAddModal = () => {
  openModal('addModal');
  setTimeout(() => document.getElementById('siteTitle').focus(), 100);
};

window.switchAddTab = (tabName) => {
  document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`tab-add-${tabName}`).classList.add('active');
  document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
};

window.commitNewSite = () => {
  const title = document.getElementById('siteTitle').value.trim();
  const url = document.getElementById('siteUrl').value.trim();
  let icon = document.getElementById('siteIcon').value.trim();
  const desc = document.getElementById('siteDesc').value.trim();
  const tagsStr = document.getElementById('siteTags').value.trim();
  
  if (!title || !url) return alert('标题和链接不能为空');
  if (!icon) icon = 'mdi:web';
  
  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];
  const siteData = { name: title, url, icon, desc, tags };
  
  const catIndex = db.categories.findIndex(c => c.key === activeCategory);
  if (catIndex > -1) {
    if (typeof window.editingIndex === 'number') {
      // 编辑模式
      db.categories[catIndex].sites[window.editingIndex] = siteData;
      delete window.editingIndex;
    } else {
      // 新增模式
      db.categories[catIndex].sites.push(siteData);
    }
    
    saveDb();
    renderGrid();
    closeModal('addModal');
    
    // 清空表单
    document.getElementById('siteTitle').value = '';
    document.getElementById('siteUrl').value = '';
    document.getElementById('siteIcon').value = '';
    document.getElementById('siteDesc').value = '';
    document.getElementById('siteTags').value = '';
  }
};

window.commitNewCategory = () => {
  const key = document.getElementById('categoryKey').value.trim();
  const label = document.getElementById('categoryLabel').value.trim();
  
  if (!key || !label) return alert('键值和名称不能为空');
  
  // 检查键值是否已存在
  if (db.categories.find(c => c.key === key)) {
    return alert('该键值已存在');
  }
  
  // 添加新分类
  db.categories.push({ key, label, sites: [] });
  saveDb();
  renderTabs();
  closeModal('addModal');
  
  // 清空表单
  document.getElementById('categoryKey').value = '';
  document.getElementById('categoryLabel').value = '';
  
  // 切换到新分类
  switchCategory(key);
};

// === 分类管理功能 ===
window.editCategory = (key) => {
  const category = db.categories.find(c => c.key === key);
  if (!category) return;
  
  const newLabel = prompt('请输入新的分类名称:', category.label);
  if (newLabel && newLabel.trim() && newLabel.trim() !== category.label) {
    category.label = newLabel.trim();
    saveDb();
    renderTabs();
  }
};

window.deleteCategory = (key) => {
  const category = db.categories.find(c => c.key === key);
  if (!category) return;
  
  if (db.categories.length <= 1) {
    return alert('至少需要保留一个分类');
  }
  
  const siteCount = category.sites.length;
  const confirmMsg = siteCount > 0 
    ? `确定删除分类"${category.label}"吗？这将同时删除其中的${siteCount}个网站。`
    : `确定删除分类"${category.label}"吗？`;
    
  if (confirm(confirmMsg)) {
    // 删除分类
    db.categories = db.categories.filter(c => c.key !== key);
    
    // 如果删除的是当前分类，切换到第一个分类
    if (activeCategory === key) {
      activeCategory = db.categories[0].key;
    }
    
    saveDb();
    renderTabs();
    renderGrid();
  }
};

// === 核心渲染 ===
function setupClock() {
  const update = () => {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString(config.locale, { hour12: false });
    document.getElementById('date').innerText = now.toLocaleDateString(config.locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  update();
  setInterval(update, 1000);
}

function renderTabs() {
  const container = document.getElementById('navTabs');
  container.innerHTML = ''; // 清空容器
  
  // 为每个分类创建按钮
  db.categories.forEach(cat => {
    const navBtn = document.createElement('button');
    navBtn.className = `nav-btn ${cat.key === activeCategory ? 'active' : ''}`;
    navBtn.onclick = () => switchCategory(cat.key);
    
    // 创建文本部分
    const textSpan = document.createElement('span');
    textSpan.className = 'nav-btn-text';
    textSpan.textContent = `./${cat.label.toLowerCase()}`;
    
    // 创建按钮组
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'nav-btn-actions';
    
    // 编辑按钮
    const editBtn = document.createElement('button');
    editBtn.className = 'nav-action-btn';
    editBtn.title = '重命名';
    editBtn.innerHTML = '<span class="iconify" data-icon="mdi:pencil"></span>';
    editBtn.onclick = (e) => {
      e.stopPropagation();
      editCategory(cat.key);
    };
    
    // 删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'nav-action-btn delete';
    deleteBtn.title = '删除';
    deleteBtn.innerHTML = '<span class="iconify" data-icon="mdi:delete"></span>';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteCategory(cat.key);
    };
    
    // 组装结构
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    navBtn.appendChild(textSpan);
    navBtn.appendChild(actionsDiv);
    container.appendChild(navBtn);
  });
  
  // 添加"+"按钮
  const addBtn = document.createElement('button');
  addBtn.className = 'nav-btn action-btn';
  addBtn.title = '添加内容';
  addBtn.textContent = '[ + ]';
  addBtn.onclick = openAddModal;
  container.appendChild(addBtn);
}

function renderGrid() {
  const category = db.categories.find(c => c.key === activeCategory);
  const container = document.getElementById('gridContainer');
  if (!category) return;
  
  if (category.sites.length === 0) {
    // 显示空状态
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <span class="iconify" data-icon="mdi:folder-open-outline"></span>
        </div>
        <div class="empty-title">暂无网站</div>
        <div class="empty-desc">这个分类还没有添加任何网站</div>
        <button class="empty-action" onclick="openAddModal()">添加第一个网站</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = category.sites.map((site, index) => `
    <div class="card" data-url="${site.url}" data-index="${index}">
      <div class="card-inner">
        <div class="card-front">
          <div class="card-icon"><span class="iconify" data-icon="${site.icon}"></span></div>
          <div class="card-title">${site.name}</div>
        </div>
        <div class="card-back">
          <div class="card-desc">${site.desc || '暂无描述'}</div>
          <div class="card-tags">
            ${(site.tags || []).map(tag => `<span class="card-tag">${tag}</span>`).join('')}
          </div>
          <div class="card-actions">
            <button class="card-btn" onclick="editSite(${index})" title="编辑">
              <span class="iconify" data-icon="mdi:pencil"></span>
            </button>
            <button class="card-btn delete-btn" onclick="deleteSite(${index})" title="删除">
              <span class="iconify" data-icon="mdi:delete"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  setupSpotlight();
  setupCardInteraction();
}

window.switchCategory = (key) => {
  activeCategory = key;
  renderTabs();
  renderGrid();
};

// === 访问统计功能 ===
function trackSiteVisit(categoryKey, siteIndex) {
  const category = db.categories.find(c => c.key === categoryKey);
  if (!category || !category.sites[siteIndex]) return;
  
  const site = category.sites[siteIndex];
  site.visitCount = (site.visitCount || 0) + 1;
  site.lastVisit = new Date().toISOString();
  
  saveDb();
}

function getMostVisitedSites(limit = 5) {
  const allSites = [];
  db.categories.forEach(category => {
    category.sites.forEach(site => {
      if (site.visitCount > 0) {
        allSites.push({
          ...site,
          category: category.label
        });
      }
    });
  });
  
  return allSites
    .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
    .slice(0, limit);
}
function setupCardInteraction() {
  document.querySelectorAll('.card').forEach(card => {
    const cardInner = card.querySelector('.card-inner');
    let isFlipped = false;
    
    // 左键点击打开链接
    card.addEventListener('click', (e) => {
      // 如果点击的是按钮，不处理
      if (e.target.closest('.card-btn')) return;
      
      if (!isFlipped) {
        const categoryKey = activeCategory;
        const siteIndex = parseInt(card.dataset.index);
        trackSiteVisit(categoryKey, siteIndex);
        window.open(card.dataset.url, '_blank');
      }
    });

    // 鼠标悬停翻转
    card.addEventListener('mouseenter', (e) => {
      if (!isFlipped) {
        anime({
          targets: cardInner,
          rotateY: 180,
          duration: 200,
          easing: 'easeInOutQuad'
        });
        isFlipped = true;
        card.classList.add('show-back');
      }
    });

    // 鼠标离开翻回
    card.addEventListener('mouseleave', (e) => {
      if (isFlipped) {
        anime({
          targets: cardInner,
          rotateY: 0,
          duration: 200,
          easing: 'easeInOutQuad'
        });
        isFlipped = false;
        card.classList.remove('show-back');
      }
    });
  });
}

window.editSite = (index) => {
  const category = db.categories.find(c => c.key === activeCategory);
  const site = category.sites[index];
  
  document.getElementById('siteTitle').value = site.name;
  document.getElementById('siteUrl').value = site.url;
  document.getElementById('siteIcon').value = site.icon;
  document.getElementById('siteDesc').value = site.desc || '';
  document.getElementById('siteTags').value = (site.tags || []).join(', ');
  
  window.editingIndex = index;
  openModal('addModal');
};

window.deleteSite = (index) => {
  if (confirm('确定删除这个网站吗？')) {
    const catIndex = db.categories.findIndex(c => c.key === activeCategory);
    db.categories[catIndex].sites.splice(index, 1);
    saveDb();
    renderGrid();
  }
};

function setupSpotlight() {
  const container = document.getElementById('gridContainer');
  const cards = Array.from(document.querySelectorAll('.card'));
  container.onmousemove = e => {
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    }
  };
}

function setupSearch() {
  const input = document.getElementById('searchInput');
  const helper = document.getElementById('commandHelper');
  
  input.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    
    if (value.length > 0) {
      // 显示网站搜索结果
      showSiteSearchResults(value);
      helper.classList.add('visible');
    } else {
      helper.classList.remove('visible');
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
       const val = input.value.trim();
       if(!val) return;
       
       // 检查是否有搜索结果
       const firstResult = helper.querySelector('.cmd-item[data-url]');
       if (firstResult) {
         window.open(firstResult.dataset.url, '_blank');
         input.value = ''; 
         helper.classList.remove('visible');
       }
    }
  });
}

function showSiteSearchResults(query) {
  const helper = document.getElementById('commandHelper');
  const results = [];
  
  // 搜索所有分类中的网站
  db.categories.forEach(category => {
    category.sites.forEach(site => {
      if (site.name.toLowerCase().includes(query.toLowerCase()) ||
          (site.desc && site.desc.toLowerCase().includes(query.toLowerCase())) ||
          (site.tags && site.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))) {
        results.push({
          ...site,
          category: category.label
        });
      }
    });
  });
  
  if (results.length > 0) {
    helper.innerHTML = results.slice(0, 5).map(site => `
      <div class="cmd-item" onclick="window.open('${site.url}', '_blank')" data-url="${site.url}">
        <div>
          <div style="font-weight: 500;">${site.name}</div>
          <div style="font-size: 0.8rem; opacity: 0.7;">${site.category} • ${site.desc || '无描述'}</div>
        </div>
        <span class="iconify" data-icon="${site.icon}"></span>
      </div>
    `).join('');
  } else {
    helper.innerHTML = `
      <div class="cmd-item" style="opacity: 0.5;">
        <span>未找到匹配的网站</span>
      </div>
    `;
  }
}

// === 快捷键功能 ===
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // 如果在输入框中，不处理快捷键
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key) {
      case '/':
        e.preventDefault();
        document.getElementById('searchInput').focus();
        break;
        
      case 'Escape':
        // 关闭所有弹窗
        document.querySelectorAll('.modal-overlay.visible').forEach(modal => {
          modal.classList.remove('visible');
        });
        // 清空搜索
        document.getElementById('searchInput').value = '';
        document.getElementById('commandHelper').classList.remove('visible');
        break;
        
      case 's':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          openSettings();
        }
        break;
        
      case 'n':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          openAddModal();
        }
        break;
        
      case 'ArrowLeft':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          switchToPrevCategory();
        }
        break;
        
      case 'ArrowRight':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          switchToNextCategory();
        }
        break;
    }
  });
}

function switchToPrevCategory() {
  const currentIndex = db.categories.findIndex(c => c.key === activeCategory);
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : db.categories.length - 1;
  switchCategory(db.categories[prevIndex].key);
}

// 初始化应用
init();
