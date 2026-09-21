// Drift — polished core. Accurate timer, no per-tick storage spam, mode cycle, splash routing.
const $=s=>document.querySelector(s);
const KEY='dio-grind';
const store={load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}},save(d){try{localStorage.setItem(KEY,JSON.stringify(d))}catch{}}};
let S=Object.assign({goal:120,focus:25,short:5,long:15,mode:'focus',remain:25*60,endAt:0,run:false,cycle:0,tasks:[],hist:{},seenSplash:false,togN:true,togS:true},store.load());
if(typeof S.remain!=='number'||S.remain<0)S.remain=S.focus*60;
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function persist(){store.save(S)}
function fmt(s){s=Math.max(0,Math.round(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function minsToday(){return Math.round((S.hist[today()]||0)/60)}
function totalMins(){return Math.round(Object.values(S.hist).reduce((a,b)=>a+b,0)/60)}
function streak(){let n=0;const d=new Date();for(let i=0;i<60;i++){const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');if((S.hist[k]||0)>0)n++;else if(k!==today())break;d.setDate(d.getDate()-1)}return n}
let tick=null;
function paintTime(){$('#t').textContent=fmt(S.remain);document.title=fmt(S.remain)+' · Drift';const m=$('#mode');if(m)m.textContent=S.mode+' · '+({focus:S.focus,short:S.short,long:S.long}[S.mode]||S.focus)+'m'}
function start(){if(S.run)return;S.run=true;S.endAt=Date.now()+S.remain*1000;clearInterval(tick);tick=setInterval(loop,250);persist();renderNav()}
function loop(){S.remain=Math.max(0,Math.round((S.endAt-Date.now())/1000));paintTime();if(S.remain<=0)complete()}
function pause(){if(!S.run)return;S.run=false;clearInterval(tick);S.remain=Math.max(0,Math.round((S.endAt-Date.now())/1000));if(!isFinite(S.remain))S.remain=0;persist();paintTime();renderNav()}
function reset(){pause();S.remain=({focus:S.focus,short:S.short,long:S.long}[S.mode]||S.focus)*60;persist();paintTime()}
function complete(){pause();const k=today();if(S.mode==='focus'){S.hist[k]=(S.hist[k]||0)+S.focus*60;S.cycle++;S.mode=(S.cycle%4===0)?'long':'short'}else{S.mode='focus'}S.remain=({focus:S.focus,short:S.short,long:S.long}[S.mode]||S.focus)*60;persist();paintTime();fullRender();const sh=$('#sheet');if(sh){sh.classList.add('on');setTimeout(()=>sh.classList.remove('on'),2600)}}
function renderNav(){document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.h===(location.hash||'#focus')))}
function fullRender(){
 paintTime();
 const tm=Object.entries(S.hist).slice(-6);const max=Math.max(1,...tm.map(x=>x[1]));
 const bars=$('#bars');if(bars)bars.innerHTML=tm.length?tm.map(([k,v],ix)=>'<div class="bcol'+(ix===tm.length-1?' hot':'')+'"><i style="height:'+Math.max(8,Math.round(v/max*92))+'px"></i><small>'+String(k).slice(5)+'</small></div>').join(''):'<p class="d">No sessions yet.</p>';
 const st=$('#strip');if(st&&!st.children.length){const d=new Date();let h='';for(let i=0;i<5;i++){const x=new Date(d);x.setDate(d.getDate()-2+i);h+='<div class="day'+(i===2?' on':'')+'">'+'SMTWTFS'[x.getDay()]+'<b>'+x.getDate()+'</b></div>'}st.innerHTML=h}
 const kt=$('#k-today');if(kt)kt.textContent=minsToday();const ks=$('#k-streak');if(ks)ks.textContent=streak();
 const ts=$('#tasks');if(ts)ts.innerHTML=S.tasks.length?S.tasks.map((t,i)=>'<div class="row'+(i===0?' sel':' sub')+'" onclick="togT('+i+')"><span>'+(t.done?'✓ ':'')+t.name+'</span><span class="badge">'+(t.done?'done':(i+1))+'</span></div>').join(''):'<p class="d">Add your first task.</p>';
 const dots=$('#dots');if(dots){let h='';for(let i=6;i>=0;i--){const x=new Date();x.setDate(x.getDate()-i);const k=x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');h+=(S.hist[k]>0?'●':'○')}dots.textContent=h}
 document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));const h=location.hash||'#focus';(document.querySelector(h)||document.querySelector('#focus')).classList.add('on');renderNav();
}
window.togT=i=>{S.tasks[i].done=!S.tasks[i].done;persist();fullRender()};
window.addTask=()=>{const el=$('#nt');const v=(el.value||'').trim();if(!v)return;S.tasks.push({name:v.slice(0,80),done:false});el.value='';persist();fullRender()};
window.setP=(k,v)=>{v=Math.max(1,Math.min(180,+v||25));S[k]=v;if(((k==='focus'&&S.mode==='focus')||(k==='short'&&S.mode==='short')||(k==='long'&&S.mode==='long'))&&!S.run)S.remain=v*60;persist();paintTime()};
window.exp=()=>{const b=new Blob([localStorage.getItem(KEY)||'{}'],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='drift-backup.json';a.click()};
window.nav=h=>{location.hash=h;fullRender();window.scrollTo(0,0)};
window.tog=(el,k)=>{S[k]=!S[k];el.setAttribute('aria-checked',S[k]);persist()};
window.onbGo=n=>{document.querySelectorAll('#intro .onb').forEach((o,i)=>o.style.display=i===n?'block':'none');document.querySelectorAll('#intro .dots i').forEach((d,i)=>d.classList.toggle('on',i===n));if(n>=3){nav('#setup')}};
window.addEventListener('hashchange',fullRender);
document.addEventListener('DOMContentLoaded',()=>{const sp=$('#splash');if(sp&&!S.seenSplash){location.hash='#splash';fullRender();setTimeout(()=>{S.seenSplash=true;persist();nav('#intro')},1300)}else{if(!location.hash)location.hash='#focus';fullRender()}});
