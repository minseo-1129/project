import {parseContent, parseHeadings, renderMarkdown, isBlank, listItems, splitItem, subsections} from './content.mjs';

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
    indexTitle: 'Projects', 
    openPrototype: '프로토타입 ↗', openCase: '케이스 스터디 ↗', back: '← 전체 프로젝트', toCase: '케이스 스터디 →', toPrototype: '프로토타입 →',
    flows: '플로우', flowScreens: '이 플로우의 화면', allScreens: '전체 화면', allScenes: '전체 장면', states: '상태', theme: '테마', prev: '이전 화면', next: '다음 화면', prevStage: '이전 단계', nextStage: '다음 단계',
    context: 'CONTEXT', decision: 'DECISION', role: 'ROLE', time: 'PERIOD', tools: 'TOOLS', org: 'ORGANISATION', todo: '[작성 필요]',
    mobile: 'MOBILE PROTOTYPE', gallery: 'GALLERY PROTOTYPE', web: 'WEB EXPERIENCE', error: '페이지를 불러오지 못했어요',
    errorHint: '로컬에서는 HTTP 서버로 열어 주세요. GitHub에서는 콘텐츠 파일의 제목과 항목 ID를 확인해 주세요.', resultSlot: '결과 블록(막대 · 숫자 · 표 · 인용 · 관찰) 중 하나 이상을 case-study.md에 작성해 주세요.',
    hypothesis: 'HYPOTHESIS', result: 'RESULT', data: 'DATA', observed: 'OBSERVED', goals: 'GOALS', frustrations: 'FRUSTRATIONS', pain: 'PAIN', opportunity: 'OPPORTUNITY', before: 'BEFORE', after: 'AFTER', basis: '근거',
    system: '디자인 시스템 보드 열기 ↗', light: 'Light', dark: 'Dark',
    typeHead: ['Size', 'Sample', 'Role'], available: {prototype: '프로토타입', screens: '화면 디자인', video: '영상', case: '케이스 스터디'}, availableLabel: '공개 자료'},
  en: {library: 'RESEARCH / PROTOTYPE LIBRARY', projects: 'PROJECTS', prototype: 'PROTOTYPE', caseStudy: 'CASE STUDY', selected: 'SELECTED WORK', count: n => `${n} PROJECTS`,
    indexTitle: 'Projects', 
    openPrototype: 'Prototype ↗', openCase: 'Case study ↗', back: '← All projects', toCase: 'Case study →', toPrototype: 'Prototype →',
    flows: 'Flows', flowScreens: 'Screens in this flow', allScreens: 'All screens', allScenes: 'All scenes', states: 'States', theme: 'Theme', prev: 'Previous screen', next: 'Next screen', prevStage: 'Previous stage', nextStage: 'Next stage',
    context: 'CONTEXT', decision: 'DECISION', role: 'ROLE', time: 'PERIOD', tools: 'TOOLS', org: 'ORGANISATION', todo: '[To be written]',
    mobile: 'MOBILE PROTOTYPE', gallery: 'GALLERY PROTOTYPE', web: 'WEB EXPERIENCE', error: 'This page could not be loaded',
    errorHint: 'Open the site through an HTTP server locally. On GitHub, check the headings and field IDs in the content files.', resultSlot: 'Add at least one result (bars, numbers, table, quotes or observations) to case-study.md.',
    hypothesis: 'HYPOTHESIS', result: 'RESULT', data: 'DATA', observed: 'OBSERVED', goals: 'GOALS', frustrations: 'FRUSTRATIONS', pain: 'PAIN', opportunity: 'OPPORTUNITY', before: 'BEFORE', after: 'AFTER', basis: 'Evidence',
    system: 'Open the design system board ↗', light: 'Light', dark: 'Dark',
    typeHead: ['Size', 'Sample', 'Role'], available: {prototype: 'Prototype', screens: 'Screen design', video: 'Video', case: 'Case study'}, availableLabel: 'Available'},
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
const sectionLabels = Object.create(null);
let config, content, selected, selectedFlow, theme = 'light';
let projectNumber = '';
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
function topBar(trail, number) {
  const node = el('header', 'top-bar');
  const crumbs = el('nav', 'crumbs');
  crumbs.setAttribute('aria-label', 'Breadcrumb');
  trail.forEach(([name, href], index) => {
    if (index) crumbs.append(el('span', '', ' / '));
    crumbs.append(href ? link(name, withLang(href)) : el('span', '', name));
  });
  const end = el('div', 'top-end');
  if (number) end.append(el('span', 'mono top-number', number));
  end.append(langToggle());
  node.append(crumbs, end);
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
  node.append(link(UI.back, withLang('../'), 'btn btn-outline btn-lg'));
  if (forwardLabel) node.append(link(forwardLabel, withLang(forwardHref), 'btn btn-dark btn-lg'));
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
  // "frameHeight" sets the height of a full-width web prototype (default 600px).
  if (config.frameHeight) node.style.setProperty('--frame-height', `${config.frameHeight}px`);
  // "frameAspect" (e.g. "16/9") keeps the frame at that ratio instead of a fixed height, for videos.
  if (config.frameAspect) { node.style.setProperty('aspect-ratio', config.frameAspect); node.style.setProperty('height', 'auto'); }
  const frame = el('iframe');
  if (config.component) {
    const url = new URL('viewer.html', location.href);
    url.searchParams.set('screen', screen);
    if (readonly) url.searchParams.set('readonly', '1');
    frame.src = url.href;
  } else {
    // Static pages without click states (image galleries, videos) open on the requested screen directly.
    const url = new URL(config.prototype, location.href);
    if (!config.webStates?.length) url.searchParams.set('portfolioState', screen);
    frame.src = url.href;
    frame.dataset.screen = screen;
    if (config.webStates?.length) frame.addEventListener('load', () => applyWebState(frame, readonly));
    if (!readonly && (config.frameHide || config.frameControls)) frame.addEventListener('load', () => mirrorFrameControls(frame));
    // Hide the prototype's own header and controls before its first paint, not after every asset has loaded.
    if (!readonly && config.frameHide?.length) hideFrameParts(frame);
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
// "frameHide" lists selectors hidden inside a static prototype; "frameControls" names its control rows
// (a label span plus buttons), which are mirrored above the prototype and click through to the originals.
let frameBar = null;
function frameHideStyle(doc) {
  if (!config.frameHide?.length || !doc?.head || doc.getElementById('portfolio-frame-hide')) return;
  const style = doc.createElement('style'); style.id = 'portfolio-frame-hide'; style.textContent = `${config.frameHide.join(',')}{display:none!important}`; doc.head.append(style);
}
// The frame stays invisible until its document exists and the hide rules are in, so the parts never flash.
function hideFrameParts(frame) {
  frame.style.visibility = 'hidden';
  const tick = () => {
    const doc = frame.contentDocument;
    if (doc && doc.head && doc.URL !== 'about:blank') { frameHideStyle(doc); frame.style.visibility = ''; return; }
    requestAnimationFrame(tick);
  };
  tick();
  frame.addEventListener('load', () => { frameHideStyle(frame.contentDocument); frame.style.visibility = ''; });
}
function mirrorFrameControls(frame) {
  const doc = frame.contentDocument;
  if (!doc) return;
  frameHideStyle(doc);
  if (!config.frameControls || !frameBar) return;
  const render = () => {
    frameBar.replaceChildren();
    for (const row of doc.querySelectorAll(config.frameControls)) {
      const group = el('div', 'frame-group');
      const name = row.querySelector('span');
      if (name) group.append(el('span', 'mono frame-group-label', name.textContent.trim()));
      const buttons = el('div', 'frame-buttons');
      for (const inner of row.querySelectorAll('button')) {
        const outer = button(inner.textContent.trim(), 'tab', () => inner.click());
        outer.setAttribute('aria-pressed', inner.getAttribute('aria-pressed') || 'false');
        buttons.append(outer);
      }
      group.append(buttons);
      frameBar.append(group);
    }
  };
  render();
  const source = doc.querySelector(config.frameControls)?.parentElement;
  if (source) new MutationObserver(render).observe(source, {subtree: true, attributes: true, attributeFilter: ['aria-pressed'], characterData: true, childList: true});
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
  // "hideStageToolbar" hides the 3D stage's OBJ/GLB export buttons, a build tool rather than part of the product.
  if (config.hideStageToolbar) { const bar = frame.contentDocument.querySelector('three-d-stage')?.shadowRoot?.querySelector('.toolbar'); if (bar) bar.style.display = 'none'; }
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
  if (detail.kicker) detail.kicker.textContent = isFlowLayout() ? [text(`flow.${selectedFlow}.title`, selectedFlow), groupOf(screen) && text(`group.${groupOf(screen).id}.title`, groupOf(screen).id)].filter(Boolean).join(' · ') : `${pad(allScreens().indexOf(screen) + 1)} ${screen.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase()}`;
  if (detail.title) detail.title.textContent = screenTitle(screen);
  if (detail.note) renderMarkdown(screenNote(screen), detail.note);
  if (send) for (const frame of frames) {
    if (config.component) frame.contentWindow?.postMessage({type: 'portfolio:select', screen, theme}, location.origin);
    else { frame.dataset.screen = screen; const url = new URL(config.prototype, location.href); url.searchParams.set('portfolioState', screen); frame.src = url.href; }
  }
}
// When a screen belongs to another flow, switch to that flow so its tabs and chips follow.
function syncFlow(screen) {
  if (!isFlowLayout() || currentFlow()?.screens.includes(screen)) return;
  const flow = config.flows.find(item => item.screens.includes(screen));
  if (flow) document.querySelectorAll('.flows .tab')[config.flows.indexOf(flow)]?.click();
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
function contextPair() {
  const pair = el('div', 'context-pair');
  for (const [name, key] of [[UI.context, 'context.body'], [UI.decision, 'decision.body']]) {
    const item = el('div');
    item.append(el('p', 'mono', name), copy(key));
    pair.append(item);
  }
  return pair;
}
// Mobile prototypes show CONTEXT / DECISION once above the flows, since it describes the whole project.
function detailPanel({context = true} = {}) {
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
  // A single-screen prototype has nothing to step through, so it skips the counter and arrows.
  node.append(...(allScreens().length > 1 ? [head] : []), titleBlock, ...(context ? [contextPair()] : []));
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
// Screens in a flow are listed as numbered chips (number + name), grouped when the flow has groups.
function chip(screen, number) { return screenControl(screen, 'pill', [el('span', 'pill-num', pad(number)), el('span', '', screenTitle(screen))]); }
function flowThumbs(flow) {
  if (!flow.groups) {
    const node = el('div', 'pills');
    flow.screens.forEach((screen, index) => node.append(chip(screen, index + 1)));
    return node;
  }
  const node = el('div', 'thumb-groups');
  let number = 0;
  flow.groups.forEach((group, index) => {
    const section = el('div', 'thumb-group');
    const head = el('p', 'thumb-group-head');
    head.append(el('span', 'mono', pad(index + 1)), el('span', '', text(`group.${group.id}.title`, group.id)), el('span', 'mono', pad(group.screens.length)));
    const grid = el('div', 'pills');
    group.screens.forEach(screen => grid.append(chip(screen, ++number)));
    section.append(head, grid);
    node.append(section);
  });
  return node;
}
function groupOf(screen) { return currentFlow()?.groups?.find(group => group.screens.includes(screen)); }
function screenPills() {
  const node = el('div', 'pills');
  allScreens().forEach((screen, index) => node.append(chip(screen, index + 1)));
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
  const nodes = [topBar([[UI.projects, '../'], [text('title').toUpperCase()], [UI.prototype]]), pageHead(`${text('title').toUpperCase()} · ${(filled('scope') ? text('scope') : UI[config.type]).toUpperCase()}`, text('title'), 'summary')];
  const layout = config.type === 'mobile' ? config.layout || 'flow' : config.type;
  const mobile = layout === 'flow' || layout === 'screen';
  if (mobile) { const section = el('section', 'context-top'); section.append(contextPair()); nodes.push(section); }
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
  if (layout === 'web' && allScreens().length > 1) {
    const section = el('section', 'flows');
    const stateTabs = tabs(allScreens().map(id => ({id, label: screenTitle(id)})), item => item.id === selected, item => updateSelection(item.id), item => pad(allScreens().indexOf(item.id) + 1));
    [...stateTabs.children].forEach((tab, index) => { tab.dataset.screen = allScreens()[index]; controls.push(tab); });
    // "statesLabel" in content.md renames the tab row (e.g. 영상 for video prototypes).
    section.append(label(filled('statesLabel') ? text('statesLabel') : UI.states), stateTabs);
    nodes.push(section);
  }
  if (layout === 'flow' || layout === 'screen') {
    const stage = el('section', 'stage-mobile');
    const side = detailPanel({context: false});
    if (layout === 'flow') { flowList = flowThumbs(currentFlow()); side.append(label(UI.flowScreens), flowList); }
    else side.append(label(UI.allScreens), screenPills());
    stage.append(device(selected), side);
    nodes.push(stage);
  } else if (layout === 'gallery' && config.galleryLayout === 'side') {
    // "galleryLayout": "side" — description first, then the screen on the left and the scene list on the right.
    const stage = el('section', 'stage-wide gallery-side');
    const scene = el('div', 'scene-player');
    scene.append(preview(selected));
    const list = el('div', 'side-list');
    list.append(sceneThumbs());
    const row = el('div', 'side-row');
    row.append(scene, list);
    stage.append(detailPanel(), row);
    nodes.push(stage);
  } else if (layout === 'gallery') {
    const stage = el('section', 'stage-wide');
    const scene = el('div', 'scene-player');
    scene.append(preview(selected));
    stage.append(scene, label(UI.allScenes), sceneThumbs(), detailPanel());
    nodes.push(stage);
  } else {
    const stage = el('section', 'stage-wide');
    // "showDetail": false leaves only the prototype: no screen title, CONTEXT / DECISION or extra links.
    if (config.frameControls) { frameBar = el('div', 'frame-bar'); stage.append(frameBar); }
    stage.append(browser(selected));
    if (config.showDetail !== false) stage.append(detailPanel());
    if (config.showDetail !== false && config.links?.length) {
      const extra = el('div', 'extra-links');
      for (const item of config.links) extra.append(link(text(`link.${item.id}`, item.id), item.href, 'btn btn-outline'));
      stage.append(extra);
    }
    nodes.push(stage);
  }
  nodes.push(footerNav(config.caseStudy === true ? UI.toCase : null, 'case-study.html'));
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
  const portrait = el('div', 'portrait');
  // "case.persona.photo" holds an image path; without it the portrait stays a grey block.
  if (filled('case.persona.photo')) { const img = el('img'); img.src = content['case.persona.photo'].trim(); img.alt = text('case.persona.name'); img.loading = 'lazy'; portrait.append(img); portrait.classList.add('has-photo'); }
  card.append(portrait, profile);
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
  if (filled('case.journey.lead')) body.append(copy('case.journey.lead', 'lead'));
  const stages = el('div', 'journey');
  for (const stage of subsections(content['case.journey.stages'])) {
    const [name, en] = stage.title.split(/\s+·\s+/);
    const fields = fieldMap(listItems(stage.body));
    const [mood, level] = (fields['감정'] || fields.Mood || '').split(/\s+·\s+/);
    const col = el('div', 'stage');
    const head = el('div', 'stage-head');
    head.append(el('h3', '', name), el('span', 'mono', en || ''));
    const moodBox = el('div', Number(level) ? 'mood' : 'mood no-level');
    if (Number(level)) moodBox.style.setProperty('--level', String(Math.min(5, Math.max(1, Number(level)))));
    moodBox.append(el('span', '', mood || ''));
    const pain = el('div', 'pain');
    pain.append(el('p', 'mono', UI.pain), md(fields['불편'] || fields.Pain || ''));
    const opportunity = el('div', 'opportunity');
    opportunity.append(el('p', 'mono', UI.opportunity), md(fields['기회'] || fields.Opportunity || ''));
    col.append(head, moodBox, md(fields['순간'] || fields.Moment || ''), pain, opportunity);
    stages.append(col);
  }
  // Below 800px the stages become one-per-view slides with their own controls.
  const count = stages.children.length;
  const nav = el('div', 'journey-nav');
  const counter = el('span', 'mono', count ? `01 / ${pad(count)}` : '');
  const controls = el('div', 'transport');
  // In the text column two stages show at a time; the arrows move one stage.
  const stageWidth = () => stages.firstElementChild?.getBoundingClientRect().width || stages.clientWidth;
  const step = dir => () => stages.scrollBy({left: dir * stageWidth(), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  const prev = el('button', '', '‹'); prev.type = 'button'; prev.setAttribute('aria-label', UI.prevStage); prev.addEventListener('click', step(-1));
  const next = el('button', '', '›'); next.type = 'button'; next.setAttribute('aria-label', UI.nextStage); next.addEventListener('click', step(1));
  controls.append(prev, next);
  nav.append(counter, controls);
  const sync = () => {
    const index = Math.round(stages.scrollLeft / Math.max(1, stageWidth()));
    const visible = Math.max(1, Math.round(stages.clientWidth / Math.max(1, stageWidth())));
    counter.textContent = `${pad(Math.min(count, index + 1))} / ${pad(count)}`;
    prev.disabled = index <= 0;
    next.disabled = index >= count - visible;
  };
  stages.addEventListener('scroll', () => requestAnimationFrame(sync), {passive: true});
  requestAnimationFrame(sync);
  body.append(nav, stages);
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
// Outcome is the closing takeaway: prose only. Screens live in the prototype.
function outcomeBlock(body) {
  body.append(copy('case.outcome.lead', 'body-text'));
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
  // Type rows read "size | sample | role" and render as a plain table, as on the Figma board.
  if (type.length) body.append(richList([`- ${UI.typeHead.join(' | ')}`, ...type.map(item => `- ${splitItem(item, /\s*\|\s*/).join(' | ')}`)]));
  if (filled('case.system.body')) body.append(copy('case.system.body', 'body-text'));
  if (config.designSystem) body.append(link(UI.system, config.designSystem, 'btn btn-outline'));
}
// ---------- free-layout case study ----------
// A case study made of `case.section.<id>` fields renders those sections in file order.
// Each body is read block by block (blank-line separated); see CONTENT_GUIDE.md for the patterns.
const isStat = item => { const [value, caption] = splitItem(item, /\s+—\s+/); return caption !== undefined && value.length <= 14 && /\d/.test(value) && !value.startsWith('**'); };
const isQuote = item => /^[“"‘]/.test(item) && /\s—\s/.test(item);
const isCard = item => /^\*\*[^*]+\*\*(\s+·\s+[^—]+?)?(\s+—\s+|\s*$)/.test(item);
const isBar = item => /^.+:\s+-?\d+(\.\d+)?%?$/.test(item);
// "**Title** · tag — text // more" → {title, tag, lines}; "Label — text" → {tag, lines}; anything else → {lines}.
function parseCard(source) {
  const card = source.match(/^\*\*([^*]+)\*\*(?:\s+·\s+([^—]+?))?(?:\s+—\s+([\s\S]*))?$/);
  if (card) return {title: card[1], tag: card[2], lines: card[3] ? card[3].split(/\s+\/\/\s+/) : []};
  const labelled = source.match(/^([^—*“"]{1,40}?)\s+—\s+([\s\S]*)$/);
  if (labelled) return {tag: labelled[1], lines: labelled[2].split(/\s+\/\/\s+/)};
  return {lines: source.split(/\s+\/\/\s+/)};
}
function cardNode(source, className = 'card') {
  const {title, tag, lines} = typeof source === 'string' ? parseCard(source) : source;
  const node = el('div', className);
  if (tag) node.append(el('p', 'mono card-tag', tag));
  if (title) node.append(el('p', 'strong', title));
  // A line that is only a bold figure ("**82%**") is shown large; when the card has a title, the
  // figure and the lines after it sit in their own grey box under the title.
  const isFigure = line => /^\*\*[^*]{1,16}\*\*$/.test(line) && /\d/.test(line);
  const start = title ? lines.findIndex(isFigure) : -1;
  let target = node;
  lines.forEach((line, index) => {
    if (index === start) { target = el('div', 'card-stat'); node.append(target); node.classList.add('has-stat'); }
    target.append(isFigure(line) ? el('p', 'card-figure', line.slice(2, -2)) : md(line, 'small'));
  });
  return node;
}
// A list row's "//" segments: images sit beside the text, "Input ·"/"Output ·" become boxes, "Basis ·" a caption.
function segmentNodes(segments) {
  const media = [], text = [], io = el('div', 'io');
  for (const line of segments) {
    const box = line.match(/^(Input|Output|입력|출력)\s+·\s+([\s\S]+)$/);
    if (/^!\[[^\]]*\]\([^)]+\)$/.test(line)) media.push(...md(line).children);
    else if (box) { const cell = el('div', /^(Output|출력)$/.test(box[1]) ? 'io-box is-out' : 'io-box'); cell.append(el('p', 'mono', box[1].toUpperCase()), md(box[2], 'small')); io.append(cell); }
    else if (/^(Basis|근거)\s+·\s+/.test(line)) text.push(md(line, 'mono basis'));
    else text.push(md(line, 'small'));
  }
  if (io.children.length) text.splice(text.findIndex(node => node.classList.contains('basis')) >>> 0, 0, io);
  return {media, text};
}
const blockModes = new Set(['columns', 'rows', 'flow', 'meter', 'canvas', 'lanes', 'stack', 'timeline', 'quad', 'boxed', 'cards', 'defs', 'chips', 'specs', 'dots', 'versus', 'split', 'hero', 'legend', 'trace', 'dash', 'slope', 'dialog']);
// "@defs" — "Term — text" rows with the term on the left ("@defs mono" sets the term as a small blue label).
function defRows(items, args) {
  return hairList(items, item => { const {title, tag, lines} = parseCard(item); const row = el('div', `def-row${'mono' in args ? ' is-mono' : ''}`); const term = el('div', 'def-term'); term.append(el('p', '', title || tag || '')); if (title && tag) term.append(el('p', 'mono def-tag', tag)); row.append(term, (() => { const box = el('div'); for (const line of lines) box.append(md(line, 'small')); return box; })()); return row; });
}
// "@chips" — "Label — a · b · c" becomes a label with pill chips; every second group is tinted.
function chipGroups(items) {
  const node = el('div', 'chip-groups');
  items.forEach((item, index) => { const {title, tag, lines} = parseCard(item); const group = el('div', `chip-group${index % 2 ? ' is-tint' : ''}`); group.append(el('p', 'mono blue', title || tag || '')); const row = el('div', 'chip-row'); for (const word of lines.join(' · ').split(/\s+·\s+/)) row.append(el('span', 'chip', word)); group.append(row); node.append(group); });
  return node;
}
// "@specs" — "Label — **value** // note" columns with a label above a bold value.
function specColumns(items) {
  const node = el('div', 'specs');
  for (const item of items) { const {title, tag, lines} = parseCard(item); const col = el('div', 'spec'); col.append(el('p', 'mono', title || tag || '')); lines.forEach((line, index) => col.append(md(line, index ? 'small' : 'spec-value'))); node.append(col); }
  return node;
}
// "@dots" — "Attribute | left pole | right pole | 15 [25 32] 85*": positions 0–100, [ ] marks the grouped participants, * the outlier.
function dotPlot(items) {
  const node = el('div', 'dots');
  for (const item of items) {
    const [name, left, right, marks = ''] = splitItem(item, /\s*\|\s*/);
    const row = el('div', 'dot-row');
    const track = el('div', 'dot-track');
    const group = marks.match(/\[([^\]]+)\]/);
    if (group) { const values = group[1].trim().split(/\s+/).map(Number); const band = el('span', 'dot-band'); band.style.left = `${Math.min(...values) - 4}%`; band.style.width = `${Math.max(...values) - Math.min(...values) + 8}%`; track.append(band); }
    for (const token of marks.replace(/[\[\]]/g, ' ').trim().split(/\s+/).filter(Boolean)) {
      const dot = el('span', `dot${token.endsWith('*') ? ' is-key' : ''}${group && group[1].split(/\s+/).includes(token) ? ' is-grouped' : ''}`);
      dot.style.left = `${parseFloat(token)}%`;
      track.append(dot);
    }
    row.append(md(name, 'dot-name'), el('span', 'mono dot-pole', left || ''), track, el('span', 'mono dot-pole', right || ''));
    node.append(row);
  }
  return node;
}
// "@versus" — one item per column: "**Name** · tag — sub // “quote” // Goals: a; b // Frustrations: a; b".
function versusColumns(items) {
  const node = el('div', 'versus');
  for (const item of items) {
    const {title, tag, lines} = parseCard(item);
    const col = el('div', 'vs-col');
    if (tag) col.append(el('p', 'mono blue', tag));
    if (title) col.append(el('p', 'vs-name', title));
    for (const line of lines) {
      const list = line.match(/^([^:]{1,24}):\s+([\s\S]+)$/);
      if (/^[“"]/.test(line)) col.append(md(line, 'vs-quote'));
      else if (list) { const box = el('div', 'vs-list'); box.append(el('p', 'mono', list[1])); for (const entry of list[2].split(/\s*;\s*/)) box.append(md(`— ${entry}`, 'small')); col.append(box); }
      else col.append(md(line, 'mono vs-sub'));
    }
    node.append(col);
  }
  return node;
}
// "@split" — numbered rows with the title on the left and the text on the right.
function splitRows(items) {
  return hairList(items, item => { const {title, tag, lines} = parseCard(item); const row = el('div', 'split-row'); const head = el('div'); head.append(el('p', 'mono blue', pad(items.indexOf(item) + 1)), el('p', 'strong', title || tag || '')); const body = el('div'); for (const line of lines) body.append(md(line, /^[“"]/.test(line) ? 'split-quote' : 'small')); row.append(head, body); return row; });
}
// Lane diagram on a timeline: "@timeline Session 1 | Activity | Session 2", then
// "- Lane — [solid 1] text // line || [dashed 1-3] text". Spans count the timeline points (1, 2, 3, 1-2, 2-3, 1-3);
// styles: solid, dashed, dotted, bold, plain, muted, note. A line starting with "~" is a small caption.
// Two or more timelines in a row become one view with capsule buttons to switch between them.
function tabifyTimelines(group) {
  const lines = [...group.querySelectorAll(':scope > .tl')];
  group.querySelector(':scope > .tl-tabs')?.remove();
  if (lines.length < 2) return;
  group.classList.add('is-tabbed');
  const bar = tabs(lines.map((line, index) => ({index, label: line.querySelector('.tl-title')?.textContent || pad(index + 1)})), item => item.index === 0, item => lines.forEach((line, index) => { line.hidden = index !== item.index; }), () => '');
  bar.classList.add('tl-tabs');
  for (const count of bar.querySelectorAll('.tab-count')) count.remove();
  lines.forEach((line, index) => { line.hidden = index !== 0; });
  group.prepend(bar);
}
// "@slope Pre | Post // Group A | Group B" — small-multiple slope charts, one per row:
// "- Measure — 4.21 2.78 | 3.29 3.68" (group A pre post | group B pre post). A is the highlighted series.
function slopeCharts(items, args) {
  const [timesRaw = '', groupsRaw = ''] = (args._raw || '').split(/\s+\/\/\s+/);
  const [t0 = 'Pre', t1 = 'Post'] = timesRaw.split(/\s*\|\s*/);
  const groups = groupsRaw.split(/\s*\|\s*/).filter(Boolean);
  const node = el('div', 'slope');
  const key = el('div', 'slope-key');
  groups.forEach((group, index) => { const k = el('span', `slope-key-item${index ? ' is-base' : ''}`); k.append(el('span', 'slope-swatch'), el('span', '', group)); key.append(k); });
  node.append(key);
  const grid = el('div', 'slope-grid');
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
  for (const item of items) {
    const [label, data = ''] = item.split(/\s+—\s+/);
    const raw = data.split(/\s*\|\s*/).map(part => part.trim().split(/\s+/));
    const series = raw.map(pair => pair.map(Number));
    const all = series.flat();
    const lo = Math.min(...all), hi = Math.max(...all), padV = (hi - lo) * 0.18 || 1;
    const W = 200, H = 150, x0 = 46, x1 = 154, top = 14, bottom = 122;
    const y = v => bottom - (v - (lo - padV)) / ((hi + padV) - (lo - padV)) * (bottom - top);
    const cell = el('figure', 'slope-cell');
    const svg = svgEl('svg', {viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `${label}: ${groups.map((g, i) => `${g} ${series[i]?.[0]} → ${series[i]?.[1]}`).join(', ')}`});
    for (const x of [x0, x1]) svg.append(svgEl('line', {x1: x, x2: x, y1: top - 4, y2: bottom + 4, class: 'slope-axis'}));
    [[x0, t0], [x1, t1]].forEach(([x, t]) => { const tx = svgEl('text', {x, y: H - 8, class: 'slope-time', 'text-anchor': 'middle'}); tx.textContent = t; svg.append(tx); });
    // The base series is drawn first so the highlighted one sits on top.
    [...series.keys()].reverse().forEach(index => {
      const [a, b] = series[index]; if (!Number.isFinite(a) || !Number.isFinite(b)) return;
      const g = svgEl('g', {class: `slope-series${index ? ' is-base' : ''}`});
      g.append(svgEl('line', {x1: x0, y1: y(a), x2: x1, y2: y(b), class: 'slope-line'}));
      [[x0, a, 'end', -8, raw[index][0]], [x1, b, 'start', 8, raw[index][1]]].forEach(([x, v, anchor, dx, text]) => {
        const dot = svgEl('circle', {cx: x, cy: y(v), r: 4, class: 'slope-dot'});
        const tip = svgEl('title', {}); tip.textContent = `${groups[index] || ''} · ${x === x0 ? t0 : t1} ${text}`; dot.append(tip);
        const tx = svgEl('text', {x: x + dx, y: y(v) + 3.5, 'text-anchor': anchor, class: 'slope-value'}); tx.textContent = text;
        g.append(dot, tx);
      });
      svg.append(g);
    });
    cell.append(svg, md(label, 'slope-label'));
    grid.append(cell);
  }
  node.append(grid);
  return node;
}
// "@legend" — "- [solid] label" items become a key with a small swatch per line style (solid, dashed, dotted, bold, plain).
function legendRow(items) {
  const node = el('div', 'legend');
  for (const item of items) {
    const m = item.match(/^\[(\w+)\]\s*(.*)$/);
    const entry = el('span', 'legend-item');
    entry.append(el('span', `legend-swatch is-${m ? m[1] : 'plain'}`), md(m ? m[2] : item, 'legend-label'));
    node.append(entry);
  }
  return node;
}
// "@trace Theme(s) | Role | Justification // Themes from: | Group A | Group B" — a traceability table.
// Rows: "- Theme + ^Theme => [style] Role · TAG — justification". "^" marks a theme from the second group (outlined);
// role styles: primary, sub, tool, policy, infra, repo.
function traceTable(items, args) {
  const [colsRaw = '', fromRaw = ''] = (args._raw || '').split(/\s+\/\/\s+/);
  const cols = colsRaw.split(/\s*\|\s*/).filter(Boolean);
  const [fromLabel, ...groups] = fromRaw.split(/\s*\|\s*/).filter(Boolean);
  const node = el('div', 'trace');
  if (groups.length) {
    const key = el('div', 'trace-key');
    key.append(el('span', 'trace-key-label', fromLabel));
    groups.forEach((group, index) => key.append(el('span', `trace-theme${index ? ' is-outline' : ''}`, group)));
    node.append(key);
  }
  const head = el('div', 'trace-row trace-head');
  // The role and its justification share the right column, so their headers share it too.
  if (cols.length) head.append(el('span', '', cols[0]), el('span', '', cols.slice(1).join(' · ')));
  if (cols.length) node.append(head);
  for (const item of items) {
    const [themes, rest = ''] = item.split(/\s+=>\s+/);
    const row = el('div', 'trace-row');
    const left = el('div', 'trace-themes');
    themes.split(/\s+\+\s+/).forEach((theme, index) => {
      if (index) left.append(el('span', 'trace-plus', '+'));
      left.append(el('span', `trace-theme${theme.startsWith('^') ? ' is-outline' : ''}`, theme.replace(/^\^/, '')));
    });
    left.append(el('span', 'trace-arrow', '→'));
    const m = rest.match(/^\[(\w+)\]\s*([^·—]+?)(?:\s+·\s+([^—]+?))?\s+—\s+([\s\S]*)$/);
    const role = el('div', `trace-role is-${m ? m[1] : 'sub'}`);
    role.append(el('span', 'trace-role-name', m ? m[2] : rest), el('span', 'trace-role-tag', m && m[3] ? m[3] : ''));
    row.append(left, role, md(m ? m[4] : '', 'trace-why'));
    node.append(row);
  }
  return node;
}
function timelineChart(items, args, heading) {
  const points = (args._raw || '').split(/\s*\|\s*/).filter(Boolean);
  const node = el('div', 'tl');
  if (heading) node.append(el('p', 'mono blue tl-title', heading));
  const axis = el('div', 'tl-row tl-axis');
  const line = el('div', 'tl-points');
  points.forEach((point, index) => { const mark = el('span', 'tl-point', point); mark.style.gridColumn = `${index * 2 + 1} / span 2`; line.append(mark); });
  axis.append(el('span', 'tl-lane'), line);
  node.append(axis);
  // "h1" / "h2" are the left and right halves, for two boxes side by side.
  const columns = span => { if (span === 'h1') return '1 / 4'; if (span === 'h2') return '4 / 7'; const [a, b = a] = span.split('-').map(Number); return `${a * 2 - 1} / ${b * 2 + 1}`; };
  for (const item of items) {
    const [lane, rest = ''] = item.split(/\s+—\s+/, 2).length === 2 ? [item.slice(0, item.indexOf(' — ')), item.slice(item.indexOf(' — ') + 3)] : ['', item];
    const row = el('div', 'tl-row');
    const track = el('div', 'tl-track');
    for (const part of rest.split(/\s+\|\|\s+/)) {
      const m = part.match(/^\[(\w+)\s+([\dh-]+)\]\s*([\s\S]*)$/);
      if (!m) continue;
      const box = el('div', `tl-box is-${m[1]}`);
      box.style.gridColumn = columns(m[2]);
      for (const text of m[3].split(/\s+\/\/\s+/)) box.append(text.startsWith('~') ? md(text.slice(1).trim(), 'tl-sub') : md(text, 'tl-text'));
      track.append(box);
    }
    row.append(el('span', 'tl-lane', lane), track);
    node.append(row);
  }
  return node;
}
// Journey lanes: "**Stage** — “thought” // “thought” // → feature" becomes one column per stage.
function laneChart(items) {
  const node = el('div', 'lanes');
  for (const item of items) {
    const {title, tag, lines} = parseCard(item);
    const lane = el('div', 'lane');
    lane.append(el('p', 'lane-head', title || tag || ''));
    for (const line of lines) {
      if (/^[“"‘]/.test(line)) lane.append(md(line, 'lane-bubble'));
      else if (/^→\s*/.test(line)) lane.append(md(line.replace(/^→\s*/, ''), 'lane-feature'));
      else if (line.trim() !== '-') lane.append(md(line, 'small'));
    }
    node.append(lane);
  }
  return node;
}
function columnChart(items, heading) {
  const rows = items.map(item => { const [name, raw] = item.split(/:\s+(?=[^:]*$)/); return {name, raw, value: parseFloat(raw.replace(/[^\d.]/g, '')) || 0}; });
  const max = Math.max(...rows.map(row => row.value), 1);
  const node = el('div', 'columns-chart');
  if (heading) node.append(el('p', 'strong columns-title', heading));
  const plot = el('div', 'columns-plot');
  for (const row of rows) {
    const col = el('div', 'column');
    const bar = el('span', `column-bar${row.value === max ? ' is-top' : ''}`);
    bar.style.height = `${row.value / max * 100}%`;
    col.append(el('span', 'column-value', row.raw), bar, el('span', 'mono column-name', row.name));
    plot.append(col);
  }
  node.append(plot);
  return node;
}
function meterChart(items, args) {
  const rows = items.map(item => { const [head, ...captions] = item.split(/\s+—\s+/); const [name, raw = ''] = head.split(/:\s+(?=[^:]*$)/); return {name, raw, captions, value: parseFloat(raw.replace(/[^\d.]/g, '')) || 0}; });
  const max = Number(args.max) || Math.max(...rows.map(row => row.value), 1);
  // "@meter inline" puts the label, bar and value on one line with a thicker bar.
  const node = el('div', `meter${'inline' in args ? ' is-inline' : ''}`);
  for (const row of rows) {
    const line = el('div', 'meter-row');
    const head = el('div', 'meter-head');
    head.append(md(row.name, 'strong'), el('span', 'meter-value', row.raw));
    const track = el('div', 'meter-track');
    const fill = el('span', `meter-fill${row.value === Math.max(...rows.map(r => r.value)) ? ' is-top' : ''}`);
    fill.style.width = `${Math.min(100, row.value / max * 100)}%`;
    track.append(fill);
    if (args.mark) { const mark = el('span', 'meter-mark'); mark.style.left = `${Number(args.mark) / max * 100}%`; track.append(mark); }
    line.append(head, track, ...row.captions.map(caption => md(caption, 'small')));
    node.append(line);
  }
  return node;
}
function flowChart(items, args) {
  const down = 'down' in args, row = 'row' in args;
  // "@flow row" lines the boxes up as one row of steps, without arrows or a dark last box.
  const node = el('div', `flow${down ? ' is-down' : ''}${row ? ' is-row' : ''}`);
  items.forEach((item, index) => {
    if (index && !row) node.append(el('span', 'flow-arrow', down ? '↓' : '→'));
    const step = el('div', `flow-step${index === items.length - 1 && !down && !row ? ' is-last' : ''}`);
    for (const part of item.split(/\s+\|\|\s+/)) {
      // "[outline] …", "[blue] …", "[dashed] …", "[solid] …" pick a box style.
      const style = part.match(/^\[(\w+)\]\s+/);
      step.append(cardNode(style ? part.slice(style[0].length) : part, `flow-box${style ? ' is-' + style[1] : ''}`));
    }
    if (step.children.length > 1) step.classList.add('is-multi');
    node.append(step);
  });
  return node;
}
// "@dialog" — a conversation diagram: "Line — **forward** | other | other" puts the agent's line in a box with the
// child's possible responses beside it; bold responses lead to the next line, the rest are asked again.
// A line without " — " is the line alone; "**a** | **b**" with no line is a pair of events (e.g. timer ends).
function dialogChart(items) {
  const node = el('div', 'dialog');
  items.forEach((item, index) => {
    if (index) node.append(el('span', 'dialog-arrow', '↓'));
    const row = el('div', 'dialog-row');
    const [line, answers] = item.includes(' — ') ? item.split(/\s+—\s+/) : (item.includes(' | ') ? [null, item] : [item, null]);
    const left = el('div', 'dialog-line');
    if (line) left.append(el('p', 'dialog-say', line));
    const chips = (answers || '').split(/\s+\|\s+/).filter(Boolean).map(answer => {
      const forward = /^\*\*.+\*\*$/.test(answer);
      return el('span', `dialog-answer${forward ? ' is-forward' : ''}`, forward ? answer.slice(2, -2) : answer);
    });
    if (line) { row.append(left); if (chips.length) { const list = el('div', 'dialog-answers'); list.append(...chips); row.append(list); } }
    else { left.classList.add('is-events'); for (const chip of chips) { chip.classList.add('dialog-event'); left.append(chip); } row.append(left); }
    node.append(row);
  });
  return node;
}
// Business model canvas: nine cards in the usual order (partners, activities, resources, value, relationships, channels, segments, cost, revenue).
function canvasChart(items) {
  const node = el('div', 'canvas');
  items.forEach((item, index) => {
    const {title, tag, lines} = parseCard(item);
    const cell = el('div', `canvas-cell c${index + 1}`);
    cell.append(el('p', 'mono card-tag', title || tag || ''));
    for (const line of lines) cell.append(md(line, 'small'));
    node.append(cell);
  });
  return node;
}
function sourceRows(items) {
  return hairList(items, item => { const [textPart, source] = item.split(/\s+—\s+(?=[^—]*$)/); const row = el('div', 'source-row'); row.append(md(textPart), el('span', 'mono', source || '')); return row; });
}
function richList(lines, heading, mode = null, args = {}) {
  const ordered = lines.every(line => /^\d+\.\s/.test(line));
  const items = lines.map(line => line.replace(/^(\d+\.|[-*])\s+/, '').trim());
  if (mode === 'columns' && items.every(item => /^.+:\s+\D{0,2}\d[\d,.]*\s?\S{0,3}$/.test(item))) return columnChart(items, heading);
  if (mode === 'meter') return meterChart(items, args);
  if (mode === 'flow') return flowChart(items, args);
  if (mode === 'dialog') return dialogChart(items);
  if (mode === 'canvas') return canvasChart(items);
  if (mode === 'rows') return sourceRows(items);
  if (mode === 'lanes') return laneChart(items);
  if (mode === 'defs') return defRows(items, args);
  if (mode === 'chips') return chipGroups(items);
  if (mode === 'specs') return specColumns(items);
  if (mode === 'dots') return dotPlot(items);
  if (mode === 'versus') return versusColumns(items);
  if (mode === 'split') return splitRows(items);
  // "@cards" — labelled cards ("Label — text") or titled cards in an even grid ("@cards outline" for outlined cards).
  if (mode === 'cards') { const node = el('div', `cards is-even${'outline' in args ? ' is-outline' : ''}`); for (const item of items) node.append(cardNode(item)); return node; }
  // "@quad" keeps four cards as a 2 × 2 grid at every width (SWOT).
  if (mode === 'quad') { const node = el('div', 'cards is-quad'); for (const item of items) node.append(cardNode(item)); return node; }
  if (mode === 'timeline') return timelineChart(items, args, heading);
  if (mode === 'legend') return legendRow(items);
  if (mode === 'slope') return slopeCharts(items, args);
  // "@dash" — a plain list with an em dash before each line, divided by hairlines.
  if (mode === 'dash') { const node = el('div', 'dash-list'); for (const item of items) { const row = el('div', 'dash-item'); row.append(el('span', 'dash-mark', '—'), md(item, 'dash-text')); node.append(row); } return node; }
  if (mode === 'trace') return traceTable(items, args);
  // "left => right" pairs a card with the dark card it leads to (requirement → goal, problem → response).
  if (!ordered && items.every(item => /\s=>\s/.test(item))) {
    const node = el('div', `pairs${mode === 'stack' ? ' is-stacked' : ''}`);
    for (const item of items) {
      const [from, to] = item.split(/\s+=>\s+/);
      const row = el('div', 'pair');
      row.append(cardNode(from, 'pair-from'), el('span', 'pair-arrow', '→'), cardNode(to, 'pair-to'));
      node.append(row);
    }
    return node;
  }
  if (!ordered && items.every(item => item.includes(' | '))) {
    const wrap = el('div', 'gtable-wrap');
    const table = el('table', 'gtable');
    items.forEach((item, index) => {
      const row = el('tr');
      for (const cell of splitItem(item, /\s+\|\s+/)) { const node = el(index === 0 ? 'th' : 'td'); for (const part of (cell === '-' ? '' : cell).split(/\s+\/\/\s+/)) node.append(md(part, 'cell-line')); row.append(node); }
      table.append(row);
    });
    if (splitItem(items[0], /\s+\|\s+/).length > 3) table.classList.add('is-wide');
    // The column named after this project is highlighted, as in a competitor table.
    const self = splitItem(items[0], /\s+\|\s+/).findIndex(cell => cell.toLowerCase() === text('title').toLowerCase());
    if (self > 0) for (const row of table.rows) row.cells[self]?.classList.add('is-self');
    wrap.append(table);
    return wrap;
  }
  if (!ordered && items.every(isQuote)) {
    const node = el('div', 'quotes');
    for (const item of items) { const [quote, source] = item.split(/\s+—\s+(?=[^—]*$)/); const box = el('figure', 'quote'); box.append(el('blockquote', '', quote), el('figcaption', 'mono', source || '')); node.append(box); }
    return node;
  }
  if (!ordered && items.every(isStat)) {
    // "@boxed" puts each figure in a grey box.
    const node = el('div', `hero-numbers${mode === 'boxed' ? ' is-boxed' : ''}`);
    for (const item of items) { const [value, ...rest] = item.split(/\s+—\s+/); const cell = el('div', 'hero-number'); cell.append(el('p', 'hero-value', value)); for (const line of rest) cell.append(md(line, 'small')); node.append(cell); }
    return node;
  }
  if (!ordered && items.every(isBar)) {
    const rows = items.map(item => { const [name, raw] = item.split(/:\s+(?=[^:]*$)/); return {name, raw, value: parseFloat(raw) || 0}; });
    const max = Math.max(...rows.map(row => row.value), 1);
    const box = el('div', 'bar-group');
    if (heading) { const [title, tag] = heading.split(/\s+·\s+/); const head = el('div', 'bar-head'); head.append(el('p', 'strong', title), el('p', 'mono', tag || '')); box.append(head); }
    for (const row of rows) { const line = el('div', 'bar-row'); const track = el('span', 'bar-track'); const fill = el('span', `bar-fill${row.value === max ? ' is-top' : ''}`); fill.style.width = `${row.value / max * 100}%`; track.append(fill); line.append(el('span', 'bar-name', row.name), track, el('span', 'mono', row.raw)); box.append(line); }
    return box;
  }
  if (!ordered && items.every(isCard)) {
    // A final ">> …" segment sits beside the card as an aside (a figure or a short verdict).
    const aside = items.some(item => /\s>>\s/.test(item));
    const node = el('div', aside ? 'aside-rows' : 'cards');
    for (const item of items) {
      const [main, note] = item.split(/\s+>>\s+/);
      const card = cardNode(main);
      if (!aside) { node.append(card); continue; }
      const row = el('div', 'aside-row');
      row.append(card, md(note || '', 'aside'));
      node.append(row);
    }
    return node;
  }
  const list = hairList(items, item => {
    const index = items.indexOf(item);
    const card = item.match(/^\*\*([^*]+)\*\*\s+—\s+([\s\S]*)$/);
    const row = el('div', ordered ? 'numbered' : '');
    const col = el('div');
    let media = [];
    if (card) { const parts = segmentNodes(card[2].split(/\s+\/\/\s+/)); media = parts.media; col.append(el('p', 'strong', card[1]), ...parts.text); } else col.append(md(item));
    // A row with an image puts the image first and moves the number above the title.
    if (media.length) { const figure = el('div', 'row-media'); figure.append(...media); row.append(figure); row.classList.add('has-media'); if (ordered) col.prepend(el('span', 'mono blue row-index', pad(index + 1))); }
    else if (ordered) row.append(el('span', 'mono blue', pad(index + 1)));
    row.append(col);
    return row;
  });
  // Numbered "**Title** — text" rows without images read as insights.
  if (ordered && !list.querySelector('.has-media') && items.every(item => /^\*\*[^*]+\*\*\s+—\s+/.test(item))) list.classList.add('is-insights');
  return list;
}
function richBody(source, body) {
  let first = true;
  let heading = null;
  let gallery = null;
  let mode = null, args = {};
  for (const raw of source.split(/\n\s*\n/)) {
    const block = raw.trim();
    if (!block || /^@wide$/.test(block)) continue;
    // "@columns", "@rows", "@flow", "@meter", "@canvas" shape the list that follows; "key=value" words set options.
    const directive = block.match(/^@(\w+)([^\n]*)$/);
    if (directive && blockModes.has(directive[1])) { mode = directive[1]; args = {_raw: directive[2].trim(), ...Object.fromEntries(directive[2].trim().split(/\s+/).filter(word => /^[\w.]+(=[\w.]+)?$/.test(word)).map(word => word.split('=')))}; continue; }
    // "##### Label" is the large mono kicker (Quote, Observed); "### Label" the small one.
    const kicker = block.match(/^#####\s+(.+)$/);
    if (kicker) { const node = el('div', 'sub-head is-large'); node.append(el('p', 'mono blue', kicker[1])); body.append(node); heading = null; gallery = null; first = false; continue; }
    const strongHead = block.match(/^####\s+(.+)$/);
    if (strongHead) { body.append(md(`**${strongHead[1]}**`, 'sub-title')); gallery = null; first = false; continue; }
    if (block.startsWith('※ ')) { body.append(md(block.slice(2), 'note-caption')); gallery = null; first = false; continue; }
    if (block === '@persona') { personaBlock(body); first = false; continue; }
    if (block === '@journey') { journeyBlock(body); first = false; continue; }
    if (block === '@system') { systemBlock(body); first = false; continue; }
    const head = block.match(/^###\s+(.+)$/);
    if (head) { heading = head[1]; gallery = null; const [title, tag] = heading.split(/\s+·\s+/); const node = el('div', 'sub-head'); node.append(el('p', 'mono blue', tag ? `${title} · ${tag}` : title)); body.append(node); continue; }
    if (/^!\[[^\]]*\]\([^)]+\)$/.test(block)) {
      // "@stack" before images keeps them one per row instead of a two-column gallery.
      // "@stack" keeps images one per row; "@hero" makes the first image full width. Three images form a mosaic.
      if (!gallery) { gallery = el('div', `gallery${mode === 'stack' ? ' is-stack' : mode === 'hero' ? ' is-hero' : ''}`); body.append(gallery); mode = null; }
      gallery.append(...md(block).children);
      gallery.classList.toggle('is-multi', gallery.children.length > 1 && !gallery.classList.contains('is-stack'));
      gallery.classList.toggle('is-three', gallery.children.length === 3 && !gallery.classList.contains('is-hero') && !gallery.classList.contains('is-stack'));
      first = false;
      continue;
    }
    gallery = null;
    const lines = block.split('\n');
    if (lines.every(line => /^(\d+\.|[-*])\s/.test(line))) {
      const listMode = mode;
      const list = richList(lines, heading, mode, args);
      mode = null; args = {};
      if (list.classList.contains('columns-chart') && heading && body.lastElementChild?.classList.contains('sub-head')) body.lastElementChild.remove();
      if (list.classList.contains('tl')) {
        if (heading && body.lastElementChild?.classList.contains('sub-head')) body.lastElementChild.remove();
        // Consecutive timelines sit side by side.
        let grid = body.lastElementChild;
        if (!grid?.classList.contains('tl-group')) { grid = el('div', 'tl-group'); body.append(grid); }
        grid.append(list);
        tabifyTimelines(grid);
        heading = null;
        continue;
      }
      if (list.classList.contains('bar-group')) {
        // Consecutive charts share one grid; the chart carries its own heading.
        if (heading && body.lastElementChild?.classList.contains('sub-head')) body.lastElementChild.remove();
        let grid = body.lastElementChild;
        // "@stack" before a chart stacks the charts full width, one per row.
        if (!grid?.classList.contains('bar-groups')) { grid = el('div', `bar-groups${listMode === 'stack' ? ' is-stacked' : ''}`); body.append(grid); }
        grid.append(list);
      } else body.append(list);
    } else body.append(md(block, first ? 'lead' : 'body-text'));
    first = false;
  }
}
function freeSections() {
  return Object.keys(content).filter(key => key.startsWith('case.section.') && !isBlank(content[key]));
}
function freeHeading(key) { return sectionLabels[key] || key.slice('case.section.'.length); }

// Required blocks always render (with prompts); optional blocks appear once written.
function caseStudy() {
  const blocks = [
    ['PROBLEM', problemBlock, true],
    ['RESEARCH', researchBlock, true],
    ['PERSONA', personaBlock, filled('case.persona.name')],
    ['INSIGHTS', insightsBlock, true],
    ['JOURNEY', journeyBlock, subsections(content['case.journey.stages']).length > 0, true],
    ['KEY DECISIONS', decisionsBlock, true],
    ['IMPACT', impactBlock, listItems(content['case.impact']).length > 0],
    // Outcome stays hidden until the takeaway is written, so a public page never shows the prompt.
    ['OUTCOME', outcomeBlock, filled('case.outcome.lead')],
    ['DESIGN SYSTEM', systemBlock, filled('case.system.body') || filled('case.system.palette')],
  ].filter(([, , shown]) => shown);
  const free = freeSections();
  if (free.length) return free.map((key, index) => {
    const wide = /(^|\n)@wide\s*($|\n)/.test(content[key]);
    const node = el('section', `block free-block${wide ? ' block-wide' : ''}`);
    const body = el('div', 'block-body');
    richBody(content[key], body);
    node.append(el('p', 'block-label', `${pad(index + 1)} · ${freeHeading(key).toUpperCase()}`), body);
    return node;
  });
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
  // Organisation replaces Tools when it is filled in.
  for (const [key, name] of [['role', UI.role], ['period', UI.time], filled('org') ? ['org', UI.org] : ['tools', UI.tools]]) { const item = el('div'); item.append(el('dt', 'mono', name), el('dd', isBlank(content[key]) ? 'is-todo' : '', text(key, UI.todo))); node.append(item); }
  return node;
}
// Case pages carry the project's place in the registry, its subtitle and tagline, and what is open to visitors.
function caseHead() {
  const node = pageHead(`${text('title').toUpperCase()} · ${UI.caseStudy}`, text('title'), filled('subtitle') ? null : 'summary');
  if (filled('subtitle')) node.append(copy('subtitle', 'subtitle'));
  if (filled('tagline')) node.append(copy('tagline', 'tagline'));
  return node;
}
// "availability" in project.json lists what exists, e.g. [["prototype", false], ["screens", true], ["case", true]].
// A filled item links to its page when that page is public.
function availability() {
  const items = config.availability || [[config.type === 'gallery' ? 'screens' : 'prototype', config.showPrototype !== false], ['case', true]];
  const node = el('ul', 'availability');
  node.setAttribute('aria-label', UI.availableLabel);
  for (const [id, on] of items) {
    const name = `${on ? '●' : '○'} ${UI.available[id] || id}`;
    const item = el('li', `avail${on ? ' is-on' : ''}`);
    if (on && id === 'case') item.append(el('span', '', name)), item.firstChild.setAttribute('aria-current', 'page');
    else if (on && config.showPrototype !== false) item.append(link(name, withLang('./')));
    else item.append(el('span', '', name));
    node.append(item);
  }
  return node;
}
function casePage() {
  const intro = filled('case.intro') ? [copy('case.intro', 'case-intro')] : [];
  return [
    topBar([[UI.projects, '../'], [text('title').toUpperCase()], [UI.caseStudy]], projectNumber),
    caseHead(),
    metaRow(),
    availability(),
    ...intro,
    ...caseStudy(),
    footerNav(config.showPrototype === false ? null : UI.toPrototype, './'),
  ];
}

// ---------- index ----------
async function renderProjects() {
  const response = await fetch('./shared/projects.json');
  if (!response.ok) throw new Error('프로젝트 목록을 불러올 수 없습니다.');
  const projects = await response.json();
  // Promise.all keeps the registry order.
  const entries = await Promise.all(projects.map(async project => [project, await loadContent(`./${project}/content`), await fetch(`./${project}/project.json`).then(r => r.ok ? r.json() : {}).catch(() => ({}))]));
  const grid = el('ol', 'project-grid');
  // A project is listed only when something is open to visitors: its prototype (unless "showPrototype": false) or a published case study.
  const visible = entries.filter(([, , cfg]) => cfg.showPrototype !== false || cfg.caseStudy === true);
  for (const [index, [project, c, projectConfig]] of visible.entries()) {
    const hasPrototype = projectConfig.showPrototype !== false;
    const hasCase = projectConfig.caseStudy === true;
    const card = el('li', 'project-card');
    const meta = el('div', 'project-meta');
    meta.append(el('span', 'mono', pad(index + 1)), el('span', 'mono blue', c.scope || ''));
    const title = el('h2');
    title.append(link(c.title, withLang(hasPrototype ? `./${project}/` : `./${project}/case-study.html`)));
    const links = el('div', 'project-links');
    if (hasPrototype) links.append(link(UI.openPrototype, withLang(`./${project}/`), 'btn btn-dark'));
    if (hasCase) links.append(link(UI.openCase, withLang(`./${project}/case-study.html`), 'btn btn-outline'));
    card.append(meta, title, md(c.summary || ''), links);
    grid.append(card);
  }
  const head = pageHead(`${UI.selected} · ${UI.count(visible.length)}`, UI.indexTitle);
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
  const koSource = await fetchText(`${base}.md`, true);
  const ko = parseContent(koSource, {requireTitle});
  Object.assign(sectionLabels, parseHeadings(koSource));
  if (lang !== 'en') return ko;
  const source = await fetchText(`${base}.en.md`, false);
  if (!source) return ko;
  Object.assign(sectionLabels, parseHeadings(source));
  for (const [key, value] of Object.entries(parseContent(source, {requireTitle: false}))) if (value && (!isBlank(value) || isBlank(ko[key]))) ko[key] = value;
  return ko;
}

window.addEventListener('message', event => {
  if (event.origin !== location.origin || ![...frames].some(frame => frame.contentWindow === event.source)) return;
  if (event.data?.type === 'portfolio:screen') updateSelection(event.data.screen, false);
  if (event.data?.type === 'portfolio:navigate') { syncFlow(event.data.screen); updateSelection(event.data.screen); }
  if (event.data?.type === 'portfolio:ready') event.source.postMessage({type: 'portfolio:select', screen: selected, theme}, location.origin);
});

async function start() {
  if (view === 'projects') return renderProjects();
  const response = await fetch('project.json');
  if (!response.ok) throw new Error('project.json을 불러올 수 없습니다.');
  config = await response.json();
  // A flow may list its screens directly or in named groups (e.g. onboarding → monitoring).
  for (const flow of config.flows) if (!flow.screens && flow.groups) flow.screens = flow.groups.flatMap(group => group.screens);
  content = await loadContent('content');
  if (view === 'case') Object.assign(content, await loadContent('case-study', false));
  if (view === 'case') {
    // The case page shows the project's position in the registry, matching the index numbering.
    const registry = await fetch('../shared/projects.json').then(r => r.ok ? r.json() : []).catch(() => []);
    const index = registry.indexOf(location.pathname.split('/').filter(Boolean).at(-2));
    if (index >= 0) projectNumber = pad(index + 1);
  }
  // Flow prototypes always open on the first flow's first screen.
  selected = isFlowLayout() && config.flows[0]?.screens?.length ? config.flows[0].screens[0] : config.defaultScreen;
  selectedFlow = isFlowLayout() ? config.flows[0].id : config.flows.find(flow => flow.screens.includes(selected))?.id || config.flows[0].id;
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
