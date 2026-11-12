export const robotDemoId = 'milo-robot-demo-v1';
export const robotIntent = {
  title:'Milo · Desktop Companion Robot',
  template:'robot', target:'People who work or study at a small desk',
  product:'A small desktop companion robot with a tilting face',
  problem:'Make the face easy to see from a seated position while keeping the desk footprint small.',
  features:['Camera-free expressive face','Tool-accessible head mount','Compact stationary base'],
  description:'A rounded face, a replaceable tilt bracket and a compact base. Start with a foam mock-up and a slotted bracket.',
  sizes:{width:120,height:150,depth:90}
};
export const robotParts = [
  ['Face module','robot-head',98,64], ['Tilt bracket','robot-mount',38,28], ['Base housing','robot-base',90,42]
];
export const robotOptions = [
  ['Rear cantilever','A rear upright supports the face from one side, leaving an open gap underneath for it to tilt. Check rear clearance, stiffness and stability before committing.','robot-cantilever-v2'],
  ['Adjustable slide rail','A slotted rail lets you slide the pivot and lock it in place with a screw. Compare viewing angles, then check whether the rail fits the compact base.','robot-slide-rail-v2'],
  ['Compact fixed hinge','A short, centred hinge keeps the face close to the base. The pivot tilts, but its position is fixed. Check the seated viewing angle and tool access.','robot-fixed-hinge-v2']
];
export const robotCards = [
  ['keep','Keep the face easy to read from a seated position'],
  ['keep','Keep the camera-free face and replaceable tilt bracket'],
  ['explore','Try a rearward mount offset before committing to the bracket position',1,'milo-part-hinge'],
  ['explore','Compare 0, 6 and 12 mm offsets in a physical mock-up',1],
  ['constraints','Stay within the 90 mm base-depth target'],
  ['constraints','Leave enough space to reach both screws with a driver',1]
];
const suggestion = 'Shift the tilt bracket 12 mm toward the back to give the face more room to tilt up.';
const phaseLabel = {hold:'During alignment',fastened:'After fastening'};
const timingLabel = {now:'During alignment',pause:'After fastening'};
const actionLabel = {keep:'Accepted',adapt:'Modified',reject:'Declined'};

export function startTrial(timing) {
  return {timing, phase:'hold', offeredAt:timing==='now'?'hold':null, offset:0, outcome:null};
}
export function fasten(trial) {
  if(trial.phase!=='hold')return trial;
  return {...trial,phase:'fastened',offeredAt:trial.offeredAt||'fastened'};
}
export function choose(trial, choice, note='') {
  if(!trial.offeredAt||trial.outcome||!Object.hasOwn(actionLabel,choice))return trial;
  const offset={keep:12,adapt:6,reject:0}[choice];
  return {...trial,offset,outcome:{choice,offset,note:note.trim().slice(0,320),rework:trial.phase==='fastened'&&offset!==0,chosenAt:trial.phase}};
}

function diagram(offset, ghost) {
  const x=151+offset*3;
  return `<svg class="rig-diagram" viewBox="0 0 340 176" role="img" aria-label="Top view of robot base, mount at ${offset} millimetres rearward${ghost?', with suggested 12 millimetre position outlined':''}">
    <path d="M20 116H320" stroke="#d4cbdc" stroke-dasharray="3 4"/>
    <rect x="48" y="58" width="244" height="74" rx="17" fill="#f7f3fb" stroke="#3d2c4e" stroke-width="1.5"/>
    <rect x="127" y="86" width="88" height="18" rx="9" fill="#ebe1f1" stroke="#b7a3c5"/>
    <path d="M151 72v46m18-46v46m18-46v46" stroke="#b7a3c5" stroke-dasharray="2 4"/>
    ${ghost?`<rect x="174" y="74" width="26" height="42" rx="5" fill="#e0c9f8" fill-opacity=".55" stroke="#703ab0" stroke-width="2" stroke-dasharray="4 3"/><path d="M187 66V47h48" fill="none" stroke="#703ab0"/><text x="238" y="50" fill="#653393">12 mm preview</text>`:''}
    <rect x="${x-13}" y="74" width="26" height="42" rx="5" fill="#77538d" stroke="#3d2c4e"/>
    <circle cx="${x}" cy="82" r="2.5" fill="white"/><circle cx="${x}" cy="108" r="2.5" fill="white"/>
    <text x="48" y="153" fill="#594964">FRONT</text><text x="292" y="153" text-anchor="end" fill="#594964">REAR →</text>
    <text x="48" y="34" fill="#594964">TOP VIEW · TILT BRACKET</text></svg>`;
}
export function openRobotLab(modal, host, onDecision) {
  let trial=startTrial('now'), results={}, editing=false, note='';
  const paint=(focus)=>{
    const {outcome,offeredAt,phase,timing,offset}=trial;
    const pending=offeredAt&&!outcome;
    host.innerHTML=`<section class="robot-lab" aria-labelledby="robotLabTitle">
      <div class="robot-eyebrow"><span>CRIT LENS / ROBOT DESIGN</span><span>INTERACTIVE SIMULATION</span></div>
      <h2 id="robotLabTitle">When should AI suggest a change?</h2>
      <p>You’re fitting Milo’s tilt bracket. Try the same suggestion while aligning the bracket and just after fastening it.</p>
      <div class="robot-modes" role="group" aria-label="Suggestion timing">
        <button data-lab="now" aria-pressed="${timing==='now'}">A · During alignment</button>
        <button data-lab="pause" aria-pressed="${timing==='pause'}">B · After fastening</button>
      </div>
      <div class="robot-grid">
        <section class="robot-rig">
          <div class="robot-eyebrow"><span>01 / ASSEMBLY</span><span>${phase==='hold'?'ALIGNING':'FASTENED'}</span></div>
          ${diagram(offset,!!pending)}
          <p>${phase==='hold'?'The bracket is still loose. Your hands are busy holding it in place.':'The bracket is fastened. Your hands are free to review the design.'}</p>
          ${phase==='hold'?'<button class="dark-button" data-lab="fasten">Fasten bracket →</button>':''}
        </section>
        <section class="robot-option" aria-live="polite">
          <div class="robot-eyebrow"><span>02 / DESIGN OPTION</span><span>${offeredAt?'PREPARED AI SUGGESTION':'WAITING'}</span></div>
          ${offeredAt?`<h3>${suggestion}</h3><p>${outcome?(outcome.rework?'The screws must be loosened, the bracket moved, and then refastened.':outcome.offset?'The bracket can slide before fastening.':'The centred mount stays in place.'):(phase==='hold'?'Review now, or finish fastening first.':'Changing the offset now means loosening and refastening the bracket.')}</p>`:'<h3>No suggestion yet</h3><p>The option will appear once you finish fastening the bracket.</p>'}
          ${pending?`<div class="robot-actions"><button class="soft-button" data-lab="keep">Accept 12 mm</button><button class="soft-button" data-lab="edit" aria-expanded="${editing}">Modify</button><button class="soft-button" data-lab="reject">Decline</button></div>
            ${editing?'<div class="robot-adjust"><p>Try 6 mm instead. This leaves more clearance behind the head.</p><button class="dark-button" data-lab="adapt">Apply 6 mm</button></div>':''}
            <label for="robotReason">Why? <span>(optional)</span></label><input id="robotReason" maxlength="320" placeholder="e.g. I want to keep room for the cable">`:''}
          ${outcome?`<div class="robot-result"><strong>${actionLabel[outcome.choice]} · ${outcome.offset} mm</strong><span>Decision saved on this device</span></div>`:''}
        </section>
      </div>
      <div class="robot-compare">
        <div class="robot-compare-head"><h3>Compare the two runs</h3><button class="soft-button" data-lab="reset">Restart this run</button></div>
        <table><thead><tr><th scope="col">Suggestion shown</th><th scope="col">Your choice</th><th scope="col">Rework</th></tr></thead><tbody>
          ${['now','pause'].map(mode=>{const r=results[mode];return `<tr><th scope="row">${timingLabel[mode]}</th><td>${r?actionLabel[r.choice]+' · '+r.offset+' mm':'—'}</td><td>${r?r.rework?'Loosen & refasten':'None':'—'}</td></tr>`;}).join('')}
        </tbody></table>
        <p>Where is the best time to ask: before a change becomes costly, or when the designer is free to think? This simulation uses a prepared suggestion and a schematic; no live AI or physical testing is involved.</p>
      </div>
    </section>`;
    const reason=host.querySelector('#robotReason');
    if(reason){reason.value=note;reason.oninput=()=>{note=reason.value;};}
    if(focus)host.querySelector(`[data-lab="${focus}"]`)?.focus();
  };
  modal('');
  paint('now');
  host.onclick=e=>{
    const key=e.target.closest('[data-lab]')?.dataset.lab;
    if(!key)return;
    if(key==='now'||key==='pause'||key==='reset'){
      trial=startTrial(key==='reset'?trial.timing:key);editing=false;note='';return paint(trial.timing);
    }
    if(key==='fasten'){trial=fasten(trial);return paint(trial.outcome?'reset':'keep');}
    if(key==='edit'){editing=!editing;return paint(editing?'adapt':'edit');}
    const next=choose(trial,key,note);
    if(next===trial)return;
    trial=next;results[trial.timing]=trial.outcome;
    const {outcome}=trial;
    onDecision({
      proposal:'Milo · Tilt bracket offset',
      prompt:suggestion,position:outcome.choice,
      provenance:`Prototype Lab · prepared option · shown ${phaseLabel[trial.offeredAt].toLowerCase()}`,
      reason:outcome.note||`${actionLabel[outcome.choice]} ${outcome.offset} mm offset ${phaseLabel[outcome.chosenAt].toLowerCase()}.`,
      next:outcome.rework?'Loosen and refasten the bracket in the simulation.':'No rework in the simulation.'
    });
    paint(trial.phase==='hold'?'fasten':'reset');
  };
}
