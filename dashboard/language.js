const messages = {
  "Launch Atlas": "项目研究图谱",
  "LAUNCH": "项目",
  "ATLAS": "图谱",
  "RESEARCH WORKSPACE": "研究工作台",
  "◎   Protocol universe": "◎ 协议总览",
  "◉   Launch watchlist": "◉ 发行观察名单",
  "⌘   Method & sources": "⌘ 方法与来源",
  "SEALED SNAPSHOT": "固定数据快照",
  "Offline · Reproducible · No wallet": "离线运行 · 可复现 · 无需钱包",
  "ONCHAIN RESEARCH / PROTOCOL VALUATION": "链上研究 / 协议估值",
  "See the signal.": "观察数据。",
  "Understand the assumptions.": "理解估值假设。",
  "ILLUSTRATIVE MODEL": "示例模型",
  "Not a launch forecast": "不预测代币发行",
  "All categories": "全部类别",
  "All token stages": "全部代币状态",
  "No token recorded": "未收录代币",
  "Token recorded": "已收录代币",
  "Watchlist only": "仅显示观察名单",
  "Protocol universe": "协议总览",
  "Ranked by implied capitalization · click a row to inspect": "按隐含市值排序 · 点击查看详情",
  "RANK": "排名",
  "PROTOCOL": "协议",
  "TVL": "锁仓总额",
  "7D CHANGE": "7 日变化",
  "IMPLIED VALUE": "隐含市值",
  "PEER EVIDENCE": "同类参考",
  "TOKEN RECORD": "代币记录",
  "Show more protocols": "显示更多协议",
  "A protocol with no token recorded may still have one. Estimates do not predict token issuance, allocations, farming rewards or investment returns.": "未收录代币的协议可能已有代币。估值无法预测发行、分配、活动奖励或投资收益。",
  "Search protocols, categories or chains…": "搜索协议、类别或区块链…",
  "Close details": "关闭详情",
  "PROTOCOLS": "协议总数",
  "Ranked from the sealed snapshot": "根据固定快照排序",
  "LAUNCH WATCHLIST": "发行观察名单",
  "No token recorded · eligible universe": "未收录代币 · 观察范围",
  "PRICED COMPARABLES": "有市值的同类协议",
  "Observed capitalization / TVL ratios": "观测市值 / 锁仓总额",
  "GLOBAL PEER MEDIAN": "全局同类倍数中位数",
  "Reference across all priced peers": "根据全部有市值的同类协议计算",
  "Uncategorized": "未分类",
  "Lending": "借贷",
  "DEX": "去中心化交易所",
  "Application": "应用",
  "Moderate": "中等",
  "Limited": "有限",
  "Synthetic demo data": "模拟示例数据",
  "Demo Network": "示例网络",
  "PROTOCOL RESEARCH": "协议研究",
  "Illustrative implied capitalization, ranked #": "示例隐含市值，排名第 ",
  "Peer-dispersion range:": "同类估值区间：",
  "These endpoints are scenarios, not calibrated confidence bounds.": "区间端点是估值情景，未经统计校准。",
  "MULTIPLE": "倍数",
  "PRICED PEERS": "有市值的同类协议",
  "EVIDENCE": "证据",
  "How the estimate was formed": "估值方法",
  "Closest peers by TVL:": "按锁仓总额查找的最近同类协议：",
  "No peer examples": "暂无同类示例",
  "Eligibility research & activity plan": "资格查询与活动核对",
  "Source & limitations": "数据来源与局限",
  "Snapshot as of": "快照时间",
  "TVL is not revenue; observed market cap is not FDV. Missing token identifiers do not establish token absence or a future airdrop.": "锁仓总额不同于收入，观测市值也不同于完全稀释估值。缺少代币标识无法证明尚无代币或未来会有空投。",
  " peers": " 个同类协议",
  " evidence": "证据",
  " results": " 条结果",
  "MODEL CARD": "模型概况",
  "Transparent by construction.": "模型构成与假设",
  "Reproducible inputs": "可复现输入",
  "As of": "截至",
  "What this model cannot tell you": "模型局限",
  "Revenue, fee distribution, token supply, unlocks, exploit history, team quality, campaign rules and wallet eligibility are absent from the snapshot. This model cannot establish a token launch or expected rewards. The activity plans begin with verification and read-only previews.": "快照不包含收入、费用分配、代币供应和解锁安排、安全事件、团队质量、活动规则或钱包资格。模型无法判断代币是否会发行或预计能获得多少奖励。活动核对从验证来源和只读预览开始。"
};
const storageKey = "makefun-launch-atlas.language";
let currentLanguage = 'zh';
try { if (localStorage.getItem(storageKey) === 'en') currentLanguage = 'en'; } catch {}
window.uiLanguage = currentLanguage;
window.t = text => window.uiLanguage === 'zh' && Object.hasOwn(messages, text) ? messages[text] : text;
const original = [];
const title = document.title;
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
for (let node; (node = walker.nextNode());) {
  if (node.parentElement.closest('script, style, #language')) continue;
  if (Object.hasOwn(messages, node.nodeValue.trim())) original.push([node, node.nodeValue]);
}
const attributes = [...document.querySelectorAll('[aria-label], [placeholder], [title]')].flatMap(el =>
  ['aria-label', 'placeholder', 'title'].filter(name => el.hasAttribute(name)).map(name => [el, name, el.getAttribute(name)]));
const language = document.getElementById('language');
function refresh() {
  document.documentElement.lang = window.uiLanguage === 'zh' ? 'zh-CN' : 'en';
  document.title = t(title);
  language.value = window.uiLanguage;
  for (const [node, text] of original) {
    node.nodeValue = text.replace(text.trim(), t(text.trim()));
  }
  for (const [el, name, value] of attributes) el.setAttribute(name, t(value));
}
language.addEventListener('change', () => {
  window.uiLanguage = language.value === 'en' ? 'en' : 'zh';
  try { localStorage.setItem(storageKey, window.uiLanguage); } catch {}
  refresh();
  window.dispatchEvent(new Event('ui-language-change'));
});
refresh();
