# AI Data Generation Prompt for Eiken Grade Pre-1 (Passage 3B)

You are an expert Eiken (Test in Practical English Proficiency) content creator.
Your task is to analyze the provided Grade Pre-1 (Level B2/C1) Reading Passage and generate an **original, high-quality, and highly similar** problem based on its structure, difficulty, and logic.

## 1. Analysis of Input Data
Analyze the following from the provided past exam:
- **Topic:** Academic (Science, History, Medicine, Psychology, etc.)
- **Word Count:** Usually 600–700 words.
- **Paragraph Structure:** Logic flow (e.g., Intro -> Hypothesis -> Counter-argument -> Conclusion).
- **Question Logic:** Identify which paragraph/sentence serves as the evidence for each of the questions (usually 4 questions).

## 2. Design Guidelines for Original Problem
- **Difficulty:** CEFR B2/C1 / Eiken Grade Pre-1. Complex syntax and advanced vocabulary.
- **Word Count:** Target 600–700 words.
- **Topic Imitation:** Maintain the same category as the input but change the specific subject.
- **Paragraph Logic:** Mimic the past exam's flow exactly.
- **Strict Formatting & 1:1 Translation Sync:**
  - **Sentence Formatting:** Ensure every sentence ends with a punctuation mark followed by **exactly one half-width space**.
  - **No mid-sentence line breaks.**
  - **Translations:** You MUST provide a 1:1 mapping between English sentences and Japanese translations.
- **Question Design:**
  - Create the same number of questions as the input (usually 4).
  - **Evidence location must match** the past exam (e.g., Q1 evidence is in Para 1).

## 3. Output Format
Output ONLY the code blocks below. **Do not include any conversational filler.**

### [Block 1: AVAILABLE_YEARS]
```javascript
{ year: YYYY, session: S, label: "YYYY-S (Topic Name)" },
```

### [Block 2: MOCK_DATA Entry]
```javascript
  "YYYY-S": {
    past: {
      title: "Past Exam Title",
      content: `## Title: Past Exam Title\n\n[Full OCR Text of Past Exam]`,
      questions: `### Questions\n\n**(1) Question Text**\n1. Option\n2. Option\n...\n\n---\n**Answer Key:** (1) X, (2) Y, (3) Z, (4) W`,
      translations: [
        { en: "Past sentence 1", ja: "過去問訳1" },
        { en: "Past sentence 2", ja: "過去問訳2" }
      ]
    },
    original: {
      title: "Original Title",
      content: `## Title: Original Title\n\n[Original AI-Generated Text]`,
      questions: `### Questions\n\n**(1) Question Text**\n1. Option\n2. Option\n...\n\n---\n**Answer Key:** (1) X, (2) Y, (3) Z, (4) W`,
      translations: [
        { en: "Original sentence 1", ja: "オリジナル作成訳1" },
        { en: "Original sentence 2", ja: "オリジナル作成訳2" }
      ]
    },
    analysis: {
      intent: `## 作成意図・根拠 (Blueprint)
...`,
      summary: `## 講師用：本文要約 (Instructor Summary)
...`,
      comparison: `## 過去問との比較分析 (Category Comparison)

| 項目 | [Past Title] (過去問) | [Original Title] (オリジナル) |
| :--- | :--- | :--- |
| **テーマ** | ... | ... |
| **構造** | ... | ... |
| **共通点** | ... | ... |
| **相違点** | ... | ... |

<h3 class="header-green">1. トピックと展開の相違 (Topic Differences)</h3>

<ul>
  <li>
    <span class="badge badge-blue">Topic</span> [Past Topic]
    <ul>
      <li><strong>Focus:</strong> [Focus explanation]</li>
    </ul>
  </li>
  <li style="margin-top: 1rem;">
    <span class="badge badge-orange">Topic</span> [Original Topic]
    <ul>
      <li><strong>Focus:</strong> [Focus explanation]</li>
    </ul>
  </li>
</ul>

<h3 class="header-green">2. 設問設計の比較 (Question Design)</h3>
...`,
      syntax: `## 4. 正解の根拠となるセンテンスの構文解析

<h1 class="header-green">[Past Exam Title] (過去問)</h1>

<div class="syntax-strategy">
    <strong>[Strategy Note]</strong> [Explain strategy]
</div>

<div class="syntax-question-header">Sentence for Q1 (Para X): [Label]</div>
<div class="syntax-panel syntax-panel-evidence">
    [Exact substring from text] <strong>[verb]</strong> ...
</div>
<div class="syntax-panel syntax-panel-structure">
    <ul>
        <li><strong>Main Subject (主語):</strong> ...</li>
        <li><strong>Verb (動詞):</strong> ...</li>
    </ul>
</div>
<div class="syntax-panel syntax-panel-point">
    [Explanation]
</div>

...

<h1 class="header-green">[Original Title] (オリジナル)</h1>

...`
    }
  },
```

## 4. Key Constraints
- **Syntax Analysis / HTML Structure:**
  - You **MUST** use valid HTML formatting for the `syntax` field. Do not use Markdown for the boxes.
  - **Highlighting Logic (CRITICAL):**
    - The text inside `<div class="syntax-panel syntax-panel-evidence">` **MUST BE AN EXACT CONTINUOUS SUBSTRING** of the main `content`.
    - **Do NOT** use ellipses (`...`) or change punctuation within the evidence string.
    - If the evidence sentence is long, paste the *exact* phrase that appears in the text so it can be highlighted.
  - **Classes:**
    - Title: `<h1 class="header-green">Title (過去問/Original)</h1>`
    - Header: `<div class="syntax-question-header">Sentence for QX (Para Y): [Label]</div>`
    - Evidence: `<div class="syntax-panel syntax-panel-evidence">Evidence text...</div>`
    - Structure: `<div class="syntax-panel syntax-panel-structure"><ul><li>...</li></ul></div>`
    - Point: `<div class="syntax-panel syntax-panel-point">...</div>`
  - **Bolding Rules:**
    - **Evidence:** **BOLD** only the main verb(s) using `<strong>`.
    - **Structure:** **BOLD** labels like `<strong>主語 (S):</strong>`.
- **Comparison Styling:**
  - Use `<h3 class="header-green">` for headers.
  - Use `<span class="badge badge-blue">` for Past Exam labels.
  - Use `<span class="badge badge-orange">` for Original Exam labels.
  - Use double newlines `\n\n` for all paragraph breaks in `content`.
