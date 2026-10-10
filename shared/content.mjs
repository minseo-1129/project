/** Human-readable Markdown sections with stable field IDs in heading comments. */
export function parseContent(source) {
  const fields = Object.create(null);
  let key = null;
  let lines = [];
  let fenced = false;
  const flush = () => { if (key) fields[key] = lines.join('\n').trim(); };
  for (const line of source.replace(/\r\n?/g, '\n').split('\n')) {
    if (/^```/.test(line)) fenced = !fenced;
    const heading = !fenced && line.match(/^##\s+.+?\s+<!--\s*([A-Za-z0-9_.-]+)\s*-->\s*$/);
    if (heading) {
      flush();
      key = heading[1];
      if (Object.hasOwn(fields, key)) throw new Error(`중복 콘텐츠 항목: ${key}`);
      lines = [];
    } else if (key) lines.push(line);
  }
  flush();
  if (!fields.title) throw new Error('프로젝트 이름(title)을 입력해 주세요.');
  return fields;
}

export function safeHref(value) {
  const href = value.trim();
  if (!href || /[\u0000-\u0020\u007f\\]/.test(href)) return null;
  if (/^(https?:|mailto:)/i.test(href)) return href;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) return null;
  return href;
}

function inline(source, target) {
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let offset = 0;
  for (const match of source.matchAll(re)) {
    target.append(document.createTextNode(source.slice(offset, match.index)));
    const child = document.createElement(match[1] ? 'strong' : match[2] ? 'code' : 'a');
    child.textContent = match[1] || match[2] || match[3];
    if (match[4]) {
      const href = safeHref(match[4]);
      if (href) child.setAttribute('href', href);
    }
    target.append(child);
    offset = match.index + match[0].length;
  }
  target.append(document.createTextNode(source.slice(offset)));
}

/** Limited Markdown, built with DOM nodes: raw HTML is displayed as text. */
export function renderMarkdown(source, target) {
  target.replaceChildren();
  if (!source) return;
  for (const block of source.split(/\n\s*\n/)) {
    const lines = block.split('\n');
    if (lines.every(line => /^[-*]\s/.test(line))) {
      const list = document.createElement('ul');
      for (const line of lines) {
        const item = document.createElement('li');
        inline(line.replace(/^[-*]\s/, ''), item);
        list.append(item);
      }
      target.append(list);
    } else {
      const p = document.createElement('p');
      inline(block, p);
      target.append(p);
    }
  }
}
