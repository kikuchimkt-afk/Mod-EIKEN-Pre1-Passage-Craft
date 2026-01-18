---
description: 印刷プレビューに拡大縮小・余白・背景設定機能を追加する
---

# 印刷プレビュー詳細設定の追加

PassageCraftアプリの`handlePrint`関数に以下の機能を追加する手順。

## 追加する機能

1. **サイズ調整** - スライダー + プラス/マイナスボタン (50-150%)
2. **余白設定** - ドロップダウン (なし/狭い/普通/広い)
3. **背景表示切替** - チェックボックス
4. **自動フィット** - ページ読み込み時にA4サイズに収まるよう自動調整
5. **閉じるボタン** - プレビューウィンドウを閉じる

---

## 実装手順

### 1. CSSに追加するスタイル (`</style>`の前に追加)

```css
.close-btn { background: #6b7280; }
/* Scale slider */
.scale-control {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 15px;
  background: white;
  border-radius: 5px;
  border: 1px solid #ddd;
}
.scale-control input[type="range"] { width: 100px; }
.scale-control select { padding: 4px 8px; border-radius: 4px; border: 1px solid #ccc; }
.stepper-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #ccc;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stepper-btn:hover { background: #e5e7eb; }
.copyright-footer {
   position: absolute;
   bottom: 5mm;
   left: 0;
   right: 0;
   text-align: center;
   font-size: 10px;
   color: #555;
   font-family: "Hiragino Mincho ProN", serif;
}
.preview-container {
  transition: transform 0.2s;
}
```

### 2. コントロールバーのHTML (`<body>`直後に配置)

```html
<div class="no-print" style="margin-bottom: 20px; position: sticky; top: 20px; z-index: 100; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
  <div class="scale-control">
    <button class="stepper-btn" onclick="adjustScale(-5)">−</button>
    <label>サイズ: <span id="scale-value">100</span>%</label>
    <input type="range" id="scale-slider" min="50" max="150" value="100" oninput="updateScale(this.value)">
    <button class="stepper-btn" onclick="adjustScale(5)">+</button>
  </div>
  <div class="scale-control">
    <label>余白:</label>
    <select id="margin-select" onchange="updateMargin(this.value)">
      <option value="0">なし</option>
      <option value="5">狭い</option>
      <option value="10" selected>普通</option>
      <option value="15">広い</option>
    </select>
  </div>
  <div class="scale-control">
    <label style="display: flex; align-items: center; gap: 5px;">
      <input type="checkbox" id="bg-checkbox" checked onchange="toggleBackground(this.checked)">
      背景を表示
    </label>
  </div>
  <button onclick="window.print()">🖨️ 印刷</button>
  <button class="close-btn" onclick="window.close()">✕ 閉じる</button>
</div>
```

### 3. JavaScript関数 (`</body>`の前に配置)

```html
<script>
  function updateScale(value) {
    document.getElementById('scale-value').textContent = value;
    const content = document.querySelector('.preview-container');
    content.style.transform = 'scale(' + (value / 100) + ')';
    content.style.transformOrigin = 'top left';
    content.style.width = (29700 / value) + 'mm';
  }
  
  function adjustScale(delta) {
    const slider = document.getElementById('scale-slider');
    let newValue = parseInt(slider.value) + delta;
    newValue = Math.max(50, Math.min(150, newValue));
    slider.value = newValue;
    updateScale(newValue);
  }
  
  function updateMargin(value) {
    const content = document.querySelector('.preview-container');
    content.style.padding = value + 'mm ' + (parseInt(value) + 2) + 'mm';
  }
  
  function toggleBackground(show) {
    document.body.style.backgroundColor = show ? '#555' : '#fff';
    const container = document.querySelector('.preview-container');
    container.style.boxShadow = show ? '0 10px 25px rgba(0,0,0,0.5)' : 'none';
  }
  
  window.onload = function() {
    const content = document.querySelector('.preview-container');
    const pageHeight = 210 * 3.78; // A4 landscape height
    const contentHeight = content.scrollHeight;
    
    if (contentHeight > pageHeight) {
      const scale = Math.floor((pageHeight / contentHeight) * 100);
      document.getElementById('scale-slider').value = scale;
      updateScale(scale);
    }
  };
</script>
```

---

## 適用対象ファイル

各アプリの`src/App.jsx`内の`handlePrint`関数を編集:
- `(改)英検準１級_Passage Craft` ✅ 適用済み
- `(改)英検準2級_Passage Craft`
- `(改)英検3級_Passage Craft`
- `英検2級_Passage Craft`

## 参考実装

英検準１級アプリの実装: [App.jsx](file:///c:/Users/makoto/Documents/アプリ開発/(改)英検準１級_Passage Craft/src/App.jsx#L1307-L1420)
