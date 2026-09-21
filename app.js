// Dio Grind — local-first focus tracker by Dio_Exodi. No signup, silent v1.
const $=s=>document.querySelector(s);
const store={load(){try{return JSON.parse(localStorage.getItem('dio-grind')||'{}')}catch{return{}}},save(d){localStorage.setItem('dio-grind',JSON.stringify(d))}};
let S=Object.assign({goal:120,focus:25,short:5,long:15,mode:'focus',secs:25*60,run:false,tasks:[],hist:{},onb:0,done:false,togN:true,togS:true,last:null},store.load());
function today(){return new Date().toISOString().slice(0,10)}
function mins(){return Math.round((Object.values(S.hist).reduce((a,b)=>a+b,0))/60)}
function save(){store.save(S);render()}
function fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
let tick=null;
function start(){if(S.run)return;S.run=true;tick=setInterval(()=>{S.secs--;if(S.secs<=0){complete()}save()},1000);save()}
function pause(){S.run=false;clearInterval(tick);save()}
function reset(m){pause();S.secs=(m||S.focus)*60;save()}
function complete(){pause();const k=today();S.hist[k]=(S.hist[k]||0)+S.focus*60;S.last=Date.now();reset();alert('Session logged. Nice grind.')}
function streak(){let n=0,d=new Date();while(true){const k=d.toISOString().slice(0,10);if((S.hist[k]||0)>=S.goal*60*0.5||(S.hist[k]||0)>0&&n===0&&k===today()){if((S.hist[k]||0)>0)n++;else break}else if(k===today()&&(S.hist[k]||0)===0){}else break;d.setDate(d.getDate()-1);if(n>30)break}return n}
function render(){
 $('#t').textContent=fmt(S.secs);
 $('#mode').textContent=S.mode+' · '+S.focus+'m focus';
 const tm=Object.entries(S.hist).slice(-7); const max=Math.max(1,...tm.map(x=>x[1]));
 $('#bars').innerHTML=tm.map(([k,v])=>'<div style="flex:1;text-align:center"><div style="height:90px;display:flex;align-items:flex-end"><div class="bar" style="width:100%"><i style="width:'+Math.round(v/max*100)+'%"></i></div></div><small style="color:var(--mut)">'+k.slice(5)+'</small></div>').join('')||'<p class="sub">No sessions yet — start your first grind.</p>';
 $('#stats').innerHTML='<div class="stat"><b>'+streak()+'</b><br><span>day streak</span></div><div class="stat"><b>'+Math.round((S.hist[today()]||0)/60)+'</b><br><span>min today</span></div><div class="stat"><b>'+mins()+'</b><br><span>total min</span></div><div class="stat"><b>'+S.tasks.filter(t=>t.done).length+'/'+S.tasks.length+'</b><br><span>tasks</span></div>';
 $('#tasks').innerHTML=S.tasks.map((t,i)=>'<div class="row"><span>'+(t.done?'✓ ':'')+t.name+'</span><button class="btn-g" onclick="togT('+i+')">'+(t.done?'undo':'done')+'</button></div>').join('')||'<p class="sub">Add your first task.</p>';
 try{var r=document.querySelector('#ring');if(r){var st=streak();r.textContent=st;r.style.setProperty('--p',Math.min(100,st/7*100)+'%')}}catch(e){}document.querySelectorAll('.view').forEach(v=>v.classList.remove('on')); const h=location.hash||'#focus'; (document.querySelector(h)||document.querySelector('#focus')).classList.add('on');
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.h===h));
}
window.togT=i=>{S.tasks[i].done=!S.tasks[i].done;save()};
window.addTask=()=>{const v=$('#nt').value.trim();if(!v)return;S.tasks.push({name:v,done:false});$('#nt').value='';save()};
window.setP=(k,v)=>{S[k]=+v;if(k==='focus')S.secs=+v*60;save()};
window.exp=()=>{const b=new Blob([localStorage.getItem('dio-grind')||'{}'],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='dio-grind-backup.json';a.click()};
window.nav=h=>{location.hash=h;render()};
window.tog=(el,k)=>{S[k]=!S[k];el.setAttribute('aria-checked',S[k]);save()};
window.onbGo=n=>{S.onb=n;document.querySelectorAll('.onb').forEach((o,i)=>o.style.display=i===n?'block':'none');document.querySelectorAll('.dots i').forEach((d,i)=>d.classList.toggle('on',i===n));if(n>=3){S.done=true;save();location.hash='#setup';render()}};
document.addEventListener('DOMContentLoaded',()=>{if(!S.done){location.hash='#intro'}render()});
setInterval(()=>{var st=document.querySelector('#strip');if(st&&!st.children.length){var d=new Date(),h='';for(var i=0;i<5;i++){var x=new Date(d);x.setDate(d.getDate()-2+i);h+='<div class="day'+(i===2?' on':'')+'">D<b>'+x.getDate()+'</b></div>'}st.innerHTML=h}},800);
