import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { MainLayout } from './components/layout/MainLayout';
import { Tabs } from './components/ui/Tabs';
import { AVAILABLE_YEARS, MOCK_DATA } from './data/mockData';

// Markdown Renderer
const MarkdownRenderer = ({ text, translations = [], onSentenceClick, highlightedSentence }) => {
  if (!text) return <div className="markdown-body">No content available</div>;

  // Function to split text into sentences while keeping punctuation
  const splitTextIntoSentences = (text) => {
    if (typeof text !== 'string') return [text];
    // Split by sentence-ending punctuation (and optional quote) followed by space or newline
    return text.split(/(?<=[.!?]["”]?)\s+/);
  };

  // Helper to extract text from children
  const extractText = (children) => {
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) return children.map(extractText).join('');
    if (children?.props?.children) return extractText(children.props.children);
    return '';
  };

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h2: (props) => <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '1.5rem' }} {...props} />,
          h3: (props) => <h3 style={{ color: 'var(--accent-primary)', marginTop: '1.5rem' }} {...props} />,
          blockquote: (props) => {
            const content = extractText(props.children);
            return (
              <blockquote
                style={{
                  borderLeft: '4px solid var(--accent-primary)',
                  paddingLeft: '1rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '0.5rem 1rem'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSentenceClick && onSentenceClick(content, 'blockquote');
                }}
                {...props}
              />
            );
          },
          p: ({ node, children, ...props }) => {
            // Process children to find sentences and attach translations
            const processedChildren = React.Children.map(children, child => {
              if (typeof child === 'string') {
                const sentences = splitTextIntoSentences(child);
                return sentences.map((sentence, idx) => {
                  const cleanSentence = sentence.trim();
                  const translation = translations.find(t => {
                    return t.en.trim() === cleanSentence;
                  })?.ja;

                  const isHighlighted = highlightedSentence && cleanSentence.includes(highlightedSentence);

                  if (translation) {
                    return (
                      <span
                        key={idx}
                        className={`sentence-item ${isHighlighted ? 'highlighted-sentence' : ''}`}
                        style={isHighlighted ? { backgroundColor: '#fff9c4', boxShadow: '0 0 0 2px #fbc02d', borderRadius: '2px', transition: 'all 0.3s', cursor: 'pointer' } : { cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSentenceClick) {
                            onSentenceClick(e, translation, cleanSentence);
                          }
                        }}
                      >
                        {sentence}{' '}
                      </span>
                    );
                  }
                  return <span key={idx} className={isHighlighted ? 'highlighted-sentence' : ''} style={isHighlighted ? { backgroundColor: '#fff9c4' } : {}}>{sentence}{' '}</span>;
                });
              }
              return child;
            });

            return <p style={{ marginBottom: '1rem', lineHeight: '1.8', textIndent: '1em' }} {...props}>{processedChildren}</p>;
          },
          div: (props) => {
            const { className, children } = props;
            if (className && className.includes('syntax-panel-evidence')) {
              const content = extractText(children);
              return (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onSentenceClick && onSentenceClick(content, 'blockquote');
                  }}
                  style={{ cursor: 'pointer' }}
                  {...props}
                />
              );
            }
            return <div {...props} />;
          },
          li: ({ children, ...props }) => {
            const processedChildren = React.Children.map(children, child => {
              if (typeof child === 'string') {
                // Only simple check for list items (often questions/options)
                if (highlightedSentence && child.includes(highlightedSentence)) {
                  return (
                    <span
                      className="highlighted-sentence"
                      style={{ backgroundColor: '#fff9c4', boxShadow: '0 0 0 2px #fbc02d', borderRadius: '2px', transition: 'all 0.3s' }}
                    >
                      {child}
                    </span>
                  );
                }
                return child;
              }
              return child;
            });
            return <li style={{ marginBottom: '0.5rem' }} {...props}>{processedChildren}</li>;
          },
          strong: (props) => <strong className="highlight-text" {...props} />,
          span: (props) => {
            const { className, children, ...rest } = props;
            if (className && className.includes('interactive-quote')) {
              const content = extractText(children);
              // Check if data-highlight is passed (rehype-raw converts attributes to props, usually lowercase)
              const targetText = rest['data-highlight'] || content;

              return (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    let cleanContent = targetText.trim();
                    // Remove quotes if they exist (only for display content match)
                    if (!rest['data-highlight']) {
                      if ((cleanContent.startsWith('"') && cleanContent.endsWith('"')) ||
                        (cleanContent.startsWith('“') && cleanContent.endsWith('”'))) {
                        cleanContent = cleanContent.slice(1, -1);
                      }
                    }
                    onSentenceClick && onSentenceClick(cleanContent, 'blockquote');
                  }}
                  {...props}
                />
              );
            }
            return <span {...props} />;
          },
          table: (props) => <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}><table className="data-table" {...props} /></div>,
          th: (props) => <th {...props} />,
          td: (props) => <td {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div >
  );
};

// Export Button Component
const ExportButton = ({ label, onClick, icon = "📋" }) => (
  <button
    onClick={onClick}
    style={{
      padding: '0.5rem 1rem',
      fontSize: '0.85rem',
      backgroundColor: 'var(--accent-primary)',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'background-color 0.2s'
    }}
    onMouseOver={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
    onMouseOut={(e) => e.target.style.backgroundColor = 'var(--accent-primary)'}
  >
    {icon} {label}
  </button>
);

// Utility: Split text into sentences
const splitIntoSentences = (text) => {
  // Remove markdown headers and clean text
  const cleanText = text
    .replace(/^##.*$/gm, '')
    .replace(/^\s*\n/gm, '\n')
    .trim();

  // Split by sentence-ending punctuation followed by space or newline
  const sentences = cleanText.split(/(?<=[.!?]["”]?)\s+(?=[A-Z])/);
  return sentences.filter(s => s.trim().length > 10);
};

// Utility: Identify complex sentences (nested structures)
const identifyComplexSentences = (sentences) => {
  const complexIndicators = [
    { pattern: /,\s*which\s/i, type: '関係代名詞 (which)' },
    { pattern: /,\s*who\s/i, type: '関係代名詞 (who)' },
    { pattern: /,\s*where\s/i, type: '関係副詞 (where)' },
    { pattern: /—[^—]+—/i, type: 'ダッシュによる挿入' },
    { pattern: /\([^)]+\)/i, type: '括弧による挿入' },
    { pattern: /\s(although|though|while|whereas)\s/i, type: '譲歩節' },
    { pattern: /\s(because|since|as)\s.*,/i, type: '理由節' },
    { pattern: /\s(if|unless|provided)\s/i, type: '条件節' },
    { pattern: /not only\s.*but\s(also)?/i, type: '相関接続詞' },
    { pattern: /\s(what|whatever|whoever|however)\s/i, type: '複合関係詞' },
    { pattern: /,\s*\w+ing\s/i, type: '分詞構文' },
    { pattern: /:\s[a-z]/i, type: 'コロンによる説明' },
  ];

  const complexSentences = [];
  sentences.forEach((sentence, index) => {
    const found = [];
    complexIndicators.forEach(({ pattern, type }) => {
      if (pattern.test(sentence)) {
        found.push(type);
      }
    });
    // Count commas as complexity indicator
    const commaCount = (sentence.match(/,/g) || []).length;
    if (found.length > 0 || commaCount >= 3) {
      complexSentences.push({
        index: index + 1,
        sentence: sentence.substring(0, 60) + (sentence.length > 60 ? '...' : ''),
        types: found.length > 0 ? found : ['複数の節を含む複雑な構造'],
        commaCount
      });
    }
  });
  return complexSentences;
};

// Generate syntax analysis template
const generateSyntaxTemplate = (content, title) => {
  const sentences = splitIntoSentences(content);
  const complexSentences = identifyComplexSentences(sentences);

  let output = `# 構文解説用テンプレート: ${title}\n\n`;

  // Complex sentence warnings at the top
  if (complexSentences.length > 0) {
    output += `## ⚠️ 注意すべき複雑な構造を含むセンテンス\n\n`;
    output += `> **以下のセンテンスは入れ子構造や挿入句を含むため、特に注意して解説してください。**\n\n`;
    complexSentences.forEach(cs => {
      output += `- **Sentence ${cs.index}:** ${cs.types.join(', ')}\n`;
      output += `  - 「${cs.sentence}」\n`;
    });
    output += `\n---\n\n`;
  }

  output += `## 全センテンス構造解析\n\n`;
  output += `**総センテンス数:** ${sentences.length}\n\n`;

  sentences.forEach((sentence, index) => {
    output += `### Sentence ${index + 1}\n\n`;
    output += `> ${markMainVerbs(sentence)}\n\n`;
    output += `**構造分解:**\n`;
    output += `1. **主語 (Subject):** [記入]\n`;
    output += `2. **主動詞 (Main Verb):** [記入]\n`;
    output += `3. **目的語/補語 (Object/Complement):** [記入]\n`;
    output += `4. **修飾要素 (Modifiers):** [記入]\n\n`;
    output += `**ポイント:** [記入]\n\n`;
    output += `---\n\n`;
  });

  return output;
};

// Mark main verbs in text (bold format for markdown)
function markMainVerbs(content) {
  // 1. Auxiliary Verb Phrases (Heuristic: Aux + (Adv) + Non-Determiner/Prep)
  // Matches "has eaten", "is running", "can go", "was strictly forbidden"
  // Excludes "has a", "is in", "can the"
  const phrasePattern = /\b(can|could|will|would|shall|should|may|might|must|has|have|had|is|are|was|were|does|do|did)\s+(?:not\s+)?(?:never\s+)?(?:always\s+)?(?:[a-z]+ly\s+)?(?!a\b|an\b|the\b|my\b|your\b|his\b|her\b|its\b|our\b|their\b|this\b|that\b|these\b|those\b|some\b|any\b|no\b|to\b|in\b|on\b|at\b|by\b|for\b|of\b|with\b|from\b)\w+\b/gi;

  // 2. Finite Strong Verbs (Single words) - Fallback for simple tenses
  const verbPatterns = [
    phrasePattern,
    // Be verbs and modals (as single verbs)
    /\b(is|are|was|were)\b/gi,
    /\b(has|have|had)\b/gi,
    /\b(does|do|did)\b/gi,
    /\b(can|could|will|would|shall|should|may|might|must)\b/gi,

    // Strong verbs (Finite forms only, mostly)
    /\b(became|become|becomes)\b/gi,
    /\b(made|make|makes)\b/gi,
    /\b(led|lead|leads)\b/gi,
    /\b(began|begin|begins)\b/gi,
    /\b(rose|rise|rises)\b/gi,
    /\b(fell|fall|falls)\b/gi,
    /\b(took|take|takes)\b/gi,
    /\b(gave|give|gives)\b/gi,
    /\b(found|find|finds)\b/gi,
    /\b(brought|bring|brings)\b/gi,
    /\b(thought|think|thinks)\b/gi,
    /\b(said|say|says)\b/gi,
    /\b(went|go|goes)\b/gi,
    /\b(came|come|comes)\b/gi,
    /\b(saw|see|sees)\b/gi,
    /\b(knew|know|knows)\b/gi,
    /\b(got|get|gets)\b/gi,
    /\b(set|sets)\b/gi,
    /\b(put|puts)\b/gi,
    /\b(kept|keep|keeps)\b/gi,
    /\b(left|leave|leaves)\b/gi,
    /\b(felt|feel|feels)\b/gi,
    /\b(seemed|seem|seems)\b/gi,
    /\b(appeared|appear|appears)\b/gi,
    /\b(remained|remain|remains)\b/gi,
    /\b(continued|continue|continues)\b/gi,
    /\b(established|establish|establishes)\b/gi,
    /\b(created|create|creates)\b/gi,
    /\b(developed|develop|develops)\b/gi,
    /\b(discovered|discover|discovers)\b/gi,
    /\b(believed|believe|believes)\b/gi,
    /\b(considered|consider|considers)\b/gi,
    /\b(resulted|result|results)\b/gi,
    /\b(caused|cause|causes)\b/gi,
    /\b(allowed|allow|allows)\b/gi,
    /\b(required|require|requires)\b/gi,
    /\b(included|include|includes)\b/gi,
    /\b(provided|provide|provides)\b/gi,
    /\b(suggested|suggest|suggests)\b/gi,
    /\b(argued|argue|argues)\b/gi,
    /\b(claimed|claim|claims)\b/gi,
    /\b(proved|prove|proves)\b/gi,
    /\b(showed|show|shows)\b/gi,
    /\b(meant|mean|means)\b/gi,
    /\b(spread|spreads)\b/gi,
    /\b(built|build|builds)\b/gi,
    /\b(used|use|uses)\b/gi,
    /\b(helped|help|helps)\b/gi,
    /\b(changed|change|changes)\b/gi,
    /\b(controlled|control|controls)\b/gi,
    /\b(covered|cover|covers)\b/gi,
    /\b(employed|employ|employs)\b/gi,
    /\b(granted|grant|grants)\b/gi,
    /\b(hoped|hope|hopes)\b/gi,
    /\b(endured|endure|endures)\b/gi,
    /\b(adopted|adopt|adopts)\b/gi,
  ];

  let markedContent = content;

  const paragraphs = markedContent.split('\n\n');
  const processedParagraphs = paragraphs.map(para => {
    // Skip markdown headers and other special formatting
    if (para.startsWith('#') || para.startsWith('*') || para.startsWith('-') || para.startsWith('>')) {
      return para;
    }

    // Split into sentences to handle structural logic better
    const sentences = para.split(/(?<=[.!?]["”]?)\s+(?=[A-Z])/);

    return sentences.map(sentence => {
      // 1. Mask excluded zones to prevent marking
      let workingSentence = sentence;

      // Mask quoted text
      workingSentence = workingSentence.replace(/"[^"]*"/g, match => ' '.repeat(match.length));
      workingSentence = workingSentence.replace(/“[^”]*”/g, match => ' '.repeat(match.length));
      // Mask included text in parentheses
      workingSentence = workingSentence.replace(/\([^)]*\)/g, match => ' '.repeat(match.length));

      // Mask relative clauses / subordinate clauses (Heuristic)
      const subordinators = ['who', 'which', 'that', 'where', 'when', 'if', 'although', 'because', 'since', 'while', 'as'];
      subordinators.forEach(sub => {
        // Regex to match subordinator and following text until comma or a limit
        const regex = new RegExp(`\\b${sub}\\b[^,;]*`, 'gi');
        workingSentence = workingSentence.replace(regex, match => ' '.repeat(match.length));
      });

      // Mask "to" + word (Infinitive)
      workingSentence = workingSentence.replace(/\bto\s+\w+/gi, match => ' '.repeat(match.length));

      // 2. Find finite verbs (or phrases) in the remaining "Safe" text
      let matches = [];
      verbPatterns.forEach(pattern => {
        let match;
        // Reset lastIndex for global regex
        pattern.lastIndex = 0;
        while ((match = pattern.exec(workingSentence)) !== null) {
          matches.push({
            word: match[0],
            index: match.index
          });
        }
      });

      if (matches.length === 0) return sentence;

      // Sort by index ASC, then by Length DESC (prioritize longer phrases starting at same pos)
      matches.sort((a, b) => {
        if (a.index !== b.index) return a.index - b.index;
        return b.word.length - a.word.length;
      });

      // Strategy: Pick the first one (most likely Main Verb in main clause), 
      // AND any subsequent ones preceded by 'and', 'or', 'but'
      const finalVerbs = [];

      if (matches.length > 0) {
        finalVerbs.push(matches[0]);
        // Track end position to avoid overlaps
        let lastEnd = matches[0].index + matches[0].word.length;

        // Look for coordinated verbs
        for (let i = 1; i < matches.length; i++) {
          const curr = matches[i];
          // Skip if overlapping with selected match
          if (curr.index < lastEnd) continue;

          // Check text between last match and current
          const textBetween = sentence.substring(lastEnd, curr.index);

          if (/\b(and|or|but)\b/.test(textBetween) && textBetween.length < 20) {
            finalVerbs.push(curr);
            lastEnd = curr.index + curr.word.length;
          }
        }
      }

      // 3. Mark the selected verbs in the ORIGINAL sentence
      // Create boolean mask
      const isVerb = new Array(sentence.length).fill(false);
      finalVerbs.forEach(v => {
        for (let i = 0; i < v.word.length; i++) {
          isVerb[v.index + i] = true;
        }
      });

      let rebuilt = '';
      let i = 0;
      while (i < sentence.length) {
        if (isVerb[i]) {
          rebuilt += '**';
          let j = i;
          while (j < sentence.length && isVerb[j]) j++;
          rebuilt += sentence.substring(i, j);
          rebuilt += '**';
          i = j;
        } else {
          rebuilt += sentence[i];
          i++;
        }
      }
      return rebuilt;

    }).join(' '); // Rejoin sentences
  });

  return processedParagraphs.join('\n\n');
}

// Copy to clipboard utility
const copyToClipboard = async (text, successMessage = 'コピーしました！') => {
  try {
    await navigator.clipboard.writeText(text);
    alert(successMessage);
  } catch (err) {
    console.error('Copy failed:', err);
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert(successMessage);
  }
};

// Utility: Strip common indentation from template literals
const stripCommonIndent = (str) => {
  if (!str) return '';
  const lines = str.split('\n');
  const validLines = lines.filter(line => line.trim().length > 0);
  if (validLines.length === 0) return str;

  // Find minimum indentation ignoring the first line if it starts with characters (often headers)
  // Actually, standard template literal usage:
  // `
  //   content
  //   content
  // `
  // The first line is empty.
  // If the string starts with text immediately `text`, then indent is 0 for that line.

  const minIndent = validLines.reduce((min, line) => {
    const indent = line.match(/^\s*/)[0].length;
    return Math.min(min, indent);
  }, Infinity);

  if (minIndent === 0) return str;

  return lines.map(line => {
    // Only strip if the line has enough length (don't strip empty lines to negative)
    // Actually just slice if it matches the indent pattern or is empty
    return line.length >= minIndent ? line.slice(minIndent) : line;
  }).join('\n');
};

function App() {
  // --- Persistent State Initialization ---
  const [selectedYearSession, setSelectedYearSession] = useState(() => {
    return localStorage.getItem('passageCraft_selectedYear') || "2025-2";
  });

  const [activeLeftTab, setActiveLeftTab] = useState(() => {
    return localStorage.getItem('passageCraft_activeLeftTab') || 'past';
  });

  const [activeRightTab, setActiveRightTab] = useState(() => {
    return localStorage.getItem('passageCraft_activeRightTab') || 'intent';
  });

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem('passageCraft_selectedYear', selectedYearSession);
  }, [selectedYearSession]);

  useEffect(() => {
    localStorage.setItem('passageCraft_activeLeftTab', activeLeftTab);
  }, [activeLeftTab]);

  useEffect(() => {
    localStorage.setItem('passageCraft_activeRightTab', activeRightTab);
  }, [activeRightTab]);

  // Tooltip State
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });

  // Highlight State for Syntax Interaction
  const [highlightedSentence, setHighlightedSentence] = useState(null);

  const handleSentenceClickInteraction = (e, translation, sentenceText) => {
    e.stopPropagation(); // Prevent background click from firing immediately

    // Toggle logic: if clicking the same sentence that is already highlighted, clear it.
    if (highlightedSentence === sentenceText && tooltip.visible) {
      setHighlightedSentence(null);
      setTooltip({ ...tooltip, visible: false });
      return;
    }

    // Otherwise, highlight this new sentence
    setHighlightedSentence(sentenceText);

    const rect = e.target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 10;
    setTooltip({ visible: true, text: translation, x, y });
  };

  const handleBackgroundClick = () => {
    setHighlightedSentence(null);
    setTooltip({ ...tooltip, visible: false });
  };
  // Handle click on syntax header or blockquote to highlight sentence in original text
  const handleSyntaxClick = (content, type, e) => {
    if (e) e.stopPropagation();
    let targetSentence = null;
    let targetTranslation = null;
    let targetTab = null;

    // Helper to search in a set of sentences
    const findInSentences = (sentences) => {
      if (!sentences) return -1;

      let foundIndex = -1;

      if (type === 'blockquote') {
        let cleanContent = content.trim();

        // Strip headers like "**Evidence:**" or "Evidence:"
        cleanContent = cleanContent.replace(/^\*\*Evidence:\*\*\s*/i, '')
          .replace(/^Evidence:\s*/i, '')
          .trim();

        // Remove surrounding quotes if present
        if ((cleanContent.startsWith('"') && cleanContent.endsWith('"')) ||
          (cleanContent.startsWith('“') && cleanContent.endsWith('”'))) {
          cleanContent = cleanContent.slice(1, -1).trim();
        }

        // 1. Try exact/include match
        foundIndex = sentences.findIndex(t => t.en.trim().includes(cleanContent) || cleanContent.includes(t.en.trim()));

        // 2. Robust match for abbreviated text
        if (foundIndex === -1 && (cleanContent.includes('...') || cleanContent.includes('…'))) {
          const chunks = cleanContent.split(/\.{3}|…/).map(c => c.trim()).filter(c => c.length > 5);
          for (const chunk of chunks) {
            foundIndex = sentences.findIndex(t => t.en.includes(chunk));
            if (foundIndex !== -1) break;
          }
        }
      } else if (type === 'header') {
        const sentenceMatch = content.match(/Sentence\s+(\d+)/);
        if (sentenceMatch) {
          const index = parseInt(sentenceMatch[1], 10) - 1;
          if (sentences[index]) return index;
        }
      }
      return foundIndex;
    };

    // Check Past Data
    const pastSentences = currentData.past?.translations;
    const pastIndex = findInSentences(pastSentences);

    // Also check questions text if not found in sentences
    let questionMatch = null;
    const pastQuestions = currentData.past?.questions;
    if (pastIndex === -1 && pastQuestions) {
      // Search in question text
      // Simple check: does question text contain the quote?
      let cleanContent = content.trim();
      // Remove surrounding quotes if present
      if ((cleanContent.startsWith('"') && cleanContent.endsWith('"')) ||
        (cleanContent.startsWith('“') && cleanContent.endsWith('”'))) {
        cleanContent = cleanContent.slice(1, -1).trim();
      }

      if (pastQuestions.includes(cleanContent)) {
        questionMatch = { text: cleanContent, tab: 'past_q' };
      }
    }

    if (pastIndex !== null && pastIndex !== -1) {
      targetSentence = pastSentences[pastIndex].en;
      targetTranslation = pastSentences[pastIndex].ja;
      targetTab = 'past';
    } else if (questionMatch) {
      // Found in Past Questions
      targetSentence = questionMatch.text;
      targetTab = 'past_q';
      // No translation popup for questions usually, or we'd need to parse it
    } else {
      // Check Original Data
      const originalSentences = currentData.original?.translations;
      const originalIndex = findInSentences(originalSentences);

      let originalQuestionMatch = null;
      const originalQuestions = currentData.original?.questions;
      if (originalIndex === -1 && originalQuestions) {
        let cleanContent = content.trim();
        if ((cleanContent.startsWith('"') && cleanContent.endsWith('"')) ||
          (cleanContent.startsWith('“') && cleanContent.endsWith('”'))) {
          cleanContent = cleanContent.slice(1, -1).trim();
        }
        if (originalQuestions.includes(cleanContent)) {
          originalQuestionMatch = { text: cleanContent, tab: 'original_q' };
        }
      }

      if (originalIndex !== null && originalIndex !== -1) {
        targetSentence = originalSentences[originalIndex].en;
        targetTranslation = originalSentences[originalIndex].ja;
        targetTab = 'original';
      } else if (originalQuestionMatch) {
        targetSentence = originalQuestionMatch.text;
        targetTab = 'original_q';
      }
    }

    if (targetSentence && targetTab) {
      // Toggle logic: if clicking a quote that points to the same sentence already highlighted, clear it.
      if (highlightedSentence === targetSentence && tooltip.visible) {
        setHighlightedSentence(null);
        setTooltip({ ...tooltip, visible: false });
        return;
      }

      setHighlightedSentence(targetSentence);
      setActiveLeftTab(targetTab);

      // Trigger translation popup and scroll
      setTimeout(() => {
        // Try to find the sentence span first
        const spans = document.querySelectorAll('.sentence-item');
        let targetSpan = null;

        for (let span of spans) {
          const spanText = span.textContent.trim();
          const cleanTarget = targetSentence.trim();
          if (spanText.includes(cleanTarget) || cleanTarget.includes(spanText)) {
            targetSpan = span;
            break;
          }
        }

        // If not found in sentence items (it might be in questions section), allow general text search or just scroll to view
        if (!targetSpan) {
          // Should we look for any element containing the text?
          // Since questions are rendered as markdown, they might not be in .sentence-item spans unless we wrap them.
          // But highlightedSentence state is passed to MarkdownRenderer.
          // Does MarkdownRenderer use it for general text?
          // See MarkdownRenderer implementation: it splits sentences for p tags.
          // Questions block might be paragraphs or lists.

          // If the question text is rendered inside a <p>, unlikely to be split the same way as passage unless we use the same component logic.
          // We need to ensure questions are also using the split/highlight logic or at least we find the text.
        }

        if (targetSpan) {
          // Scroll logic
          targetSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Show tooltip
          if (targetTranslation) {
            const rect = targetSpan.getBoundingClientRect();
            setTooltip({
              visible: true,
              text: targetTranslation,
              x: rect.left + rect.width / 2,
              y: rect.top - 10
            });
          }
        }
      }, 100);
    }


  };

  // Adjust tooltip position if it goes off-screen
  const tooltipRef = useRef(null);
  useEffect(() => {
    if (tooltip.visible && tooltipRef.current) {
      const el = tooltipRef.current;
      const rect = el.getBoundingClientRect();
      const padding = 10;
      let newX = tooltip.x;

      // Check left edge
      if (newX - rect.width / 2 < padding) {
        newX = rect.width / 2 + padding;
      }
      // Check right edge
      if (newX + rect.width / 2 > window.innerWidth - padding) {
        newX = window.innerWidth - rect.width / 2 - padding;
      }

      if (newX !== tooltip.x) {
        setTooltip(prev => ({ ...prev, x: newX }));
      }
    }
  }, [tooltip.visible, tooltip.text]);

  // Left Column Tabs
  const leftTabs = [
    { id: 'past', label: '過去問本文' },
    { id: 'past_q', label: '過去問設問' },
    { id: 'original', label: 'オリジナル本文' },
    { id: 'original_q', label: 'オリジナル設問' },
  ];

  // Right Column Tabs
  const rightTabs = [
    { id: 'intent', label: '作成意図・根拠' },
    { id: 'comparison', label: '過去問との比較' },
    { id: 'summary', label: '本文要約' },
    { id: 'syntax', label: '構文解説' },
  ];

  // Derive content based on selection
  const currentData = MOCK_DATA[selectedYearSession] || {
    past: { title: "Data Not Found", content: "Data not available for this selection." },
    original: {},
    analysis: {}
  };

  // Helper to get content for Left Panel
  const getLeftContent = () => {
    let content = '';
    switch (activeLeftTab) {
      case 'past': content = currentData.past?.content; break;
      case 'past_q': content = currentData.past?.questions; break;
      case 'original': content = currentData.original?.content; break;
      case 'original_q': content = currentData.original?.questions; break;
      default: content = '';
    }
    return stripCommonIndent(content);
  };

  // Helper to get content for Right Panel
  const getRightContent = () => {
    let content = '';
    switch (activeRightTab) {
      case 'intent': content = currentData.analysis?.intent; break;
      case 'summary': content = currentData.analysis?.summary; break;
      case 'comparison': content = currentData.analysis?.comparison; break;
      case 'syntax': content = currentData.analysis?.syntax; break;
      default: content = '';
    }
    return stripCommonIndent(content);
  };

  // Export handlers
  const handleExportOriginalWithVerbs = () => {
    const content = currentData.original?.content;
    if (!content) {
      alert('オリジナル本文がありません');
      return;
    }
    const markedContent = markMainVerbs(content);

    const yearData = AVAILABLE_YEARS.find(y => y.id === selectedYearSession);
    const pastTitle = currentData.past?.title || '';
    const footer = yearData
      ? `\n\n[ 類題 ： ${yearData.year}年第${yearData.session}回，”${pastTitle}” ]`
      : '';

    const output = `# オリジナル本文（主動詞マーク済み）\n\n${markedContent}${footer}`;
    copyToClipboard(output, 'オリジナル本文（主動詞マーク済み）をコピーしました！');
  };

  const handleExportOriginalQuestions = () => {
    const questions = currentData.original?.questions;
    if (!questions) {
      alert('オリジナル設問がありません');
      return;
    }

    // Extract question design intent from analysis data (original passage only)
    let questionIntent = '';
    const intent = currentData.analysis?.intent || '';
    const comparison = currentData.analysis?.comparison || '';

    // Build the question intent header for AI explanation
    questionIntent += `## 📌 解説AI向け：作問者の意図と根拠センテンス\n\n`;
    questionIntent += `> **重要**: 以下は、各設問がどのセンテンス（または段落）に基づいて作成されたかを示す情報です。\n`;
    questionIntent += `> 学習者を正解へ導く際は、該当するセンテンスに注目させ、論理的に解答を導いてください。\n\n`;

    // Extract question pattern table from comparison (original column only)
    let hasQuestionPattern = false;
    if (comparison) {
      // Look for table rows containing 設問1, 設問2, etc.
      const tableRows = comparison.match(/\| \*\*設問[0-9]+\*\* \|[^\n]+/g);
      if (tableRows && tableRows.length > 0) {
        hasQuestionPattern = true;
        questionIntent += `### 設問パターン概要\n`;
        questionIntent += `| 設問 | 注目すべきポイント | 対応パラグラフ |\n`;
        questionIntent += `| :--- | :--- | :--- |\n`;

        tableRows.forEach(row => {
          // Extract question number and original column (3rd column, skipping past-exam column)
          const columns = row.split('|').map(col => col.trim()).filter(col => col);
          if (columns.length >= 3) {
            const questionNum = columns[0]; // e.g., **設問1**
            const originalContent = columns[2]; // Original column (3rd)
            // Extract paragraph info from the content
            const paraMatch = originalContent.match(/\(Para \d+\)/);
            const para = paraMatch ? paraMatch[0] : '';
            const content = originalContent.replace(/\(Para \d+\)/, '').trim();
            questionIntent += `| ${questionNum} | ${content} | ${para} |\n`;
          }
        });
        questionIntent += `\n`;
      }
    }

    // Fallback: Generate template from questions if no pattern found in comparison
    if (!hasQuestionPattern) {
      // Count questions from the questions text (look for **(1)**, **(2)**, etc. or **(25)**, **(26)**, etc.)
      const questionMatches = questions.match(/\*\*\((\d+)\)\*\*/g);
      if (questionMatches && questionMatches.length > 0) {
        questionIntent += `### 設問パターン概要\n`;
        questionIntent += `| 設問 | 注目すべきポイント | 対応パラグラフ |\n`;
        questionIntent += `| :--- | :--- | :--- |\n`;

        questionMatches.forEach((match, index) => {
          const paraNum = index + 1;
          questionIntent += `| **設問${index + 1}** | 【要確認：本文を分析して記入】 | (Para ${paraNum}) |\n`;
        });
        questionIntent += `\n`;
        questionIntent += `> ⚠️ 上記は自動生成されたテンプレートです。本文を分析して「注目すべきポイント」を具体的に記入してください。\n\n`;
      }
    }

    // Add paragraph structure info from intent if available
    if (intent) {
      const paraStructureMatch = intent.match(/\*\*パラグラフ構成:\*\*[\s\S]*?(?=\*\*[0-9]|\n\n\*\*[0-9]|$)/);
      if (paraStructureMatch) {
        questionIntent += `### パラグラフ構成と設問の対応\n`;
        questionIntent += paraStructureMatch[0].replace('**パラグラフ構成:**', '').trim();
        questionIntent += `\n\n`;
      }
    }

    questionIntent += `---\n\n`;

    const output = questionIntent + questions;
    copyToClipboard(output, 'オリジナル設問（作問意図付き）をコピーしました！');
  };

  const handleExportSyntaxTemplate = () => {
    const content = currentData.original?.content;
    const title = currentData.original?.title;
    if (!content) {
      alert('オリジナル本文がありません');
      return;
    }
    const template = generateSyntaxTemplate(content, title || 'Original Passage');
    copyToClipboard(template, '構文解説テンプレートをコピーしました！');
  };

  const handleExportAll = () => {
    const content = currentData.original?.content;
    const questions = currentData.original?.questions;
    const title = currentData.original?.title;

    if (!content) {
      alert('データがありません');
      return;
    }

    const markedContent = markMainVerbs(content);

    // Use existing syntax analysis if available, otherwise generate template
    const existingSyntax = currentData.analysis?.syntax;
    const syntaxSectionTitle = existingSyntax ? '4. 構文解説 (Syntax Analysis)' : '4. 構文解説テンプレート';
    const syntaxContent = existingSyntax || generateSyntaxTemplate(content, title || 'Original Passage');

    const summary = currentData.analysis?.summary || '';

    const translations = currentData.original?.translations || [];
    const translationSection = translations.length > 0
      ? `\n## 5. センテンス別和訳 (Sentence Translations)\n\n` +
      translations.map((t, i) => `${i + 1}. ${t.en}\n   和訳: ${t.ja}`).join('\n\n')
      : '\n## 5. センテンス別和訳 (Sentence Translations)\n\n（翻訳データなし）';

    const yearData = AVAILABLE_YEARS.find(y => y.id === selectedYearSession);
    const pastTitle = currentData.past?.title || '';

    // Determine venue type (Main or Semi-Venue) based on ID convention or Label
    const isSemiVenue = selectedYearSession.includes('jun') || yearData?.label?.includes('準会場');
    const venueType = isSemiVenue ? '準会場' : '本会場';

    // Construct the reference line requested by user:
    // 「類題：YYYY年第＃回 (本会場or準会場，本文のタイトル」
    const referenceHeader = yearData
      ? `類題：${yearData.year}年第${yearData.session}回 (${venueType}，${pastTitle})`
      : '';

    const footer = yearData
      ? `\n\n[ 類題 ： ${yearData.year}年第${yearData.session}回，”${pastTitle}” ]`
      : '';

    const output = [
      referenceHeader, // Added at the very top as requested
      `# ${title || 'Original Passage'} - Complete Data`,
      `\n## 1. オリジナル本文（主動詞マーク済み）\n\n${markedContent}${footer}`,
      `\n## 2. オリジナル設問\n\n${questions || '（設問データなし）'}`,
      `\n## 3. 本文要約\n\n${summary || '（要約データなし）'}`,
      `\n## ${syntaxSectionTitle}\n\n${syntaxContent}`,
      translationSection
    ].filter(Boolean).join('\n\n---\n\n');

    copyToClipboard(output, '全データを一括コピーしました！');
  };

  const handleExportAllPast = () => {
    const content = currentData.past?.content;
    const questions = currentData.past?.questions;
    const title = currentData.past?.title;

    if (!content) {
      alert('データがありません');
      return;
    }

    const syntax = currentData.analysis?.syntax || '';

    const translations = currentData.past?.translations || [];
    const translationSection = translations.length > 0
      ? `\n## 4. センテンス別和訳 (Sentence Translations)\n\n` +
      translations.map((t, i) => `${i + 1}. ${t.en}\n   和訳: ${t.ja}`).join('\n\n')
      : '\n## 4. センテンス別和訳 (Sentence Translations)\n\n（翻訳データなし）';

    // Construct Header
    const yearData = AVAILABLE_YEARS.find(y => y.id === selectedYearSession);
    const headerTitle = yearData ? `${yearData.year}年度 第${yearData.session}回 - ${title}` : title;

    const output = [
      `# ${headerTitle} - Complete Data (Past)`,
      `\n## 1. 過去問本文\n\n${content}`,
      `\n## 2. 過去問設問\n\n${questions || '（設問データなし）'}`,
      `\n## 3. 構文解説 (Syntax Analysis)\n\n${syntax}`,
      translationSection
    ].filter(Boolean).join('\n\n---\n\n');

    copyToClipboard(output, '過去問データを一括コピーしました！（要約・比較なし）');
  };

  const handleExportTranslations = () => {
    const translations = currentData.original?.translations || [];
    const title = currentData.original?.title || 'Original Passage';

    if (translations.length === 0) {
      alert('翻訳データがありません');
      return;
    }

    const output = `# ${title} - センテンス別和訳\n\n` +
      translations.map((t, i) => `${i + 1}. ${t.en}\n   和訳: ${t.ja}`).join('\n\n');

    copyToClipboard(output, 'センテンス別和訳をコピーしました！');
  };

  // --- Render Components ---

  // Print Handler
  const handlePrint = (type) => {
    const data = type === 'past' ? currentData.past : currentData.original;
    if (!data || !data.content) {
      alert('データがありません');
      return;
    }

    const yearData = AVAILABLE_YEARS.find(y => y.id === selectedYearSession);
    const yearStr = yearData ? `${yearData.year}年度 第${yearData.session}回` : '';
    const pastTitle = currentData.past?.title || '';

    // Determine Grade Label based on ID prefix
    // Default to Pre-1st Grade for this workspace
    const gradeLabel = '英検準1級';

    // Header & Footer logic
    let headerText = '問題2';
    let contentFooterHtml = '';
    let pageFooterHtml = '';

    // Default styles
    let passageFontSize = '12px';
    let passageLineHeight = '1.6';

    let title = data.title || '';
    let contentBody = data.content.replace(/^## .+\n/, '').trim();

    // Separate sizing logic for Passage (Left) and Questions (Right)
    const len = contentBody.length;
    let questionFontSize = '10px';
    let questionLineHeight = '1.2';

    if (len < 1000) {
      passageFontSize = '15px';
      passageLineHeight = '1.8';
      questionFontSize = '12px';
      questionLineHeight = '1.3';
    } else if (len < 1500) {
      passageFontSize = '14px';
      passageLineHeight = '1.7';
      questionFontSize = '12px';
      questionLineHeight = '1.25';
    } else if (len < 2000) {
      passageFontSize = '13px';
      passageLineHeight = '1.6';
      questionFontSize = '12px';
      questionLineHeight = '1.2';
    } else if (len < 2500) {
      passageFontSize = '12px';
      passageLineHeight = '1.5';
      questionFontSize = '12px';
      questionLineHeight = '1.2';
    } else {
      // Very long content (> 2500 chars)
      passageFontSize = '12px';
      passageLineHeight = '1.25';
      questionFontSize = '12px';
      questionLineHeight = '1.2';
    }

    let isOriginal = type === 'original';
    if (isOriginal) {
      headerText = `${gradeLabel}オリジナル問題`;

      contentFooterHtml = `
        <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid #ccc; text-align: left; font-size: 10px; color: #555; font-family: 'Hiragino Mincho ProN', serif;">
          <span style="font-weight: bold;">類題 ：</span> ${yearStr} <span style="font-style: italic;">${pastTitle}</span>
        </div>
      `;

      pageFooterHtml = `
        <div class="copyright-footer">ECCベストワン藍住・北島中央</div>
      `;
    } else {
      // Past questions default
      headerText = `${yearStr}`;
    }


    // Parse Questions and Extract Answer Key (from text)
    let questionsText = data.questions || '';
    let answerKey = '';

    // Attempt to find Answer Key at the end
    const answerMatch = questionsText.match(/(?:\*\*|)?Answer Key(?:\*\*|):?[:\s]+(.*)$/i);
    if (answerMatch) {
      answerKey = answerMatch[1].trim();
      questionsText = questionsText.substring(0, answerMatch.index).trim();
      questionsText = questionsText.replace(/-{3,}\s*$/, '').trim();
    }

    const parseQuestions = (qText) => {
      // Remove header if present
      const cleanText = qText.replace(/^### Questions\s*/i, '');

      // Flexible split for (N) or **(N)
      // Matches: (1), **(1), **(1)**, etc. starting at line beginning (or after newline)
      // Captures the number.
      const parts = cleanText.split(/(?:^|\n)\s*(?:\*\*)?\s*\((\d+)\)/);

      const questions = [];

      // parts[0] is typically empty preamble.
      // parts[1] is number, parts[2] is content.
      for (let i = 1; i < parts.length; i += 2) {
        const num = parts[i];
        const rest = parts[i + 1];
        if (!num || !rest) continue;

        const optionSplit = rest.split(/(?=\n?1\.\s|\s1\s)/);

        let qContent = optionSplit[0].trim();
        // Remove trailing ** if present (from **(1) text**)
        qContent = qContent.replace(/\*\*$/, '').trim();

        const optionsRaw = optionSplit.slice(1).join("").trim();
        const options = optionsRaw.split(/\n/).map(o => o.trim()).filter(o => o);

        questions.push({ num, text: qContent, options });
      }
      return questions;
    };

    let questionsHtmlContent = '';
    try {
      const parsedQuestions = parseQuestions(questionsText);
      if (parsedQuestions.length === 0) throw new Error('Parsing failed');

      questionsHtmlContent = parsedQuestions.map((q, idx) => `
        <div class="q-row" style="${idx !== parsedQuestions.length - 1 ? 'border-bottom: 1px dashed #ccc;' : ''} padding: 0.5em 0; display: flex; align-items: flex-start;">
          <div class="q-num-col" style="width: 24px; padding: 2px 0; background-color: #f3f4f6; color: #374151; flex-shrink: 0; display: flex; align-items: flex-start; justify-content: center; font-weight: bold; font-family: sans-serif; font-size: ${parseFloat(questionFontSize) - 1}px; margin-right: 8px;">
            (${q.num})
          </div>
          <div class="q-content-col" style="flex-grow: 1;">
            <div class="q-text" style="font-weight: bold; page-break-inside: avoid; margin-bottom: 0.4em; font-family: 'Times New Roman', serif; font-size: ${questionFontSize}; line-height: ${questionLineHeight}; text-align: justify;">${q.text}</div>
            <div class="q-options" style="font-size: ${questionFontSize}; font-family: 'Times New Roman', serif; line-height: ${questionLineHeight};">
              ${q.options.map(opt => `<div style="margin-bottom: 0;">${opt}</div>`).join('')}
            </div>
          </div>
        </div>
      `).join('');

    } catch (e) {
      const toHtml = (text) => text ? text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<p></p>')
        .replace(/\n/g, '<br>') : '';
      questionsHtmlContent = toHtml(questionsText);
    }

    let rightColumnContent = `
       <div class="questions-container" style="display: flex; flex-direction: column; flex-grow: 1;">
          <div style="font-family: 'Times New Roman', serif; font-weight: bold; font-size: 14px; border-bottom: 1px solid #000; margin-bottom: 10px; padding-bottom: 2px;">Questions</div>
          ${questionsHtmlContent}
          ${answerKey ? `
            <div style="margin-top: auto; text-align: right; font-weight: bold; font-family: 'Times New Roman', serif; font-size: 11px; border-top: 2px solid #333; padding-top: 4px;">
              正解: ${answerKey.replace(/Answer Key:?/i, '').trim()}
            </div>
          ` : ''}
       </div>
    `;

    const toHtml = (text) => {
      if (!text) return '';
      // Split by double newline to identify paragraphs
      const paragraphs = text.split(/\n\s*\n/);
      return paragraphs.map(p => {
        let innerHtml = p.trim();
        if (!innerHtml) return '';

        if (innerHtml.match(/^### /)) return innerHtml.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        if (innerHtml.match(/^## /)) return innerHtml.replace(/^## (.*$)/gim, '<h2>$1</h2>');

        innerHtml = innerHtml
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br>');

        return `<p>${innerHtml}</p>`;
      }).join('');
    };

    const contentHtml = toHtml(contentBody) + contentFooterHtml;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Preview ${type}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 0; }
              body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
              .no-print { display: none !important; }
              .preview-container { 
                box-shadow: none !important; 
                margin: 0 !important; 
                width: 297mm !important; 
                height: 210mm !important; 
                padding: 10mm 12mm !important; 
                overflow: hidden !important;
              }
              .copyright-footer {
                 position: fixed;
                 bottom: 5mm;
                 right: 12mm;
                 text-align: right;
                 font-size: 9px;
                 color: #555;
                 font-family: "Hiragino Mincho ProN", serif;
              }
            }
            body { 
              font-family: "Times New Roman", "Hiragino Mincho ProN", serif; 
              color: #000;
              margin: 0;
              padding: 20px;
              background-color: #555; 
              display: flex;
              flex-direction: column;
              align-items: center;
              min-height: 100vh;
            }
            .preview-container {
              background-color: white;
              width: 297mm; 
              height: 210mm; 
              padding: 10mm 12mm;
              box-sizing: border-box;
              box-shadow: 0 10px 25px rgba(0,0,0,0.5);
              display: flex; 
              gap: 20mm; 
              overflow: hidden; 
              position: relative;
            }
            .page-column { 
              flex: 1; 
              display: flex;
              flex-direction: column;
              height: 100%;
              overflow: hidden;
            }
            .header-label { 
              font-size: 10px; 
              margin-bottom: 0.5rem; 
              font-family: sans-serif;
              font-weight: bold;
              color: #555;
            }
            .title { 
              text-align: center; 
              font-size: 16px; 
              font-weight: bold; 
              margin-bottom: 1rem; 
              font-family: sans-serif;
            }
            .passage { 
              text-align: justify; 
              font-size: ${passageFontSize}; 
              line-height: ${passageLineHeight};
              flex-grow: 1;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
            }
            p { margin-bottom: 0.8em; text-indent: 1em; margin-top: 0; }
            button {
              padding: 10px 20px; 
              font-size: 16px; 
              cursor: pointer; 
              background: #2563eb; 
              color: white; 
              border: none; 
              border-radius: 4px; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              font-weight: bold;
            }
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
            .q-row { page-break-inside: avoid; }
          </style>
        </head>
        <body>
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
          
          <div class="preview-container">
            <div class="page-column">
              <div class="header-label">${headerText}</div>
              <div class="title">${title}</div>
              <div class="passage">
                ${contentHtml}
              </div>
            </div>
            
            <div class="page-column" style="border-left: 1px dotted #ccc; padding-left: 10mm; margin-left: -1px;">
              ${rightColumnContent}
            </div>
            ${pageFooterHtml}
          </div>
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
              const pageHeight = 210 * 3.78;
              const contentHeight = content.scrollHeight;
              
              if (contentHeight > pageHeight) {
                const scale = Math.floor((pageHeight / contentHeight) * 100);
                document.getElementById('scale-slider').value = scale;
                updateScale(scale);
              }
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  /* Deprecated V6 */
  const handlePrint_DEPRECATED_6 = (type) => {
    const data = type === 'past' ? currentData.past : currentData.original;
    if (!data || !data.content) {
      alert('データがありません');
      return;
    }

    const yearData = AVAILABLE_YEARS.find(y => y.id === selectedYearSession);
    const yearStr = yearData ? `${yearData.year}年度 第${yearData.session}回` : '';
    const pastTitle = currentData.past?.title || '';

    // Header & Footer logic
    let headerText = '問題2';
    let contentFooterHtml = '';
    let pageFooterHtml = '';

    // Default styles
    let passageFontSize = '12px';
    let passageLineHeight = '1.6';

    let title = data.title || '';
    let contentBody = data.content.replace(/^## .+\n/, '').trim();

    // Dynamic sizing for Original
    let isOriginal = type === 'original';
    if (isOriginal) {
      headerText = '英検準2級オリジナル問題';

      // Calculate sizing based on content length
      const len = contentBody.length;
      if (len < 1000) {
        passageFontSize = '16px';
        passageLineHeight = '2.0';
      } else if (len < 1500) {
        passageFontSize = '15px';
        passageLineHeight = '1.8';
      } else if (len < 2000) {
        passageFontSize = '14px';
        passageLineHeight = '1.7';
      } else {
        passageFontSize = '12.5px';
        passageLineHeight = '1.6';
      }

      contentFooterHtml = `
        <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid #ccc; text-align: left; font-size: 11px; color: #555; font-family: 'Hiragino Mincho ProN', serif;">
          <span style="font-weight: bold;">類題 ：</span> ${yearStr} <span style="font-style: italic;">${pastTitle}</span>
        </div>
      `;

      pageFooterHtml = `
        <div class="copyright-footer">ECCベストワン藍住・北島中央</div>
      `;
    } else {
      // Past questions default
      headerText = `${yearStr} ${headerText}`;
    }


    // Parse Questions and Extract Answer Key (from text)
    let questionsText = data.questions || '';
    let answerKey = '';

    // Attempt to find Answer Key at the end
    const answerMatch = questionsText.match(/(?:\*\*|)?Answer Key(?:\*\*|):?[:\s]+(.*)$/i);
    if (answerMatch) {
      answerKey = answerMatch[1].trim();
      questionsText = questionsText.substring(0, answerMatch.index).trim();
      questionsText = questionsText.replace(/-{3,}\s*$/, '').trim();
    }

    const parseQuestions = (qText) => {
      const cleanText = qText.replace(/^### Questions\s*/i, '');
      const parts = cleanText.split(/\*\*\((\d+)\)\*\*/).filter(p => p.trim());
      const questions = [];

      for (let i = 0; i < parts.length; i += 2) {
        const num = parts[i];
        const rest = parts[i + 1];
        if (!num || !rest) continue;

        const optionSplit = rest.split(/(?=\n?1\.\s|\s1\s)/);
        const qContent = optionSplit[0].trim();
        const optionsRaw = optionSplit.slice(1).join("").trim();
        const options = optionsRaw.split(/\n/).map(o => o.trim()).filter(o => o);

        questions.push({ num, text: qContent, options });
      }
      return questions;
    };

    let questionsHtmlContent = '';
    try {
      const parsedQuestions = parseQuestions(questionsText);
      if (parsedQuestions.length === 0) throw new Error('Parsing failed');

      questionsHtmlContent = parsedQuestions.map((q, idx) => `
        <div class="q-row" style="${idx !== parsedQuestions.length - 1 ? 'border-bottom: 1px dashed #ccc;' : ''} padding: 0.6rem 0; display: flex;">
          <div class="q-num-col" style="width: 32px; background: #eef2f6; flex-shrink: 0; display: flex; justify-content: center; padding-top: 0.2rem; font-weight: bold; border-radius: 2px;">
            (${q.num})
          </div>
          <div class="q-content-col" style="padding-left: 1rem; flex-grow: 1;">
            <div class="q-text" style="font-weight: bold; page-break-inside: avoid; margin-bottom: 0.5rem; font-family: 'Times New Roman', serif;">${q.text}</div>
            <div class="q-options" style="font-size: 14px; font-family: 'Times New Roman', serif;">
              ${q.options.map(opt => `<div style="margin-bottom: 0.2rem;">${opt}</div>`).join('')}
            </div>
          </div>
        </div>
      `).join('');

    } catch (e) {
      const toHtml = (text) => text ? text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<p></p>')
        .replace(/\n/g, '<br>') : '';
      questionsHtmlContent = toHtml(questionsText);
    }

    let rightColumnContent = `
       <div class="questions-container" style="display: flex; flex-direction: column; flex-grow: 1;">
          ${questionsHtmlContent}
          ${answerKey ? `
            <div style="margin-top: auto; text-align: right; font-weight: bold; font-family: sans-serif; font-size: 13px; border-top: 2px solid #333; padding-top: 0.5rem;">
              Answer Key: ${answerKey}
            </div>
          ` : ''}
       </div>
    `;

    const toHtml = (text) => {
      if (!text) return '';
      // Split by double newline to identify paragraphs
      const paragraphs = text.split(/\n\s*\n/);
      return paragraphs.map(p => {
        let innerHtml = p.trim();
        if (!innerHtml) return '';

        if (innerHtml.match(/^### /)) return innerHtml.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        if (innerHtml.match(/^## /)) return innerHtml.replace(/^## (.*$)/gim, '<h2>$1</h2>');

        innerHtml = innerHtml
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br>');

        return `<p>${innerHtml}</p>`;
      }).join('');
    };

    const contentHtml = toHtml(contentBody) + contentFooterHtml;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Preview ${type}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 0; }
              body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
              .no-print { display: none !important; }
              .preview-container { 
                box-shadow: none !important; 
                margin: 0 !important; 
                width: 297mm !important; 
                height: 210mm !important; 
                padding: 8mm !important; 
                overflow: hidden !important;
              }
              .copyright-footer {
                 position: fixed;
                 bottom: 5mm;
                 left: 0;
                 width: 100%;
                 text-align: center;
                 font-size: 10px;
                 color: #333;
                 font-family: "Hiragino Mincho ProN", serif;
              }
            }
            body { 
              font-family: "Times New Roman", "Hiragino Mincho ProN", serif; 
              color: #000;
              margin: 0;
              padding: 20px;
              background-color: #555; 
              display: flex;
              flex-direction: column;
              align-items: center;
              min-height: 100vh;
            }
            .preview-container {
              background-color: white;
              width: 297mm; 
              height: 210mm; 
              padding: 8mm;
              box-sizing: border-box;
              box-shadow: 0 10px 25px rgba(0,0,0,0.5);
              display: flex; 
              gap: 2rem; 
              overflow: hidden; 
              position: relative;
            }
            .page-column { 
              flex: 1; 
              display: flex;
              flex-direction: column;
              height: 100%;
              overflow: hidden;
              padding-bottom: 12mm;
            }
            .header-label { 
              font-size: 12px; 
              margin-bottom: 0.5rem; 
              font-family: sans-serif;
              font-weight: bold;
            }
            .title { 
              text-align: center; 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 0.8rem; 
              font-family: sans-serif;
            }
            .passage { 
              text-align: justify; 
              font-size: ${passageFontSize}; 
              line-height: ${passageLineHeight};
              flex-grow: 1;
              display: flex;
              flex-direction: column;
            }
            p { margin-bottom: 0.6em; text-indent: 1em; margin-top: 0; }
            button {
              padding: 10px 20px; 
              font-size: 16px; 
              cursor: pointer; 
              background: #2563eb; 
              color: white; 
              border: none; 
              border-radius: 4px; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              font-weight: bold;
            }
            .copyright-footer {
               position: absolute;
               bottom: 5mm;
               left: 0;
               width: 100%;
               text-align: center;
               font-size: 10px;
               color: #333;
               font-family: "Hiragino Mincho ProN", serif;
            }
            .q-row { padding: 0.6rem 0 !important; border-bottom: 1px dashed #ccc; }
            .q-num-col { width: 28px !important; font-size: 12px; }
            .q-text { margin-bottom: 0.3rem !important; font-size: 12px !important; }
            .q-options { font-size: 12px !important; }
            .q-options div { margin-bottom: 0.1rem !important; }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; position: sticky; top: 20px; z-index: 100;">
            <button onclick="window.print()">🖨️ このページを印刷 (A4横)</button>
          </div>
          
          <div class="preview-container">
            <div class="page-column" style="${isOriginal ? '' : 'border-right: 1px dashed #ccc;'} padding-right: 1.5rem;">
              <div class="header-label">${headerText}</div>
              <div class="title">${title}</div>
              <div class="passage">
                ${contentHtml}
              </div>
            </div>
            
            <div class="page-column" style="padding-left: 1.5rem;">
              <div class="header-label" style="border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 0; font-family: 'Times New Roman', serif;">Questions</div>
              ${rightColumnContent}
            </div>
            ${pageFooterHtml}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  /* Deprecated V5 */
  const handlePrint_DEPRECATED_5 = (type) => {
    const data = type === 'past' ? currentData.past : currentData.original;
    if (!data || !data.content) {
      alert('データがありません');
      return;
    }

    const yearData = AVAILABLE_YEARS.find(y => y.id === selectedYearSession);
    const yearStr = yearData ? `${yearData.year}年度 第${yearData.session}回` : '';
    const pastTitle = currentData.past?.title || '';

    // Header & Footer logic
    let headerText = '問題2';
    let contentFooterHtml = '';
    let pageFooterHtml = '';

    // Default styles
    let passageFontSize = '12px';
    let passageLineHeight = '1.6';

    let title = data.title || '';
    let contentBody = data.content.replace(/^## .+\n/, '').trim();

    // Dynamic sizing for Original
    let isOriginal = type === 'original';
    if (isOriginal) {
      headerText = '英検準2級オリジナル問題';

      // Calculate sizing based on content length
      const len = contentBody.length;
      if (len < 1000) {
        passageFontSize = '16px';
        passageLineHeight = '2.0';
      } else if (len < 1500) {
        passageFontSize = '15px';
        passageLineHeight = '1.8';
      } else if (len < 2000) {
        passageFontSize = '14px';
        passageLineHeight = '1.7';
      } else {
        passageFontSize = '12.5px';
        passageLineHeight = '1.6';
      }

      contentFooterHtml = `
        <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid #ccc; text-align: left; font-size: 11px; color: #555; font-family: 'Hiragino Mincho ProN', serif;">
          <span style="font-weight: bold;">類題 ：</span> ${yearStr} <span style="font-style: italic;">${pastTitle}</span>
        </div>
      `;

      pageFooterHtml = `
        <div class="copyright-footer">ECCベストワン藍住・北島中央</div>
      `;
    } else {
      // Past questions default
      headerText = `${yearStr} ${headerText}`;
    }


    // Parse Questions and Extract Answer Key (from text)
    let questionsText = data.questions || '';
    let answerKey = '';

    // Attempt to find Answer Key at the end
    const answerMatch = questionsText.match(/(?:\*\*|)?Answer Key(?:\*\*|):?[:\s]+(.*)$/i);
    if (answerMatch) {
      answerKey = answerMatch[1].trim();
      questionsText = questionsText.substring(0, answerMatch.index).trim();
      questionsText = questionsText.replace(/-{3,}\s*$/, '').trim();
    }

    const parseQuestions = (qText) => {
      const cleanText = qText.replace(/^### Questions\s*/i, '');
      const parts = cleanText.split(/\*\*\((\d+)\)\*\*/).filter(p => p.trim());
      const questions = [];

      for (let i = 0; i < parts.length; i += 2) {
        const num = parts[i];
        const rest = parts[i + 1];
        if (!num || !rest) continue;

        const optionSplit = rest.split(/(?=\n?1\.\s|\s1\s)/);
        const qContent = optionSplit[0].trim();
        const optionsRaw = optionSplit.slice(1).join("").trim();
        const options = optionsRaw.split(/\n/).map(o => o.trim()).filter(o => o);

        questions.push({ num, text: qContent, options });
      }
      return questions;
    };

    let questionsHtmlContent = '';
    try {
      const parsedQuestions = parseQuestions(questionsText);
      if (parsedQuestions.length === 0) throw new Error('Parsing failed');

      questionsHtmlContent = parsedQuestions.map((q, idx) => `
        <div class="q-row" style="${idx !== parsedQuestions.length - 1 ? 'border-bottom: 1px dashed #ccc;' : ''} padding: 0.6rem 0; display: flex;">
          <div class="q-num-col" style="width: 32px; background: #eef2f6; flex-shrink: 0; display: flex; justify-content: center; padding-top: 0.2rem; font-weight: bold; border-radius: 2px;">
            (${q.num})
          </div>
          <div class="q-content-col" style="padding-left: 1rem; flex-grow: 1;">
            <div class="q-text" style="font-weight: bold; page-break-inside: avoid; margin-bottom: 0.5rem; font-family: 'Times New Roman', serif;">${q.text}</div>
            <div class="q-options" style="font-size: 14px; font-family: 'Times New Roman', serif;">
              ${q.options.map(opt => `<div style="margin-bottom: 0.2rem;">${opt}</div>`).join('')}
            </div>
          </div>
        </div>
      `).join('');

    } catch (e) {
      const toHtml = (text) => text ? text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<p></p>')
        .replace(/\n/g, '<br>') : '';
      questionsHtmlContent = toHtml(questionsText);
    }

    // Add Answer Key HTML if exists
    // We wrap questions and answer key in a flex container that grows
    let rightColumnContent = `
       <div class="questions-container" style="display: flex; flex-direction: column; flex-grow: 1;">
          ${questionsHtmlContent}
          ${answerKey ? `
            <div style="margin-top: auto; text-align: right; font-weight: bold; font-family: sans-serif; font-size: 13px; border-top: 2px solid #333; padding-top: 0.5rem;">
              Answer Key: ${answerKey}
            </div>
          ` : ''}
       </div>
    `;


    const toHtml = (text) => {
      if (!text) return '';
      return text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<p></p>')
        .replace(/\n/g, '<br>');
    };
    const contentHtml = toHtml(contentBody) + contentFooterHtml;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Preview ${type}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 0; }
              body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
              .no-print { display: none !important; }
              .preview-container { 
                box-shadow: none !important; 
                margin: 0 !important; 
                width: 297mm !important; 
                height: 210mm !important; 
                padding: 8mm !important; 
                overflow: hidden !important;
              }
              .copyright-footer {
                 position: fixed;
                 bottom: 5mm;
                 left: 0;
                 width: 100%;
                 text-align: center;
                 font-size: 10px;
                 color: #333;
                 font-family: "Hiragino Mincho ProN", serif;
              }
            }
            body { 
              font-family: "Times New Roman", "Hiragino Mincho ProN", serif; 
              color: #000;
              margin: 0;
              padding: 20px;
              background-color: #555; 
              display: flex;
              flex-direction: column;
              align-items: center;
              min-height: 100vh;
            }
            .preview-container {
              background-color: white;
              width: 297mm; 
              height: 210mm; 
              padding: 8mm;
              box-sizing: border-box;
              box-shadow: 0 10px 25px rgba(0,0,0,0.5);
              display: flex; 
              gap: 2rem; 
              overflow: hidden; 
              position: relative;
            }
            .page-column { 
              flex: 1; 
              display: flex;
              flex-direction: column;
              height: 100%;
              overflow: hidden;
              padding-bottom: 12mm;
            }
            .header-label { 
              font-size: 12px; 
              margin-bottom: 0.5rem; 
              font-family: sans-serif;
              font-weight: bold;
            }
            .title { 
              text-align: center; 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 0.8rem; 
              font-family: sans-serif;
            }
            .passage { 
              text-align: justify; 
              font-size: ${passageFontSize}; 
              line-height: ${passageLineHeight};
              flex-grow: 1;
              display: flex;
              flex-direction: column;
            }
            p { margin-bottom: 0.6em; text-indent: 1em; margin-top: 0; }
            button {
              padding: 10px 20px; 
              font-size: 16px; 
              cursor: pointer; 
              background: #2563eb; 
              color: white; 
              border: none; 
              border-radius: 4px; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              font-weight: bold;
            }
            .copyright-footer {
               position: absolute;
               bottom: 5mm;
               left: 0;
               width: 100%;
               text-align: center;
               font-size: 10px;
               color: #333;
               font-family: "Hiragino Mincho ProN", serif;
            }
            .q-row { padding: 0.6rem 0 !important; border-bottom: 1px dashed #ccc; }
            .q-num-col { width: 28px !important; font-size: 12px; }
            .q-text { margin-bottom: 0.3rem !important; font-size: 12px !important; }
            .q-options { font-size: 12px !important; }
            .q-options div { margin-bottom: 0.1rem !important; }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; position: sticky; top: 20px; z-index: 100;">
            <button onclick="window.print()">🖨️ このページを印刷 (A4横)</button>
          </div>
          
          <div class="preview-container">
            <div class="page-column" style="${isOriginal ? '' : 'border-right: 1px dashed #ccc;'} padding-right: 1.5rem;">
              <div class="header-label">${headerText}</div>
              <div class="title">${title}</div>
              <div class="passage">
                ${contentHtml}
              </div>
            </div>
            
            <div class="page-column" style="padding-left: 1.5rem;">
              <div class="header-label" style="border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 0; font-family: 'Times New Roman', serif;">Questions</div>
              ${rightColumnContent}
            </div>
            ${pageFooterHtml}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  /* Deprecated V4 */
  const handlePrint_DEPRECATED_4 = (type) => {
    const data = type === 'past' ? currentData.past : currentData.original;
    if (!data || !data.content) {
      alert('データがありません');
      return;
    }

    const yearData = AVAILABLE_YEARS.find(y => y.id === selectedYearSession);
    const yearStr = yearData ? `${yearData.year}年度 第${yearData.session}回` : '';
    const pastTitle = currentData.past?.title || '';

    // Header & Footer logic
    let headerText = '問題2';
    let contentFooterHtml = '';
    let pageFooterHtml = '';

    // Default styles
    let passageFontSize = '12px';
    let passageLineHeight = '1.6';

    let title = data.title || '';
    let contentBody = data.content.replace(/^## .+\n/, '').trim();

    // Dynamic sizing for Original
    if (type === 'original') {
      headerText = '英検準2級オリジナル問題';

      // Calculate sizing based on content length
      const len = contentBody.length;
      if (len < 1000) {
        passageFontSize = '16px';
        passageLineHeight = '2.0';
      } else if (len < 1500) {
        passageFontSize = '15px';
        passageLineHeight = '1.8';
      } else if (len < 2000) {
        passageFontSize = '14px';
        passageLineHeight = '1.7';
      } else {
        passageFontSize = '12.5px';
        passageLineHeight = '1.6';
      }

      contentFooterHtml = `
        <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid #ccc; text-align: right; font-size: 11px; color: #555; font-family: 'Hiragino Mincho ProN', serif;">
          <span style="font-weight: bold;">類題 ：</span> ${yearStr} <span style="font-style: italic;">${pastTitle}</span>
        </div>
      `;

      pageFooterHtml = `
        <div class="copyright-footer">ECCベストワン藍住・北島中央</div>
      `;
    } else {
      // Past questions default
      headerText = `${yearStr} ${headerText}`;
    }


    // Parse Questions and Extract Answer Key (from text)
    let questionsText = data.questions || '';
    let answerKey = '';

    // Attempt to find Answer Key at the end
    const answerMatch = questionsText.match(/(?:\*\*|)?Answer Key(?:\*\*|):?[:\s]+(.*)$/i);
    if (answerMatch) {
      answerKey = answerMatch[1].trim();
      questionsText = questionsText.substring(0, answerMatch.index).trim();
      questionsText = questionsText.replace(/-{3,}\s*$/, '').trim();
    }

    const parseQuestions = (qText) => {
      const cleanText = qText.replace(/^### Questions\s*/i, '');
      const parts = cleanText.split(/\*\*\((\d+)\)\*\*/).filter(p => p.trim());
      const questions = [];

      for (let i = 0; i < parts.length; i += 2) {
        const num = parts[i];
        const rest = parts[i + 1];
        if (!num || !rest) continue;

        const optionSplit = rest.split(/(?=\n?1\.\s|\s1\s)/);
        const qContent = optionSplit[0].trim();
        const optionsRaw = optionSplit.slice(1).join("").trim();
        const options = optionsRaw.split(/\n/).map(o => o.trim()).filter(o => o);

        questions.push({ num, text: qContent, options });
      }
      return questions;
    };

    let questionsHtmlContent = '';
    try {
      const parsedQuestions = parseQuestions(questionsText);
      if (parsedQuestions.length === 0) throw new Error('Parsing failed');

      questionsHtmlContent = parsedQuestions.map((q, idx) => `
        <div class="q-row" style="${idx !== parsedQuestions.length - 1 ? 'border-bottom: 1px dashed #ccc;' : ''} padding: 0.6rem 0; display: flex;">
          <div class="q-num-col" style="width: 32px; background: #eef2f6; flex-shrink: 0; display: flex; justify-content: center; padding-top: 0.2rem; font-weight: bold; border-radius: 2px;">
            (${q.num})
          </div>
          <div class="q-content-col" style="padding-left: 1rem; flex-grow: 1;">
            <div class="q-text" style="font-weight: bold; page-break-inside: avoid; margin-bottom: 0.5rem; font-family: 'Times New Roman', serif;">${q.text}</div>
            <div class="q-options" style="font-size: 14px; font-family: 'Times New Roman', serif;">
              ${q.options.map(opt => `<div style="margin-bottom: 0.2rem;">${opt}</div>`).join('')}
            </div>
          </div>
        </div>
      `).join('');

    } catch (e) {
      const toHtml = (text) => text ? text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<p></p>')
        .replace(/\n/g, '<br>') : '';
      questionsHtmlContent = toHtml(questionsText);
    }

    if (answerKey) {
      questionsHtmlContent += `
          <div style="margin-top: 1.5rem; text-align: right; font-weight: bold; font-family: sans-serif; font-size: 13px; border-top: 2px solid #333; padding-top: 0.5rem;">
            Answer Key: ${answerKey}
          </div>
        `;
    }

    const toHtml = (text) => {
      if (!text) return '';
      return text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<p></p>')
        .replace(/\n/g, '<br>');
    };
    const contentHtml = toHtml(contentBody) + contentFooterHtml;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Preview ${type}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 0; }
              body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
              .no-print { display: none !important; }
              .preview-container { 
                box-shadow: none !important; 
                margin: 0 !important; 
                width: 297mm !important; 
                height: 210mm !important; 
                padding: 8mm !important; 
                overflow: hidden !important;
              }
              .copyright-footer {
                 position: fixed;
                 bottom: 5mm;
                 left: 0;
                 width: 100%;
                 text-align: center;
                 font-size: 10px;
                 color: #333;
                 font-family: "Hiragino Mincho ProN", serif;
              }
            }
            body { 
              font-family: "Times New Roman", "Hiragino Mincho ProN", serif; 
              color: #000;
              margin: 0;
              padding: 20px;
              background-color: #555; 
              display: flex;
              flex-direction: column;
              align-items: center;
              min-height: 100vh;
            }
            .preview-container {
              background-color: white;
              width: 297mm; 
              height: 210mm; 
              padding: 8mm;
              box-sizing: border-box;
              box-shadow: 0 10px 25px rgba(0,0,0,0.5);
              display: flex; 
              gap: 2rem; 
              overflow: hidden; 
              position: relative;
            }
            .page-column { 
              flex: 1; 
              display: flex;
              flex-direction: column;
              height: 100%;
              overflow: hidden;
              padding-bottom: 12mm; /* Increased space for footer overlap prevention */
            }
            .header-label { 
              font-size: 12px; 
              margin-bottom: 0.5rem; 
              font-family: sans-serif;
              font-weight: bold;
            }
            .title { 
              text-align: center; 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 0.8rem; 
              font-family: sans-serif;
            }
            .passage { 
              text-align: justify; 
              font-size: ${passageFontSize}; 
              line-height: ${passageLineHeight};
              flex-grow: 1;
              display: flex;
              flex-direction: column;
            }
            p { margin-bottom: 0.6em; text-indent: 1em; margin-top: 0; }
            button {
              padding: 10px 20px; 
              font-size: 16px; 
              cursor: pointer; 
              background: #2563eb; 
              color: white; 
              border: none; 
              border-radius: 4px; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              font-weight: bold;
            }
            .copyright-footer {
               position: absolute;
               bottom: 5mm;
               left: 0;
               width: 100%;
               text-align: center;
               font-size: 10px;
               color: #333;
               font-family: "Hiragino Mincho ProN", serif;
            }
            .q-row { padding: 0.6rem 0 !important; border-bottom: 1px dashed #ccc; }
            .q-num-col { width: 28px !important; font-size: 12px; }
            .q-text { margin-bottom: 0.3rem !important; font-size: 12px !important; }
            .q-options { font-size: 12px !important; }
            .q-options div { margin-bottom: 0.1rem !important; }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; position: sticky; top: 20px; z-index: 100;">
            <button onclick="window.print()">🖨️ このページを印刷 (A4横)</button>
          </div>
          
          <div class="preview-container">
            <div class="page-column" style="border-right: 1px dashed #ccc; padding-right: 1.5rem;">
              <div class="header-label">${headerText}</div>
              <div class="title">${title}</div>
              <div class="passage">
                ${contentHtml}
              </div>
            </div>
            
            <div class="page-column" style="padding-left: 1.5rem;">
              <div class="header-label" style="border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 0; font-family: 'Times New Roman', serif;">Questions</div>
              <div class="questions-container" style="display: flex; flex-direction: column;">
                ${questionsHtmlContent}
              </div>
            </div>
            ${pageFooterHtml}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  /* Deprecated V3 */
  const handlePrint_DEPRECATED_3 = (type) => {
    const data = type === 'past' ? currentData.past : currentData.original;
    if (!data || !data.content) {
      alert('データがありません');
      return;
    }

    const yearData = AVAILABLE_YEARS.find(y => y.id === selectedYearSession);
    const yearStr = yearData ? `${yearData.year}年度 第${yearData.session}回` : '';
    const pastTitle = currentData.past?.title || '';

    // Header & Footer logic
    let headerText = '問題2';
    let contentFooterHtml = '';
    let pageFooterHtml = '';
    let passageFontSize = '12px'; // Default for past

    if (type === 'past') {
      headerText = `${yearStr} ${headerText}`;
    } else if (type === 'original') {
      headerText = '英検準2級オリジナル問題';
      passageFontSize = '16px'; // Larger for original

      contentFooterHtml = `
        <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid #ccc; text-align: right; font-size: 11px; color: #555; font-family: 'Hiragino Mincho ProN', serif;">
          <span style="font-weight: bold;">類題 ：</span> ${yearStr} <span style="font-style: italic;">${pastTitle}</span>
        </div>
      `;

      pageFooterHtml = `
        <div class="copyright-footer">ECCベストワン藍住・北島中央</div>
      `;
    }

    let title = data.title || '';
    let contentBody = data.content.replace(/^## .+\n/, '').trim();

    // Parse Questions and Extract Answer Key (from text)
    let questionsText = data.questions || '';
    let answerKey = '';

    // Attempt to find Answer Key at the end
    const answerMatch = questionsText.match(/(?:\*\*|)?Answer Key(?:\*\*|):?[:\s]+(.*)$/i);
    if (answerMatch) {
      answerKey = answerMatch[1].trim();
      questionsText = questionsText.substring(0, answerMatch.index).trim();
      questionsText = questionsText.replace(/-{3,}\s*$/, '').trim();
    }

    const parseQuestions = (qText) => {
      const cleanText = qText.replace(/^### Questions\s*/i, '');
      const parts = cleanText.split(/\*\*\((\d+)\)\*\*/).filter(p => p.trim());
      const questions = [];

      for (let i = 0; i < parts.length; i += 2) {
        const num = parts[i];
        const rest = parts[i + 1];
        if (!num || !rest) continue;

        const optionSplit = rest.split(/(?=\n?1\.\s|\s1\s)/);
        const qContent = optionSplit[0].trim();
        const optionsRaw = optionSplit.slice(1).join("").trim();
        const options = optionsRaw.split(/\n/).map(o => o.trim()).filter(o => o);

        questions.push({ num, text: qContent, options });
      }
      return questions;
    };

    let questionsHtmlContent = '';
    try {
      const parsedQuestions = parseQuestions(questionsText);
      if (parsedQuestions.length === 0) throw new Error('Parsing failed');

      questionsHtmlContent = parsedQuestions.map((q, idx) => `
        <div class="q-row" style="${idx !== parsedQuestions.length - 1 ? 'border-bottom: 1px dashed #ccc;' : ''} padding: 0.6rem 0; display: flex;">
          <div class="q-num-col" style="width: 32px; background: #eef2f6; flex-shrink: 0; display: flex; justify-content: center; padding-top: 0.2rem; font-weight: bold; border-radius: 2px;">
            (${q.num})
          </div>
          <div class="q-content-col" style="padding-left: 1rem; flex-grow: 1;">
            <div class="q-text" style="font-weight: bold; page-break-inside: avoid; margin-bottom: 0.5rem; font-family: 'Times New Roman', serif;">${q.text}</div>
            <div class="q-options" style="font-size: 14px; font-family: 'Times New Roman', serif;">
              ${q.options.map(opt => `<div style="margin-bottom: 0.2rem;">${opt}</div>`).join('')}
            </div>
          </div>
        </div>
      `).join('');

    } catch (e) {
      const toHtml = (text) => text ? text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<p></p>')
        .replace(/\n/g, '<br>') : '';
      questionsHtmlContent = toHtml(questionsText);
    }

    if (answerKey) {
      questionsHtmlContent += `
          <div style="margin-top: 1.5rem; text-align: right; font-weight: bold; font-family: sans-serif; font-size: 13px; border-top: 2px solid #333; padding-top: 0.5rem;">
            Answer Key: ${answerKey}
          </div>
        `;
    }

    const toHtml = (text) => {
      if (!text) return '';
      return text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<p></p>')
        .replace(/\n/g, '<br>');
    };
    const contentHtml = toHtml(contentBody) + contentFooterHtml;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Preview ${type}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 0; }
              body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
              .no-print { display: none !important; }
              .preview-container { 
                box-shadow: none !important; 
                margin: 0 !important; 
                width: 297mm !important; 
                height: 210mm !important; 
                padding: 8mm !important; 
                overflow: hidden !important;
              }
              .copyright-footer {
                 position: fixed;
                 bottom: 5mm;
                 left: 0;
                 width: 100%;
                 text-align: center;
                 font-size: 10px;
                 color: #333;
                 font-family: "Hiragino Mincho ProN", serif;
              }
            }
            body { 
              font-family: "Times New Roman", "Hiragino Mincho ProN", serif; 
              color: #000;
              margin: 0;
              padding: 20px;
              background-color: #555; 
              display: flex;
              flex-direction: column;
              align-items: center;
              min-height: 100vh;
            }
            .preview-container {
              background-color: white;
              width: 297mm; 
              height: 210mm; 
              padding: 8mm;
              box-sizing: border-box;
              box-shadow: 0 10px 25px rgba(0,0,0,0.5);
              display: flex; 
              gap: 2rem; 
              overflow: hidden; 
              position: relative;
            }
            .page-column { 
              flex: 1; 
              display: flex;
              flex-direction: column;
              height: 100%;
              overflow: hidden;
              padding-bottom: 5mm;
            }
            .header-label { 
              font-size: 12px; 
              margin-bottom: 0.5rem; 
              font-family: sans-serif;
              font-weight: bold;
            }
            .title { 
              text-align: center; 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 0.8rem; 
              font-family: sans-serif;
            }
            .passage { 
              text-align: justify; 
              font-size: ${passageFontSize}; 
              line-height: ${type === 'original' ? '1.7' : '1.5'};
              flex-grow: 1;
              display: flex;
              flex-direction: column;
            }
            p { margin-bottom: 0.6em; text-indent: 1em; margin-top: 0; }
            button {
              padding: 10px 20px; 
              font-size: 16px; 
              cursor: pointer; 
              background: #2563eb; 
              color: white; 
              border: none; 
              border-radius: 4px; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              font-weight: bold;
            }
            .copyright-footer {
               position: absolute;
               bottom: 5mm;
               left: 0;
               width: 100%;
               text-align: center;
               font-size: 10px;
               color: #333;
               font-family: "Hiragino Mincho ProN", serif;
            }
            .q-row { padding: 0.6rem 0 !important; border-bottom: 1px dashed #ccc; }
            .q-num-col { width: 28px !important; font-size: 12px; }
            .q-text { margin-bottom: 0.3rem !important; font-size: 12px !important; }
            .q-options { font-size: 12px !important; }
            .q-options div { margin-bottom: 0.1rem !important; }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; position: sticky; top: 20px; z-index: 100;">
            <button onclick="window.print()">🖨️ このページを印刷 (A4横)</button>
          </div>
          
          <div class="preview-container">
            <div class="page-column" style="border-right: 1px dashed #ccc; padding-right: 1.5rem;">
              <div class="header-label">${headerText}</div>
              <div class="title">${title}</div>
              <div class="passage">
                ${contentHtml}
              </div>
            </div>
            
            <div class="page-column" style="padding-left: 1.5rem;">
              <div class="header-label" style="border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 0; font-family: 'Times New Roman', serif;">Questions</div>
              <div class="questions-container" style="display: flex; flex-direction: column;">
                ${questionsHtmlContent}
              </div>
            </div>
            ${pageFooterHtml}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  /* Deprecated V2 */
  const handlePrint_DEPRECATED_2 = (type) => {
    const data = type === 'past' ? currentData.past : currentData.original;
    if (!data || !data.content) {
      alert('データがありません');
      return;
    }

    const yearData = AVAILABLE_YEARS.find(y => y.id === selectedYearSession);
    const yearStr = yearData ? `${yearData.year}年度 第${yearData.session}回` : '';
    const pastTitle = currentData.past?.title || '';

    // Header logic
    let headerText = '問題2';
    let contentFooterHtml = '';

    if (type === 'past') {
      headerText = `${yearStr} ${headerText}`;
    } else if (type === 'original') {
      contentFooterHtml = `
        <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid #ccc; text-align: right; font-size: 11px; color: #555; font-family: 'Hiragino Mincho ProN', serif;">
          <span style="font-weight: bold;">類題 ：</span> ${yearStr} <span style="font-style: italic;">${pastTitle}</span>
        </div>
      `;
    }

    let title = data.title || '';
    let contentBody = data.content.replace(/^## .+\n/, '').trim();

    // Determine Questions Format
    const parseQuestions = (qText) => {
      // Split by Questions header if present
      const cleanText = qText.replace(/^### Questions\s*/i, '');

      // Split by question blocks "**(N)**"
      const parts = cleanText.split(/\*\*\((\d+)\)\*\*/).filter(p => p.trim());
      const questions = [];

      for (let i = 0; i < parts.length; i += 2) {
        const num = parts[i];
        const rest = parts[i + 1];
        if (!num || !rest) continue;

        // Split question text from options
        const optionSplit = rest.split(/(?=\n?1\.\s|\s1\s)/);
        const qContent = optionSplit[0].trim();
        const optionsRaw = optionSplit.slice(1).join("").trim();

        const options = optionsRaw.split(/\n/).map(o => o.trim()).filter(o => o);

        questions.push({ num, text: qContent, options });
      }
      return questions;
    };

    let questionsHtmlContent = '';
    // Try parsing
    try {
      const parsedQuestions = parseQuestions(data.questions);
      if (parsedQuestions.length === 0) throw new Error('Parsing failed');

      questionsHtmlContent = parsedQuestions.map((q, idx) => `
        <div class="q-row" style="${idx !== parsedQuestions.length - 1 ? 'border-bottom: 1px dashed #ccc;' : ''} padding: 1rem 0; display: flex;">
          <div class="q-num-col" style="width: 32px; background: #eef2f6; flex-shrink: 0; display: flex; justify-content: center; padding-top: 0.2rem; font-weight: bold; border-radius: 2px;">
            (${q.num})
          </div>
          <div class="q-content-col" style="padding-left: 1rem; flex-grow: 1;">
            <div class="q-text" style="font-weight: bold; margin-bottom: 0.5rem; font-family: 'Times New Roman', serif;">${q.text}</div>
            <div class="q-options" style="font-size: 14px; font-family: 'Times New Roman', serif;">
              ${q.options.map(opt => `<div style="margin-bottom: 0.3rem;">${opt}</div>`).join('')}
            </div>
          </div>
        </div>
      `).join('');

    } catch (e) {
      // Fallback
      const toHtml = (text) => text ? text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<p></p>')
        .replace(/\n/g, '<br>') : '';
      questionsHtmlContent = toHtml(data.questions);
    }

    // Content HTML
    const toHtml = (text) => {
      if (!text) return '';
      return text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<p></p>')
        .replace(/\n/g, '<br>');
    };
    const contentHtml = toHtml(contentBody) + contentFooterHtml;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Preview ${type}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 0; }
              body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
              .no-print { display: none !important; }
              .preview-container { 
                box-shadow: none !important; 
                margin: 0 !important; 
                width: 297mm !important; 
                height: 210mm !important; 
                padding: 8mm !important; 
                overflow: hidden !important;
              }
            }
            body { 
              font-family: "Times New Roman", "Hiragino Mincho ProN", serif; 
              color: #000;
              margin: 0;
              padding: 20px;
              background-color: #555; 
              display: flex;
              flex-direction: column;
              align-items: center;
              min-height: 100vh;
            }
            .preview-container {
              background-color: white;
              width: 297mm; 
              height: 210mm; 
              padding: 8mm;
              box-sizing: border-box;
              box-shadow: 0 10px 25px rgba(0,0,0,0.5);
              display: flex; 
              gap: 2rem; 
              overflow: hidden; 
              position: relative;
            }
            .page-column { 
              flex: 1; 
              display: flex;
              flex-direction: column;
              height: 100%;
              overflow: hidden;
            }
            .header-label { 
              font-size: 12px; 
              margin-bottom: 0.5rem; 
              font-family: sans-serif;
              font-weight: bold;
            }
            .title { 
              text-align: center; 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 0.8rem; 
              font-family: sans-serif;
            }
            .passage { 
              text-align: justify; 
              font-size: 12px; 
              line-height: 1.5;
              flex-grow: 1;
              display: flex;
              flex-direction: column;
            }
            p { margin-bottom: 0.6em; text-indent: 1em; margin-top: 0; }
            button {
              padding: 10px 20px; 
              font-size: 16px; 
              cursor: pointer; 
              background: #2563eb; 
              color: white; 
              border: none; 
              border-radius: 4px; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              font-weight: bold;
            }
            /* Question specific tight styling */
            .q-row { padding: 0.6rem 0 !important; border-bottom: 1px dashed #ccc; }
            .q-num-col { width: 28px !important; font-size: 12px; }
            .q-text { margin-bottom: 0.3rem !important; font-size: 12px !important; }
            .q-options { font-size: 12px !important; }
            .q-options div { margin-bottom: 0.1rem !important; }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; position: sticky; top: 20px; z-index: 100;">
            <button onclick="window.print()">🖨️ このページを印刷 (A4横)</button>
          </div>
          
          <div class="preview-container">
            <!-- Left Page: Passage -->
            <div class="page-column" style="border-right: 1px dashed #ccc; padding-right: 1.5rem;">
              <div class="header-label">${headerText}</div>
              <div class="title">${title}</div>
              <div class="passage">
                ${contentHtml}
              </div>
            </div>
            
            <!-- Right Page: Questions -->
            <div class="page-column" style="padding-left: 1.5rem;">
              <div class="header-label" style="border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 0; font-family: 'Times New Roman', serif;">Questions</div>
              <div class="questions-container" style="display: flex; flex-direction: column;">
                ${questionsHtmlContent}
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  /* Deprecated */
  const handlePrint_OLD = (type) => {
    const data = type === 'past' ? currentData.past : currentData.original;
    if (!data || !data.content) {
      alert('データがありません');
      return;
    }

    const yearData = AVAILABLE_YEARS.find(y => y.id === selectedYearSession);
    const yearStr = yearData ? `${yearData.year}年度 第${yearData.session}回` : '';
    const pastTitle = currentData.past?.title || '';

    // Footer text logic
    let footerText = '';
    if (type === 'original') {
      footerText = `類題 ： ${yearStr} ${pastTitle}`;
    } else {
      footerText = `${yearStr} ${pastTitle}`; // Default footer for past
    }

    // Split passage title from content (assuming ## Title format)
    let title = data.title || '';
    let contentBody = data.content.replace(/^## .+\n/, '').trim();

    // Simple Markdown to HTML for print
    const toHtml = (text) => {
      if (!text) return '';
      return text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<p></p>')
        .replace(/\n/g, '<br>');
    };

    const contentHtml = toHtml(contentBody);
    const questionsHtml = toHtml(data.questions);

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print ${type}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 15mm; }
              body { -webkit-print-color-adjust: exact; }
            }
            body { 
              font-family: "Times New Roman", "Hiragino Mincho ProN", serif; 
              line-height: 1.6; 
              color: #000;
              max-width: 100%;
              margin: 0;
              padding: 20px;
            }
            .container { 
              display: flex; 
              gap: 4rem; 
              height: 100%;
            }
            .page { 
              flex: 1; 
              position: relative; 
              display: flex;
              flex-direction: column;
            }
            .header-label { 
              font-size: 14px; 
              margin-bottom: 10px; 
              font-family: sans-serif;
            }
            .title { 
              text-align: center; 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 0.5rem; 
              font-family: sans-serif;
            }
            .passage { 
              text-align: justify; 
              font-size: 15px; 
              flex-grow: 1;
            }
            .questions { 
              font-size: 15px; 
              flex-grow: 1;
            }
            .footer { 
              text-align: right; 
              margin-top: auto; 
              padding-top: 1rem;
              font-size: 12px; 
              color: #555; 
              border-top: 1px dotted #ccc;
            }
            p { margin-bottom: 1em; text-indent: 1em; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Left Page: Passage -->
            <div class="page" style="border-right: 1px dashed #ccc; padding-right: 2rem;">
              <div class="header-label">問題2</div>
              <div class="title">${title}</div>
              <div class="passage">${contentHtml}</div>
              <div class="footer">${footerText}</div>
            </div>
            
            <!-- Right Page: Questions -->
            <div class="page" style="padding-left: 2rem;">
              <div class="questions">${questionsHtml}</div>
            </div>
          </div>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const HeaderComponent = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'white' }}>
          英検準1級 PassageCraft
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => handlePrint('past')}
          style={{
            background: 'white', color: '#2563eb', border: 'none', borderRadius: '4px',
            padding: '4px 12px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          🖨️ 過去問
        </button>
        <button
          onClick={() => handlePrint('original')}
          style={{
            background: 'white', color: '#16a34a', border: 'none', borderRadius: '4px',
            padding: '4px 12px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          🖨️ オリジナル
        </button>

        <label className="header-label">対象回:</label>
        <select
          className="header-select"
          value={selectedYearSession}
          onChange={(e) => setSelectedYearSession(e.target.value)}
        >
          {AVAILABLE_YEARS.map((y, index) => (
            y.type === "separator" ? (
              <option key={`sep-${index}`} disabled style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                {y.label}
              </option>
            ) : (
              <option key={y.id} value={y.id}>
                {y.label || `${y.year}年度 第${y.session}回`}
              </option>
            )
          ))}
        </select>
      </div>
    </>
  );

  const LeftColumnComponent = (
    <>
      <Tabs
        tabs={leftTabs}
        activeTab={activeLeftTab}
        onTabChange={setActiveLeftTab}
      />
      <div
        className="content-area"
        onClick={handleBackgroundClick}
        style={{ minHeight: '500px' }} // Ensure clickable area
      >
        <MarkdownRenderer
          text={getLeftContent()}
          onSentenceClick={handleSentenceClickInteraction}
          highlightedSentence={highlightedSentence}
          translations={
            activeLeftTab === 'past' ? currentData.past?.translations :
              activeLeftTab === 'original' ? currentData.original?.translations :
                []
          }
        />
      </div>
    </>
  );

  const RightColumnComponent = (
    <>
      <Tabs
        tabs={rightTabs}
        activeTab={activeRightTab}
        onTabChange={setActiveRightTab}
      />
      <div
        className="content-area"
        onClick={handleBackgroundClick}
        style={{ minHeight: '500px' }}
      >
        <MarkdownRenderer
          text={getRightContent()}
          onSentenceClick={handleSyntaxClick} // Pass click handler
        />
      </div>
    </>
  );

  // Export Panel Component
  const ExportPanel = (
    <div style={{
      padding: '1rem',
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      justifyContent: 'center'
    }}>
      <ExportButton
        label="📦 全てコピー (オリジナル)"
        onClick={handleExportAll}
        icon="📋"
      />
      <ExportButton
        label="📚 全てコピー (過去問)"
        onClick={handleExportAllPast}
        icon="🏛️"
      />
      <div style={{ width: '1px', backgroundColor: 'var(--border-color)', margin: '0 0.5rem' }}></div>
      <ExportButton
        label="本文（動詞マーク）"
        onClick={handleExportOriginalWithVerbs}
        icon="📝"
      />
      <ExportButton
        label="設問"
        onClick={handleExportOriginalQuestions}
        icon="❓"
      />
      <ExportButton
        label="和訳 (1:1)"
        onClick={handleExportTranslations}
        icon="🌐"
      />
      <ExportButton
        label="構文解説テンプレート"
        onClick={handleExportSyntaxTemplate}
        icon="📊"
      />
    </div>
  );

  return (
    <>
      <MainLayout
        header={HeaderComponent}
        leftColumn={LeftColumnComponent}
        rightColumn={RightColumnComponent}
        footer={ExportPanel}
      />
      {tooltip.visible && createPortal(
        <div
          ref={tooltipRef}
          className="translation-tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          {tooltip.text}
        </div>,
        document.body
      )}
    </>
  );
}

export default App;
