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
    this.stats = {
      total: document.getElementById('totalLinks'),
      invalid: document.getElementById('invalidLinks'),
      checked: document.getElementById('checkedLinks')
    };

    this.progressContainer.style.display = 'none';
  }

  bindEvents() {
    this.checkLinksButton.addEventListener('click', () => this.checkLinks());
    this.folderSelect.addEventListener('change', () => this.loadBookmarks());
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
      this.renderBookmarks(bookmarks);
      this.updateStats({ total: bookmarks.length, checked: 0, invalid: 0 });
    } catch (error) {
      this.showStatus('Yer imleri yüklenirken hata oluştu', 'error');
    }
  }

  renderBookmarks(bookmarks) {
    if (!this.bookmarksContainer) return;

    const loadingSpinner = document.querySelector('.loading-spinner');
    if (loadingSpinner) {
      loadingSpinner.classList.add('hidden'); // Başlangıçta gizli olsun
    }

    this.bookmarksContainer.innerHTML = bookmarks.map(bookmark => `
            <div class="bookmark-item" data-url="${bookmark.url || ''}">
                <div class="bookmark-info">
                    <div class="bookmark-title">${bookmark.title}</div>
                    ${bookmark.url ? `<div class="bookmark-url">${bookmark.url}</div>` : ''}
                </div>
            </div>
        `).join('');
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
    const exportButton = document.getElementById('export-folder');
    const importButton = document.getElementById('import-data');

    // Butonları aktifleştir
    [saveTabsButton, saveLiveButton, deleteButton, exportButton, importButton].forEach(button => {
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

    // Dışa Aktar butonu
    exportButton.addEventListener('click', async () => {
      const folderId = this.folderSelect.value;
      if (!folderId) {
        this.showStatus('Klasör seçilmedi, tüm yer imleri dışa aktarılıyor...', 'info');
        // Tüm yer imlerini al
        const bookmarkTree = await this.getBookmarkTree();
        await this.exportBookmarks(bookmarkTree[0].id, 'all_bookmarks');
        return;
      }

      const folderName = this.folderSelect.options[this.folderSelect.selectedIndex].text.trim();
      await this.exportBookmarks(folderId, folderName);
    });

    // İçe Aktar butonu
    importButton.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = async (e) => {
        try {
          const file = e.target.files[0];
          const text = await file.text();
          const data = JSON.parse(text);

          const folder = await chrome.bookmarks.create({
            title: `${data.folderName}_imported`
          });

          for (const bookmark of data.bookmarks) {
            if (bookmark.url) {
              await chrome.bookmarks.create({
                parentId: folder.id,
                title: bookmark.title,
                url: bookmark.url
              });
            }
          }

          this.showStatus('Yer imleri içe aktarıldı!', 'success');
          this.loadBookmarkFolders(); // Klasör listesini güncelle
        } catch (error) {
          this.showStatus('İçe aktarma sırasında hata oluştu', 'error');
        }
      };

      input.click();
    });

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
  }

  async exportBookmarks(folderId, folderName) {
    try {
      const bookmarks = await this.getBookmarksFromFolder(folderId);
      const exportData = {
        folderName: folderName,
        exportDate: new Date().toISOString(),
        bookmarks: bookmarks.map(b => ({
          title: b.title,
          url: b.url,
          dateAdded: new Date(b.dateAdded).toISOString()
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const fileName = `bookmarks_${folderName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;

      await chrome.downloads.download({
        url: URL.createObjectURL(blob),
        filename: fileName,
        saveAs: false
      });

      this.showStatus('Yer imleri dışa aktarıldı!', 'success');
    } catch (error) {
      this.showStatus('Dışa aktarma sırasında hata oluştu', 'error');
    }
  }
}

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
  window.bookmarkManager = new BookmarkManager();
});
