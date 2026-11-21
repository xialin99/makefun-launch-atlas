import {readFileSync,writeFileSync,mkdirSync,cpSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildDossier} from './vendor/makefun-board.ts';
import {validateSnapshot,validateBoard} from './validate.mjs';
const here=fileURLToPath(new URL('.',import.meta.url));
const arg=(name:string,otherwise:string)=>{const n=process.argv.indexOf('--'+name);return n<0?otherwise:process.argv[n+1]};
const source=arg('input',process.env.MAKEFUN_INPUT_DIR??'/input');
const input=JSON.parse(readFileSync(source.endsWith('.json')?source:join(source,'snapshot.json'),'utf8'));
validateSnapshot(input);
const out=arg('output',process.env.MAKEFUN_OUTPUT_DIR??'/output');mkdirSync(out,{recursive:true});
const median=(xs:number[])=>{const a=[...xs].sort((a,b)=>a-b);return a.length?a[Math.floor(a.length/2)]:1};
const quantile=(xs:number[],q:number)=>{const a=[...xs].sort((a,b)=>a-b);return a[Math.min(a.length-1,Math.floor(q*a.length))]};
type Peer = {
 slug: string;
 name: string;
 multiple: number;
 logTvl: number;
 logMultiple: number;
};

const peers: Peer[] = [];
for (const protocol of input.protocols) {
 if (!(protocol.mcap_usd > 0 && protocol.tvl_usd > 0)) continue;
 const multiple = protocol.mcap_usd / protocol.tvl_usd;
 if (multiple < 0.01 || multiple > 50) continue;
 peers.push({
  slug: protocol.slug,
  name: protocol.name,
  multiple,
  logTvl: Math.log(protocol.tvl_usd),
  logMultiple: Math.log(multiple),
 });
}
const global = median(peers.map(peer => peer.multiple));

function fitSizeCurve(reference: Peer[]) {
 if (reference.length === 0) {
  return { slope: 0, intercept: Math.log(global), low: 0, high: 0 };
 }
 const slopes: number[] = [];
 for (const [index, lower] of reference.entries()) {
  for (let next = index + 1; next < reference.length; next++) {
   const upper = reference[next];
   const logTvlDifference = upper.logTvl - lower.logTvl;
   if (Math.abs(logTvlDifference) < 1) continue;
   slopes.push((upper.logMultiple - lower.logMultiple) / logTvlDifference);
  }
 }
 const slope = slopes.length ? median(slopes) : 0;
 const intercept = median(reference.map(peer => peer.logMultiple - slope * peer.logTvl));
 const residuals = reference.map(peer => peer.logMultiple - intercept - slope * peer.logTvl);
 return {
  slope,
  intercept,
  low: Math.min(0, quantile(residuals, 0.1)),
  high: Math.max(0, quantile(residuals, 0.9)),
 };
}
const fullFit=fitSizeCurve(peers);
const observedSlugs=new Set(peers.map((p:any)=>p.slug));
const watch=new Set(input.watchlist);
const rows=input.protocols.filter((p:any)=>p.tvl_usd>0).map((p:any)=>{
 const reference=observedSlugs.has(p.slug)?peers.filter((peer:any)=>peer.slug!==p.slug):peers;
 const fit=reference===peers?fullFit:fitSizeCurve(reference);
 const n=reference.length,logScale=Math.log(p.tvl_usd);
 const multiple=Math.exp(fit.intercept+fit.slope*logScale);
 const dollars=(logAdjustment:number)=>Math.round(Math.min(1e14,Math.max(1,p.tvl_usd*multiple*Math.exp(logAdjustment))));
 const estimate=dollars(0);
 const early=!p.gecko_id&&!p.symbol;
 const route=/lend|cdp/i.test(p.category??'')?'lending':/dex|derivative|option/i.test(p.category??'')?'trading':'application';
 const steps=[
  `Locate ${p.name}'s official application from its verified project profile; confirm the network (${p.chains.slice(0,4).join(', ')||'not supplied'}) and contract addresses before connecting a wallet.`,
  `Check whether ${p.name} currently publishes an official points or eligibility program. This snapshot records ${early?'no token identifier':'an existing token identifier'}; it cannot establish a future token or reward.`,
  route==='lending'?`In the official lending interface, preview a minimal supply and withdrawal without submitting either. Record the asset, utilization, withdrawal constraints, liquidation rules and every fee before considering capital.`:route==='trading'?`In the official trading interface, preview one small swap or order without submitting it. Record price impact, trading fees, approvals, position exposure and the exact network cost.`:`Open the official application's onboarding guide and identify one genuine product action. Use a read-only preview or test network first; record permissions, fees and exit conditions.`,
  `Maintain a dated activity journal for ${p.name}: official campaign rules, supported chain, transaction purpose, quoted fees and withdrawal route. Recheck the official eligibility criteria before any future activity.`,
  `Compare total cost and capital risk with a zero-reward outcome. Do not treat the model's implied value as a token allocation, a personal payout estimate or evidence that farming will be rewarded.`
 ];
 return {...p,rank:0,implied_value_usd:estimate,farm_steps:steps,watchlist:watch.has(p.slug),stage:early?'No token recorded':'Token recorded',multiple,peer_count:n,peer_names:[...reference].sort((a:any,b:any)=>Math.abs(a.logTvl-logScale)-Math.abs(b.logTvl-logScale)).slice(0,8).map((peer:any)=>peer.name),value_low:dollars(fit.low),value_high:dollars(fit.high),confidence:n>=50?'Moderate':'Limited',explanation:`TVL × the market-cap/TVL multiple fitted at this scale from ${n} tokenized peers. The central fit uses median pairwise slopes in log space. The range applies the 10th and 90th percentiles of observed peer residuals.`};
}).sort((a:any,b:any)=>b.implied_value_usd-a.implied_value_usd||a.slug.localeCompare(b.slug));
rows.forEach((r:any,i:number)=>r.rank=i+1);
validateBoard(rows,input);
const metadata={as_of:input.as_of,source:input.source,watchlist_count:input.watchlist.length,global_multiple:global,peer_count:peers.length,model:'Robust log-scale fit of observed market capitalization / TVL versus TVL. Scenarios use the central 80% of peer residuals.',rows};
writeFileSync(join(out,'board.json'),JSON.stringify({rows})+'\n');
writeFileSync(join(out,'data.js'),'window.RADAR='+JSON.stringify(metadata).replace(/</g,'\\u003c')+';\n');
cpSync(join(here,'dashboard'),join(out,'dashboard'),{recursive:true});
if(process.argv.includes('--preview')){
 console.log((process.env.MAKEFUN_UI_LANG==='en'?'Preview ready: ':'看板已生成：')+join(out,'dashboard','index.html'));
}else{
 const requiredScreenshots=['01-board.jpg','02-watchlist.jpg','03-detail.jpg'];
 if(requiredScreenshots.some(name=>!existsSync(join(here,'screenshots',name))))throw new Error('The dossier needs captures of the board, watchlist, and protocol detail.');
 cpSync(join(here,'screenshots'),join(out,'screenshots'),{recursive:true});
 writeFileSync(join(out,'dossier.json'),buildDossier(out,{text_max_bytes:65536,screenshots:{max:4,max_bytes:524288},dashboard:{max_files:400,max_bytes:4194304}}));
}
