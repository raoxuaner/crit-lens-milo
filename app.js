import {drawing} from './drawing.js';
import {robotDemoId,robotIntent,robotParts,robotOptions,openRobotLab} from './robot.js';
import {createWorkflow, sanitizeStudio, roundId} from './workflow.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const uid=()=>globalThis.crypto?.randomUUID?.()||'id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={pointer:'<path d="M5 3l14 9-7 1-3 7z"/>',intent:'<rect x="3" y="3" width="12" height="13" rx="3"/><rect x="10" y="10" width="11" height="11" rx="3"/><path d="M15.5 13v5m-2.5-2.5h5"/>',image:'<rect x="3" y="4" width="18" height="16" rx="4"/><path d="m4 16 5-5 5 5 3-3 4 3m-5-10h6m-3-3v6"/>',text:'<path d="M4 5h16M12 5v15m-4 0h8M4 5v4m16-4v4"/>',comment:'<path d="M5 4h14a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-7l-5 4v-4H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M7 11h.1m5 0h.1m5 0h.1"/>',sticker:'<path d="M21 12a9 9 0 1 0-9 9h1l8-8Z"/><path d="M13 21v-5a3 3 0 0 1 3-3h5"/>',search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',collapse:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M14 4v16m-3-10-2 2 2 2"/>',settings:'<path d="m10 3-1 3-3 1-3 3 2 3-1 3 3 3 3-1 3 2 3-2 3-1 1-4-2-2V7l-3-2-3 1Z"/><circle cx="12" cy="12" r="3"/>',spark:'<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/><path d="m20 2 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z"/>',bulb:'<path d="M8 17c0-4-4-5-4-9a8 8 0 0 1 16 0c0 4-4 5-4 9ZM8 20h8m-6 3h4"/>',fit:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',jump:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><path d="M10 6h8v8M6 10v8h8"/>',user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',product:'<path d="m12 2 9 5v10l-9 5-9-5V7Zm0 0v10m-9-5 9 5 9-5m-9 5v10M7 5l9 5"/>',problem:'<path d="m10 3-8 15a2 2 0 0 0 2 3h16a2 2 0 0 0 2-3L14 3a2 2 0 0 0-4 0Z"/><path d="M12 8v6m0 3h.1"/>',features:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="m6 8 1 1 2-2m3 1h5m-11 5 1 1 2-2m3 1h5m-11 5h11"/>'};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]||icons.comment}</svg>`;
for(const name of ['collapseSidebar','settings','inspiration','assistant','fit','jump'])$('#'+name).innerHTML=icon({collapseSidebar:'collapse',settings:'settings',inspiration:'bulb',assistant:'spark',fit:'fit',jump:'jump'}[name]);
$('#searchIcon').innerHTML=icon('search');$$('[data-tool]').forEach(b=>b.innerHTML=icon(b.dataset.tool));
const itemTitles={comment:'Studio comment',text:'Canvas text',sticker:'Sticker',image:'Reference image'};
function fresh(kind='industrial',title){const arch=kind==='architecture';return {id:uid(),kind,title:title||(arch?'Community Threshold':'Desk Lamp Redesign'),target:arch?'Residents visiting a neighbourhood courtyard':'University students sharing a small desk',product:arch?'A sheltered community entrance':'A compact desk lamp',problem:arch?'A welcoming, step-free transition between street and courtyard':'Focused light without glare or a large footprint',features:arch?['Step-free access','Daylight','Sheltered waiting area']:['Adjustable direction','Warm light','Compact base'],progress:0,variant:0,sketchTab:'upload',sketchReady:false,description:arch?'A deep canopy and a clear, generous route.':'Tapered shade, slim stem and a stable round base.',changeRequest:'',changes:[],components:(arch?['Canopy','Entrance','Seating edge']:['Shade','Stem','Base']).map((name,i)=>({id:uid(),name,selected:i===0})),sizes:arch?{width:2400,height:2700,depth:1500}:{width:140,height:280,depth:90},componentSizes:{},cards:[{id:uid(),group:'keep',text:arch?'A continuous step-free route':'Preserve warm, focused light'},{id:uid(),group:'explore',text:arch?'Canopy depth and daylight':'A visible, adjustable joint'},{id:uid(),group:'constraints',text:arch?'Keep a clear entrance route':'Keep the shade within 140 mm'}],brief:'',alternativeCount:3,selected:[],branches:[],decisions:[],notes:[],sessions:[],transcript:'',events:[],collect:false,mode:'demo',lens:'intent',ai:null,images:{},items:[],positions:{},view:null,chat:[]};}
function freshRobot(title=robotIntent.title, demo=false){
  return Object.assign(fresh('robotics',title),structuredClone(robotIntent),{
    title,...(demo?{id:robotDemoId,progress:2,sketchReady:true}:{}),
    components:robotParts.map(([name],i)=>({id:uid(),name,selected:i===1})),cards:[]});
}
function migrate(old){const p=fresh(old.kind,old.title);p.problem=old.intent||p.problem;p.decisions=old.decisions||[];p.notes=old.notes||[];p.transcript=old.transcript||'';p.sessions=old.sessions||[];p.images=old.images||{};p.collect=!!old.collect;p.events=old.events||[];return p;}
const projectsKey='crit-lens-whiteboard-v2';
const activeProjectKey='crit-lens-whiteboard-active';
const robotIntroKey='crit-lens-robot-intro-v1';
let projects, active, robotIntroduced;
try{
  const stored=localStorage.getItem(projectsKey);
  if(stored===null){
    const legacy=JSON.parse(localStorage.getItem('crit-lens-v1'))||[];
    projects=legacy.length?legacy.map(migrate):[];
  }else{
    projects=JSON.parse(stored);
  }
  active=localStorage.getItem(activeProjectKey);
  robotIntroduced=localStorage.getItem(robotIntroKey)==='1';
}catch{}
if(!Array.isArray(projects))projects=[];
if(!robotIntroduced){
  if(!projects.some(project=>project.id===robotDemoId))projects.unshift(freshRobot(robotIntent.title,true));
  active=robotDemoId;
}
if(new URLSearchParams(location.search).get('demo')==='milo'){
  if(!projects.some(project=>project.id===robotDemoId))projects.unshift(freshRobot(robotIntent.title,true));
  active=robotDemoId;
}
let p=projects.find(project=>project.id===active)||projects[0]||null;
let view={x:0,y:0,z:.94},tool='pointer',drawer=null,assistantTab='critique',health={configured:false},uploadTarget=null,drag=null,toastTimeout;
const viewport=$('#viewport');
function save(){
  if(p)p.view={...view};
  try{
    localStorage.setItem(projectsKey,JSON.stringify(projects));
    localStorage.setItem(robotIntroKey,'1');
    if(p)localStorage.setItem(activeProjectKey,p.id);
    else localStorage.removeItem(activeProjectKey);
    $('#saveStatus').textContent='Saved on this device';
  }catch{$('#saveStatus').textContent='Storage full · export a copy'}
}
function event(type,detail={}){if(p.collect)p.events.push({id:uid(),at:new Date().toISOString(),type,...detail});save()}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('#toast').classList.remove('show'),3800)}
function modal(html){$('#modalBody').innerHTML=html;$('#modal').showModal()}
function closeModal(){$('#modal').close()}
$('#closeModal').onclick=closeModal;$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal()}});
function dirs(){if(p.kind==='robotics')return robotOptions.map(([name,text])=>({name,trade:text,delta:text}));return p.kind==='architecture'?[{name:'A sheltered threshold',trade:'More cover, with less sky.',delta:'A deeper canopy may provide more shelter while reducing daylight.'},{name:'A lighter edge',trade:'More daylight, with less shelter.',delta:'A thinner canopy opens the threshold but reduces shelter depth.'},{name:'A social edge',trade:'Places to pause, with a clear route to protect.',delta:'A seating edge invites lingering; its effect on the route needs checking.'}]:[{name:'A softer silhouette',trade:'Calmer form, with a wider light spread.',delta:'Rounded shade and concealed joint; directional adjustment becomes less explicit.'},{name:'A smaller footprint',trade:'More desk space, with stability to test.',delta:'Narrower base; stability during adjustment needs a physical mock-up.'},{name:'A more honest joint',trade:'Visible function, with more visual detail.',delta:'Exposed pivot joint; clearer adjustment, with a more technical expression.'}]}
function visual(variant=p.variant,original=false,image){return `<div class="study-visual">${image?`<img src="${image}" alt="Your uploaded design work">`:(p.kind==='robotics'?workflow.asset(original?'robot-sketch':robotOptions[variant][2],original?'Milo form sketch':robotOptions[variant][0]):drawing(p.kind,variant,original))}</div>`}
function source(image){return `<div class="study-source"><span>${image?'Your uploaded work':'Prepared illustrated study · not live generation'}</span><span class="pill ${image?'':'purple'}">${image?'Your image':'Example'}</span></div>`}
function inputField(name,label,value,ic=''){return `<div class="field"><label for="f-${name}">${ic?icon(ic):''}${label}</label><input id="f-${name}" data-field="${name}" maxlength="2000" value="${esc(value)}"></div>`}
const workflow=createWorkflow({
  project:()=>p,uid,esc,icon,field:inputField,toast,event,render:renderGraph,focus:focusNode,modal,closeModal,
  chooseImage(callback){uploadTarget=callback;$('#imageFile').click();},
  askStudio,
  assistant(round,lens){p.lens=lens;openDrawer('assistant','critique',roundId(round,'concept'));},
});
function nodeData(){
  if(!p)return [];
  return [...workflow.getNodes(),...p.items].map(node=>({...node,...(p.positions[node.id]||{})}));
}
function renderGraph(){
  const nodes=nodeData();
  $('#nodes').innerHTML=nodes.map(node=>{
    const body=itemTitles[node.type]
      ? `<div class="node-card"><div class="node-header" data-drag="${node.id}">${itemTitles[node.type]}</div><div class="node-body">${node.type==='image'?visual(0,false,node.image)+source(node.image):esc(node.text).replaceAll('\n','<br>')}</div></div>`
      : workflow.renderNode(node);
    return `<section class="node type-${node.type}" id="node-${node.id}" data-node="${node.id}" data-round="${node.round?.id||'root'}" style="left:${node.x}px;top:${node.y}px">${body}</section>`;
  }).join('');
  renderChrome();applyView();requestAnimationFrame(drawConnections);
}
function renderChrome(){
  $('#projectName').value=p?.title??'';
  $('#projectCount').textContent=projects.length;
  $('#modeBadge').textContent=p?.mode==='live'?'Live AI':'Scenario preview';
  $('#share').textContent=p?'Share':'Import project';
  $('#emptyWorkspace').hidden=!!p;
  $$('#projectName,.steps,#modeBadge,#inspiration,#assistant,#settings,.canvas-tools,.zoom-controls').forEach(el=>el.hidden=!p);
  $('#robotLab').hidden=p?.kind!=='robotics';
  renderProjects();
  const phase=p?workflow.stage():-1;
  $$('[data-phase]').forEach((button,i)=>{
    button.classList.toggle('current',i===phase);
    button.classList.toggle('done',i<phase);
    button.disabled=i>phase;
    button.firstElementChild.textContent=i<phase?'✓':i+1;
  });
}
function renderProjects(){let term=$('#search').value.toLowerCase();$('#projectList').innerHTML=projects.filter(a=>a.title.toLowerCase().includes(term)).map(a=>`<div class="project-row ${a.id===p?.id?'selected':''}"><button data-project="${a.id}">${esc(a.title)}</button><button class="more" data-project-options="${a.id}" aria-label="Project options for ${esc(a.title)}">···</button></div>`).join('')||(projects.length?'<p class="empty-state">No matching projects.</p>':'<p class="empty-state">No projects yet.</p>')}
function drawConnections(){
  if(!p){$('#connections').replaceChildren();return;}
  const nodes=new Map(nodeData().map(node=>[node.id,node]));
  const edges=[...workflow.edges(),...p.items.filter(item=>item.parent).map(item=>({from:item.parent,to:item.id}))];
  $('#connections').innerHTML=edges.map(edge=>{
    const from=nodes.get(edge.from),to=nodes.get(edge.to);
    const origin=document.getElementById('node-'+edge.from),target=document.getElementById('node-'+edge.to);
    if(!from||!to||!origin||!target)return '';
    const sourceCard=edge.index!==undefined?origin.querySelector('[data-alt-anchor="'+edge.index+'"]'):origin.querySelector('.node-card');
    const targetCard=target.querySelector('.node-card');
    const sourceY=sourceCard?sourceCard.getBoundingClientRect().top-origin.getBoundingClientRect().top:0;
    const targetY=targetCard?targetCard.getBoundingClientRect().top-target.getBoundingClientRect().top:0;
    const sx=from.x+4000+(edge.vertical?origin.offsetWidth/2:origin.offsetWidth);
    const sy=from.y+3000+(edge.vertical?origin.offsetHeight:sourceY/view.z+Math.min((sourceCard?.offsetHeight||origin.offsetHeight)/2,240));
    const tx=to.x+4000+(edge.vertical?target.offsetWidth/2:0);
    const ty=to.y+3000+(edge.vertical?0:targetY/view.z+Math.min((targetCard?.offsetHeight||target.offsetHeight)/2,225));
    const bend=(sx+tx)/2,mid=(sy+ty)/2;
    const d=edge.vertical?`M${sx} ${sy} C${sx} ${mid} ${tx} ${mid} ${tx} ${ty}`
      :`M${sx} ${sy} C${bend} ${sy} ${bend} ${sy} ${bend} ${mid} S${bend} ${ty} ${tx} ${ty}`;
    return `<path d="${d}" ${edge.dashed?'stroke-dasharray="6 6"':''}/><circle cx="${sx}" cy="${sy}" r="2"/><circle cx="${tx}" cy="${ty}" r="2"/>`;
  }).join('');
}
function applyView(){viewport.scrollLeft=0;viewport.scrollTop=0;$('#world').style.transform=`translate(${view.x}px,${view.y}px) scale(${view.z})`;viewport.style.backgroundSize=`${26*view.z}px ${26*view.z}px`;viewport.style.backgroundPosition=`${view.x}px ${view.y}px`;$('#zoomReset').textContent=Math.round(view.z*100)+'%'}
function focusNode(id,fitCard=true){
  const node=nodeData().find(item=>item.id===id),el=document.getElementById('node-'+id);
  if(!node||!el)return;
  workflow.selectNode(node);
  renderChrome();
  const available=viewport.clientWidth-(drawer?Math.min(380,viewport.clientWidth*.42):0);
  const width=Math.max(240,available);
  const height=['parts','partSizes','alternatives'].includes(node.type)?Math.min(el.offsetHeight,610):el.offsetHeight;
  if(fitCard)view.z=Math.max(.24,Math.min(.95,(width-65)/el.offsetWidth,(viewport.clientHeight-110)/height));
  view.x=width/2-(node.x+el.offsetWidth/2)*view.z;
  view.y=(id==='intent'?Math.max(28,viewport.clientHeight*.12):30)-node.y*view.z;
  applyView();save();
}
function fitAll(){const nodes=nodeData();if(!nodes.length)return;let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;nodes.forEach(n=>{const el=$('#node-'+n.id);minX=Math.min(minX,n.x);minY=Math.min(minY,n.y);maxX=Math.max(maxX,n.x+el.offsetWidth);maxY=Math.max(maxY,n.y+el.offsetHeight)});view.z=Math.max(.08,Math.min(.94,(viewport.clientWidth-100)/(maxX-minX),(viewport.clientHeight-140)/(maxY-minY)));view.x=(viewport.clientWidth-(maxX-minX)*view.z)/2-minX*view.z;view.y=(viewport.clientHeight-(maxY-minY)*view.z)/2-minY*view.z;applyView();save()}
function zoom(factor){const before=view.z;view.z=Math.min(1.8,Math.max(.08,before*factor));const cx=viewport.clientWidth/2,cy=viewport.clientHeight/2;view.x=cx-(cx-view.x)*(view.z/before);view.y=cy-(cy-view.y)*(view.z/before);applyView();save()}
function newProject(baseTitle='Milo · New Robot Design'){
  const titles=new Set(projects.map(project=>project.title));
  let title=baseTitle;
  for(let number=2;titles.has(title);number++)title=baseTitle+' '+number;
  const project=freshRobot(title);
  projects.push(project);
  $('#search').value='';
  setTool('pointer');
  switchProject(project.id);
  $('#f-target').focus({preventScroll:true});
}
function switchProject(id){const target=projects.find(a=>a.id===id);if(!target)return;const savedView=target.studio?target.view:null;p=target;closeDrawer();renderGraph();if(savedView){view={...savedView};applyView()}else focusNode(workflow.resumeNode());save();document.body.classList.remove('mobile-sidebar')}
function confirmProjectDeletion(project){
  $('#modalBody').innerHTML=`<h2>Delete project?</h2><p>Delete <strong>${esc(project.title)}</strong> and its workflow from this browser? This cannot be undone.</p>
    <div class="row-buttons"><button id="cancelDelete" class="soft-button">Cancel</button><button id="confirmDelete" class="danger-button">Delete project</button></div><p id="deleteError" role="alert"></p>`;
  $('#cancelDelete').onclick=closeModal;
  $('#cancelDelete').focus();
  $('#confirmDelete').onclick=()=>{
    const index=projects.indexOf(project);
    if(index<0){closeModal();return;}
    const remaining=projects.filter(candidate=>candidate!==project);
    try{localStorage.setItem(projectsKey,JSON.stringify(remaining));}
    catch{
      $('#deleteError').textContent='Could not delete this project from browser storage. Try again.';
      return;
    }
    projects=remaining;
    closeModal();
    if(p!==project){
      renderChrome();
      $('#search').focus();
    }else if(projects.length){
      setTool('pointer');
      switchProject(projects[Math.min(index,projects.length-1)].id);
      $('#projectName').focus();
    }else{
      p=null;
      setTool('pointer');
      closeDrawer();
      renderGraph();
      save();
      $('#newEmptyProject').focus();
    }
    toast('Project deleted.');
  };
}
function setTool(next){tool=next;$$('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===next));viewport.classList.toggle('placing',next!=='pointer');if(next!=='pointer')toast('Click an empty part of the canvas to place '+(next==='intent'?'an intent card':next==='image'?'an image':'a '+next)+'.')}
function placeItem(x,y){if(tool==='image'){const owner=p;uploadTarget=image=>{owner.items.push({id:uid(),type:'image',x,y,image});return owner};$('#imageFile').click();return}const currentTool=tool;modal(`<h2>${currentTool==='intent'?'Add an intent note':`Add ${currentTool}`}</h2><label for="canvasText">${currentTool==='sticker'?'Choose a symbol or emoji':'What would you like to add?'}</label><textarea id="canvasText" maxlength="2000">${currentTool==='sticker'?'✦':''}</textarea><div class="row-buttons"><button id="placeText" class="dark-button">Add to canvas</button></div>`);$('#placeText').onclick=()=>{const text=$('#canvasText').value.trim();if(!text)return toast('Add some content first.');p.items.push({id:uid(),type:currentTool==='intent'?'comment':currentTool,x,y,text});event('canvas_item_added',{type:currentTool});setTool('pointer');closeModal();renderGraph()}}
viewport.addEventListener('pointerdown',e=>{if(!p||e.button!==0||e.target.closest('input,textarea,select,button,a,dialog'))return;const header=e.target.closest('[data-drag]');if(header){const n=nodeData().find(n=>n.id===header.dataset.drag);drag={type:'node',id:n.id,startX:e.clientX,startY:e.clientY,x:n.x,y:n.y};header.closest('.node').classList.add('dragging');e.preventDefault()}else if(!e.target.closest('.node')){if(tool!=='pointer'){const r=viewport.getBoundingClientRect();placeItem((e.clientX-r.left-view.x)/view.z,(e.clientY-r.top-view.y)/view.z);return}drag={type:'pan',startX:e.clientX,startY:e.clientY,x:view.x,y:view.y};viewport.classList.add('panning');e.preventDefault()}});
window.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;if(drag.type==='pan'){view.x=drag.x+dx;view.y=drag.y+dy;applyView()}else{p.positions[drag.id]={x:drag.x+dx/view.z,y:drag.y+dy/view.z};const el=$('#node-'+drag.id);el.style.left=p.positions[drag.id].x+'px';el.style.top=p.positions[drag.id].y+'px';drawConnections()}});
window.addEventListener('pointerup',()=>{if(!drag)return;$$('.dragging').forEach(el=>el.classList.remove('dragging'));viewport.classList.remove('panning');drag=null;save()});
viewport.addEventListener('wheel',e=>{if(!p||e.target.closest('textarea,select'))return;e.preventDefault();if(e.ctrlKey||e.metaKey)zoom(Math.exp(-e.deltaY*.006));else{view.x-=e.deltaX;view.y-=e.deltaY;applyView();save()}},{passive:false});
function openDrawer(kind,tab='critique',focusId=workflow.resumeNode()){drawer=kind;assistantTab=tab;$('#drawer').hidden=false;$('#drawerTitle').textContent=kind==='inspiration'?'Inspiration':'Crit Lens AI assistant';$('#drawerIcon').textContent=kind==='inspiration'?'☼':'✧';renderDrawer();requestAnimationFrame(()=>focusNode(focusId))}
function closeDrawer(){drawer=null;$('#drawer').hidden=true}
const labels={keep:'Kept',adapt:'Adapted',reject:'Rejected',test:'Needs a test'};
function prompts(){if(p.ai?.lens===p.lens)return p.ai.items;
if(p.kind==='robotics'){
  const pairs={
    use:[['Can the face be read from a seated position?','Try the mock-up at two desk heights. Which viewing angle matters most?'],['What makes the face feel expressive?','Which cue would you prototype to check how people read its expression?']],
    making:[['Does moving the bracket create a new clearance problem?','Compare the centred, 6 mm and 12 mm positions with the same head and base.'],['When would you want the suggestion?','Would you rather pause while aligning the bracket or reconsider after fastening it?']],
    intent:[['Does this option preserve your design intent?','Which change improves the viewing angle without taking up more desk space?'],['What would you keep from your original sketch?','Which part of the proposal would you change before making another mock-up?']]
  };
  return pairs[p.lens].map(([title,question])=>({title,observation:p.problem,question,source:'Prepared robot design prompt'}));
}const d=dirs()[workflow.current().variant];if(p.lens==='use')return[{title:p.kind==='architecture'?'Who can enter, and who can pause here?':'Can the light be adjusted comfortably with one hand?',observation:'This prepared study does not establish access, force, reach or comfort.',question:'Which physical test would reveal a barrier?',source:'Prepared accessibility prompt'},{title:'What happens in the actual setting?',observation:p.problem,question:'Which user or situation might challenge your assumptions?',source:'Your intent + prepared question'}];if(p.lens==='making')return[{title:'What happens at the joint?',observation:'Connections, assembly and repair are not established by this illustrated study.',question:'What would you prototype before refining the image?',source:'Prepared making prompt'},{title:'Could a part be replaced independently?',observation:d.delta,question:'What material or assembly decision still needs evidence?',source:'Prepared making prompt'}];return[{title:'Does this proposal preserve your design intent?',observation:d.delta,question:'Which choice would you defend, and which would you challenge?',source:'Prepared intent prompt'},{title:'The image changed. Did the intention?',observation:'Your stated intention: '+p.problem,question:'What would make this a decision you can explain as your own?',source:'Your intent + prepared question'}]}
function makingPlan(){
  const round=workflow.current();
  const parts=round.parts.filter(part=>part.selected).map(part=>part.name).join(', ');
  const tasks=p.kind==='robotics'?[
    ['Form and material','Use a simple foam head and base to check the seated viewing angle.'],
    ['Assembly and repair','Try the centred, 6 mm and 12 mm bracket positions. Check cable clearance and access to both screws.'],
    ['Timing','Compare reviewing the option while aligning the bracket with reviewing it after fastening.']
  ]:p.template==='lamp'?[
    ['Form and material','Mock up a thin-walled diffuser. Compare diffusion and glare from normal desk height.'],
    ['Assembly and repair','Try a removable shade joint. Check fastener access and whether the light module can be serviced.'],
    ['Physical checks','Check tip stability at the furthest adjustment and test heat near the diffuser before committing to a material.'],
  ]:[
    ['Form and material','Prototype the selected parts at scale and compare candidate materials against the use context.'],
    ['Assembly and repair','Mock up the joining sequence, access to fasteners and the path for replacing wear parts.'],
    ['Physical checks','Choose a test for the highest-risk use condition. Record the mock-up dimensions and what changed.'],
  ];
  return `<div class="drawer-kicker">HOW TO MAKE IT</div><div class="context-card"><b>Prototype checklist</b><br>${esc(parts)} · prepared starting points</div>${p.kind==='robotics'?'<button class="soft-button" id="makingLab">Open Prototype Lab ↗</button>':''}${tasks.map(([title,detail])=>`<article class="feedback-card"><h3>${title}</h3><p>${detail}</p></article>`).join('')}`;
}
function launchRobotLab(){
  if(p?.kind!=='robotics')return;
  const owner=p;
  openRobotLab(modal,$('#modalBody'),detail=>{
    const round=workflow.current();
    owner.decisions.push({id:uid(),parentId:null,at:new Date().toISOString(),direction:round.variant,lens:'making',
      branchId:round.id==='root'?null:round.id,model:null,intentSnapshot:owner.problem,...detail});
    event('prototype_decision',{position:detail.position});
    if(drawer==='assistant'&&assistantTab==='journal')renderDrawer();
  });
}
$('#robotLab').onclick=launchRobotLab;
function renderDrawer(){if(!drawer)return;const b=$('#drawerBody');if(drawer==='inspiration'){b.innerHTML=`<p class="drawer-intro">Explore directions without leaving the whiteboard. These are prepared studies, not retrieved products or live AI results.</p><div class="drawer-kicker">MATCHED TO YOUR EXPLORATION</div>${dirs().map((d,i)=>`<article class="inspo-card">${visual(i)}<div><h3>${esc(d.name)}</h3><p>${esc(d.trade)}</p><button class="soft-button wide" data-add-inspiration="${i}">Add to workspace</button></div></article>`).join('')}`;return}b.innerHTML=`<p class="drawer-intro">Question the work, prepare for a crit, and keep track of the choices you make.</p><nav class="drawer-tabs"><button data-assistant-tab="critique" class="${assistantTab==='critique'?'active':''}">Critique</button><button data-assistant-tab="notes" class="${assistantTab==='notes'?'active':''}">Crit notes</button><button data-assistant-tab="journal" class="${assistantTab==='journal'?'active':''}">Decisions <span>${p.decisions.length}</span></button></nav>`;
if(assistantTab==='critique'){b.innerHTML+=(p.lens==='making'?makingPlan():'')+`<div class="context-card"><b>YOUR DESIGN INTENT</b><br>${esc(p.problem)}</div><label class="drawer-label" for="lens">Critique lens</label><select id="lens" class="drawer-field"><option value="intent">Intent & authorship</option><option value="use">Use & accessibility</option><option value="making">Materials & making</option></select>${prompts().map((c,i)=>`<article class="feedback-card"><span class="source">${esc(c.source||'AI interpretation · verify')}</span><h3>${esc(c.title)}</h3><p>${esc(c.observation)}</p><p>“${esc(c.question)}”</p><button class="soft-button" data-respond="${i}">Take a position ↗</button></article>`).join('')}<button class="dark-button wide" id="refreshCritique">${p.mode==='live'?'Request live critique':'Revisit prepared prompts'}</button><p class="drawer-footer">${p.mode==='live'?'Live mode sends the selected context only after your confirmation.':'Demo mode · prepared prompts do not analyse uploaded images.'} <button id="modelSettings" style="font-size:10px;color:#a67eae;padding:0">Model settings ↗</button></p><div class="drawer-kicker">DESIGN CONVERSATION</div><div id="chatLog">${p.chat.map(m=>`<div class="chat-message ${m.role==='user'?'user':''}">${esc(m.text)}${m.role==='assistant'?'<small>Prepared reflection scaffold · not a model response</small>':''}</div>`).join('')}</div><label class="drawer-label" for="chatInput">What are you thinking about?</label><input id="chatInput" class="panel-input" maxlength="2000" placeholder="Ask about your next prototype or test"><button id="sendChat" class="soft-button wide" style="margin-top:9px">${p.mode==='live'?'Use live critique above':'Reflect on this question'}</button>`;$('#lens').value=p.lens;$('#lens').onchange=e=>{p.lens=e.target.value;p.ai=null;event('lens_selected',{lens:p.lens});renderDrawer()};$('#refreshCritique').onclick=async()=>{if(p.mode==='demo'){event('prepared_critique_viewed');return toast('These are prepared discussion prompts, not live analysis.')}const r=await requestAI('critique');if(r){p.ai={...r,lens:p.lens};event('model_critique',{model:r.model});renderDrawer()}};$('#modelSettings').onclick=settings;$('#sendChat').onclick=()=>{if(p.mode==='live')return toast('Use “Request live critique” to send the board context.');const value=$('#chatInput').value.trim();if(!value)return;p.chat.push({role:'user',text:value},{role:'assistant',text:'You asked: “'+value+'” Start by naming the decision behind this question. Which of your intentions does it support? What evidence would make you change your mind? Add that test to your next iteration.'});event('reflection_scaffold');renderDrawer()};$('#chatInput').onkeydown=e=>{if(e.key==='Enter')$('#sendChat').click()};}
if(assistantTab==='notes'){b.innerHTML+=`<div class="context-card">Keep the original conversation separate from your interpretation.</div><label class="drawer-label" for="critTranscript">Crit notes / pasted transcript</label><textarea id="critTranscript" class="panel-textarea" maxlength="12000" placeholder="Tutor: Why did you choose this form?&#10;Me: I chose it because…">${esc(p.transcript)}</textarea><div class="row-buttons"><button id="saveNotes" class="soft-button">Save notes</button><button id="structureNotes" class="dark-button">${p.mode==='live'?'AI · Structure notes':'Split into notes'}</button></div><p class="drawer-footer">Demo splits by line. Live mode returns provisional observations, questions and actions. No microphone is used.</p>${p.sessions.map(s=>`<div class="note-line"><span class="pill">${esc(s.type||'Unclassified')}</span><br>${esc(s.text)}<br><small>${esc(s.source||'Your pasted notes')}</small></div>`).join('')}`;$('#critTranscript').oninput=e=>{p.transcript=e.target.value;save()};$('#saveNotes').onclick=()=>{event('crit_notes_saved');toast('Crit notes saved locally.')};$('#structureNotes').onclick=async()=>{if(!p.transcript.trim())return toast('Paste some crit notes first.');if(p.mode==='demo'){p.sessions=p.transcript.split(/\n+/).map(s=>s.trim()).filter(Boolean).map(text=>({text,type:'Unclassified · review manually',source:'Your pasted notes'}));event('notes_split');renderDrawer()}else{const r=await requestAI('transcript');if(r){p.sessions=r.notes.map(n=>({...n,source:'AI interpretation · verify against original'}));event('notes_structured',{model:r.model});renderDrawer()}}};}
if(assistantTab==='journal'){b.innerHTML+=`<p class="drawer-intro">Keep, adapt, reject or test. A reasoned disagreement is part of the design process.</p>${p.decisions.length?p.decisions.map((d,i)=>`<article class="journal-item"><div class="meta">${String(i+1).padStart(2,'0')} · ${new Date(d.at).toLocaleString('en-SG',{timeZone:'Asia/Singapore'})} SGT${d.parentId?' · revision of '+String(p.decisions.findIndex(x=>x.id===d.parentId)+1).padStart(2,'0'):''}</div><h3>${esc(d.proposal||'Design decision')} <span class="status-badge ${esc(d.position)}">${labels[d.position]||esc(d.position)}</span></h3><p>${esc(d.reason)}</p>${d.next?`<div class="note-line">Next action: ${esc(d.next)}</div>`:''}<div class="meta">Source: ${esc(d.provenance||'Your judgment')}</div><button data-revise="${d.id}">Revisit this decision ↗</button></article>`).join(''):'<p class="empty-state">No decisions yet. Take a position on a critique prompt or a concept branch.</p>'}<div class="row-buttons"><button id="exportCSV" class="soft-button wide">↓ Export decisions as CSV</button></div><p class="drawer-footer">Records and counts describe interaction, not measured creativity or learning.</p>`;$('#exportCSV').onclick=exportCSV}}
function positionDialog({prompt='What would you keep, adapt or reject?',source='Your judgment',branchId=null,index=null,parent=null}={}){const branch=p.studio.rounds.find(b=>b.id===branchId);const variant=branch?.variant??parent?.direction??p.variant;const item=index!==null?prompts()[index]:null;modal(`<h2>${parent?'What changed your mind?':'What is your position?'}</h2><p>${esc(parent?parent.reason:item?.title||prompt)}</p><div class="delta-box">${esc(dirs()[variant].delta)}</div><label for="position">Your decision</label><select id="position">${Object.entries(labels).map(([k,v])=>`<option value="${k}" ${k===(parent?.position||'adapt')?'selected':''}>${v}</option>`).join('')}</select><label for="reason">Why? What stays yours?</label><textarea id="reason" maxlength="4000" placeholder="I chose this because…"></textarea><label for="nextAction">Next action / evidence to seek</label><input id="nextAction" maxlength="1000" value="${esc(parent?.next||'')}" placeholder="A mock-up, a user check, a material test…"><div class="row-buttons"><button class="dark-button" id="savePosition">Save my decision</button></div>`);$('#savePosition').onclick=()=>{const reason=$('#reason').value.trim();if(!reason)return toast('Add a reason so you can revisit this decision.');p.decisions.push({id:uid(),parentId:parent?.id||null,at:new Date().toISOString(),direction:variant,lens:p.lens,branchId:branchId||parent?.branchId||null,proposal:parent?.proposal||dirs()[variant].name,prompt:parent?.prompt||item?.title||prompt,provenance:item?.source||parent?.provenance||source,model:parent?.model||p.ai?.model||null,intentSnapshot:parent?.intentSnapshot||branch?.intentSnapshot||p.problem,position:$('#position').value,reason,next:$('#nextAction').value.trim()});event('decision_saved',{position:$('#position').value});closeModal();renderGraph();openDrawer('assistant','journal');toast('Decision saved. Your earlier reasoning is preserved.')};}
async function requestAI(task){return new Promise(resolve=>{const owner=p;modal(`<h2>Send this context for critique?</h2><p>This sends your design intention, selected lens, ${task==='transcript'?'pasted crit notes':'proposal description and uploaded original image (if present)'} to your configured server, then OpenAI.</p><label for="serverPassword">Studio server password</label><input id="serverPassword" type="password" autocomplete="off"><div class="row-buttons"><button id="cancelAI" class="soft-button">Cancel</button><button id="sendAI" class="dark-button">Send for critique</button></div>`);let settled=false;const finish=r=>{if(!settled){settled=true;resolve(r)}};$('#modal').addEventListener('close',()=>finish(null),{once:true});$('#cancelAI').onclick=closeModal;$('#sendAI').onclick=async()=>{const b=$('#sendAI');b.disabled=true;b.textContent='Thinking…';try{const r=await fetch('/api/critique',{method:'POST',headers:{'Content-Type':'application/json','X-Studio-Password':$('#serverPassword').value},body:JSON.stringify({task,kind:owner.kind,intent:owner.problem,keep:workflow.current().cards.filter(c=>c.group==='keep').map(c=>c.text).join('; '),lens:owner.lens,proposal:dirs()[owner.variant].delta,transcript:task==='transcript'?owner.transcript:undefined,image:task==='critique'?(workflow.current().image?.startsWith('data:')?workflow.current().image:owner.images.original):undefined}),signal:AbortSignal.timeout(65000)});const data=await r.json();if(!r.ok)throw new Error(data.error||'AI request failed');finish(data);closeModal()}catch(e){b.disabled=false;b.textContent='Try again';toast(e.message)}}})}
function settings(){modal(`<h2>Workspace settings</h2><p>Keep the thinking yours. This prototype saves your projects in this browser.</p><label for="feedbackMode">AI feedback mode</label><select id="feedbackMode"><option value="demo">Demo · prepared prompts</option><option value="live" ${p.mode==='live'?'selected':''}>Live · configured AI server</option></select><p class="small-copy">${health.configured?'The server is configured. Real requests still need the studio password.':'The online board runs the prepared scenario. A configured Node server enables live concepts, components and critique.'}</p><label class="settings-option"><input id="recordEvents" type="checkbox" ${p.collect?'checked':''}>Record interaction events locally</label><p class="small-copy">Off by default. Existing events stay in exports when recording stops. Nothing is automatically sent to a researcher.</p><div class="row-buttons"><button id="saveSettings" class="dark-button">Save settings</button><button id="exportAll" class="soft-button">Export exploration</button></div>`);$('#saveSettings').onclick=()=>{const mode=$('#feedbackMode').value;if(mode==='live'&&!health.configured)return toast('Live AI needs the included server and server-side credentials.');p.mode=mode;p.collect=$('#recordEvents').checked;p.ai=null;save();closeModal();renderChrome();renderDrawer();toast('Settings saved.')};$('#exportAll').onclick=exportJSON}
function download(name,body,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([body],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportJSON(){save();download('crit-lens-whiteboard.json',JSON.stringify({schemaVersion:'3.0',exportedAt:new Date().toISOString(),project:p},null,2),'application/json');toast('Editable exploration exported. Review it before sharing.')}
function exportCSV(){const keys=['id','parentId','at','direction','branchId','lens','proposal','provenance','model','intentSnapshot','position','reason','next'];const cell=value=>{let s=String(value??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};download('crit-lens-decisions.csv','\ufeff'+[keys.map(cell).join(','),...p.decisions.map(d=>keys.map(k=>cell(d[k])).join(','))].join('\r\n'),'text/csv;charset=utf-8')}
function share(){modal(`<h2>Share your project</h2><p>Export an editable copy including images, decisions and branches. Live collaboration is not connected in this prototype.</p><div class="row-buttons"><button id="shareExport" class="dark-button">Export project</button><button id="shareImport" class="soft-button">Import project</button></div><p class="small-copy">Your crit notes and reasoning are included. Review before sharing.</p>`);$('#shareExport').onclick=exportJSON;$('#shareImport').onclick=()=>$('#importFile').click()}
function safeProject(raw){if(!raw||!['industrial','architecture','robotics'].includes(raw.kind)||typeof raw.title!=='string'||!Number.isInteger(raw.progress)||raw.progress<0||raw.progress>7)throw Error('This file is not a supported exploration.');const project=fresh(raw.kind,raw.title.slice(0,90));if(['lamp','custom','robot'].includes(raw.template))project.template=raw.template;const strings=['target','product','problem','description','brief','changeRequest','transcript'];for(const k of strings)if(typeof raw[k]==='string')project[k]=raw[k].slice(0,k==='transcript'?12000:6000);project.progress=raw.progress;project.variant=Math.max(0,Math.min(2,Math.floor(raw.variant||0)));project.alternativeCount=Math.max(1,Math.min(3,Math.floor(raw.alternativeCount||3)));project.features=Array.isArray(raw.features)?raw.features.filter(x=>typeof x==='string').slice(0,20).map(x=>x.slice(0,300)):project.features;for(const k of ['width','height','depth'])if(Number.isFinite(raw.sizes?.[k])&&raw.sizes[k]>0&&raw.sizes[k]<=10000)project.sizes[k]=raw.sizes[k];project.cards=Array.isArray(raw.cards)?raw.cards.filter(x=>x&&['keep','explore','constraints'].includes(x.group)&&typeof x.text==='string').slice(0,100).map(x=>({id:uid(),group:x.group,text:x.text.slice(0,1500)})):project.cards;project.components=Array.isArray(raw.components)?raw.components.filter(x=>typeof x?.name==='string').slice(0,30).map(x=>({id:uid(),name:x.name.slice(0,100),selected:!!x.selected})):project.components;for(const k of ['original','proposal'])if(typeof raw.images?.[k]==='string'&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(raw.images[k]))project.images[k]=raw.images[k];for(const [j,v]of Object.entries(raw.componentSizes||{}))if(/^\d{1,2}$/.test(j)&&v&&['width','height'].every(k=>Number.isFinite(v[k])&&v[k]>0&&v[k]<=10000))project.componentSizes[j]={width:v.width,height:v.height};project.changes=Array.isArray(raw.changes)?raw.changes.filter(c=>typeof c?.text==='string').slice(0,100).map(c=>({id:uid(),text:c.text.slice(0,2000),at:Number.isFinite(Date.parse(c.at))?c.at:new Date().toISOString()})):[];project.chat=Array.isArray(raw.chat)?raw.chat.filter(c=>['user','assistant'].includes(c?.role)&&typeof c.text==='string').slice(0,100).map(c=>({role:c.role,text:c.text.slice(0,4000)})):[];const validId=s=>typeof s==='string'&&!['__proto__','constructor','prototype'].includes(s)&&/^[a-zA-Z0-9_-]{1,100}$/.test(s);project.branches=Array.isArray(raw.branches)?raw.branches.filter(x=>validId(x?.id)&&x.type==='branch'&&Number.isFinite(x.x)&&Number.isFinite(x.y)&&[0,1,2].includes(x.variant)).slice(0,50).map(x=>({id:x.id,type:'branch',variant:x.variant,iteration:Math.max(2,Math.min(50,Number(x.iteration)||2)),parent:validId(x.parent)?x.parent:'alternatives',image:/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(x.image||'')?x.image:null,intentSnapshot:String(x.intentSnapshot||'').slice(0,2000),x:x.x,y:x.y})):[];project.selected=Array.isArray(raw.selected)?raw.selected.filter(x=>[0,1,2].includes(x)):[];project.decisions=Array.isArray(raw.decisions)?raw.decisions.filter(d=>validId(d?.id)&&typeof d.reason==='string'&&['keep','adapt','reject','test'].includes(d.position)).slice(0,1000).map(d=>({id:d.id,parentId:validId(d.parentId)?d.parentId:null,at:Number.isFinite(Date.parse(d.at))?d.at:new Date().toISOString(),direction:[0,1,2].includes(d.direction)?d.direction:0,branchId:validId(d.branchId)?d.branchId:null,lens:String(d.lens||'intent').slice(0,100),proposal:String(d.proposal||'').slice(0,500),prompt:String(d.prompt||'').slice(0,2000),provenance:String(d.provenance||'Imported decision').slice(0,1000),model:String(d.model||'').slice(0,100),intentSnapshot:String(d.intentSnapshot||'').slice(0,2000),position:d.position,reason:d.reason.slice(0,4000),next:String(d.next||'').slice(0,1000)})):[];project.sessions=Array.isArray(raw.sessions)?raw.sessions.filter(x=>typeof x?.text==='string').slice(0,100).map(x=>({text:x.text.slice(0,5000),type:String(x.type||'Unclassified').slice(0,100),source:String(x.source||'Imported note').slice(0,200)})):[];project.items=Array.isArray(raw.items)?raw.items.filter(x=>validId(x?.id)&&['comment','text','sticker','image'].includes(x.type)&&Number.isFinite(x.x)&&Number.isFinite(x.y)).slice(0,100).map(x=>({id:x.id,type:x.type,x:x.x,y:x.y,text:String(x.text||'').slice(0,2000),...(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(x.image||'')?{image:x.image}:{})})):[];project.sketchReady=!!raw.sketchReady;project.sketchTab=raw.sketchTab==='generate'?'generate':'upload';project.events=Array.isArray(raw.events)?raw.events.slice(0,5000):[];project.positions={};for(const [id,pos] of Object.entries(raw.positions||{}))if(validId(id)&&Number.isFinite(pos?.x)&&Number.isFinite(pos?.y))project.positions[id]={x:pos.x,y:pos.y};project.studio=sanitizeStudio(raw.studio,project,uid);return project}
$('#importFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(file.size>12*1024*1024){e.target.value='';return toast('Choose an exploration file under 12 MB.')}try{const data=JSON.parse(await file.text());const imported=safeProject(data.project);imported.title+=' · imported';projects.push(imported);p=imported;closeModal();closeDrawer();renderGraph();focusNode(workflow.resumeNode());save();toast('Editable project imported. The original project is unchanged.')}catch(err){toast(err.message||'This project file could not be read.')}e.target.value=''};
async function compressedImage(blob,max=1050,quality=.79){
  const bitmap=await createImageBitmap(blob);
  try{
    const canvas=document.createElement('canvas'),ratio=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
    canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/jpeg',quality);
  }finally{bitmap.close();}
}
$('#imageFile').onchange=async e=>{
  const file=e.target.files[0],use=uploadTarget;
  e.target.value='';uploadTarget=null;
  if(!file||!use)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>3*1024*1024)return toast('Choose a PNG, JPEG or WebP under 3 MB.');
  try{
    const owner=use(await compressedImage(file),file.name.slice(0,200));
    if(owner!==p){localStorage.setItem(projectsKey,JSON.stringify(projects));return;}
    event('image_uploaded');setTool('pointer');renderGraph();toast('Image added.');
  }catch{toast('This image could not be saved.');}
};
$('#nodes').addEventListener('input',e=>{
  const target=e.target;
  if(target.dataset.field){p[target.dataset.field]=target.value;p.ai=null;}
  if(target.dataset.feature!==undefined)p.features[Number(target.dataset.feature)]=target.value;
  workflow.textInput(target);save();requestAnimationFrame(drawConnections);
});
$('#nodes').addEventListener('change',e=>{
  if(e.target.dataset.flowField==='move-card')workflow.moveCard(e.target,null,e.target.value);
});
$('#nodes').addEventListener('click',e=>{
  const button=e.target.closest('button');
  if(!button)return;
  if(button.dataset.removeFeature!==undefined){p.features.splice(Number(button.dataset.removeFeature),1);save();return renderGraph();}
  workflow.click(button).catch(error=>toast(error.message||'This action could not complete.'));
});
$('#drawerBody').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='makingLab')return launchRobotLab();if(b.dataset.assistantTab){assistantTab=b.dataset.assistantTab;return renderDrawer()}if(b.dataset.respond!==undefined)return positionDialog({index:Number(b.dataset.respond),branchId:workflow.current().id==='root'?null:workflow.current().id});if(b.dataset.revise)return positionDialog({parent:p.decisions.find(d=>d.id===b.dataset.revise)});if(b.dataset.addInspiration!==undefined){closeDrawer();workflow.inspiration(Number(b.dataset.addInspiration));}});
$('#newProject').onclick=()=>newProject();
$('#newEmptyProject').onclick=()=>newProject();
$('#showProjects').onclick=()=>{
  modal(`<h2>Your projects</h2><div class="step-list">${projects.map(project=>`<button data-select-project="${project.id}">${esc(project.title)}</button>`).join('')||'<p>No projects yet.</p>'}</div>`);
  $$('[data-select-project]').forEach(button=>button.onclick=()=>{
    closeModal();
    switchProject(button.dataset.selectProject);
  });
};
$('#projectList').onclick=e=>{
  const button=e.target.closest('button');
  if(button?.dataset.project)return switchProject(button.dataset.project);
  const project=projects.find(candidate=>candidate.id===button?.dataset.projectOptions);
  if(!project)return;
  modal(`<h2>Project options</h2><label for="renameProject">Project name</label><input id="renameProject" maxlength="90" value="${esc(project.title)}">
    <div class="row-buttons"><button id="renameSave" class="dark-button">Save name</button><button id="duplicateProject" class="soft-button">Duplicate</button>${project.kind==='robotics'?'<button id="restartRobot" class="soft-button">Start fresh from robot template</button>':''}</div>
    <div class="project-danger"><button id="deleteProject" class="soft-button">Delete project</button></div>`);
  $('#renameSave').onclick=()=>{
    const name=$('#renameProject').value.trim();
    if(!name)return;
    project.title=name;
    save();
    renderChrome();
    closeModal();
  };
  $('#duplicateProject').onclick=()=>{
    const copy=safeProject(project);
    copy.title+=' · copy';
    projects.push(copy);
    closeModal();
    switchProject(copy.id);
  };
  if($('#restartRobot'))$('#restartRobot').onclick=()=>{
    closeModal();
    newProject('Milo · New Robot Design');
  };
  $('#deleteProject').onclick=()=>confirmProjectDeletion(project);
};
$('#search').oninput=renderProjects;$('#projectName').oninput=e=>{p.title=e.target.value;save();renderProjects()};$('#projectName').onblur=()=>{if(p&&!p.title.trim()){p.title='Untitled exploration';renderChrome();save()}};
$('#share').onclick=()=>p?share():$('#importFile').click();$('#modeBadge').onclick=settings;$('#settings').onclick=settings;$('#inspiration').onclick=()=>drawer==='inspiration'?closeDrawer():openDrawer('inspiration');$('#assistant').onclick=()=>drawer==='assistant'?closeDrawer():openDrawer('assistant');$('#closeDrawer').onclick=closeDrawer;$$('[data-phase]').forEach(b=>b.onclick=()=>focusNode(workflow.phaseNode(Number(b.dataset.phase))));$$('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));$('#zoomOut').onclick=()=>zoom(1/1.15);$('#zoomIn').onclick=()=>zoom(1.15);$('#zoomReset').onclick=()=>zoom(1/view.z);$('#fit').onclick=fitAll;$('#jump').onclick=()=>{modal(`<h2>Navigate the flow</h2><div class="step-list">${nodeData().map(n=>`<button data-jump-node="${n.id}"><span>↳</span>${esc(itemTitles[n.type]||workflow.title(n))}</button>`).join('')}</div><p class="small-copy">Drag empty canvas to pan. Use Ctrl + scroll to zoom. Drag a card header to move it.</p>`);$$('[data-jump-node]').forEach(b=>b.onclick=()=>{closeModal();focusNode(b.dataset.jumpNode)})};
$('#collapseSidebar').onclick=()=>{document.body.classList.add('sidebar-collapsed');document.body.classList.remove('mobile-sidebar');$('#expandSidebar').hidden=false;requestAnimationFrame(()=>{if(p)focusNode(workflow.resumeNode())})};$('#expandSidebar').onclick=()=>{if(innerWidth<=760)document.body.classList.toggle('mobile-sidebar');else{document.body.classList.remove('sidebar-collapsed');$('#expandSidebar').hidden=true;requestAnimationFrame(()=>{if(p)focusNode(workflow.resumeNode())})}};$('#about').onclick=()=>modal('<h2>Crit Lens · AI Robot Design Workbench</h2><p>Define a robot’s intent, refine its components and compare design alternatives. Use Prototype Lab to explore when an AI suggestion should appear during assembly.</p><p>The Milo scenario uses prepared studies. Project data is saved in this browser and can be shared as an editable export.</p>');
window.addEventListener('keydown',e=>{if(!p||e.target.closest('input,textarea,select')||$('#modal').open)return;if(e.key==='0'){e.preventDefault();fitAll()}if(e.key==='+')zoom(1.15);if(e.key==='-')zoom(1/1.15);if(e.key.toLowerCase()==='v')setTool('pointer');if(e.key.toLowerCase()==='t')setTool('text');if(e.key.toLowerCase()==='c')setTool('comment');if(e.key==='Escape'){setTool('pointer');closeDrawer()}});
window.addEventListener('resize',()=>requestAnimationFrame(drawConnections));
const storedView=p?.studio?p.view:null;
renderGraph();
if(storedView){view={...storedView};applyView();}else requestAnimationFrame(()=>{if(p)focusNode(workflow.resumeNode())});
let decisionDrag=null, dropZone=null;
function highlightDrop(column){
  if(dropZone===column)return;
  dropZone?.classList.remove('drop-active');
  dropZone=column;
  dropZone?.classList.add('drop-active');
}
function endDecisionDrag(){
  if(!decisionDrag)return;
  cancelAnimationFrame(decisionDrag.frame);
  decisionDrag.chip.classList.remove('chip-dragging');
  decisionDrag.ghost?.remove();
  decisionDrag=null;
  highlightDrop(null);
}
$('#nodes').addEventListener('pointerdown',e=>{
  const chip=e.target.closest('[data-decision]');
  if(!chip||e.button!==0||!e.isPrimary||e.target.closest('button, select, input, a'))return;
  const text=e.target.closest('textarea');
  if(text&&text===document.activeElement)return;
  decisionDrag={chip,text,id:chip.dataset.decision,node:chip.closest('[data-node]'),
    group:chip.closest('[data-drop-group]').dataset.dropGroup,pointer:e.pointerId,x:e.clientX,y:e.clientY,ghost:null,frame:0};
  e.preventDefault();
});
function decisionDestination(x,y){
  const column=document.elementFromPoint(x,y)?.closest('[data-drop-group]');
  return column&&column.closest('[data-node]')===decisionDrag.node&&column.dataset.dropGroup!==decisionDrag.group?column:null;
}
window.addEventListener('pointermove',e=>{
  const move=decisionDrag;
  if(!move||move.pointer!==e.pointerId)return;
  if(!move.ghost){
    if(Math.hypot(e.clientX-move.x,e.clientY-move.y)<4)return;
    const rect=move.chip.getBoundingClientRect();
    move.offsetX=move.x-rect.left;
    move.offsetY=move.y-rect.top;
    move.scale=rect.width/move.chip.offsetWidth;
    move.ghost=move.chip.cloneNode(true);
    move.ghost.classList.add('decision-ghost');
    move.ghost.setAttribute('aria-hidden','true');
    move.ghost.inert=true;
    move.ghost.style.width=move.chip.offsetWidth+'px';
    move.chip.setPointerCapture(e.pointerId);
    move.chip.classList.add('chip-dragging');
    document.body.append(move.ghost);
  }
  move.nextX=e.clientX;
  move.nextY=e.clientY;
  if(!move.frame)move.frame=requestAnimationFrame(()=>{
    move.frame=0;
    move.ghost.style.transform='translate3d('+(move.nextX-move.offsetX)+'px,'+(move.nextY-move.offsetY)+'px,0) scale('+move.scale+')';
    highlightDrop(decisionDestination(move.nextX,move.nextY));
  });
});
window.addEventListener('pointerup',e=>{
  if(decisionDrag?.pointer!==e.pointerId)return;
  const {id,text,ghost}=decisionDrag;
  const column=ghost?decisionDestination(e.clientX,e.clientY):null;
  endDecisionDrag();
  if(column)workflow.moveCard(column,id,column.dataset.dropGroup);
  else if(!ghost&&text)text.focus({preventScroll:true});
});
window.addEventListener('pointercancel',e=>{
  if(decisionDrag?.pointer===e.pointerId)endDecisionDrag();
});
window.addEventListener('blur',endDecisionDrag);

function askStudio(task,context,image,owner){
  if(owner!==p)return Promise.resolve(null);
  if(!health.configured)return Promise.reject(Error('Live mode needs the configured studio server.'));
  if($('#modal').open)return Promise.resolve(null);
  return new Promise(resolve=>{
    modal(`<h2>Run live AI?</h2><p>Send this iteration’s brief and ${image?'current image':'design context'} to the configured model. Generated images and component suggestions are conceptual and need your review.</p>
      <label for="workflowPassword">Studio server password</label><input type="password" id="workflowPassword" autocomplete="off">
      <div class="row-buttons"><button id="cancelWorkflow" class="soft-button">Cancel</button><button id="runWorkflow" class="dark-button">Continue with AI</button></div>`);
    let result=null;
    const dialog=$('#modal');
    const controller=new AbortController();
    dialog.addEventListener('close',()=>{controller.abort();resolve(result);},{once:true});
    $('#cancelWorkflow').onclick=closeModal;
    $('#runWorkflow').onclick=async()=>{
      const button=$('#runWorkflow');
      button.disabled=true;button.textContent='Working…';
      try{
        const response=await fetch('/api/studio',{method:'POST',headers:{
          'Content-Type':'application/json','X-Studio-Password':$('#workflowPassword').value
        },body:JSON.stringify({task,context,image}),signal:AbortSignal.any([controller.signal,AbortSignal.timeout(230000)])});
        const data=await response.json();
        if(!response.ok)throw Error(data.error||'The AI request failed.');
        if(data.image)data.image=await compressedImage(await(await fetch(data.image)).blob());
        if(data.options)for(const option of data.options){
          if(option.image)option.image=await compressedImage(await(await fetch(option.image)).blob(),850,.75);
        }
        if(!dialog.open||controller.signal.aborted)return;
        result=data;closeModal();
      }catch(error){
        if(controller.signal.aborted)return;
        button.disabled=false;button.textContent='Try again';toast(error.message);
      }
    };
  });
}
