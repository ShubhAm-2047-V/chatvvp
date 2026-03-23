/**
 * Formats note text into structured sections (Model, Data, Code) and detects steps.
 * @param {string} text - The cleaned note text.
 * @returns {Object} - Structured note data.
 */
const formatNotes = (text) => {
  if (!text) return { formattedText: '', sections: { steps: [], data: '', code: '', model: '' } };

  const lines = text.split('\n');
  const sections = {
    steps: [],
    model: '',
    data: '',
    code: ''
  };

  let currentSection = 'code'; // Default to code for assembly
  let formattedLines = [];

  // Keywords to detect sections
  const sectionKeywords = {
    model: /\b(model|small|tiny|huge)\b/i,
    data: /\b(data|db|dw|dd|byte|word|ptr|segment)\b/i,
    code: /\b(code|mov|add|sub|jmp|loop|proc|endp|main|int)\b/i
  };

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    // 1. Detect Steps (e.g. 1), 2), 3.)
    const stepMatch = trimmedLine.match(/^(\d+)[\)\.]\s*(.*)/);
    if (stepMatch) {
      sections.steps.push(stepMatch[2]);
    }

    // 2. Detect Section Changes
    if (sectionKeywords.model.test(trimmedLine) && !sections.model) currentSection = 'model';
    else if (sectionKeywords.data.test(trimmedLine)) currentSection = 'data';
    else if (sectionKeywords.code.test(trimmedLine)) currentSection = 'code';

    // 3. Append to specific section
    sections[currentSection] += line + '\n';

    // 4. Basic Highlighting (Wrap keywords in span if useful, or just normalize)
    let highlightedLine = line
      .replace(/\b(mov|add|sub|loop|int|jmp|cmp|offset|lea|push|pop)\b/gi, '**$1**')
      .replace(/\b(db|dw|dd|segment|ends|ends|data|model|code|proc|endp)\b/gi, '*$1*');
    
    formattedLines.push(highlightedLine);
  });

  return {
    formattedText: formattedLines.join('\n'),
    sections: {
      steps: sections.steps,
      model: sections.model.trim(),
      data: sections.data.trim(),
      code: sections.code.trim()
    }
  };
};

module.exports = { formatNotes };
