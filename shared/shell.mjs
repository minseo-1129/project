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
function intro() {
  const node = el('section', 'intro');
  const main = el('div', 'intro-copy');
  main.append(el('p', 'label', `${view === 'case' ? 'UX PORTFOLIO' : 'PROTOTYPE'} SHELL / ${config.type.toUpperCase()}`), el('h1', '', text('title')), copy('summary'));
  const metadata = el('dl', 'metadata');
  for (const key of ['role', 'period', 'scope']) {
    const item = el('div');
    item.append(el('dt', '', key), el('dd', '', text(key, '확인 예정')));
    metadata.append(item);
  }
  node.append(main, metadata);
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
function prototypeHeading() {
  const node = el('section', 'prototype-heading');
  node.append(el('p', 'label', config.type.toUpperCase() + ' / INTERACTIVE PROTOTYPE'), el('h1', '', text('title')), copy('summary'));
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
  selectedPanel = el('div', 'panel');
  selectedPanel.setAttribute('aria-live', 'polite');
  selectedPanel.append(el('p', 'panel-label', config.type === 'gallery' ? 'SELECTED SCENE' : 'SELECTED SCREEN / DESIGN RATIONALE'), el('h3'), el('div', 'copy'));
  return selectedPanel;
}
function cards(screens) {
  const node = el('div', 'screen-cards');
  for (const screen of screens) {
    const card = el('button', 'screen-card');
    card.type = 'button';
    card.dataset.screen = screen;
    card.setAttribute('aria-pressed', String(screen === selected));
    card.setAttribute('aria-label', `${text(`screen.${screen}.title`, screen)} 화면 선택`);
    card.append(preview(screen, true), el('span', 'panel-label', screen.toUpperCase()), el('h3', '', text(`screen.${screen}.title`, screen)));
    const description = el('div', 'copy');
    renderMarkdown(text(`screen.${screen}.caption`, screenText(screen)), description);
    card.append(description);
    card.addEventListener('click', () => updateSelection(screen));
    screenControls.push(card);
    node.append(card);
  }
  return node;
}
function flowNavigation() {
  const node = el('div', 'navigation');
  node.setAttribute('aria-label', '프로토타입 플로우 선택');
  const list = navigator(config.flows.find(flow => flow.id === selectedFlow).screens, 'screen-list');
  const groups = [];
  for (const flow of config.flows) {
    const button = el('button', 'pill', text(`flow.${flow.id}.title`, flow.id));
    button.type = 'button';
    button.setAttribute('aria-pressed', String(flow.id === selectedFlow));
    button.addEventListener('click', () => {
      selectedFlow = flow.id;
      groups.forEach(([other, id]) => other.setAttribute('aria-pressed', String(id === selectedFlow)));
      list.replaceChildren(...navigator(flow.screens, 'screen-list').children);
      renderMarkdown(text(`flow.${flow.id}.body`), galleryLabel);
      if (flowCards) {
        const replacement = cards(flow.screens);
        flowCards.replaceWith(replacement);
        flowCards = replacement;
        screenControls = screenControls.filter(control => control.isConnected);
      }
      updateSelection(flow.screens[0]);
    });
    groups.push([button, flow.id]);
    node.append(button);
  }
  const wrapper = el('div', 'stack');
  const details = el('details','screen-details');
  details.append(el('summary','','전체 화면 선택'),list);
  wrapper.append(node, details);
  return wrapper;
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
function prototypeExperience() {
  const node = el('div', `${config.type}-layout`);
  if (config.type === 'mobile') {
    const live = el('div', 'live-panel');
    live.append(el('p', 'label', `LIVE PREVIEW / ${config.width} × ${config.height}`), device(selected), transport());
    if (config.themes) live.append(themePicker());
    const gallery = el('div', 'stack');
    galleryLabel = copy(`flow.${selectedFlow}.body`);
    flowCards = cards(config.flows.find(flow => flow.id === selectedFlow).screens);
    gallery.append(el('p', 'label', 'FULL FLOW'), flowNavigation(), galleryLabel, flowCards);
    live.append(rationale());
    node.append(live, gallery);
  } else if (config.type === 'gallery') {
    const main = el('div', 'stack');
    const player = el('div', 'landscape-player');
    counter = el('p', 'label');
    player.append(counter, preview(selected));
    main.append(player, cards(allScreens()));
    const side = el('div', 'stack');
    side.append(el('p', 'label', 'PAGES / SELECT A SCENE'), navigator(allScreens()), rationale());
    node.append(main, side);
  } else {
    const main = el('div', 'stack');
    main.append(browser(selected), navigator(allScreens()));
    const side = el('div', 'stack');
    side.append(panel('INTERACTION GUIDE', 'guide.title', 'guide.body'));
    if (config.links?.length) {
      const nav = el('nav', 'stack');
      for (const item of config.links) nav.append(link(text(`link.${item.id}`, item.id), item.href, 'pill'));
      side.append(nav);
    }
    node.append(main, side);
  }
  return node;
}
function footer() {
  const node = el('footer', 'footer');
  node.append(link('← BACK TO PROJECTS', '../', 'label'), link(view === 'case' ? 'Explore the prototype ↗' : 'Read case study ↗', view === 'case' ? './' : 'case-study.html', 'action'));
  return node;
}
function section(label, key) {
  const node = el('section', 'section');
  node.append(rule(), el('p', 'label', label), el('h2', '', text(key)));
  return node;
}
function pair(a, b) { const node = el('div', 'two-cols'); node.append(a, b); return node; }
function moment(screen, label, titleKey, bodyKey) {
  const node = el('figure', 'moment');
  node.append(preview(screen, true), el('p', 'label', label), el('h3', '', text(titleKey)), copy(bodyKey));
  return node;
}
function caseStudy() {
  const problem = section('01 / PROBLEM & CONTEXT', 'case.problem.title');
  problem.append(pair(panel('USER NEED','case.need.title','case.need.body'), panel('DESIGN QUESTION','case.question.title','case.question.body')));
  const evidence = section('02 / EVIDENCE & INSIGHT', 'case.evidence.title');
  const interpretation = el('div', 'stack');
  interpretation.append(panel('INSIGHT','case.insight.title','case.insight.body'), panel('DESIGN IMPLICATION','case.implication.title','case.implication.body'));
  evidence.append(pair(moment(config.evidenceScreen || config.keyScreens[0], 'SOURCE / HTML IMPLEMENTATION', 'case.source.title', 'case.source.body'), interpretation));
  const direction = section('03 / DESIGN DIRECTION', 'case.direction.title');
  const steps = el('div', 'flow-steps');
  for (let i=1; i<=4; i++) {
    const step = el('div', 'flow-step');
    step.append(el('p','panel-label',`0${i}`), el('h3','',text(`case.step${i}.title`)),copy(`case.step${i}.body`));
    steps.append(step);
  }
  direction.append(steps,panel('KEY DESIGN DECISION','case.decision.title','case.decision.body'));
  const experience = section('04 / EXPERIENCE DESIGN','case.experience.title');
  const layout = el('div', `experience-${config.type}`);
  if (config.type === 'mobile') {
    const live = el('div','live-panel');
    live.append(device(selected),link('프로토타입 탐색 ↗','./','action'));
    const story = el('div','stack');
    story.append(cards(config.keyScreens),panel('FLOW RATIONALE','case.flow.title','case.flow.body'));
    layout.append(live,story);
  } else if (config.type === 'gallery') {
    layout.append(moment(selected,'KEY EXPERIENCE','case.hero.title','case.hero.body'),pair(moment(config.keyScreens[0],'01 / BEFORE','case.before.title','case.before.body'),moment(config.keyScreens.at(-1),'02 / AFTER','case.after.title','case.after.body')));
  } else {
    const states = el('div','state-cards');
    for (const [index,state] of (config.webStates || []).entries()) {
      const card = el('article','state-card panel');
      card.append(preview(state.id,true,true),el('p','panel-label',`STATE / 0${index+1}`),el('h3','',text(`case.state${index+1}.title`)));
      for (const [label,key] of [['TRIGGER','trigger'],['RESPONSE','response'],['PURPOSE','purpose']]) {
        const body = copy(`case.state${index+1}.${key}`);
        body.prepend(el('p','',label));
        card.append(body);
      }
      states.append(card);
    }
    layout.append(browser(selected),states);
  }
  experience.append(layout);
  const validation = section('05 / VALIDATION & ITERATION','case.validation.title');
  validation.append(pair(panel('VALIDATION','case.check.title','case.check.body'),panel('ITERATION','case.iteration.title','case.iteration.body')));
  const outcome = section('06 / OUTCOME & REFLECTION','case.outcome.title');
  outcome.append(pair(panel('OUTCOME','case.result.title','case.result.body'),panel('REFLECTION','case.reflection.title','case.reflection.body')));
  return [problem,evidence,direction,experience,validation,outcome];
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
  const node = el('main','shell');
  const head = el('header','shell-header');
  head.append(el('p','','RESEARCH / PROTOTYPE LIBRARY'),link('ABOUT','#about'));
  node.append(head,rule(),el('p','label','PROJECTS'),el('h1','','Projects'));
  const grid = el('div','project-grid');
  await Promise.all(projects.map(async project => {
    const response = await fetch(`./${project}/content.md`,{cache:'no-cache'});
    if (!response.ok) throw new Error(`${project} 콘텐츠를 불러올 수 없습니다.`);
    const c = parseContent(await response.text());
    const card = el('article','project-card');
    const links = el('div','project-card-links');
    links.append(link('Prototype ↗',`./${project}/`),link('Case study ↗',`./${project}/case-study.html`));
    card.append(el('p','label',c.scope),el('h3','',c.title),el('p','',c.summary),links);
    // Preserve the registry order even when requests finish out of order.
    card.dataset.project = project;
    grid.append(card);
  }));
  for (const project of projects) grid.append(grid.querySelector(`[data-project="${project}"]`));
  const about = el('section','section about');
  about.id = 'about';
  about.append(rule(),el('p','label','ABOUT THIS ARCHIVE'),el('h2','','디자인과 프로토타입을 함께'),el('p','','프로젝트의 실제 화면을 탐색하고, 각 설계의 배경과 의도를 함께 살펴보세요.'));
  node.append(grid,about);
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
  const node = el('main',`shell ${view === 'case' ? 'portfolio-page' : 'prototype-page'}`);
  node.append(header(),rule());
  if (view === 'case') node.append(intro(),...caseStudy());
  else node.append(prototypeHeading(),prototypeExperience(),pair(panel('CONTEXT','context.title','context.body'),panel('DESIGN DECISION','decision.title','decision.body')));
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
