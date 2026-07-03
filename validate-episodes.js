// 湾区罗盘 64 副本数据验证脚本
// 检查 intro 字数、scenes 题数、options 数、feedback 字数、insight 字数

import { readFileSync } from 'fs';

const NODE = '/Users/zhangzihang/.nvm/versions/node/v24.14.0/bin/node';
const content = readFileSync('/Users/zhangzihang/Documents/深圳罗盘/湾区罗盘/src/data/episodes.js', 'utf8');

// 所有 64 个副本 ID
const ALL_IDS = [
  'P01','P02',
  'M01','M02','M03','M04','M05','M06','M07','M08','M09','M10','M11','M12',
  'N-NA01','N-NA02','N-NA03','N-NA04','N-NA05','N-NA06','N-NA07','N-NA08','N-NA09','N-NA10',
  'N-AW01','N-AW02','N-AW03','N-AW04','N-AW05','N-AW06','N-AW07','N-AW08','N-AW09','N-AW10',
  'N-SC01','N-SC02','N-SC03','N-SC04','N-SC05','N-SC06','N-SC07','N-SC08','N-SC09','N-SC10',
  'N-CV01','N-CV02','N-CV03','N-CV04','N-CV05','N-CV06','N-CV07','N-CV08','N-CV09','N-CV10',
  'N-EG01','N-EG02','N-EG03','N-EG04','N-EG05','N-EG06','N-EG07','N-EG08','N-EG09','N-EG10'
];

const RPG_IDS = ['M01','M03','M06','M07','M08','M11','N-AW04','N-EG02','N-EG10','N-SC02','N-SC03'];

// 禁用套话列表
const BANNED_PHRASES = ['复盘方法', '带走判断', '价值升华'];

function extractEpisodeBlock(id) {
  // Try both quoted and unquoted patterns
  const patterns = [`${id}: {`, `'${id}': {`];
  for (const p of patterns) {
    const idx = content.indexOf(p);
    if (idx !== -1) return content.substring(idx, idx + 10000);
  }
  return null;
}

function extractField(block, fieldPath) {
  // Extract a zh string from a field like intro.zh or reward.insight.zh
  const parts = fieldPath.split('.');
  let searchStr = block;
  for (let i = 0; i < parts.length - 1; i++) {
    const idx = searchStr.indexOf(parts[i] + ':');
    if (idx === -1) return null;
    searchStr = searchStr.substring(idx);
  }
  const lastPart = parts[parts.length - 1];
  const re = new RegExp(lastPart + ":\\s*'([^']+)'");
  const m = searchStr.match(re);
  return m ? m[1] : null;
}

function countScenes(block) {
  // Count occurrences of q: { zh: in scenes array
  const beforeReward = block.substring(0, block.indexOf('reward:'));
  const matches = beforeReward.match(/q:\s*\{\s*zh:/g);
  return matches ? matches.length : 0;
}

function countOptions(block) {
  // Count options in scenes
  const beforeReward = block.substring(0, block.indexOf('reward:'));
  const matches = beforeReward.match(/correct:\s*(true|false)/g);
  return matches ? matches.length : 0;
}

function checkBanned(text) {
  if (!text) return [];
  const found = [];
  for (const phrase of BANNED_PHRASES) {
    if (text.includes(phrase)) found.push(phrase);
  }
  return found;
}

console.log('='.repeat(80));
console.log('湾区罗盘 64 副本数据验证报告');
console.log('='.repeat(80));
console.log();

let totalIntro = 0, totalScenes = 0, totalOptions = 0, totalInsight = 0;
let issues = [];

for (const id of ALL_IDS) {
  const block = extractEpisodeBlock(id);
  if (!block) {
    issues.push(`❌ ${id}: 未找到副本定义`);
    continue;
  }

  // Extract intro zh
  const introIdx = block.indexOf('intro:');
  let introZh = '';
  if (introIdx !== -1) {
    const introBlock = block.substring(introIdx);
    const m = introBlock.match(/intro:\s*\{\s*zh:\s*'([^']+)'/);
    if (m) introZh = m[1];
  }

  // Extract insight zh
  const rewardIdx = block.indexOf('reward:');
  let insightZh = '';
  if (rewardIdx !== -1) {
    const rewardBlock = block.substring(rewardIdx);
    const m = rewardBlock.match(/insight:\s*\{\s*zh:\s*'([^']+)'/);
    if (m) insightZh = m[1];
  }

  const sceneCount = countScenes(block);
  const optionCount = countOptions(block);

  // Check banned phrases
  const allText = introZh + ' ' + insightZh;
  const banned = checkBanned(allText);

  // Check standards
  const introLen = introZh.length;
  const insightLen = insightZh.length;
  const isRpg = RPG_IDS.includes(id);

  let status = '✓';
  const problems = [];

  if (introLen < 100) { problems.push(`intro过短(${introLen}字)`); status = '⚠️'; }
  if (introLen > 250) { problems.push(`intro过长(${introLen}字)`); status = '⚠️'; }
  if (sceneCount < 2) { problems.push(`scenes不足(${sceneCount}题)`); status = '⚠️'; }
  if (optionCount < 4) { problems.push(`options不足(${optionCount}个)`); status = '⚠️'; }
  if (insightLen < 80) { problems.push(`insight过短(${insightLen}字)`); status = '⚠️'; }
  if (banned.length > 0) { problems.push(`套话: ${banned.join(',')}`); status = '❌'; }

  if (problems.length > 0) {
    issues.push(`${status} ${id}: ${problems.join('; ')}`);
  }

  totalIntro += introLen;
  totalScenes += sceneCount;
  totalOptions += optionCount;
  totalInsight += insightLen;

  console.log(`${status} ${id.padEnd(8)} | intro: ${String(introLen).padStart(3)}字 | scenes: ${sceneCount}题 | options: ${optionCount}个 | insight: ${String(insightLen).padStart(3)}字${isRpg ? ' | [RPG]' : ''}`);
}

console.log();
console.log('='.repeat(80));
console.log('统计汇总');
console.log('='.repeat(80));
console.log(`副本总数: ${ALL_IDS.length}`);
console.log(`intro 平均字数: ${Math.round(totalIntro / ALL_IDS.length)}字`);
console.log(`scenes 总题数: ${totalScenes}题 (平均 ${Math.round(totalScenes / ALL_IDS.length)}题/副本)`);
console.log(`options 总数: ${totalOptions}个 (平均 ${Math.round(totalOptions / ALL_IDS.length)}个/副本)`);
console.log(`insight 平均字数: ${Math.round(totalInsight / ALL_IDS.length)}字`);

console.log();
console.log('='.repeat(80));
console.log('问题列表');
console.log('='.repeat(80));
if (issues.length === 0) {
  console.log('✅ 全部 64 个副本通过验证，无问题。');
} else {
  console.log(`发现 ${issues.length} 个问题:`);
  issues.forEach(issue => console.log(issue));
}

// Check RPG beats integrity
console.log();
console.log('='.repeat(80));
console.log('RPG 副本 beats 完整性检查');
console.log('='.repeat(80));
for (const id of RPG_IDS) {
  const block = extractEpisodeBlock(id);
  if (!block) {
    console.log(`❌ ${id}: 未找到`);
    continue;
  }
  const hasSynthesis = block.includes('synthesis') || block.includes('makeRpgSynthesis');
  const hasImpact = block.includes('impact') || block.includes('makeRpgImpact');
  const hasFinalChoice = block.includes('finalChoice') || block.includes('final');
  const chaptersMatch = block.match(/chapters:\s*\[([^\]]+)\]/);
  const chapterCount = chaptersMatch ? chaptersMatch[1].split(',').length : 0;
  console.log(`${chapterCount === 5 ? '✓' : '⚠️'} ${id.padEnd(8)} | chapters: ${chapterCount}章 | synthesis: ${hasSynthesis ? '✓' : '❌'} | impact: ${hasImpact ? '✓' : '❌'} | finalChoice: ${hasFinalChoice ? '✓' : '❌'}`);
}
