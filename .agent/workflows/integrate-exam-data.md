---
description: Workflow for integrating and formatting new exam data into mockData.js
---

# Integrate Exam Data Workflow (3-Step Process)

非常に分析が高度なため、以下の3段階に分けて進めます。

## Phase 1: データ読み取りと基本登録 (Basic Registration)

1.  **データの読み込みと整理**:
    *   Exam ID (例: `2024-2-jun`)、年度、回、会場種別を特定。
    *   過去問本文、オリジナル本文、設問、翻訳データを準備。
2.  **基本情報の登録 (`mockData.js`)**:
    *   `AVAILABLE_YEARS` に新しいエントリーを追加。
    *   `MOCK_DATA` に器となるオブジェクトを作成。
3.  **本文と「作成意図」の完成**:
    *   `content` の登録（段落間は **\n\n** を使用）。
    *   `analysis.intent`（作成意図）を完成させ、最低限の表示を確認。

## Phase 2: 比較と要約 (Comparison & Summary)

1.  **過去問との比較 (`comparison`)**:
    *   **HTMLテーブル**: 必ず `<table>` を使用。
    *   **ヘッダー装飾**: `<th class="header-green">` で項目ラベルを記述。
    *   **バッジ使用**: `<span class="badge-blue">` (過去問用) や `<span class="badge-orange">` (オリジナル用) を使用。
    *   **テンプレート**:
      ```html
      <table>
        <tr>
          <th class="header-green">項目</th>
          <th class="header-green"><span class="badge-blue">Past Title (過去問)</span></th>
          <th class="header-green"><span class="badge-orange">Original Title (オリジナル)</span></th>
        </tr>
        <tr>
          <td><strong>テーマ</strong></td>
          <td>...</td>
          <td>...</td>
        </tr>
        <!-- 構造、共通点、相違点と続く -->
      </table>

      ### 1. トピックと展開の相違 (Topic Differences)
      * **Past Title (過去問):** ...
      * **Original Title (オリジナル):** ...

      ### 2. 設問設計の比較 (Question Design)
      * **Q1 (内容一致 - Para 1):**
        * **過去問:** ...
        * **Original:** ...
      ```
2.  **本文要約 (`summary`)**:
    *   **構成**: 過去問とオリジナルそれぞれの要約を並べる。
    *   **ヘッダー**: 視認性を高めるため、`### **1. Title (過去問)**` のような大きな見出しを使用。
    *   **パラグラフ構成**: 各段落のトピック内容を `**1. Topic (第1段落)**` の形式で明示。
    *   **テンプレート**:
      ```markdown
      ### **1. Past Title (過去問)**
      本文は、...についての説明文です。

      **1. Paragraph Topic (第1段落)**
      ...
      
      ### **2. Original Title (オリジナル)**
      ...
      ```

## Phase 3: 構文解説と検証 (Syntax & Verification)

1.  **整合性の事前確認 (Pre-Check)**:
    *   **本文のスペース**: 文末のピリオド後など、必要なスペースが `content` カラムに含まれているか確認（例: `word.Next` -> `word. Next`）。
    *   **翻訳の同期**: `content` の文節区切りが `translations` 配列のエントリーと **完全に一致** しているか確認。Evidenceとして使う部分が複数の翻訳エントリーにまたがっていないか、または逆に短すぎないか。
2.  **構文解説の構築 (`syntax`)**:
    *   **Styled HTML**: MarkdownではなくHTMLで記述。
    *   **QA翻訳ブロック**: 設問と全選択肢の翻訳を `syntax-qa-translation` クラスで含める。
    *   **ハイライト連動**:
        *   `syntax-panel-evidence` 内のテキストは本文 `content` と **一字一句（スペース・記号含む）完全に一致** していること。
        *   `translations` データのエントリーとも **完全一致** していること（翻訳ポップアップ用）。
    *   **インタラクティブ・クオート**: `interactive-quote` と `data-highlight` を使い、Pointパネル内の引用と言い換え元を紐付ける。
3.  **厳密な検証 (Rigorous Verification)**:
    *   **Static Analysis**: コード上で `content` の文字列と `syntax` のEvidence文字列を目視で並べて比較（Diffツール推奨）。
    *   **Application Launch**: ブラウザで実際にクリックし、ハイライトがずれないか、翻訳ポップアップが `<Translation not found>` にならないか確認。

---
各フェーズの完了ごとに `task.md` と `walkthrough.md` を更新してください。
