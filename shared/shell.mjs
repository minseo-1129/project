import {parseContent, renderMarkdown} from './content.mjs';

const app = document.getElementById('app');
const view = document.body.dataset.view || 'prototype';
const resizeObserver = new ResizeObserver(entries => {
  for (const {target} of entries) fitFrame(target);
});
const frames = new Set();
// Mount read-only gallery screens as they enter the viewport.
const thumbnailObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const frame = entry.target.querySelector('iframe');
    if (frame?.dataset.source) {
      frame.src = frame.dataset.source;
      delete frame.dataset.source;
    }
    thumbnailObserver.unobserve(entry.target);
  }
}, {rootMargin:'100px'});
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let config, content, selected, selectedFlow, theme = 'light';
let screenControls = [];
let selectedPanel, counter, galleryLabel, flowCards;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function text(key, fallback = '') { return content[key] ?? fallback; }
function copy(key, fallback = '') {
  const node = el('div', 'copy');
  renderMarkdown(text(key, fallback), node);
  return node;
}
function link(label, href, className = '') {
  const node = el('a', className, label);
  node.href = href;
  return node;
}
function rule() { return el('hr', 'rule'); }
function panel(label, titleKey, bodyKey, fallback = '') {
  const node = el('div', 'panel');
  node.append(el('p', 'panel-label', label), el('h3', '', text(titleKey)), copy(bodyKey, fallback));
  return node;
}
function header() {
  const node = el('header', 'shell-header');
  const nav = el('nav');
  nav.setAttribute('aria-label', '페이지');
  nav.append(link('PROJECTS', '../'), link(view === 'case' ? 'PROTOTYPE' : 'CASE STUDY', view === 'case' ? './' : 'case-study.html'), link('ABOUT', '../#about'));
  node.append(link('RESEARCH / PROTOTYPE LIBRARY', '../'), nav);
  return node;
}
function fitFrame(preview) {
  const frame = preview.querySelector('iframe');
  if (!frame || preview.dataset.native === 'false') return;
  const width = Number(preview.dataset.width);
  const height = Number(preview.dataset.height);
  const scale = Math.min(preview.clientWidth / width, preview.clientHeight / height);
  frame.style.width = `${width}px`;
  frame.style.height = `${height}px`;
  frame.style.transform = `scale(${scale})`;
}
function preview(screen, readonly = false, native = config.component !== null || config.nativeViewport === true) {
  const node = el('div', 'preview');
  node.dataset.width = config.width;
  node.dataset.height = config.height;
  node.dataset.native = String(native);
  node.dataset.readonly = String(readonly);
  node.style.setProperty('--screen-ratio', `${config.width} / ${config.height}`);
  const frame = el('iframe');
  if (config.component) {
    const url = new URL('viewer.html', location.href);
    url.searchParams.set('screen', screen);
    if (readonly) url.searchParams.set('readonly', '1');
    frame.src = url.href;
  } else {
    frame.src = config.prototype;
    frame.dataset.screen = screen;
    if (config.webStates?.length) {
      const applyState = () => {
        const state = config.webStates.find(state => state.id === frame.dataset.screen);
        if (!state) return true;
        const win = frame.contentWindow;
        if (state.props && !win.__dcSetProps) return false;
        if (state.props) win.__dcSetProps(win.__dcRootName(), state.props);
        if (state.selector) {
          const button = frame.contentDocument.querySelector(state.selector);
          if (!button) return false;
          button.click();
        }
        if (state.buttonText) {
          const button = [...frame.contentDocument.querySelectorAll('button')].find(button => button.textContent.trim() === state.buttonText);
          if (!button) return false;
          button.click();
        }
        return true;
      };
      frame.addEventListener('load', () => {
        if (!readonly) frame.contentDocument.addEventListener('click',event => {
          const state = config.webStates.find(state => state.selector && event.target.closest?.(state.selector));
          if (state) updateSelection(state.id,false);
        });
        // Read-only 3D cards render their selected state without running a
        // second continuous WebGL loop beside the interactive main preview.
        if (readonly) {
          const stage = frame.contentDocument.querySelector('three-d-stage');
          if (stage?.ready) stage.ready.then(() => {
            stage.removeAttribute('autorotate');
            stage._renderer?.setAnimationLoop(null);
            stage._loop?.();
            frame.contentWindow.setTimeout(() => stage._loop?.(),1100);
          }).catch(() => {});
        }
        if (applyState()) return;
        const observer = new MutationObserver(() => { if (applyState()) observer.disconnect(); });
        observer.observe(frame.contentDocument.body,{childList:true,subtree:true});
      });
    }
  }
  frame.title = `${text('title')} · ${text(`screen.${screen}.title`, '인터랙티브 프로토타입')}`;
  frame.loading = readonly ? 'lazy' : 'eager';
  if (readonly) {
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
  } else frames.add(frame);
  if (readonly && config.component) {
    frame.dataset.source = frame.src;
    frame.removeAttribute('src');
    thumbnailObserver.observe(node);
  }
  node.append(frame);
  resizeObserver.observe(node);
  return node;
}
function device(screen) {
  const node = el('div', 'device');
  node.append(preview(screen));
  return node;
}
function browser(screen) {
  const node = el('div', 'browser');
  const toolbar = el('div', 'toolbar');
  toolbar.append(el('span', '', '●  ●  ●'), el('span', '', `${text('title')} / interactive prototype`));
  node.append(toolbar, preview(screen));
  return node;
}
function screenText(screen) {
  return content[`flow.${selectedFlow}.${screen}.body`] ?? text(`screen.${screen}.body`);
}
function allScreens() { return [...new Set(config.flows.flatMap(flow => flow.screens))]; }
function updateSelection(screen, send = true) {
  if (!allScreens().includes(screen)) return;
  selected = screen;
  for (const node of screenControls) {
    node.setAttribute('aria-pressed', String(node.dataset.screen === screen));
  }
  if (selectedPanel) {
    selectedPanel.querySelector('h3').textContent = text(`screen.${screen}.title`, screen);
    renderMarkdown(screenText(screen), selectedPanel.querySelector('.copy'));
  }
  const flow = config.flows.find(flow => flow.id === selectedFlow);
  const index = flow.screens.indexOf(screen);
  if (counter) counter.textContent = `${String((index >= 0 ? index : allScreens().indexOf(screen)) + 1).padStart(2, '0')} / ${String(index >= 0 ? flow.screens.length : allScreens().length).padStart(2, '0')} · ${text(`screen.${screen}.title`, screen)}`;
  const strip = document.querySelector('.filmstrip .screen-cards');
  const active = strip?.querySelector('[aria-pressed=true]');
  if (active) strip.scrollTo({left: active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2, behavior: reducedMotion.matches ? 'auto' : 'smooth'});
  if (send) for (const frame of frames) {
    if (config.component) frame.contentWindow?.postMessage({type:'portfolio:select', screen, theme}, location.origin);
    else {
      frame.dataset.screen = screen;
      const url = new URL(config.prototype,location.href);
      url.searchParams.set('portfolioState',screen);
      frame.src = url.href;
    }
  }
}
function screenButton(screen, number) {
  const button = el('button', 'pill', `${String(number + 1).padStart(2, '0')} / ${text(`screen.${screen}.title`, screen)}`);
  button.type = 'button';
  button.dataset.screen = screen;
  button.setAttribute('aria-pressed', String(selected === screen));
  button.addEventListener('click', () => updateSelection(screen));
  screenControls.push(button);
  return button;
}
function navigator(screens, className = 'navigation') {
  const node = el('div', className);
  node.setAttribute('role', 'group');
  node.setAttribute('aria-label', '화면 선택');
  screens.forEach((screen, index) => node.append(screenButton(screen, index)));
  return node;
}
function rationale() {
  selectedPanel = el('div', 'panel explanation');
  selectedPanel.setAttribute('aria-live', 'polite');
  selectedPanel.append(el('p', 'panel-label', config.type === 'gallery' ? 'SELECTED SCENE' : 'SELECTED SCREEN / DESIGN RATIONALE'), el('h3'), el('div', 'copy'));
  return selectedPanel;
}
function cards(screens, numbered = false) {
  const node = el('div', 'screen-cards');
  for (const [index, screen] of screens.entries()) {
    const card = el('button', 'screen-card');
    card.type = 'button';
    card.dataset.screen = screen;
    card.setAttribute('aria-pressed', String(screen === selected));
    card.setAttribute('aria-label', `${text(`screen.${screen}.title`, screen)} 화면 선택`);
    card.append(preview(screen, true), el('span', 'panel-label', numbered ? String(index + 1).padStart(2, '0') : screen.toUpperCase()), el('h3', '', text(`screen.${screen}.title`, screen)));
    const description = el('div', 'copy');
    renderMarkdown(text(`screen.${screen}.caption`, screenText(screen)), description);
    card.append(description);
    card.addEventListener('click', () => updateSelection(screen));
    screenControls.push(card);
    node.append(card);
  }
  return node;
}
function transport() {
  const node = el('div', 'transport');
  counter = el('p', 'label');
  const buttons = el('div', 'transport-buttons');
  for (const [label, delta, symbol] of [['이전 화면', -1, '‹'], ['다음 화면', 1, '›']]) {
    const button = el('button', '', symbol);
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.addEventListener('click', () => {
      const screens = config.flows.find(flow => flow.id === selectedFlow).screens;
      updateSelection(screens[(Math.max(0, screens.indexOf(selected)) + delta + screens.length) % screens.length]);
    });
    buttons.append(button);
  }
  node.append(counter, buttons);
  return node;
}
function themePicker() {
  const node = el('div', 'theme-picker');
  for (const name of ['light','dark']) {
    const button = el('button', 'pill', name === 'light' ? 'Light' : 'Dark');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(theme === name));
    button.addEventListener('click', () => {
      theme = name;
      for (const child of node.children) child.setAttribute('aria-pressed', String(child === button));
      for (const frame of frames) frame.contentWindow?.postMessage({type:'portfolio:theme', theme}, location.origin);
    });
    node.append(button);
  }
  return node;
}
// Both pages: one editorial column built from the Figma prototype and UX
// portfolio masters (Shell v2 header, explanation, navigation, preview frames).
function explanation(label, titleKey, bodyKey) {
  const node = panel(label, titleKey, bodyKey);
  node.classList.add('explanation');
  return node;
}
function pageIntro() {
  const node = el('section', 'proto-intro');
  const metadata = el('dl', 'metadata');
  for (const [key, label] of [['role', 'ROLE'], ['period', 'TIME'], ['tools', 'TOOLS']]) {
    const item = el('div');
    item.append(el('dt', '', label), el('dd', '', text(key, '확인 예정')));
    metadata.append(item);
  }
  node.append(el('p', 'label', `${view === 'case' ? 'CASE STUDY' : 'PROTOTYPE'} / ${config.type.toUpperCase()}`), el('h1', '', text('title')), copy('summary'), metadata);
  return node;
}
function flowSwitcher() {
  const node = el('div', 'navigation');
  node.setAttribute('role', 'group');
  node.setAttribute('aria-label', '프로토타입 플로우 선택');
  for (const flow of config.flows) {
    const button = el('button', 'pill', text(`flow.${flow.id}.title`, flow.id));
    button.type = 'button';
    button.dataset.flow = flow.id;
    button.setAttribute('aria-pressed', String(flow.id === selectedFlow));
    button.addEventListener('click', () => {
      selectedFlow = flow.id;
      for (const child of node.children) child.setAttribute('aria-pressed', String(child.dataset.flow === selectedFlow));
      renderMarkdown(text(`flow.${flow.id}.body`), galleryLabel);
      const replacement = cards(flow.screens, true);
      flowCards.replaceWith(replacement);
      flowCards = replacement;
      screenControls = screenControls.filter(control => control.isConnected);
      updateSelection(flow.screens[0]);
    });
    node.append(button);
  }
  return node;
}
function stage() {
  const node = el('div', `stage stage-${config.type}`);
  const head = el('p', 'label', `${config.type === 'gallery' ? 'SCENE' : 'LIVE PREVIEW'} / ${config.width} × ${config.height}`);
  const controls = transport();
  if (config.themes) controls.append(themePicker());
  if (config.type === 'mobile') {
    const side = el('div', 'stage-side');
    side.append(rationale(), controls);
    node.append(head, device(selected), side);
  } else {
    node.append(head, config.type === 'web' ? browser(selected) : preview(selected), controls);
  }
  return node;
}
function filmstrip() {
  const node = el('div', `filmstrip filmstrip-${config.type}`);
  const screens = config.flows.find(flow => flow.id === selectedFlow).screens;
  galleryLabel = copy(`flow.${selectedFlow}.body`);
  // Skip the flow note when it only repeats the explore guidance above.
  if (text(`flow.${selectedFlow}.body`) === text('explore.body') && config.flows.length === 1) galleryLabel.hidden = true;
  flowCards = cards(screens, true);
  node.append(el('p', 'label', config.type === 'gallery' ? 'PAGES / SELECT A SCENE' : 'FLOW GALLERY'), galleryLabel, flowCards);
  return node;
}
function prototypeExplore() {
  const node = el('section', 'proto-explore');
  node.append(el('p', 'label', '01 / EXPLORE THE PROTOTYPE'), el('h2', '', text('explore.title')), copy('explore.body'));
  if (config.type === 'mobile' && config.flows.length > 1) node.append(flowSwitcher());
  if (config.type === 'web') node.append(navigator(allScreens()));
  node.append(stage());
  if (config.type !== 'web') node.append(filmstrip());
  if (config.type === 'gallery') node.append(rationale());
  if (config.type === 'web') {
    node.append(rationale(), explanation('INTERACTION GUIDE', 'guide.title', 'guide.body'));
    if (config.links?.length) {
      const nav = el('nav', 'navigation');
      for (const item of config.links) nav.append(link(text(`link.${item.id}`, item.id), item.href, 'pill'));
      node.append(nav);
    }
  }
  return node;
}
function prototypeContext() {
  const node = el('section', 'proto-context');
  node.append(el('p', 'label', '02 / CONTEXT & DECISION'), explanation('CONTEXT', 'context.title', 'context.body'), explanation('DESIGN DECISION', 'decision.title', 'decision.body'));
  return node;
}
function footer() {
  const node = el('footer', 'footer');
  node.append(link('← BACK TO PROJECTS', '../', 'label'), link(view === 'case' ? 'Explore the prototype ↗' : 'Read case study ↗', view === 'case' ? './' : 'case-study.html', 'action'));
  return node;
}
function section(label, key) {
  const node = el('section', 'proto-explore');
  node.append(el('p', 'label', label), el('h2', '', text(key)));
  return node;
}
function moment(screen, label, titleKey, bodyKey, size = 'medium') {
  const node = el('figure', `moment moment-${size}`);
  node.append(preview(screen, true), el('p', 'label', label), el('h3', '', text(titleKey)), copy(bodyKey));
  return node;
}
function stateCard(state, index) {
  const node = el('article', 'state-card');
  const body = el('div', 'state-copy');
  body.append(el('p', 'panel-label', `STATE / 0${index + 1}`), el('h3', '', text(`case.state${index + 1}.title`)));
  for (const [label, key] of [['TRIGGER', 'trigger'], ['RESPONSE', 'response'], ['PURPOSE', 'purpose']]) {
    const item = copy(`case.state${index + 1}.${key}`);
    item.prepend(el('p', 'state-term', label));
    body.append(item);
  }
  node.append(preview(state.id, true, true), body);
  return node;
}
// Case study: one research-led story shared by every project.
function decisions() {
  const node = el('ol', 'decisions');
  for (let i = 1; i <= 3; i++) {
    const item = el('li', 'decision');
    const body = el('div', 'decision-copy');
    body.append(el('h3', '', text(`case.decision${i}.title`)), copy(`case.decision${i}.body`));
    item.append(el('span', 'decision-number', String(i).padStart(2, '0')), body);
    node.append(item);
  }
  return node;
}
function palette() {
  const node = el('div', 'palette');
  for (const line of text('case.system.palette').split('\n')) {
    const match = line.match(/^[-*]\s*`?(#[0-9a-f]{3,8})`?\s*(.*)$/i);
    if (!match) continue;
    const chip = el('div', 'swatch');
    const color = el('span', 'swatch-color');
    color.style.background = match[1];
    chip.append(color, el('span', 'swatch-name', match[2] || match[1]), el('span', 'swatch-hex', match[1].toUpperCase()));
    node.append(chip);
  }
  return node.children.length ? node : null;
}
function finalScreens(node) {
  if (config.type === 'mobile') {
    const stageNode = el('div', 'stage stage-mobile stage-case');
    const side = el('div', 'stage-side');
    side.append(explanation('FLOW RATIONALE', 'case.flow.title', 'case.flow.body'), link('프로토타입 탐색 ↗', './', 'action'));
    stageNode.append(el('p', 'label', `KEY EXPERIENCE / ${config.width} × ${config.height}`), device(selected), side);
    const keyCards = cards(config.keyScreens, true);
    keyCards.classList.add('key-cards');
    node.append(stageNode, keyCards);
  } else if (config.type === 'gallery') {
    const pairNode = el('div', 'moment-pair');
    pairNode.append(moment(config.keyScreens[0], '01 / BEFORE', 'case.before.title', 'case.before.body'), moment(config.keyScreens.at(-1), '02 / AFTER', 'case.after.title', 'case.after.body'));
    node.append(moment(selected, 'KEY EXPERIENCE', 'case.hero.title', 'case.hero.body', 'large'), pairNode);
  } else {
    const states = el('div', 'state-cards');
    (config.webStates || []).forEach((state, index) => states.append(stateCard(state, index)));
    node.append(browser(selected), states);
  }
}
function caseStudy() {
  const sections = [
    ['OUTCOME', 'case.outcome.title', node => {
      node.classList.add('outcome');
      node.append(copy('case.outcome.body'));
    }],
    ['PROBLEM', 'case.problem.title', node => node.append(explanation('USER NEED', 'case.need.title', 'case.need.body'), explanation('DESIGN QUESTION', 'case.question.title', 'case.question.body'))],
    ['RESEARCH', 'case.research.title', node => node.append(explanation('METHOD', 'case.method.title', 'case.method.body'), explanation('KEY FINDINGS', 'case.findings.title', 'case.findings.body'))],
    ['KEY DECISIONS', 'case.decisions.title', node => node.append(decisions())],
    ['FINAL SCREENS', 'case.experience.title', finalScreens],
    ['IMPACT', 'case.impact.title', node => node.append(copy('case.impact.body'))],
    ['LEARNINGS', 'case.learnings.title', node => node.append(copy('case.learnings.body'))],
    ['DESIGN SYSTEM', 'case.system.title', node => {
      const chips = palette();
      if (chips) node.append(chips);
      node.append(copy('case.system.body'));
      if (config.designSystem) node.append(link('디자인 시스템 보드 열기 ↗', config.designSystem, 'action'));
    }],
  ];
  return sections.flatMap(([name, key, fill], index) => {
    const node = section(`${String(index + 1).padStart(2, '0')} / ${name}`, key);
    fill(node);
    return index ? [rule(), node] : [node];
  });
}
window.addEventListener('message', event => {
  if (event.origin !== location.origin || ![...frames].some(frame => frame.contentWindow === event.source)) return;
  if (event.data?.type === 'portfolio:screen') updateSelection(event.data.screen, false);
  if (event.data?.type === 'portfolio:ready') event.source.postMessage({type:'portfolio:select',screen:selected,theme},location.origin);
});

async function renderProjects() {
  const response = await fetch('./shared/projects.json');
  if (!response.ok) throw new Error('프로젝트 목록을 불러올 수 없습니다.');
  const projects = await response.json();
  const entries = await Promise.all(projects.map(async project => {
    const response = await fetch(`./${project}/content.md`,{cache:'no-cache'});
    if (!response.ok) throw new Error(`${project} 콘텐츠를 불러올 수 없습니다.`);
    return [project, parseContent(await response.text())];
  }));
  const node = el('main','shell editorial index-page');
  const head = el('header','shell-header');
  head.append(el('p','','RESEARCH / PROTOTYPE LIBRARY'),link('ABOUT','#about'));
  const intro = el('section','proto-intro');
  intro.append(el('p','label',`SELECTED WORK · ${String(projects.length).padStart(2,'0')} PROJECTS`),el('h1','','Projects'),el('p','index-lead','지난 UI/UX 작업을 실제로 눌러 볼 수 있는 프로토타입으로 복원하고, 각 설계의 배경과 결정을 케이스 스터디로 정리했습니다.'));
  const list = el('ol','project-list');
  // Promise.all keeps the registry order.
  for (const [index,[project,c]] of entries.entries()) {
    const item = el('li','project-row');
    const body = el('div','project-copy');
    const title = el('h2');
    title.append(link(c.title,`./${project}/`));
    const links = el('div','project-links');
    links.append(link('Prototype ↗',`./${project}/`),link('Case study ↗',`./${project}/case-study.html`));
    body.append(el('p','label',c.scope || ''),title,el('p','project-summary',c.summary || ''),links);
    item.append(el('span','project-number',String(index+1).padStart(2,'0')),body);
    list.append(item);
  }
  const about = el('section','proto-intro about');
  about.id = 'about';
  about.append(el('p','label','ABOUT THIS ARCHIVE'),el('h2','','디자인과 프로토타입을 함께'),el('p','index-lead','프로젝트의 실제 화면을 탐색하고, 각 설계의 배경과 의도를 함께 살펴보세요.'));
  node.append(head,rule(),intro,list,rule(),about);
  app.replaceChildren(node);
}
async function start() {
  if (view === 'projects') return renderProjects();
  const responses = await Promise.all([fetch('project.json'),fetch('content.md',{cache:'no-cache'})]);
  if (responses.some(response => !response.ok)) throw new Error('프로젝트 설정 또는 content.md를 불러올 수 없습니다.');
  config = await responses[0].json();
  content = parseContent(await responses[1].text());
  selected = config.defaultScreen;
  selectedFlow = config.flows.find(flow => flow.screens.includes(selected))?.id || config.flows[0].id;
  document.title = `${text('title')} · ${view === 'case' ? 'UX portfolio' : 'Prototype'}`;
  const node = el('main',`shell editorial ${view === 'case' ? 'portfolio-page' : 'prototype-page'}`);
  node.append(header(),rule(),pageIntro(),rule());
  if (view === 'case') node.append(...caseStudy());
  else node.append(prototypeExplore(),rule(),prototypeContext());
  node.append(rule(),footer());
  app.replaceChildren(node);
  updateSelection(selected,false);
}
start().catch(error => {
  const node = el('main','shell');
  const message = el('div','error');
  message.append(el('h2','','페이지를 불러오지 못했어요'),el('p','',error.message),el('p','','로컬에서는 HTTP 서버로 열어 주세요. GitHub에서는 콘텐츠 파일의 제목과 항목 ID를 확인해 주세요.'),link('기존 프로토타입 열기','prototype.html','action'));
  node.append(message);
  app.replaceChildren(node);
  console.error(error);
});
