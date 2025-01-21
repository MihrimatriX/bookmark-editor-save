chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Mesaj alındı:', message);

  if (message.action === "saveTabs") {
    chrome.tabs.query({}, (tabs) => {
      chrome.bookmarks.create({ title: "All Open Tabs" }, (folder) => {
        tabs.forEach((tab) => {
          if (tab.url) {
            chrome.bookmarks.create({
              parentId: folder.id,
              title: tab.title,
              url: tab.url
            });
          }
        });
        sendResponse({ success: true, message: "Tüm sekmeler kaydedildi." });
      });
    });
    return true;
  }
  else if (message.action === "deleteTabs") {
    const deleteBookmarks = async () => {
      try {
        const bookmarkItems = await chrome.bookmarks.getChildren(message.folderId);
        const urlCounts = new Map();
        bookmarkItems.forEach(item => {
          if (item.url) {
            urlCounts.set(item.url, (urlCounts.get(item.url) || 0) + 1);
          }
        });

        let deletedCount = 0;
        for (const [url, count] of urlCounts.entries()) {
          if (count > 1) {
            let isFirst = true;
            for (const item of bookmarkItems) {
              if (item.url === url) {
                if (isFirst) {
                  isFirst = false;
                } else {
                  await chrome.bookmarks.remove(item.id);
                  deletedCount++;
                }
              }
            }
          }
        }

        sendResponse({
          success: true,
          message: `${deletedCount} tekrarlanan yer imi silindi.`
        });
      } catch (error) {
        sendResponse({
          success: false,
          message: 'Bir hata oluştu: ' + error.message
        });
      }
    };

    deleteBookmarks();
    return true;
  }
  else if (message.action === "saveLive") {
    (async () => {
      try {
        const bookmarks = await chrome.bookmarks.getChildren(message.folderId);
        let savedCount = 0;
        let errorCount = 0;
        const results = [];

        for (const bookmark of bookmarks) {
          if (bookmark.url) {
            const result = await savePageContent(bookmark.url, bookmark.title);
            results.push(result);
            if (result.success) savedCount++; else errorCount++;

            try {
              chrome.runtime.sendMessage({
                type: 'saveProgress',
                current: savedCount + errorCount,
                total: bookmarks.length
              });
            } catch (e) {
              console.log('Progress update error:', e);
            }
          }
        }

        sendResponse({
          success: true,
          message: `${savedCount} sayfa kaydedildi, ${errorCount} hata oluştu.`,
          details: results
        });
      } catch (error) {
        sendResponse({
          success: false,
          message: 'İşlem sırasında hata oluştu: ' + error.message
        });
      }
    })();
    return true;
  }
});

async function savePageContent(url, title) {
  try {
    if (url.startsWith('chrome://') || url.startsWith('edge://') || url.startsWith('about:')) {
      return {
        success: false,
        message: `"${title}" sayfası özel bir URL olduğu için kaydedilemedi.`
      };
    }

    try {
      const response = await fetch(url);
      const html = await response.text();

      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const finalFileName = `${sanitizedTitle}.html`;

      const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);

      await chrome.downloads.download({
        url: dataUrl,
        filename: finalFileName,
        saveAs: false,
        conflictAction: 'uniquify'
      });

      chrome.runtime.sendMessage({
        type: 'saveProgress'
      });

      return { success: true, message: `"${title}" başarıyla kaydedildi.` };
    } catch (error) {
      console.error('İndirme hatası:', error);
      return {
        success: false,
        message: `"${title}" kaydedilirken hata: ${error.message}`
      };
    }
  } catch (error) {
    console.error('Sayfa kaydedilirken hata:', error);
    return {
      success: false,
      message: `"${title}" kaydedilemedi: ${error.message || 'Bilinmeyen hata'}`
    };
  }
}
