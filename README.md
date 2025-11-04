# 📚 Bookmark Manager Pro

A powerful Chrome extension for managing, organizing, importing, and exporting bookmarks with advanced search, duplicate detection, and statistics.

**Tags**: `bookmark-manager` `chrome-extension` `bookmark-export` `bookmark-import` `bookmark-organizer` `browser-extension` `bookmark-tools` `chrome-plugin` `bookmark-sync` `bookmark-analytics`

[![Version](/image.png)]()

### 📊 **Advanced Bookmark Management**
- **Smart Sorting**: Alphabetical, domain-based, date-based sorting
- **Advanced Search**: Regex support, case-sensitive search
- **Duplicate Removal**: Automatic duplicate detection and cleaning
- **Link Validation**: Detect and report dead links

### 📤 **Multiple Export Formats**
- **JSON**: Structured data (metadata + domain analysis)
- **HTML**: Beautiful visual HTML page (with statistics)
- **CSV**: Excel-compatible table format
- **TXT**: Simple text list
- **XML**: Structured XML format
- **Markdown**: GitHub-compatible markdown format

### 📥 **Smart Import System**
- **Automatic Format Detection**: JSON, HTML, CSV, XML support
- **Drag & Drop**: Drag and drop files
- **Conflict Management**: Skip, overwrite, rename
- **Preview**: Data verification before import

### 📈 **Detailed Statistics**
- **General Statistics**: Total bookmarks, unique domains, average age
- **Domain Analysis**: Most used websites
- **Date Statistics**: Monthly bookmark addition charts
- **Usage Tracking**: Most clicked bookmarks

### 🎨 **Modern User Interface**
- **Neumorphism Design**: Modern and elegant appearance
- **Dark/Light Theme**: Automatic theme switching
- **Responsive Design**: Adapts to all screen sizes
- **Multi-language Support**: Full interface localization

## 📦 Installation

### Setup
1. Clone this repository:
   ```bash
   git clone https://github.com/MihrimatriX/bookmark-editor-save.git
   ```

2. Open `chrome://extensions/` in Chrome

3. Enable "Developer mode"

4. Click "Load unpacked"

5. Select the downloaded folder

## 🎯 Usage

### 📑 **Basic Operations**

#### **Saving Tabs**
1. Click the extension icon
2. Click the "Tabs" button
3. All open tabs are automatically saved as bookmarks

#### **Viewing Bookmarks**
1. Select a folder
2. Bookmarks are automatically listed
3. Click any bookmark to open it in a new tab

### 🔍 **Advanced Search**

#### **Simple Search**
1. Click the "Search" button
2. Enter search term
3. Press Enter or click "Search" button

#### **Advanced Search Options**
- **Search Type**: All fields, title only, URL only, domain only
- **Regex Support**: For complex search patterns
- **Case Sensitivity**: Case-sensitive search

### 📤 **Export Operations**

#### **Quick Export**
1. Click "Export/Import" button
2. In the Export tab, configure options:
   - **Scope**: Selected folder, all bookmarks, filtered results
   - **Format**: JSON, HTML, CSV, TXT, XML, Markdown
   - **Sorting**: Alphabetical, domain-based, date-based
3. Click "Export" button

#### **Export Preview**
1. Click "Preview" button
2. View first 500 characters
3. If it looks good, click "Export" button

### 📥 **Import Operations**

#### **File Import**
1. Click "Export/Import" button
2. Switch to Import tab
3. Drag and drop file or click to select
4. Click "Preview" button
5. Click "Import" button

#### **Import Options**
- **Target**: Create new folder, add to existing folder, merge
- **Conflict Management**: Skip conflicts, overwrite, rename

### 📊 **Statistics**

#### **Viewing Statistics**
1. Click "Statistics" button
2. Switch between tabs:
   - **General**: Total bookmarks, unique domains, average age
   - **Domains**: Most used websites
   - **Dates**: Monthly bookmark addition statistics
   - **Usage**: Most clicked bookmarks

### ⚡ **Bulk Operations**

#### **Bulk Operations Menu**
1. Click "Bulk Operations" button
2. Select desired operation:
   - Clear all folders
   - Delete dead links
   - Group by domain
   - Archive by date

## 🛠️ Developer Information

### 📁 **Project Structure**
```
bookmark-editor-save/
├── manifest.json         # Extension manifest file
├── popup.html            # Main popup interface
├── popup.css             # Style file
├── popup.js              # Main JavaScript file
├── background.js         # Background script
├── icon.png              # Extension icon
└── README.md             # This file
```

### 🔧 **Technical Features**
- **Manifest Version**: 3
- **Permissions**: bookmarks, tabs, scripting, downloads, activeTab
- **Host Permissions**: <all_urls>
- **Content Security Policy**: Secure script loading

### 🎨 **Design System**
- **CSS Framework**: Custom Neumorphism
- **Color Scheme**: Theme support with CSS Variables
- **Typography**: Segoe UI, Arial fallback
- **Icons**: Emoji-based icons
- **Responsive**: Mobile-first approach

---
