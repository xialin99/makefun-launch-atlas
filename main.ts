import {readFileSync,writeFileSync,mkdirSync,cpSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildDossier} from './vendor/makefun-board.ts';
const here=fileURLToPath(new URL('.',import.meta.url));
const arg=(name:string,otherwise:string)=>{const n=process.argv.indexOf('--'+name);return n<0?otherwise:process.argv[n+1]};
const source=arg('input',process.env.MAKEFUN_INPUT_DIR??'/input');
const input=JSON.parse(readFileSync(source.endsWith('.json')?source:join(source,'snapshot.json'),'utf8'));
const out=arg('output',process.env.MAKEFUN_OUTPUT_DIR??'/output');mkdirSync(out,{recursive:true});
const median=(xs:number[])=>{const a=[...xs].sort((a,b)=>a-b);return a.length?a[Math.floor(a.length/2)]:1};
const quantile=(xs:number[],q:number)=>{const a=[...xs].sort((a,b)=>a-b);return a[Math.min(a.length-1,Math.floor(q*a.length))]};
const peers=input.protocols.filter((p:any)=>p.mcap_usd>0&&p.tvl_usd>0).map((p:any)=>({...p,multiple:p.mcap_usd/p.tvl_usd})).filter((p:any)=>p.multiple>=.01&&p.multiple<=50);
const global=median(peers.map((p:any)=>p.multiple));
const watch=new Set(input.watchlist);
const rows=input.protocols.filter((p:any)=>p.tvl_usd>0).map((p:any)=>{
 const sector=peers.filter((a:any)=>a.category===p.category&&a.slug!==p.slug),n=sector.length;
 const category=median(sector.map((a:any)=>a.multiple));
 const shrink=n/(n+8),multiple=Math.exp(shrink*Math.log(category)+(1-shrink)*Math.log(global));
 const growth=Math.max(-50,Math.min(50,p.change_7d??0));
 const growthFactor=Math.exp(growth*.003),estimate=Math.round(Math.min(1e14,Math.max(1,p.tvl_usd*multiple*growthFactor)));
 const dispersion=sector.length>=4?Math.max(.5,Math.log(quantile(sector.map((a:any)=>a.multiple),.75)/quantile(sector.map((a:any)=>a.multiple),.25))):1.2;
 const early=!p.gecko_id&&!p.symbol;
 const route=/lend|cdp/i.test(p.category??'')?'lending':/dex|derivative|option/i.test(p.category??'')?'trading':'application';
 const steps=[
  `Locate ${p.name}'s official application from its verified project profile; confirm the network (${p.chains.slice(0,4).join(', ')||'not supplied'}) and contract addresses before connecting a wallet.`,
  `Check whether ${p.name} currently publishes an official points or eligibility program. This snapshot records ${early?'no token identifier':'an existing token identifier'}; it cannot establish a future token or reward.`,
  route==='lending'?`In the official lending interface, preview a minimal supply and withdrawal without submitting either. Record the asset, utilization, withdrawal constraints, liquidation rules and every fee before considering capital.`:route==='trading'?`In the official trading interface, preview one small swap or order without submitting it. Record price impact, trading fees, approvals, position exposure and the exact network cost.`:`Open the official application's onboarding guide and identify one genuine product action. Use a read-only preview or test network first; record permissions, fees and exit conditions.`,
  `Maintain a dated activity journal for ${p.name}: official campaign rules, supported chain, transaction purpose, quoted fees and withdrawal route. Recheck the official eligibility criteria before any future activity.`,
  `Compare total cost and capital risk with a zero-reward outcome. Do not treat the model's implied value as a token allocation, a personal payout estimate or evidence that farming will be rewarded.`
 ];
 return {...p,rank:0,implied_value_usd:estimate,farm_steps:steps,watchlist:watch.has(p.slug),stage:early?'No token recorded':'Token recorded',multiple,peer_count:n,peer_names:sector.slice(0,8).map((a:any)=>a.name),growth_factor:growthFactor,value_low:Math.round(estimate*Math.exp(-dispersion)),value_high:Math.round(estimate*Math.exp(dispersion)),confidence:n>=12?'Moderate':n>=4?'Limited':'Low',explanation:`TVL × sector-adjusted market-cap/TVL multiple × bounded 7-day growth factor. ${n} sector peers; shrinkage weight ${Math.round(shrink*100)}%. This is an illustrative capitalization estimate, not FDV or a token-launch prediction.`};
}).sort((a:any,b:any)=>b.implied_value_usd-a.implied_value_usd||a.slug.localeCompare(b.slug));
rows.forEach((r:any,i:number)=>r.rank=i+1);
const metadata={as_of:input.as_of,source:input.source,watchlist_count:input.watchlist.length,global_multiple:global,peer_count:peers.length,model:'Sector-comparable market capitalization / TVL with log-space shrinkage (8 global pseudo-peers), bounded ±50% weekly TVL growth adjustment. Ranges reflect peer dispersion, not calibrated probabilities.',rows};
writeFileSync(join(out,'board.json'),JSON.stringify({rows})+'\n');
writeFileSync(join(out,'data.js'),'window.RADAR='+JSON.stringify(metadata).replace(/</g,'\\u003c')+';\n');
cpSync(join(here,'dashboard'),join(out,'dashboard'),{recursive:true});
if(!existsSync(join(here,'screenshots/01-board.png'))){console.log(`Board ready: ${rows.length} protocols, ${input.watchlist.length} watchlist subjects. Dossier awaits three real browser screenshots.`);process.exit(0)}
cpSync(join(here,'screenshots'),join(out,'screenshots'),{recursive:true});
writeFileSync(join(out,'dossier.json'),buildDossier(out,{text_max_bytes:65536,screenshots:{max:4,max_bytes:524288},dashboard:{max_files:400,max_bytes:4194304}}));

