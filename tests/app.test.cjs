const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('index.html','utf8').split('<script>')[1].split('</script>')[0];
function app(saved={}){
  const nodes=new Map();
  function element(){return {value:'',textContent:'',innerHTML:'',style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},removeAttribute(){},querySelectorAll(){return []},scrollIntoView(){},click(){},append(){},remove(){}};}
  const document={getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id)},querySelectorAll(){return []},querySelector(){return element()},addEventListener(){},createElement:element,body:{dataset:{}},visibilityState:'visible'};
  const storage={...saved};
  const context=vm.createContext({document,window:{scrollTo(){},print(){}},navigator:{},localStorage:{getItem(k){return storage[k]??null},setItem(k,v){storage[k]=v}},FileReader:class{readAsText(file){this.result=file.content;this.onload();}},structuredClone,console,URL,Blob,setTimeout(){},clearTimeout(){},setInterval(){return 1},clearInterval(){},confirm(){return true}});
  vm.runInContext(source,context);
  return {run:code=>vm.runInContext(code,context),nodes,storage};
}
test('canonical library, durations and references are valid',()=>{
  const a=app(); assert.equal(a.run('LIB.length'),108);
  assert.equal(a.run('plan().blocks.reduce((n,b)=>n+b.min,0)'),90);
  assert.equal(a.run("PLANS.find(p=>p.id==='p2').blocks.reduce((n,b)=>n+b.min,0)"),120);
  assert.equal(a.run("PLANS.find(p=>p.id==='setting90').blocks.reduce((n,b)=>n+b.min,0)"),90);
  assert.equal(a.run('PLANS.every(p=>p.blocks.every(b=>exById(b.exId)))'),true);
  assert.equal(a.run('JSON.stringify(SEED_LIB)===JSON.stringify('+fs.readFileSync('library.json','utf8')+'.library)'),true);
});
test('valid full backup round-trips and malformed data is rejected',()=>{
 const a=app();assert.equal(a.run('validateBackup({library:LIB,plans:PLANS}).library.length'),108);
 for(const input of ['{}','{library:[{id:"bad\\\""}]}','{plans:[{id:"p",name:"x",blocks:[{exId:"a",min:-1}]}]}','{library:[],plans:[{id:"p",name:"x",blocks:[],players:100}]}'])assert.throws(()=>a.run(`validateBackup(${input})`));
 assert.throws(()=>a.run('validateBackup({library:[LIB[0],LIB[0]]})'));
});
test('timer catches up over several blocks after backgrounding',()=>{
 const a=app();a.run('buildRun();goTo(0);play();deadline=Date.now()-370000;step()');
 assert.equal(a.run('idx'),2);assert.ok(a.run('remaining')<=710&&a.run('remaining')>=709);assert.equal(a.run('running'),true);
});
test('pause, resume and navigation keep a single deadline',()=>{
 const a=app();a.run('buildRun();goTo(0);play();deadline=Date.now()+123000;pause()');assert.equal(a.run('remaining'),123);assert.equal(a.run('running'),false);
 a.run('play();goTo(1)');assert.equal(a.run('remaining'),360);assert.ok(a.run('Math.abs(deadline-Date.now()-360000)<100'));
});
test('completion is stable and restart starts at first block',()=>{
 const a=app();a.run('buildRun();goTo(runBlocks.length-1);play();deadline=Date.now()-1000;step()');
 assert.equal(a.run('completed'),true);assert.equal(a.run('running'),false);assert.equal(a.run('remaining'),0);assert.equal(a.nodes.get('playBtn').textContent,'Restart');
 a.run('play()');assert.equal(a.run('idx'),0);assert.equal(a.run('remaining'),300);assert.equal(a.run('running'),true);
});
test('old saved drills migrate without overwriting personal edits or resurrecting deleted originals',()=>{
 const old=JSON.parse(fs.readFileSync('tests/legacy-backup.json','utf8'));
 old.library=old.library.filter(e=>e.id!=='bab1');old.library.find(e=>e.id==='tc3').cue='My cue';old.library[0].fav=true;
 const a=app({'bvt.lib':JSON.stringify(old.library),'bvt.plans':JSON.stringify(old.plans)});
 assert.equal(a.run("exById('bab1')"),undefined);assert.equal(a.run("exById('tc3').cue"),'My cue');assert.equal(a.run("exById('tc3').diagram"),'setting');assert.equal(a.run('LIB[0].fav'),true);assert.equal(a.run("!!exById('new8')"),true);
 const b=app({...a.storage});assert.equal(b.run('LIB.length'),a.run('LIB.length'));
});
test('run instructions are a snapshot of the selected session',()=>{
 const a=app();a.run("buildRun();LIB[0].name='Changed'");assert.notEqual(a.run('runBlocks[0].ex.name'),'Changed');
});
test('all selected diagrams exist and unknown diagrams stay hidden',()=>{
 const a=app();assert.equal(a.run("LIB.every(e=>e.diagram==='court'||!!DIAGRAMS[e.diagram])"),true);
 assert.equal(a.run("diagramFor({diagram:'court'})"),'');assert.equal(a.run("diagramFor({diagram:'unknown'})"),'');
 for(const key of a.run('Object.keys(DIAGRAMS)'))assert.ok(a.run(`DIAGRAMS[${JSON.stringify(key)}]`).includes('<title>'));
});
test('saved empty library and plan arrays recover to valid defaults',()=>{
 const a=app({'bvt.lib':'[]','bvt.plans':'[]'});assert.equal(a.run('LIB.length'),108);assert.ok(a.run('PLANS.length')>0);
});
test('court splitting never loses a pair',()=>{
 const a=app();for(let p=2;p<=40;p++)for(let c=1;c<=6;c++)assert.equal(a.run(`distribute(${p},${c}).per.reduce((n,v)=>n+v,0)`),Math.floor(p/2));
});
if(process.env.EXPORT_DIAGRAMS){const a=app();fs.writeFileSync('/tmp/beach-diagrams.json',a.run('JSON.stringify(DIAGRAMS)'));}

test('failed import leaves library and sessions unchanged',()=>{
 const a=app(); const before=a.run('JSON.stringify({library:LIB,plans:PLANS})');
 a.run(`document.getElementById('importFile').onchange({target:{files:[{content:JSON.stringify({plans:[{id:'badref',name:'Broken reference',blocks:[{exId:'missing',min:5}]}]})}],value:'backup.json'}})`);
 assert.equal(a.run('JSON.stringify({library:LIB,plans:PLANS})'),before);
});
test('valid import merges records and switches to imported plan',()=>{
 const a=app();a.run(`document.getElementById('importFile').onchange({target:{files:[{content:JSON.stringify({library:[{...LIB[0],name:'Updated import'}],plans:[{id:'imported',name:'Imported plan',blocks:[{exId:LIB[0].id,min:7}]}]})}],value:'backup.json'}})`);
 assert.equal(a.run('LIB[0].name'),'Updated import');assert.equal(a.run('plan().id'),'imported');assert.equal(a.run('plan().players'),8);
});
test('Start session starts the clock and preserves run squad when selection changes',()=>{
 const a=app();a.run("document.getElementById('startBtn').onclick();activePlan='np1';renderRunSquad()");
 assert.equal(a.run('running'),true);assert.ok(a.nodes.get('runSquad').innerHTML.includes('<b>8</b> players'));
});
test('storage failures retain edits in memory and show a backup warning',()=>{
 const a=app();a.run("localStorage.setItem=()=>{throw Error('quota')};store.set('test',{value:42})");
 assert.equal(a.run("store.get('test').value"),42);assert.match(a.nodes.get('toast').textContent,/backup/);
});

test('generator has a staged, topic-linked progression with exact durations',()=>{
 const a=app();
 for(const topic of ['mixed','reception','setting','attack','block','transition','defense']){
  for(const total of [45,60,90,120])for(let n=0;n<20;n++){
   const p=a.run(`createGeneratedPlan('${topic}',${total},14,2)`);
   assert.equal(p.blocks.reduce((sum,b)=>sum+b.min,0),total);
   assert.equal(new Set(p.blocks.map(b=>b.exId)).size,7);
   assert.deepEqual(Array.from(p.blocks,b=>b.stage),Array.from(a.run('STAGES')));
   for(const [i,key] of ['simple','decision','complex','game'].entries())assert.equal(a.run(`TOPIC_POOLS['${p.topic}']['${key}'].includes('${p.blocks[i+1].exId}')`),true);
   assert.equal(a.run(`exById('${p.blocks[0].exId}').phase`),'Warm-up');
   assert.equal(p.blocks[5].exId,'new8'); // normal scoring, no artificial contact limits
   assert.equal(a.run(`exById('${p.blocks[6].exId}').phase`),'Cool-down');
   assert.ok(p.blocks.every(b=>b.min>=1&&b.min<=60));
   assert.equal(a.run(`validateBackup({plans:[${JSON.stringify(p)}]}).plans.length`),1);
  }
 }
});
test('generator preserves sessions, rejects invalid settings and handles missing drills atomically',()=>{
 const a=app(),before=a.run('JSON.stringify(PLANS)');
 assert.equal(a.run("createGeneratedPlan('block',60,4,6).courts"),1);
 for(const args of ["'wrong',90,14,2","'setting',61,14,2","'setting',60,2,2","'setting',60,14,0"])assert.throws(()=>a.run(`createGeneratedPlan(${args})`));
 a.run("LIB=LIB.filter(e=>!TOPIC_POOLS.block.simple.includes(e.id))");
 assert.throws(()=>a.run("createGeneratedPlan('block',90,14,2)"));
 assert.equal(a.run('JSON.stringify(PLANS)'),before);
});
test('German preference persists without modifying saved content',()=>{
 const a=app(),before=a.run('JSON.stringify({library:LIB,plans:PLANS})');
 a.run("document.getElementById('language').onchange({target:{value:'de'}})");
 assert.equal(a.run("t('Reception')"),'Annahme');
 assert.equal(a.run("t('4 · Linked complex drill')"),'4 · Komplexe Übungskette');
 assert.equal(a.run('JSON.stringify({library:LIB,plans:PLANS})'),before);
 const b=app({...a.storage});assert.equal(b.run('language'),'de');
 assert.match(b.run("createGeneratedPlan('setting',90,14,2).name"),/Zuspiel/);
});
test('fresh sessions default to eight players and one court; saved settings survive',()=>{
 const a=app();assert.equal(a.run('plan().players'),8);assert.equal(a.run('plan().courts'),1);
 a.run("document.getElementById('newPlan').onclick()");assert.equal(a.run('plan().players'),8);assert.equal(a.run('plan().courts'),1);
 a.run('plan().players=12;plan().courts=2;savePlans()');
 const b=app({...a.storage});assert.equal(b.run('plan().players'),12);assert.equal(b.run('plan().courts'),2);
 const manifest=JSON.parse(fs.readFileSync('version.json','utf8'));assert.equal(manifest.version,a.run('APP_VERSION'));
});

test('old 14/2 defaults migrate once while other settings and later overrides survive',()=>{
 const saved=[{id:'old',name:'Old default',players:14,courts:2,blocks:[{exId:'wm1',min:5}]},{id:'custom',name:'Custom',players:10,courts:2,blocks:[]}];
 const a=app({'bvt.plans':JSON.stringify(saved),'bvt.content.v2':'true'});
 assert.equal(a.run('plan().players'),8);assert.equal(a.run('plan().courts'),1);
 assert.equal(a.run("PLANS.find(p=>p.id==='custom').players"),10);assert.equal(a.run("PLANS.find(p=>p.id==='custom').courts"),2);
 a.run('plan().players=14;plan().courts=2;savePlans()');
 const b=app({...a.storage});assert.equal(b.run('plan().players'),14);assert.equal(b.run('plan().courts'),2);
});
test('warm-up upgrade adds new games once, preserves edits/deletions and localizes display only',()=>{
 const old=JSON.parse(fs.readFileSync('tests/legacy-backup.json','utf8'));
 const a=app({'bvt.lib':JSON.stringify(old.library),'bvt.content.v2':'true','bvt.language':'"de"'});
 assert.equal(a.run("LIB.filter(e=>e.id.startsWith('wu')).length"),6);
 assert.equal(a.run("displayExercise(exById('wuhands')).name"),'Zwei einhändige Kontakte + rüber');
 assert.equal(a.run("exById('wuhands').name"),'Two one-handed touches + send');
 a.run("exById('wuhands').cue='Mein Hinweis';exById('wuhands').fav=true;LIB=LIB.filter(e=>e.id!=='wu3m');saveLib()");
 const b=app({...a.storage});assert.equal(b.run("exById('wu3m')"),undefined);
 assert.equal(b.run("displayExercise(exById('wuhands')).cue"),'Mein Hinweis');assert.equal(b.run("exById('wuhands').fav"),true);
 assert.equal(b.run("LIB.filter(e=>e.id==='wuhands').length"),1);
});
test('every library exercise can expand in English and German without a runtime error',()=>{
 const a=app();for(const lang of ['en','de'])a.run(`language='${lang}';for(const e of LIB){libOpenId=e.id;renderLib();}`);
 assert.match(a.nodes.get('libList').innerHTML,/Baggern und Position wechseln/);
});
