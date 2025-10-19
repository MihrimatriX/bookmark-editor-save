# 📚 Bookmark Manager

[![Version](/image.png)]()

### 📊 **Gelişmiş Bookmark Yönetimi**
- **Akıllı Sıralama**: Alfabetik, domain bazlı, tarih bazlı sıralama
- **Gelişmiş Arama**: Regex desteği, büyük/küçük harf duyarlılığı
- **Tekrarları Temizleme**: Otomatik duplicate detection ve temizleme
- **Link Kontrolü**: Ölü linkleri tespit etme ve raporlama

### 📤 **Çoklu Export Formatları**
- **JSON**: Yapılandırılmış veri (meta veriler + domain analizi)
- **HTML**: Görsel olarak güzel HTML sayfası (istatistiklerle)
- **CSV**: Excel'de açılabilir tablo formatı
- **TXT**: Basit metin listesi
- **XML**: Yapılandırılmış XML formatı
- **Markdown**: GitHub uyumlu markdown formatı

### 📥 **Akıllı Import Sistemi**
- **Otomatik Format Tespiti**: JSON, HTML, CSV, XML desteği
- **Drag & Drop**: Dosyayı sürükleyip bırakma
- **Çakışma Yönetimi**: Atla, üzerine yaz, yeniden adlandır
- **Önizleme**: Import öncesi veri kontrolü

### 📈 **Detaylı İstatistikler**
- **Genel İstatistikler**: Toplam bookmark, benzersiz domain, ortalama yaş
- **Domain Analizi**: En çok kullanılan siteler
- **Tarih İstatistikleri**: Aylık bookmark ekleme grafikleri
- **Kullanım Takibi**: En çok tıklanan bookmark'lar

### 🎨 **Modern Kullanıcı Arayüzü**
- **Neumorphism Tasarım**: Modern ve şık görünüm
- **Dark/Light Tema**: Otomatik tema değiştirme
- **Responsive Tasarım**: Tüm ekran boyutlarına uyum
- **Türkçe Dil Desteği**: Tam Türkçe arayüz

## 📦 Kurulum

### Kurulum
1. Bu repository'yi klonlayın:
   ```bash
   git clone https://github.com/MihrimatriX/bookmark-editor-save.git
   ```

2. Chrome'da `chrome://extensions/` sayfasını açın

3. "Geliştirici modu"nu etkinleştirin

4. "Paketlenmemiş uzantı yükle" butonuna tıklayın

5. İndirilen klasörü seçin

## 🎯 Kullanım

### 📑 **Temel İşlemler**

#### **Sekmeleri Kaydetme**
1. Eklenti ikonuna tıklayın
2. "Sekmeler" butonuna tıklayın
3. Tüm açık sekmeler otomatik olarak bookmark olarak kaydedilir

#### **Bookmark'ları Görüntüleme**
1. Klasör seçin
2. Bookmark'lar otomatik olarak listelenir
3. Herhangi bir bookmark'a tıklayarak yeni sekmede açabilirsiniz

### 🔍 **Gelişmiş Arama**

#### **Basit Arama**
1. "Arama" butonuna tıklayın
2. Arama terimini girin
3. Enter tuşuna basın veya "Ara" butonuna tıklayın

#### **Gelişmiş Arama Seçenekleri**
- **Arama Tipi**: Tüm alanlar, sadece başlık, sadece URL, sadece domain
- **Regex Desteği**: Karmaşık arama desenleri için
- **Büyük/Küçük Harf**: Case-sensitive arama

### 📤 **Export İşlemleri**

#### **Hızlı Export**
1. "Export/Import" butonuna tıklayın
2. Export tab'ında seçenekleri ayarlayın:
   - **Kapsam**: Seçili klasör, tüm bookmark'lar, filtrelenmiş sonuçlar
   - **Format**: JSON, HTML, CSV, TXT, XML, Markdown
   - **Sıralama**: Alfabetik, domain bazlı, tarih bazlı
3. "Dışa Aktar" butonuna tıklayın

#### **Export Önizleme**
1. "Önizle" butonuna tıklayın
2. İlk 500 karakteri görüntüleyin
3. İstediğiniz gibi görünüyorsa "Dışa Aktar" butonuna tıklayın

### 📥 **Import İşlemleri**

#### **Dosya Import**
1. "Export/Import" butonuna tıklayın
2. Import tab'ına geçin
3. Dosyayı sürükleyip bırakın veya tıklayarak seçin
4. "Önizle" butonuna tıklayın
5. "İçe Aktar" butonuna tıklayın

#### **Import Seçenekleri**
- **Hedef**: Yeni klasör oluştur, mevcut klasöre ekle, birleştir
- **Çakışma Yönetimi**: Çakışanları atla, üzerine yaz, yeniden adlandır

### 📊 **İstatistikler**

#### **İstatistikleri Görüntüleme**
1. "İstatistikler" butonuna tıklayın
2. Tab'lar arasında geçiş yapın:
   - **Genel**: Toplam bookmark, benzersiz domain, ortalama yaş
   - **Domainler**: En çok kullanılan siteler
   - **Tarihler**: Aylık bookmark ekleme istatistikleri
   - **Kullanım**: En çok tıklanan bookmark'lar

### ⚡ **Toplu İşlemler**

#### **Toplu İşlem Menüsü**
1. "Toplu İşlemler" butonuna tıklayın
2. İstediğiniz işlemi seçin:
   - Tüm klasörleri temizle
   - Ölü linkleri sil
   - Domain bazlı gruplandır
   - Tarih bazlı arşivle

## 🛠️ Geliştirici Bilgileri

### 📁 **Proje Yapısı**
```
bookmark-editor-save/
├── manifest.json         # Eklenti manifest dosyası
├── popup.html            # Ana popup arayüzü
├── popup.css             # Stil dosyası
├── popup.js              # Ana JavaScript dosyası
├── background.js         # Background script
├── icon.png              # Eklenti ikonu
└── README.md             # Bu dosya
```

### 🔧 **Teknik Özellikler**
- **Manifest Version**: 3
- **Permissions**: bookmarks, tabs, scripting, downloads, activeTab
- **Host Permissions**: <all_urls>
- **Content Security Policy**: Güvenli script yükleme

### 🎨 **Tasarım Sistemi**
- **CSS Framework**: Custom Neumorphism
- **Color Scheme**: CSS Variables ile tema desteği
- **Typography**: Segoe UI, Arial fallback
- **Icons**: Emoji tabanlı ikonlar
- **Responsive**: Mobile-first yaklaşım

---