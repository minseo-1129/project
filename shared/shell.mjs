import {parseContent, renderMarkdown, isBlank, listItems, splitItem, subsections} from './content.mjs';

// One shell for the projects index, prototype pages and case studies.
// Layout follows the Figma file "Portfolio Shell Masters v2".
const app = document.getElementById('app');
const view = document.body.dataset.view || 'prototype';
const params = new URLSearchParams(location.search);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let lang = ['en', 'ko'].includes(params.get('lang')) ? params.get('lang') : null;
try { lang ||= localStorage.getItem('portfolio-lang'); } catch {}
if (lang !== 'en') lang = 'ko';
document.documentElement.lang = lang;

const UI = {
  ko: {library: 'RESEARCH / PROTOTYPE LIBRARY', projects: 'PROJECTS', prototype: 'PROTOTYPE', caseStudy: 'CASE STUDY', selected: 'SELECTED WORK', count: n => `${n} PROJECTS`,
    indexTitle: 'Projects', indexLead: '지난 UI/UX 작업을 실제로 눌러 볼 수 있는 프로토타입으로 복원하고, 각 설계의 배경과 결정을 케이스 스터디로 정리했습니다.',
    openPrototype: '프로토타입 ↗', openCase: '케이스 스터디 ↗', back: '← 전체 프로젝트', toCase: '케이스 스터디 →', toPrototype: '프로토타입 →',
    flows: '플로우', flowScreens: '이 플로우의 화면', allScreens: '전체 화면', allScenes: '전체 장면', states: '상태', theme: '테마', prev: '이전 화면', next: '다음 화면',
    context: 'CONTEXT', decision: 'DECISION', role: 'ROLE', time: 'TIME', tools: 'TOOLS', todo: '[작성 필요]',
    mobile: 'MOBILE PROTOTYPE', gallery: 'GALLERY PROTOTYPE', web: 'WEB EXPERIENCE', error: '페이지를 불러오지 못했어요',
    errorHint: '로컬에서는 HTTP 서버로 열어 주세요. GitHub에서는 콘텐츠 파일의 제목과 항목 ID를 확인해 주세요.', resultSlot: '결과 블록(막대 · 숫자 · 표 · 인용 · 관찰) 중 하나 이상을 case-study.md에 작성해 주세요.',
    hypothesis: 'HYPOTHESIS', result: 'RESULT', data: 'DATA', observed: 'OBSERVED', goals: 'GOALS', frustrations: 'FRUSTRATIONS', pain: 'PAIN', opportunity: 'OPPORTUNITY', before: 'BEFORE', after: 'AFTER', basis: '근거',
    system: '디자인 시스템 보드 열기 ↗', light: 'Light', dark: 'Dark'},
  en: {library: 'RESEARCH / PROTOTYPE LIBRARY', projects: 'PROJECTS', prototype: 'PROTOTYPE', caseStudy: 'CASE STUDY', selected: 'SELECTED WORK', count: n => `${n} PROJECTS`,
    indexTitle: 'Projects', indexLead: 'Past UI/UX work restored as prototypes you can actually click through, with case studies on the reasoning and decisions behind each design.',
    openPrototype: 'Prototype ↗', openCase: 'Case study ↗', back: '← All projects', toCase: 'Case study →', toPrototype: 'Prototype →',
    flows: 'Flows', flowScreens: 'Screens in this flow', allScreens: 'All screens', allScenes: 'All scenes', states: 'States', theme: 'Theme', prev: 'Previous screen', next: 'Next screen',
    context: 'CONTEXT', decision: 'DECISION', role: 'ROLE', time: 'TIME', tools: 'TOOLS', todo: '[To be written]',
    mobile: 'MOBILE PROTOTYPE', gallery: 'GALLERY PROTOTYPE', web: 'WEB EXPERIENCE', error: 'This page could not be loaded',
    errorHint: 'Open the site through an HTTP server locally. On GitHub, check the headings and field IDs in the content files.', resultSlot: 'Add at least one result (bars, numbers, table, quotes or observations) to case-study.md.',
    hypothesis: 'HYPOTHESIS', result: 'RESULT', data: 'DATA', observed: 'OBSERVED', goals: 'GOALS', frustrations: 'FRUSTRATIONS', pain: 'PAIN', opportunity: 'OPPORTUNITY', before: 'BEFORE', after: 'AFTER', basis: 'Evidence',
    system: 'Open the design system board ↗', light: 'Light', dark: 'Dark'},
}[lang];

const resizeObserver = new ResizeObserver(entries => { for (const {target} of entries) fitFrame(target); });
// Mount read-only thumbnails as they approach the viewport.
const thumbnailObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const frame = entry.target.querySelector('iframe');
    if (frame?.dataset.source) { frame.src = frame.dataset.source; delete frame.dataset.source; }
    thumbnailObserver.unobserve(entry.target);
  }
}, {rootMargin: '200px'});
const frames = new Set();
let config, content, selected, selectedFlow, theme = 'light';
let controls = [];
let detail = {};
let flowList;

// ---------- helpers ----------
function el(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
}
function text(key, fallback = '') { return content[key] ?? fallback; }
function filled(key) { return !isBlank(content[key]); }
function copy(key, className = 'copy') {
  const node = el('div', className);
  renderMarkdown(content[key] || UI.todo, node);
  if (isBlank(content[key])) node.classList.add('is-todo');
  return node;
}
function md(source, className = 'copy') { const node = el('div', className); renderMarkdown(source, node); return node; }
function link(label, href, className = '') { const node = el('a', className, label); node.href = href; return node; }
function button(label, className, onClick) { const node = el('button', className, label); node.type = 'button'; node.addEventListener('click', onClick); return node; }
function withLang(href) { if (lang !== 'en') return href; const url = new URL(href, location.href); url.searchParams.set('lang', 'en'); return url.pathname + url.search; }
function pad(n) { return String(n).padStart(2, '0'); }
function screenTitle(screen) { return text(`screen.${screen}.title`, screen); }
function screenNote(screen) { return content[`flow.${selectedFlow}.${screen}.body`] ?? text(`screen.${screen}.caption`, text(`screen.${screen}.body`)); }
function allScreens() { return [...new Set(config.flows.flatMap(flow => flow.screens))]; }
function currentFlow() { return config.flows.find(flow => flow.id === selectedFlow); }
function fieldMap(items) { return Object.fromEntries(items.map(item => { const [key, ...rest] = splitItem(item, /:\s+/); return [key, rest.join(': ')]; })); }
function label(value) { return el('p', 'section-label', value); }
function langToggle() {
  const node = el('div', 'lang-toggle');
  node.setAttribute('role', 'group');
  node.setAttribute('aria-label', 'Language');
  for (const code of ['ko', 'en']) {
    const item = button(code.toUpperCase(), '', () => {
      try { localStorage.setItem('portfolio-lang', code); } catch {}
      const url = new URL(location.href);
      url.searchParams.set('lang', code);
      location.href = url.href;
    });
    item.setAttribute('aria-pressed', String(code === lang));
    node.append(item);
  }
  return node;
}
function topBar(trail) {
  const node = el('header', 'top-bar');
  const crumbs = el('nav', 'crumbs');
  crumbs.setAttribute('aria-label', 'Breadcrumb');
  trail.forEach(([name, href], index) => {
    if (index) crumbs.append(el('span', '', ' / '));
    crumbs.append(href ? link(name, withLang(href)) : el('span', '', name));
  });
  node.append(crumbs, langToggle());
  return node;
}
function pageHead(eyebrow, title, summaryKey) {
  const node = el('section', 'page-head');
  node.append(el('p', 'eyebrow', eyebrow), el('h1', '', title));
  if (summaryKey) node.append(copy(summaryKey, 'summary'));
  return node;
}
function footerNav(forwardLabel, forwardHref) {
  const node = el('footer', 'footer-nav');
  node.append(link(UI.back, withLang('../'), 'btn btn-outline btn-lg'), link(forwardLabel, withLang(forwardHref), 'btn btn-dark btn-lg'));
  return node;
}

// ---------- live previews ----------
function fitFrame(previewNode) {
  const frame = previewNode.querySelector('iframe');
  if (!frame || previewNode.dataset.native === 'false') return;
  const width = Number(previewNode.dataset.width);
  const height = Number(previewNode.dataset.height);
  const scale = Math.min(previewNode.clientWidth / width, previewNode.clientHeight / height);
  frame.style.width = `${width}px`;
  frame.style.height = `${height}px`;
  frame.style.transform = `scale(${scale})`;
}
function preview(screen, readonly = false, native = config.component !== null || config.nativeViewport === true) {
  const node = el('div', 'preview');
  Object.assign(node.dataset, {width: config.width, height: config.height, native: String(native), readonly: String(readonly)});
  node.style.setProperty('--ratio', `${config.width} / ${config.height}`);
  const frame = el('iframe');
  if (config.component) {
    const url = new URL('viewer.html', location.href);
    url.searchParams.set('screen', screen);
    if (readonly) url.searchParams.set('readonly', '1');
    frame.src = url.href;
  } else {
    frame.src = new URL(config.prototype, location.href).href;
    frame.dataset.screen = screen;
    if (config.webStates?.length) frame.addEventListener('load', () => applyWebState(frame, readonly));
  }
  frame.title = `${text('title')} · ${screenTitle(screen)}`;
  frame.loading = readonly ? 'lazy' : 'eager';
  if (readonly) {
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    if (config.component) { frame.dataset.source = frame.src; frame.removeAttribute('src'); thumbnailObserver.observe(node); }
  } else frames.add(frame);
  node.append(frame);
  resizeObserver.observe(node);
  return node;
}
function applyWebState(frame, readonly) {
  const apply = () => {
    const state = config.webStates.find(item => item.id === frame.dataset.screen);
    if (!state) return true;
    const win = frame.contentWindow;
    if (state.props && !win.__dcSetProps) return false;
    if (state.props) win.__dcSetProps(win.__dcRootName(), state.props);
    const target = state.selector ? frame.contentDocument.querySelector(state.selector)
      : state.buttonText ? [...frame.contentDocument.querySelectorAll('button')].find(item => item.textContent.trim() === state.buttonText) : null;
    if ((state.selector || state.buttonText) && !target) return false;
    target?.click();
    return true;
  };
  if (!readonly) frame.contentDocument.addEventListener('click', event => {
    const state = config.webStates.find(item => item.selector && event.target.closest?.(item.selector));
    if (state) updateSelection(state.id, false);
  });
  // Read-only 3D cards render once instead of running a second WebGL loop.
  if (readonly) {
    const stage = frame.contentDocument.querySelector('three-d-stage');
    stage?.ready?.then(() => { stage.removeAttribute('autorotate'); stage._renderer?.setAnimationLoop(null); stage._loop?.(); frame.contentWindow.setTimeout(() => stage._loop?.(), 1100); }).catch(() => {});
  }
  if (apply()) return;
  const observer = new MutationObserver(() => { if (apply()) observer.disconnect(); });
  observer.observe(frame.contentDocument.body, {childList: true, subtree: true});
}
function device(screen) { const node = el('div', 'device'); node.append(preview(screen)); return node; }
function browser(screen, readonly = false) {
  const node = el('div', 'browser');
  const bar = el('div', 'browser-bar');
  bar.append(el('span', 'dots', '● ● ●'), el('span', '', `${text('title')} / interactive prototype`));
  node.append(bar, preview(screen, readonly, readonly ? true : undefined));
  return node;
}

// ---------- selection ----------
function updateSelection(screen, send = true) {
  if (!allScreens().includes(screen)) return;
  selected = screen;
  for (const control of controls) control.setAttribute('aria-pressed', String(control.dataset.screen === screen));
  const list = navigationList();
  const index = list.indexOf(screen);
  if (detail.counter) detail.counter.textContent = `${pad(index + 1)} / ${pad(list.length)}`;
  if (detail.kicker) detail.kicker.textContent = isFlowLayout() ? text(`flow.${selectedFlow}.title`, selectedFlow) : `${pad(allScreens().indexOf(screen) + 1)} ${screen.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase()}`;
  if (detail.title) detail.title.textContent = screenTitle(screen);
  if (detail.note) renderMarkdown(screenNote(screen), detail.note);
  if (send) for (const frame of frames) {
    if (config.component) frame.contentWindow?.postMessage({type: 'portfolio:select', screen, theme}, location.origin);
    else { frame.dataset.screen = screen; const url = new URL(config.prototype, location.href); url.searchParams.set('portfolioState', screen); frame.src = url.href; }
  }
}
function isFlowLayout() { return config.type === 'mobile' && (config.layout || 'flow') === 'flow'; }
// Flow layouts step inside the current flow; every other layout steps through all screens.
function navigationList() { return isFlowLayout() && currentFlow().screens.includes(selected) ? currentFlow().screens : allScreens(); }
function step(delta) {
  const list = navigationList();
  updateSelection(list[(Math.max(0, list.indexOf(selected)) + delta + list.length) % list.length]);
}
function transport() {
  const node = el('div', 'transport');
  const prev = button('‹', '', () => step(-1));
  const next = button('›', '', () => step(1));
  prev.setAttribute('aria-label', UI.prev);
  next.setAttribute('aria-label', UI.next);
  node.append(prev, next);
  return node;
}
function screenControl(screen, className, children) {
  const node = el('button', className);
  node.type = 'button';
  node.dataset.screen = screen;
  node.setAttribute('aria-pressed', String(screen === selected));
  node.setAttribute('aria-label', screenTitle(screen));
  node.title = screenTitle(screen);
  node.append(...children);
  node.addEventListener('click', () => updateSelection(screen));
  controls.push(node);
  return node;
}
function thumb(screen, number, className = 'thumb') {
  const media = el('span', 'thumb-media');
  media.append(preview(screen, true));
  return screenControl(screen, className, [media, el('span', 'thumb-meta', pad(number)), el('span', 'thumb-title', screenTitle(screen))]);
}
function detailPanel() {
  const node = el('div', 'detail');
  const head = el('div', 'detail-head');
  detail.kicker = el('p', 'kicker');
  detail.counter = el('p', 'counter');
  const meta = el('div', 'detail-meta');
  meta.append(detail.counter, transport());
  head.append(detail.kicker, meta);
  const titleBlock = el('div', 'detail-title');
  detail.title = el('h2');
  detail.note = el('div', 'copy');
  titleBlock.append(detail.title, detail.note);
  const pair = el('div', 'context-pair');
  for (const [name, key] of [[UI.context, 'context.body'], [UI.decision, 'decision.body']]) {
    const item = el('div');
    item.append(el('p', 'mono', name), copy(key));
    pair.append(item);
  }
  node.append(head, titleBlock, pair);
  if (config.themes) {
    const themes = el('div', 'theme-toggle');
    for (const name of ['light', 'dark']) {
      const item = button(UI[name], '', () => {
        theme = name;
        for (const child of themes.children) child.setAttribute('aria-pressed', String(child === item));
        for (const frame of frames) frame.contentWindow?.postMessage({type: 'portfolio:theme', theme}, location.origin);
      });
      item.setAttribute('aria-pressed', String(theme === name));
      themes.append(item);
    }
    const wrap = el('div', 'detail-theme');
    wrap.append(label(UI.theme), themes);
    node.append(wrap);
  }
  return node;
}
function flowThumbs(flow) {
  const node = el('div', 'thumbs');
  flow.screens.forEach((screen, index) => node.append(thumb(screen, index + 1)));
  return node;
}
function screenPills() {
  const node = el('div', 'pills');
  allScreens().forEach((screen, index) => node.append(screenControl(screen, 'pill', [el('span', '', `${pad(index + 1)} ${screenTitle(screen)}`)])));
  return node;
}
function sceneThumbs() {
  const node = el('div', 'scenes');
  allScreens().forEach((screen, index) => node.append(thumb(screen, index + 1, 'thumb scene')));
  return node;
}
function tabs(items, isActive, onSelect, count) {
  const node = el('div', 'tabs');
  for (const item of items) {
    const tab = el('button', 'tab');
    tab.type = 'button';
    tab.append(el('span', '', item.label), el('span', 'tab-count', count(item)));
    tab.setAttribute('aria-pressed', String(isActive(item)));
    tab.addEventListener('click', () => { onSelect(item); for (const child of node.children) child.setAttribute('aria-pressed', String(child === tab)); });
    node.append(tab);
  }
  return node;
}

// ---------- prototype page ----------
function prototypePage() {
  const nodes = [topBar([[UI.projects, '../'], [text('title').toUpperCase()], [UI.prototype]]), pageHead(`${text('title').toUpperCase()} · ${UI[config.type]}`, text('title'), 'summary')];
  const layout = config.type === 'mobile' ? config.layout || 'flow' : config.type;
  if (layout === 'flow' && config.flows.length > 1) {
    const section = el('section', 'flows');
    section.append(label(UI.flows), tabs(config.flows.map(flow => ({...flow, label: text(`flow.${flow.id}.title`, flow.id)})), flow => flow.id === selectedFlow, flow => {
      selectedFlow = flow.id;
      const replacement = flowThumbs(flow);
      flowList.replaceWith(replacement);
      flowList = replacement;
      controls = controls.filter(control => control.isConnected);
      updateSelection(flow.screens[0]);
    }, flow => pad(flow.screens.length)));
    nodes.push(section);
  }
  if (layout === 'web') {
    const section = el('section', 'flows');
    const stateTabs = tabs(allScreens().map(id => ({id, label: screenTitle(id)})), item => item.id === selected, item => updateSelection(item.id), item => pad(allScreens().indexOf(item.id) + 1));
    [...stateTabs.children].forEach((tab, index) => { tab.dataset.screen = allScreens()[index]; controls.push(tab); });
    section.append(label(UI.states), stateTabs);
    nodes.push(section);
  }
  if (layout === 'flow' || layout === 'screen') {
    const stage = el('section', 'stage-mobile');
    const side = detailPanel();
    if (layout === 'flow') { flowList = flowThumbs(currentFlow()); side.append(label(UI.flowScreens), flowList); }
    else side.append(label(UI.allScreens), screenPills());
    stage.append(device(selected), side);
    nodes.push(stage);
  } else if (layout === 'gallery') {
    const stage = el('section', 'stage-wide');
    const scene = el('div', 'scene-player');
    scene.append(preview(selected));
    stage.append(scene, label(UI.allScenes), sceneThumbs(), detailPanel());
    nodes.push(stage);
  } else {
    const stage = el('section', 'stage-wide');
    stage.append(browser(selected), detailPanel());
    if (config.links?.length) {
      const extra = el('div', 'extra-links');
      for (const item of config.links) extra.append(link(text(`link.${item.id}`, item.id), item.href, 'btn btn-outline'));
      stage.append(extra);
    }
    nodes.push(stage);
  }
  nodes.push(footerNav(UI.toCase, 'case-study.html'));
  return nodes;
}

// ---------- case study blocks ----------
function hairList(items, render) { const node = el('div', 'hair-list'); for (const item of items) node.append(render(item)); return node; }
function bars() {
  const groups = subsections(content['case.research.bars']);
  if (!groups.length) return null;
  const node = el('div', 'bar-groups');
  for (const group of groups) {
    const [title, tag] = group.title.split(/\s+·\s+/);
    const rows = listItems(group.body).map(item => { const [name, value] = splitItem(item, /:\s+/); return {name, value: Number(value) || 0, raw: value || ''}; });
    const max = Math.max(...rows.map(row => row.value), 1);
    const box = el('div', 'bar-group');
    const head = el('div', 'bar-head');
    head.append(el('p', 'strong', title), el('p', 'mono', tag || ''));
    box.append(head);
    for (const row of rows) {
      const line = el('div', 'bar-row');
      const track = el('span', 'bar-track');
      const fill = el('span', `bar-fill${row.value === max ? ' is-top' : ''}`);
      fill.style.width = `${row.value / max * 100}%`;
      track.append(fill);
      line.append(el('span', 'bar-name', row.name), track, el('span', 'mono', row.raw));
      box.append(line);
    }
    node.append(box);
  }
  return node;
}
function heroNumbers() {
  const items = listItems(content['case.research.numbers']);
  if (!items.length) return null;
  const node = el('div', 'hero-numbers');
  for (const item of items) { const [value, caption] = splitItem(item, /\s+—\s+/); const cell = el('div', 'hero-number'); cell.append(el('p', 'hero-value', value), el('p', 'small', caption || '')); node.append(cell); }
  return node;
}
function dataTable() {
  const items = listItems(content['case.research.table']);
  if (!items.length) return null;
  const node = el('div', 'data-table');
  const head = el('div', 'data-row data-head');
  head.append(el('p', 'mono', UI.hypothesis), el('p', 'mono', UI.result), el('p', 'mono', UI.data));
  node.append(head);
  for (const item of items) { const [a, b, c] = splitItem(item, /\s*\|\s*/); const row = el('div', 'data-row'); row.append(el('p', 'strong', a), el('p', 'small', b || ''), el('p', 'mono blue', c || '')); node.append(row); }
  return node;
}
function quotes() {
  const items = listItems(content['case.research.quotes']);
  const observed = listItems(content['case.research.observed']);
  if (!items.length && !observed.length) return null;
  const node = el('div', 'quotes');
  for (const item of items) { const [quote, source] = splitItem(item, /\s+—\s+/); const box = el('figure', 'quote'); box.append(el('blockquote', '', quote), el('figcaption', 'mono', source || '')); node.append(box); }
  if (observed.length) node.append(el('p', 'mono blue list-head', UI.observed), hairList(observed, item => { const row = el('div', 'numbered'); row.append(el('span', 'mono', pad(observed.indexOf(item) + 1)), md(item)); return row; }));
  return node;
}
function problemBlock(body) {
  body.append(copy('case.problem.lead', 'lead'));
  const points = listItems(content['case.problem.points']);
  if (points.length) body.append(hairList(points, item => { const [term, desc] = splitItem(item, /\s+—\s+/); const row = el('div', 'definition'); row.append(el('p', 'strong', term), md(desc || '')); return row; }));
}
function researchBlock(body) {
  body.append(copy('case.research.lead', 'body-text'));
  const results = [bars(), heroNumbers(), dataTable(), quotes()].filter(Boolean);
  if (results.length) body.append(...results);
  else body.append(el('p', 'result-slot', UI.resultSlot));
  if (filled('case.research.source')) body.append(el('p', 'mono source', text('case.research.source')));
}
function personaBlock(body) {
  const card = el('div', 'persona');
  const profile = el('div', 'persona-profile');
  profile.append(el('h3', '', text('case.persona.name')));
  for (const item of listItems(content['case.persona.profile'])) { const [key, value] = splitItem(item, /:\s+/); const row = el('div', 'persona-row'); row.append(el('span', 'tiny', key), el('span', '', value || '')); profile.append(row); }
  card.append(el('div', 'portrait'), profile);
  body.append(card);
  if (filled('case.persona.quote')) body.append(copy('case.persona.quote', 'lead quote-lead'));
  const two = el('div', 'two-lists');
  for (const [name, key, cls] of [[UI.goals, 'case.persona.goals', 'blue'], [UI.frustrations, 'case.persona.frustrations', '']]) {
    const items = listItems(content[key]);
    if (!items.length) continue;
    const col = el('div');
    col.append(el('p', `mono list-head ${cls}`, name), hairList(items, item => md(item)));
    two.append(col);
  }
  if (two.children.length) body.append(two);
}
function insightsBlock(body) {
  const items = subsections(content['case.insights']);
  if (!items.length) { body.append(copy('case.insights', 'body-text')); return; }
  body.append(hairList(items, item => {
    const row = el('div', 'numbered insight');
    const col = el('div');
    col.append(el('h3', '', item.title), md(item.body));
    row.append(el('span', 'mono blue', pad(items.indexOf(item) + 1)), col);
    return row;
  }));
}
function journeyBlock(body) {
  if (filled('case.journey.lead')) body.append(copy('case.journey.lead', 'body-text'));
  const stages = el('div', 'journey');
  for (const stage of subsections(content['case.journey.stages'])) {
    const [name, en] = stage.title.split(/\s+·\s+/);
    const fields = fieldMap(listItems(stage.body));
    const [mood, level] = (fields['감정'] || fields.Mood || '').split(/\s+·\s+/);
    const col = el('div', 'stage');
    const head = el('div', 'stage-head');
    head.append(el('h3', '', name), el('span', 'mono', en || ''));
    const moodBox = el('div', 'mood');
    moodBox.style.setProperty('--level', String(Math.min(5, Math.max(1, Number(level) || 3))));
    moodBox.append(el('span', '', mood || ''));
    const pain = el('div', 'pain');
    pain.append(el('p', 'mono', UI.pain), md(fields['불편'] || fields.Pain || ''));
    const opportunity = el('div', 'opportunity');
    opportunity.append(el('p', 'mono', UI.opportunity), md(fields['기회'] || fields.Opportunity || ''));
    col.append(head, moodBox, md(fields['순간'] || fields.Moment || ''), pain, opportunity);
    stages.append(col);
  }
  body.append(stages);
}
function decisionsBlock(body) {
  const items = subsections(content['case.decisions']);
  if (!items.length) { body.append(copy('case.decisions', 'body-text')); return; }
  const list = el('div', 'decisions');
  items.forEach((item, index) => {
    const prose = item.body.split('\n').filter(line => !/^\s*[-*]\s/.test(line)).join('\n').trim();
    const fields = fieldMap(listItems(item.body));
    const get = (...keys) => keys.map(key => fields[key]).find(value => value && !isBlank(value));
    const row = el('article', 'decision');
    const screen = get('화면', 'Screen');
    if (screen && allScreens().includes(screen)) { const media = el('div', `decision-media ${config.type === 'mobile' ? 'is-portrait' : 'is-landscape'}`); media.append(preview(screen, true, true)); row.append(media); }
    const col = el('div', 'decision-copy');
    col.append(el('p', 'mono blue', pad(index + 1)), el('h3', '', item.title), md(prose));
    const before = get('이전', 'Before');
    const after = get('이후', 'After');
    if (before || after) {
      const pair = el('div', 'before-after');
      for (const [name, value, cls] of [[UI.before, before, 'is-before'], [UI.after, after, 'is-after']]) if (value) { const card = el('div', cls); card.append(el('p', 'mono', name), md(value)); pair.append(card); }
      col.append(pair);
    }
    const basis = get('근거', 'Evidence');
    if (basis) col.append(el('p', 'mono source', `${UI.basis} · ${basis}`));
    row.append(col);
    list.append(row);
  });
  body.append(list);
}
function finalScreens(body) {
  if (config.type === 'mobile') {
    const row = el('div', 'final-mobile');
    const side = el('div', 'final-copy');
    side.append(el('h3', '', text('case.flow.title')), copy('case.flow.body'));
    row.append(device(selected), side);
    const keys = el('div', 'key-screens');
    config.keyScreens.forEach((screen, index) => keys.append(thumb(screen, index + 1)));
    body.append(row, keys);
  } else if (config.type === 'gallery') {
    const hero = el('figure', 'moment');
    hero.append(preview(selected, true), el('h3', '', text('case.hero.title')), copy('case.hero.body'));
    const pair = el('div', 'moment-pair');
    for (const [screen, key] of [[config.keyScreens[0], 'before'], [config.keyScreens.at(-1), 'after']]) { const item = el('figure', 'moment'); item.append(preview(screen, true), el('p', 'mono', UI[key]), el('h3', '', text(`case.${key}.title`)), copy(`case.${key}.body`)); pair.append(item); }
    body.append(hero, pair);
  } else {
    body.append(browser(selected));
    (config.webStates || []).forEach((state, index) => {
      const card = el('article', 'state-card');
      const col = el('div');
      col.append(el('p', 'mono blue', `STATE · ${pad(index + 1)}`), el('h3', '', text(`case.state${index + 1}.title`)));
      for (const [name, key] of [['TRIGGER', 'trigger'], ['RESPONSE', 'response'], ['PURPOSE', 'purpose']]) { const line = el('div', 'state-line'); line.append(el('span', 'mono', name), copy(`case.state${index + 1}.${key}`)); col.append(line); }
      card.append(preview(state.id, true, true), col);
      body.append(card);
    });
  }
}
function outcomeBlock(body) {
  finalScreens(body);
  body.append(copy('case.outcome.lead', 'body-text'));
  const changes = listItems(content['case.outcome.changes']);
  if (!changes.length) return;
  const list = el('div', 'changes');
  for (const item of changes) {
    const [kind, ...rest] = splitItem(item, /:\s+/);
    const sign = /추가|added/i.test(kind) ? '+' : /제거|removed/i.test(kind) ? '−' : '~';
    const row = el('div', `change${sign === '+' ? ' is-added' : ''}`);
    row.append(el('span', 'mono', sign), md(rest.join(': ') || kind));
    list.append(row);
  }
  body.append(list);
}
function impactBlock(body) {
  body.append(hairList(listItems(content['case.impact']), item => { const [key, ...value] = splitItem(item, /:\s+/); const row = el('div', 'impact-row'); row.append(el('span', 'mono', key), md(value.join(': '))); return row; }));
}
function systemBlock(body) {
  const chips = listItems(content['case.system.palette']).map(item => item.match(/`?(#[0-9a-f]{3,8})`?\s*(.*)$/i)).filter(Boolean);
  if (chips.length) {
    const palette = el('div', 'palette');
    for (const [, hex, name] of chips) { const chip = el('div', 'swatch'); const color = el('span', 'swatch-color'); color.style.background = hex; chip.append(color, el('span', '', name || hex), el('span', 'mono', hex.toUpperCase())); palette.append(chip); }
    body.append(palette);
  }
  const type = listItems(content['case.system.type']);
  if (type.length) body.append(hairList(type, item => { const [role, font, spec] = splitItem(item, /\s*\|\s*/); const row = el('div', 'type-row'); row.append(el('span', 'mono', role), el('span', 'type-sample', font || ''), el('span', 'mono', spec || '')); return row; }));
  if (filled('case.system.body')) body.append(copy('case.system.body', 'body-text'));
  if (config.designSystem) body.append(link(UI.system, config.designSystem, 'btn btn-outline'));
}
// Required blocks always render (with prompts); optional blocks appear once written.
function caseStudy() {
  const blocks = [
    ['PROBLEM', problemBlock, true],
    ['RESEARCH', researchBlock, true],
    ['PERSONA', personaBlock, filled('case.persona.name')],
    ['INSIGHTS', insightsBlock, true],
    ['JOURNEY', journeyBlock, subsections(content['case.journey.stages']).length > 0, true],
    ['KEY DECISIONS', decisionsBlock, true],
    ['OUTCOME', outcomeBlock, true],
    ['IMPACT', impactBlock, listItems(content['case.impact']).length > 0],
    ['LEARNINGS', body => body.append(copy('case.learnings', 'body-text')), filled('case.learnings')],
    ['DESIGN SYSTEM', systemBlock, filled('case.system.body') || filled('case.system.palette')],
  ].filter(([, , shown]) => shown);
  return blocks.map(([name, build, , wide], index) => {
    const node = el('section', `block${wide ? ' block-wide' : ''}`);
    const body = el('div', 'block-body');
    build(body);
    node.append(el('p', 'block-label', `${pad(index + 1)} · ${name}`), body);
    return node;
  });
}
function metaRow() {
  const node = el('dl', 'meta-row');
  for (const [key, name] of [['role', UI.role], ['period', UI.time], ['tools', UI.tools]]) { const item = el('div'); item.append(el('dt', 'mono', name), el('dd', isBlank(content[key]) ? 'is-todo' : '', text(key, UI.todo))); node.append(item); }
  return node;
}
function casePage() {
  return [
    topBar([[UI.projects, '../'], [text('title').toUpperCase()], [UI.caseStudy]]),
    pageHead(`${text('title').toUpperCase()} · ${UI.caseStudy}`, text('title'), 'summary'),
    metaRow(),
    ...caseStudy(),
    footerNav(UI.toPrototype, './'),
  ];
}

// ---------- index ----------
async function renderProjects() {
  const response = await fetch('./shared/projects.json');
  if (!response.ok) throw new Error('프로젝트 목록을 불러올 수 없습니다.');
  const projects = await response.json();
  // Promise.all keeps the registry order.
  const entries = await Promise.all(projects.map(async project => [project, await loadContent(`./${project}/content`)]));
  const grid = el('ol', 'project-grid');
  for (const [index, [project, c]] of entries.entries()) {
    const card = el('li', 'project-card');
    const meta = el('div', 'project-meta');
    meta.append(el('span', 'mono', pad(index + 1)), el('span', 'mono blue', c.scope || ''));
    const title = el('h2');
    title.append(link(c.title, withLang(`./${project}/`)));
    const links = el('div', 'project-links');
    links.append(link(UI.openPrototype, withLang(`./${project}/`), 'btn btn-dark'), link(UI.openCase, withLang(`./${project}/case-study.html`), 'btn btn-outline'));
    card.append(meta, title, md(c.summary || ''), links);
    grid.append(card);
  }
  const head = pageHead(`${UI.selected} · ${UI.count(projects.length)}`, UI.indexTitle);
  head.append(el('p', 'summary', UI.indexLead));
  const node = el('main', 'shell v2 index-page');
  node.append(topBar([[UI.library]]), head, grid);
  app.replaceChildren(node);
}

// ---------- content loading ----------
async function fetchText(path, required) {
  const response = await fetch(path, {cache: 'no-cache'});
  if (!response.ok) { if (required) throw new Error(`${path}를 불러올 수 없습니다.`); return null; }
  return response.text();
}
// Korean is the source. English replaces a field when it is written, or when
// both are still prompts (so English pages show English prompts).
async function loadContent(base, requireTitle = true) {
  const ko = parseContent(await fetchText(`${base}.md`, true), {requireTitle});
  if (lang !== 'en') return ko;
  const source = await fetchText(`${base}.en.md`, false);
  if (!source) return ko;
  for (const [key, value] of Object.entries(parseContent(source, {requireTitle: false}))) if (value && (!isBlank(value) || isBlank(ko[key]))) ko[key] = value;
  return ko;
}

window.addEventListener('message', event => {
  if (event.origin !== location.origin || ![...frames].some(frame => frame.contentWindow === event.source)) return;
  if (event.data?.type === 'portfolio:screen') updateSelection(event.data.screen, false);
  if (event.data?.type === 'portfolio:ready') event.source.postMessage({type: 'portfolio:select', screen: selected, theme}, location.origin);
});

async function start() {
  if (view === 'projects') return renderProjects();
  const response = await fetch('project.json');
  if (!response.ok) throw new Error('project.json을 불러올 수 없습니다.');
  config = await response.json();
  content = await loadContent('content');
  if (view === 'case') Object.assign(content, await loadContent('case-study', false));
  selected = config.defaultScreen;
  selectedFlow = config.flows.find(flow => flow.screens.includes(selected))?.id || config.flows[0].id;
  document.title = `${text('title')} · ${view === 'case' ? 'Case study' : 'Prototype'}`;
  const node = el('main', `shell v2 ${view === 'case' ? 'case-page' : 'prototype-page'}`);
  node.append(...(view === 'case' ? casePage() : prototypePage()));
  app.replaceChildren(node);
  updateSelection(selected, false);
}
start().catch(error => {
  const node = el('main', 'shell v2');
  const message = el('div', 'error');
  message.append(el('h2', '', UI.error), el('p', '', error.message), el('p', '', UI.errorHint), link('original-prototype.html', 'original-prototype.html', 'btn btn-outline'));
  node.append(message);
  app.replaceChildren(node);
  console.error(error);
});
