// Runs inside a same-origin iframe; existing DC templates and assets stay intact.
const params = new URLSearchParams(location.search);
try {
  const response = await fetch('project.json');
  if (!response.ok) throw new Error('프로젝트 설정을 불러올 수 없습니다.');
  const config = await response.json();
  for (const flow of config.flows) if (!flow.screens && flow.groups) flow.screens = flow.groups.flatMap(group => group.screens);
  const screens = [...new Set(config.flows.flatMap(flow => flow.screens))];
  const requested = params.get('screen');
  const initial = screens.includes(requested) ? requested : config.defaultScreen;
  const readonly = params.has('readonly');
  const template = document.createElement('x-dc');
  // innerHTML lowercases attribute names, so camelCase props use the runtime's own encoding (sc-camel-on-navigate → onNavigate).
  template.innerHTML = `<div style="width:${config.width}px;height:${config.height}px;overflow:hidden"><dc-import name="${config.component}" screen="{{ screen }}" theme="{{ theme }}" key="{{ version }}" sc-camel-on-navigate="{{ navigate }}" hint-size="${config.width}px,${config.height}px"></dc-import></div>`;
  const logic = document.createElement('script');
  logic.type = 'text/x-dc';
  logic.setAttribute('data-dc-script','');
  logic.setAttribute('data-props','{}');
  logic.textContent = `class Component extends DCLogic {
    state = {screen:${JSON.stringify(initial)}, theme:'light', version:0};
    navigate = screen => {
      if (!${JSON.stringify(screens)}.includes(screen)) return;
      this.setState({screen});
      window.parent.postMessage({type:'portfolio:screen',screen},location.origin);
    };
    componentDidMount() {
      this.receive = event => {
        if (event.origin !== location.origin || event.source !== window.parent) return;
        if (event.data?.type === 'portfolio:select' && ${JSON.stringify(screens)}.includes(event.data.screen)) {
          this.setState({screen:event.data.screen,theme:event.data.theme || this.state.theme,version:this.state.version+1});
        } else if (event.data?.type === 'portfolio:theme' && ['light','dark'].includes(event.data.theme)) this.setState({theme:event.data.theme});
      };
      window.addEventListener('message',this.receive);
      ${readonly ? '' : "window.parent.postMessage({type:'portfolio:ready'},location.origin);"}
    }
    componentWillUnmount() { window.removeEventListener('message',this.receive); }
    renderVals() { return {...this.state,navigate:this.navigate}; }
  }`;
  document.body.append(template,logic);
  const style = document.createElement('style');
  style.textContent = 'html,body{margin:0!important;padding:0!important;overflow:hidden!important}';
  document.head.append(style);
  const runtime = document.createElement('script');
  runtime.src = './support.js';
  runtime.onerror = () => { document.body.textContent = '프로토타입 실행 파일을 불러올 수 없습니다.'; };
  document.head.append(runtime);
  // Observe native DC navigation without editing or replacing its logic.
  const announce = new MutationObserver(() => {
    if (readonly || !window.DCLogic || window.__portfolioBridge) return;
    window.__portfolioBridge = true;
    const original = window.DCLogic.prototype.setState;
    window.DCLogic.prototype.setState = function(update, callback) {
      original.call(this,update,callback);
      const screen = this.state.screen || this.state.cur || this.state.current;
      if (screens.includes(screen)) window.parent.postMessage({type:'portfolio:screen',screen},location.origin);
    };
    announce.disconnect();
  });
  announce.observe(document.body,{childList:true,subtree:true});
  // "hotspots" in project.json makes static screens tappable: {"<screen>|*": [{"text": "…", "to": "<screen>"}]}.
  // A tap on an element whose text starts with "text" asks the portfolio page to open "to".
  if (config.hotspots && !readonly) {
    let current = initial;
    window.addEventListener('message', event => { if (event.data?.type === 'portfolio:select') current = event.data.screen; });
    const bind = () => {
      const rules = [...(config.hotspots[current] || []), ...(config.hotspots['*'] || [])];
      for (const leaf of document.querySelectorAll('body *')) {
        if (leaf.children.length || leaf.dataset.hotspot === current) continue;
        const text = (leaf.textContent || '').trim();
        const rule = text && rules.find(item => item.exact ? text === item.text : text.startsWith(item.text));
        if (!rule || !screens.includes(rule.to)) continue;
        const target = leaf.parentElement && leaf.parentElement.textContent.trim().length < text.length + 40 ? leaf.parentElement : leaf;
        leaf.dataset.hotspot = current;
        target.style.cursor = 'pointer';
        target.onclick = event => { event.stopPropagation(); current = rule.to; window.parent.postMessage({type:'portfolio:navigate',screen:rule.to},location.origin); };
      }
    };
    let pending = 0;
    new MutationObserver(() => { cancelAnimationFrame(pending); pending = requestAnimationFrame(bind); }).observe(document.body,{childList:true,subtree:true,characterData:true});
  }
} catch (error) {
  document.body.textContent = error.message;
  console.error(error);
}
