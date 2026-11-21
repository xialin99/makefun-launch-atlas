const validationMessages = {
  "snapshot must be an object": "快照必须是对象",
  "snapshot date is missing": "缺少快照日期",
  "snapshot date is invalid": "快照日期无效",
  "source attribution is missing": "缺少数据来源",
  "protocols must be an array": "protocols 必须是数组",
  "watchlist must be an array": "watchlist 必须是数组",
  "snapshot contains no protocols": "快照不包含任何协议",
  "invalid protocol record": "协议记录无效",
  "protocol slug is missing": "缺少协议标识",
  "duplicate protocol: ": "协议标识重复：",
  "name is missing for ": "缺少名称：",
  "invalid TVL for ": "锁仓总额无效：",
  "invalid market capitalization for ": "市值无效：",
  "invalid weekly change for ": "一周变化值无效：",
  "missing chain list for ": "缺少区块链列表：",
  "invalid chain name for ": "区块链名称无效：",
  "invalid category for ": "类别无效：",
  "unknown watchlist protocol: ": "观察名单中有未知协议：",
  "duplicate watchlist protocol: ": "观察名单重复记录：",
  "board must be an array": "看板必须是数组",
  "board needs 100 to 4000 rows": "看板需要 100 至 4000 条记录",
  "invalid board row": "看板记录无效",
  "invented protocol: ": "快照中不存在此协议：",
  "repeated board protocol: ": "看板中有重复协议：",
  "ranks must be consecutive and ordered": "排名必须按顺序连续排列",
  "board row name is missing": "看板记录缺少名称",
  "estimate must be a positive safe integer for ": "估值必须是安全范围内的正整数：",
  "estimate exceeds the cap": "估值超过上限",
  "board is not sorted by implied value": "看板未按隐含市值排序",
  "research steps must be an array": "研究步骤必须是数组",
  "invalid step count": "研究步骤数量无效",
  "research step must be text": "研究步骤必须是文字",
  "invalid step length": "研究步骤长度无效",
  "invalid peer evidence count for ": "同类参考数量无效：",
  "invalid valuation multiple": "估值倍数无效",
  "scenario low exceeds central estimate": "情景低值高于中心估值",
  "scenario high is below central estimate": "情景高值低于中心估值",
  "all estimates are identical": "所有估值完全相同",
  "watchlist protocol omitted: ": "缺少观察名单中的协议："
};

function requireValue(condition, message, subject = '') {
  if (condition) return;
  const english = process.env.MAKEFUN_UI_LANG === 'en';
  const detail = english ? message : validationMessages[message] ?? message;
  throw new Error((english ? 'Radar validation: ' : '快照校验：') + detail + subject);
}

function finiteNonnegative(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function nonemptyText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateSnapshot(snapshot) {
  requireValue(snapshot && typeof snapshot === 'object', 'snapshot must be an object');
  requireValue(nonemptyText(snapshot.as_of), 'snapshot date is missing');
  requireValue(Number.isFinite(Date.parse(snapshot.as_of)), 'snapshot date is invalid');
  requireValue(nonemptyText(snapshot.source), 'source attribution is missing');
  requireValue(Array.isArray(snapshot.protocols), 'protocols must be an array');
  requireValue(Array.isArray(snapshot.watchlist), 'watchlist must be an array');
  requireValue(snapshot.protocols.length > 0, 'snapshot contains no protocols');
  const slugs = new Set();

  for (const protocol of snapshot.protocols) {
    requireValue(protocol && typeof protocol === 'object', 'invalid protocol record');
    requireValue(nonemptyText(protocol.slug), 'protocol slug is missing');
    requireValue(!slugs.has(protocol.slug), 'duplicate protocol: ', protocol.slug);
    slugs.add(protocol.slug);
    requireValue(nonemptyText(protocol.name), 'name is missing for ', protocol.slug);
    requireValue(finiteNonnegative(protocol.tvl_usd), 'invalid TVL for ', protocol.slug);
    requireValue(
      protocol.mcap_usd === null || protocol.mcap_usd === -1 || finiteNonnegative(protocol.mcap_usd),
      'invalid market capitalization for ', protocol.slug,
    );
    requireValue(
      protocol.change_7d === null || Number.isFinite(protocol.change_7d),
      'invalid weekly change for ', protocol.slug,
    );
    requireValue(Array.isArray(protocol.chains), 'missing chain list for ', protocol.slug);
    requireValue(protocol.chains.every(nonemptyText), 'invalid chain name for ', protocol.slug);
    requireValue(
      protocol.category === null || nonemptyText(protocol.category),
      'invalid category for ', protocol.slug,
    );
  }

  const watched = new Set();
  for (const slug of snapshot.watchlist) {
    requireValue(slugs.has(slug), 'unknown watchlist protocol: ', slug);
    requireValue(!watched.has(slug), 'duplicate watchlist protocol: ', slug);
    watched.add(slug);
  }
  return snapshot;
}

export function validateBoard(rows, snapshot) {
  requireValue(Array.isArray(rows), 'board must be an array');
  requireValue(rows.length >= 100 && rows.length <= 4000, 'board needs 100 to 4000 rows');
  const known = new Set(snapshot.protocols.map(protocol => protocol.slug));
  const present = new Set();
  let previous = Infinity;

  rows.forEach((row, index) => {
    requireValue(row && typeof row === 'object', 'invalid board row');
    requireValue(known.has(row.slug), 'invented protocol: ', row.slug);
    requireValue(!present.has(row.slug), 'repeated board protocol: ', row.slug);
    present.add(row.slug);
    requireValue(row.rank === index + 1, 'ranks must be consecutive and ordered');
    requireValue(nonemptyText(row.name), 'board row name is missing');
    requireValue(
      Number.isSafeInteger(row.implied_value_usd) && row.implied_value_usd > 0,
      'estimate must be a positive safe integer for ', row.slug,
    );
    requireValue(row.implied_value_usd <= 100000000000000, 'estimate exceeds the cap');
    requireValue(row.implied_value_usd <= previous, 'board is not sorted by implied value');
    previous = row.implied_value_usd;
    requireValue(Array.isArray(row.farm_steps), 'research steps must be an array');
    requireValue(row.farm_steps.length >= 3 && row.farm_steps.length <= 12, 'invalid step count');
    for (const step of row.farm_steps) {
      requireValue(typeof step === 'string', 'research step must be text');
      requireValue(step.trim().length >= 20 && step.trim().length <= 600, 'invalid step length');
    }
    requireValue(
      Number.isSafeInteger(row.peer_count) && row.peer_count >= 0,
      'invalid peer evidence count for ', row.slug,
    );
    requireValue(Number.isFinite(row.multiple) && row.multiple > 0, 'invalid valuation multiple');
    requireValue(row.value_low <= row.implied_value_usd, 'scenario low exceeds central estimate');
    requireValue(row.value_high >= row.implied_value_usd, 'scenario high is below central estimate');
  });

  requireValue(new Set(rows.map(row => row.implied_value_usd)).size > 1, 'all estimates are identical');
  for (const slug of snapshot.watchlist) {
    requireValue(present.has(slug), 'watchlist protocol omitted: ', slug);
  }
  return rows;
}
