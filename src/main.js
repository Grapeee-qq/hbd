import "./style.css";
import * as T from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { classifyHand, handOpenness } from "./gesture.js";
import { Cinematic } from "./cinematic.js";

const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;

const $ = (s) => document.querySelector(s),
  canvas = $("#scene");
const renderer = new T.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFShadowMap;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
const scene = new T.Scene();
scene.background = new T.Color("#101e2c");
scene.fog = new T.FogExp2("#142936", 0.0018);
const camera = new T.PerspectiveCamera(53, innerWidth / innerHeight, 0.1, 1800);
camera.position.set(8, 4.2, 13);
const clock = new T.Timer();
clock.connect(document);
let time = 0,
  state = "arrival",
  stateAt = 0,
  lit = 0,
  celebration = 0;
const mat = (c, r = 0.7, m = 0) =>
  new T.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
const woodCanvas = document.createElement("canvas");
woodCanvas.width = 512;
woodCanvas.height = 512;
const wc = woodCanvas.getContext("2d");
wc.fillStyle = "#705039";
wc.fillRect(0, 0, 512, 512);
let seed = 39;
function rnd() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
for (let i = 0; i < 2100; i++) {
  let y = rnd() * 512;
  wc.strokeStyle = `rgba(${rnd() > 0.5 ? "205,159,104" : "32,20,14"},${rnd() * 0.17})`;
  wc.beginPath();
  wc.moveTo(0, y);
  for (let x = 0; x <= 512; x += 16)
    wc.lineTo(x, y + Math.sin(x * 0.019 + y) * 2);
  wc.stroke();
}
const woodTex = new T.CanvasTexture(woodCanvas);
woodTex.colorSpace = T.SRGBColorSpace;
woodTex.wrapS = woodTex.wrapT = T.RepeatWrapping;
woodTex.repeat.set(2, 1);
const wood = new T.MeshStandardMaterial({ map: woodTex, roughness: 0.55 });
function box(x, y, z, w, h, d, material) {
  let o = new T.Mesh(new T.BoxGeometry(w, h, d), material);
  o.position.set(x, y, z);
  o.castShadow = true;
  o.receiveShadow = true;
  scene.add(o);
  return o;
}
function cyl(x, y, z, r, h, material, r2 = r) {
  let o = new T.Mesh(new T.CylinderGeometry(r, r2, h, 64), material);
  o.position.set(x, y, z);
  o.castShadow = true;
  o.receiveShadow = true;
  scene.add(o);
  return o;
}
const dark = mat("#282c2a", 0.5, 0.25),
  fabric = mat("#c4b29a", 0.95),
  cream = mat("#ece0c8", 0.68),
  brass = mat("#9e7945", 0.28, 0.75);
// Wide glazed cabin. Individual planks catch warm pools of light.
for (let i = 0; i < 28; i++)
  box(-6.8 + i * 0.5, -0.12, 3, 0.485, 0.22, 14, wood);
box(0, -0.5, 3, 14, 0.5, 14, dark);
for (const z of [-4, 3, 10]) box(0, 6.7, z, 14, 0.18, 0.18, wood);
for (const x of [-7, 7])
  for (const z of [-4, 3, 10]) box(x, 3.3, z, 0.13, 6.8, 0.13, dark);
for (const x of [-7, -3.5, 0, 3.5, 7]) box(x, 3.3, -4, 0.095, 6.8, 0.095, dark);
box(0, 0, -4, 14, 0.1, 0.1, dark);
box(0, 6.6, -4, 14, 0.1, 0.1, dark);
const glass = new T.MeshPhysicalMaterial({
  color: "#91b4ad",
  transparent: true,
  opacity: 0.045,
  roughness: 0.12,
  metalness: 0.2,
  side: T.DoubleSide,
  depthWrite: false,
});
box(0, 3.3, -4.02, 14, 6.6, 0.02, glass);
box(-7, 3.3, 3, 0.02, 6.6, 14, glass);
box(0, 6.8, 3, 14, 0.02, 14, glass).castShadow = false;
// Wool rug and a single chair.
box(1, 0.016, 2, 6.2, 0.035, 5, mat("#777068", 1));
for (let i = 0; i < 65; i++)
  box(-2.05 + i * 0.095, 0.039, 2, 0.009, 0.005, 5, mat("#a49a88", 1));
const table = cyl(1, 1.9, 0.3, 2.15, 0.19, wood);
cyl(1, 0.92, 0.3, 0.42, 1.8, wood, 0.7);
// A darker tabletop grain preserves detail under the pendant.
table.material = wood.clone();
table.material.color.set("#a88b6c");
box(1, 1.05, 3.55, 1.42, 0.18, 1.5, wood);
box(1, 1.21, 3.55, 1.34, 0.18, 1.4, fabric);
box(1, 1.98, 4.19, 1.48, 1.5, 0.18, wood);
box(1, 1.99, 4.06, 1.3, 1.2, 0.12, fabric);
for (let x of [0.42, 1.58])
  for (let z of [3, 4.1]) box(x, 0.5, z, 0.095, 1, 0.095, wood);
// Porcelain plate, softly textured cream cake, piped rim, berries, single taper.
cyl(1, 2.02, 0.3, 0.8, 0.065, mat("#dedbd0", 0.26));
cyl(1, 2.23, 0.3, 0.59, 0.38, cream);
cyl(1, 2.435, 0.3, 0.595, 0.045, cream);
const pipingGeometry=new T.LatheGeometry([new T.Vector2(0,0),new T.Vector2(.045,0),new T.Vector2(.061,.018),new T.Vector2(.055,.045),new T.Vector2(.038,.073),new T.Vector2(.018,.097),new T.Vector2(0,.115)],32);
const pipingPositions=pipingGeometry.attributes.position;
for(let i=0;i<pipingPositions.count;i++){
  const x=pipingPositions.getX(i),z=pipingPositions.getZ(i),y=pipingPositions.getY(i),a=Math.atan2(z,x);
  const fold=1+Math.sin(a*7+y*37)*.16;
  pipingPositions.setXYZ(i,x*fold+Math.pow(y/.115,3)*.012,y,z*fold);
}
pipingGeometry.computeVertexNormals();
for (let i = 0; i < 32; i++) {
  let a = (i / 32) * Math.PI * 2;
  const dollop = new T.Mesh(pipingGeometry, cream);
  dollop.rotation.y=a;
  dollop.position.set(1 + Math.cos(a) * 0.53, 2.455, 0.3 + Math.sin(a) * 0.53);
  dollop.castShadow=true;
  scene.add(dollop);
}
for (let i = 0; i < 6; i++) {
  const b = new T.Mesh(
    new T.SphereGeometry(0.071, 16, 12),
    mat("#303e64", 0.77),
  );
  b.position.set(
    1 + Math.cos(i * 2.4) * 0.36,
    2.51,
    0.3 + Math.sin(i * 2.4) * 0.36,
  );
  scene.add(b);
  b.scale.set(1,.9,1);
  // Five-point calyx and waxy blueberry bloom remain visible in the close-up.
  const crown=new T.Mesh(new T.CircleGeometry(.022,5),mat('#1e2944',.9));
  crown.rotation.x=-Math.PI/2;crown.position.copy(b.position);crown.position.y+=.064;scene.add(crown);
  for(let j=0;j<5;j++){
    const petal=new T.Mesh(new T.ConeGeometry(.009,.018,3),mat('#596783',.9));
    const a=j*Math.PI*2/5;petal.position.copy(crown.position).add(new T.Vector3(Math.cos(a)*.018,.003,Math.sin(a)*.018));petal.rotation.z=Math.cos(a)*.65;scene.add(petal);
  }
}
const goldLeaf=mat('#d5af65',.3,.72);
for(let i=0;i<18;i++){
  const a=i*2.399,r=.18+rnd()*.29;
  const leaf=new T.Mesh(new T.PlaneGeometry(.013+rnd()*.019,.008+rnd()*.013),goldLeaf);
  leaf.rotation.set(-Math.PI/2+.12*rnd(),0,a);leaf.position.set(1+Math.cos(a)*r,2.463,.3+Math.sin(a)*r);scene.add(leaf);
}
const plateRim=new T.Mesh(new T.TorusGeometry(.773,.006,8,128),goldLeaf);plateRim.rotation.x=Math.PI/2;plateRim.position.set(1,2.054,.3);scene.add(plateRim);
cyl(1, 2.7, 0.3, 0.037, 0.5, mat("#dbc1a0", 0.45));
cyl(1, 2.975, 0.3, 0.006, 0.055, dark);
const flame = new T.Mesh(
  new T.LatheGeometry(
    [
      new T.Vector2(0, -0.06),
      new T.Vector2(0.033, -0.045),
      new T.Vector2(0.044, -0.015),
      new T.Vector2(0.028, 0.025),
      new T.Vector2(0.012, 0.055),
      new T.Vector2(0, 0.085),
    ],
    28,
  ),
  new T.MeshBasicMaterial({ color: "#ffd392", transparent: true, opacity: 0 }),
);
flame.position.set(1, 3.055, 0.3);
flame.scale.set(0.65, 1.7, 0.65);
scene.add(flame);
const candleLight = new T.PointLight("#ffb858", 0, 7, 2);
candleLight.position.copy(flame.position);
scene.add(candleLight);
// Brass pendant, warm key and cold sky fill.
cyl(2.8, 4.9, 1, 0.65, 0.24, brass, 0.9);
cyl(2.8, 5.9, 1, 0.017, 1.8, dark);
cyl(2.8, 4.76, 1, 0.57, 0.035, new T.MeshBasicMaterial({ color: "#f3c88e" }));
const key = new T.SpotLight("#ffd39a", 110, 25, 1.1, 0.75, 1.5);
key.position.set(2.8, 4.65, 1);
key.target.position.set(1, 0, 0.3);
scene.add(key, key.target);
key.castShadow = true;
key.shadow.mapSize.set(
  innerWidth < 600 ? 1024 : 2048,
  innerWidth < 600 ? 1024 : 2048,
);
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.025;
key.shadow.radius = 5;
// Large area fill gives the shaded chair and floor a soft amber bounce.
const bounce = new T.PointLight("#ffc88e", 18, 16, 2);
bounce.position.set(1, 3, 4.8);
scene.add(bounce);
const skyFill=new T.HemisphereLight("#87acae", "#644332", 1.1);scene.add(skyFill);
const cool = new T.DirectionalLight("#a1c8dd", 1.3);
cool.position.set(-8, 12, -20);
scene.add(cool);
const warmFill = new T.PointLight("#eeba80", 13, 16, 2);
warmFill.position.set(-3, 3, 5);
scene.add(warmFill);
// Procedural terrain remains available if the detailed panorama cannot load.
const terrain = new T.Group();
scene.add(terrain);
for (let layer = 0; layer < 3; layer++) {
  const g = new T.PlaneGeometry(650, 115, 250, 45);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  let colors = [];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      z = p.getZ(i);
    let envelope = 0.45 + 0.55 * Math.sin(((z + 58) / 115) * Math.PI);
    let ridge =
      16 +
      Math.pow(Math.abs(Math.sin(x * 0.018 + layer * 2)), 3) * 38 +
      Math.pow(Math.abs(Math.sin(x * 0.041 + layer)), 5) * 18;
    let noise =
      Math.sin(x * 0.32 + z * 0.28) * Math.sin(z * 0.23) * 2 +
      Math.sin(x * 1.1 + z * 0.55) * 0.6;
    let h = (ridge + noise) * envelope;
    p.setY(i, h);
    const snow = h > 24 + 8 * Math.sin(x * 0.057 + z * 0.1);
    let c = new T.Color(snow ? "#9eb7c3" : "#334b60");
    c.multiplyScalar(0.65 + layer * 0.09 + rnd() * 0.13);
    colors.push(c.r, c.g, c.b);
  }
  g.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  const mesh = new T.Mesh(
    g,
    new T.MeshStandardMaterial({ vertexColors: true, roughness: 1 }),
  );
  mesh.position.set(layer * 40 - 30, -4, -185 - layer * 105);
  terrain.add(mesh);
}
const panoramaTexture = new T.TextureLoader().load(assetUrl("mountains.png"), () => {
  terrain.visible = false;
});
panoramaTexture.colorSpace = T.SRGBColorSpace;
const panorama = new T.Mesh(
  new T.PlaneGeometry(1800, 320),
  new T.MeshBasicMaterial({
    map: panoramaTexture,
    fog: false,
    toneMapped: false,
  }),
);
panorama.position.set(-260, 95, -600);
scene.add(panorama);
// Stars and restrained moving curtains in the actual 3D sky.
const starPos = [];
for (let i = 0; i < 2100; i++) {
  let x = (rnd() - 0.5) * 1300,
    y = 65 + rnd() * 430,
    z = -500 - rnd() * 350;
  starPos.push(x, y, z);
}
const sg = new T.BufferGeometry();
sg.setAttribute("position", new T.Float32BufferAttribute(starPos, 3));
const skyStars=new T.Points(
    sg,
    new T.PointsMaterial({
      color: "#d1e0e7",
      size: 0.7,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true,
    }),
  );scene.add(skyStars);
const auroraMat = new T.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  side: T.DoubleSide,
  blending: T.AdditiveBlending,
  uniforms: { uTime: { value: 0 }, uGlow: { value: 1 } },
  vertexShader: `varying vec2 vUv;uniform float uTime;void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*.013+uTime*.06)*22.;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
  fragmentShader: `varying vec2 vUv;uniform float uTime;uniform float uGlow;void main(){float x=vUv.x;float ribbon=.28+sin(x*8.+uTime*.035)*.12+sin(x*19.-uTime*.025)*.04;float d=vUv.y-ribbon;float shape=exp(-pow(d*7.,2.))*smoothstep(-.03,.06,d);float folds=.45+.55*pow(.5+.5*sin(x*190.+sin(x*43.+uTime*.06)*2.),2.);float edge=sin(x*3.14159);vec3 col=mix(vec3(.18,.49,.39),vec3(.31,.27,.48),smoothstep(.05,.35,d));gl_FragColor=vec4(col,shape*folds*edge*.55*uGlow);}`,
});
const auroras=new T.Group();scene.add(auroras);
for (let i = 0; i < 3; i++) {
  let a = new T.Mesh(new T.PlaneGeometry(800, 260, 100, 1), auroraMat);
  a.position.set(-180 + i * 65, 215 + i * 25, -490 - i * 25);
  a.rotation.z = 0.1 - i * 0.07;
  auroras.add(a);
}
// Planar reflection with gentle normal distortion and dark water tint.
const lake = new Reflector(new T.PlaneGeometry(1600, 1400), {
  textureWidth: Math.min(innerWidth, 1280),
  textureHeight: Math.min(innerHeight, 800),
  color: 0x526b72,
  clipBias: 0.003,
});
lake.rotation.x = -Math.PI / 2;
lake.position.set(0, -0.8, -450);
scene.add(lake);
lake.material.uniforms.uTime = { value: 0 };
lake.material.fragmentShader = lake.material.fragmentShader
  .replace("void main() {", "uniform float uTime;\nvoid main() {")
  .replace(
    "vec4 base = texture2DProj( tDiffuse, vUv );",
    "vec4 uv2=vUv; uv2.x += sin(vUv.y*110.0+uTime*.3)*.0007*vUv.w; uv2.y += sin(vUv.x*190.0+uTime*.22)*.00035*vUv.w; vec4 base = texture2DProj(tDiffuse,uv2)*.5; vec4 delta=vec4(.0007,.0005,0.,0.)*vUv.w; base += texture2DProj(tDiffuse,uv2+delta)*.25+texture2DProj(tDiffuse,uv2-delta)*.25; base.rgb *= .82;",
  );
// Quiet shoreline stones and deck edge.
const shoreRocks=new T.Group();scene.add(shoreRocks);
for (let i = 0; i < 45; i++) {
  let r = 0.2 + rnd() * 0.65;
  const rock = new T.Mesh(new T.SphereGeometry(r, 12, 8), mat("#35454a", 1));
  rock.scale.set(1.6, 0.55, 1);
  rock.position.set((rnd() - 0.5) * 45, -0.45, -6 - rnd() * 5);
  shoreRocks.add(rock);
}
const estateGround=new T.Mesh(new T.PlaneGeometry(1800,1600),mat('#526149',1));estateGround.rotation.x=-Math.PI/2;estateGround.position.set(0,-.8,-500);estateGround.visible=false;scene.add(estateGround);
const gardenPath=new T.Mesh(new T.PlaneGeometry(4,180),mat('#a6987e',1));gardenPath.rotation.x=-Math.PI/2;gardenPath.position.set(0,-.79,-90);gardenPath.visible=false;scene.add(gardenPath);
const sceneOptions={
  alpine:{asset:assetUrl('mountains.png'),label:'THE LAKESIDE CABIN',caption:'北境湖畔 · 今夜为你亮灯',sky:'#101e2c',fill:'#87acae',sun:'#a1c8dd',intensity:1.1},
  ocean:{asset:assetUrl('sunrise.png'),label:'THE SUNRISE RETREAT',caption:'日出海边 · 迎接属于你的新一天',sky:'#c5b3a6',fill:'#d7d6d0',sun:'#ffd6a0',intensity:1.8},
  manor:{asset:assetUrl('manor.png'),label:'THE GARDEN CONSERVATORY',caption:'欧洲庄园 · 花园为你醒来',sky:'#a8b8b7',fill:'#dbdccb',sun:'#ffe0ab',intensity:1.65}
};
let activeScene='alpine',sceneRequest=0;
const sceneTextures=new Map([['alpine',panoramaTexture]]);
async function selectScene(id){
  const config=sceneOptions[id];if(!config)return;
  const request=++sceneRequest;$('#scene-status').textContent='正在打开窗外的风景…';
  try{
    let texture=sceneTextures.get(id);
    if(!texture){texture=await new T.TextureLoader().loadAsync(config.asset);texture.colorSpace=T.SRGBColorSpace;sceneTextures.set(id,texture);}
    if(request!==sceneRequest)return;
    activeScene=id;panorama.material.map=texture;panorama.material.needsUpdate=true;
    panorama.scale.set(id==='ocean'?1.25:1,id==='alpine'?1:id==='ocean'?2.35:1.875,1);
    panorama.position.y=id==='alpine'?95:id==='ocean'?-2:100;
    panorama.position.x=id==='alpine'?-260:-430;
    scene.background.set(config.sky);scene.fog.color.set(config.sky);
    skyFill.color.set(config.fill);skyFill.intensity=config.intensity;cool.intensity=id==='alpine'?1.3:2;
    auroras.visible=skyStars.visible=id==='alpine';lake.visible=id!=='manor';shoreRocks.visible=id==='alpine';
    estateGround.visible=gardenPath.visible=false;terrain.visible=false;
    lake.material.uniforms.color.value.set(id==='ocean'?'#6a969a':'#526b72');
    $('.place span').textContent=config.label;$('.place span+span').textContent=config.caption;
    if(state==='arrival')$('#title').textContent=id==='alpine'?'今晚，世界慢一点。':'今天，世界慢一点。';
    document.querySelectorAll('[data-scene]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.scene===id)));
    renderer.shadowMap.needsUpdate=true;$('#scene-status').textContent='';
  }catch{if(request===sceneRequest)$('#scene-status').textContent='风景暂时没有加载成功，请再试一次。';}
}
document.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',()=>selectScene(button.dataset.scene)));
const dustG = new T.BufferGeometry(),
  dustBase = new Float32Array(150 * 3);
for (let i = 0; i < 150; i++) {
  dustBase[i * 3] = (rnd() - 0.5) * 12;
  dustBase[i * 3 + 1] = rnd() * 6;
  dustBase[i * 3 + 2] = (rnd() - 0.5) * 12;
}
dustG.setAttribute("position", new T.BufferAttribute(dustBase.slice(), 3));
const dust = new T.Points(
  dustG,
  new T.PointsMaterial({
    color: "#e7cca0",
    size: 0.018,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  }),
);
scene.add(dust);
const wishG = new T.BufferGeometry(),
  wishBase = new Float32Array(90 * 3);
for (let i = 0; i < 90; i++) {
  wishBase[i * 3] = (rnd() - 0.5) * 20;
  wishBase[i * 3 + 1] = rnd() * 7;
  wishBase[i * 3 + 2] = -rnd() * 16;
}
wishG.setAttribute("position", new T.BufferAttribute(wishBase.slice(), 3));
const wish = new T.Points(
  wishG,
  new T.PointsMaterial({
    color: "#ffe3aa",
    size: 0.045,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  }),
);
scene.add(wish);
const palm = new T.Vector3(1, 3, -1);
let gathered = 0;
let expansionTarget = 1, handExpansion = 1;
const palmTarget = palm.clone();
let lastInference = 0;
const cinematic = new Cinematic(scene, camera, cream);
const goldUniform = { value: 0 };
panorama.material.onBeforeCompile = (shader) => {
  shader.uniforms.uGold = goldUniform;
  shader.fragmentShader = "uniform float uGold;\n" + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <map_fragment>",
    `#include <map_fragment>
float snow = smoothstep(.025,.16,dot(diffuseColor.rgb,vec3(.299,.587,.114))); float summit = smoothstep(.27,.58,vMapUv.y)*(1.-smoothstep(.68,.85,vMapUv.y)); diffuseColor.rgb += vec3(.52,.24,.065)*snow*summit*uGold; diffuseColor.rgb *= 1.+uGold*.16;`,
  );
};
panorama.material.needsUpdate = true;
const meteors = [];
function meteor() {
  if(activeScene!=='alpine')return;
  const start = new T.Vector3(-110 + rnd() * 240, 90 + rnd() * 100, -330);
  const g = new T.BufferGeometry().setFromPoints([
    start,
    start.clone().add(new T.Vector3(12, 8, 0)),
  ]);
  const m = new T.Line(
    g,
    new T.LineBasicMaterial({
      color: "#d1ded8",
      transparent: true,
      opacity: 0,
    }),
  );
  scene.add(m);
  meteors.push({ mesh: m, born: time });
}
function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
addEventListener("resize", resize);
function setCopy(chapter, title, sub, button, fn) {
  $("#chapter").textContent = chapter;
  $("#title").textContent = title;
  $("#subtitle").textContent = sub;
  const b = $("#action");
  b.hidden = !button;
  b.textContent = button || "";
  b.onclick = fn || null;
}
function stage(next) {
  state = next;
  stateAt = time;
}
let audioCtx,
  audioGain,
  soundOn = false;
function audio() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    audioGain = audioCtx.createGain();
    audioGain.gain.value = 0;
    audioGain.connect(audioCtx.destination);
    const buffer = audioCtx.createBuffer(
        1,
        audioCtx.sampleRate * 4,
        audioCtx.sampleRate,
      ),
      data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      last = (last + (Math.random() * 2 - 1) * 0.015) / 1.015;
      data[i] = last * 0.5;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    source.connect(filter);
    filter.connect(audioGain);
    source.start();
  }
  audioCtx.resume();
  soundOn = !soundOn;
  cinematic.sound.enable(soundOn);
  audioGain.gain.setTargetAtTime(soundOn ? 0.4 : 0, audioCtx.currentTime, 1);
  $("#sound").textContent = "声音 · " + (soundOn ? "开" : "关");
}
$("#sound").onclick = audio;
function light() {
  if (state !== "arrival") return;
  if (!audioCtx) audio();
  stage("lighting");
  setCopy("02 — A LITTLE LIGHT", "为自己，点一束光。", "");
  setTimeout(() => {
    stage("pause");
    setCopy(
      "02 — A LITTLE LIGHT",
      "在许愿之前……",
      "先想一件，这一年你真正想为自己实现的事。",
    );
    setTimeout(() => {
      if (state !== "pause") return;
      stage("ready");
      setCopy(
        "03 — MAKE A WISH",
        "把愿望，轻轻接住。",
        "张开手掌，让一点光落在手心。",
        "用手势许愿",
        startHands,
      );
      $("#alternate").hidden = false;
      $("#alternate").onclick = () => fallback(false);
    }, 6500);
  }, 6500);
}
$("#action").onclick = light;
let stream,
  landmarker,
  handActive = false,
  openSince = null,
  closedSince = null,
  hasOpened = false,
  lastVideo = -1;
let handSession=0,lastHandSeen=0,lastFrameSeen=0,trackingErrors=0;
function offerHandRetry(message){
  if(state!=='hands')return;
  $('#gesture-text').textContent=message;
  $('#action').hidden=false;$('#action').disabled=false;
  $('#action').textContent='重新连接手势';$('#action').onclick=startHands;
}
function stopHands() {
  handSession++;
  handActive = false;
  stream?.getTracks().forEach((t) => t.stop());
  $("#video").srcObject = null;
  landmarker?.close();
  landmarker = null;
  $("#gesture").hidden = true;
}
function fallback(unavailable = true) {
  stopHands();
  $("#action").disabled = false;
  stage("fallback");
  $("#alternate").hidden = true;
  setCopy(
    "03 — MAKE A WISH",
    "把心愿，留在这一刻。",
    unavailable
      ? "摄像头不可用，也没关系。点击蜡烛，吹灭它，完成你的愿望。"
      : "默念你的心愿。准备好了，点击蜡烛，轻轻吹灭它。",
    "吹灭蜡烛",
    complete,
  );
}
async function startHands() {
  stopHands();
  const session=handSession;
  lastVideo=-1;lastInference=0;openSince=closedSince=null;trackingErrors=0;
  stage("loading");
  const loadingTimeout = setTimeout(() => {
    if (session===handSession && state === "loading") fallback();
  }, 25000);
  $("#action").disabled = true;
  $("#subtitle").textContent =
    "允许摄像头后，慢慢张开手掌。画面只在你的设备上识别。";
  try {
    const { FilesetResolver, HandLandmarker } =
      await import("@mediapipe/tasks-vision");
    // The WebAssembly runtime is loaded from MediaPipe's CDN so the GitHub
    // web uploader stays small enough for a drag-and-drop publish.
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
    );
    const options = {
      baseOptions: {
        modelAssetPath: assetUrl("mediapipe/hand_landmarker.task"),
        delegate: "CPU",
      },
      runningMode: "VIDEO",
      numHands: 1,
      minHandDetectionConfidence:.4,
      minHandPresenceConfidence:.4,
      minTrackingConfidence:.4,
    };
    const detector = await HandLandmarker.createFromOptions(vision, options);
    if (session!==handSession || state !== "loading") {detector.close();return;}
    landmarker=detector;
    const nextStream = await navigator.mediaDevices.getUserMedia({
      video: { width: {ideal:640}, height: {ideal:480}, facingMode: "user",frameRate:{ideal:24,max:30} },
      audio: false,
    });
    if(session!==handSession || state!=='loading'){nextStream.getTracks().forEach(t=>t.stop());return;}
    stream=nextStream;
    const video = $("#video");
    video.srcObject = stream;
    await video.play();
    if(session!==handSession)return;
    lastFrameSeen=lastHandSeen=performance.now();
    stream.getVideoTracks()[0]?.addEventListener('ended',()=>{if(session===handSession)offerHandRetry('摄像头已中断，可以重新连接。');});
    handActive = true;
    stage("hands");
    $("#gesture").hidden = false;
    setCopy("03 — MAKE A WISH", "张开手掌。", "不着急，让愿望慢慢靠近。");
  } catch (e) {
    console.warn("Hand tracking unavailable:", e.message);
    if (session===handSession && state === "loading") fallback();
  } finally {
    clearTimeout(loadingTimeout);
    if(session===handSession)$("#action").disabled = false;
  }
}
function track() {
  if (!handActive || !landmarker) return;
  const video = $("#video");
  const now = performance.now();
  if (video.readyState < 2 || video.currentTime === lastVideo) {
    if(now-lastFrameSeen>2500)offerHandRetry('摄像头画面暂停了，请重新连接。');
    return;
  }
  if(now-lastInference<45)return;
  lastInference=now;
  lastVideo = video.currentTime;
  lastFrameSeen=now;
  try {
    const result = landmarker.detectForVideo(video, performance.now());
    const h = result.landmarks?.[0];
    trackingErrors=0;
    if (!h) {
      openSince = closedSince = null;
      if(now-lastHandSeen>2500)offerHandRetry('暂时没看到手掌，可以重新连接。');
      else $("#gesture-text").textContent = "正在寻找手掌…";
      return;
    }
    lastHandSeen=now;$('#action').hidden=true;
    const gesture = classifyHand(h);
    const openness=handOpenness(h);
    if(openness!==null)expansionTarget=openness;
    const open = gesture === "open",
      closed = gesture === "closed" && openness !== null && openness < .1;
    const palmRay = new T.Vector3(
      (0.5 - h[9].x) * 1.4,
      (0.5 - h[9].y) * 1.4,
      0.5,
    )
      .unproject(camera)
      .sub(camera.position)
      .normalize();
    palmTarget.copy(camera.position).addScaledVector(palmRay, 6);
    $('#gesture-text').textContent=hasOpened?'已识别 · 张开或慢慢收拢':'已看到手掌 · 请张开手指';
    if (open) {
      closedSince = null;
      openSince ??= time;
      if (time - openSince > 0.3) {
        hasOpened = true;
        $("#title").textContent = "准备好了，就握住它。";
        $("#subtitle").textContent = "张开，星光展开；慢慢收拢，让它回到手心。";
        $("#gesture-text").textContent = "张开 · 收拢 · 握拳许愿";
      }
    } else if (closed && hasOpened && gathered > 0.5) {
      closedSince ??= time;
      if (time - closedSince > 0.35) complete();
    } else {
      openSince = closedSince = null;
    }
  } catch (e) {
    console.warn('Hand inference interrupted:',e.message);
    openSince=closedSince=null;
    if(++trackingErrors>=3)offerHandRetry('识别暂时中断，请重新连接。');
  }
}
function complete() {
  if (!["hands", "fallback"].includes(state)) return;
  if (state === "fallback") palm.set(1, 3.1, 0.3);
  cinematic.capture(time, palm);
  stage("extinguish");
  stopHands();
  $("#alternate").hidden = true;
  setCopy("03 — YOUR WISH", "你握住了它。", "让这束光，照亮新的一岁。");
  if (audioGain) audioGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.4);
  setTimeout(() => {
    stage("celebrate");
  }, 3200);
  setTimeout(() => {
    setCopy(
      "04 — CELEBRATE",
      "这个愿望，现在属于你了。",
      "Your wish is yours now.",
    );
  }, 3600);
  setTimeout(() => {
    setCopy(
      "04 — CELEBRATE",
      "Happy Birthday to me.",
      "愿新的一岁，有想去的远方，也有安心的此刻。",
      "再待一会儿",
      () => {
        setCopy(
          "04 — STAY A LITTLE",
          "今夜，不必赶路。",
          "你可以在这里，多坐一会儿。",
        );
      },
    );
    document.body.classList.add("finale");
    if (soundOn && audioGain)
      audioGain.gain.setTargetAtTime(0.4, audioCtx.currentTime, 3);
  }, 10000);
}
const ray = new T.Raycaster();
canvas.addEventListener("click", (e) => {
  ray.setFromCamera(
    new T.Vector2(
      (e.clientX / innerWidth) * 2 - 1,
      1 - (e.clientY / innerHeight) * 2,
    ),
    camera,
  );
  const target = new T.Sphere(new T.Vector3(1, 2.6, 0.3), 0.7);
  if (ray.ray.intersectsSphere(target)) {
    if (state === "arrival") light();
    if (state === "fallback") complete();
  }
});
let lastMeteor = -30,
  frame = 0;
// Furniture and the shadow-casting light are stationary; reuse their shadow map.
renderer.shadowMap.autoUpdate=false;
renderer.shadowMap.needsUpdate=true;
renderer.setAnimationLoop(() => {
  clock.update();
  const dt = Math.min(clock.getDelta(), 0.05);
  time += dt;
  const age = time - stateAt;
  const intro = T.MathUtils.smoothstep(time, 0, 10);
  const widePosition = new T.Vector3(
    T.MathUtils.lerp(8, innerWidth < 600 ? 4.6 : 6.3, intro),
    T.MathUtils.lerp(4.2, 3.65, intro),
    T.MathUtils.lerp(13, 9.5, intro),
  );
  const closeTarget = ["lighting", "pause"].includes(state) ? 1 : 0;
  camera.userData.close = T.MathUtils.damp(
    camera.userData.close || 0,
    closeTarget,
    state === "lighting" ? 1.15 : 0.5,
    dt,
  );
  camera.position
    .copy(widePosition)
    .lerp(new T.Vector3(1.9, 3.25, 3.3), camera.userData.close);
  const look = new T.Vector3(
    innerWidth < 600 ? 0.6 : -0.8,
    2.9,
    innerWidth < 600 ? 0.3 : -8,
  ).lerp(new T.Vector3(1, 2.8, 0.3), camera.userData.close);
  camera.lookAt(look);
  camera.fov = T.MathUtils.lerp(53, 43, camera.userData.close);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  const wantsLit = ["pause", "ready", "loading", "hands", "fallback"].includes(
    state,
  );
  lit = T.MathUtils.damp(
    lit,
    wantsLit || (state === "lighting" && age > 4.15) ? 1 : 0,
    state === "extinguish" ? 1.1 : 2,
    dt,
  );
  flame.material.opacity = lit;
  flame.scale.x =
    0.65 + Math.sin(time * (state === "extinguish" ? 28 : 8)) * 0.12;
  flame.scale.y = 1.7 + Math.sin(time * 11) * 0.12;
  flame.rotation.z =
    Math.sin(time * 15) * (state === "extinguish" ? 0.35 : 0.055);
  candleLight.intensity = lit * (3.7 + Math.sin(time * 10) * 0.3);
  celebration = T.MathUtils.damp(
    celebration,
    state === "celebrate" ? 1 : 0,
    0.25,
    dt,
  );
  const quiet = state === "extinguish" || (state === "celebrate" && age < 7);
  key.intensity = T.MathUtils.damp(
    key.intensity,
    95 + lit * 10 - (quiet ? 24 : 0),
    0.8,
    dt,
  );
  if(handActive)track();
  if(state==='hands'){
    gathered=T.MathUtils.damp(gathered,hasOpened?1:0,5,dt);
    palm.lerp(palmTarget,1-Math.exp(-9*dt));
  }
  handExpansion = T.MathUtils.damp(handExpansion, expansionTarget, 9, dt);
  const cinematicState = cinematic.update({
    time,
    dt,
    state,
    age,
    gathered,
    handExpansion,
    palm,
  });
  goldUniform.value = activeScene==='alpine'?cinematicState.gold:cinematicState.gold*.15;
  auroraMat.uniforms.uTime.value = time + cinematicState.gold * 35;
  auroraMat.uniforms.uGlow.value =
    1 + celebration * 1.8 + cinematicState.surge * 0.7;
  cool.color
    .set(sceneOptions[activeScene].sun)
    .lerp(new T.Color("#ffd39b"), cinematicState.gold * 0.45);
  lake.material.uniforms.uTime.value = time;
  warmFill.intensity = 13 + celebration * 4;
  for (let i = 0; i < 150; i++)
    dustG.attributes.position.array[i * 3 + 1] =
      dustBase[i * 3 + 1] + Math.sin(time * 0.13 + i) * 0.1;
  dustG.attributes.position.needsUpdate = true;
  if (false && gathered > 0) {
    const collapse = state === "extinguish" ? Math.min(age / 1.2, 1) : 0;
    wish.material.opacity =
      state === "celebrate"
        ? 0
        : state === "extinguish"
          ? Math.max(0, 1 - age / 3)
          : 0.65;
    for (let i = 0; i < 90; i++) {
      let a = i * 2.4 + time * 0.15,
        r = (1 - collapse) * (0.18 + (i % 13) * 0.03);
      let target = new T.Vector3(
        palm.x + Math.cos(a) * r,
        palm.y + Math.sin(a) * r,
        palm.z + Math.sin(i) * r,
      );
      for (let j = 0; j < 3; j++)
        wishG.attributes.position.array[i * 3 + j] = T.MathUtils.lerp(
          wishBase[i * 3 + j],
          target.getComponent(j),
          T.MathUtils.lerp(gathered, 1, collapse),
        );
    }
    wishG.attributes.position.needsUpdate = true;
  }
  if (
    state === "celebrate" &&
    age > 3 &&
    time - lastMeteor > (age < 12 ? 2.6 : 12)
  ) {
    meteor();
    lastMeteor = time;
  } else if (time - lastMeteor > 45 && state !== "extinguish") {
    meteor();
    lastMeteor = time;
  }
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i],
      a = time - m.born;
    m.mesh.position.set(a * 22, -a * 13, 0);
    m.mesh.material.opacity = Math.sin(Math.min(a / 2.7, 1) * Math.PI) * 0.65;
    if (a > 2.7) {
      scene.remove(m.mesh);
      m.mesh.geometry.dispose();
      m.mesh.material.dispose();
      meteors.splice(i, 1);
    }
  }
  renderer.render(scene, camera);
});
addEventListener("pagehide", () => {
  stopHands();
  audioCtx?.close();
});

// Optional browser-native agent access uses the same deliberate candle actions.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  for (const tool of [
    {
      name: "read_birthday_ritual",
      description: "Read the current birthday ritual stage.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: () => ({ stage: state, title: $("#title").textContent }),
    },
    {
      name: "birthday_candle_action",
      description:
        "Light the candle, choose the candle wish route, or blow out the candle. Each action respects the current ritual stage and pauses.",
      inputSchema: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["light", "choose_candle", "blow_out"],
          },
        },
        required: ["action"],
        additionalProperties: false,
      },
      execute: ({ action }) => {
        if (action === "light" && state === "arrival") light();
        else if (action === "choose_candle" && state === "ready")
          fallback(false);
        else if (action === "blow_out" && state === "fallback") complete();
        else throw new Error("Action is not available in this stage.");
        return { stage: state };
      },
    },
  ]) {
    try {
      Promise.resolve(
        document.modelContext.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {}
  }
  addEventListener("pagehide", () => lifecycle.abort());
}
