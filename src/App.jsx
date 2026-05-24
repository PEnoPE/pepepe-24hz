import { useState, useEffect, useRef } from "react";

// ============== 星の生成 ==============
function generateStars() {
  const stars = [];
  let id = 0;
  const configs = [
    { n:16,  rMin:3.4, rMax:1.2, opMin:0.96, opMax:0.04, tw:[2.5,2],  mag:1, colors:["#fffef8","#fff8e0","#e8f0ff","#ffecd0","#f0f8ff"] },
    { n:55,  rMin:2.1, rMax:0.8, opMin:0.85, opMax:0.14, tw:[2,2.5],  mag:2, colors:["#ffffff","#fff8f0","#f0f4ff","#ffe8f0"] },
    { n:170, rMin:1.3, rMax:0.6, opMin:0.55, opMax:0.30, tw:[2.5,3],  mag:3, colors:["#ffffff","#f2f4ff","#fff4f0"] },
    { n:340, rMin:0.8, rMax:0.4, opMin:0.26, opMax:0.26, tw:[3,4],    mag:4, colors:["#e8eeff"] },
    { n:540, rMin:0.44,rMax:0.26,opMin:0.11, opMax:0.19, tw:[4,5],    mag:5, colors:["#d0d8f0"] },
    { n:400, rMin:0.22,rMax:0.15,opMin:0.04, opMax:0.11, tw:[6,6],    mag:6, colors:["#b8c0d8"] },
  ];
  configs.forEach(c => {
    for (let i = 0; i < c.n; i++) {
      stars.push({
        id: id++, mag: c.mag,
        x: Math.random()*100, y: Math.random()*100,
        r: c.rMin + Math.random()*c.rMax,
        op: c.opMin - Math.random()*c.opMax,
        tw: c.tw[0] + Math.random()*c.tw[1],
        delay: Math.random()*14,
        color: c.colors[Math.floor(Math.random()*c.colors.length)],
      });
    }
  });
  return stars;
}

// ============== データ ==============
const questions = [
  { id:"q1", label:"今、体はどんな感じ？", sub:"体全体の元気の度合い", multi:false, options:[
    {label:"とても元気",value:"very_energetic"},
    {label:"まあまあ元気",value:"okay"},
    {label:"少し疲れている",value:"slight"},
    {label:"かなり疲れている",value:"tired"},
    {label:"ぐったりしている／もう限界",value:"exhausted"},
    {label:"痛みを感じる場所がある",value:"pain"},
  ]},
  { id:"q2", label:"頭の中はどんな感じ？", sub:"今の気持ちや考えの状態", multi:false, options:[
    {label:"落ち着いている",value:"calm"},
    {label:"考えが止まらない",value:"racing"},
    {label:"ぼんやりしている",value:"foggy"},
    {label:"不安がある",value:"anxious"},
    {label:"やる気が出ない",value:"unmotivated"},
    {label:"高揚している",value:"elevated"},
  ]},
  { id:"q3", label:"呼吸はどんな感じ？", sub:"今の自分の呼吸を見てください", multi:false, options:[
    {label:"深くてゆったり",value:"deep"},
    {label:"ふつう",value:"normal"},
    {label:"少し浅い",value:"shallow"},
    {label:"速くて乱れている／苦しい",value:"rapid"},
    {label:"止めている",value:"held"},
    {label:"意識すると止まる",value:"conscious_stop"},
  ]},
  { id:"q4", label:"今の時間はどう感じる？", sub:"時計ではなく自分の感覚で", multi:false, options:[
    {label:"朝のような感じ",value:"morning"},
    {label:"昼のような感じ",value:"daytime"},
    {label:"夕方のような感じ",value:"evening"},
    {label:"夜のような感じ",value:"night"},
    {label:"深夜のような感じ",value:"midnight"},
    {label:"止まっている感じ",value:"stopped"},
  ]},
  { id:"q5", label:"昨日の夜はよく眠れた？", sub:"眠りの長さと深さ", multi:false, options:[
    {label:"ぐっすり眠れた",value:"great"},
    {label:"まあまあ",value:"okay"},
    {label:"短かった・途中で目が覚めた",value:"short"},
    {label:"ほとんど眠れなかった",value:"poor"},
    {label:"昼夜が逆転している",value:"irregular"},
    {label:"寝ているのか起きているのかわからない",value:"unclear"},
  ]},
  { id:"q6", label:"今、何が気になっている？", sub:"気になることを最大2つ", multi:true, options:[
    {label:"仕事・お金のこと",value:"work_money"},
    {label:"人間関係",value:"relationship"},
    {label:"体の不調",value:"health"},
    {label:"将来のこと",value:"future"},
    {label:"身のまわりのこと",value:"daily"},
    {label:"特にない",value:"none"},
  ]},
  { id:"q7", label:"これからどうなりたい？", sub:"目指したい状態を最大2つ", multi:true, options:[
    {label:"集中したい",value:"focus"},
    {label:"リラックスしたい",value:"relax"},
    {label:"眠りたい",value:"sleep"},
    {label:"元気を出したい",value:"energize"},
    {label:"頭をリセットしたい",value:"reset"},
    {label:"なりたい自分になりたい",value:"become_self"},
  ]},
  { id:"q8", label:"いまの感情を素直にお聞かせください", sub:"最大2つまで", multi:true, options:[
    {label:"誰かへの怒りや不満がある",value:"anger"},
    {label:"自分を責めている",value:"self_blame"},
    {label:"不安や恐れがある",value:"anxiety"},
    {label:"孤独を感じている",value:"loneliness"},
    {label:"何かへの執着がある",value:"attachment"},
    {label:"ぺぺぺってナニ？",value:"curiosity"},
  ]},
];

const waveInfo = {
  gamma: { name:"γ波", full:"ガンマ波", hz:"30〜100Hz", color:"#ffd060", desc:"高度な集中・情報統合" },
  beta:  { name:"β波", full:"ベータ波", hz:"13〜30Hz",  color:"#ff8070", desc:"覚醒・思考・ストレス" },
  alpha: { name:"α波", full:"アルファ波",hz:"8〜13Hz",  color:"#7ad8ff", desc:"リラックス・創造性" },
  theta: { name:"θ波", full:"シータ波", hz:"4〜8Hz",   color:"#7ce8b0", desc:"深いリラックス・まどろみ" },
  delta: { name:"δ波", full:"デルタ波", hz:"0.5〜4Hz", color:"#b894f0", desc:"深い睡眠・回復" },
};

const solfeggio = {
  anger:      { hz:417, name:"417Hz", effect:"変化の促進・固執の解放・停滞したエネルギーのリセット" },
  self_blame: { hz:528, name:"528Hz", effect:"DNA修復・愛と調和・ストレスで乱れた生体エネルギーの修復" },
  anxiety:    { hz:396, name:"396Hz", effect:"恐れと罪悪感の解放・グラウンディング・安心感の回復" },
  loneliness: { hz:639, name:"639Hz", effect:"人間関係の調和・つながりの感覚・心の開放" },
  attachment: { hz:741, name:"741Hz", effect:"表現と解決・直感の覚醒・執着パターンの解消" },
  peaceful:   { hz:528, name:"528Hz", effect:"現在の穏やかさをさらに深める・細胞レベルの回復促進" },
};

const MODELS = [
  { id:"claude-sonnet-4-20250514", label:"ぺぺぺの神託（標準）", desc:"バランス型・速い" },
  { id:"claude-opus-4-5",          label:"ぺぺぺの神託（深層）", desc:"最高精度・詳細" },
];

// ============== 音声生成 ==============
function createBinauralBeat(targetWave, beatHz, solfeggioHz, volume) {
  const base = {gamma:200, beta:180, alpha:160, theta:140, delta:120}[targetWave] || 160;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime((volume||0.7)*0.13, ctx.currentTime+2.5);
  master.connect(ctx.destination);

  const leftOsc = ctx.createOscillator();
  const lp = ctx.createStereoPanner();
  leftOsc.frequency.value = base; leftOsc.type = "sine"; lp.pan.value = -1;
  leftOsc.connect(lp); lp.connect(master); leftOsc.start();

  const rightOsc = ctx.createOscillator();
  const rp = ctx.createStereoPanner();
  rightOsc.frequency.value = base + beatHz; rightOsc.type = "sine"; rp.pan.value = 1;
  rightOsc.connect(rp); rp.connect(master); rightOsc.start();

  const drone = ctx.createOscillator();
  const dg = ctx.createGain(); dg.gain.value = 0.04;
  drone.frequency.value = base/2; drone.type = "sine";
  drone.connect(dg); dg.connect(master); drone.start();

  if (solfeggioHz) {
    const sf = ctx.createOscillator();
    const sg = ctx.createGain(); sg.gain.value = 0.06;
    sf.frequency.value = solfeggioHz; sf.type = "sine";
    sf.connect(sg); sg.connect(master); sf.start();
  }

  return { ctx, master, leftOsc, rightOsc, drone };
}

// ============== 共通コンポーネント ==============
function Stars({ stars }) {
  return (
    <>
      {stars.map(s => (
        <div key={s.id} style={{
          position:"fixed", left:`${s.x}%`, top:`${s.y}%`,
          width:`${s.r*1.5}px`, height:`${s.r*1.5}px`, borderRadius:"50%",
          background:s.color, "--op":s.op, opacity:s.op,
          boxShadow: s.mag<=2
            ? `0 0 ${s.r*6}px ${s.r*2}px ${s.color},0 0 ${s.r*14}px ${s.r}px rgba(220,230,255,0.55),0 0 ${s.r*24}px rgba(200,215,255,0.28)`
            : s.mag===3
            ? `0 0 ${s.r*4}px ${s.r}px ${s.color},0 0 ${s.r*8}px rgba(220,230,255,0.32)`
            : "none",
          animation: s.mag<=2
            ? `twinkleBright ${s.tw}s ${s.delay}s infinite ease-in-out`
            : `twinkle ${s.tw}s ${s.delay}s infinite ease-in-out`,
          pointerEvents:"none", zIndex:0,
        }} />
      ))}
    </>
  );
}

function Nebulae() {
  return (
    <>
      {[
        {top:"2%",  left:"3%",  w:"340px",h:"230px",color:"rgba(130,50,220,0.2)", blur:30,dur:14,del:0},
        {top:"16%", right:"0%", w:"260px",h:"190px",color:"rgba(220,50,150,0.15)",blur:26,dur:18,del:4},
        {top:"44%", left:"12%", w:"300px",h:"210px",color:"rgba(30,50,200,0.13)", blur:32,dur:22,del:8},
        {top:"64%", right:"8%", w:"220px",h:"170px",color:"rgba(80,20,160,0.15)", blur:24,dur:16,del:2},
        {top:"78%", left:"28%", w:"280px",h:"190px",color:"rgba(20,40,180,0.11)", blur:30,dur:20,del:6},
      ].map((n,i) => (
        <div key={i} style={{
          position:"fixed", top:n.top, left:n.left, right:n.right,
          width:n.w, height:n.h,
          background:`radial-gradient(ellipse,${n.color} 0%,transparent 70%)`,
          filter:`blur(${n.blur}px)`,
          animation:`nebulaPulse ${n.dur}s ${n.del}s infinite ease-in-out`,
          pointerEvents:"none", zIndex:0,
        }} />
      ))}
    </>
  );
}

function SpaceBg() {
  return (
    <div style={{
      position:"fixed", inset:0,
      background:`
        radial-gradient(ellipse at 50% 18%,rgba(110,35,200,0.38) 0%,transparent 40%),
        radial-gradient(ellipse at 8%  30%,rgba(35,12,130,0.35)  0%,transparent 36%),
        radial-gradient(ellipse at 92% 18%,rgba(90,12,110,0.28)  0%,transparent 36%),
        radial-gradient(ellipse at 25% 78%,rgba(12,8,70,0.25)    0%,transparent 34%),
        radial-gradient(ellipse at 75% 65%,rgba(50,6,90,0.25)    0%,transparent 34%),
        linear-gradient(180deg,#000000 0%,#000002 6%,#000006 16%,#00000a 30%,#00000e 50%,#010012 70%,#020016 100%)
      `,
      zIndex:0,
    }} />
  );
}

function Sigil({ size=180 }) {
  return (
    <div style={{ position:"relative", width:`${size}px`, height:`${size}px`, margin:"0 auto" }}>
      <div style={{
        position:"absolute", width:`${size+40}px`, height:`${size+40}px`,
        borderRadius:"50%", border:"1px solid rgba(255,255,255,0.07)",
        boxShadow:"0 0 60px rgba(255,255,255,0.06)",
        top:"50%", left:"50%", transform:"translate(-50%,-50%)",
      }} />
      <div style={{
        position:"absolute", inset:0, borderRadius:"50%",
        border:"2px solid rgba(255,255,255,0.65)",
        animation:"sigilRotate 50s linear infinite",
        boxShadow:"0 0 30px rgba(255,255,255,0.35),inset 0 0 20px rgba(255,255,255,0.18)",
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            position:"absolute", top:"50%", left:"50%",
            width:"13px", height:"13px", borderRadius:"50%",
            background:"#ffffff",
            boxShadow:"0 0 22px #ffffff,0 0 44px rgba(255,255,255,0.8),0 0 66px rgba(255,255,255,0.4)",
            transform:`translate(-50%,-50%) rotate(${i*120}deg) translateY(-${size/2-2}px)`,
          }} />
        ))}
      </div>
      <div style={{
        position:"absolute", inset:`${size*0.14}px`, borderRadius:"50%",
        border:"1.5px solid rgba(255,255,255,0.42)",
        animation:"sigilRotateRev 35s linear infinite",
        boxShadow:"0 0 14px rgba(255,255,255,0.2)",
      }}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{
            position:"absolute", top:"50%", left:"50%",
            width:"7px", height:"7px", borderRadius:"50%",
            background:"rgba(255,255,255,0.9)",
            boxShadow:"0 0 12px rgba(255,255,255,0.95)",
            transform:`translate(-50%,-50%) rotate(${i*60}deg) translateY(-${size*0.36-2}px)`,
          }} />
        ))}
      </div>
      <div style={{
        position:"absolute", inset:`${size*0.28}px`, borderRadius:"50%",
        border:"1px solid rgba(255,255,255,0.3)",
        animation:"sigilRotate 20s linear infinite",
      }} />
      <div style={{
        position:"absolute", inset:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'Zen Kaku Gothic New',sans-serif",
        fontSize:`${size*0.178}px`, color:"#ffffff",
        letterSpacing:"0.28em", paddingRight:"0.28em",
        fontWeight:"900",
        textShadow:"0 0 22px rgba(255,255,255,0.98),0 0 44px rgba(255,255,255,0.65),0 0 70px rgba(255,255,255,0.35)",
      }}>ぺぺぺ</div>
    </div>
  );
}

// ============== メイン ==============
export default function App() {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState([]);
  const [result, setResult]   = useState(null);
  const [stars]               = useState(() => generateStars());
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume]   = useState(0.7);
  const [model, setModel]     = useState(MODELS[0].id);
  const [showModel, setShowModel] = useState(false);
  const [debugMsg, setDebugMsg] = useState("");
  const audioRef = useRef(null);

  const TOTAL = questions.length;

  useEffect(() => () => stopAudio(), []);

  const stopAudio = () => {
    if (!audioRef.current) return;
    try {
      const { ctx, master, leftOsc, rightOsc, drone } = audioRef.current;
      master.gain.linearRampToValueAtTime(0, ctx.currentTime+1.5);
      setTimeout(() => { leftOsc.stop(); rightOsc.stop(); drone.stop(); ctx.close(); }, 1600);
    } catch {}
    audioRef.current = null;
    setPlaying(false);
  };

  const toggleAudio = () => {
    if (playing) { stopAudio(); return; }
    if (!result) return;
    const solHz = result.solfeggioHz || null;
    const audio = createBinauralBeat(result.targetWave, result.preciseBeatHz, solHz, volume);
    if (audio) { audioRef.current = audio; setPlaying(true); }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.master.gain.setValueAtTime(volume*0.13, audioRef.current.ctx.currentTime);
    }
  }, [volume]);

  const currentQ = step>=1 && step<=TOTAL ? questions[step-1] : null;
  const maxSel   = currentQ?.multi ? 2 : 1;

  const toggleOpt = (val) => {
    if (selected.includes(val)) { setSelected(selected.filter(v=>v!==val)); return; }
    if (maxSel===1) { setSelected([val]); return; }
    if (selected.length < maxSel) setSelected([...selected, val]);
    else setSelected([selected[1], val]);
  };

  const handleNext = async () => {
    if (!selected.length) return;
    if (step === 99) return;
    const val = currentQ.multi ? selected : selected[0];
    const newAns = {...answers, [currentQ.id]: val};
    setAnswers(newAns);
    setSelected([]);
    if (step < TOTAL) { setStep(step+1); }
    else { setStep(99); await fetchDiagnosis(newAns); }
  };

  const fetchDiagnosis = async (ans) => {
    setDebugMsg("API呼び出し中...");
    const prompt = `あなたは脳波・神経科学・音響療法・感情心理学の専門家です。以下の回答を精密に分析し、JSONのみで回答してください。マークダウン不要。

回答：
${Object.entries(ans).map(([k,v])=>`- ${k}: ${JSON.stringify(v)}`).join("\n")}

特記事項：
- q8で「curiosity（ぺぺぺってナニ？）」が選ばれた場合、感情データとしては「好奇心・探求心」として処理すること。また結果のmessageに「現世御利益」という言葉を必ず含めること。
- q3で「held（止めている）」または「conscious_stop（意識すると止まる）」が選ばれた場合、高い緊張・交感神経の過緊張として処理すること。
- q1で「pain（痛みを感じる場所がある）」が選ばれた場合、身体的ストレスを強く反映すること。
1. 脳波は細分帯まで判定（低β13-15Hz・中β15-20Hz・高β20-30Hz、低α8-10Hz・高α10-13Hz 等）
2. 感情状態からソルフェジオ周波数を選定（174・285・396・417・528・639・741・852・963Hz）
3. Hzは0.5Hz単位で精密に
4. 段階的誘導：現在のHz→中間Hz→目標Hzの3ステップを示す
5. なぜその周波数か・体内変化・主観感覚を神経科学的根拠で説明

JSON：
{
  "dominantWave": "gamma|beta|alpha|theta|delta",
  "preciseDominantHz": 数値,
  "dominantSubBand": "細分帯名",
  "dominantSubBandRange": "Hz範囲",
  "dominantCharacter": "この細分帯の特徴（1文・断定調）",
  "waveReason": "この脳波が優位な因果（2文・断定調・身体的根拠）",
  "targetWave": "gamma|beta|alpha|theta|delta",
  "preciseTargetHz": 数値,
  "targetSubBand": "目標細分帯名",
  "targetSubBandRange": "目標Hz範囲",
  "preciseBeatHz": 数値,
  "step1Hz": 数値,
  "step2Hz": 数値,
  "step3Hz": 数値,
  "solfeggioHz": 数値,
  "solfeggioName": "例：528Hz",
  "solfeggioReason": "このソルフェジオ周波数を選んだ理由（2文・断定調）",
  "whyThisFrequency": "なぜこのHz（3文・神経科学的根拠）",
  "expectedChanges": "体内で起きる変化（脳波エントレインメント・自律神経・神経伝達物質・3文）",
  "subjectiveFeeling": "主観的に感じられる変化（30分後の感覚・2文）",
  "timeToEffect": "効果が出始める目安",
  "frequency": "推奨周波数の説明",
  "sound": "推奨する音・音楽（具体的）",
  "breathing": "推奨呼吸法（名前と秒数）",
  "light": "推奨する光環境（色温度・照度）",
  "movement": "推奨する動作・姿勢（具体的）",
  "message": "この人へのメッセージ（20文字以内・詩的）"
}`;

    try {
      setDebugMsg("fetchを送信中...");
      // 25秒タイムアウト
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        signal: controller.signal,
        body:JSON.stringify({
          model,
          max_tokens:3000,
          messages:[{role:"user",content:prompt}],
        }),
      });
      clearTimeout(timeoutId);
      setDebugMsg(`レスポンス受信 status:${res.status}`);
      const data = await res.json();
      setDebugMsg(`JSON受信`);
      const text = data.content.map(i=>i.text||"").join("");
      const cleaned = text.replace(/```json|```/g,"").trim();
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
        setDebugMsg("パース成功");
      } catch(e) {
        const fixed = cleaned.replace(/,\s*"[^"]*"\s*:\s*[^,}\]]*$/, "") + "}";
        try { parsed = JSON.parse(fixed); } catch { parsed = null; }
      }
      if (parsed) setResult(parsed);
      else throw new Error("parse failed");
    } catch(e) {
      setDebugMsg(`エラー→フォールバック:${e.message?.slice(0,30)}`);
      setResult({
        dominantWave:"beta", preciseDominantHz:22.5,
        dominantSubBand:"高β波", dominantSubBandRange:"20〜30Hz",
        dominantCharacter:"強い覚醒・思考の高速回転・交感神経が優位な状態",
        waveReason:"持続した認知負荷により交感神経優位の状態が維持されている。前頭前野の活動が高止まりし副交感神経への切替が滞っている。",
        targetWave:"alpha", preciseTargetHz:10.0,
        targetSubBand:"中α波", targetSubBandRange:"9〜11Hz",
        preciseBeatHz:10.0, step1Hz:18.0, step2Hz:14.0, step3Hz:10.0,
        solfeggioHz:528, solfeggioName:"528Hz",
        solfeggioReason:"528Hzは愛と調和の周波数とされ、ストレスで乱れた生体エネルギーを整える。細胞レベルでの修復を促進し、感情の安定を支援する。",
        whyThisFrequency:"10.0Hzはα波の中心帯域で、リラックスと覚醒のバランスが最も取れる周波数である。これより低い8Hzでは眠気が強くなりすぎ、12Hz以上では緊張が抜けにくい。22.5Hzから10Hzへの誘導は最も無理のないステップとなる。",
        expectedChanges:"聴覚刺激により脳波エントレインメント効果が起き両耳の周波数差に脳波が同期する。副交感神経が優位になり心拍数と血圧が穏やかに低下する。GABA系が活性化し皮質の過剰興奮が鎮まる。",
        subjectiveFeeling:"5〜10分で肩の力が抜け呼吸が自然と深くなる。30分続けると思考の渦が静まり輪郭のはっきりした静けさが訪れる。",
        timeToEffect:"5〜10分",
        frequency:"10.0Hz バイノーラルビート＋528Hz ソルフェジオ周波数",
        sound:"528Hz基音とブラウンノイズ・水流音の組み合わせ",
        breathing:"4-7-8呼吸を4セット（吸気4秒・止息7秒・呼気8秒）",
        light:"色温度2700K以下・照度50ルクス・間接光のみ",
        movement:"肩甲骨を5回大きく回し首を左右にゆっくり3回ずつ傾ける",
        message:"宇宙の鼓動と、響き合え。",
      });
    } finally {
      setDebugMsg(m => m + " → step14へ");
      setStep(14);
    }
  };

  const reset = () => {
    stopAudio();
    setStep(0); setAnswers({}); setSelected([]); setResult(null);
  };

  const waveColor = result ? (waveInfo[result.targetWave]?.color||"#7ad8ff") : "#7ad8ff";
  const domColor  = result ? (waveInfo[result.dominantWave]?.color||"#ff8070") : "#ff8070";

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap');
    *{box-sizing:border-box;}
    @keyframes twinkle{0%,100%{opacity:var(--op);transform:scale(1);}45%{opacity:calc(var(--op)*0.12);transform:scale(0.3);}}
    @keyframes twinkleBright{0%,100%{opacity:var(--op);transform:scale(1);filter:brightness(1);}25%{opacity:calc(var(--op)*0.3);transform:scale(0.65);filter:brightness(0.5);}62%{opacity:1;transform:scale(1.35);filter:brightness(2);}78%{opacity:0.88;transform:scale(1.1);filter:brightness(1.5);}}
    @keyframes sigilRotate{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes sigilRotateRev{from{transform:rotate(360deg);}to{transform:rotate(0deg);}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);}}
    @keyframes nebulaPulse{0%,100%{opacity:0.22;transform:scale(1);}50%{opacity:0.42;transform:scale(1.07);}}
    @keyframes aiPulse{0%,100%{text-shadow:0 0 22px rgba(255,255,255,0.75),0 0 44px rgba(255,255,255,0.45),0 0 88px rgba(255,255,255,0.18);}50%{text-shadow:0 0 32px rgba(255,255,255,1),0 0 64px rgba(255,255,255,0.7),0 0 110px rgba(255,255,255,0.3);}}
    @keyframes btnPulse{0%,100%{box-shadow:0 0 22px rgba(255,255,255,0.22),0 0 44px rgba(255,255,255,0.1),inset 0 0 22px rgba(255,255,255,0.06);}50%{box-shadow:0 0 36px rgba(255,255,255,0.42),0 0 72px rgba(255,255,255,0.2),inset 0 0 36px rgba(255,255,255,0.1);}}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes wave{0%,100%{transform:scaleY(0.25);}50%{transform:scaleY(1);}}
    @keyframes pulseRing{0%{box-shadow:0 0 0 0 var(--glow);}70%{box-shadow:0 0 0 12px transparent;}100%{box-shadow:0 0 0 0 transparent;}}
    @keyframes planetGlow{0%,100%{box-shadow:0 0 60px var(--gc),0 0 120px var(--gc),inset -20px -20px 40px rgba(0,0,0,0.5);}50%{box-shadow:0 0 80px var(--gc),0 0 160px var(--gc),inset -20px -20px 40px rgba(0,0,0,0.5);}}
    @keyframes orbit{from{transform:rotate(0deg) translateX(80px) rotate(0deg);}to{transform:rotate(360deg) translateX(80px) rotate(-360deg);}}
    .opt{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.10);border-radius:12px;padding:10px 14px;color:#fff;font-family:'Zen Kaku Gothic New',sans-serif;font-size:16px;font-weight:500;text-align:left;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:10px;margin-bottom:6px;letter-spacing:0.02em;line-height:1.3;}
    .opt:hover{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.4);transform:translateX(4px);}
    .opt.on{background:rgba(255,255,255,0.14);border-color:rgba(255,255,255,0.65);box-shadow:0 0 14px rgba(255,255,255,0.15);}
    .go{width:100%;background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.75);color:#fff;border-radius:50px;padding:12px;font-family:'Zen Kaku Gothic New',sans-serif;font-size:18px;font-weight:900;letter-spacing:0.15em;cursor:pointer;transition:all 0.25s;margin-top:8px;text-shadow:0 0 10px rgba(255,255,255,0.6);animation:btnPulse 4s infinite ease-in-out;}
    .go:hover:not(:disabled){background:rgba(255,255,255,0.18);transform:scale(1.02);}
    .go:disabled{opacity:0.25;cursor:default;animation:none;}
    .sub-btn{width:100%;background:transparent;border:1px solid rgba(255,255,255,0.2);color:rgba(220,230,250,0.75);border-radius:50px;padding:16px;font-family:'Zen Kaku Gothic New',sans-serif;font-size:18px;font-weight:700;letter-spacing:0.12em;cursor:pointer;transition:all 0.2s;}
    .sub-btn:hover{border-color:rgba(255,255,255,0.5);color:#fff;}
    input[type=range]{-webkit-appearance:none;width:100%;height:3px;border-radius:2px;background:rgba(255,255,255,0.15);outline:none;}
    input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#ffffff;cursor:pointer;}
  `;

  return (
    <div style={{
      minHeight:"100vh", position:"relative", overflow:"hidden",
      display:"flex", flexDirection:"column", alignItems:"center",
      padding:"24px 0 40px",
      fontFamily:"'Zen Kaku Gothic New','Hiragino Sans',sans-serif",
      color:"#ffffff",
    }}>
      <style>{CSS}</style>
      <SpaceBg />
      <Stars stars={stars} />
      <Nebulae />

      {/* モデル選択ボタン */}
      <div style={{
        position:"fixed", top:"18px", right:"18px", zIndex:20,
      }}>
        <button onClick={() => setShowModel(!showModel)} style={{
          background:"rgba(255,255,255,0.08)",
          border:"1px solid rgba(255,255,255,0.25)",
          borderRadius:"50%", width:"42px", height:"42px",
          color:"#ffffff", fontSize:"18px", cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>⚙</button>
        {showModel && (
          <div style={{
            position:"absolute", top:"52px", right:0,
            background:"rgba(4,2,20,0.96)",
            border:"1px solid rgba(255,255,255,0.15)",
            borderRadius:"16px", padding:"16px",
            width:"260px",
            boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
          }}>
            <div style={{
              fontFamily:"'Zen Kaku Gothic New',sans-serif",
              fontSize:"12px", fontWeight:"700",
              color:"rgba(255,255,255,0.5)",
              letterSpacing:"0.2em", marginBottom:"12px",
            }}>神託のモデルを選ぶ</div>
            {MODELS.map(m => (
              <div key={m.id} onClick={() => { setModel(m.id); setShowModel(false); }} style={{
                padding:"12px 14px",
                borderRadius:"10px",
                background: model===m.id ? "rgba(255,255,255,0.12)" : "transparent",
                border: `1px solid ${model===m.id ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                cursor:"pointer", marginBottom:"8px",
                transition:"all 0.2s",
              }}>
                <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"15px", fontWeight:"700", color:"#fff", marginBottom:"3px" }}>{m.label}</div>
                <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"12px", color:"rgba(255,255,255,0.5)" }}>{m.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position:"relative", zIndex:5, width:"100%", maxWidth:"520px", padding:"0 22px" }}>

        {/* ====== 表紙 ====== */}
        {step===0 && (
          <div style={{ textAlign:"center", animation:"fadeUp 1.2s ease", display:"flex", flexDirection:"column", alignItems:"center" }}>

            {/* シジル */}
            <Sigil size={150} />

            {/* 24の周波でととのえる */}
            <div style={{
              fontFamily:"'Zen Kaku Gothic New',sans-serif",
              fontSize:"22px", fontWeight:"900",
              color:"#ffffff",
              letterSpacing:"0.03em", marginTop:"14px",
              lineHeight:1.3,
              textShadow:"0 0 28px rgba(255,255,255,0.6), 0 0 56px rgba(255,255,255,0.3)",
            }}>２４の周波でととのえる</div>

            {/* 愛 */}
            <div style={{
              fontFamily:"'Zen Kaku Gothic New',sans-serif",
              fontSize:"80px", color:"#ffffff",
              marginTop:"24px", marginBottom:"24px",
              fontWeight:"900",
              letterSpacing:"0", lineHeight:1,
              animation:"aiPulse 5s infinite ease-in-out",
              textAlign:"center",
            }}>愛</div>

            {/* 区切り線 */}
            <div style={{
              width:"60px", height:"1px",
              background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)",
              margin:"0 auto 20px",
            }} />

            {/* 8の質問 */}
            <div style={{
              fontFamily:"'Zen Kaku Gothic New',sans-serif",
              fontSize:"18px", fontWeight:"900", color:"#ffffff",
              letterSpacing:"0.02em", lineHeight:1.4,
              textShadow:"0 0 22px rgba(255,255,255,0.32)",
              marginBottom:"8px", textAlign:"center",
            }}>８の質問にお答えください</div>

            {/* あなたのいまをととのえます */}
            <div style={{
              fontFamily:"'Zen Kaku Gothic New',sans-serif",
              fontSize:"16px", fontWeight:"700",
              color:"rgba(255,255,255,0.8)",
              letterSpacing:"0.02em", lineHeight:1.4,
              textShadow:"0 0 16px rgba(255,255,255,0.22)",
              marginBottom:"28px", textAlign:"center",
            }}>あなたのいまをととのえます</div>

            {/* ボタン */}
            <button className="go" onClick={() => setStep(1)} style={{ position:"relative" }}>
              いってらっしゃいまぺ
              <span style={{ position:"absolute", right:"28px", top:"50%", transform:"translateY(-50%)", fontSize:"24px", opacity:0.7 }}>›</span>
            </button>
            <div style={{
              fontFamily:"'Zen Kaku Gothic New',sans-serif",
              fontSize:"14px", fontWeight:"500",
              color:"rgba(255,255,255,0.35)", marginTop:"14px", letterSpacing:"0.1em",
            }}>タップして診断をはじめる</div>
          </div>
        )}

        {/* ====== 質問 ====== */}
        {step>=1 && step<=TOTAL && step!==99 && currentQ && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            {/* 進捗 */}
            <div style={{ marginBottom:"12px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px" }}>
                <span style={{
                  fontFamily:"'Zen Kaku Gothic New',sans-serif",
                  fontSize:"14px", fontWeight:"900", color:"#ffffff",
                  letterSpacing:"0.18em",
                  textShadow:"0 0 8px rgba(255,255,255,0.5)",
                }}>{String(step).padStart(2,"0")} / {String(TOTAL).padStart(2,"0")}</span>
                {currentQ.multi && (
                  <span style={{
                    fontFamily:"'Zen Kaku Gothic New',sans-serif",
                    fontSize:"12px", fontWeight:"700",
                    color:"rgba(255,255,255,0.65)",
                  }}>最大2つ選択</span>
                )}
              </div>
              <div style={{ height:"2px", background:"rgba(255,255,255,0.08)", borderRadius:"2px", position:"relative" }}>
                <div style={{
                  position:"absolute", top:0, left:0, height:"2px",
                  width:`${(step/TOTAL)*100}%`,
                  background:"linear-gradient(90deg,#ffffff,rgba(255,255,255,0.3))",
                  borderRadius:"2px",
                  boxShadow:"0 0 8px rgba(255,255,255,0.5)",
                  transition:"width 0.5s ease",
                }} />
              </div>
            </div>

            <h2 style={{
              fontFamily:"'Zen Kaku Gothic New',sans-serif",
              fontSize:"20px", fontWeight:"900", color:"#ffffff",
              letterSpacing:"0.03em", marginBottom:"3px", lineHeight:1.3,
              textShadow:"0 0 16px rgba(255,255,255,0.25)",
            }}>{currentQ.label}</h2>
            <p style={{
              fontFamily:"'Zen Kaku Gothic New',sans-serif",
              fontSize:"13px", fontWeight:"500",
              color:"rgba(255,255,255,0.6)",
              marginBottom:"10px", letterSpacing:"0.02em",
            }}>{currentQ.sub}</p>

            {currentQ.options.map((opt,i) => (
              <button key={i} className={`opt${selected.includes(opt.value)?" on":""}`}
                onClick={() => toggleOpt(opt.value)}>
                <span style={{
                  width:"24px", height:"24px", borderRadius:"50%", flexShrink:0,
                  border:`1.5px solid ${selected.includes(opt.value)?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.25)"}`,
                  background:selected.includes(opt.value)?"rgba(255,255,255,0.9)":"transparent",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"13px", color:"#02011a", fontWeight:"900",
                  transition:"all 0.2s", flexShrink:0,
                }}>{selected.includes(opt.value)&&"✓"}</span>
                {opt.label}
              </button>
            ))}

            <button className="go" onClick={handleNext} disabled={!selected.length}>
              {step===TOTAL ? "ぺぺぺの答え" : "次へ"}
            </button>
          </div>
        )}

        {/* ====== ローディング ====== */}
        {step===99 && (
          <div style={{ textAlign:"center", animation:"fadeUp 0.4s ease", paddingTop:"80px" }}>
            <div style={{ position:"relative", width:"120px", height:"120px", margin:"0 auto 36px" }}>
              <div style={{
                position:"absolute", inset:0, borderRadius:"50%",
                border:"1px solid rgba(255,255,255,0.15)",
                borderTop:"2px solid rgba(255,255,255,0.8)",
                animation:"spin 1.8s linear infinite",
              }} />
              <div style={{
                position:"absolute", inset:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Zen Kaku Gothic New',sans-serif",
                fontSize:"19px", fontWeight:"900", color:"#ffffff",
                letterSpacing:"0.28em", paddingRight:"0.28em",
                textShadow:"0 0 16px rgba(255,255,255,0.8)",
              }}>ぺぺぺ</div>
            </div>
            <div style={{ display:"flex", justifyContent:"center", alignItems:"flex-end", gap:"5px", height:"48px", marginBottom:"30px" }}>
              {[1,2,3,4,5,6,7,8,9].map(i => (
                <div key={i} style={{
                  width:"4px", height:"100%",
                  background:`rgba(255,255,255,${0.2+i*0.08})`,
                  borderRadius:"2px", transformOrigin:"bottom",
                  animation:`wave ${0.55+i*0.07}s ${i*0.08}s infinite ease-in-out`,
                }} />
              ))}
            </div>
            <p style={{
              fontFamily:"'Zen Kaku Gothic New',sans-serif",
              fontSize:"20px", fontWeight:"700", color:"#ffffff",
              letterSpacing:"0.15em",
              textShadow:"0 0 14px rgba(255,255,255,0.5)",
            }}>ぺぺぺが、見立てています</p>
            {debugMsg && (
              <p style={{
                fontFamily:"'Zen Kaku Gothic New',sans-serif",
                fontSize:"11px", color:"rgba(255,255,255,0.45)",
                marginTop:"16px", letterSpacing:"0.04em", lineHeight:1.6,
                padding:"0 16px", textAlign:"center",
              }}>{debugMsg}</p>
            )}
          </div>
        )}

        {/* ====== 結果 ====== */}
        {step===14 && result && (
          <div style={{ animation:"fadeUp 0.6s ease" }}>
            {/* 惑星 */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:"24px", height:"180px", alignItems:"center" }}>
              <div style={{
                width:"130px", height:"130px", borderRadius:"50%",
                background:`radial-gradient(circle at 35% 30%,${waveColor}ff,${waveColor}80 40%,${waveColor}40 70%,${waveColor}10 100%)`,
                "--gc":`${waveColor}50`,
                animation:"planetGlow 4s infinite ease-in-out",
                position:"relative",
              }}>
                <div style={{
                  position:"absolute", top:"50%", left:"50%",
                  width:"7px", height:"7px",
                  marginTop:"-3.5px", marginLeft:"-3.5px",
                  borderRadius:"50%", background:"#ffffff",
                  boxShadow:"0 0 8px #ffffff",
                  animation:"orbit 8s infinite linear",
                }} />
              </div>
            </div>

            {/* メッセージ */}
            <div style={{ textAlign:"center", marginBottom:"28px" }}>
              <p style={{
                fontFamily:"'Zen Kaku Gothic New',sans-serif",
                fontSize:"22px", fontWeight:"900", color:"#ffffff",
                letterSpacing:"0.05em", lineHeight:1.5,
                textShadow:`0 0 24px ${waveColor}50`,
              }}>"{result.message}"</p>
            </div>


            {/* バイノーラルビート */}
            <div style={{
              background:"rgba(255,255,255,0.05)",
              border:`1px solid ${playing ? waveColor+"50" : "rgba(255,255,255,0.10)"}`,
              borderRadius:"16px", padding:"22px 24px", marginBottom:"12px",
              transition:"border-color 0.4s",
            }}>
              <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"11px", fontWeight:"700", color:"rgba(220,230,250,0.6)", letterSpacing:"0.22em", marginBottom:"16px" }}>BINAURAL BEAT</div>
              <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"14px" }}>
                <button onClick={toggleAudio} style={{
                  width:"56px", height:"56px", borderRadius:"50%",
                  border:`1.5px solid ${waveColor}`,
                  background: playing ? `${waveColor}25` : "transparent",
                  color:waveColor, cursor:"pointer", fontSize:"20px",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  flexShrink:0, "--glow":`${waveColor}50`,
                  animation: playing ? "pulseRing 2s infinite" : "none",
                }}>{playing ? "⏹" : "▶"}</button>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"26px", fontWeight:"900", color:waveColor, letterSpacing:"0.04em", marginBottom:"3px" }}>{result.preciseBeatHz} Hz</div>
                  {result.targetSubBand && (
                    <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"14px", fontWeight:"700", color:waveColor, marginBottom:"2px" }}>{result.targetSubBand}（{result.targetSubBandRange}）誘導</div>
                  )}
                  <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"13px", fontWeight:"500", color:"rgba(220,230,250,0.6)" }}>{waveInfo[result.targetWave]?.full}（{waveInfo[result.targetWave]?.hz}）</div>
                </div>
                {playing && (
                  <div style={{ display:"flex", alignItems:"flex-end", gap:"3px", height:"24px" }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ width:"3px", height:"100%", background:waveColor, borderRadius:"2px", transformOrigin:"bottom", opacity:0.8, animation:`wave ${0.5+i*0.1}s ${i*0.1}s infinite ease-in-out` }} />
                    ))}
                  </div>
                )}
              </div>
              {result.solfeggioName && (
                <div style={{
                  background:`${waveColor}10`, border:`1px solid ${waveColor}25`,
                  borderRadius:"10px", padding:"12px 14px", marginBottom:"14px",
                }}>
                  <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"15px", fontWeight:"900", color:waveColor, marginBottom:"6px" }}>+ {result.solfeggioName} ソルフェジオ周波数</div>
                  <p style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"14px", fontWeight:"500", color:"rgba(255,255,255,0.8)", margin:0, lineHeight:1.75 }}>{result.solfeggioReason}</p>
                </div>
              )}
              <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"14px" }}>
                <span style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"15px", fontWeight:"500", color:"rgba(220,230,250,0.7)", flexShrink:0 }}>音量</span>
                <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e=>setVolume(parseFloat(e.target.value))} />
              </div>
              <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"10px", padding:"12px 14px" }}>
                <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"15px", fontWeight:"900", color:"#ffffff", marginBottom:"6px" }}>🎧 イヤホン推奨</div>
                <p style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"13px", fontWeight:"500", color:"rgba(200,215,240,0.75)", margin:0, lineHeight:1.75 }}>バイノーラルビートは左右の耳に異なる周波数を流すことで脳波誘導が起きる仕組みです。スピーカーでは効果が得られません。</p>
              </div>
            </div>


            {/* 現世御利益カード（ぺぺぺってナニ選択時） */}
            {(answers.q8 === "curiosity" || (Array.isArray(answers.q8) && answers.q8.includes("curiosity"))) && (
              <div style={{
                background:"rgba(255,216,128,0.08)",
                border:"1px solid rgba(255,216,128,0.4)",
                borderLeft:"4px solid #ffd880",
                borderRadius:"16px", padding:"22px 24px", marginBottom:"12px",
              }}>
                <div style={{
                  fontFamily:"'Zen Kaku Gothic New',sans-serif",
                  fontSize:"11px", fontWeight:"700",
                  color:"rgba(255,216,128,0.7)",
                  letterSpacing:"0.22em", marginBottom:"12px",
                }}>GENZE GORIYAKU</div>
                <div style={{
                  fontFamily:"'Zen Kaku Gothic New',sans-serif",
                  fontSize:"24px", fontWeight:"900",
                  color:"#ffd880",
                  marginBottom:"14px", letterSpacing:"0.1em",
                  textShadow:"0 0 16px rgba(255,216,128,0.6)",
                }}>現世御利益</div>
                <p style={{
                  fontFamily:"'Zen Kaku Gothic New',sans-serif",
                  fontSize:"16px", fontWeight:"500",
                  color:"#ffffff", lineHeight:"1.9", margin:"0 0 12px",
                }}>ぺぺぺとは、宇宙の鼓動と脳波が響き合う瞬間に生まれる「整えの力」です。</p>
                <p style={{
                  fontFamily:"'Zen Kaku Gothic New',sans-serif",
                  fontSize:"16px", fontWeight:"500",
                  color:"#ffffff", lineHeight:"1.9", margin:"0 0 12px",
                }}>古来より「ぺ」の音は、詰まったエネルギーを解放し、新しい流れを呼び込む音とされてきました。三つ重ねることで、過去・現在・未来の三軸が同時に整います。</p>
                <p style={{
                  fontFamily:"'Zen Kaku Gothic New',sans-serif",
                  fontSize:"16px", fontWeight:"500",
                  color:"#ffffff", lineHeight:"1.9", margin:"0 0 16px",
                }}>あなたが「ぺぺぺってナニ」と問うたこと、それ自体がすでに現世御利益の始まりです。</p>
                <div style={{
                  background:"rgba(255,216,128,0.1)",
                  border:"1px solid rgba(255,216,128,0.25)",
                  borderRadius:"12px", padding:"14px 16px",
                  fontFamily:"'Zen Kaku Gothic New',sans-serif",
                  fontSize:"15px", fontWeight:"700",
                  color:"#ffd880", lineHeight:1.7, letterSpacing:"0.05em",
                  textAlign:"center",
                }}>ぺぺぺは、あなたのいまを整える。それだけです。</div>
              </div>
            )}

            {/* 現在の脳波 */}
            <div style={{
              background:"rgba(255,255,255,0.05)",
              border:`1px solid ${domColor}35`,
              borderLeft:`4px solid ${domColor}`,
              borderRadius:"16px", padding:"22px 24px", marginBottom:"12px",
            }}>
              <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"11px", fontWeight:"700", color:"rgba(220,230,250,0.6)", letterSpacing:"0.22em", marginBottom:"10px" }}>CURRENT STATE</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:"12px", marginBottom:"10px", flexWrap:"wrap" }}>
                <span style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"34px", fontWeight:"900", color:domColor, textShadow:`0 0 18px ${domColor}60` }}>{waveInfo[result.dominantWave]?.name}</span>
                <span style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"24px", fontWeight:"900", color:domColor }}>{result.preciseDominantHz} Hz</span>
              </div>
              {result.dominantSubBand && (
                <div style={{
                  display:"inline-block",
                  background:`${domColor}20`, border:`1px solid ${domColor}50`,
                  borderRadius:"20px", padding:"5px 14px", marginBottom:"12px",
                  fontFamily:"'Zen Kaku Gothic New',sans-serif",
                  fontSize:"14px", fontWeight:"900", color:domColor,
                }}>{result.dominantSubBand}（{result.dominantSubBandRange}）</div>
              )}
              {result.dominantCharacter && (
                <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"16px", fontWeight:"700", color:"#ffffff", marginBottom:"10px", lineHeight:1.7 }}>{result.dominantCharacter}</div>
              )}
              <p style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"16px", fontWeight:"500", color:"#ffffff", lineHeight:"1.85", margin:0 }}>{result.waveReason}</p>
            </div>

            {/* 段階的誘導 */}
            {result.step1Hz && (
              <div style={{
                background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.12)",
                borderRadius:"16px", padding:"20px 24px", marginBottom:"12px",
              }}>
                <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"11px", fontWeight:"700", color:"rgba(220,230,250,0.6)", letterSpacing:"0.22em", marginBottom:"16px" }}>STEP-DOWN PROTOCOL</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"8px" }}>
                  {[
                    { hz:result.preciseDominantHz, label:"現在", color:domColor },
                    { hz:result.step1Hz,           label:"STEP 1", color:"#e0a860" },
                    { hz:result.step2Hz,           label:"STEP 2", color:"#c0d860" },
                    { hz:result.step3Hz,           label:"目標",   color:waveColor },
                  ].map((s,i,arr) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.5)", marginBottom:"4px" }}>{s.label}</div>
                        <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"20px", fontWeight:"900", color:s.color, textShadow:`0 0 10px ${s.color}60` }}>{s.hz} Hz</div>
                      </div>
                      {i<arr.length-1 && <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"18px", marginTop:"14px" }}>→</div>}
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"14px", fontWeight:"500", color:"rgba(255,255,255,0.6)", marginTop:"14px", letterSpacing:"0.02em" }}>各ステップ約10分ずつ。合計30分で目標Hz帯域に誘導します。</div>
              </div>
            )}
            {/* なぜこの周波数 */}
            {(result.whyThisFrequency||result.expectedChanges||result.subjectiveFeeling) && (
              <div style={{
                background:"rgba(255,255,255,0.05)",
                border:`1px solid ${waveColor}25`,
                borderRadius:"16px", padding:"22px 24px", marginBottom:"12px",
              }}>
                <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"11px", fontWeight:"700", color:"rgba(220,230,250,0.6)", letterSpacing:"0.22em", marginBottom:"16px" }}>WHY THIS FREQUENCY</div>
                {result.whyThisFrequency && (
                  <div style={{ marginBottom:"20px" }}>
                    <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"16px", fontWeight:"900", color:waveColor, marginBottom:"8px" }}>なぜ {result.preciseBeatHz} Hz なのか</div>
                    <p style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"15px", fontWeight:"500", color:"#ffffff", lineHeight:"1.85", margin:0 }}>{result.whyThisFrequency}</p>
                  </div>
                )}
                {result.expectedChanges && (
                  <div style={{ marginBottom:result.subjectiveFeeling?"20px":0 }}>
                    <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"16px", fontWeight:"900", color:waveColor, marginBottom:"8px" }}>体内で起きる変化</div>
                    <p style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"15px", fontWeight:"500", color:"#ffffff", lineHeight:"1.85", margin:0 }}>{result.expectedChanges}</p>
                  </div>
                )}
                {result.subjectiveFeeling && (
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px", flexWrap:"wrap" }}>
                      <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"16px", fontWeight:"900", color:waveColor }}>主観的に感じられる変化</div>
                      {result.timeToEffect && (
                        <span style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"12px", fontWeight:"700", color:waveColor, background:`${waveColor}20`, border:`1px solid ${waveColor}40`, borderRadius:"12px", padding:"3px 10px" }}>効果まで {result.timeToEffect}</span>
                      )}
                    </div>
                    <p style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"15px", fontWeight:"500", color:"#ffffff", lineHeight:"1.85", margin:0 }}>{result.subjectiveFeeling}</p>
                  </div>
                )}
              </div>
            )}

            {/* 調整プロトコル */}
            <div style={{
              background:"rgba(255,255,255,0.05)",
              border:"1px solid rgba(255,255,255,0.10)",
              borderRadius:"16px", padding:"22px 24px", marginBottom:"16px",
            }}>
              <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"11px", fontWeight:"700", color:"rgba(220,230,250,0.6)", letterSpacing:"0.22em", marginBottom:"6px" }}>PROTOCOL</div>
              <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"15px", fontWeight:"700", color:"rgba(220,230,250,0.8)", marginBottom:"20px" }}>{waveInfo[result.dominantWave]?.name}（{result.preciseDominantHz} Hz）から {waveInfo[result.targetWave]?.name}（{result.preciseTargetHz} Hz）へ</div>
              {[
                {icon:"∿", label:"周波数", value:result.frequency},
                {icon:"♪", label:"音",    value:result.sound},
                {icon:"○", label:"呼吸",  value:result.breathing},
                {icon:"☀", label:"光",    value:result.light},
                {icon:"→", label:"動き",  value:result.movement},
              ].map((item,i,arr) => (
                <div key={i} style={{
                  display:"flex", gap:"18px", alignItems:"flex-start",
                  paddingBottom:i<arr.length-1?"16px":0,
                  marginBottom:i<arr.length-1?"16px":0,
                  borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.08)":"none",
                }}>
                  <span style={{ color:"rgba(255,255,255,0.7)", width:"20px", flexShrink:0, fontSize:"18px", marginTop:"2px" }}>{item.icon}</span>
                  <div>
                    <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"13px", fontWeight:"700", color:"rgba(220,230,250,0.5)", letterSpacing:"0.15em", marginBottom:"5px" }}>{item.label}</div>
                    <div style={{ fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"17px", fontWeight:"500", color:"#ffffff", lineHeight:1.6 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign:"center", marginBottom:"16px", fontFamily:"'Zen Kaku Gothic New',sans-serif", fontSize:"14px", fontWeight:"700", color:"rgba(220,230,250,0.35)", letterSpacing:"0.6em" }}>ぺ ぺ ぺ</div>
            <button onClick={reset} className="sub-btn">ぺぺぺのTOPへ</button>
          </div>
        )}
      </div>
    </div>
  );
}
