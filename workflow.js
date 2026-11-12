import {drawing} from './drawing.js';
import {robotOptions,robotParts,robotCards} from './robot.js';

export const groups = ['keep', 'explore', 'constraints'];
export const roundId = (round, type) => round.id === 'root' ? type : round.id + '-' + type;
const exampleCards = [
  ['keep','Preserve the mushroom silhouette',1], ['keep','Maintain precise light direction'],
  ['keep','Warm, diffused light',0,'warm'], ['keep','Ensure compatibility with the chosen stem and light module'],
  ['keep','Maintain the shade to be lightweight'],
  ['explore','Adjustable light angles',1,'angle'], ['explore','Assembly order and access to fasteners',1],
  ['explore','Screw, clip, or magnetic attachment to the stem',1], ['explore','Light cover attachment and removal',1],
  ['explore','Workshop materials and fabrication methods'],
  ['constraints','Ensure stability during adjustment',1,'stability'], ['constraints','Provide access for assembly'],
  ['constraints','Shade diameter ≤140 mm'], ['constraints','Allow damaged parts to be replaced',1],
  ['constraints','Reduce material use without affecting durability'],
];
const examples = [
  ['Collapsible stem','A compact mushroom lamp with a collapsible stem that reduces storage space and material use. Its simple structure supports efficient manufacturing, assembly, and shared charging.'],
  ['Adjustable cap','A collapsible mushroom lamp with an adjustable cap for directional lighting. Its modular design supports easier assembly, repair, and component replacement while maintaining compact storage.'],
  ['Stackable flat cap','A collapsible mushroom lamp with a flat cap for efficient stacking and shared charging. Its modular structure supports space-saving storage, material efficiency, and easier maintenance.'],
];
const generic = [
  ['Reduce the envelope','Reorganise the selected components to reduce the footprint. Compare clearances and stability.'],
  ['Expose the assembly','Explore visible, serviceable connections. Check assembly order, fastener access and replacement.'],
  ['Separate the modules','Split the concept into replaceable modules. Check interfaces, material choice and setup effort.'],
];
const imagePattern = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const assets = new Set(['lamp','lamp-revision','shade','stem','base','warm','angle','stability','concept-1','concept-2','concept-3']);
export const inlineImage = value => typeof value==='string' && value.length<=3_000_000 && imagePattern.test(value);
const earlierRobotPhotos = ['robot-photo-rear','robot-photo-mid','robot-photo-centered'];
const robotBaseline = 'robot-photo-centered';
const robotPartPhotos = {'robot-head':'milo-part-face','robot-mount':'milo-part-hinge','robot-base':'milo-part-base'};
const robotVariantParts = {
  'robot-cantilever-v2':{'robot-mount':'milo-part-cantilever-mount','robot-base':'milo-part-cantilever-base'},
  'robot-slide-rail-v2':{'robot-mount':'milo-part-rail-mount','robot-base':'milo-part-rail-base'},
  'robot-fixed-hinge-v2':robotPartPhotos
};
const robotPhotos = new Set([...earlierRobotPhotos,...robotOptions.map(option=>option[2]),...Object.values(robotPartPhotos),
  ...Object.values(robotVariantParts).flatMap(Object.values)]);
const robotAssets = new Set(['robot-concept','robot-sketch','robot-rear','robot-mid','robot-wide',...robotParts.map(part=>part[1]),...robotPhotos]);
const safeImage = value => inlineImage(value)||assets.has(value)||robotAssets.has(value)?value:'';
const validId = value => typeof value==='string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value) && !['__proto__','constructor','prototype'].includes(value);
const str = (value,max=2000) => typeof value==='string'?value.slice(0,max):'';
const validSize = value => Number.isFinite(value)&&value>0&&value<=10000;
const size = (value,fallback) => validSize(value)?value:fallback;
const list = (value,max) => Array.isArray(value)?value.slice(0,max):[];
const count = value => [1,2,3].includes(value)?value:3;
const history = records => list(records,100).filter(entry=>str(entry?.text)).map(entry=>({text:str(entry.text),at:str(entry.at,40),source:str(entry.source,100)}));

function makePart(uid,name,kind='custom',width=120,height=30,selected=false){
  return {id:uid(),name,kind,width,height,selected,change:'',image:'',variant:0,history:[]};
}
export function makeRound(project,uid,id='root',parent=null,option=null,variant=0) {
  const lamp=project.template==='lamp',robot=project.template==='robot';
  const defaults=project.kind==='architecture'?['Canopy','Entrance','Seating edge']:lamp?['Shade','Stem','Base']:['Housing','Core assembly','Base'];
  return {
    id,parent,variant,iteration:(parent?.iteration||0)+1,confirmed:false,partsConfirmed:false,sizesConfirmed:false,cardsConfirmed:false,
    image:option?.image||(robot?robotBaseline:lamp?'lamp':''),model:option?.model||'',change:robot?'Try moving the tilt bracket toward the back.':lamp?'Keep the shade compact and the base slim.':'',
    preview:0,history:[],parts:robot?robotParts.map(([name,kind,w,h],i)=>makePart(uid,name,kind,w,h,i===1)):defaults.map((name,i)=>makePart(uid,name,lamp?['shade','stem','base'][i]:'custom',lamp?[140,55,90][i]:120,lamp?[40,30,30][i]:30,i===0)),
    dimensions:{width:lamp?140:120,height:robot?150:100,base:90},cards:[],brief:null,options:[],picked:[],count:3,intentSnapshot:project.problem
  };
}
function makeCards(project,round,uid) {
  const parts=round.parts.filter(part=>part.selected).map(part=>part.name).join(', ');
  const rows=project.template==='robot'?robotCards:project.template==='lamp'?exampleCards:[
    ...project.features.filter(text=>text.trim()).map(text=>['keep',text]),
    ['explore','Explore material and attachment options for '+parts,1],
    ['explore','Compare assembly sequence and access to fasteners',1],
    ['constraints','Check the target envelope, safe use and part replacement',1],
  ];
  return rows.map(([group,text,sample,image])=>({id:uid(),group,text:text==='Shade diameter ≤140 mm'?'Shade diameter ≤'+round.dimensions.width+' mm':text,origin:sample?'sample':'designer',image:image||''}));
}
function decisionSections(round) {
  return Object.fromEntries(groups.map(group=>[group,round.cards.filter(card=>card.group===group&&card.text.trim()).map(card=>card.text.trim())]));
}
function syncRobotBrief(project,round) {
  if(project.kind==='robotics'&&round.brief){
    for(const [group,items] of Object.entries(decisionSections(round)))round.brief[group]=items.join('\n');
  }
}
function makeBrief(project,round) {
  const parts=round.parts.filter(part=>part.selected).map(part=>part.name.toLowerCase()).join(', ');
  const brief={summary:project.template==='lamp'&&parts==='shade'?'Design a compact shade for a student desk lamp.':project.product+' for '+project.target+'. Focus on '+parts+'.',problem:project.problem};
  for(const group of groups) brief[group]=round.cards.filter(card=>card.group===group&&card.text.trim()).map(card=>card.text.trim().replace(/[.。]$/,'')+'.').join(' ');
  return brief;
}
function sampleOptions(project,round) {
  const lamp=project.template==='lamp';
  return (project.template==='robot'?robotOptions:lamp?examples:generic).slice(0,round.count).map(([title,text,art],i)=>({title,text,image:art||(lamp?'concept-'+(i+1):''),origin:'sample'}));
}

export function ensureStudio(project,uid) {
  if(project.studio?.rounds?.length){
    for(const round of project.studio.rounds){
      if(project.template==='robot'&&round.image==='robot-concept')round.image=robotBaseline;
      syncRobotBrief(project,round);
      // Refresh the old prepared study only when no selections or branches depend on it.
      if(project.template==='robot'&&!round.picked.length&&round.options.length&&
        round.options.every((option,i)=>option.origin==='sample'&&option.image===['robot-rear','robot-mid','robot-wide'][i])&&
        !project.studio.rounds.some(child=>child.parent?.roundId===round.id)){
        round.options=sampleOptions(project,{...round,count:round.options.length});
      }
      if(project.template==='robot')round.options.forEach((option,i)=>{
        // Keep the original proposal if a saved branch already builds on it.
        if(option.origin==='sample'&&option.image===earlierRobotPhotos[i]&&
          !project.studio.rounds.some(child=>child.parent?.roundId===round.id&&child.parent.index===i)){
          const [title,text,image]=robotOptions[i];
          round.options[i]={...option,title,text,image};
        }
      });
    }
    return project.studio;
  }
  project.template||=project.title==='Desk Lamp Redesign'&&project.kind==='industrial'?'lamp':'custom';
  const root=makeRound(project,uid), stage=project.progress||0;
  root.image=safeImage(project.images?.proposal)||((stage>1&&project.sketchTab!=='generate')?safeImage(project.images?.original):'')||root.image;
  root.change=project.changeRequest||root.change;
  root.history=list(project.changes,100).map(entry=>({...entry,source:'Previous workspace'}));
  root.confirmed=stage>=3; root.partsConfirmed=stage>=4; root.sizesConfirmed=stage>=5; root.cardsConfirmed=stage>=6;
  root.count=count(project.alternativeCount);
  root.dimensions.width=size(project.sizes?.width,root.dimensions.width);
  root.dimensions.height=project.template==='lamp'&&project.sizes?.height===280?100:size(project.sizes?.height,root.dimensions.height);
  root.dimensions.base=size(project.sizes?.depth,root.dimensions.base);
  if(stage>=3&&project.components?.length) root.parts=project.components.map((part,i)=>{
    const seed=root.parts[i];
    return makePart(()=>part.id||uid(),part.name,seed?.kind,size(project.componentSizes?.[i]?.width,seed?.width||40),
      size(project.componentSizes?.[i]?.height,seed?.height||30),part.selected);
  });
  if(stage>=4) root.cards=project.cards?.length&&(project.cards.length>3||project.template!=='lamp')?project.cards.map(card=>({...card,origin:'designer',image:''})):makeCards(project,root,uid);
  if(stage>=6) {root.brief=makeBrief(project,root);if(project.brief)root.brief.summary=project.brief;}
  syncRobotBrief(project,root);
  if(stage>=7) root.options=sampleOptions(project,root);
  root.picked=list(project.selected,3).filter(n=>[0,1,2].includes(n));
  const rounds=[root];
  for(const branch of project.branches||[]) {
    const prev=rounds.find(round=>round.id===branch.parent)||root;
    const child=makeRound(project,uid,branch.id,{roundId:prev.id,index:branch.variant,iteration:prev.iteration},
      {image:safeImage(branch.image)||root.options[branch.variant]?.image},branch.variant);
    child.intentSnapshot=branch.intentSnapshot||project.problem;
    rounds.push(child);
  }
  project.positions=Object.fromEntries(Object.entries(project.positions||{}).filter(([key])=>project.items?.some(item=>item.id===key)));
  project.studio={intentConfirmed:stage>0,sketchConfirmed:stage>1,sketchMode:project.sketchTab==='generate'?'generate':'upload',
    sketchName:project.images?.original?'Uploaded sketch':project.sketchReady?(project.template==='robot'?'Milo form sketch':'desk-lamp-sketch.png'):'',
    direction:project.template==='lamp'?'Compact desk lamp with warm, focused light and an adjustable direction.':'',current:rounds.at(-1).id,rounds};
  return project.studio;
}

export function sanitizeStudio(raw,project,uid) {
  if(!raw||!Array.isArray(raw.rounds)||raw.rounds[0]?.id!=='root') return;
  const rounds=[];
  for(const record of raw.rounds.slice(0,30)){
    if(!record||!validId(record.id)||rounds.some(round=>round.id===record.id))continue;
    const prev=rounds.find(round=>round.id===record.parent?.roundId);
    if(record.id!=='root'&&(!prev||![0,1,2].includes(record.parent?.index)))continue;
    const variant=[0,1,2].includes(record.variant)?record.variant:0;
    const parent=prev?{roundId:prev.id,index:record.parent.index,iteration:prev.iteration}:null;
    const round=makeRound(project,uid,record.id,parent,null,variant);
    for(const key of ['confirmed','partsConfirmed','sizesConfirmed','cardsConfirmed']) round[key]=!!record[key];
    Object.assign(round,{intentSnapshot:str(record.intentSnapshot)||project.problem,image:safeImage(record.image),change:str(record.change),
      preview:[0,1,2,3].includes(record.preview)?record.preview:0,model:str(record.model,100),history:history(record.history),count:count(record.count)});
    for(const key of Object.keys(round.dimensions))round.dimensions[key]=size(record.dimensions?.[key],round.dimensions[key]);
    const parts=list(record.parts,20).filter(part=>validId(part?.id)&&str(part.name,100).trim()).map(part=>({
      id:part.id,name:str(part.name,100),selected:!!part.selected,kind:['shade','stem','base',...robotParts.map(row=>row[1])].includes(part.kind)?part.kind:'custom',
      width:size(part.width,40),height:size(part.height,30),change:str(part.change),image:safeImage(part.image),
      variant:[0,1,2,3].includes(part.variant)?part.variant:0,history:history(part.history),model:str(part.model,100)
    }));
    if(parts.length)round.parts=[...new Map(parts.map(part=>[part.id,part])).values()];
    round.cards=list(record.cards,100).filter(card=>validId(card?.id)&&groups.includes(card.group)).map(card=>({
      id:card.id,group:card.group,text:str(card.text,1500),origin:['sample','live'].includes(card.origin)?card.origin:'designer',image:safeImage(card.image)
    }));
    round.cards=[...new Map(round.cards.map(card=>[card.id,card])).values()];
    if(record.brief&&typeof record.brief==='object')round.brief=Object.fromEntries(['summary','problem',...groups].map(key=>[key,str(record.brief[key],6000)]));
    if(!round.brief)round.cardsConfirmed=false;
    syncRobotBrief(project,round);
    round.options=list(record.options,3).filter(option=>str(option?.title,160)).map(option=>({
      title:str(option.title,160),text:str(option.text),image:safeImage(option.image),origin:option.origin==='live'?'live':'sample',model:str(option.model,100)
    }));
    round.picked=[...new Set(list(record.picked,3).filter(n=>Number.isInteger(n)&&n>=0&&n<round.options.length))];
    rounds.push(round);
  }
  if(!rounds.length)return;
  return {intentConfirmed:!!raw.intentConfirmed,sketchConfirmed:!!raw.sketchConfirmed,sketchMode:raw.sketchMode==='generate'?'generate':'upload',
    sketchName:str(raw.sketchName,200),direction:str(raw.direction),current:rounds.some(round=>round.id===raw.current)?raw.current:'root',rounds};
}

const titles={intent:'Express design intent',sketch:'Starting sketch',concept:'Polished concept',parts:'Components',sizes:'Overall size',partSizes:'Component sizes',decisions:'Keep, Explore & Constraints',brief:'Design brief',alternatives:'Concept alternatives'};
const steps={intent:'Confirm intent',concept:'Confirm concept',parts:'Confirm components',sizes:'Confirm overall size',decisions:'Confirm decisions',brief:'Confirm & generate alternatives',alternatives:'Select concepts to branch'};
const labels={keep:'What should stay?',explore:'What could change?',constraints:'What must it meet?'};
const partGlyph={
  shade:'M60 116C62 85 112 50 166 50s103 35 106 66c-20 13-192 13-212 0Z M60 116c36 5 176 5 212 0',
  stem:'M125 81h83c1 14 19 22 20 36-6 18-117 18-124 0 1-14 20-22 21-36Z',
  base:'M106 88c0-19 121-19 121 0v29c0 19-121 19-121 0V88Zm0 0c0 18 121 18 121 0',
  'robot-head':'M61 90q0-40 42-40h124q44 0 44 40t-44 40H103q-42 0-42-40z M84 91q0-27 31-27h101q32 0 32 27t-32 27H115q-31 0-31-27z',
  'robot-mount':'M85 126h162v-19h-40l-9-53h-64l-17 53H85z M161 76a9 9 0 1 0 18 0 9 9 0 1 0-18 0',
  'robot-base':'M66 105q0-24 24-24h153q24 0 24 24v7q0 21-24 21H90q-24 0-24-21z',
  custom:'M69 78h195v54H69z M69 86l20-15h154l21 15'
};
const robotPartOutlines={
  'robot-head':{view:'Front',bounds:[61,45,267,135],path:'M104 45H224Q267 45 267 90T224 135H104Q61 135 61 90T104 45Z M108 58H220Q252 58 252 90T220 122H108Q76 122 76 90T108 58Z'},
  'robot-mount':{view:'Front',bounds:[90,56,240,130],path:'M106 56Q90 56 90 72V111Q90 130 110 130H220Q240 130 240 111V72Q240 56 224 56Q209 56 209 72V102H121V72Q121 56 106 56Z M90 111H121M209 111H240 M99 76a7 7 0 1 0 14 0a7 7 0 1 0-14 0 M217 76a7 7 0 1 0 14 0a7 7 0 1 0-14 0'},
  'robot-base':{view:'Front',bounds:[62,71,266,127],path:'M91 71H237Q266 71 266 99T237 127H91Q62 127 62 99T91 71Z M65 108H263 M141 71v9h46v-9'}
};
const robotVariantOutlines={
  'robot-cantilever-v2':{
    'robot-mount':{view:'Side',bounds:[95,44,235,140],path:'M117 44a22 22 0 0 0 0 44h49q12 0 12 12v28h-29v12h86v-12h-28V93q0-28-29-28h-41a22 22 0 0 0-20-21Z M117 54a12 12 0 1 0 0 24a12 12 0 1 0 0-24 M158 128v12m67-12v12'},
    'robot-base':{view:'Side',bounds:[57,62,268,129],path:'M75 79H180L195 62H244Q268 62 268 86V109Q268 129 249 129H76Q57 129 57 109V100Q57 79 75 79Z M57 111H268 M207 62v11m27-11v11'}
  },
  'robot-slide-rail-v2':{
    'robot-mount':{view:'Side',bounds:[51,62,267,128],path:'M59 106H259Q267 106 267 114V120Q267 128 259 128H59Q51 128 51 120V114Q51 106 59 106Z M63 117H255 M129 106V93Q129 87 136 87H179Q186 87 186 93V106 M150 87V75H165V87 M146 75V62H169V75Z M136 98h6m31 0h6'},
    'robot-base':{view:'Side',bounds:[50,78,270,125],path:'M77 78H243Q270 78 270 102T243 125H77Q50 125 50 102T77 78Z M52 110H268 M93 78v8h134v-8'}
  }
};
const overallGlyph='M50 149C54 105 107 53 166 53s112 52 116 96c-7 25-225 25-232 0Z M50 149c41 11 193 11 232 0 M123 166c-1 9-8 14-8 24 2 16 100 16 102 0 0-10-7-15-8-24 M121 195c-14 10-22 23-21 42 1 36 132 36 133 0 1-19-7-32-22-42 M100 235c13 22 119 22 133 0';
function diagram(esc,values,part,lamp,robot,outline) {
  const overall=!part, shape=overall?(robot?'M50 117q0-62 62-62h108q62 0 62 62t-62 62H112q-62 0-62-62z M144 179v35m44-35v35 M101 230q0-16 16-16h100q16 0 16 16v13q0 16-16 16H117q-16 0-16-16z':lamp?overallGlyph:'M50 54h232v205H50z M50 70l15-16h204l13 16'):partGlyph[part.kind];
  const marker=(key,label,cls,position='')=>`<label class="measure ${cls}"${position?' style="'+position+'"':''}><input type="number" aria-label="${esc(label)} in mm" data-dimension="${key}" min="1" max="10000" step="any" value="${values[key]}"><span>mm</span></label>`;
  let arrows=overall?'M50 36h232m-232-5v10m232-10v10m-8 12h28m-71 209h71m-11-209v209m-5-203 5-6 5 6m-10 197 5 6 5-6M100 280h133m-127-5-6 5 6 5m121-10 6 5-6 5':
    'M60 35h212m-206-5-6 5 6 5m200-10 6 5-6 5M292 51v78m-5-72 5-6 5 6m-10 66 5 6 5-6';
  let widthPosition='',heightPosition='';
  if(outline){
    const [x1,y1,x2,y2]=outline.bounds;
    arrows=`M${x1} 30H${x2} M${x1} 25v10 M${x2} 25v10
      M${x2+7} ${y1}H293 M${x2+7} ${y2}H293 M287 ${y1}V${y2}
      M283 ${y1+5}l4-5 4 5 M283 ${y2-5}l4 5 4-5`;
    widthPosition=`left:${(x1+x2)/6.9}%;top:8%`;
    heightPosition=`top:${(y1+y2)/3.1}%`;
  }
  const visual=`<path class="dimension-shape" d="${outline?.path||shape||partGlyph.custom}"/>`;
  return `<div class="dimension-diagram ${overall?'overall':'part-diagram'}"><svg viewBox="0 0 345 ${overall?310:155}" aria-hidden="true">${visual}<path class="dimension-line" d="${arrows}"/></svg>${marker('width',overall?'Overall width':part.name+' width','top-measure',widthPosition)}${marker('height',overall?'Overall height':part.name+' height','right-measure',heightPosition)}${overall?marker('base',robot?'Base depth target':'Base width','bottom-measure'):''}</div>`;
}

export function createWorkflow(context) {
  const {project,uid,esc,icon,field,toast,event,render,focus,modal,closeModal,chooseImage,askStudio,assistant}=context;
  const board=()=>ensureStudio(project(),uid);
  const current=()=>board().rounds.find(round=>round.id===board().current)||board().rounds[0];
  const lamp=()=>project().template==='lamp';
  const robot=()=>project().template==='robot';
  const artUrl=value=>robotPhotos.has(value)||assets.has(value)?'studies/'+value+'.webp':robotAssets.has(value)?'studies/'+value+'.svg':'';
  const asset=(value,alt)=>{
    const url=artUrl(value)||(inlineImage(value)?value:'');
    return url?`<img src="${url}" alt="${esc(alt)}" draggable="false">`:'';
  };
  const image=(value,alt,fallback=0)=>asset(value,alt)||(lamp()||project().kind==='architecture'
    ?drawing(project().kind,fallback)
    :`<div class="empty-visual">${icon('image')}<span>Concept image</span><small>Add a sketch or generate with live AI</small></div>`);
  const area=(label,key,value,extra='')=>`<label class="flow-field"><span>${label}</span><textarea data-flow-field="${key}" maxlength="${key.startsWith('brief-')?6000:2000}" ${extra}>${esc(value)}</textarea></label>`;
  const action=(type,confirmed=false,label=steps[type],disabled=false)=>`<div class="node-action"><button data-flow-action="${type}" class="${confirmed?'confirmed':'dark-button'}" ${disabled?'disabled':''}>${confirmed?'✓ Confirmed':label}</button></div>`;
  const refresh=label=>`<button class="flow-refresh" data-flow-action="refresh" aria-label="${esc(label)}" title="${esc(label)}">↻</button>`;
  const selected=(checked,label,key)=>`<button class="flow-select" aria-label="${esc(label)}" aria-pressed="${checked}" data-flow-action="${key}">${checked?'✓':''}</button>`;
  const briefItems=items=>items.length
    ? `<ul>${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`
    : '<p>No decisions in this column yet.</p>';
  const header=(title,node,extra='')=>`<div class="node-header" data-drag="${node.id}"><span>${esc(title)}</span>${extra}</div>`;
  const robotVariant=round=>{
    if(robotVariantParts[round.image])return round.image;
    const origin=round.parent&&board().rounds.find(item=>item.id===round.parent.roundId)?.options[round.parent.index]?.image;
    return robotVariantParts[origin]?origin:'';
  };
  const partArt=(part,round)=>{
    if(part.image)return part.image;
    if(robot()){
      return robotVariantParts[robotVariant(round)]?.[part.kind]||robotPartPhotos[part.kind]||'';
    }
    return lamp()&&part.kind!=='custom'?part.kind:'';
  };
  const partVisual=(part,round)=>{
    const art=partArt(part,round);
    if(art)return asset(art,part.name);
    const shape=partGlyph[part.kind]||partGlyph.custom;
    return `<svg viewBox="50 37 232 110" aria-hidden="true"><path d="${shape}"/></svg>`;
  };
  const credit=(value,model)=>model?`<span class="visual-credit">AI image · ${esc(model)}</span>`:robotPhotos.has(value)?'<span class="visual-credit">Prepared concept render</span>':artUrl(value)?'<span class="visual-credit">Prepared example</span>':'';
  const cycleTitle=round=>round.id==='root'?'Polished concept':`Concept ${round.variant+1} · Iteration ${round.iteration}`;
  const currentNode=()=>roundId(current(),stage()===0?'concept':stage()===1?(current().cardsConfirmed?'brief':current().partsConfirmed?'decisions':'parts'):'alternatives');
  function stage(){
    const r=current();
    return r.options.length?2:r.confirmed?1:0;
  }
  function getNodes(){
    const s=board();
    const nodes=[{id:'intent',type:'intent',x:240,y:40}];
    if(s.intentConfirmed)nodes.push({id:'sketch',type:'sketch',x:860,y:40});
    const lanes=new Map();
    const partSizesOffset=round=>Math.max(860,round.parts.length*253+155);
    const laneHeight=robot()?Math.max(2100,...s.rounds.filter(round=>round.parent).map(round=>
      partSizesOffset(round)+round.parts.length*455+64)):2100;
    for(const round of s.rounds){
      if(round.id==='root'&&!s.sketchConfirmed)continue;
      const parentLane=lanes.get(round.parent?.roundId)??0;
      const lane=round.id==='root'?0:Math.max(parentLane,...s.rounds.filter(r=>r.iteration===round.iteration&&lanes.has(r.id)).map(r=>lanes.get(r.id)+1));
      lanes.set(round.id,lane);
      const x=1480+(round.iteration-1)*3220,y=40+lane*laneHeight;
      const add=(type,dx,dy)=>nodes.push({id:roundId(round,type),type,round,x:x+dx,y:y+dy});
      add('concept',0,0);
      if(round.confirmed){add('parts',620,0);add('sizes',0,720);add('partSizes',620,partSizesOffset(round));}
      if(round.partsConfirmed)add('decisions',1240,0);
      if(round.cardsConfirmed)add('brief',2200,0);
      if(round.options.length)add('alternatives',2670,0);
    }
    return nodes;
  }
  function edges(){
    const s=board(), result=[];
    if(s.intentConfirmed)result.push({from:'intent',to:'sketch'});
    if(s.sketchConfirmed)result.push({from:'sketch',to:'concept'});
    for(const round of s.rounds){
      const connect=(from,to,extra={})=>result.push({from:roundId(round,from),to:roundId(round,to),...extra});
      if(round.parent){
        const prev=s.rounds.find(r=>r.id===round.parent.roundId);
        const alternative=prev?.options[round.parent.index];
        result.push({from:roundId(prev,alternative?'alternatives':'concept'),to:roundId(round,'concept'),index:alternative?round.parent.index:undefined,dashed:true});
      }
      if(round.confirmed){connect('concept','parts');connect('concept','sizes',{vertical:true});connect('sizes','partSizes');}
      if(round.partsConfirmed)connect('parts','decisions');
      if(round.cardsConfirmed)connect('decisions','brief');
      if(round.options.length)connect('brief','alternatives');
    }
    return result;
  }

  function renderNode(node) {
    const s=board(),p=project(),r=node.round;
    const block=(body,after='',title=titles[node.type],head='')=>`<div class="node-card">${header(title,node,head)}<div class="node-body">${body}</div></div>${after}`;
    switch(node.type){
    case 'intent':
      return block(`<p class="node-description">${p.kind==='robotics'?'Define who the robot is for, what it should do and what must stay through each iteration.':'The starting point for your design exploration.'}</p>
        ${field('target','Target user',p.target,'user')}${field('product',p.kind==='robotics'?'Robot concept':'Product',p.product,'product')}${field('problem','Problem',p.problem,'problem')}
        <div class="field"><label>${icon('features')}Essential features</label>${p.features.map((feature,i)=>`<div class="feature-row"><input aria-label="Feature ${i+1}" data-feature="${i}" maxlength="300" value="${esc(feature)}" placeholder="Add an essential feature"><button data-remove-feature="${i}" class="remove-feature" aria-label="Remove feature ${i+1}">−</button></div>`).join('')}<button data-flow-action="add-feature" class="add-dashed">+ Add feature</button></div>`,action('intent',s.intentConfirmed));
    case 'sketch': {
      const upload=s.sketchMode==='upload', preview=s.sketchName||p.images.original;
      return block(`<p class="node-description">${upload?'Add a sketch and describe what matters.':'Create a starting point from your design intent.'}</p>
        <div class="sketch-tabs"><button data-flow-action="upload-tab" class="soft-button">↑ &nbsp; Upload sketch</button><button data-flow-action="generate-tab" class="${upload?'soft-button':'dark-button'}">✦ &nbsp; Generate image</button></div>
        ${upload?(preview?`<div class="sketch-file"><button data-flow-action="preview-sketch" title="View sketch">${esc(s.sketchName||'Uploaded sketch')}</button><button class="soft-button" data-flow-action="upload-tab">Replace</button></div>`:lamp()||robot()?'<button class="sample-link" data-flow-action="sample-sketch">Use sample sketch</button>':''):area('Design direction','direction',s.direction,'placeholder="Describe the form, behaviour and use context"')}
        ${area('Description (optional)','description',p.description)}`,
        action('sketch',s.sketchConfirmed,upload?'Confirm sketch':'Confirm & generate',upload&&!preview),upload?'Starting sketch':'Generate image');
    }
    case 'concept': {
      const visual=r.preview&&robotAssets.has(r.image)?robotOptions[(robotOptions.findIndex(o=>o[2]===r.image)+r.preview)%robotOptions.length][2]:r.preview&&lamp()&&r.image==='lamp'?'lamp-revision':r.image;
      return block(`<p class="node-description">${r.id==='root'?'Does this keep your original design intent?':'Refine this direction while keeping your design intent.'}</p>
        <div class="concept-image ${r.preview&&r.id!=='root'?'branch-preview':''}">${image(visual,'Concept visual',r.variant)}${refresh('Refresh concept image')}${credit(visual,r.model)}</div>
        ${area('Describe a change','change',r.change,'rows="1"')}
        <div class="apply-row"><button class="soft-button" data-flow-action="apply" ${r.change.trim()?'':'disabled'}>Apply changes</button>${!lamp()&&!r.model?'<button class="soft-button" data-flow-action="replace-concept">Upload concept</button>':''}</div>`,
        p.kind==='robotics'&&r.confirmed?'<div class="node-action"><button class="soft-button" data-flow-action="concept">View components →</button></div>':action('concept',r.confirmed),cycleTitle(r),'<button class="flow-make" data-flow-action="making">✦ &nbsp; How to make it</button>');
    }
    case 'parts':
      return `<div class="component-stack ${p.kind==='robotics'?'robot-component-stack':''}">${r.parts.map(part=>`<div class="node-card ${part.selected?'picked':''}" data-part="${part.id}">
        ${header(part.name,node,selected(part.selected,'Select '+part.name,'select-part'))}
        <div class="node-body component-edit"><div class="part-image ${part.variant?'variation-'+part.variant:''}">${p.kind==='robotics'?`<button class="part-preview-button" data-flow-action="preview-part" aria-label="View ${esc(part.name)}">${partVisual(part,r)}<span aria-hidden="true">↗</span></button>`:partVisual(part,r)}${p.kind!=='robotics'||p.mode==='live'?refresh('Refresh '+part.name):''}</div>
        <div>${area('Describe a change','part-change',part.change,'rows="1"')}<div class="part-actions"><button class="soft-button" data-flow-action="apply-part" ${part.change.trim()?'':'disabled'}>${p.kind==='robotics'&&p.mode!=='live'?'Save change':'Apply changes'}</button>${p.kind==='robotics'?`<button class="soft-button part-upload" data-flow-action="part-image" aria-label="Upload image for ${esc(part.name)}">Upload image</button>`:''}</div></div></div></div>`).join('')}</div>
        <button class="add-dashed" data-flow-action="add-component">+ Add components</button>${action('parts',r.partsConfirmed)}`;
    case 'sizes':
      return block(`<p class="node-description">Set the scale of your concept before refining its parts.</p><p class="diagram-hint">Edit the measurements directly on the drawing · mm</p>
        ${diagram(esc,r.dimensions,null,lamp(),robot())}
        <p class="node-description">Set overall dimensions, then check the size of each component.</p><p class="diagram-hint">Use measurements or a quick mock-up to verify scale.</p>`,action('sizes',r.sizesConfirmed));
    case 'partSizes':
      return `<div class="size-stack">${r.parts.map(part=>{
        const outline=robot()?(robotVariantOutlines[robotVariant(r)]?.[part.kind]||robotPartOutlines[part.kind]):null;
        const hint=outline?`${outline.view} view · Edit target dimensions in mm. Reference only.`:'Edit the dimensions directly on the component.';
        return `<div class="node-card" data-part="${part.id}">${header(part.name+' size',node)}<div class="node-body"><p class="node-description">${hint}</p>${diagram(esc,part,part,lamp(),robot(),outline)}</div></div>`;
      }).join('')}</div>`;
    case 'decisions': {
      const names=r.parts.filter(part=>part.selected).map(part=>part.name).join(', ');
      return block(`<p class="node-description">Drag a card from anywhere on its surface. Tap the text to edit, or use Move to.</p>
        <div class="decision-columns">${groups.map((group,i)=>`<section class="decision-column ${group}" data-drop-group="${group}"><h4>${icon(['features','search','product'][i])} ${group.toUpperCase()}</h4><p>${labels[group]}</p>
        ${r.cards.filter(card=>card.group===group).map(card=>`<div class="decision-chip" data-decision="${card.id}">
          <div class="chip-top"><span class="chip-grip">${card.origin==='live'?'⠿ AI suggestion':card.origin==='sample'?'⠿ Example suggestion':'⠿ Your decision'}</span><button data-flow-action="remove-card" aria-label="Remove decision card">−</button></div>
          <textarea aria-label="${group} decision" data-flow-field="card" rows="${Math.max(2,Math.ceil(card.text.length/29))}" maxlength="1500" placeholder="Type your decision…">${esc(card.text)}</textarea>
          ${card.image==='robot-mount'||card.image===robotPartPhotos['robot-mount']?asset(robotPartPhotos['robot-mount'],'Milo tilt bracket render'):asset(card.image,'Decision reference')}
          <div class="chip-tools"><button data-flow-action="card-image" class="tiny-button">${card.image?'Replace image':'+ Image'}</button>
          <select aria-label="Move decision card" data-flow-field="move-card" title="Move card"><option value="" hidden>Move to…</option>${groups.filter(key=>key!==group).map(key=>`<option value="${key}">${key[0].toUpperCase()+key.slice(1)}</option>`).join('')}</select></div></div>`).join('')}
        <button class="add-dashed" data-flow-action="add-card">+ Add card</button></section>`).join('')}</div>`,
        p.kind==='robotics'&&r.cardsConfirmed?'<div class="node-action"><button class="soft-button" data-flow-action="decisions">View Design Brief →</button></div>':action('decisions',r.cardsConfirmed,p.kind==='robotics'?'Confirm & build brief':steps.decisions),titles.decisions,`<span class="flow-badge">✓ ${esc(names)} selected</span>`);
    }
    case 'brief': {
      const linked=p.kind==='robotics', sections=linked?decisionSections(r):null;
      return block(`<p class="diagram-hint">Iteration ${String(r.iteration).padStart(2,'0')}</p>
        <textarea class="brief-summary" aria-label="Design brief summary" data-flow-field="brief-summary" rows="2" maxlength="6000">${esc(r.brief.summary)}</textarea>
        ${linked?'<p class="node-description">Linked to your decision cards. Move or edit a card to update this brief.</p>':''}
        ${groups.map(group=>`<div class="brief-group ${group}">${linked?`<h4>${group.toUpperCase()}</h4><div class="brief-items" data-brief-items="${group}">${briefItems(sections[group])}</div>`:area(group==='explore'?'EXPLORE / CHANGE':group.toUpperCase(),'brief-'+group,r.brief[group],`rows="${Math.max(3,Math.ceil(r.brief[group].length/43))}"`)}</div>`).join('')}
        ${area('Problem to address','brief-problem',r.brief.problem)}
        ${robot()?'<button class="soft-button render-gallery-link" data-flow-action="robot-renders">View 3 product renders ↗</button>':''}
        <label class="flow-field"><span>Number of alternatives</span><small>Choose how many variations to generate.</small><select data-flow-field="count" ${r.options.length?'disabled':''}>${[1,2,3].map(n=>`<option value="${n}" ${r.count===n?'selected':''}>${n} ${n===1?'alternative':'alternatives'}</option>`).join('')}</select></label>`,robot()&&r.options.length?'<div class="node-action"><button class="soft-button" data-flow-action="brief">View product concepts →</button></div>':action('brief',r.options.length>0,robot()&&p.mode!=='live'?'Open product concepts':steps.brief));
    }
    case 'alternatives': {
      const allBranched=r.picked.length>0&&r.picked.every(i=>s.rounds.some(child=>child.parent?.roundId===r.id&&child.parent.index===i));
      return `<div class="alternative-stack">${r.options.map((option,i)=>`<div class="node-card ${r.picked.includes(i)?'picked':''}" data-alt-anchor="${i}">
        ${header(robotPhotos.has(option.image)?option.title:'Concept '+(i+1),node,selected(r.picked.includes(i),'Select Concept '+(i+1),'select-option'))}
        <div class="node-body"><div class="alternative-art" title="${esc(option.title)}">${image(option.image,option.title,i)}${credit(option.image,option.model)}</div>
        <p class="option-copy">${esc(option.text)}</p></div></div>`).join('')}</div>${action('alternatives',allBranched,steps.alternatives,!r.picked.length)}`;
    }
    default:return '';
    }
  }

  const phaseNode=phase=>{
    const s=board(),r=current();
    if(phase===0)return r.id==='root'?'intent':roundId(r,'concept');
    if(phase===1)return roundId(r,r.cardsConfirmed?'brief':r.partsConfirmed?'decisions':'parts');
    return roundId(r,'alternatives');
  };
  const resumeNode=()=>board().sketchConfirmed?currentNode():board().intentConfirmed?'sketch':'intent';
  const title=node=>node.type==='concept'?cycleTitle(node.round):titles[node.type]||node.type;
  const dataFor=target=>{
    const node=target.closest('[data-node]');
    const round=board().rounds.find(r=>r.id===node?.dataset.round)||current();
    return {round,part:round.parts.find(p=>p.id===target.closest('[data-part]')?.dataset.part),
      card:round.cards.find(c=>c.id===target.closest('[data-decision]')?.dataset.decision)};
  };
  function activate(round){
    board().current=round.id;
    const p=project();
    p.variant=round.variant;
    p.ai=null;
  }
  function syncBranch(round){
    if(round.id==='root')return;
    const p=project(), old=p.branches.find(b=>b.id===round.id);
    const values={id:round.id,type:'branch',variant:round.variant,iteration:round.iteration,parent:round.parent.roundId,
      image:null,intentSnapshot:round.intentSnapshot,x:0,y:0};
    if(old)Object.assign(old,values);else p.branches.push(values);
  }
  function update(type,round,focusType,detail={}){
    activate(round);
    syncBranch(round);
    syncRobotBrief(project(),round);
    event(type,{round:round.id,...detail});
    render();
    if(focusType)focus(roundId(round,focusType));
  }
  const modelContext=(round,extra={})=>{
    const p=project();
    return {discipline:p.kind,product:p.product,target:p.target,problem:round.brief?.problem||p.problem,
      features:p.features,dimensions:round.dimensions,parts:round.parts.filter(part=>part.selected).map(({name,width,height})=>({name,width,height})),
      description:p.description,direction:board().direction,brief:round.brief,...extra};
  };
  async function live(task,round,extra={},visual){
    const p=project(), imageValue=inlineImage(visual)?visual:assets.has(visual)||robotPhotos.has(visual)?await localAsset(visual):undefined;
    return askStudio(task,modelContext(round,extra),imageValue,p);
  }
  async function localAsset(name){
    try {
      const response=await fetch('studies/'+name+'.webp');
      if(!response.ok)return;
      const blob=await response.blob();
      return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)});
    }catch{return undefined}
  }
  function textInput(target){
    const p=project(),s=board(), {round,part,card}=dataFor(target);
    const key=target.dataset.flowField;
    if(target.dataset.dimension){
      const holder=part||round.dimensions;
      holder[target.dataset.dimension]=target.value===''?0:Number(target.value);
      return true;
    }
    if(!key)return false;
    const value=target.value;
    if(key==='direction')s.direction=value;
    else if(key==='description')p.description=value;
    else if(key==='change')round.change=value;
    else if(key==='part-change'&&part)part.change=value;
    else if(key==='card'&&card){
      card.text=value;
      if(p.kind==='robotics'&&round.brief){
        syncRobotBrief(p,round);
        const items=document.getElementById('node-'+roundId(round,'brief'))?.querySelector('[data-brief-items="'+card.group+'"]');
        if(items)items.innerHTML=briefItems(decisionSections(round)[card.group]);
      }
    }
    else if(key==='count')round.count=Number(value);
    else if(key.startsWith('brief-')&&round.brief)round.brief[key.slice(6)]=value;
    if(key==='change'||key==='part-change'){
      const button=target.closest('.node-body').querySelector('[data-flow-action="'+(key==='change'?'apply':'apply-part')+'"]');
      if(button)button.disabled=!value.trim();
    }
    return true;
  }
  function moveCard(target,id,group){
    if(!groups.includes(group))return;
    const {round,card:activeCard}=dataFor(target);
    const card=id?round.cards.find(c=>c.id===id):activeCard;
    if(!card||card.group===group)return;
    const from=card.group;
    card.group=group;
    round.cards=round.cards.filter(item=>item!==card);
    round.cards.push(card);
    update('decision_card_moved',round,null,{from,group});
    toast('Moved to '+group+(round.brief?' · Design Brief updated':''));
    if(!id)document.querySelector('[data-decision="'+card.id+'"] select')?.focus({preventScroll:true});
  }
  function startUpload(type,round,card){
    const p=project(),s=board();
    chooseImage((image,name)=>{
      if(type==='sketch'){
        p.images.original=image; s.sketchMode='upload'; s.sketchName=name;
      }else if(type==='concept'){
        round.image=image; round.model=''; round.preview=0;
      }else if(type==='part'){
        card.image=image; card.model=''; card.variant=0;
      }else card.image=image;
      return p;
    });
  }
  function addComponent(round){
    modal('<h2>Add components</h2><label for="componentName">Component name</label><input id="componentName" maxlength="100" placeholder="e.g. Pivot joint"><div class="row-buttons"><button id="saveComponent" class="dark-button">Add component</button></div>');
    document.querySelector('#saveComponent').onclick=()=>{
      const name=document.querySelector('#componentName').value.trim();
      if(!name)return toast('Name the component first.');
      round.parts.push(makePart(uid,name,'custom',40,30,true));
      closeModal();
      update('component_added',round,null,{name});
    };
  }
  async function click(button){
    const command=button.dataset.flowAction;
    if(!command)return false;
    const s=board(),p=project(),{round,part,card}=dataFor(button);
    switch(command){
    case 'intent':
      if(!p.target.trim()||!p.product.trim()||!p.problem.trim())return toast('Add a target user, product and problem.');
      s.intentConfirmed=true;
      if(!s.direction)s.direction=[p.product,p.features.filter(Boolean).join(', ')].filter(Boolean).join(' · ');
      event('intent_confirmed');render();return focus('sketch');
    case 'upload-tab':
      s.sketchMode='upload';event('sketch_mode');render();return startUpload('sketch',round);
    case 'sample-sketch':
      s.sketchName=robot()?'Milo form sketch':'desk-lamp-sketch.png';event('sample_sketch_selected');return render();
    case 'preview-sketch':
      return modal(`<h2>Starting sketch</h2><div class="concept-image">${p.images.original?asset(p.images.original,'Starting sketch'):robot()?asset('robot-sketch','Milo form sketch'):drawing(p.kind,0,true)}</div>`);
    case 'generate-tab':
      s.sketchMode='generate';event('sketch_mode');return render();
    case 'sketch': {
      const root=s.rounds[0];
      if(s.sketchConfirmed)return focus('concept');
      if(s.sketchMode==='upload'&&!s.sketchName&&!p.images.original)return toast('Add a starting sketch.');
      if(s.sketchMode==='generate'&&!s.direction.trim())return toast('Describe the design direction first.');
      if(p.mode==='live'){
        const result=await live('image',root,{purpose:p.kind==='robotics'?'Create a polished robot concept from the starting direction':'Create a polished product concept from the starting direction'},s.sketchMode==='upload'?p.images.original:undefined);
        if(!result||p!==project())return;
        root.image=result.image;root.model=result.model;
      }else{
        root.image=s.sketchMode==='upload'&&p.images.original?p.images.original:robot()?robotBaseline:lamp()?'lamp':'';
        toast(root.image==='lamp'?'Loaded the prepared mushroom-lamp example.':'Starting point added to the board.');
      }
      s.sketchConfirmed=true;return update('sketch_confirmed',root,'concept');
    }
    case 'add-feature':
      if(p.features.length>=20)return toast('Keep essential features to 20 or fewer.');
      p.features.push('');event('feature_added');render();
      return document.querySelector('[data-feature="'+(p.features.length-1)+'"]').focus({preventScroll:true});
    case 'concept':
      if(round.confirmed&&p.kind==='robotics')return focus(roundId(round,'parts'));
      if(!round.confirmed&&p.mode==='live'){
        const result=await live('components',round,{purpose:'Identify physical components for designer review'},round.image);
        if(!result||p!==project())return;
        round.parts=result.parts.map((name,i)=>makePart(uid,name,'custom',40,30,i===0));
      }
      round.confirmed=true;return update('concept_confirmed',round,'parts');
    case 'select-part':
      part.selected=!part.selected;
      return update('component_selected',round,null,{part:part.name,selected:part.selected});
    case 'preview-part': {
      const art=partArt(part,round);
      const source=part.model?'AI concept image':inlineImage(art)?'Uploaded image':art?'Prepared component render':'Component schematic';
      const changes=part.history.at(-1)?.text;
      return modal(`<h2>${esc(part.name)}</h2><div class="component-preview-large">${partVisual(part,round)}</div><p class="component-preview-credit">${source}</p>${changes?`<p class="component-preview-change"><strong>Latest saved change</strong><br>${esc(changes)}</p>`:''}`);
    }
    case 'part-image': return startUpload('part',round,part);
    case 'add-component':
      if(round.parts.length>=20)return toast('This iteration already has 20 components.');
      return addComponent(round);
    case 'parts':
      if(!round.parts.some(part=>part.selected))return toast('Select at least one component to explore.');
      if(!round.cards.length){
        if(p.mode==='live'){
          const result=await live('cards',round,{purpose:'Suggest what to keep, explore and verify'},round.image);
          if(!result||p!==project())return;
          round.cards=result.cards.map(c=>({id:uid(),group:c.group,text:c.text,origin:'live',image:''}));
        }else round.cards=makeCards(p,round,uid);
      }
      round.partsConfirmed=true;return update('components_confirmed',round,'decisions');
    case 'sizes':
      if(Object.values(round.dimensions).some(n=>!validSize(n))||round.parts.some(part=>![part.width,part.height].every(validSize)))return toast('Enter dimensions between 1 and 10,000 mm.');
      round.sizesConfirmed=true;
      update('sizes_confirmed',round);
      return toast('Overall and component measurements saved.');
    case 'decisions':
      if(round.cardsConfirmed)return focus(roundId(round,'brief'));
      if(!round.cards.some(card=>card.text.trim()))return toast('Add at least one design decision.');
      if(!round.brief)round.brief=makeBrief(p,round);
      round.cardsConfirmed=true;return update('decisions_confirmed',round,'brief');
    case 'robot-renders':
      return modal(`<section class="render-gallery"><h2>Milo · Tilt bracket studies</h2>
        <p>Compare three bracket mechanisms for the same robot. Prototype Lab separately tests when to suggest an adjustment.</p>
        <div class="render-grid">${[...robotOptions].reverse().map(([title,copy,art])=>`<figure>
          ${asset(art,title)}<figcaption><strong>${esc(title)}</strong><p>${esc(copy)}</p></figcaption>
        </figure>`).join('')}</div></section>`);
    case 'brief':
      if(round.options.length)return focus(roundId(round,'alternatives'));
      if(!round.brief.summary.trim()||!round.brief.problem.trim())return toast('Add a brief summary and the problem to address.');
      if(p.mode==='live'){
        const result=await live('options',round,{purpose:'Generate distinct concept directions',count:round.count},round.image);
        if(!result||p!==project())return;
        round.options=result.options.map(option=>({...option,origin:'live',model:result.model}));
      }else{
        round.options=sampleOptions(p,round);toast(robot()?'Prepared product renders added to the board.':'Example variations ready · scenario preview.');
      }
      return update('alternatives_generated',round,'alternatives');
    case 'select-option': {
      const index=Number(button.closest('[data-alt-anchor]').dataset.altAnchor);
      round.picked=round.picked.includes(index)?round.picked.filter(i=>i!==index):[...round.picked,index];
      return update('alternative_selected',round,null,{index});
    }
    case 'alternatives': {
      const children=[];
      for(const index of round.picked){
        let child=s.rounds.find(r=>r.parent?.roundId===round.id&&r.parent.index===index);
        if(!child){
          if(s.rounds.length>=30)break;
          child=makeRound(p,uid,uid(),{roundId:round.id,index,iteration:round.iteration},round.options[index],index);
          child.dimensions={...round.dimensions};
          child.parts=round.parts.map(part=>({...part,id:uid(),history:[],change:'',variant:0}));
          child.intentSnapshot=round.brief?.problem||p.problem;
          s.rounds.push(child);syncBranch(child);
        }
        children.push(child);
      }
      if(!children.length)return toast('Select a concept to branch. A project supports up to 30 iterations.');
      return update('branches_created',children[0],'concept',{parent:round.id,indices:round.picked});
    }
    case 'replace-concept': return startUpload('concept',round);
    case 'making': activate(round);syncBranch(round);return assistant(round,'making');
    case 'add-card': {
      if(round.cards.length>=100)return toast('This iteration already has 100 decision cards.');
      const next={id:uid(),group:button.closest('[data-drop-group]').dataset.dropGroup,text:'',origin:'designer',image:''};
      round.cards.push(next);update('decision_card_added',round);
      return document.querySelector('[data-decision="'+next.id+'"] textarea').focus({preventScroll:true});
    }
    case 'remove-card':
      round.cards=round.cards.filter(c=>c!==card);return update('decision_card_removed',round);
    case 'card-image':return startUpload('card',round,card);
    case 'apply':
    case 'apply-part':
    case 'refresh': {
      const request=(part||round).change.trim();
      if(command!=='refresh'&&!request)return toast('Describe a change first.');
      const target=part||round;
      if(p.mode==='live'){
        const result=await live('image',round,{purpose:part?'Render only the '+part.name+' component on white':'Revise this product concept',
          revision:request||'Explore a nearby variation while retaining the brief'},part?partArt(part,round)||round.image:round.image);
        if(!result||p!==project())return;
        target.image=result.image;target.model=result.model;
        if(part)part.variant=0;else round.preview=0;
      }else if(robot()&&!part&&robotAssets.has(round.image)){
        round.preview=(round.preview+1)%4;
      }else if(lamp()){
        if(part)part.variant=(part.variant+1)%4;
        else round.preview=round.preview?0:1;
      }
      if(request&&command!=='refresh')target.history.push({text:request,at:new Date().toISOString(),source:p.mode==='live'?'AI revision':part&&p.kind==='robotics'?'Designer note':'Scenario preview'});
      if(p.mode!=='live')toast(part&&p.kind==='robotics'?'Change saved for '+part.name+'.':lamp()||robot()&&!part&&robotAssets.has(round.image)?'Prepared variation shown · your change request is saved.':'Change recorded. Use live AI or upload a revised concept.');
      return update(part?'component_revision':'concept_revision',round,null,{part:part?.name});
    }
    }
    return false;
  }
  function selectNode(node){
    if(node?.round&&current()!==node.round)activate(node.round);
  }
  function inspiration(variant){
    const p=project(),s=board(),round=current();
    if(!s.sketchConfirmed)return toast('Confirm a starting concept first.');
    if(s.rounds.length>=30)return toast('This project already has 30 iterations.');
    const child=makeRound(p,uid,uid(),{roundId:round.id,index:variant,iteration:round.iteration},sampleOptions(p,{...round,count:3})[variant],variant);
    s.rounds.push(child);
    update('inspiration_added',child,'concept');
  }
  return {getNodes,edges,renderNode,stage,phaseNode,resumeNode,title,textInput,moveCard,click,selectNode,inspiration,current,asset};
}
