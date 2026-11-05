/* Spec Sheet: 3D hero. A car built from simple shapes drifts into frame,
   leaving tire smoke and skid marks, then idles on a turntable. Needs three.min.js. */
(function(){
const T=window.THREE;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
let R=null; // renderer state, created once and moved between hero containers

function envTexture(dark){
  // A soft "studio" gradient used for reflections on the paint.
  const c=document.createElement("canvas");c.width=512;c.height=256;const g=c.getContext("2d");
  const grd=g.createLinearGradient(0,0,0,256);
  grd.addColorStop(0,dark?"#2a2f3a":"#ffffff");grd.addColorStop(.42,dark?"#9aa4b5":"#f4f1ea");grd.addColorStop(.5,"#ffffff");
  grd.addColorStop(.56,dark?"#3a3f4a":"#c9c4ba");grd.addColorStop(1,dark?"#07080a":"#8b867d");
  g.fillStyle=grd;g.fillRect(0,0,512,256);
  // a few bright "softbox" panels
  g.fillStyle="rgba(255,255,255,.9)";g.fillRect(60,40,90,60);g.fillRect(330,30,120,50);
  g.fillStyle=dark?"rgba(255,70,50,.55)":"rgba(255,80,60,.35)";g.fillRect(200,90,70,24);
  const t=new T.CanvasTexture(c);t.mapping=T.EquirectangularReflectionMapping;t.colorSpace=T.SRGBColorSpace;return t;
}
function softDot(){
  const c=document.createElement("canvas");c.width=c.height=64;const g=c.getContext("2d");
  const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,"rgba(255,255,255,1)");r.addColorStop(.5,"rgba(255,255,255,.45)");r.addColorStop(1,"rgba(255,255,255,0)");
  g.fillStyle=r;g.fillRect(0,0,64,64);return new T.CanvasTexture(c);
}

function makeCar(){
  const car=new T.Group(),body=new T.Group();car.add(body);
  const paint=new T.MeshPhysicalMaterial({color:0xd9261c,metalness:.55,roughness:.26,clearcoat:1,clearcoatRoughness:.06});
  const black=new T.MeshStandardMaterial({color:0x1a1c21,roughness:.55,metalness:.25});
  const glass=new T.MeshPhysicalMaterial({color:0x1b2738,metalness:.35,roughness:.04,clearcoat:1,envMapIntensity:1.6});
  const chrome=new T.MeshStandardMaterial({color:0xe8ecf2,metalness:1,roughness:.18,envMapIntensity:1.4});
  // Side profile of the body, with wheel arches cut along the bottom edge. Car points along +x.
  const s=new T.Shape();
  s.moveTo(2.3,.34);s.lineTo(2.42,.5);s.quadraticCurveTo(2.36,.66,1.95,.7);s.lineTo(.8,.8);s.lineTo(-1.65,.86);
  s.lineTo(-2.25,.92);s.quadraticCurveTo(-2.46,.86,-2.44,.6);s.lineTo(-2.36,.34);s.lineTo(-1.86,.32);
  s.absarc(-1.4,.37,.46,Math.PI,0,true);s.lineTo(.89,.32);s.absarc(1.35,.37,.46,Math.PI,0,true);s.lineTo(2.3,.34);
  const bg=new T.ExtrudeGeometry(s,{depth:1.86,bevelEnabled:true,bevelThickness:.09,bevelSize:.07,bevelSegments:4,curveSegments:24});
  bg.translate(0,0,-.93);const shell=new T.Mesh(bg,paint);shell.castShadow=true;body.add(shell);
  // Cabin / glass
  const c=new T.Shape();c.moveTo(.9,.8);c.lineTo(-.05,1.22);c.lineTo(-.9,1.25);c.quadraticCurveTo(-1.55,1.18,-1.95,.88);c.lineTo(.9,.8);
  const cg=new T.ExtrudeGeometry(c,{depth:1.42,bevelEnabled:true,bevelThickness:.06,bevelSize:.06,bevelSegments:3,curveSegments:16});
  cg.translate(0,0,-.71);const cab=new T.Mesh(cg,glass);cab.castShadow=true;body.add(cab);
  // Racing stripes over the hood and roof
  const stripeM=new T.MeshStandardMaterial({color:0xf4f1ea,roughness:.4});
  [[.98,.82,1.7,.012],[-.95,1.29,.95,.012]].forEach(([x,y,w])=>{[-.16,.16].forEach(z=>{const m=new T.Mesh(new T.BoxGeometry(w,.012,.12),stripeM);m.position.set(x,y,z);m.rotation.z=x>0?-.1:0;body.add(m);});});
  // Rear wing
  const wing=new T.Mesh(new T.BoxGeometry(.42,.05,1.86),black);wing.position.set(-2.08,1.18,0);wing.castShadow=true;body.add(wing);
  [-.6,.6].forEach(z=>{const p=new T.Mesh(new T.BoxGeometry(.08,.3,.06),black);p.position.set(-2.03,1.02,z);body.add(p);});
  // Lights
  const head=new T.MeshStandardMaterial({color:0xffffff,emissive:0xfff3d6,emissiveIntensity:2.2});
  const tail=new T.MeshStandardMaterial({color:0xff2a2a,emissive:0xff1a1a,emissiveIntensity:2.6});
  [-.62,.62].forEach(z=>{const h=new T.Mesh(new T.BoxGeometry(.06,.07,.42),head);h.position.set(2.39,.56,z);h.rotation.z=-.5;body.add(h);});
  const tb=new T.Mesh(new T.BoxGeometry(.05,.06,1.7),tail);tb.position.set(-2.47,.7,0);body.add(tb);
  // Side skirts and a splitter
  [-1,1].forEach(sd=>{const k=new T.Mesh(new T.BoxGeometry(2.0,.08,.06),black);k.position.set(-.05,.33,sd*1.0);body.add(k);});
  const sp=new T.Mesh(new T.BoxGeometry(.3,.04,1.9),black);sp.position.set(2.32,.3,0);body.add(sp);
  // Wheels
  const wheels=[];
  const tireG=new T.CylinderGeometry(.37,.37,.3,36);tireG.rotateX(Math.PI/2);
  const rimG=new T.CylinderGeometry(.25,.25,.31,24);rimG.rotateX(Math.PI/2);
  const spokeG=new T.BoxGeometry(.06,.44,.32);
  [[1.35,.92],[1.35,-.92],[-1.4,.92],[-1.4,-.92]].forEach(([x,z],i)=>{
    const w=new T.Group();w.position.set(x,.37,z);
    const t=new T.Mesh(tireG,black);t.castShadow=true;w.add(t);
    const spin=new T.Group();w.add(spin);spin.add(new T.Mesh(rimG,chrome));
    for(let k=0;k<5;k++){const sp=new T.Mesh(spokeG,black);sp.rotation.z=k*Math.PI*2/5;spin.add(sp);}
    car.add(w);wheels.push({g:w,spin,rear:x<0,front:x>0,side:Math.sign(z)});
  });
  car.userData={body,wheels,paint};
  return car;
}

function build(){
  const canvas=document.createElement("canvas");canvas.className="car3d";
  let renderer;
  try{renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:"high-performance"});}catch(e){return null;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,matchMedia("(max-width:640px)").matches?1.5:2));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.outputColorSpace=T.SRGBColorSpace;
  const scene=new T.Scene();
  const camera=new T.PerspectiveCamera(32,1,.1,120);
  const pmrem=new T.PMREMGenerator(renderer);
  const hemi=new T.HemisphereLight(0xffffff,0x20222a,.55);scene.add(hemi);
  const key=new T.DirectionalLight(0xffffff,2.2);key.position.set(5,11,6);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:30});key.shadow.bias=-.0004;scene.add(key);
  const rimR=new T.PointLight(0xff3b30,26,18,1.6);rimR.position.set(-5,2.4,-4);scene.add(rimR);
  const rimC=new T.PointLight(0x22d3ee,22,18,1.6);rimC.position.set(5.5,2.2,-5);scene.add(rimC);
  const under=new T.PointLight(0x22d3ee,6,4,2);under.position.set(0,.12,0);
  // Ground and grid
  const floorM=new T.MeshStandardMaterial({color:0x1d2027,roughness:.82,metalness:.1});
  const floor=new T.Mesh(new T.PlaneGeometry(220,220),floorM);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  const grid=new T.GridHelper(220,110,0xff3b30,0x2b3140);grid.position.y=.004;grid.material.transparent=true;grid.material.opacity=.42;scene.add(grid);
  // Car
  const car=makeCar();scene.add(car);car.add(under);
  // Smoke particles
  const dot=softDot(),smoke=[];
  for(let i=0;i<180;i++){const m=new T.SpriteMaterial({map:dot,color:0xd8d8dc,transparent:true,opacity:0,depthWrite:false});const sp=new T.Sprite(m);sp.visible=false;scene.add(sp);smoke.push({sp,life:0,max:1,v:new T.Vector3()});}
  let smokeIdx=0;
  // Skid marks: two ribbons that grow as the rear tires slide
  const SEG=700,skids=[];
  const skidM=new T.MeshBasicMaterial({color:0x050505,transparent:true,opacity:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
  for(let k=0;k<2;k++){
    const geo=new T.BufferGeometry();const pos=new Float32Array(SEG*6*3);geo.setAttribute("position",new T.BufferAttribute(pos,3));geo.setDrawRange(0,0);
    const mesh=new T.Mesh(geo,skidM);mesh.frustumCulled=false;scene.add(mesh);skids.push({geo,pos,n:0,last:null});
  }
  function themeUpdate(){
    const dark=document.documentElement.dataset.theme!=="light";
    const env=envTexture(dark);const rt=pmrem.fromEquirectangular(env);scene.environment=rt.texture;env.dispose();
    const fogC=dark?0x0d0f13:0xe9e5dc;scene.fog=new T.Fog(fogC,18,58);scene.background=new T.Color(fogC);
    floorM.color.set(dark?0x1d2027:0xd8d3c8);grid.material.opacity=dark?.42:.3;
    grid.material.color&&grid.material.vertexColors;
    hemi.intensity=dark?.55:1.0;rimR.intensity=dark?26:10;rimC.intensity=dark?22:8;under.intensity=dark?6:2;
    skidM.color.set(dark?0x020202:0x2a2725);skidM.opacity=dark?.65:.45;
  }
  themeUpdate();
  new MutationObserver(themeUpdate).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  return{renderer,scene,camera,car,smoke,skids,canvas,themeUpdate,next:()=>smoke[smokeIdx=(smokeIdx+1)%smoke.length]};
}

/* ---------- the drift ---------- */
const P0=new T.Vector3(-22,0,-7),P1=new T.Vector3(-5.5,0,-8.5),P2=new T.Vector3(0,0,0);
const bez=(t,o)=>o.set(0,0,0).addScaledVector(P0,(1-t)*(1-t)).addScaledVector(P1,2*(1-t)*t).addScaledVector(P2,t*t);
const tan=(t,o)=>o.set(0,0,0).addScaledVector(P0,-2*(1-t)).addScaledVector(P1,2*(1-2*t)).addScaledVector(P2,2*t);
const yawOf=v=>Math.atan2(-v.z,v.x);
const DUR=3.4;
const easeOut=t=>1-Math.pow(1-t,3.2);
let t0=0,state="idle",spinVel=0,spinYaw=0,drag=null,last=0,hudCb=null;
const tmp=new T.Vector3(),tmp2=new T.Vector3(),wp=new T.Vector3();

function resetDrift(){
  R.skids.forEach(s=>{s.n=0;s.last=null;s.geo.setDrawRange(0,0);});
  R.smoke.forEach(p=>{p.life=0;p.sp.visible=false;});
  t0=performance.now();state=reduce?"idle":"drift";spinYaw=0;spinVel=0;
  if(reduce){placeEnd();}
}
function placeEnd(){
  const car=R.car;bez(1,car.position);car.rotation.y=yawOf(tan(.999,tmp))+spinYaw;
  car.userData.body.rotation.set(0,0,0);
}
function addSkid(k,p){
  const s=R.skids[k];
  if(s.last&&s.n<SEGMAX()){
    const a=s.last,b=p;const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);if(len<.04)return;
    const nx=-dz/len*.13,nz=dx/len*.13,y=.012,o=s.n*18,P=s.pos;
    const q=[a.x+nx,y,a.z+nz,a.x-nx,y,a.z-nz,b.x+nx,y,b.z+nz, a.x-nx,y,a.z-nz,b.x-nx,y,b.z-nz,b.x+nx,y,b.z+nz];
    for(let i=0;i<18;i++)P[o+i]=q[i];
    s.n++;s.geo.attributes.position.needsUpdate=true;s.geo.setDrawRange(0,s.n*6);
  }
  s.last=p.clone();
}
const SEGMAX=()=>700;
function puff(p,amt){
  for(let i=0;i<amt;i++){
    const s=R.next();s.life=0;s.max=1.3+Math.random()*1.1;s.sp.visible=true;
    s.sp.position.set(p.x+(Math.random()-.5)*.3,.25+Math.random()*.2,p.z+(Math.random()-.5)*.3);
    s.v.set((Math.random()-.5)*1.4,.5+Math.random()*.9,(Math.random()-.5)*1.4);
    s.base=.7+Math.random()*.6;s.sp.material.opacity=0;
  }
}
function frame(now){
  if(!R)return;
  requestAnimationFrame(frame);
  const visible=R.canvas.isConnected&&!document.hidden&&R.onscreen!==false;
  if(!visible){last=now;return;}
  const dt=Math.min(.05,(now-(last||now))/1000);last=now;
  const car=R.car,{body,wheels}=car.userData;
  let speed=0,slide=0;
  if(state==="drift"){
    const u=Math.min(1,(now-t0)/1000/DUR),t=easeOut(u);
    const prev=car.position.clone();
    bez(t,car.position);
    const head=yawOf(tan(Math.min(t,.999),tmp));
    // Drift angle: the rear swings out mid-corner, then the car straightens as it stops.
    const ang=-.95*Math.sin(Math.PI*Math.min(1,u*1.15))*Math.pow(1-u,.35);
    car.rotation.y=head+ang;
    speed=prev.distanceTo(car.position)/Math.max(dt,.001);
    slide=Math.abs(ang);
    body.rotation.x=ang*.07;body.rotation.z=-Math.min(.06,(1-u)*.02)+(u>.86?Math.sin((u-.86)*40)*.025*(1-u)*6:0);
    // spin the wheels, rear faster when sliding
    wheels.forEach(w=>{w.spin.rotation.z-=(speed*dt/.37)*(w.rear?1+slide*1.6:1);if(w.front)w.g.rotation.y=-ang*.6;});
    // rear tire smoke + skid marks
    if(slide>.12&&speed>.8){
      wheels.filter(w=>w.rear).forEach((w,k)=>{w.g.getWorldPosition(wp);puff(wp,slide>.4?2:1);addSkid(k,wp.clone());});
    }else R.skids.forEach(s=>s.last=null);
    if(u>=1){state="idle";wheels.forEach(w=>{if(w.front)w.g.rotation.y=0;});}
  }else{
    // Idle: slow turntable, or a drag-to-spin
    if(!drag)spinVel+=(.18-spinVel)*Math.min(1,dt*1.5);
    spinYaw+=spinVel*dt;
    const head=yawOf(tan(.999,tmp));car.position.copy(bez(1,tmp2));car.rotation.y=head+spinYaw;
    body.rotation.x*=.9;body.rotation.z*=.9;
  }
  // smoke update
  R.smoke.forEach(s=>{if(!s.sp.visible)return;s.life+=dt;const k=s.life/s.max;if(k>=1){s.sp.visible=false;return;}
    s.sp.position.addScaledVector(s.v,dt);s.v.multiplyScalar(.97);const sc=s.base*(.6+k*3.2);s.sp.scale.set(sc,sc,1);
    s.sp.material.opacity=Math.min(.55,k*4)*(1-k);});
  // camera: slight parallax from the pointer and a little shake while drifting
  const px=R.px||0,py=R.py||0,shake=state==="drift"?slide*.03:0;
  const camBase=R.camBase;
  R.camera.position.set(camBase.x+px*1.2+(Math.random()-.5)*shake,camBase.y-py*.6+(Math.random()-.5)*shake,camBase.z);
  R.camera.lookAt(R.lookAt);
  R.renderer.render(R.scene,R.camera);
  if(hudCb)hudCb(state==="drift"?speed:0,state);
}
function size(){
  if(!R||!R.canvas.parentElement)return;
  const el=R.canvas.parentElement,w=el.clientWidth,h=el.clientHeight;
  R.renderer.setSize(w,h,false);R.camera.aspect=w/h;
  // Frame the car a little differently on narrow screens
  const narrow=w<700;R.camera.fov=narrow?44:30;
  R.camBase=narrow?new T.Vector3(7.8,4.6,11):new T.Vector3(9.2,3.2,9.6);
  R.lookAt=narrow?new T.Vector3(.3,1.55,0):new T.Vector3(-3.4,.5,.6);
  R.camera.updateProjectionMatrix();
}

window.SpecHero={
  mount(container,{onHud}={}){
    if(!T){return false;}
    if(!R){R=build();if(!R)return false;
      new ResizeObserver(size).observe(container);
      R.io=new IntersectionObserver(es=>{R.onscreen=es[0].isIntersecting;});
      addEventListener("pointermove",e=>{R.px=(e.clientX/innerWidth-.5)*2;R.py=(e.clientY/innerHeight-.5)*2;});
      R.canvas.addEventListener("pointerdown",e=>{drag={x:e.clientX};R.canvas.setPointerCapture(e.pointerId);});
      R.canvas.addEventListener("pointermove",e=>{if(!drag)return;const dx=e.clientX-drag.x;drag.x=e.clientX;spinVel=dx*.25;spinYaw+=dx*.012;});
      const up=()=>{drag=null;};R.canvas.addEventListener("pointerup",up);R.canvas.addEventListener("pointercancel",up);
      resetDrift();requestAnimationFrame(frame);
    }
    container.prepend(R.canvas);R.io.disconnect();R.io.observe(container);
    hudCb=onHud||null;size();
    return true;
  },
  replay(){if(R)resetDrift();},
  playing:()=>state==="drift"
};
})();
