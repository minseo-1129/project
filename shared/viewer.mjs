// Runs inside a same-origin iframe; existing DC templates and assets stay intact.
const params = new URLSearchParams(location.search);
try {
  const response = await fetch('project.json');
  if (!response.ok) throw new Error('프로젝트 설정을 불러올 수 없습니다.');
  const config = await response.json();
  const screens = [...new Set(config.flows.flatMap(flow => flow.screens))];
  const requested = params.get('screen');
  const initial = screens.includes(requested) ? requested : config.defaultScreen;
  const readonly = params.has('readonly');
  const template = document.createElement('x-dc');
  template.innerHTML = `<div style="width:${config.width}px;height:${config.height}px;overflow:hidden"><dc-import name="${config.component}" screen="{{ screen }}" theme="{{ theme }}" key="{{ version }}" onNavigate="{{ navigate }}" hint-size="${config.width}px,${config.height}px"></dc-import></div>`;
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
} catch (error) {
  document.body.textContent = error.message;
  console.error(error);
}
