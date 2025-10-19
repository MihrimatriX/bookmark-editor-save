class BookmarkManager {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.loadBookmarkFolders();
    this.initializeTheme();
    this.initializeSaveLiveButton();
    this.initializeButtons();
  }

  initializeElements() {
    this.folderSelect = document.getElementById('folder-select');
    this.bookmarksContainer = document.querySelector('.bookmarks-container');
    this.progressContainer = document.querySelector('.progress-container');
    this.progressBar = document.querySelector('.progress-fill');
    this.progressText = document.querySelector('.progress-text');
    this.progressCount = document.querySelector('.progress-count');
    this.checkLinksButton = document.getElementById('check-links');
    this.sortingOptions = document.getElementById('sorting-options');
    this.sortType = document.getElementById('sort-type');
    this.exportFormat = document.getElementById('export-format');
    
    // Arama elementleri
    this.searchSection = document.getElementById('search-section');
    this.searchInput = document.getElementById('search-input');
    this.searchBtn = document.getElementById('search-btn');
    this.clearSearchBtn = document.getElementById('clear-search');
    this.searchType = document.getElementById('search-type');
    this.regexSearch = document.getElementById('regex-search');
    this.caseSensitive = document.getElementById('case-sensitive');
    this.searchResultsInfo = document.getElementById('search-results-info');
    this.searchCount = document.getElementById('search-count');
    
    // Export/Import elementleri
    this.exportImportPanel = document.getElementById('export-import-panel');
    this.panelTabs = document.querySelectorAll('.panel-tab');
    this.panelContents = document.querySelectorAll('.panel-content');
    
    // Export elementleri
    this.exportScope = document.getElementById('export-scope');
    this.exportFormat = document.getElementById('export-format');
    this.exportSort = document.getElementById('export-sort');
    this.includeMetadata = document.getElementById('include-metadata');
    this.includeFolders = document.getElementById('include-folders');
    this.includeDomains = document.getElementById('include-domains');
    this.exportPreview = document.getElementById('export-preview');
    this.previewContent = document.getElementById('preview-content');
    this.previewExportBtn = document.getElementById('preview-export');
    this.executeExportBtn = document.getElementById('execute-export');
    
    // Import elementleri
    this.importFormat = document.getElementById('import-format');
    this.importDestination = document.getElementById('import-destination');
    this.importHandling = document.getElementById('import-handling');
    this.fileDropZone = document.getElementById('file-drop-zone');
    this.importFileInput = document.getElementById('import-file-input');
    this.importPreview = document.getElementById('import-preview');
    this.importStats = document.getElementById('import-stats');
    this.importList = document.getElementById('import-list');
    this.previewImportBtn = document.getElementById('preview-import');
    this.executeImportBtn = document.getElementById('execute-import');
    
    // İstatistik elementleri
    this.statisticsSection = document.getElementById('statistics-section');
    this.statsTabs = document.querySelectorAll('.stats-tab');
    this.statsPanels = document.querySelectorAll('.stats-panel');
    
    this.stats = {
      total: document.getElementById('totalLinks'),
      invalid: document.getElementById('invalidLinks'),
      checked: document.getElementById('checkedLinks')
    };

    // Veri depolama
    this.currentBookmarks = [];
    this.filteredBookmarks = [];
    this.usageData = this.loadUsageData();

    this.progressContainer.style.display = 'none';
  }

  bindEvents() {
    this.checkLinksButton.addEventListener('click', () => this.checkLinks());
    this.folderSelect.addEventListener('change', () => this.loadBookmarks());
    
    // Sıralama seçenekleri için event listener'lar
    if (this.sortType) {
      this.sortType.addEventListener('change', () => this.loadBookmarks());
    }
    
    // Arama event listener'ları
    if (this.searchBtn) {
      this.searchBtn.addEventListener('click', () => this.performSearch());
    }
    if (this.clearSearchBtn) {
      this.clearSearchBtn.addEventListener('click', () => this.clearSearch());
    }
    if (this.searchInput) {
      this.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.performSearch();
      });
      this.searchInput.addEventListener('input', () => this.debounceSearch());
    }
    
    // İstatistik tab'ları için event listener'lar
    this.statsTabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchStatsTab(tab.dataset.tab));
    });
    
    // Export/Import panel tab'ları için event listener'lar
    this.panelTabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchPanelTab(tab.dataset.panel));
    });
    
    // Export event listener'ları
    if (this.previewExportBtn) {
      this.previewExportBtn.addEventListener('click', () => this.previewExport());
    }
    if (this.executeExportBtn) {
      this.executeExportBtn.addEventListener('click', () => this.executeExport());
    }
    
    // Import event listener'ları
    if (this.fileDropZone) {
      this.fileDropZone.addEventListener('click', () => this.importFileInput.click());
      this.fileDropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
      this.fileDropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
      this.fileDropZone.addEventListener('drop', (e) => this.handleDrop(e));
    }
    if (this.importFileInput) {
      this.importFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }
    if (this.previewImportBtn) {
      this.previewImportBtn.addEventListener('click', () => this.previewImport());
    }
    if (this.executeImportBtn) {
      this.executeImportBtn.addEventListener('click', () => this.executeImport());
    }
  }

  async checkLinks() {
    const folderId = this.folderSelect.value;
    if (!folderId) {
      this.showStatus('Lütfen bir klasör seçin!', 'error');
      return;
    }

    try {
      const loadingSpinner = document.querySelector('.loading-spinner');
      loadingSpinner.classList.remove('hidden');
      this.progressContainer.style.display = 'block';

      const bookmarks = await this.getBookmarksFromFolder(folderId);
      const validBookmarks = bookmarks.filter(b => b.url); // Sadece URL'si olan yer imlerini al
      let checkedCount = 0;
      let invalidCount = 0;

      // İstatistikleri sıfırla
      this.updateStats({
        total: validBookmarks.length,
        checked: 0,
        invalid: 0
      });

      for (const bookmark of validBookmarks) {
        try {
          const isValid = await this.checkUrl(bookmark.url);
          checkedCount++;
          if (!isValid) {
            invalidCount++;
            // Geçersiz linki görsel olarak işaretle
            const bookmarkElement = this.bookmarksContainer.querySelector(`[data-url="${bookmark.url}"]`);
            if (bookmarkElement) {
              bookmarkElement.classList.add('invalid');
            }
          }

          // Her kontrol sonrası istatistikleri güncelle
          this.updateStats({
            checked: checkedCount,
            invalid: invalidCount
          });

          this.updateProgress(checkedCount, validBookmarks.length, 'Linkler kontrol ediliyor...');
        } catch (error) {
          console.error('Link kontrol hatası:', error);
          checkedCount++;
          invalidCount++;
        }
      }

      this.showStatus(`${checkedCount} link kontrol edildi, ${invalidCount} geçersiz link bulundu.`,
        invalidCount > 0 ? 'warning' : 'success');
    } catch (error) {
      this.showStatus('Link kontrolü sırasında hata oluştu', 'error');
    } finally {
      const loadingSpinner = document.querySelector('.loading-spinner');
      loadingSpinner.classList.add('hidden');
      setTimeout(() => {
        this.progressContainer.style.display = 'none';
      }, 1000);
    }
  }

  async checkUrl(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  showStatus(message, type = 'success') {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status show ' + type;

    setTimeout(() => {
      status.classList.remove('show');
    }, 3000);
  }

  updateProgress(current, total, text = 'İşleniyor...') {
    const percentage = (current / total) * 100;
    this.progressBar.style.width = `${percentage}%`;
    this.progressText.textContent = text;
    this.progressCount.textContent = `${current}/${total}`;
  }

  async loadBookmarkFolders() {
    console.log('Yer imleri yükleniyor...');
    try {
      const bookmarkTreeNodes = await this.getBookmarkTree();
      this.folderSelect.innerHTML = '<option value="">Klasör Seçiniz</option>';
      this.addBookmarkFolders(bookmarkTreeNodes);
    } catch (error) {
      console.error('Klasörler yüklenirken hata:', error);
      this.showStatus('Klasörler yüklenemedi', 'error');
    }
  }

  getBookmarkTree() {
    return new Promise((resolve) => {
      chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        resolve(bookmarkTreeNodes);
      });
    });
  }

  addBookmarkFolders(nodes, level = 0) {
    nodes.forEach(node => {
      if (node.children) {
        const option = document.createElement('option');
        option.value = node.id;
        option.textContent = '─'.repeat(level) + ' ' + (node.title || 'Yer İmleri');
        this.folderSelect.appendChild(option);

        this.addBookmarkFolders(node.children, level + 1);
      }
    });
  }

  async getBookmarksFromFolder(folderId) {
    return new Promise((resolve, reject) => {
      chrome.bookmarks.getChildren(folderId, (bookmarkItems) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(bookmarkItems);
      });
    });
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeToggle = document.getElementById('theme-toggle');
    const updateThemeIcon = (theme) => {
      themeToggle.querySelector('.theme-icon').textContent = theme === 'light' ? '🌓' : '☀️';
    };

    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  async loadBookmarks() {
    const folderId = this.folderSelect.value;
    if (!folderId) return;

    try {
      const bookmarks = await this.getBookmarksFromFolder(folderId);
      this.currentBookmarks = bookmarks;
      const sortType = this.sortType ? this.sortType.value : 'alphabetical';
      const sortedBookmarks = this.sortBookmarks(bookmarks, sortType);
      this.filteredBookmarks = sortedBookmarks;
      this.renderBookmarks(sortedBookmarks);
      this.updateStats({ total: bookmarks.length, checked: 0, invalid: 0 });
      this.updateStatistics();
    } catch (error) {
      this.showStatus('Yer imleri yüklenirken hata oluştu', 'error');
    }
  }

  // Arama fonksiyonları
  debounceSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.performSearch();
    }, 300);
  }

  performSearch() {
    const query = this.searchInput.value.trim();
    if (!query) {
      this.clearSearch();
      return;
    }

    const searchType = this.searchType.value;
    const isRegex = this.regexSearch.checked;
    const isCaseSensitive = this.caseSensitive.checked;

    let results = this.currentBookmarks.filter(bookmark => {
      return this.matchesSearch(bookmark, query, searchType, isRegex, isCaseSensitive);
    });

    // Sıralama uygula
    const sortType = this.sortType ? this.sortType.value : 'alphabetical';
    results = this.sortBookmarks(results, sortType);
    
    this.filteredBookmarks = results;
    this.renderBookmarks(results);
    this.updateSearchResults(results.length);
  }

  matchesSearch(bookmark, query, searchType, isRegex, isCaseSensitive) {
    const flags = isCaseSensitive ? 'g' : 'gi';
    
    try {
      if (isRegex) {
        const regex = new RegExp(query, flags);
        return this.checkRegexMatch(bookmark, regex, searchType);
      } else {
        const searchQuery = isCaseSensitive ? query : query.toLowerCase();
        return this.checkTextMatch(bookmark, searchQuery, searchType, isCaseSensitive);
      }
    } catch (error) {
      // Regex hatası durumunda normal arama yap
      const searchQuery = isCaseSensitive ? query : query.toLowerCase();
      return this.checkTextMatch(bookmark, searchQuery, searchType, isCaseSensitive);
    }
  }

  checkRegexMatch(bookmark, regex, searchType) {
    switch (searchType) {
      case 'title':
        return regex.test(bookmark.title);
      case 'url':
        return bookmark.url && regex.test(bookmark.url);
      case 'domain':
        return bookmark.url && regex.test(this.extractDomain(bookmark.url));
      default:
        return regex.test(bookmark.title) || 
               (bookmark.url && regex.test(bookmark.url)) ||
               (bookmark.url && regex.test(this.extractDomain(bookmark.url)));
    }
  }

  checkTextMatch(bookmark, query, searchType, isCaseSensitive) {
    const title = isCaseSensitive ? bookmark.title : bookmark.title.toLowerCase();
    const url = bookmark.url ? (isCaseSensitive ? bookmark.url : bookmark.url.toLowerCase()) : '';
    const domain = bookmark.url ? (isCaseSensitive ? this.extractDomain(bookmark.url) : this.extractDomain(bookmark.url).toLowerCase()) : '';

    switch (searchType) {
      case 'title':
        return title.includes(query);
      case 'url':
        return url.includes(query);
      case 'domain':
        return domain.includes(query);
      default:
        return title.includes(query) || url.includes(query) || domain.includes(query);
    }
  }

  clearSearch() {
    this.searchInput.value = '';
    this.filteredBookmarks = this.currentBookmarks;
    const sortType = this.sortType ? this.sortType.value : 'alphabetical';
    const sortedBookmarks = this.sortBookmarks(this.currentBookmarks, sortType);
    this.renderBookmarks(sortedBookmarks);
    this.searchResultsInfo.classList.add('hidden');
  }

  updateSearchResults(count) {
    this.searchCount.textContent = `${count} sonuç bulundu`;
    this.searchResultsInfo.classList.remove('hidden');
  }

  // İstatistik fonksiyonları
  updateStatistics() {
    if (!this.currentBookmarks.length) return;
    
    this.updateOverviewStats();
    this.updateDomainStats();
    this.updateDateStats();
    this.updateUsageStats();
  }

  updateOverviewStats() {
    const totalBookmarks = this.currentBookmarks.length;
    const uniqueDomains = new Set(this.currentBookmarks.map(b => this.extractDomain(b.url))).size;
    
    // Ortalama yaş hesaplama
    const now = new Date();
    const totalAge = this.currentBookmarks.reduce((sum, bookmark) => {
      const age = now - new Date(bookmark.dateAdded);
      return sum + age;
    }, 0);
    const avgAge = Math.round(totalAge / totalBookmarks / (1000 * 60 * 60 * 24));
    
    // En eski bookmark
    const oldestBookmark = this.currentBookmarks.reduce((oldest, current) => {
      return new Date(current.dateAdded) < new Date(oldest.dateAdded) ? current : oldest;
    });

    document.getElementById('total-bookmarks').textContent = totalBookmarks;
    document.getElementById('unique-domains').textContent = uniqueDomains;
    document.getElementById('avg-age').textContent = `${avgAge} gün`;
    document.getElementById('oldest-bookmark').textContent = new Date(oldestBookmark.dateAdded).toLocaleDateString('tr-TR');
  }

  updateDomainStats() {
    const domainStats = {};
    this.currentBookmarks.forEach(bookmark => {
      if (bookmark.url) {
        const domain = this.extractDomain(bookmark.url);
        domainStats[domain] = (domainStats[domain] || 0) + 1;
      }
    });

    const sortedDomains = Object.entries(domainStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20); // En çok kullanılan 20 domain

    const domainStatsContainer = document.getElementById('domain-stats');
    domainStatsContainer.innerHTML = sortedDomains.map(([domain, count]) => `
      <div class="domain-item">
        <span class="domain-name">${domain}</span>
        <span class="domain-count">${count}</span>
      </div>
    `).join('');
  }

  updateDateStats() {
    const dateStats = {};
    this.currentBookmarks.forEach(bookmark => {
      const date = new Date(bookmark.dateAdded);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month.toString().padStart(2, '0')}`;
      dateStats[key] = (dateStats[key] || 0) + 1;
    });

    const sortedDates = Object.entries(dateStats)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 15); // Son 15 ay

    const dateStatsContainer = document.getElementById('date-stats');
    dateStatsContainer.innerHTML = sortedDates.map(([date, count]) => `
      <div class="date-item">
        <span class="date-period">${date}</span>
        <span class="date-count">${count}</span>
      </div>
    `).join('');
  }

  updateUsageStats() {
    // Kullanım istatistikleri için örnek veri
    // Gerçek uygulamada bu veriler bookmark tıklama geçmişinden gelecek
    const usageStats = this.generateMockUsageStats();
    
    const usageStatsContainer = document.getElementById('usage-stats');
    usageStatsContainer.innerHTML = usageStats.map(({title, count}) => `
      <div class="usage-item">
        <span class="usage-title">${title}</span>
        <span class="usage-count">${count}</span>
      </div>
    `).join('');
  }

  generateMockUsageStats() {
    // Mock kullanım verisi - gerçek uygulamada bu veriler takip edilecek
    return this.currentBookmarks
      .slice(0, 10)
      .map(bookmark => ({
        title: bookmark.title,
        count: Math.floor(Math.random() * 50) + 1
      }))
      .sort((a, b) => b.count - a.count);
  }

  switchStatsTab(tabName) {
    // Tab'ları güncelle
    this.statsTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Panel'leri güncelle
    this.statsPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `${tabName}-panel`);
    });
  }

  // Kullanım verisi yönetimi
  loadUsageData() {
    try {
      const data = localStorage.getItem('bookmarkUsageData');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  saveUsageData() {
    try {
      localStorage.setItem('bookmarkUsageData', JSON.stringify(this.usageData));
    } catch (error) {
      console.error('Kullanım verisi kaydedilemedi:', error);
    }
  }

  trackBookmarkUsage(bookmarkId) {
    if (!this.usageData[bookmarkId]) {
      this.usageData[bookmarkId] = { count: 0, lastUsed: null };
    }
    this.usageData[bookmarkId].count++;
    this.usageData[bookmarkId].lastUsed = new Date().toISOString();
    this.saveUsageData();
  }

  // Export/Import Panel Yönetimi
  switchPanelTab(panelName) {
    // Tab'ları güncelle
    this.panelTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.panel === panelName);
    });
    
    // Panel'leri güncelle
    this.panelContents.forEach(panel => {
      panel.classList.toggle('active', panel.id === `${panelName}-panel`);
    });
  }

  // Export Fonksiyonları
  async previewExport() {
    try {
      const bookmarks = await this.getExportData();
      const format = this.exportFormat.value;
      const content = this.generateExportContent(bookmarks, format, 'Önizleme');
      
      // İlk 500 karakteri göster
      const preview = content.length > 500 ? content.substring(0, 500) + '...' : content;
      this.previewContent.textContent = preview;
      this.exportPreview.classList.remove('hidden');
    } catch (error) {
      this.showStatus('Önizleme oluşturulurken hata oluştu', 'error');
    }
  }

  async executeExport() {
    try {
      const bookmarks = await this.getExportData();
      const format = this.exportFormat.value;
      const scope = this.exportScope.value;
      const sortType = this.exportSort.value;
      
      // Bookmark'ları sırala
      const sortedBookmarks = this.sortBookmarks(bookmarks, sortType);
      
      // Export içeriğini oluştur
      const content = this.generateExportContent(sortedBookmarks, format, this.getExportName(scope));
      
      // Dosya adını oluştur
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = this.getFileExtension(format);
      const fileName = `bookmarks_${scope}_${sortType}_${timestamp}.${extension}`;
      
      // Dosyayı indir
      const blob = new Blob([content], { type: this.getMimeType(format) });
      
      await chrome.downloads.download({
        url: URL.createObjectURL(blob),
        filename: fileName,
        saveAs: false
      });

      this.showStatus(`${sortedBookmarks.length} bookmark ${format.toUpperCase()} formatında dışa aktarıldı!`, 'success');
    } catch (error) {
      this.showStatus('Dışa aktarma sırasında hata oluştu', 'error');
    }
  }

  async getExportData() {
    const scope = this.exportScope.value;
    
    switch (scope) {
      case 'current':
        const folderId = this.folderSelect.value;
        if (!folderId) throw new Error('Lütfen bir klasör seçin');
        return await this.getBookmarksFromFolder(folderId);
      
      case 'all':
        const bookmarkTree = await this.getBookmarkTree();
        return this.flattenBookmarkTree(bookmarkTree[0]);
      
      case 'filtered':
        return this.filteredBookmarks || this.currentBookmarks;
      
      default:
        return this.currentBookmarks;
    }
  }

  getExportName(scope) {
    switch (scope) {
      case 'current':
        return this.folderSelect.options[this.folderSelect.selectedIndex]?.text || 'Seçili Klasör';
      case 'all':
        return 'Tüm Bookmarklar';
      case 'filtered':
        return 'Filtrelenmiş Sonuçlar';
      default:
        return 'Bookmarklar';
    }
  }

  flattenBookmarkTree(node, result = []) {
    if (node.children) {
      for (const child of node.children) {
        if (child.url) {
          result.push(child);
        }
        this.flattenBookmarkTree(child, result);
      }
    }
    return result;
  }

  // Gelişmiş Export Formatları
  generateExportContent(bookmarks, format, folderName) {
    const exportDate = new Date().toISOString();
    const includeMetadata = this.includeMetadata?.checked;
    const includeDomains = this.includeDomains?.checked;
    
    switch (format) {
      case 'json':
        return this.generateJSONExport(bookmarks, folderName, exportDate, includeMetadata, includeDomains);
      
      case 'html':
        return this.generateHTMLExport(bookmarks, folderName, exportDate);
      
      case 'csv':
        return this.generateCSVExport(bookmarks, includeMetadata, includeDomains);
      
      case 'txt':
        return this.generateTXTExport(bookmarks);
      
      case 'xml':
        return this.generateXMLExport(bookmarks, folderName, exportDate);
      
      case 'markdown':
        return this.generateMarkdownExport(bookmarks, folderName, exportDate);
      
      default:
        return JSON.stringify(bookmarks, null, 2);
    }
  }

  generateJSONExport(bookmarks, folderName, exportDate, includeMetadata, includeDomains) {
    const exportData = {
      folderName: folderName,
      exportDate: exportDate,
      totalCount: bookmarks.length,
      bookmarks: bookmarks.map(b => {
        const bookmark = {
          title: b.title,
          url: b.url,
          dateAdded: new Date(b.dateAdded).toISOString()
        };
        
        if (includeMetadata) {
          bookmark.id = b.id;
          bookmark.parentId = b.parentId;
        }
        
        if (includeDomains && b.url) {
          bookmark.domain = this.extractDomain(b.url);
        }
        
        return bookmark;
      })
    };
    
    if (includeDomains) {
      exportData.domainAnalysis = this.generateDomainAnalysis(bookmarks);
    }
    
    return JSON.stringify(exportData, null, 2);
  }

  generateHTMLExport(bookmarks, folderName, exportDate) {
    const domainAnalysis = this.generateDomainAnalysis(bookmarks);
    
    return `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${folderName} - Yer İmleri</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #4CAF50; padding-bottom: 15px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; border-left: 4px solid #4CAF50; }
        .stat-value { font-size: 24px; font-weight: bold; color: #4CAF50; }
        .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
        .bookmark { margin: 10px 0; padding: 15px; border-left: 3px solid #4CAF50; background: #f9f9f9; border-radius: 4px; }
        .bookmark:hover { background: #e8f5e8; }
        .title { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
        .url { color: #666; font-size: 14px; margin-bottom: 3px; }
        .domain { color: #4CAF50; font-size: 12px; font-weight: 500; }
        .date { color: #999; font-size: 11px; }
        .domain-stats { margin-top: 20px; }
        .domain-item { display: flex; justify-content: space-between; padding: 8px 12px; background: #f8f9fa; margin: 5px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${folderName}</h1>
            <p>Dışa aktarma tarihi: ${new Date(exportDate).toLocaleDateString('tr-TR')}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${bookmarks.length}</div>
                <div class="stat-label">Toplam Bookmark</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${domainAnalysis.uniqueDomains}</div>
                <div class="stat-label">Benzersiz Domain</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${domainAnalysis.topDomain}</div>
                <div class="stat-label">En Çok Kullanılan</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${domainAnalysis.topCount}</div>
                <div class="stat-label">En Çok Sayı</div>
            </div>
        </div>
        
        ${bookmarks.map(b => `
            <div class="bookmark">
                <div class="title">${b.title}</div>
                <div class="url">${b.url}</div>
                <div class="domain">${this.extractDomain(b.url)}</div>
                <div class="date">${new Date(b.dateAdded).toLocaleDateString('tr-TR')}</div>
            </div>
        `).join('')}
        
        <div class="domain-stats">
            <h3>Domain İstatistikleri</h3>
            ${Object.entries(domainAnalysis.domainCounts).slice(0, 10).map(([domain, count]) => `
                <div class="domain-item">
                    <span>${domain}</span>
                    <span>${count}</span>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  generateCSVExport(bookmarks, includeMetadata, includeDomains) {
    const headers = ['Başlık', 'URL', 'Domain', 'Ekleme Tarihi'];
    if (includeMetadata) headers.push('ID', 'Parent ID');
    if (includeDomains) headers.push('Domain Kategorisi');
    
    const rows = bookmarks.map(b => {
      const row = [
        `"${b.title}"`,
        `"${b.url}"`,
        `"${this.extractDomain(b.url)}"`,
        `"${new Date(b.dateAdded).toLocaleDateString('tr-TR')}"`
      ];
      
      if (includeMetadata) {
        row.push(`"${b.id}"`, `"${b.parentId || ''}"`);
      }
      
      if (includeDomains) {
        row.push(`"${this.categorizeDomain(b.url)}"`);
      }
      
      return row.join(',');
    });
    
    return headers.join(',') + '\n' + rows.join('\n');
  }

  generateTXTExport(bookmarks) {
    return bookmarks.map((b, index) => 
      `${index + 1}. ${b.title}\n   ${b.url}\n   ${this.extractDomain(b.url)}\n   ${new Date(b.dateAdded).toLocaleDateString('tr-TR')}\n`
    ).join('\n');
  }

  generateXMLExport(bookmarks, folderName, exportDate) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<bookmarks>
    <metadata>
        <folderName>${folderName}</folderName>
        <exportDate>${exportDate}</exportDate>
        <totalCount>${bookmarks.length}</totalCount>
    </metadata>
    <items>
        ${bookmarks.map(b => `
        <bookmark>
            <title><![CDATA[${b.title}]]></title>
            <url><![CDATA[${b.url}]]></url>
            <domain>${this.extractDomain(b.url)}</domain>
            <dateAdded>${new Date(b.dateAdded).toISOString()}</dateAdded>
        </bookmark>
        `).join('')}
    </items>
</bookmarks>`;
  }

  generateMarkdownExport(bookmarks, folderName, exportDate) {
    return `# ${folderName}

**Dışa aktarma tarihi:** ${new Date(exportDate).toLocaleDateString('tr-TR')}  
**Toplam bookmark sayısı:** ${bookmarks.length}

## Bookmark Listesi

${bookmarks.map((b, index) => 
  `${index + 1}. [${b.title}](${b.url}) - ${this.extractDomain(b.url)}`
).join('\n')}

## Domain İstatistikleri

${Object.entries(this.generateDomainAnalysis(bookmarks).domainCounts).slice(0, 10).map(([domain, count]) => 
  `- **${domain}**: ${count} bookmark`
).join('\n')}
`;
  }

  generateDomainAnalysis(bookmarks) {
    const domainCounts = {};
    bookmarks.forEach(bookmark => {
      if (bookmark.url) {
        const domain = this.extractDomain(bookmark.url);
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      }
    });
    
    const sortedDomains = Object.entries(domainCounts).sort(([,a], [,b]) => b - a);
    const [topDomain, topCount] = sortedDomains[0] || ['', 0];
    
    return {
      domainCounts,
      uniqueDomains: Object.keys(domainCounts).length,
      topDomain,
      topCount
    };
  }

  categorizeDomain(url) {
    const domain = this.extractDomain(url);
    if (domain.includes('google')) return 'Arama';
    if (domain.includes('youtube')) return 'Video';
    if (domain.includes('github')) return 'Geliştirme';
    if (domain.includes('stackoverflow')) return 'Geliştirme';
    if (domain.includes('news') || domain.includes('haber')) return 'Haber';
    return 'Diğer';
  }

  // Import Fonksiyonları
  handleDragOver(e) {
    e.preventDefault();
    this.fileDropZone.classList.add('dragover');
  }

  handleDragLeave(e) {
    e.preventDefault();
    this.fileDropZone.classList.remove('dragover');
  }

  handleDrop(e) {
    e.preventDefault();
    this.fileDropZone.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      this.processImportFile(files[0]);
    }
  }

  handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      this.processImportFile(file);
    }
  }

  async processImportFile(file) {
    try {
      const text = await file.text();
      const format = this.detectFileFormat(file.name, text);
      
      this.importedData = await this.parseImportData(text, format);
      this.previewImportBtn.disabled = false;
      this.executeImportBtn.disabled = false;
      
      this.showStatus(`Dosya yüklendi: ${file.name} (${format})`, 'success');
    } catch (error) {
      this.showStatus('Dosya işlenirken hata oluştu', 'error');
    }
  }

  detectFileFormat(filename, content) {
    const extension = filename.split('.').pop().toLowerCase();
    
    if (this.importFormat.value !== 'auto') {
      return this.importFormat.value;
    }
    
    // Otomatik format tespiti
    if (extension === 'json' || content.trim().startsWith('{')) return 'json';
    if (extension === 'html' || content.includes('<html')) return 'html';
    if (extension === 'csv' || content.includes(',')) return 'csv';
    if (extension === 'xml' || content.includes('<?xml')) return 'xml';
    
    return 'json'; // Varsayılan
  }

  async parseImportData(content, format) {
    switch (format) {
      case 'json':
        return this.parseJSONImport(content);
      case 'html':
        return this.parseHTMLImport(content);
      case 'csv':
        return this.parseCSVImport(content);
      case 'xml':
        return this.parseXMLImport(content);
      default:
        throw new Error('Desteklenmeyen format');
    }
  }

  parseJSONImport(content) {
    const data = JSON.parse(content);
    
    if (data.bookmarks) {
      return {
        bookmarks: data.bookmarks,
        metadata: {
          folderName: data.folderName || 'İçe Aktarılan',
          exportDate: data.exportDate,
          totalCount: data.totalCount
        }
      };
    }
    
    // Basit bookmark array'i
    return {
      bookmarks: Array.isArray(data) ? data : [data],
      metadata: { folderName: 'İçe Aktarılan' }
    };
  }

  parseHTMLImport(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const bookmarks = [];
    
    // HTML'den bookmark'ları çıkar
    const links = doc.querySelectorAll('a[href]');
    links.forEach(link => {
      if (link.href && link.href.startsWith('http')) {
        bookmarks.push({
          title: link.textContent.trim() || link.href,
          url: link.href
        });
      }
    });
    
    return {
      bookmarks,
      metadata: { folderName: 'HTML İçe Aktarılan' }
    };
  }

  parseCSVImport(content) {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const bookmarks = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length >= 2) {
        const titleIndex = headers.findIndex(h => h.toLowerCase().includes('başlık') || h.toLowerCase().includes('title'));
        const urlIndex = headers.findIndex(h => h.toLowerCase().includes('url') || h.toLowerCase().includes('link'));
        
        if (titleIndex >= 0 && urlIndex >= 0) {
          bookmarks.push({
            title: values[titleIndex] || values[urlIndex],
            url: values[urlIndex]
          });
        }
      }
    }
    
    return {
      bookmarks,
      metadata: { folderName: 'CSV İçe Aktarılan' }
    };
  }

  parseXMLImport(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');
    const bookmarks = [];
    
    const bookmarkElements = doc.querySelectorAll('bookmark');
    bookmarkElements.forEach(bookmark => {
      const title = bookmark.querySelector('title')?.textContent;
      const url = bookmark.querySelector('url')?.textContent;
      
      if (title && url) {
        bookmarks.push({ title, url });
      }
    });
    
    return {
      bookmarks,
      metadata: { folderName: 'XML İçe Aktarılan' }
    };
  }

  async previewImport() {
    if (!this.importedData) return;
    
    const stats = {
      total: this.importedData.bookmarks.length,
      valid: this.importedData.bookmarks.filter(b => b.url && b.url.startsWith('http')).length,
      invalid: this.importedData.bookmarks.filter(b => !b.url || !b.url.startsWith('http')).length
    };
    
    // İstatistikleri göster
    this.importStats.innerHTML = `
      <div class="preview-stat">
        <span class="label">Toplam</span>
        <span class="value">${stats.total}</span>
      </div>
      <div class="preview-stat">
        <span class="label">Geçerli</span>
        <span class="value">${stats.valid}</span>
      </div>
      <div class="preview-stat">
        <span class="label">Geçersiz</span>
        <span class="value">${stats.invalid}</span>
      </div>
    `;
    
    // İlk 10 bookmark'ı göster
    const previewItems = this.importedData.bookmarks.slice(0, 10).map(bookmark => {
      const isValid = bookmark.url && bookmark.url.startsWith('http');
      return `
        <div class="preview-item">
          <span class="title">${bookmark.title}</span>
          <span class="status ${isValid ? '' : 'error'}">${isValid ? 'Geçerli' : 'Geçersiz'}</span>
        </div>
      `;
    }).join('');
    
    this.importList.innerHTML = previewItems;
    this.importPreview.classList.remove('hidden');
  }

  async executeImport() {
    if (!this.importedData) return;
    
    try {
      const destination = this.importDestination.value;
      const handling = this.importHandling.value;
      
      let parentId;
      
      switch (destination) {
        case 'new-folder':
          const folder = await chrome.bookmarks.create({
            title: `${this.importedData.metadata.folderName}_${new Date().toISOString().split('T')[0]}`
          });
          parentId = folder.id;
          break;
          
        case 'current-folder':
          parentId = this.folderSelect.value;
          if (!parentId) {
            this.showStatus('Lütfen bir klasör seçin!', 'error');
            return;
          }
          break;
          
        case 'merge':
          // Mevcut bookmark'larla birleştir
          parentId = this.folderSelect.value;
          break;
      }
      
      let importedCount = 0;
      let skippedCount = 0;
      
      for (const bookmark of this.importedData.bookmarks) {
        if (!bookmark.url || !bookmark.url.startsWith('http')) {
          skippedCount++;
          continue;
        }
        
        try {
          // Çakışma kontrolü
          if (handling === 'skip') {
            const existing = await this.checkBookmarkExists(bookmark.url, parentId);
            if (existing) {
              skippedCount++;
              continue;
            }
          }
          
          let title = bookmark.title;
          if (handling === 'rename') {
            title = await this.generateUniqueTitle(bookmark.title, parentId);
          }
          
          await chrome.bookmarks.create({
            parentId: parentId,
            title: title,
            url: bookmark.url
          });
          
          importedCount++;
        } catch (error) {
          skippedCount++;
        }
      }
      
      this.showStatus(`${importedCount} bookmark içe aktarıldı, ${skippedCount} atlandı`, 'success');
      this.loadBookmarkFolders();
      this.importPreview.classList.add('hidden');
      
    } catch (error) {
      this.showStatus('İçe aktarma sırasında hata oluştu', 'error');
    }
  }

  async checkBookmarkExists(url, parentId) {
    const bookmarks = await this.getBookmarksFromFolder(parentId);
    return bookmarks.some(b => b.url === url);
  }

  async generateUniqueTitle(title, parentId) {
    const bookmarks = await this.getBookmarksFromFolder(parentId);
    const existingTitles = bookmarks.map(b => b.title);
    
    let newTitle = title;
    let counter = 1;
    
    while (existingTitles.includes(newTitle)) {
      newTitle = `${title} (${counter})`;
      counter++;
    }
    
    return newTitle;
  }

  showBulkOperationsMenu() {
    // Basit bir alert ile toplu işlemler menüsü göster
    // Gerçek uygulamada bu daha gelişmiş bir modal olabilir
    const operations = [
      'Tüm klasörleri temizle',
      'Ölü linkleri sil',
      'Domain bazlı gruplandır',
      'Tarih bazlı arşivle'
    ];
    
    const choice = prompt(`Toplu İşlemler:\n${operations.map((op, i) => `${i + 1}. ${op}`).join('\n')}\n\nSeçiminizi yapın (1-${operations.length}):`);
    
    if (choice && choice >= 1 && choice <= operations.length) {
      this.executeBulkOperation(operations[choice - 1]);
    }
  }

  async executeBulkOperation(operation) {
    switch (operation) {
      case 'Tüm klasörleri temizle':
        await this.cleanAllFolders();
        break;
      case 'Ölü linkleri sil':
        await this.removeDeadLinks();
        break;
      case 'Domain bazlı gruplandır':
        await this.groupByDomain();
        break;
      case 'Tarih bazlı arşivle':
        await this.archiveByDate();
        break;
    }
  }

  async cleanAllFolders() {
    // Tüm klasörlerdeki tekrarları temizle
    this.showStatus('Tüm klasörler temizleniyor...', 'info');
    // Implementation here
  }

  async removeDeadLinks() {
    // Ölü linkleri tespit et ve sil
    this.showStatus('Ölü linkler kontrol ediliyor...', 'info');
    // Implementation here
  }

  async groupByDomain() {
    // Bookmark'ları domain'e göre gruplandır
    this.showStatus('Domain bazlı gruplandırma yapılıyor...', 'info');
    // Implementation here
  }

  async archiveByDate() {
    // Eski bookmark'ları arşivle
    this.showStatus('Tarih bazlı arşivleme yapılıyor...', 'info');
    // Implementation here
  }

  renderBookmarks(bookmarks) {
    if (!this.bookmarksContainer) return;

    const loadingSpinner = document.querySelector('.loading-spinner');
    if (loadingSpinner) {
      loadingSpinner.classList.add('hidden'); // Başlangıçta gizli olsun
    }

    this.bookmarksContainer.innerHTML = bookmarks.map(bookmark => `
            <div class="bookmark-item" data-url="${bookmark.url || ''}" data-id="${bookmark.id}">
                <div class="bookmark-info">
                    <div class="bookmark-title">${bookmark.title}</div>
                    ${bookmark.url ? `<div class="bookmark-url">${bookmark.url}</div>` : ''}
                    ${bookmark.url ? `<div class="bookmark-domain">${this.extractDomain(bookmark.url)}</div>` : ''}
                </div>
            </div>
        `).join('');

    // Bookmark tıklama olaylarını ekle
    this.bookmarksContainer.querySelectorAll('.bookmark-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const url = item.dataset.url;
        const id = item.dataset.id;
        if (url && url.startsWith('http')) {
          // Kullanım verisini takip et
          this.trackBookmarkUsage(id);
          // Yeni sekmede aç
          chrome.tabs.create({ url: url });
        }
      });
    });
  }

  updateStats(stats) {
    if (stats.total !== undefined && this.stats.total) {
      this.stats.total.textContent = stats.total;
    }
    if (stats.invalid !== undefined && this.stats.invalid) {
      this.stats.invalid.textContent = stats.invalid;
    }
    if (stats.checked !== undefined && this.stats.checked) {
      this.stats.checked.textContent = stats.checked;
    }
  }

  initializeSaveLiveButton() {
    const saveButton = document.getElementById('save-live');
    if (!saveButton) return;

    saveButton.addEventListener('click', async () => {
      const folderId = this.folderSelect.value;
      if (!folderId) {
        this.showStatus('Lütfen bir klasör seçin!', 'error');
        return;
      }

      try {
        saveButton.disabled = true;
        this.progressContainer.style.display = 'block';

        const response = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: "saveLive",
            folderId: folderId
          }, (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        });

        if (response.success) {
          this.showStatus(response.message, 'success');
        } else {
          this.showStatus(response.message, 'error');
        }
      } catch (error) {
        this.showStatus('İşlem sırasında bir hata oluştu', 'error');
      } finally {
        saveButton.disabled = false;
        setTimeout(() => {
          this.progressContainer.style.display = 'none';
        }, 1000);
      }
    });
  }

  initializeButtons() {
    // Butonları seç
    const saveTabsButton = document.getElementById('save-tabs');
    const saveLiveButton = document.getElementById('save-live');
    const deleteButton = document.getElementById('delete-tabs');
    const toggleExportImportButton = document.getElementById('toggle-export-import');
    const bulkOperationsButton = document.getElementById('bulk-operations');
    const toggleSearchButton = document.getElementById('toggle-search');
    const toggleStatsButton = document.getElementById('toggle-stats');

    // Butonları aktifleştir
    [saveTabsButton, saveLiveButton, deleteButton, toggleExportImportButton, bulkOperationsButton, toggleSearchButton, toggleStatsButton].forEach(button => {
      if (button) {
        button.disabled = false;
      }
    });

    // Buton metinlerini güncelle
    if (deleteButton) {
      deleteButton.textContent = 'Tekrarları Sil';
    }

    // Event listener'ları ekle
    // Sekmeleri Kaydet butonu
    saveTabsButton.addEventListener('click', async () => {
      try {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        const timestamp = new Date().toISOString().split('T')[0];
        const folderName = `Tabs_${timestamp}`;

        const folder = await chrome.bookmarks.create({ title: folderName });

        for (const tab of tabs) {
          if (tab.url) {
            await chrome.bookmarks.create({
              parentId: folder.id,
              title: tab.title,
              url: tab.url
            });
          }
        }

        this.showStatus('Tüm sekmeler kaydedildi!', 'success');
        this.loadBookmarkFolders(); // Klasör listesini güncelle
      } catch (error) {
        this.showStatus('Sekmeler kaydedilirken hata oluştu', 'error');
      }
    });

    // Export/Import Toggle butonu
    if (toggleExportImportButton) {
      toggleExportImportButton.addEventListener('click', () => {
        this.exportImportPanel.classList.toggle('hidden');
        if (!this.exportImportPanel.classList.contains('hidden')) {
          // Export panelini varsayılan olarak göster
          this.switchPanelTab('export');
        }
      });
    }

    // Toplu İşlemler butonu
    if (bulkOperationsButton) {
      bulkOperationsButton.addEventListener('click', () => {
        this.showBulkOperationsMenu();
      });
    }

    // Tekrarları Sil butonu
    deleteButton.addEventListener('click', async () => {
      const folderId = this.folderSelect.value;
      if (!folderId) {
        this.showStatus('Lütfen bir klasör seçin!', 'error');
        return;
      }

      try {
        const bookmarks = await this.getBookmarksFromFolder(folderId);
        const urlMap = new Map();
        let deletedCount = 0;

        // İlk geçiş: URL'leri topla
        bookmarks.forEach(bookmark => {
          if (bookmark.url) {
            if (!urlMap.has(bookmark.url)) {
              urlMap.set(bookmark.url, []);
            }
            urlMap.get(bookmark.url).push(bookmark);
          }
        });

        // İkinci geçiş: Tekrarları sil
        for (const [url, items] of urlMap.entries()) {
          if (items.length > 1) {
            // İlk öğeyi tut, diğerlerini sil
            for (let i = 1; i < items.length; i++) {
              await chrome.bookmarks.remove(items[i].id);
              deletedCount++;
            }
          }
        }

        this.showStatus(`${deletedCount} tekrarlanan yer imi silindi`, 'success');
        this.loadBookmarks(); // Listeyi güncelle
      } catch (error) {
        this.showStatus('Silme işlemi sırasında hata oluştu', 'error');
      }
    });

    // Arama toggle butonu
    if (toggleSearchButton) {
      toggleSearchButton.addEventListener('click', () => {
        this.searchSection.classList.toggle('hidden');
        if (!this.searchSection.classList.contains('hidden')) {
          this.searchInput.focus();
        }
      });
    }

    // İstatistikler toggle butonu
    if (toggleStatsButton) {
      toggleStatsButton.addEventListener('click', () => {
        this.statisticsSection.classList.toggle('hidden');
        if (!this.statisticsSection.classList.contains('hidden')) {
          this.updateStatistics();
        }
      });
    }
  }

  // Sıralama fonksiyonları
  sortBookmarks(bookmarks, sortType) {
    const sortedBookmarks = [...bookmarks];
    
    switch (sortType) {
      case 'alphabetical':
        return sortedBookmarks.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
      
      case 'alphabetical-desc':
        return sortedBookmarks.sort((a, b) => b.title.localeCompare(a.title, 'tr'));
      
      case 'domain':
        return sortedBookmarks.sort((a, b) => {
          const domainA = this.extractDomain(a.url);
          const domainB = this.extractDomain(b.url);
          return domainA.localeCompare(domainB, 'tr');
        });
      
      case 'date':
        return sortedBookmarks.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      
      case 'date-desc':
        return sortedBookmarks.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
      
      default:
        return sortedBookmarks;
    }
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  // Export formatları
  generateExportContent(bookmarks, format, folderName) {
    const exportDate = new Date().toISOString();
    
    switch (format) {
      case 'json':
        return JSON.stringify({
          folderName: folderName,
          exportDate: exportDate,
          totalCount: bookmarks.length,
          bookmarks: bookmarks.map(b => ({
            title: b.title,
            url: b.url,
            domain: this.extractDomain(b.url),
            dateAdded: new Date(b.dateAdded).toISOString()
          }))
        }, null, 2);
      
      case 'html':
        const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${folderName} - Yer İmleri</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .bookmark { margin: 10px 0; padding: 10px; border-left: 3px solid #4CAF50; background: #f9f9f9; }
        .title { font-weight: bold; font-size: 16px; }
        .url { color: #666; font-size: 14px; }
        .domain { color: #4CAF50; font-size: 12px; }
        .date { color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${folderName}</h1>
        <p>Toplam: ${bookmarks.length} yer imi | Dışa aktarma tarihi: ${new Date(exportDate).toLocaleDateString('tr-TR')}</p>
    </div>
    ${bookmarks.map(b => `
        <div class="bookmark">
            <div class="title">${b.title}</div>
            <div class="url">${b.url}</div>
            <div class="domain">${this.extractDomain(b.url)}</div>
            <div class="date">${new Date(b.dateAdded).toLocaleDateString('tr-TR')}</div>
        </div>
    `).join('')}
</body>
</html>`;
        return htmlContent;
      
      case 'csv':
        const csvHeader = 'Başlık,URL,Domain,Ekleme Tarihi\n';
        const csvContent = bookmarks.map(b => 
          `"${b.title}","${b.url}","${this.extractDomain(b.url)}","${new Date(b.dateAdded).toLocaleDateString('tr-TR')}"`
        ).join('\n');
        return csvHeader + csvContent;
      
      case 'txt':
        return bookmarks.map(b => `${b.title}\n${b.url}\n${this.extractDomain(b.url)}\n${new Date(b.dateAdded).toLocaleDateString('tr-TR')}\n---`).join('\n');
      
      default:
        return JSON.stringify(bookmarks, null, 2);
    }
  }

  getFileExtension(format) {
    const extensions = {
      'json': 'json',
      'html': 'html',
      'csv': 'csv',
      'txt': 'txt'
    };
    return extensions[format] || 'json';
  }

  getMimeType(format) {
    const mimeTypes = {
      'json': 'application/json',
      'html': 'text/html',
      'csv': 'text/csv',
      'txt': 'text/plain'
    };
    return mimeTypes[format] || 'application/json';
  }

  async exportBookmarks(folderId, folderName) {
    try {
      const bookmarks = await this.getBookmarksFromFolder(folderId);
      const sortType = this.sortType.value;
      const exportFormat = this.exportFormat.value;
      
      // Bookmark'ları sırala
      const sortedBookmarks = this.sortBookmarks(bookmarks, sortType);
      
      // Export içeriğini oluştur
      const content = this.generateExportContent(sortedBookmarks, exportFormat, folderName);
      
      // Dosya adını oluştur
      const timestamp = new Date().toISOString().split('T')[0];
      const sanitizedFolderName = folderName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const extension = this.getFileExtension(exportFormat);
      const fileName = `bookmarks_${sanitizedFolderName}_${sortType}_${timestamp}.${extension}`;
      
      // Dosyayı indir
      const blob = new Blob([content], { type: this.getMimeType(exportFormat) });
      
      await chrome.downloads.download({
        url: URL.createObjectURL(blob),
        filename: fileName,
        saveAs: false
      });

      this.showStatus(`${sortedBookmarks.length} yer imi ${exportFormat.toUpperCase()} formatında dışa aktarıldı!`, 'success');
    } catch (error) {
      this.showStatus('Dışa aktarma sırasında hata oluştu', 'error');
    }
  }
}

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
  window.bookmarkManager = new BookmarkManager();
});
