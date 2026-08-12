
(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const score = document.getElementById("score");
  const analysisStrip = document.getElementById("analysisStrip");
  const results = document.getElementById("results");
  const issuesEl = document.getElementById("issues");
  const gradeLabel = document.getElementById("gradeLabel");
  const gradeSummary = document.getElementById("gradeSummary");
  const cadenceResult = document.getElementById("cadenceResult");
  const scoreNumber = document.getElementById("scoreNumber");
  const taskNo = document.getElementById("taskNo");
  const keyPill = document.getElementById("keyPill");
  const keySel = document.getElementById("keySel");

  const voices = ["S","A","T","B"];
  const editable = ["S","A","T"];
  const LETTERS = ["C","D","E","F","G","A","B"];
  const NAT_PCS = [0,2,4,5,7,9,11];
  const SHARP_ORDER = [3,0,4,1,5,2,6]; // F C G D A E B
  const FLAT_ORDER  = [6,2,5,1,4,0,3]; // B E A D G C F

  const KEYS = {
    C:  {label:"C dur",  tonicPc:0,  tonicLetter:0, sig:0,  mode:"major"},
    G:  {label:"G dur",  tonicPc:7,  tonicLetter:4, sig:1,  mode:"major"},
    D:  {label:"D dur",  tonicPc:2,  tonicLetter:1, sig:2,  mode:"major"},
    A:  {label:"A dur",  tonicPc:9,  tonicLetter:5, sig:3,  mode:"major"},
    E:  {label:"E dur",  tonicPc:4,  tonicLetter:2, sig:4,  mode:"major"},
    B:  {label:"B dur",  tonicPc:11, tonicLetter:6, sig:5,  mode:"major"},
    Fs: {label:"F♯ dur", tonicPc:6,  tonicLetter:3, sig:6,  mode:"major"},
    Cs: {label:"C♯ dur", tonicPc:1,  tonicLetter:0, sig:7,  mode:"major"},
    F:  {label:"F dur",  tonicPc:5,  tonicLetter:3, sig:-1, mode:"major"},
    Bb: {label:"B♭ dur", tonicPc:10, tonicLetter:6, sig:-2, mode:"major"},
    Eb: {label:"E♭ dur", tonicPc:3,  tonicLetter:2, sig:-3, mode:"major"},
    Ab: {label:"A♭ dur", tonicPc:8,  tonicLetter:5, sig:-4, mode:"major"},
    Db: {label:"D♭ dur", tonicPc:1,  tonicLetter:1, sig:-5, mode:"major"},
    Gb: {label:"G♭ dur", tonicPc:6,  tonicLetter:4, sig:-6, mode:"major"},
    Cb: {label:"C♭ dur", tonicPc:11, tonicLetter:0, sig:-7, mode:"major"},

    Am: {label:"A moll",  tonicPc:9,  tonicLetter:5, sig:0,  mode:"minor"},
    Em: {label:"E moll",  tonicPc:4,  tonicLetter:2, sig:1,  mode:"minor"},
    Bm: {label:"B moll",  tonicPc:11, tonicLetter:6, sig:2,  mode:"minor"},
    Fsm:{label:"F♯ moll", tonicPc:6,  tonicLetter:3, sig:3,  mode:"minor"},
    Csm:{label:"C♯ moll", tonicPc:1,  tonicLetter:0, sig:4,  mode:"minor"},
    Gsm:{label:"G♯ moll", tonicPc:8,  tonicLetter:4, sig:5,  mode:"minor"},
    Dsm:{label:"D♯ moll", tonicPc:3,  tonicLetter:1, sig:6,  mode:"minor"},
    Asm:{label:"A♯ moll", tonicPc:10, tonicLetter:5, sig:7,  mode:"minor"},
    Dm: {label:"D moll",  tonicPc:2,  tonicLetter:1, sig:-1, mode:"minor"},
    Gm: {label:"G moll",  tonicPc:7,  tonicLetter:4, sig:-2, mode:"minor"},
    Cm: {label:"C moll",  tonicPc:0,  tonicLetter:0, sig:-3, mode:"minor"},
    Fm: {label:"F moll",  tonicPc:5,  tonicLetter:3, sig:-4, mode:"minor"},
    Bbm:{label:"B♭ moll", tonicPc:10, tonicLetter:6, sig:-5, mode:"minor"},
    Ebm:{label:"E♭ moll", tonicPc:3,  tonicLetter:2, sig:-6, mode:"minor"},
    Abm:{label:"A♭ moll", tonicPc:8,  tonicLetter:5, sig:-7, mode:"minor"}
  };

  const tasksC = [
    [48,41,43,48,45,50,43,48],
    [48,45,50,43,48,41,43,48],
    [48,43,45,50,43,48,43,48],
    [48,41,50,43,45,50,43,48],
    [48,45,41,43,48,50,43,48],
    [48,50,43,48,45,41,43,48]
  ];
  // 各バス課題専用の規則適合例。
  // 終止の完全V7→Iでは、完全V7から第5音省略の主和音（根音3＋第3音）へ解決する。
  const examplesC = [
    {S:[72,72,71,72,72,74,74,72], A:[64,65,62,64,64,65,65,64], T:[55,57,55,55,57,57,59,60]},
    {S:[67,69,69,71,72,72,71,72], A:[60,60,62,62,64,65,65,64], T:[52,52,53,55,55,57,62,60]},
    {S:[72,71,69,69,71,72,71,72], A:[64,62,60,62,62,64,62,60], T:[55,55,52,53,55,55,53,52]},
    {S:[76,77,77,79,76,77,77,76], A:[67,69,69,71,69,69,71,72], T:[60,60,62,62,60,62,62,60]},
    {S:[79,81,81,79,79,77,77,76], A:[72,72,72,71,72,69,71,72], T:[64,64,65,62,64,62,62,60]},
    {S:[72,69,71,72,72,72,71,72], A:[64,62,62,64,64,65,65,64], T:[55,53,55,55,57,57,62,60]}
  ];

  let currentKeyId = "C";
  let currentKey = KEYS[currentKeyId];
  let taskIndex = 0;
  let activeVoice = "S";
  let selected = {voice:"S", slot:0};
  let notes = {S:Array(8).fill(null),A:Array(8).fill(null),T:Array(8).fill(null),B:[]};
  let history = [], future = [];
  let errorKeys = new Set();
  let audioCtx = null, liveNodes = [];
  let settings = {tempoBpm:90, analysis:true, functionMode:"on"};

  const ranges = {S:[60,82], A:[54,77], T:[47,70], B:[35,61]};
  const trebleTopY = 104, bassTopY = 306, lineGap = 12;
  const staffLeft = 72, staffRight = 1550;
  const measureStart = 322, measureWidth = 150;
  const xs = Array.from({length:8},(_,i)=>measureStart + i*measureWidth + 48);

  function mod(n,m){ return ((n%m)+m)%m; }
  function svgEl(tag, attrs={}) {
    const el = document.createElementNS(SVG_NS,tag);
    for (const [k,v] of Object.entries(attrs)) el.setAttribute(k,v);
    return el;
  }
  function degreeOfD(d){ return mod(d,7); }
  function octaveOfD(d){ return Math.floor(d/7); }
  function naturalMidiFromD(d){ return (octaveOfD(d)+1)*12 + NAT_PCS[degreeOfD(d)]; }
  function midiOf(p){ return p ? naturalMidiFromD(p.d) + p.acc : null; }
  function diatonicIndexNatural(midi){
    const octave=Math.floor(midi/12)-1, pc=mod(midi,12);
    const map={0:0,2:1,4:2,5:3,7:4,9:5,11:6};
    return pc in map ? octave*7+map[pc] : null;
  }
  function keyAccForLetter(letterIndex){
    if(currentKey.sig>0) return SHARP_ORDER.slice(0,currentKey.sig).includes(letterIndex) ? 1 : 0;
    if(currentKey.sig<0) return FLAT_ORDER.slice(0,-currentKey.sig).includes(letterIndex) ? -1 : 0;
    return 0;
  }
  function keyAccForD(d){ return keyAccForLetter(degreeOfD(d)); }
  function pitchFromSourceC(midi){
    const sourceD=diatonicIndexNatural(midi);
    const d=sourceD+currentKey.tonicLetter;
    let acc=keyAccForD(d);
    // C-durの模範解答でBに相当する音は、短調では第7音の導音として半音上げる。
    if(currentKey.mode==="minor" && degreeOfD(sourceD)===6) acc+=1;
    return {d,acc};
  }
  function mapSequenceToVoice(source,voice){
    const raw=source.map(pitchFromSourceC);
    const [lo,hi]=ranges[voice], center=(lo+hi)/2;
    const shifts=[-14,-7,0,7,14];
    let best=0,bestScore=Infinity;
    for(const sh of shifts){
      const mids=raw.map(p=>midiOf({d:p.d+sh,acc:p.acc}));
      const outside=mids.reduce((s,m)=>s+(m<lo?lo-m:m>hi?m-hi:0),0);
      const avg=mids.reduce((a,b)=>a+b,0)/mids.length;
      const score=outside*100+Math.abs(avg-center);
      if(score<bestScore){bestScore=score;best=sh;}
    }
    return raw.map(p=>({d:p.d+best,acc:p.acc}));
  }
  function buildBassTask(){ return mapSequenceToVoice(tasksC[taskIndex],"B"); }
  function buildExampleVoice(v){ return mapSequenceToVoice(examplesC[taskIndex][v],v); }
  function resetTask(clearHistory=true){
    notes={S:Array(8).fill(null),A:Array(8).fill(null),T:Array(8).fill(null),B:buildBassTask()};
    selected={voice:activeVoice,slot:0}; errorKeys.clear(); results.classList.remove("show");
    if(clearHistory){history=[];future=[];}
    taskNo.textContent=`課題 ${taskIndex+1} / ${tasksC.length}`;
    keyPill.textContent=currentKey.label;
    render();
  }
  function accidentalGlyph(acc){ return acc===1?"♯":acc===-1?"♭":"♮"; }
  function pitchName(p){
    if(!p) return "";
    const a=p.acc===1?"♯":p.acc===-1?"♭":"";
    return `${LETTERS[degreeOfD(p.d)]}${a}${octaveOfD(p.d)}`;
  }
  function pitchClassSet(arr){ return [...new Set(arr.map(p=>mod(midiOf(p),12)))].sort((a,b)=>a-b); }
  function sameSet(a,b){ return a.length===b.length && a.every((v,i)=>v===b[i]); }
  function shiftedSet(rel){ return rel.map(x=>mod(x+currentKey.tonicPc,12)).sort((a,b)=>a-b); }
  function scaleDegreeName(deg,extraAcc=0){
    const d=currentKey.tonicLetter+deg;
    const li=degreeOfD(d), acc=keyAccForLetter(li)+extraAcc;
    const glyph=acc===2?"𝄪":acc===1?"♯":acc===-1?"♭":acc===-2?"𝄫":"";
    return LETTERS[li]+glyph;
  }

  function snapshot(){
    history.push(JSON.stringify(notes)); if(history.length>80) history.shift(); future=[]; updateUndoRedo();
  }
  function restore(json){ notes=JSON.parse(json); errorKeys.clear(); render(); }
  function updateUndoRedo(){
    document.getElementById("undoBtn").disabled=history.length===0;
    document.getElementById("redoBtn").disabled=future.length===0;
  }
  function drawText(txt,x,y,attrs={}){ const t=svgEl("text",{x,y,...attrs});t.textContent=txt;score.appendChild(t);return t; }
  function yForD(d,clef){
    const refD = clef==="treble" ? diatonicIndexNatural(64) : diatonicIndexNatural(43);
    const bottomY = clef==="treble" ? trebleTopY+4*lineGap : bassTopY+4*lineGap;
    return bottomY-(d-refD)*(lineGap/2);
  }
  function pitchForY(y,voice){
    const clef=(voice==="S"||voice==="A")?"treble":"bass";
    const bottomY=clef==="treble"?trebleTopY+4*lineGap:bassTopY+4*lineGap;
    const refD=clef==="treble"?diatonicIndexNatural(64):diatonicIndexNatural(43);
    let d=Math.round(refD+(bottomY-y)/(lineGap/2));
    let p={d,acc:keyAccForD(d)}; const [lo,hi]=ranges[voice];
    while(midiOf(p)<lo){d+=7;p={d,acc:keyAccForD(d)}}
    while(midiOf(p)>hi){d-=7;p={d,acc:keyAccForD(d)}}
    return p;
  }

  function drawKeySignature(topY,clef){
    const count=Math.abs(currentKey.sig); if(!count) return;
    const isSharp=currentKey.sig>0;
    const trebleSharp=[38,35,39,36,33,37,34], trebleFlat=[34,37,33,36,32,35,31];
    const bassSharp=[24,21,25,22,19,23,20], bassFlat=[20,23,19,22,18,21,17];
    const ds=clef==="treble"?(isSharp?trebleSharp:trebleFlat):(isSharp?bassSharp:bassFlat);
    for(let i=0;i<count;i++){
      const x=142+i*17, y=yForD(ds[i],clef)+8;
      drawText(isSharp?"♯":"♭",x,y,{"font-size":"25","font-family":"'Noto Music','Segoe UI Symbol',serif","text-anchor":"middle",fill:"#24211e"});
    }
  }
  function drawStaff(topY,clef){
    for(let i=0;i<5;i++) score.appendChild(svgEl("line",{x1:staffLeft,y1:topY+i*lineGap,x2:staffRight,y2:topY+i*lineGap,stroke:"#35322f","stroke-width":"1.15"}));
    const clefY=clef==="treble"?topY+61:topY+52;
    drawText(clef==="treble"?"𝄞":"𝄢",100,clefY,{"font-size":clef==="treble"?92:76,"font-family":"'Noto Music','Segoe UI Symbol',serif",fill:"#24211e"});
    drawKeySignature(topY,clef);
    const tx=286;
    drawText("4",tx,topY+20,{"font-size":"24","font-family":"Georgia,serif","font-weight":"700","text-anchor":"middle",fill:"#24211e"});
    drawText("4",tx,topY+43,{"font-size":"24","font-family":"Georgia,serif","font-weight":"700","text-anchor":"middle",fill:"#24211e"});
  }
  function drawBrace(){
    const y1=trebleTopY,y2=bassTopY+4*lineGap,mid=(y1+y2)/2;
    const d=[`M 63 ${y1}`,`C 48 ${y1+8}, 51 ${mid-28}, 41 ${mid-9}`,`C 37 ${mid-2}, 37 ${mid+2}, 41 ${mid+9}`,`C 51 ${mid+28}, 48 ${y2-8}, 63 ${y2}`].join(' ');
    score.appendChild(svgEl("path",{d,fill:"none",stroke:"#2c2926","stroke-width":"2.3","stroke-linecap":"round"}));
    score.appendChild(svgEl("line",{x1:staffLeft,y1:y1,x2:staffLeft,y2:y2,stroke:"#2c2926","stroke-width":"1.7"}));
  }
  function drawBarlines(){
    const top=trebleTopY,bottom=bassTopY+4*lineGap;
    for(let i=1;i<=8;i++){
      const x=measureStart+i*measureWidth;
      if(i===8){
        score.appendChild(svgEl("line",{x1:x-5,y1:top,x2:x-5,y2:bottom,stroke:"#2e2b28","stroke-width":"1"}));
        score.appendChild(svgEl("line",{x1:x,y1:top,x2:x,y2:bottom,stroke:"#2e2b28","stroke-width":"3"}));
      }else score.appendChild(svgEl("line",{x1:x,y1:top,x2:x,y2:bottom,stroke:"#4a4641","stroke-width":"1.05"}));
    }
  }
  function addLedgerLines(x,d,clef){
    const y=yForD(d,clef),top=clef==="treble"?trebleTopY:bassTopY,bottom=top+4*lineGap,ys=[];
    if(y<top-1){for(let yy=top-lineGap;yy>=y-1;yy-=lineGap)ys.push(yy)}
    else if(y>bottom+1){for(let yy=bottom+lineGap;yy<=y+1;yy+=lineGap)ys.push(yy)}
    ys.forEach(yy=>score.appendChild(svgEl("line",{x1:x-16,y1:yy,x2:x+16,y2:yy,stroke:"#35322f","stroke-width":"1.15"})));
  }
  function noteXFor(v,i){
    const base=xs[i],other=v==="S"?"A":v==="A"?"S":v==="T"?"B":"T",a=notes[v][i],b=notes[other][i];
    if(!a||!b) return base;
    if(Math.abs(a.d-b.d)<=1) return base+((v==="A"||v==="B")?8:-8);
    return base;
  }
  function drawWholeNote(v,i,p){
    const clef=(v==="S"||v==="A")?"treble":"bass",y=yForD(p.d,clef),x=noteXFor(v,i),key=`${v}-${i}`;
    let stroke=v==="B"?"#65615c":"#24211e";
    if(errorKeys.has(key))stroke="#b64a46";
    if(selected.voice===v&&selected.slot===i&&v!=="B")stroke="#4f6b61";
    addLedgerLines(x,p.d,clef);
    if(selected.voice===v&&selected.slot===i&&v!=="B")score.appendChild(svgEl("ellipse",{cx:x,cy:y,rx:15,ry:11,fill:"#4f6b61","fill-opacity":"0.10"}));
    const defaultAcc=keyAccForD(p.d);
    if(p.acc!==defaultAcc){
      drawText(accidentalGlyph(p.acc),x-24,y+8,{"font-size":"22","font-family":"'Noto Music','Segoe UI Symbol',serif","text-anchor":"middle",fill:stroke});
    }
    const g=svgEl("g",{"data-v":v,"data-slot":i,style:v==="B"?"cursor:default":"cursor:pointer"});
    g.appendChild(svgEl("ellipse",{cx:x,cy:y,rx:8.6,ry:5.1,fill:stroke,stroke:"none",transform:`rotate(-8 ${x} ${y})`}));
    // 全音符の内側は、対位法ツールに合わせて左肩上がりの白い楕円。
    g.appendChild(svgEl("ellipse",{cx:x-0.2,cy:y-0.2,rx:4.8,ry:2.0,fill:"#fffdf9",stroke:"none",transform:`rotate(28 ${x-0.2} ${y-0.2})`}));
    g.appendChild(svgEl("rect",{x:x-28,y:y-17,width:52,height:34,fill:"transparent"}));
    score.appendChild(g);
  }
  function render(){
    score.innerHTML="";
    score.appendChild(svgEl("rect",{x:0,y:0,width:1600,height:470,fill:"#fffdf9"}));
    drawText("Bass課題",staffLeft,35,{"font-size":"14","font-weight":"650",fill:"#3d3935"});
    drawText(currentKey.label,staffRight,35,{"font-size":"13","text-anchor":"end",fill:"#746e66"});
    if(selected&&editable.includes(selected.voice)){
      const sx=measureStart+selected.slot*measureWidth;
      score.appendChild(svgEl("rect",{x:sx+1,y:67,width:measureWidth-2,height:338,rx:5,fill:"#4f6b61","fill-opacity":"0.035"}));
    }
    drawStaff(trebleTopY,"treble");drawStaff(bassTopY,"bass");drawBrace();drawBarlines();
    for(let i=0;i<8;i++){
      const left=measureStart+i*measureWidth;
      drawText(String(i+1),left+12,76,{"font-size":"10.5",fill:"#8b837a"});
      score.appendChild(svgEl("rect",{x:left+1,y:trebleTopY-52,width:measureWidth-2,height:138,fill:"transparent","data-slot":i,"data-area":"treble"}));
      score.appendChild(svgEl("rect",{x:left+1,y:bassTopY-52,width:measureWidth-2,height:138,fill:"transparent","data-slot":i,"data-area":"bass"}));
    }
    for(const v of voices)for(let i=0;i<8;i++)if(notes[v][i])drawWholeNote(v,i,notes[v][i]);
    drawText("S / A",staffLeft+7,trebleTopY-13,{"font-size":"9.5",fill:"#918980"});
    drawText("T / B",staffLeft+7,bassTopY-13,{"font-size":"9.5",fill:"#918980"});
    renderAnalysis();
    document.querySelectorAll(".voice-btn").forEach(b=>b.classList.toggle("active",b.dataset.v===activeVoice));
    updateUndoRedo();
  }

  function analyzeChord(i){
    const ps=voices.map(v=>notes[v][i]);
    if(ps.some(x=>!x))return{roman:"—",baseRoman:"—",inversion:null,notes:ps.filter(Boolean).map(pitchName).join(" ")};
    const pcs=pitchClassSet(ps), bassPc=mod(midiOf(notes.B[i]),12);
    let triads;
    if(currentKey.mode==="minor"){
      triads=[
        ["i",[0,3,7],[0,3,7]],
        ["ii°",[2,5,8],[2,5,8]],
        ["III",[3,7,10],[3,7,10]],
        ["iv",[0,5,8],[5,8,0]],
        ["V",[2,7,11],[7,11,2]],
        ["VI",[0,3,8],[8,0,3]],
        ["vii°",[2,5,11],[11,2,5]]
      ];
    }else{
      triads=[
        ["I",[0,4,7],[0,4,7]],
        ["ii",[2,5,9],[2,5,9]],
        ["iii",[4,7,11],[4,7,11]],
        ["IV",[0,5,9],[5,9,0]],
        ["V",[2,7,11],[7,11,2]],
        ["vi",[0,4,9],[9,0,4]],
        ["vii°",[2,5,11],[11,2,5]]
      ];
    }

    const tonicRoman=currentKey.mode==="minor"?"i":"I";
    const tonicRootPc=mod(currentKey.tonicPc,12);
    const tonicThirdPc=mod(currentKey.tonicPc+(currentKey.mode==="minor"?3:4),12);
    const countPc=pc=>ps.filter(p=>mod(midiOf(p),12)===pc).length;

    // 完全V7からの標準的解決で生じる「第5音省略の主和音」：
    // 根音3声＋第3音1声、低音は根音。これを主和音として認識する。
    if(sameSet(pcs,[tonicRootPc,tonicThirdPc].sort((a,b)=>a-b))
       && bassPc===tonicRootPc && countPc(tonicRootPc)===3 && countPc(tonicThirdPc)===1){
      return{roman:`${tonicRoman}(5省略)`,baseRoman:tonicRoman,inversion:"root",omittedFifth:true,notes:ps.map(pitchName).join(" ")};
    }

    // 根音位置V7では第5音を省略し、根音を重複する不完全形も許容する。
    const vRootPc=mod(currentKey.tonicPc+7,12);
    const vThirdPc=mod(currentKey.tonicPc+11,12);
    const vSeventhPc=mod(currentKey.tonicPc+5,12);
    const incompleteV7Pcs=[vRootPc,vThirdPc,vSeventhPc].sort((a,b)=>a-b);
    if(sameSet(pcs,incompleteV7Pcs) && bassPc===vRootPc && countPc(vRootPc)===2){
      return{roman:"V7(5省略)",baseRoman:"V7",inversion:"root",omittedFifth:true,notes:ps.map(pitchName).join(" ")};
    }

    // 属七の和音：最低音が根音・第3音・第5音・第7音のどれかで転回形を判定。
    const v7Rel=[2,5,7,11], v7Pcs=shiftedSet(v7Rel);
    if(sameSet(pcs,v7Pcs)){
      const bassRel=mod(bassPc-currentKey.tonicPc,12);
      const suffix={7:"7",11:"65",2:"43",5:"2"}[bassRel] || "7";
      const inversion={"7":"root","65":"first","43":"second","2":"third"}[suffix];
      return{roman:`V${suffix}`,baseRoman:"V7",inversion,omittedFifth:false,notes:ps.map(pitchName).join(" ")};
    }

    // 三和音：構成音が一致したら、最低音から基本形 / 第1転回 / 第2転回を判定。
    for(const [r,setRel,members] of triads){
      if(!sameSet(pcs,shiftedSet(setRel)))continue;
      const rootPc=mod(currentKey.tonicPc+members[0],12);
      const thirdPc=mod(currentKey.tonicPc+members[1],12);
      const fifthPc=mod(currentKey.tonicPc+members[2],12);
      let suffix="", inversion="root";
      if(bassPc===thirdPc){suffix="6";inversion="first"}
      else if(bassPc===fifthPc){suffix="64";inversion="second"}
      else if(bassPc!==rootPc){return{roman:"?",baseRoman:"?",inversion:null,notes:ps.map(pitchName).join(" ")}}
      return{roman:`${r}${suffix}`,baseRoman:r,inversion,notes:ps.map(pitchName).join(" ")};
    }
    return{roman:"?",baseRoman:"?",inversion:null,notes:ps.map(pitchName).join(" ")};
  }
  function harmonicFunction(a){
    if(!a||a.baseRoman==="—"||a.baseRoman==="?") return null;
    const r=a.baseRoman;
    if(currentKey.mode==="minor"){
      if(["i","VI","III"].includes(r)) return "T";
      if(["iv","ii°"].includes(r)) return "S";
      if(["V","V7","vii°"].includes(r)) return "D";
    }else{
      if(["I","vi","iii"].includes(r)) return "T";
      if(["IV","ii"].includes(r)) return "S";
      if(["V","V7","vii°"].includes(r)) return "D";
    }
    return null;
  }
  function functionLabel(f){return f==="T"?"T 主機能":f==="S"?"S 下属機能":f==="D"?"D 属機能":""}
  function cadenceType(){
    const arr=[];
    for(let i=0;i<8;i++){
      const a=analyzeChord(i);
      if(a && a.roman!=="—" && a.roman!=="?") arr.push({i,a});
    }
    if(!arr.length) return null;
    const last=arr[arr.length-1], prev=arr.length>1?arr[arr.length-2]:null;
    const tonicRoman=currentKey.mode==="minor"?"i":"I";
    const deceptiveRoman=currentKey.mode==="minor"?"VI":"vi";
    const subdomRoman=currentKey.mode==="minor"?"iv":"IV";
    const isDom=a=>a&&(a.baseRoman==="V"||a.baseRoman==="V7");
    const isTonic=a=>a&&a.baseRoman===tonicRoman;
    const soprano=notes.S[last.i];
    const sopranoPc=soprano?mod(midiOf(soprano),12):null;
    const sopranoRel=sopranoPc==null?null:mod(sopranoPc-currentKey.tonicPc,12);

    // 偽終止 V(7) -> vi / VI
    if(prev&&isDom(prev.a)&&last.a.baseRoman===deceptiveRoman){
      return {type:"deceptive",label:`偽終止（${prev.a.roman} → ${last.a.roman}）`,from:prev.i,to:last.i,severity:"info"};
    }

    // 正格終止。完全終止は両和音が基本形、かつ最終ソプラノが主音。
    if(prev&&isDom(prev.a)&&isTonic(last.a)){
      const domRoot=prev.a.inversion==="root";
      const tonicRoot=last.a.inversion==="root";
      if(domRoot&&tonicRoot&&sopranoRel===0){
        return {type:"pac",label:"完全終止（PAC）",detail:`${prev.a.roman} → ${last.a.roman}、両和音基本形・ソプラノ主音`,from:prev.i,to:last.i,severity:"info"};
      }
      const reasons=[];
      if(!domRoot) reasons.push("属和音が転回形");
      if(!tonicRoot) reasons.push("主和音が転回形");
      if(sopranoRel!==0) reasons.push(`最終ソプラノが主音以外（${soprano?pitchName(soprano):"未入力"}）`);
      return {type:"iac",label:"不完全終止（IAC）",detail:reasons.join("・")||`${prev.a.roman} → ${last.a.roman}`,from:prev.i,to:last.i,severity:"info"};
    }

    // 変格終止 IV/iv -> I/i
    if(prev&&prev.a.baseRoman===subdomRoman&&isTonic(last.a)){
      return {type:"plagal",label:"変格終止",detail:`${prev.a.roman} → ${last.a.roman}`,from:prev.i,to:last.i,severity:"info"};
    }

    // 半終止：V/V7で終了。基本形以外なら添削上は注意。
    if(isDom(last.a)){
      return {type:"half",label:"半終止",detail:`${last.a.roman} で終止`,from:last.i,to:last.i,severity:last.a.inversion==="root"?"info":"warning"};
    }

    const f=harmonicFunction(last.a);
    if(f==="T") return {type:"tonic",label:"主機能で終結（定型終止未判定）",from:last.i,to:last.i,severity:"info"};
    return {type:"open",label:`${f?functionLabel(f):last.a.roman}で終了`,from:last.i,to:last.i,severity:"warning"};
  }
  function renderAnalysis(){
    analysisStrip.innerHTML="";if(!settings.analysis){analysisStrip.style.display="none";return}analysisStrip.style.display="grid";
    for(let i=0;i<8;i++){
      const a=analyzeChord(i),f=settings.functionMode!=="off"?harmonicFunction(a):null,d=document.createElement("div");d.className="analysis-cell";
      d.innerHTML=`<div class="roman">${a.roman}</div>${f?`<div class="func ${f}">${functionLabel(f)}</div>`:""}<div class="notes">${a.notes||"未入力"}</div>`;analysisStrip.appendChild(d)
    }
  }
  function nearestSlot(x){return Math.max(0,Math.min(7,Math.floor((x-measureStart)/measureWidth)))}

  score.addEventListener("click",ev=>{
    const pt=score.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;const p=pt.matrixTransform(score.getScreenCTM().inverse());
    const target=ev.target.closest?.("[data-v]");
    if(target){const v=target.dataset.v,slot=+target.dataset.slot;if(v!=="B"){activeVoice=v;selected={voice:v,slot};render()}return}
    if(p.x<measureStart||p.x>measureStart+8*measureWidth)return;
    const slot=nearestSlot(p.x),neededArea=(activeVoice==="S"||activeVoice==="A")?"treble":"bass";
    if(neededArea==="treble"&&(p.y<trebleTopY-55||p.y>trebleTopY+85))return;
    if(neededArea==="bass"&&(p.y<bassTopY-55||p.y>bassTopY+85))return;
    snapshot();notes[activeVoice][slot]=pitchForY(p.y,activeVoice);selected={voice:activeVoice,slot};errorKeys.clear();results.classList.remove("show");render();
  });
  document.querySelectorAll(".voice-btn").forEach(btn=>btn.addEventListener("click",()=>{if(btn.disabled)return;activeVoice=btn.dataset.v;selected.voice=activeVoice;render()}));

  function stepSelected(dir){
    const {voice,slot}=selected;if(!editable.includes(voice)||!notes[voice][slot])return;snapshot();
    let d=notes[voice][slot].d+dir,p={d,acc:keyAccForD(d)},[lo,hi]=ranges[voice];
    if(midiOf(p)>=lo&&midiOf(p)<=hi)notes[voice][slot]=p;render();
  }
  function setSelectedAcc(acc){
    const {voice,slot}=selected;if(!editable.includes(voice)||!notes[voice][slot])return;snapshot();notes[voice][slot]={...notes[voice][slot],acc};errorKeys.clear();results.classList.remove("show");render();
  }
  document.getElementById("stepUp").onclick=()=>stepSelected(1);
  document.getElementById("stepDown").onclick=()=>stepSelected(-1);
  document.getElementById("sharpBtn").onclick=()=>setSelectedAcc(1);
  document.getElementById("flatBtn").onclick=()=>setSelectedAcc(-1);
  document.getElementById("naturalBtn").onclick=()=>setSelectedAcc(0);
  document.getElementById("deleteNote").onclick=()=>{const{voice,slot}=selected;if(!editable.includes(voice)||!notes[voice][slot])return;snapshot();notes[voice][slot]=null;render()};
  document.getElementById("undoBtn").onclick=()=>{if(!history.length)return;future.push(JSON.stringify(notes));restore(history.pop());updateUndoRedo()};
  document.getElementById("redoBtn").onclick=()=>{if(!future.length)return;history.push(JSON.stringify(notes));restore(future.pop());updateUndoRedo()};
  document.getElementById("clearBtn").onclick=()=>{snapshot();editable.forEach(v=>notes[v]=Array(8).fill(null));errorKeys.clear();results.classList.remove("show");cadenceResult.textContent="";render()};
  document.getElementById("exampleBtn").onclick=()=>{snapshot();editable.forEach(v=>notes[v]=buildExampleVoice(v));errorKeys.clear();results.classList.remove("show");render()};
  document.getElementById("newTask").onclick=()=>{taskIndex=(taskIndex+1)%tasksC.length;resetTask(true)};
  keySel.addEventListener("change",e=>{currentKeyId=e.target.value;currentKey=KEYS[currentKeyId];taskIndex=0;resetTask(true)});

  function motion(a,b){return Math.sign(b-a)}
  function intervalClass(a,b){return Math.abs(a-b)%12}
  function isTonicChord(a){return a && a.baseRoman===(currentKey.mode==="minor"?"i":"I")}
  function isDominantChord(a){return a && (a.baseRoman==="V"||a.baseRoman==="V7")}
  function bassMidiAt(i){return notes.B[i]?midiOf(notes.B[i]):null}
  function stepDir(a,b){if(a==null||b==null)return 0;const d=b-a;return Math.abs(d)<=2?Math.sign(d):0}
  function classifySixFour(i){
    const a=analyzeChord(i); if(a.inversion!=="second") return null;
    const prev=i>0?analyzeChord(i-1):null, next=i<7?analyzeChord(i+1):null;
    const b0=bassMidiAt(i-1), b1=bassMidiAt(i), b2=bassMidiAt(i+1);
    const tonic=currentKey.mode==="minor"?"i":"I";
    // 終止四六: I64/i64 -> V/V7, scale degree 5 held in bass.
    if(a.baseRoman===tonic && next && isDominantChord(next) && b1!=null && b2!=null && mod(b1,12)===mod(b2,12)) return "cadential";
    // 保続四六: same surrounding harmony, same bass pitch across all three chords.
    if(prev&&next&&prev.baseRoman===next.baseRoman&&b0!=null&&b1!=null&&b2!=null&&b0===b1&&b1===b2) return "pedal";
    // 経過四六: same surrounding harmony and a three-note stepwise bass line in one direction.
    if(prev&&next&&prev.baseRoman===next.baseRoman&&b0!=null&&b1!=null&&b2!=null){
      const d1=stepDir(b0,b1),d2=stepDir(b1,b2); if(d1!==0&&d1===d2) return "passing";
    }
    return "other";
  }
  function grade(){
    errorKeys.clear();const out=[];const add=(type,msg,keys=[])=>{out.push({type,msg});keys.forEach(k=>errorKeys.add(k))};
    let missing=0;editable.forEach(v=>notes[v].forEach((p,i)=>{if(!p){missing++;errorKeys.add(`${v}-${i}`)}}));if(missing)add("error",`未入力の音が ${missing} 個あります。`);
    const leadPc=mod(currentKey.tonicPc+11,12),leadingName=scaleDegreeName(6,currentKey.mode==="minor"?1:0),tonicName=scaleDegreeName(0),tonicRoman=currentKey.mode==="minor"?"i":"I";
    for(let i=0;i<8;i++){
      const ps=voices.map(v=>notes[v][i]);if(ps.some(x=>!x))continue;const m=ps.map(midiOf);
      if(!(m[0]>m[1]&&m[1]>m[2]&&m[2]>m[3]))add("error",`${i+1}和音：声部交差があります。`,voices.map(v=>`${v}-${i}`));
      if(m[0]-m[1]>12)add("error",`${i+1}和音：ソプラノとアルトが1オクターヴを超えて開いています。`,[`S-${i}`,`A-${i}`]);
      if(m[1]-m[2]>12)add("error",`${i+1}和音：アルトとテノールが1オクターヴを超えて開いています。`,[`A-${i}`,`T-${i}`]);
      const a=analyzeChord(i);if(a.roman==="?")add("warning",`${i+1}和音：${currentKey.label}の基本三和音 / V7（転回形を含む）として認識できない音構成です。${currentKey.mode==="minor"?" 短調のV・V7・vii°では導音を半音上げます。":""}`,voices.map(v=>`${v}-${i}`));
      if(a.baseRoman==="V"||a.baseRoman==="V7"){
        const idx=m.map((x,k)=>mod(x,12)===leadPc?k:-1).filter(k=>k>=0);
        if(idx.length>1)add("warning",`${i+1}和音：導音${leadingName}が重複しています。`,idx.map(k=>`${voices[k]}-${i}`));
      }

      // 第5音省略の主和音は、直前が「完全な根音位置V7」の場合は正規の解決として許容。
      if(a.omittedFifth && a.baseRoman===tonicRoman){
        const prev=i>0?analyzeChord(i-1):null;
        const validFromCompleteV7=prev && prev.baseRoman==="V7" && prev.inversion==="root" && prev.omittedFifth===false;
        if(!validFromCompleteV7){
          add("warning",`${i+1}和音：主和音の第5音が省略されています。この省略は、完全な根音位置V7からの解決で用いるのが基本です。`,voices.map(v=>`${v}-${i}`));
        }
      }

      // 三和音の基本的な重複。根音位置＝根音重複、第2転回＝低音重複。
      // 第1転回では原則として低音重複を避けるが、ii°6 / vii°6 は例外。
      if(a.baseRoman!=="V7" && a.baseRoman!=="?" && a.baseRoman!=="—" && !a.omittedFifth){
        const rootRelMajor={I:0,ii:2,iii:4,IV:5,V:7,vi:9,"vii°":11};
        const rootRelMinor={i:0,"ii°":2,III:3,iv:5,V:7,VI:8,"vii°":11};
        const rel=(currentKey.mode==="minor"?rootRelMinor:rootRelMajor)[a.baseRoman];
        if(rel!==undefined){
          const rootPc=mod(currentKey.tonicPc+rel,12);
          const bassPc=mod(m[3],12);
          const rootCount=m.filter(x=>mod(x,12)===rootPc).length;
          const bassCount=m.filter(x=>mod(x,12)===bassPc).length;
          if(a.inversion==="root" && rootCount!==2){
            add("warning",`${i+1}和音：根音位置三和音では、基本的に根音（低音）を重複します。`,voices.map(v=>`${v}-${i}`));
          }else if(a.inversion==="first"){
            const dimException=a.baseRoman==="vii°" || (currentKey.mode==="minor"&&a.baseRoman==="ii°");
            if(!dimException && bassCount>1){
              add("warning",`${i+1}和音：第1転回形では、原則として低音の重複を避けます。`,voices.map(v=>`${v}-${i}`));
            }
          }else if(a.inversion==="second" && bassCount<2){
            add("warning",`${i+1}和音：第2転回形では、基本的に第5音である低音を重複します。`,voices.map(v=>`${v}-${i}`));
          }
        }
      }
    }
    // 転回形の用法判定
    for(let i=0;i<8;i++){
      const a=analyzeChord(i); if(a.roman==="—"||a.roman==="?") continue;
      if(a.inversion==="second"){
        const kind=classifySixFour(i);
        if(kind==="other") add("warning",`${i+1}和音：${a.roman} の第2転回形は、終止・経過・保続四六のいずれにも明確に該当しません。用法を確認してください。`,voices.map(v=>`${v}-${i}`));
      }
      if(a.baseRoman==="V7" && i<7){
        const nxt=analyzeChord(i+1);
        // 属七の和音第7音（調の第4音）は原則下行。
        const seventhPc=mod(currentKey.tonicPc+5,12);
        for(const v of voices){
          const x=notes[v][i],y=notes[v][i+1];
          if(x&&y&&mod(midiOf(x),12)===seventhPc && y.d!==x.d-1){
            add("error",`${i+1}→${i+2}和音：${v} の属七の第7音が下方へ順次進行していません。`,[`${v}-${i}`,`${v}-${i+1}`]);
          }
        }
        if(a.roman==="V65"){
          if(!isTonicChord(nxt)||nxt.inversion!=="root") add("warning",`${i+1}→${i+2}和音：V65 は通常、低音の導音を主音へ上げて主和音基本形へ解決します。`,[`B-${i}`,`B-${i+1}`]);
          else if(notes.B[i+1].d!==notes.B[i].d+1) add("error",`${i+1}→${i+2}和音：V65 の低音（導音）が主音へ上行していません。`,[`B-${i}`,`B-${i+1}`]);
        }else if(a.roman==="V43"){
          if(!isTonicChord(nxt)||(nxt.inversion!=="root"&&nxt.inversion!=="first")) add("warning",`${i+1}→${i+2}和音：V43 は主和音基本形または第1転回形への解決が基本です。`,[`B-${i}`,`B-${i+1}`]);
        }else if(a.roman==="V2"){
          if(!isTonicChord(nxt)||nxt.inversion!=="first") add("error",`${i+1}→${i+2}和音：V2 は低音の第7音を下げ、主和音第1転回形（${currentKey.mode==="minor"?"i6":"I6"}）へ解決するのが基本です。`,[`B-${i}`,`B-${i+1}`]);
          else if(notes.B[i+1].d!==notes.B[i].d-1) add("error",`${i+1}→${i+2}和音：V2 の低音にある第7音が下方へ順次進行していません。`,[`B-${i}`,`B-${i+1}`]);
        }else if(a.baseRoman==="V7" && a.inversion==="root" && !isTonicChord(nxt)){
          add("warning",`${i+1}→${i+2}和音：V7 が主和音へ進んでいません。偽終止など意図した用法か確認してください。`,voices.map(v=>`${v}-${i}`));
        }
      }
    }
    // 機能和声の流れを判定。例外を過剰に禁則化しないため、明確な逆進行のみ注意扱い。
    if(settings.functionMode==="on" && missing===0){
      const seq=[];
      for(let i=0;i<8;i++){
        const a=analyzeChord(i),f=harmonicFunction(a);
        if(f) seq.push({i,a,f});
      }
      for(let k=0;k<seq.length-1;k++){
        const x=seq[k],y=seq[k+1];
        if(x.i+1!==y.i) continue;
        if(x.f==="D"&&y.f==="S"){
          add("warning",`${x.i+1}→${y.i+1}和音：機能が D（属）→S（下属）と逆行しています。意図した進行か確認してください。`,voices.flatMap(v=>[`${v}-${x.i}`,`${v}-${y.i}`]));
        }
      }
      if(seq.length){
        const first=seq[0],last=seq[seq.length-1];
        if(first.i===0&&first.f!=="T") add("warning",`第1和音が ${functionLabel(first.f)} です。基本課題では主機能から開始する形が明瞭です。`,voices.map(v=>`${v}-0`));
        const cad=cadenceType();
        if(cad){
          if(cad.type==="open") add("warning",`終結が ${cad.label} です。課題の終止として十分か確認してください。`,voices.map(v=>`${v}-${cad.to}`));
          else if(cad.type==="half" && cad.severity==="warning") add("warning",`${cad.label}ですが、終止属和音が ${analyzeChord(cad.to).roman} の転回形です。半終止としての低音配置を確認してください。`,voices.map(v=>`${v}-${cad.to}`));
        }
      }
    }
    const pairs=[["S","A"],["S","T"],["S","B"],["A","T"],["A","B"],["T","B"]];
    for(let i=0;i<7;i++){
      for(const[v1,v2]of pairs){
        const p=[notes[v1][i],notes[v2][i],notes[v1][i+1],notes[v2][i+1]];if(p.some(x=>!x))continue;
        const[a1,a2,b1,b2]=p.map(midiOf),ic1=intervalClass(a1,a2),ic2=intervalClass(b1,b2),m1=motion(a1,b1),m2=motion(a2,b2);
        if(m1!==0&&m1===m2&&ic1===7&&ic2===7)add("error",`${i+1}→${i+2}和音：${v1}-${v2} に連続5度があります。`,[`${v1}-${i}`,`${v2}-${i}`,`${v1}-${i+1}`,`${v2}-${i+1}`]);
        if(m1!==0&&m1===m2&&ic1===0&&ic2===0)add("error",`${i+1}→${i+2}和音：${v1}-${v2} に連続8度（同度を含む）があります。`,[`${v1}-${i}`,`${v2}-${i}`,`${v1}-${i+1}`,`${v2}-${i+1}`]);
      }
      // 声部超越（overlap）：次の低声が前の高声を越える、または次の高声が前の低声を下回る。
      for(const [upper,lower] of [["S","A"],["A","T"],["T","B"]]){
        const u0=notes[upper][i],l0=notes[lower][i],u1=notes[upper][i+1],l1=notes[lower][i+1];
        if(u0&&l0&&u1&&l1){
          if(midiOf(l1)>midiOf(u0) || midiOf(u1)<midiOf(l0)){
            add("warning",`${i+1}→${i+2}和音：${upper}-${lower} に声部超越があります。`,[`${upper}-${i}`,`${lower}-${i}`,`${upper}-${i+1}`,`${lower}-${i+1}`]);
          }
        }
      }
      const outer=[notes.S[i],notes.B[i],notes.S[i+1],notes.B[i+1]];
      if(outer.every(Boolean)){
        const[s1,b1,s2,b2]=outer.map(midiOf),target=intervalClass(s2,b2),sm=motion(s1,s2),bm=motion(b1,b2);
        if(sm!==0&&sm===bm&&(target===7||target===0)&&Math.abs(s2-s1)>2)add("warning",`${i+1}→${i+2}和音：外声に並達${target===7?"5度":"8度"}があります。`,[`S-${i+1}`,`B-${i+1}`]);
      }
      if(analyzeChord(i+1).baseRoman===tonicRoman){
        const from=analyzeChord(i),to=analyzeChord(i+1);
        for(const v of editable){
          const x=notes[v][i],y=notes[v][i+1];if(!x||!y||mod(midiOf(x),12)!==leadPc)continue;
          const resolvedUp=midiOf(y)===midiOf(x)+1;
          // 完全V7→完全Iでは、内声の導音を下行させて両和音を完全体にする「導音の挫折」を許容。
          const frustratedInner=(v==="A"||v==="T") && from.baseRoman==="V7" && from.omittedFifth===false
            && to.baseRoman===tonicRoman && !to.omittedFifth && midiOf(y)<midiOf(x);
          if(!resolvedUp && !frustratedInner)add("warning",`${i+1}→${i+2}和音：${v} の導音${leadingName}が${tonicName}へ上行していません。`,[`${v}-${i}`,`${v}-${i+1}`]);
        }
      }
    }
    for(const v of editable)for(let i=0;i<7;i++){const a=notes[v][i],b=notes[v][i+1];if(a&&b&&Math.abs(midiOf(b)-midiOf(a))>12)add("warning",`${i+1}→${i+2}和音：${v} に1オクターヴを超える跳躍があります。`,[`${v}-${i}`,`${v}-${i+1}`])}
    const cad=missing===0?cadenceType():null;
    cadenceResult.textContent=cad?`終止形：${cad.label}${cad.detail?` — ${cad.detail}`:""}`:"";
    const errors=out.filter(x=>x.type==="error").length,warns=out.filter(x=>x.type==="warning").length,n=Math.max(0,100-errors*10-warns*4);
    let label,cls,summary;if(errors===0&&warns===0){label="適切";cls="ok";summary="現在の判定項目では問題は見つかりませんでした。"}else if(errors===0){label="注意";cls="warn";summary=`注意 ${warns} 件`}else{label="要修正";cls="bad";summary=`要修正 ${errors} 件 / 注意 ${warns} 件`}
    gradeLabel.className=`grade ${cls}`;gradeLabel.textContent=label;gradeSummary.textContent=summary;scoreNumber.textContent=n;issuesEl.innerHTML="";
    if(!out.length){const li=document.createElement("li");li.className="issue";li.textContent="基本的な禁則は検出されませんでした。";issuesEl.appendChild(li)}else out.slice(0,40).forEach(x=>{const li=document.createElement("li");li.className=`issue ${x.type}`;li.textContent=x.msg;issuesEl.appendChild(li)});
    results.classList.add("show");render();results.scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  document.getElementById("gradeBtn").onclick=grade;

  async function play(){
    stop();
    if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    await audioCtx.resume();
    const stepMs=60000/settings.tempoBpm;
    const holdMs=stepMs*0.94;
    for(let i=0;i<8;i++)setTimeout(()=>playChord(i,holdMs),i*stepMs);
  }
  function playChord(i,durationMs){
    if(!audioCtx)return;
    const now=audioCtx.currentTime;
    for(const v of voices){
      const p=notes[v][i];if(!p)continue;
      const m=midiOf(p),osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
      osc.type="sine";osc.frequency.value=440*Math.pow(2,(m-69)/12);
      const level=v==="B"?.045:.03, dur=durationMs/1000;
      gain.gain.setValueAtTime(.0001,now);
      gain.gain.exponentialRampToValueAtTime(level,now+.035);
      gain.gain.setValueAtTime(level,now+Math.max(.05,dur-.10));
      gain.gain.exponentialRampToValueAtTime(.0001,now+dur);
      osc.connect(gain).connect(audioCtx.destination);osc.start(now);osc.stop(now+dur+.04);liveNodes.push(osc);
    }
  }
  function stop(){liveNodes.forEach(n=>{try{n.stop()}catch(e){}});liveNodes=[]}
  document.getElementById("playBtn").onclick=play;document.getElementById("stopBtn").onclick=stop;

  const rulesDialog=document.getElementById("rulesDialog"),settingsDialog=document.getElementById("settingsDialog");window.rulesDialog=rulesDialog;window.settingsDialog=settingsDialog;
  document.getElementById("rulesBtn").onclick=()=>rulesDialog.showModal();document.getElementById("settingsBtn").onclick=()=>settingsDialog.showModal();
  const tempoRange=document.getElementById("tempoRange"),tempoValue=document.getElementById("tempoValue"),tempoSel=document.getElementById("tempoSel");
  function setTempo(bpm){
    bpm=Math.max(40,Math.min(160,Math.round(bpm/5)*5));settings.tempoBpm=bpm;
    tempoRange.value=bpm;tempoValue.textContent=`${bpm} BPM`;
    if(bpm<=70)tempoSel.value="60";else if(bpm>=105)tempoSel.value="120";else tempoSel.value="90";
  }
  tempoRange.oninput=e=>setTempo(+e.target.value);
  document.getElementById("tempoDown").onclick=()=>setTempo(settings.tempoBpm-5);
  document.getElementById("tempoUp").onclick=()=>setTempo(settings.tempoBpm+5);
  tempoSel.onchange=e=>setTempo(+e.target.value);
  setTempo(90);

  const scoreScroller=document.getElementById("scoreScroller"),scoreScrollBar=document.getElementById("scoreScrollBar");
  let syncingScroll=false;
  function syncBottomScroll(){
    if(syncingScroll)return;
    const max=Math.max(0,scoreScroller.scrollWidth-scoreScroller.clientWidth);
    scoreScrollBar.value=max?Math.round(scoreScroller.scrollLeft/max*1000):0;
  }
  scoreScroller.addEventListener("scroll",syncBottomScroll,{passive:true});
  scoreScrollBar.addEventListener("input",()=>{
    const max=Math.max(0,scoreScroller.scrollWidth-scoreScroller.clientWidth);
    syncingScroll=true;scoreScroller.scrollLeft=max*(+scoreScrollBar.value/1000);syncingScroll=false;
  });
  document.getElementById("scrollLeftBtn").onclick=()=>scoreScroller.scrollBy({left:-Math.max(220,scoreScroller.clientWidth*.65),behavior:"smooth"});
  document.getElementById("scrollRightBtn").onclick=()=>scoreScroller.scrollBy({left:Math.max(220,scoreScroller.clientWidth*.65),behavior:"smooth"});
  window.addEventListener("resize",syncBottomScroll);
  setTimeout(syncBottomScroll,0);

  document.getElementById("analysisSel").onchange=e=>{settings.analysis=e.target.value==="on";renderAnalysis()};document.getElementById("functionSel").onchange=e=>{settings.functionMode=e.target.value;renderAnalysis()};
  if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
  resetTask(true);
})();
