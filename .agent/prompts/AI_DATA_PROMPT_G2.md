# AI Data Generation Prompt for Eiken Grade 2 (Passage 3B)

You are an expert Eiken (Test in Practical English Proficiency) content creator.
Your task is to analyze the provided Grade 2 (Level B1) Reading Passage (Part 3B) and generate an **original, high-quality, and highly similar** problem based on its structure, difficulty, and logic.

## 1. Analysis of Input Data
Analyze the following from the provided past exam:
- **Topic:** Environment, Science, Health, Education, Social Issues, etc.
- **Word Count:** Usually 300–350 words.
- **Paragraph Structure:** Logic flow (e.g., Intro -> Background -> Issue/Change -> Conclusion/Outlook).
- **Question Logic:** Identify which paragraph/sentence serves as the evidence for each of the 4 questions.

## 2. Design Guidelines for Original Problem
- **Difficulty:** CEFR B1 / Eiken Grade 2. Avoid overly academic or obscure vocabulary.
- **Word Count:** Target 300–350 words.
- **Topic Imitation:** Maintain the same category as the input.
  - *Example:* If the past exam is about "Environment (Recycling)," create an original about "Environment (Plastic Waste or Forest Conservation)."
- **Paragraph Logic:** Mimic the past exam's flow exactly.
- **Strict Formatting & 1:1 Translation Sync:**
  - **Sentence Formatting:** Ensure every sentence ends with a punctuation mark (. ! ?) followed by **exactly one half-width space**.
  - **No mid-sentence line breaks.**
  - **Abbreviations:** Use `Mr.` or `U.S.` carefully; do not put a space after their periods if you want to prevent accidental sentence splitting during processing.
  - **Translation Mapping:** You MUST provide a 1:1 mapping between English sentences and Japanese translations in the `translations` array.
- **Question Design:**
  - Total 4 questions.
  - Evidence location must match the past exam (e.g., Q1 from Para 1, Q2 from Para 2, etc.).
  - Create plausible distractors (incorrect options) to test logical understanding.
  - Use a different Answer Key pattern than the provided input.

## 3. Output Format
Output ONLY the code blocks below. Do not include any conversational filler.

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
      questions: `### Original Questions\n\n**(1) Question Text**\n1. Option\n...\n\n---\n**Answer Key:** (1) X, (2) Y, (3) Z, (4) W`,
      translations: [
        { en: "Original sentence 1", ja: "オリジナル作成訳1" },
        { en: "Original sentence 2", ja: "オリジナル作成訳2" }
      ]
    },
    analysis: {
      intent: `## 作成意図・根拠 (Blueprint)\n\n**ターゲットモデル:** [Past Exam Title]\n\n### 1. 量的構造\n- **総単語数:** ~[Word count] words\n- **パラグラフ構成:**\n  1. [Desc in JP]\n  2. [Desc in JP]\n  3. [Desc in JP]\n  4. [Desc in JP]\n\n### 2. 重要語彙\n- [Word list (Grade 2 level) with JP meaning]`,
      summary: `## 講師用：本文要約 (Instructor Summary)\n\n[General overview of the passage in Japanese - 2 to 3 sentences summary of the theme and conclusion.]\n\n### 1. [Para 1 Title] (第1段落)\n[Detailed paragraph-by-paragraph summary in Japanese. Around 100-150 characters per paragraph, covering key points and logical connections.]\n\n### 2. [Para 2 Title] (第2段落)\n...\n### 3. [Para 3 Title] (第3段落)\n...\n### 4. [Para 4 Title] (第4段落)\n...\n\n---\n講師用資料：授業前の確認や、生徒への解説の構成案としてご活用ください。`,
      comparison: `## 過去問との比較分析 (Category Comparison)

| 項目 | [Past Title] (過去問) | [Original Title] (オリジナル) | 共通点 (Commonality) |
| :--- | :--- | :--- | :--- |
| **テーマ** | ... | ... | ... |
| **構造** | ... | ... | ... |
| **設問1** | ... | ... | ... |
| **設問2** | ... | ... | ... |
| **設問3** | ... | ... | ... |
| **設問4** | ... | ... | ... |

<br/>

### 1. トピックと展開の相違 (Topic Differences)

*   **[Past Title] (過去問):**
    *   <span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:0.85em;">Topic</span> [Topic desc]
    *   <span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:0.85em;">Development</span> [Development flow]
    *   <span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:0.85em;">Focus</span> [Focus point]

*   **[Original Title] (オリジナル):**
    *   <span style="background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:0.85em;">Topic</span> [Topic desc]
    *   <span style="background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:0.85em;">Development</span> [Development flow]
    *   <span style="background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:0.85em;">Focus</span> [Focus point]

<br/>

### 2. 設問設計の比較 (Question Design)

*   **Q1 (内容一致 - Para 1):**
    *   **過去問:** "[Evidence sentence from past]" ([Logic])
    *   **Original:** "[Evidence sentence from original]" ([Logic])
*   **Q2 (内容一致 - Para 2):**
    *   **過去問:** ...
    *   **Original:** ...
*   **Q3 (内容一致 - Para 3):**
    *   **過去問:** ...
    *   **Original:** ...
*   **Q4 (内容一致 - Para 4):**
    *   **過去問:** ...
    *   **Original:** ...`,
      syntax: `## オリジナル本文の構文解説 (Original Passage Syntax Analysis)

### Sentence 1: [Evidence for Q1 - Para 1]
> [Sentence text. Use **bold** for key grammar points.]

**構造分解:**
1. **主語 (Subject):** [English Subject] ([JP meaning])
2. **主動詞 (Main Verb):** [English Main Verb] ([JP meaning])
3. **目的語/補語 (Object/Complement):** [English Object/Complement] ([JP meaning/Role])
4. **修飾要素 (Modifiers):** [English Modifier] ([JP Role: e.g., Adjective phrase modifying X])

**ポイント:** [Grammatical explanation in JP. Explain structure and significance for Q1.]

### Sentence 2: [Evidence for Q2 - Para 2]
...
### Sentence 3: [Evidence for Q3 - Para 3]
...
### Sentence 4: [Evidence for Q4 - Para 4]
...`
    }
  },
```

## 4. Key Focus for Grade 2 Learners (Japanese Explanations)
When generating `analysis.syntax`, focus on:
- **Coverage:** Select **exactly 4 sentences** from the original passage (one for each question).
- **Structure Breakdown:**
  1. **Subject:** Identify the core subject.
  2. **Main Verb:** Identify the main verb phrase (including auxiliaries).
  3. **Object/Complement:** Identify what follows the verb (O or C).
  4. **Modifiers:** Explicitly list phrases/clauses (e.g., "because of...", "that they are...") and what they modify.
- **Grammar Points:**
  - Relative pronouns (who, which, that).
  - Present perfect / Passive voice.
  - To-infinitives / Participles.
  - Conjunctions / Complex sentence structures.
