import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {parseContent,safeHref} from '../shared/content.mjs';
const originalCommit = 'c3ad5a70d8021e80b68615a2db8136ce43a89fcb';

test('글과 항목 제목을 수정해도 같은 ID에서 읽고 긴 문단을 보존한다',()=>{
  const result=parseContent('## 바뀐 이름 <!-- title -->\n\nORBIT\n\n## 소개 <!-- summary -->\n\n첫 문단\n\n두 번째 **문단**\n');
  assert.equal(result.title,'ORBIT');
  assert.equal(result.summary,'첫 문단\n\n두 번째 **문단**');
  assert.equal(parseContent('## 이름 <!-- title -->\n\n예시\n## 소개 <!-- summary -->\n').summary,'');
});
test('중복 항목과 이름 누락은 오류로 표시하고 위험한 링크는 차단한다',()=>{
  assert.throws(()=>parseContent('## 이름 <!-- title -->\nA\n## 이름 <!-- title -->\nB'),/중복/);
  assert.throws(()=>parseContent('## 소개 <!-- summary -->\nA'),/이름/);
  for(const href of ['javascript:alert(1)','data:text/html,test','//example.com','java\nscript:alert(1)','\\example.com'])assert.equal(safeHref(href),null);
  assert.equal(safeHref('docs/research.pdf'),'docs/research.pdf');
  assert.equal(safeHref('https://example.com/research'),'https://example.com/research');
});
const projects=JSON.parse(fs.readFileSync(new URL('../shared/projects.json',import.meta.url),'utf8'));
test('전체 프로젝트의 플로우·콘텐츠·컴포넌트·진입점이 서로 연결된다',()=>{
  assert.equal(projects.length,10);
  for(const project of projects){
    const dir=new URL(`../${project}/`,import.meta.url);
    const config=JSON.parse(fs.readFileSync(new URL('project.json',dir),'utf8'));
    const fields=parseContent(fs.readFileSync(new URL('content.md',dir),'utf8'));
    const screens=[...new Set(config.flows.flatMap(f=>f.screens))];
    assert.ok(screens.includes(config.defaultScreen),project);
    for(const key of config.keyScreens)assert.ok(screens.includes(key),`${project}: ${key}`);
    for(const screen of screens){assert.ok(fields[`screen.${screen}.title`],`${project}: ${screen}`);}
    for(const file of ['index.html','case-study.html',config.prototype])assert.ok(fs.statSync(new URL(file,dir)).size>0);
    if(config.component){
      assert.ok(fs.statSync(new URL(config.component+'.dc.html',dir)).size>0);
      assert.ok(fs.statSync(new URL('viewer.html',dir)).size>0);
    }
    for(const item of config.links||[])assert.ok(fs.statSync(new URL(item.href,dir)).size>0);
  }
});
test('기존 전체 프로토타입과 화면 구현 파일은 보존된다',()=>{
  for(const project of projects.filter(p=>p!=='cuppo')){
    const original=execFileSync('git',['show',`${originalCommit}:${project}/index.html`]);
    assert.deepEqual(fs.readFileSync(new URL(`../${project}/prototype.html`,import.meta.url)),original,project);
  }
  const originals=['orbit/ORBITScreen.dc.html','kiketch/KiketchScreen.dc.html','pico/PicoScreen.dc.html','reply/ReplyScreen.dc.html','winnus/WinnusScreenV2.dc.html','mathhero/MathHeroScreen.dc.html','cuppo/CuppoScreen.dc.html','cuppo/CUPPO Prototype.dc.html','lighthouse/three-d-stage.js','lighthouse/lighthouse-model.js'];
  for(const file of originals)assert.deepEqual(fs.readFileSync(new URL('../'+file,import.meta.url)),execFileSync('git',['show',`${originalCommit}:${file}`]),file);
  const redi=fs.readFileSync(new URL('../redi/RediScreen.dc.html',import.meta.url),'utf8');
  assert.ok(redi.includes("screen:this.props.screen || 'ob1'"));
  assert.ok(!redi.includes('<aside'));
  assert.ok(redi.includes('finish')||redi.includes('grid'));
});
