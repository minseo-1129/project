/** Human-readable Markdown sections with stable field IDs in heading comments. */
export function parseContent(source, {requireTitle = true} = {}) {
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
  if (requireTitle && !fields.title) throw new Error('프로젝트 이름(title)을 입력해 주세요.');
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
    const image = block.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      const href = safeHref(image[2]);
      if (href) {
        const figure = document.createElement('figure');
        figure.className = 'content-image';
        const link = document.createElement('a');
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        const img = document.createElement('img');
        img.src = href;
        img.alt = image[1];
        img.loading = 'lazy';
        img.decoding = 'async';
        link.append(img);
        figure.append(link);
        if (image[1]) {
          const caption = document.createElement('figcaption');
          caption.textContent = image[1];
          figure.append(caption);
        }
        target.append(figure);
        continue;
      }
    }
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

/** A field counts as empty when it is blank or only a [bracketed prompt]. */
export function isBlank(value) {
  const text = (value ?? '').trim();
  return !text || (text.startsWith('[') && text.endsWith(']'));
}

/** `- item` lines of a field. */
export function listItems(value) {
  if (isBlank(value)) return [];
  return value.split('\n').map(line => line.match(/^\s*[-*]\s+(.*)$/)).filter(Boolean).map(match => match[1].trim());
}

/** Split `a — b`, `a: b` or `a | b | c` into trimmed parts. */
export function splitItem(item, separator = /\s+—\s+|\s*\|\s*|:\s+/) {
  return item.split(separator).map(part => part.trim());
}

/** `### title` sub-sections inside a field, each with the text below it. */
export function subsections(value) {
  if (isBlank(value)) return [];
  const sections = [];
  for (const line of value.split('\n')) {
    const heading = line.match(/^###\s+(.+)$/);
    if (heading) sections.push({title: heading[1].trim(), lines: []});
    else if (sections.length) sections.at(-1).lines.push(line);
  }
  return sections.map(({title, lines}) => ({title, body: lines.join('\n').trim()}));
}
