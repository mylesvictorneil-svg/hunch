/* ================= HUNCH PARTY: live multiplayer ================= */
(function(){
const TURN_CHOICES=[20,30,45], MAX_PLAYERS=8, PREFIX="hunchparty-v1-";
const BONUS=[5000,4000,3000,2000,1500,1000];
const AV=["#F2C14E","#86C98A","#F27A62","#AE96DE","#6AA8EC","#F08BB6","#5CC9C0","#E89B4C"];
const PARTY_IC='<svg viewBox="0 0 48 48" fill="none" stroke="#141414" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="17" r="6"/><circle cx="33" cy="15" r="5"/><path d="M5 39c1-7 6-11 11-11s10 4 11 11"/><path d="M25 27c2-2 5-3 8-3 5 0 9 4 10 11"/><path d="M38 4l1 3M44 9l-3 1M42 3l-2 2" stroke-width="2.5"/></svg>';
window.PARTY_IC=PARTY_IC;

/* ---------- answer list ---------- */
const PE=[],PKEY={};
const rows=s=>s.trim().split("\n").map(l=>l.split("|").map(x=>x.trim()));
rows(PARTY_RAW.people).forEach(([name,job,country,born,alive,sport,al])=>PE.push({name,kind:"person",sub:"person",job,country,born:+born,alive:alive==="1",sport:sport||null,al}));
rows(PARTY_RAW.countries).forEach(([name,conts,coast,pop,al])=>PE.push({name,kind:"place",sub:"country",conts:conts.split(","),coast:coast==="1",pop:+pop,al}));
rows(PARTY_RAW.cities).forEach(([name,country,cap,al])=>PE.push({name,kind:"place",sub:"city",country,capital:cap==="1",al}));
rows(PARTY_RAW.landmarks).forEach(([name,cs,nat,al])=>PE.push({name,kind:"place",sub:"landmark",countries:cs.split(","),natural:nat==="1",al}));
rows(PARTY_RAW.animals).forEach(([name,cls,legs,fly,ocean,al])=>PE.push({name,kind:"thing",sub:"animal",cls,legs:legs==="-"?null:+legs,fly:fly==="1",ocean:ocean==="1",al}));
rows(PARTY_RAW.foods).forEach(([name,type,country,al])=>PE.push({name,kind:"thing",sub:"food",type,country:country==="-"?null:country,al}));
rows(PARTY_RAW.brands).forEach(([name,country,industry,f,al])=>PE.push({name,kind:"thing",sub:"brand",country,industry,founded:f==="-"?null:+f,al}));
PE.forEach(e=>{
  if(!e.conts)e.conts=e.countries?[...new Set(e.countries.map(c=>CONTINENT[c]))]:(e.country?[CONTINENT[e.country]]:[]);
  const plain=e.name.normalize("NFD").replace(/[̀-ͯ]/g,"");
  e.letters=plain.replace(/[^A-Za-z]/g,"").toLowerCase();
  e.first=e.letters[0];
  e.words=plain.replace(/[^A-Za-z0-9 ]/g," ").trim().split(/\s+/).length;
  [e.name,...(e.al?e.al.split(";"):[])].forEach(k=>{const n=norm(k);if(n&&!PKEY[n])PKEY[n]=e;});
});
const NAMES=PE.map(e=>e.name).sort((a,b)=>a.localeCompare(b));

/* ---------- criteria ---------- */
const CL=c=>["USA","UK","Netherlands","UAE","Philippines"].includes(c)?"the "+c:c;
const where={person:"Born in",place:"Located in",thing:"Comes from"};
const CRIT=[];
const add=(id,group,test,label)=>CRIT.push({id,group,test,label:typeof label==="function"?label:()=>label});
add("k:person","kind",e=>e.kind==="person","It's a real person");
add("k:place","kind",e=>e.kind==="place","It's a place");
add("k:thing","kind",e=>e.kind==="thing","It's a thing (not a person or place)");
const JOB={musician:"They're a musician",athlete:"They're an athlete",actor:"They're an actor",leader:"They're a political or historical leader",scientist:"They're a scientist or inventor",
  business:"They're a business leader",artist:"They're a painter",writer:"They're a writer",director:"They're a film director",creator:"They're an online creator",host:"They're a TV host"};
Object.entries(JOB).forEach(([j,l])=>add("j:"+j,"sub",e=>e.job===j,l));
[["country","It's a country"],["city","It's a city"],["landmark","It's a landmark"],["animal","It's an animal"],["food","It's a food"],["brand","It's a brand or company"]]
  .forEach(([s,l])=>add("s:"+s,"sub",e=>e.sub===s,l));
const allCountries=new Set();PE.forEach(e=>{if(e.country)allCountries.add(e.country);(e.countries||[]).forEach(c=>allCountries.add(c));});
allCountries.forEach(c=>add("c:"+c,"country",e=>e.country===c||(e.countries||[]).includes(c),k=>`${where[k]} ${CL(c)}`));
["North America","South America","Europe","Asia","Africa","Oceania"].forEach(ct=>add("ct:"+ct,"continent",e=>e.conts.includes(ct),k=>`${where[k]} ${ct==="Oceania"?"Oceania (Australia and nearby)":ct}`));
[1900,1950,1975,1990,2000].forEach(y=>{add("b+"+y,"born",e=>e.kind==="person"&&e.born>=y,`Born in ${y} or later`);add("b-"+y,"born",e=>e.kind==="person"&&e.born<y,`Born before ${y}`);});
add("alive","alive",e=>e.kind==="person"&&e.alive,"Still alive today");
add("dead","alive",e=>e.kind==="person"&&!e.alive,"No longer alive");
[...new Set(PE.map(e=>e.sport).filter(Boolean))].forEach(s=>add("sp:"+s,"sport",e=>e.sport===s,`Plays or played ${s}`));
add("cap","capital",e=>e.sub==="city"&&e.capital,"It's a national capital");
add("nocap","capital",e=>e.sub==="city"&&!e.capital,"It's not a national capital");
add("coast","coast",e=>e.sub==="country"&&e.coast,"Has an ocean coastline");
add("land","coast",e=>e.sub==="country"&&!e.coast,"Landlocked (no coastline)");
add("pop+","pop",e=>e.sub==="country"&&e.pop>150,"Population over 150 million");
add("pop-","pop",e=>e.sub==="country"&&e.pop<6,"Population under 6 million");
add("nat","natural",e=>e.sub==="landmark"&&e.natural,"Formed by nature");
add("built","natural",e=>e.sub==="landmark"&&!e.natural,"Built by people");
["mammal","bird","reptile","amphibian","fish","insect"].forEach(c=>add("cl:"+c,"class",e=>e.cls===c,`It's ${/^[aeiou]/.test(c)?"an":"a"} ${c}`));
[[0,"Has no legs"],[2,"Has two legs"],[4,"Has four legs"],[6,"Has six legs"],[8,"Has eight legs"]].forEach(([n,l])=>add("lg:"+n,"legs",e=>e.sub==="animal"&&e.legs===n,l));
add("fly","fly",e=>e.sub==="animal"&&e.fly,"Can fly");
add("nofly","fly",e=>e.sub==="animal"&&!e.fly,"Can't fly");
add("ocean","ocean",e=>e.sub==="animal"&&e.ocean,"Lives in the ocean");
[["dish","It's a dish or meal"],["dessert","It's a dessert"],["fruit","It's a fruit"],["vegetable","It's a vegetable"]].forEach(([t,l])=>add("ft:"+t,"foodtype",e=>e.type===t,l));
[["cars","Makes cars"],["tech","It's a tech company"],["clothing","Sells clothing or fashion"],["drinks","Sells drinks"],["food","Sells food or coffee"],["entertainment","Makes movies or shows"],["games","Makes toys or games"]]
  .forEach(([i,l])=>add("in:"+i,"industry",e=>e.industry===i,l));
[1900,1950,2000].forEach(y=>{add("f+"+y,"founded",e=>e.founded!=null&&e.founded>=y,`Founded in ${y} or later`);add("f-"+y,"founded",e=>e.founded!=null&&e.founded<y,`Founded before ${y}`);});
"abcdefghijklmnoprstvw".split("").forEach(l=>add("st:"+l,"name",e=>e.first===l,`Name starts with the letter ${l.toUpperCase()}`));
add("w1","name",e=>e.words===1,"Name is a single word");
add("w2","name",e=>e.words>=2,"Name has two or more words");
add("short","name",e=>e.letters.length<=5,"Name has 5 letters or fewer");
add("long","name",e=>e.letters.length>=11,"Name has 11 letters or more");
"zxjkvwy".split("").forEach(l=>add("has:"+l,"name",e=>e.letters.includes(l),`Name contains the letter ${l.toUpperCase()}`));
add("vowel","name",e=>/[aeiou]$/.test(e.letters),"Name ends with a vowel");

/* Build a game: pick a Jackpot, then 5 criteria that narrow toward it. */
const TARGET=[[18,70],[7,28],[3,12],[2,6]];
function makeGame(rand=Math.random,force){
  const pool=PE.filter(e=>PARTY_HINTS[e.name]);
  const J=force?PE.find(e=>e.name===force):pool[Math.floor(rand()*pool.length)];
  const mine=CRIT.filter(c=>c.test(J));
  const chosen=[mine.find(c=>c.group==="kind")];
  let cand=PE.filter(chosen[0].test);
  TARGET.forEach(([lo,hi],step)=>{
    if(cand.length<=1)return;
    const usedGroups=new Set(chosen.map(c=>c.group));
    if(usedGroups.has("country"))usedGroups.add("continent"); // a country already implies its continent
    const last=step===TARGET.length-1;
    const opts=mine.filter(c=>!usedGroups.has(c.group)).map(c=>({c,n:cand.filter(c.test).length}))
      .filter(o=>o.n<=cand.length*.8&&o.n>=(last?1:2));
    let fit=opts.filter(o=>o.n>=lo&&o.n<=hi);
    if(step===0){const s=fit.filter(o=>o.c.group==="sub");if(s.length)fit=s;}
    const mid=(lo+hi)/2,pick=fit.length?fit[Math.floor(rand()*fit.length)]:opts.sort((a,b)=>Math.abs(a.n-mid)-Math.abs(b.n-mid))[0];
    if(!pick)return;
    chosen.push(pick.c);cand=cand.filter(pick.c.test);
  });
  return{jackpot:J.name,final:PARTY_HINTS[J.name],crits:chosen.map(c=>({id:c.id,label:c.label(J.kind)})),left:cand.length};
}
const critById=Object.fromEntries(CRIT.map(c=>[c.id,c]));
window.HunchParty={PE,CRIT,makeGame,lookup:t=>PKEY[norm(t)]||null};

/* ---------- connections ---------- */
let peerLoad=null;
function loadPeer(){
  if(window.Peer)return Promise.resolve();
  if(!peerLoad)peerLoad=new Promise((res,rej)=>{const s=document.createElement("script");s.src="vendor/peerjs.min.js";s.onload=res;s.onerror=()=>{peerLoad=null;rej(new Error("load"))};document.head.appendChild(s);});
  return peerLoad;
}
const useLocal=()=>store.get("net",null)==="local";
// Host side
function netHost(code,h){
  if(useLocal()){
    const ch=new BroadcastChannel(PREFIX+code);
    ch.onmessage=e=>{const d=e.data;if(d.to==="host"){if(d.msg&&d.msg.t==="bye")h.leave(d.from);else h.msg(d.from,d.msg);}};
    setTimeout(()=>h.ready(),30);
    return{send:(pid,msg)=>ch.postMessage({to:pid,msg}),close:()=>ch.close()};
  }
  const conns={};let peer;
  loadPeer().then(()=>{
    peer=new Peer(PREFIX+code,{debug:0});
    peer.on("open",()=>h.ready());
    peer.on("error",err=>h.error(err.type));
    peer.on("disconnected",()=>{try{peer.reconnect();}catch(e){}});
    peer.on("connection",conn=>{
      conn.on("data",d=>{if(d&&d.t==="join"&&d.pid){conns[d.pid]=conn;conn._pid=d.pid;}if(conn._pid)h.msg(conn._pid,d);});
      conn.on("close",()=>{if(conn._pid&&conns[conn._pid]===conn){delete conns[conn._pid];h.leave(conn._pid);}});
      conn.on("error",()=>{});
    });
  }).catch(()=>h.error("load"));
  return{send:(pid,msg)=>{const c=conns[pid];if(c&&c.open)try{c.send(msg);}catch(e){}},close:()=>{try{peer&&peer.destroy();}catch(e){}}};
}
// Guest side
function netJoin(code,pid,h){
  if(useLocal()){
    const ch=new BroadcastChannel(PREFIX+code);let got=false;
    ch.onmessage=e=>{const d=e.data;if(d.to===pid){got=true;h.msg(d.msg);}};
    setTimeout(()=>h.ready(),30);
    setTimeout(()=>{if(!got)h.error("peer-unavailable");},2500);
    return{send:msg=>ch.postMessage({to:"host",from:pid,msg}),close:()=>{ch.postMessage({to:"host",from:pid,msg:{t:"bye"}});ch.close();}};
  }
  let peer,conn;
  loadPeer().then(()=>{
    peer=new Peer({debug:0});
    peer.on("error",err=>h.error(err.type));
    peer.on("open",()=>{
      conn=peer.connect(PREFIX+code,{reliable:true});
      conn.on("open",()=>h.ready());
      conn.on("data",d=>h.msg(d));
      conn.on("close",()=>h.closed());
      conn.on("error",()=>h.closed());
    });
  }).catch(()=>h.error("load"));
  return{send:msg=>{if(conn&&conn.open)try{conn.send(msg);}catch(e){}},close:()=>{try{conn&&conn.close();peer&&peer.destroy();}catch(e){}}};
}

/* ---------- session ---------- */
let S=null; // {role, code, pid, name, net, st (public state), G (host only), note, status, deadline}
const myPid=()=>{if(useLocal()){let t=sessionStorage.getItem("ppid");if(!t){t=Math.random().toString(36).slice(2,10);sessionStorage.setItem("ppid",t);}return t;}let p=store.get("partyPid",null);if(!p){p=Math.random().toString(36).slice(2,10);store.set("partyPid",p);}return p;};
const CODE_CH="ABCDEFGHJKMNPQRSTUVWXYZ";
const newCode=()=>Array.from({length:4},()=>CODE_CH[Math.floor(Math.random()*CODE_CH.length)]).join("");

function hostCreate(name){
  const code=newCode(),pid=myPid();
  S={role:"host",code,pid,name,status:"connecting",note:"",
     G:{phase:"lobby",code,hostPid:pid,turnSec:30,players:[{pid,name,score:0,on:true,color:AV[0]}],log:[],used:[],round:0,game:null,order:[],turnIdx:0,deadline:0,jack:null,rounds:0}};
  S.net=netHost(code,{
    ready(){S.status="ok";publish();},
    error(t){if(t==="unavailable-id"){S.net.close();hostCreate(name);return;}S.status="error";S.err=netErr(t);draw();},
    msg(from,m){hostHandle(from,m);},
    leave(from){const p=S.G.players.find(x=>x.pid===from);if(p){p.on=false;if(S.G.phase==="play"&&curPid()===from)advance("skip");publish();}}
  });
  draw();
}
function guestJoin(code,name){
  const pid=myPid();
  S={role:"guest",code,pid,name,status:"connecting",note:"",st:null};
  S.net=netJoin(code,pid,{
    ready(){S.net.send({t:"join",pid,name});},
    msg(m){
      if(m.t==="state"){S.status="ok";const prevLog=S.st?S.st.log.length:0,prevJack=S.st&&S.st.jack;S.st=m.st;S.deadline=Date.now()+(m.st.remaining||0);draw(prevLog,prevJack);}
      else if(m.t==="note"){S.note=m.text;S.noteAt=Date.now();draw();}
      else if(m.t==="full"){S.status="error";S.err="That room is full (8 players max).";draw();}
    },
    closed(){if(S&&S.role==="guest"&&S.status!=="left"){S.status="error";S.err="Lost connection to the host. They may have closed the game.";draw();}},
    error(t){S.status="error";S.err=netErr(t);draw();}
  });
  draw();
}
function netErr(t){
  return t==="peer-unavailable"?"Couldn't find that room. Check the code and make sure the host still has the game open."
    :t==="load"?"Couldn't load the multiplayer connection. Check your internet and try again."
    :t==="network"||t==="server-error"||t==="socket-error"||t==="socket-closed"?"Couldn't reach the multiplayer server. Check your connection and try again."
    :t==="browser-incompatible"?"This browser doesn't support live multiplayer. Try Chrome or Safari."
    :"Something went wrong connecting ("+t+"). Try again.";
}
function leaveParty(){if(S){S.status="left";try{S.net.close();}catch(e){}}S=null;draw();}

/* ---------- host game logic ---------- */
const curPid=()=>S.G.order[S.G.turnIdx];
function publicState(){
  const G=S.G,g=G.game,shown=g?Math.min(G.round+1,g.crits.length):0;
  return{phase:G.phase,code:G.code,hostPid:G.hostPid,turnSec:G.turnSec,players:G.players.map(p=>({pid:p.pid,name:p.name,score:p.score,on:p.on,color:p.color})),
    round:G.round,rounds:G.rounds,critCount:g?g.crits.length:0,crits:g?g.crits.slice(0,shown).map(c=>c.label):[],final:g&&G.round>=g.crits.length?g.final:null,
    turnPid:G.phase==="play"?curPid():null,remaining:G.phase==="play"?Math.max(0,G.deadline-Date.now()):0,log:G.log.slice(-40),jack:G.jack,
    reveal:G.phase==="over"&&g?{name:g.jackpot,hint:g.final,crits:g.crits.map(c=>c.label)}:null};
}
function publish(prevLog,prevJack){
  const st=publicState();S.st=st;S.deadline=Date.now()+st.remaining;
  S.G.players.forEach(p=>{if(p.pid!==S.pid&&p.on)S.net.send(p.pid,{t:"state",st});});
  draw(prevLog,prevJack);
}
function hostHandle(from,m){
  const G=S.G;if(!m)return;
  if(m.t==="join"){
    let p=G.players.find(x=>x.pid===from);
    if(!p){if(G.players.length>=MAX_PLAYERS){S.net.send(from,{t:"full"});return;}
      p={pid:from,name:String(m.name||"Player").slice(0,16),score:0,on:true,color:AV[G.players.length%AV.length]};G.players.push(p);}
    else{p.on=true;if(m.name)p.name=String(m.name).slice(0,16);}
    publish();return;
  }
  if(m.t==="bye"){const p=G.players.find(x=>x.pid===from);if(p){p.on=false;if(G.phase==="play"&&curPid()===from)advance("skip");publish();}return;}
  if(from!==G.hostPid&&["start","again","settings"].includes(m.t))return;
  if(m.t==="settings"&&G.phase==="lobby"){if(TURN_CHOICES.includes(m.turnSec))G.turnSec=m.turnSec;publish();return;}
  if(m.t==="start"&&G.phase!=="play"){startGame();return;}
  if(G.phase!=="play"||curPid()!==from)return;
  const p=G.players.find(x=>x.pid===from),prevLog=G.log.length,prevJack=G.jack;
  if(m.t==="pass"){G.log.push({pid:from,who:p.name,ans:null,res:"pass",pts:0,round:G.round});advance();publish(prevLog,prevJack);return;}
  if(m.t!=="answer")return;
  const e=PKEY[norm(m.text||"")];
  const tell=t=>{if(from===S.pid){S.note=t;S.noteAt=Date.now();draw();}else S.net.send(from,{t:"note",text:t});};
  if(!e){tell(`“${String(m.text).slice(0,40)}” isn't on our list. Pick one of the suggestions.`);return;}
  if(G.used.includes(e.name)){tell(`${e.name} was already used this game. Try another.`);return;}
  const g=G.game,active=g.crits.slice(0,Math.min(G.round+1,g.crits.length));
  const fail=active.find(c=>!critById[c.id].test(e));
  const base=G.round<g.crits.length?100*(G.round+1):200;
  let res,pts=0,note="";
  if(e.name===g.jackpot&&!G.jack){res="jack";pts=base+BONUS[Math.min(G.round,BONUS.length-1)];G.jack={by:p.name,pid:from,name:e.name,round:G.round};G.used.push(e.name);
    G.rounds=G.round+1;}
  else if(fail){res="miss";note="Doesn't fit: "+fail.label;}
  else{res="fit";pts=base;G.used.push(e.name);}
  p.score+=pts;
  G.log.push({pid:from,who:p.name,ans:e.name,res,pts,note,round:G.round});
  if(from===S.pid)S.note="";
  advance();publish(prevLog,prevJack);
}
function startGame(){
  const G=S.G;G.game=makeGame();G.rounds=G.game.crits.length+1;G.round=0;G.log=[];G.used=[];G.jack=null;
  G.players=G.players.filter(p=>p.on);G.players.forEach(p=>p.score=0);G.phase="play";startRound();publish();
}
function startRound(){
  const G=S.G,on=G.players.filter(p=>p.on).map(p=>p.pid);
  if(!on.length){G.phase="over";return;}
  const k=G.round%on.length;G.order=[...on.slice(k),...on.slice(0,k)];G.turnIdx=0;beginTurn();
}
function beginTurn(){
  const G=S.G;
  while(G.turnIdx<G.order.length){const p=G.players.find(x=>x.pid===G.order[G.turnIdx]);if(p&&p.on)break;G.turnIdx++;}
  if(G.turnIdx>=G.order.length){G.round++;if(G.round>=G.rounds){G.phase="over";return;}startRound();return;}
  G.deadline=Date.now()+G.turnSec*1000;
}
function advance(kind){
  const G=S.G;
  if(kind==="timeout"||kind==="skip"){const p=G.players.find(x=>x.pid===curPid());G.log.push({pid:curPid(),who:p?p.name:"?",ans:null,res:kind,pts:0,round:G.round});}
  G.turnIdx++;beginTurn();
}
setInterval(()=>{
  if(S&&S.role==="host"&&S.G.phase==="play"&&Date.now()>S.G.deadline){const pl=S.G.log.length,pj=S.G.jack;advance("timeout");publish(pl,pj);}
  tickTimer();
},250);
function act(m){if(!S)return;if(S.role==="host")hostHandle(S.pid,m);else S.net.send(m);}

/* ---------- screens ---------- */
const onParty=()=>/^party(-|$)/.test(location.hash.slice(1));
const av=(p,big)=>`<span class="pav${big?" big":""}" style="--c:${p.color}">${esc((p.name||"?").trim().charAt(0).toUpperCase()||"?")}</span>`;
function tickTimer(){
  if(!S||!S.st||S.st.phase!=="play"||!onParty())return;
  const left=Math.max(0,S.deadline-Date.now()),tot=S.st.turnSec*1000;
  document.querySelectorAll(".ptimer").forEach(t=>{const i=t.querySelector("i"),s=t.querySelector("span");if(i)i.style.width=(left/tot*100)+"%";if(s)s.textContent=Math.ceil(left/1000)+"s";t.classList.toggle("low",left<6000);});
}
function draw(prevLog,prevJack){
  if(!onParty())return;
  const keep=document.getElementById("pin"),val=keep?keep.value:"",focused=keep&&document.activeElement===keep;
  app.innerHTML=`<div class="party">${body()}</div>`;
  const pin=document.getElementById("pin");if(pin){pin.value=val;if(focused||(S&&S.st&&S.st.turnPid===S.pid))pin.focus();}
  wire();
  if(S&&S.st){
    const st=S.st;
    if(prevLog!=null&&st.log.length>prevLog){const f=app.querySelector(".pfeed .row");if(f)f.classList.add("flip");}
    if(st.jack&&!prevJack&&prevLog!=null)confetti(["#F2C14E","#ffd970","#c9971c","#ffffff","#141414"],220);
    if(st.phase==="over"&&prevLog!=null&&S._overShown!==st.log.length){S._overShown=st.log.length;confetti(AV.concat("#ffffff"),200);}
  }
  tickTimer();
}
function body(){
  const back=`<a href="#" class="back">← All games</a>`;
  const head=`<div class="ghead"><div class="gicon" style="--c:#F08BB6">${PARTY_IC}</div><div><h1>Party</h1><div class="gsub">Live multiplayer · up to ${MAX_PLAYERS} players</div></div></div>`;
  if(!S||S.status==="left"){
    const nm=esc(store.get("partyName","")),codeFromLink=(location.hash.match(/^#party-([A-Za-z]{4})$/)||[])[1]||"";
    return`${back}${head}
      <p class="how">Each round adds a new clue about a secret person, place or thing. On your turn, name anything that fits <b>every</b> clue so far. Later rounds are worth more. One answer is the <b>Jackpot</b>, the exact thing the clues describe. Name it for a huge bonus. Most points wins.</p>
      <div class="pbox"><label class="plabel" for="pname">Your name</label><input id="pname" class="pfield" maxlength="16" placeholder="e.g. Myles" value="${nm}" autocomplete="off"></div>
      <div class="pchoice">
        <div class="pbox"><div class="plabel">Start a new game</div><p class="psub">You'll get a room code to send your friends.</p><button class="btn" id="pcreate" style="width:100%">Create a room</button></div>
        <div class="pbox"><div class="plabel">Join a friend</div><p class="psub">Type the 4-letter code they sent you.</p>
          <form id="pjoinf" class="pjoin" autocomplete="off"><input id="pcode" class="pfield code" maxlength="4" placeholder="CODE" value="${esc(codeFromLink.toUpperCase())}"><button class="btn" type="submit">Join</button></form></div>
      </div>
      <div class="err" id="perr"></div>`;
  }
  if(S.status==="error")return`${back}${head}<div class="answer"><div class="answer-k">Couldn't connect</div><p>${esc(S.err||"")}</p></div><div class="actions"><button class="btn" data-p="leave">Back</button></div>`;
  if(S.status==="connecting"||!S.st)return`${back}${head}<div class="pwait"><span class="spin"></span>${S.role==="host"?"Creating your room…":"Joining room "+esc(S.code)+"…"}</div>`;
  const st=S.st,me=st.players.find(p=>p.pid===S.pid),isHost=S.role==="host";
  const link=location.origin+location.pathname+"#party-"+st.code;
  if(st.phase==="lobby"){
    return`${back}${head}
      <div class="pcode-box"><div class="plabel">Room code</div><div class="pcode">${[...st.code].map((c,i)=>`<span style="--i:${i}">${c}</span>`).join("")}</div>
        <div class="plink"><input class="pfield" readonly value="${esc(link)}" id="plinkv"><button class="btn ghost" data-p="copy">Copy link</button></div></div>
      <div class="pbox"><div class="plabel">Players (${st.players.filter(p=>p.on).length}/${MAX_PLAYERS})</div>
        <div class="plist">${st.players.map(p=>`<div class="pp${p.on?"":" off"}">${av(p,1)}<span>${esc(p.name)}${p.pid===st.hostPid?' <em>host</em>':""}${p.pid===S.pid?' <em>you</em>':""}</span></div>`).join("")}</div></div>
      ${isHost?`<div class="pbox"><div class="plabel">Time per turn</div><div class="pseg">${TURN_CHOICES.map(t=>`<button class="${t===st.turnSec?"on":""}" data-turn="${t}">${t}s</button>`).join("")}</div></div>
        <div class="actions"><button class="btn" data-p="start">Start game${st.players.filter(p=>p.on).length<2?" (solo)":""}</button><button class="btn ghost" data-p="leave">Close room</button></div>`
      :`<div class="pwait"><span class="spin"></span>Waiting for the host to start…</div><div class="actions"><button class="btn ghost" data-p="leave">Leave</button></div>`}`;
  }
  const board=`<div class="pscores">${[...st.players].sort((a,b)=>b.score-a.score).map(p=>`<div class="ps${p.pid===st.turnPid?" turn":""}${p.on?"":" off"}">${av(p)}<span class="nm">${esc(p.name)}</span><b>${p.score.toLocaleString()}</b></div>`).join("")}</div>`;
  const feed=st.log.length?`<div class="plabel" style="margin-top:22px">Answers</div><div class="rows pfeed">${[...st.log].reverse().map(l=>{
      const cls=l.res==="jack"?"bb":l.res==="fit"?"hit":l.res==="miss"?"miss":"empty skipped";
      const what=l.res==="pass"?"passed":l.res==="timeout"?"ran out of time":l.res==="skip"?"left the game":esc(l.ans);
      const sub=l.res==="jack"?"Jackpot!":l.res==="fit"?"Fits every clue":l.res==="miss"?esc(l.note):"";
      return`<div class="row ${cls}"><span class="i">R${l.round+1}</span><span>${l.res==="jack"?"🎯 ":""}${esc(l.who)}: ${what}${sub?`<small>${sub}</small>`:""}</span><span class="n">${l.pts?"+"+l.pts.toLocaleString():""}</span></div>`;}).join("")}</div>`:"";
  if(st.phase==="over"){
    const ranked=[...st.players].sort((a,b)=>b.score-a.score),top=ranked[0],tie=ranked.filter(p=>p.score===top.score).length>1;
    const medal=["🥇","🥈","🥉"];
    return`${back}${head}
      <div class="pwin">${tie?"It's a tie!":`<span class="crown">🏆</span><div>${esc(top.name)} wins!</div>`}</div>
      <div class="ppod">${ranked.map((p,i)=>`<div class="pr" style="--n:${i}"><span class="md">${medal[i]||i+1}</span>${av(p,1)}<span class="nm">${esc(p.name)}${p.pid===S.pid?" <em>you</em>":""}</span><b>${p.score.toLocaleString()}</b></div>`).join("")}</div>
      ${st.reveal?`<div class="answer"><div class="answer-k">The Jackpot was</div><div class="answer-v">${esc(st.reveal.name)}</div><p>${st.jack?`🎯 Found by ${esc(st.jack.by)} in round ${st.jack.round+1}`:"Nobody found it this time."} · ${esc(st.reveal.hint)}</p></div>`:""}
      <div class="actions">${isHost?`<button class="btn" data-p="start">Play again</button>`:`<div class="pwait" style="flex:1;margin:0"><span class="spin"></span>Waiting for the host…</div>`}<button class="btn ghost" data-p="leave">${isHost?"Close room":"Leave"}</button></div>
      ${feed}`;
  }
  const g=st,mine=st.turnPid===S.pid,turnP=st.players.find(p=>p.pid===st.turnPid);
  const crits=g.crits.map((c,i)=>`<li class="${i===g.crits.length-1&&!g.final?"new":""}">${esc(c)}</li>`).join("")
    +(g.final?`<li class="final new"><b>Final clue:</b> ${esc(g.final)}</li>`:"")
    +Array.from({length:Math.max(0,Math.min(g.critCount,g.rounds)-g.crits.length)},(_,i)=>`<li class="locked">Unlocks in round ${g.crits.length+i+1}</li>`).join("")
    +(!g.final&&g.rounds>g.critCount?`<li class="locked">Final clue unlocks in the last round</li>`:"");
  const roundPts=g.round<g.critCount?100*(g.round+1):200,bonus=BONUS[Math.min(g.round,BONUS.length-1)];
  const turn=mine?`<div class="pturn me"><div class="pt-h"><b>Your turn!</b><div class="ptimer"><i></i><span></span></div></div>
      <form class="guess" id="pansf" autocomplete="off"><input id="pin" list="popts" placeholder="Name a person, place or thing…" aria-label="Your answer"><button class="btn" type="submit">Answer</button></form>
      <datalist id="popts">${NAMES.map(n=>`<option value="${esc(n)}">`).join("")}</datalist>
      <div class="prow"><span class="err">${esc(S.note||"")}</span><button class="link" data-p="pass">Pass</button></div>
      <p class="psub">A fit is worth <b>${roundPts}</b>. The Jackpot is worth <b>${(roundPts+bonus).toLocaleString()}</b>${g.jack?" (already found)":""}.</p></div>`
    :`<div class="pturn"><div class="pt-h">${turnP?av(turnP):""}<b>${esc(turnP?turnP.name:"…")} is answering</b><div class="ptimer"><i></i><span></span></div></div>
      ${me?`<p class="psub">You're up soon. Think of something that fits every clue.</p>`:""}</div>`;
  return`<div class="ptop">${back}<span class="plabel" style="margin:0">Room ${esc(st.code)}</span></div>
    <div class="bo-top"><span>${g.final?"Final round":g.jack?"Last round":"Round "+(g.round+1)+" of "+g.rounds}</span>${g.jack?`<span class="pjack">🎯 ${esc(g.jack.by)} found the Jackpot. Finish this round!</span>`:""}</div>
    ${board}<ol class="cluelist pclues" style="--c:#F08BB6">${crits}</ol>${turn}${feed}
    <div class="actions" style="margin-top:18px"><button class="btn ghost" data-p="leave">${isHost?"End game and close room":"Leave game"}</button></div>`;
}
function wire(){
  const $=id=>document.getElementById(id);
  const getName=()=>{const n=($("pname").value||"").trim().slice(0,16);if(!n){$("perr").textContent="Enter your name first.";$("pname").focus();return null;}store.set("partyName",n);return n;};
  if($("pcreate"))$("pcreate").onclick=()=>{const n=getName();if(n)hostCreate(n);};
  if($("pcode"))$("pcode").oninput=e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z]/g,"");};
  if($("pjoinf"))$("pjoinf").onsubmit=e=>{e.preventDefault();const n=getName();if(!n)return;const c=$("pcode").value.trim().toUpperCase();if(!/^[A-Z]{4}$/.test(c)){$("perr").textContent="Room codes are 4 letters.";return;}guestJoin(c,n);};
  if($("pansf"))$("pansf").onsubmit=e=>{e.preventDefault();const v=$("pin").value.trim();if(!v)return;act({t:"answer",text:v});if(S&&S.role==="guest"){$("pin").value="";}};
  document.querySelectorAll("[data-turn]").forEach(b=>b.onclick=()=>act({t:"settings",turnSec:+b.dataset.turn}));
  document.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{
    const a=b.dataset.p;
    if(a==="leave")leaveParty();
    else if(a==="start")act({t:"start"});
    else if(a==="pass")act({t:"pass"});
    else if(a==="copy"){const t=$("plinkv").value;try{navigator.clipboard.writeText(t).then(()=>toast("Invite link copied"),()=>{$("plinkv").select();toast("Link selected, copy it manually");});}catch(e){$("plinkv").select();}}
  });
}
window.renderParty=()=>draw();
window.addEventListener("beforeunload",()=>{if(S)try{S.net.close();}catch(e){}});
if(onParty())route();
})();
