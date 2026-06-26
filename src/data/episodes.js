import { EPISODE_SCENE_EXPANSIONS } from './episode-expansions.js?rev=episodes-depth-1';

// 锚点剧情副本数据集（v3 · 全锚点覆盖 · 含角色头像）
// 为所有锚点扩展 episode 字段，以「锚点 id」为键。
// episode 结构：
//   characters: [{name,role,portrait}]    角色头像列表
//   intro                                 历史情境代入旁白（第二人称）
//   scenes: [{q, speaker?, options}]      2–3 个抉择/问答（speaker 为 characters 下标）
//   reward: {badge, badgeName, insight}   通关奖励

/** @type {Record<string, Episode>} */
export const EPISODES = {

  // ============ M01 赤湾天后宫 · 郑和（航海贸易）============
  M01: {
    characters: [
      { name: { zh: '郑和', en: 'Zheng He' }, role: { zh: '大明宝船统帅', en: 'Admiral of the Treasure Fleet' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/53cfd435-8785-406e-a8cd-59cfbbbfbd40/image_1781684639_1_3.png' },
      { name: { zh: '你', en: 'You' }, role: { zh: '宝船通译', en: 'Fleet Interpreter' }, portrait: '' },
    ],
    intro: {
      zh: '永乐三年，你是郑和宝船上的一名年轻通译。船队即将自赤湾起锚，远渡重洋。出航前夜，你随郑和登上天后宫，海风裹挟着香火气息扑面而来……',
      en: 'It is 1405. You are a young interpreter aboard Zheng He\'s treasure fleet. The ships are about to weigh anchor at Chiwan. On the eve of departure, you climb to the Tianhou Temple with the Admiral, sea breeze carrying the scent of incense…',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '郑和问你：「此行携瓷器、丝绸、茶叶满舱，你以为该以何物示天朝威仪？」', en: 'Zheng He asks: "Our holds are full of porcelain, silk and tea. What should best display the dignity of our empire?"' },
        options: [
          { text: { zh: '以利炮坚船震慑沿途诸国', en: 'Cannons and warships to intimidate every nation' }, correct: false, feedback: { zh: '郑和摇头。七下西洋,宝船虽有护卫之力,却从不以征服为目的——他带去的是贸易与对话,而非殖民。这正是中国大航海与后来西方殖民扩张的根本不同。', en: 'Zheng He shakes his head. Across seven voyages, though armed, the fleet never sought conquest — it carried trade and dialogue, not colonization.' } },
          { text: { zh: '以瓷器丝绸通有无,以礼相待', en: 'Porcelain and silk to trade in good faith' }, correct: true, feedback: { zh: '正是如此。郑和船队抵达三十余国,以「厚往薄来」的方式交换货物、传递友谊。早在西方大航海数十年前,中国已展示了一种和平开放的海洋文明范式。', en: 'Precisely. The fleet reached over 30 states, exchanging goods and friendship. Decades before European exploration, China demonstrated a peaceful maritime civilization paradigm.' } },
        ],
      },
      {
        speaker: 0,
        q: { zh: '航行至东非马林迪,当地国王赠予一头从未见过的奇兽。你如何向永乐帝禀报?', en: 'Reaching Malindi, the local king gifts a beast never seen before. How do you report to Emperor Yongle?' },
        options: [
          { text: { zh: '此乃祥瑞「麒麟」,寓意天下太平', en: 'It is the auspicious "Qilin," an omen of peace' }, correct: true, feedback: { zh: '那正是长颈鹿。郑和带回的「麒麟」轰动京城,被视为盛世祥瑞。一次远洋,竟把东非的生灵与中华的祥瑞想象连在了一起——这是文明对话最浪漫的注脚。', en: 'It was a giraffe. The "Qilin" stunned the capital as an omen of a golden age — one voyage linked an African creature to Chinese myth.' } },
          { text: { zh: '不过一头怪兽,弃之海中', en: 'Merely a strange beast, throw it away' }, correct: false, feedback: { zh: '万万不可。这头「麒麟」(长颈鹿)后来成为中非交流的传奇象征。郑和的远航证明:好奇与尊重,远比傲慢更能连接世界。', en: 'Never. This "Qilin" (giraffe) became a legendary symbol of Sino-African exchange.' } },
        ],
      },
      {
        speaker: 0,
        q: { zh: '归国后,有人提议把航海图与造船术列为绝密,永不外传。你赞同吗?', en: 'Some propose sealing navigation charts forever. Do you agree?' },
        options: [
          { text: { zh: '赞同,技术应当严守', en: 'Agree, lock the technology away' }, correct: false, feedback: { zh: '历史令人扼腕——明代中后期海禁,宝船图纸散佚,中国错失了引领海洋时代的先机。封闭从来不是答案。', en: 'History laments — mid-Ming sea bans scattered blueprints. Isolation is never the answer.' } },
          { text: { zh: '反对,开放交流才能长久', en: 'Oppose — only openness endures' }, correct: true, feedback: { zh: '你看得很远。赤湾的故事告诉今天的大湾区:唯有持续开放,才能立于潮头。六百年后,这片海湾再次成为连接世界的贸易枢纽。', en: 'You see far. Chiwan\'s story tells today\'s Bay Area: only sustained openness keeps one at the crest.' } },
        ],
      },
    ],
    reward: { badge: '⚓', badgeIcon: 'treasure-fleet', badgeName: { zh: '和平远航印', en: 'Seal of the Peaceful Voyage' }, insight: { zh: '郑和七下西洋,以和平贸易连接四海。赤湾的锚地,正是中华海洋文明「厚往薄来、协和万邦」精神的起点。', en: 'Zheng He\'s seven voyages connected the seas through peaceful trade. Chiwan is the origin of China\'s maritime ethos.' } },
  },

  // ============ M02 葛洪炼丹遗迹 · 罗浮山（古代文化）============
  M02: {
    characters: [
      { name: { zh: '葛洪', en: 'Ge Hong' }, role: { zh: '东晋道学家·医学家', en: 'Eastern Jin Alchemist & Physician' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/9266e845-4545-416b-8028-a0a9752d9b81/image_1781684643_1_3.jpg' },
      { name: { zh: '屠呦呦', en: 'Tu Youyou' }, role: { zh: '诺贝尔奖得主', en: 'Nobel Laureate' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/e7d9e7e2-7853-4186-98a1-68d8880cbabf/image_1781684668_1_1.jpg' },
    ],
    intro: {
      zh: '东晋年间,你是罗浮山下一名求学的药童。师父葛洪正俯身于丹炉与竹简之间。岭南瘴疠横行,他遍尝百草,要为这片土地寻一线生机……',
      en: 'In the Eastern Jin dynasty, you are an apprentice at Mount Luofu. Your master Ge Hong bends over his furnace and bamboo slips, seeking a cure for the malaria ravaging Lingnan…',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '一位高热不退的村民被抬来。葛洪取来青蒿,问你:「该如何用此草?」', en: 'A villager with burning fever is carried in. Ge Hong takes sweet wormwood and asks: "How should this herb be used?"' },
        options: [
          { text: { zh: '依古法,水煎煮沸服下', en: 'By tradition, boil it and drink hot' }, correct: false, feedback: { zh: '葛洪却另有发现。他记下:「青蒿一握,以水二升渍,绞取汁」——是「绞汁冷服」而非高温煎煮。这个细节,在一千六百年后改变了世界。', en: 'Ge Hong discovered otherwise: "wring out the juice" — cold extraction, not hot decoction. This detail changed the world 1,600 years later.' } },
          { text: { zh: '以冷水浸渍,绞取其汁而服', en: 'Soak in cold water, wring out juice' }, correct: true, feedback: { zh: '正是葛洪《肘后备急方》所载之法!这一句「绞汁」而非煎煮的记载,暗示有效成分不耐高温——正是这关键线索,点亮了现代医学的灵光。', en: 'Exactly as recorded! The note to "wring out" hinted the active compound is heat-sensitive — the clue that lit modern medicine\'s spark.' } },
        ],
      },
      {
        speaker: 1,
        q: { zh: '一千六百年后,科学家屠呦呦在古籍中读到这一句。她受到了什么启发?', en: 'Sixteen centuries later, Tu Youyou reads this line. What did it inspire?' },
        options: [
          { text: { zh: '改用低温乙醚提取青蒿素', en: 'Switch to low-temperature ether extraction' }, correct: true, feedback: { zh: '正是!屠呦呦因「绞汁」二字悟出高温会破坏有效成分,改用低温提取,终于成功分离青蒿素。2015年她凭此荣获诺贝尔奖,挽救全球数百万生命。', en: 'Yes! Tu Youyou realized heat destroys the compound, switched to low-temperature extraction, isolated artemisinin. 2015 Nobel Prize, saving millions.' } },
          { text: { zh: '加大火候,延长煎煮时间', en: 'Increase heat and boil longer' }, correct: false, feedback: { zh: '恰恰相反。早期高温提取屡屡失败,正是葛洪「绞汁冷服」的记载提醒屠呦呦——有效成分不耐热。', en: 'The opposite. Early high-heat extractions failed; Ge Hong\'s record reminded Tu Youyou the compound is heat-sensitive.' } },
        ],
      },
    ],
    reward: { badge: '🌿', badgeName: { zh: '青蒿济世印', en: 'Seal of the Healing Herb' }, insight: { zh: '葛洪在罗浮山写下的一句话,跨越十六个世纪,化作拯救千万人的青蒿素。古老的智慧,从未真正沉睡。', en: 'A single line Ge Hong wrote on Mount Luofu became artemisinin. Ancient wisdom never truly sleeps.' } },
  },

  // ============ P01 罗湖桥 · 钱学森（现代科技）============
  P01: {
    characters: [
      { name: { zh: '钱学森', en: 'Qian Xuesen' }, role: { zh: '中国航天之父', en: 'Father of Chinese Aerospace' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/c7e96924-31e5-44dc-bab4-f44c85753656/image_1781684666_2_3.jpg' },
    ],
    intro: {
      zh: '1955年的深秋,你是罗湖桥头的一名边检员。一位戴眼镜的中年学者携家眷缓缓走来,行李简朴,眼神却灼灼如炬。他,就是钱学森……',
      en: 'Late autumn 1955. You are a border inspector at Luohu Bridge. A bespectacled scholar approaches with his family, luggage plain but eyes blazing. He is Qian Xuesen…',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '钱学森曾被美方称为「抵得上五个师」而遭软禁五年。他为何执意归国?', en: 'The US called Qian "worth five divisions" and detained him five years. Why return?' },
        options: [
          { text: { zh: '为报效百废待兴的祖国', en: 'To serve a rebuilding homeland' }, correct: true, feedback: { zh: '正是。钱学森说:「我的事业在中国,我的归宿在中国。」他放弃优渥条件,只为让新中国的航天与国防挺直脊梁。', en: 'Indeed. Qian said: "My cause is in China." He gave up comfort to give New China\'s aerospace a backbone.' } },
          { text: { zh: '因在美国待遇不佳', en: 'Because he was treated poorly' }, correct: false, feedback: { zh: '并非如此。钱学森在美已是加州理工的顶尖教授。他的归国是主动选择——把才华献给民族复兴。', en: 'Not so. Qian was a top Caltech professor. His return was a deliberate choice for national revival.' } },
        ],
      },
      {
        speaker: 0,
        q: { zh: '钱学森归国后,中国的「两弹一星」进程发生了什么变化?', en: 'After Qian\'s return, what happened to the "Two Bombs, One Satellite" program?' },
        options: [
          { text: { zh: '进程提前了至少二十年', en: 'Accelerated by at least twenty years' }, correct: true, feedback: { zh: '正是。钱学森主持研制导弹与火箭,使中国国防科技实现跨越式发展。一座小小的罗湖桥,因一个人的跨越,改写了世界科学力量的天平。', en: 'Exactly. Qian led missile and rocket development. A small bridge, crossed by one man, reshaped the global balance of science.' } },
          { text: { zh: '几乎没有影响', en: 'Almost no impact' }, correct: false, feedback: { zh: '影响是决定性的。钱学森被誉为「中国航天之父」,他的归来让中国的导弹、卫星事业从无到有。', en: 'The impact was decisive. His return built China\'s missile and satellite programs from nothing.' } },
        ],
      },
    ],
    reward: { badge: '🚀', badgeName: { zh: '科学归途印', en: 'Seal of the Scientific Homecoming' }, insight: { zh: '一座窄窄的罗湖桥,因钱学森等科学家的归来,成为中国科学命运的转折点。', en: 'A narrow bridge, through the return of scientists like Qian, became China\'s scientific turning point.' } },
  },

  // ============ M06 蛇口工业区 · 袁庚（近现代发展）============
  M06: {
    characters: [
      { name: { zh: '袁庚', en: 'Yuan Geng' }, role: { zh: '蛇口工业区创始人', en: 'Founder of Shekou Industrial Zone' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/8c63c59a-5864-454a-9f2a-ded07ddd17ad/image_1781684650_2_1.jpg' },
    ],
    intro: {
      zh: '1979年,你是蛇口工业区的第一批拓荒者之一。脚下是尘土飞扬的工地,远处传来填海的炮声。一位叫袁庚的老人,正要在这里点燃一场改变中国的实验……',
      en: 'It is 1979. You are among the first pioneers of Shekou. Beneath your feet is a dusty site; blasts echo in the distance. Yuan Geng is about to ignite an experiment that will change China…',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '袁庚想在工地上立一块标语牌,以激励效率。你觉得该写什么?', en: 'Yuan Geng wants a slogan board. What should it say?' },
        options: [
          { text: { zh: '「时间就是金钱,效率就是生命」', en: '"Time is money, efficiency is life"' }, correct: true, feedback: { zh: '正是这块牌子!它在当年石破天惊,曾被质疑为「资本主义口号」。但正是这句话,撕开了计划经济的铁幕,点燃了整个中国的市场化引擎。', en: 'That very board! Earth-shattering then. This line tore open the planned economy and ignited China\'s market engine.' } },
          { text: { zh: '「按部就班,稳中求进」', en: '"Step by step, seek stability"' }, correct: false, feedback: { zh: '太过保守了。袁庚要的是惊雷。他立起的「时间就是金钱,效率就是生命」,成为改革开放最响亮的先声。', en: 'Too conservative. Yuan Geng wanted thunder. His slogan became the loudest herald of Reform and Opening.' } },
        ],
      },
      {
        speaker: 0,
        q: { zh: '有人质疑蛇口的种种改革「姓资还是姓社」。袁庚该如何回应?', en: 'Some question whether reforms are "capitalist or socialist." How should Yuan Geng respond?' },
        options: [
          { text: { zh: '停下改革,等待上级定论', en: 'Halt and await a verdict from above' }, correct: false, feedback: { zh: '若如此,便没有今天的深圳。蛇口的可贵,在于「敢为天下先」——在争议中先行先试。', en: 'Had he done so, there would be no Shenzhen today. Shekou dared to be first — experimenting amid controversy.' } },
          { text: { zh: '以实践成果说话,继续闯', en: 'Let results speak, keep forging ahead' }, correct: true, feedback: { zh: '正是这种精神!蛇口用实实在在的发展回应了质疑。「空谈误国,实干兴邦」——从这里走出的市场经济,让数亿中国人摆脱了贫困。', en: 'That is the spirit! Shekou answered doubt with real development, lifting hundreds of millions from poverty.' } },
        ],
      },
    ],
    reward: { badge: '🏗️', badgeName: { zh: '改革先声印', en: 'Seal of the Reform Pioneer' }, insight: { zh: '改革开放的第一声炮响,自蛇口炸响。「时间就是金钱」六个字,炸开了一个时代。', en: 'The first cannon of Reform fired at Shekou. Six words blasted open an era.' } },
  },

  // ============ M03 南头古城（古代文化）============
  M03: {
    characters: [
      { name: { zh: '东官郡守', en: 'Prefect of Dongguan' }, role: { zh: '东晋行政长官', en: 'Eastern Jin Administrator' }, portrait: '' },
    ],
    intro: {
      zh: '公元331年，你是新设东官郡的一名文书小吏。朝廷刚从番禺析出此地为新郡治所，你奉命踏勘城址。站在南头半岛的高地上，珠江口的潮水尽收眼底……',
      en: 'It is 331 AD. You are a clerk in the newly established Dongguan Prefecture. Tasked to survey the site for the new capital, you stand on a Nantou hilltop, the Pearl River estuary stretching before you…',
    },
    scenes: [
      {
        q: { zh: '为何朝廷选南头作郡治,而非更繁华的番禺(广州)附近？', en: 'Why did the court choose Nantou over the more prosperous Panyu (Guangzhou)?' },
        options: [
          { text: { zh: '此地扼珠江口咽喉,可控海防与贸易', en: 'It commands the Pearl River estuary, controlling maritime defense and trade' }, correct: true, feedback: { zh: '正是。南头据珠江入海之咽喉,进可守海防,退可通岭南腹地。此后一千七百年,它始终是这片区域的行政核心——深圳可不只有四十年历史。', en: 'Correct. Nantou commands the estuary — defense seaward, access inland. For 1,700 years it remained the region\'s administrative core. Shenzhen is not just 40 years old.' } },
          { text: { zh: '只是随机选择,无特殊原因', en: 'Just a random choice, no special reason' }, correct: false, feedback: { zh: '绝非偶然。南头的地理位置扼守珠江口,具有极高的军事与贸易战略价值。这一选址智慧延续了近两千年,直到今天深圳在同一海岸线上崛起。', en: 'Far from random. Its geography controlling the estuary had supreme strategic value — wisdom that endured nearly two millennia.' } },
        ],
      },
      {
        q: { zh: '有人说"深圳是一座没有历史的城市"。面对南头古城,你怎么看？', en: '"Shenzhen has no history," some say. With Nantou before you, what do you think?' },
        options: [
          { text: { zh: '确实,深圳只是改革开放后才兴起', en: 'True, Shenzhen only rose after Reform and Opening' }, correct: false, feedback: { zh: '大错特错。南头古城已在此矗立一千七百年。深圳的文化根脉远比摩天大楼更深——它是岭南千年门户,而非四十年的暴发户。', en: 'Completely wrong. Nantou has stood here 1,700 years. Shenzhen\'s roots run far deeper than its skyscrapers.' } },
          { text: { zh: '不对,南头古城证明深圳是千年门户', en: 'Wrong — Nantou proves Shenzhen is a millennium gateway' }, correct: true, feedback: { zh: '没错。从东晋设郡到今天,这片土地从未停止过文明的脉动。摩天大楼之下,是一千七百年的城市基因。认识深圳,必须从南头开始。', en: 'Exactly. From 331 AD to today, civilization never stopped pulsing here. Beneath the skyscrapers lies 1,700 years of urban DNA.' } },
        ],
      },
    ],
    reward: { badge: '🏯', badgeName: { zh: '千年古城印', en: 'Seal of the Ancient City' }, insight: { zh: '南头古城是深圳的"根"——一千七百年行政中心的历史证明:这座城市的底蕴,远比人们想象的深厚。', en: 'Nantou is Shenzhen\'s "root" — 1,700 years of administration prove this city\'s depth far exceeds imagination.' } },
  },

  // ============ M09 文天祥后人聚居地（古代文化）============
  M09: {
    characters: [
      { name: { zh: '文天祥', en: 'Wen Tianxiang' }, role: { zh: '南宋爱国诗人·宰相', en: 'Southern Song Patriot & Prime Minister' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/a14cdb28-a32c-4a16-9991-ebf8cd85709a/image_1781684644_1_1.jpg' },
    ],
    intro: {
      zh: '1279年,崖山海战后,南宋覆灭。你是文天祥后人中一位年轻族长,带领族人南逃至深圳一隅。身后是元兵的追击,前方是未知的岭南荒野……',
      en: 'After the 1279 Battle of Yamen, the Southern Song fell. You, a young clan leader among Wen Tianxiang\'s descendants, lead your people south to Shenzhen. Behind: Yuan cavalry. Ahead: the unknown wilderness of Lingnan…',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '文天祥临刑前写下"人生自古谁无死,留取丹心照汗青"。这句话对逃亡中的后人意味着什么?', en: 'Wen Tianxiang\'s last poem: "Everyone must die; let me leave a loyal heart to shine in history." What does this mean to fleeing descendants?' },
        options: [
          { text: { zh: '虽国破家亡,但精神不灭——我们要世代传承气节', en: 'Though the nation fell, the spirit endures — pass integrity through generations' }, correct: true, feedback: { zh: '正是这份信念让文氏后人在深圳扎根七百余年,至今仍以"正气"为家训。一句诗,化作一个家族千年不灭的精神灯火。', en: 'This belief sustained Wen\'s descendants in Shenzhen for 700+ years, still honoring "integrity" as their family motto. One poem became an eternal spiritual flame.' } },
          { text: { zh: '逃命要紧,先生诗词不过是文人风骨', en: 'Survival first; poetry is just scholarly vanity' }, correct: false, feedback: { zh: '文天祥不只是文人。他的诗句成为整个民族的道德脊梁,激励了此后七百年无数仁人志士——这远超一首诗的力量。', en: 'Wen was more than a scholar. His verse became the moral backbone of a nation, inspiring countless heroes for 700 years.' } },
        ],
      },
      {
        q: { zh: '定居深圳后,族人面临选择:是隐姓埋名避祸,还是公开祭祀先祖?', en: 'After settling, the clan faces a choice: hide their identity, or openly honor their ancestor?' },
        options: [
          { text: { zh: '隐姓埋名,保全族人', en: 'Hide, to protect the clan' }, correct: false, feedback: { zh: '文氏后人最终选择了公开传承。正因为他们世代不忘正气,这份精神才能流传至今,成为深圳最珍贵的人文遗产之一。', en: 'The Wen descendants chose open inheritance. Because they never forgot integrity, this spirit endures today as Shenzhen\'s most precious cultural heritage.' } },
          { text: { zh: '公开建祠祭祖,让正气精神永远流传', en: 'Build ancestral halls, let the spirit of integrity flow forever' }, correct: true, feedback: { zh: '勇敢的选择。文氏宗祠至今矗立在深圳,七百年来从未中断祭祀。一个家族的坚守,让一位英雄的精神跨越了七个世纪的风雨。', en: 'A brave choice. Wen clan ancestral halls still stand in Shenzhen, worship unbroken for 700 years. One family\'s persistence carried a hero\'s spirit across seven centuries.' } },
        ],
      },
    ],
    reward: { badge: '📜', badgeName: { zh: '正气传家印', en: 'Seal of Inherited Integrity' }, insight: { zh: '文天祥的后裔在此繁衍七百年,"人生自古谁无死"不只是诗句,更是一个家族跨越七世纪的精神遗嘱。', en: 'Wen\'s descendants flourished here 700 years. His poem is not just verse but a spiritual testament spanning seven centuries.' } },
  },

  // ============ M10 观澜版画基地（古代文化）============
  M10: {
    characters: [
      { name: { zh: '陈烟桥', en: 'Chen Yanqiao' }, role: { zh: '新兴木刻运动大师', en: 'Master of New Woodcut Movement' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/b7f645e5-8ee3-41b8-addb-87a48ef62675/image_1781684669_1_1.jpg' },
    ],
    intro: {
      zh: '1930年代,你是上海亭子间里的一名美术学生。鲁迅先生正在推广木刻版画——他认为刻刀比画笔更有力量,能直抵劳苦大众的心灵。你的同乡陈烟桥,正是这场运动的先锋……',
      en: 'The 1930s. You are an art student in Shanghai. Lu Xun is championing woodcut prints — he believes the carving knife is mightier than the paintbrush. Your fellow villager Chen Yanqiao is a pioneer of this movement…',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '鲁迅为何选择推广版画,而非油画或国画?', en: 'Why did Lu Xun champion woodcuts over oil painting or traditional ink painting?' },
        options: [
          { text: { zh: '版画可大量复制传播,是"穷人的艺术",人人看得懂', en: 'Prints can be mass-reproduced — "art of the poor," understood by all' }, correct: true, feedback: { zh: '一语中的。版画无需昂贵颜料,一块木板即可刻千张。它是大众觉醒的武器——黑白对比的刚劲线条,比任何文字都更能震撼不识字的劳工。', en: 'Spot on. Woodcuts need no expensive paint — one block prints thousands. A weapon of mass awakening, black-white contrast more powerful than words for illiterate workers.' } },
          { text: { zh: '只是个人审美偏好', en: 'Just personal aesthetic preference' }, correct: false, feedback: { zh: '远非审美选择。鲁迅看中的是版画的传播力——它可以被无限复制,传入每一个工厂、每一条街巷,成为唤醒民族意识的视觉号角。', en: 'Far more than aesthetics. Lu Xun valued the reproductive power of prints — infinitely copyable, reaching every factory and street, a visual trumpet of national awakening.' } },
        ],
      },
      {
        q: { zh: '陈烟桥从客家村落走出,作品传遍全国。今天观澜版画村的意义是什么?', en: 'Chen Yanqiao went from Hakka village to national fame. What is Guanlan Print Village\'s significance today?' },
        options: [
          { text: { zh: '只是一个旅游景点', en: 'Just a tourist spot' }, correct: false, feedback: { zh: '远不止此。观澜版画基地已成为全球三大版画艺术村之一,每年接待数十国艺术家驻留创作。从这里诞生的木刻精神,如今以国际艺术对话的形式延续着。', en: 'Far more. Guanlan is now one of the world\'s top three printmaking villages, hosting artists from dozens of countries annually. The woodcut spirit lives on as international artistic dialogue.' } },
          { text: { zh: '从革命武器到世界艺术殿堂——版画精神的当代新生', en: 'From revolutionary weapon to global art shrine — a contemporary rebirth of the woodcut spirit' }, correct: true, feedback: { zh: '精辟。一个客家小村孕育的版画运动,经历了革命年代的烈火,如今已蜕变为连接全球艺术家的文化纽带——这是"在地性"通往"世界性"的完美路径。', en: 'Brilliant. A Hakka village\'s print movement, forged in revolutionary fire, has evolved into a cultural bridge connecting global artists — the perfect path from local to universal.' } },
        ],
      },
    ],
    reward: { badge: '🖼️', badgeName: { zh: '刀笔觉醒印', en: 'Seal of the Awakening Blade' }, insight: { zh: '从客家村落走出的版画运动,以刻刀代笔,唤醒了一个时代。今天的观澜,让这份精神在世界舞台重生。', en: 'A woodcut movement from a Hakka village awakened an era. Today, Guanlan gives this spirit global rebirth.' } },
  },

  // ============ N-CV01 东莞可园（古代文化）============
  'N-CV01': {
    characters: [
      { name: { zh: '张敬修', en: 'Zhang Jingxiu' }, role: { zh: '清朝将军·园主', en: 'Qing General & Garden Master' }, portrait: '' },
    ],
    intro: {
      zh: '1850年代,你是东莞城里一名年轻画师,受邀为归隐将军张敬修设计私家园林。他退出战场,却要在方寸之间建造一座"可以居、可以画、可以诗"的天地……',
      en: 'The 1850s. You are a young painter in Dongguan, invited to help retiring General Zhang Jingxiu design his private garden — a world where one can "live, paint and compose poetry" within a single acre…',
    },
    scenes: [
      {
        q: { zh: '张敬修问你:方寸之地如何容下乾坤?岭南园林的精髓是什么?', en: 'Zhang asks: How to contain the universe in a tiny space? What is the essence of Lingnan garden art?' },
        options: [
          { text: { zh: '以曲径通幽、借景造境,让小空间产生无限层次', en: 'Winding paths, borrowed views — infinite layers in small space' }, correct: true, feedback: { zh: '妙哉!可园仅2000余平方米,却有亭台楼阁30余处,通过连廊、叠石、借景手法层层递进。方寸中藏乾坤,正是岭南文人智慧的极致表达。', en: 'Brilliant! Keyuan is just 2,000sqm yet contains 30+ pavilions. Through corridors, rockeries and borrowed views, it creates infinite depth — the pinnacle of Lingnan scholarly wisdom.' } },
          { text: { zh: '造大假山,铺大水面,越大越好', en: 'Build huge rockeries and vast pools — bigger is better' }, correct: false, feedback: { zh: '恰恰相反。岭南园林的精髓在于"小中见大"——不以面积取胜,而以巧妙布局创造层次感。可园被誉为"咫尺山林",正是这一哲学的完美体现。', en: 'The opposite. Lingnan gardens excel at "seeing vastness in smallness" — not size but clever layout creates depth. Keyuan is called "a forest in inches."' } },
        ],
      },
      {
        q: { zh: '可园的美学基因如何影响了今天的粤港澳建筑?', en: 'How has Keyuan\'s aesthetic DNA influenced today\'s Bay Area architecture?' },
        options: [
          { text: { zh: '没什么影响,古典园林已过时', en: 'No influence — classical gardens are outdated' }, correct: false, feedback: { zh: '大错。岭南建筑至今保留的通透骑楼、岭南天井、曲径回廊,皆源自可园一脉的空间哲学。连今天的豪宅和五星酒店,都在致敬这套"以小博大"的设计语法。', en: 'Wrong. Today\'s Lingnan arcades, courtyards and winding corridors all trace back to Keyuan\'s spatial philosophy. Even luxury homes pay homage to this design grammar.' } },
          { text: { zh: '岭南建筑的通透、借景、人文气息,皆传承自此', en: 'Lingnan architecture\'s transparency, borrowed views and cultural spirit all descend from here' }, correct: true, feedback: { zh: '确实如此。从广州骑楼到香港半山别墅,从深圳万科住宅到澳门葡式庭院的中式改造——岭南园林的空间哲学从未消失,只是不断变换新貌。', en: 'Indeed. From Guangzhou arcades to Hong Kong hillside villas, from Shenzhen residences to Macau courtyard adaptations — Lingnan garden philosophy never disappeared, only evolved.' } },
        ],
      },
    ],
    reward: { badge: '🏮', badgeName: { zh: '岭南造园印', en: 'Seal of Lingnan Garden Art' }, insight: { zh: '一亩方塘即可映照天光云影。可园告诉我们:最高明的设计,不是占有空间,而是创造意境。', en: 'One acre can mirror sky and clouds. Keyuan teaches: the finest design doesn\'t occupy space — it creates atmosphere.' } },
  },

  // ============ N-CV02 南越王宫博物馆（古代文化）============
  'N-CV02': {
    characters: [
      { name: { zh: '赵佗', en: 'Zhao Tuo' }, role: { zh: '南越国开国之王', en: 'Founding King of Nanyue' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/b9f84c03-2e21-4dc0-9f86-b29fc618cae2/image_1781684646_1_1.jpg' },
    ],
    intro: {
      zh: '公元前206年,秦末大乱。你是跟随赵佗南下的一名秦军校尉。赵佗在岭南自立为王,建立南越国。他传令你协助营建番禺城的宫殿——一个南方文明中心正在诞生……',
      en: 'It is 206 BC, the end of the Qin Dynasty. You are a military officer who followed Zhao Tuo south. He founds the Nanyue Kingdom and orders you to help build the palace in Panyu — a southern civilization is being born…',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '赵佗本是北方秦将,却在岭南称王百年。他如何治理这片"蛮荒之地"?', en: 'Zhao Tuo was a northern Qin general, yet ruled Lingnan for a century. How did he govern this "wild land"?' },
        options: [
          { text: { zh: '用中原法度强制同化百越族群', en: 'Force Central Plains laws to assimilate the Baiyue peoples' }, correct: false, feedback: { zh: '赵佗远比这聪明。他主动学越语、穿越服、娶越妻,以"和辑百越"政策尊重本地文化。正是这种开放包容,让南越国繁荣了93年——比暴力征服高明百倍。', en: 'Zhao Tuo was wiser. He learned Yue language, wore Yue clothing, married local women — "harmonizing the Baiyue." This openness let Nanyue prosper for 93 years.' } },
          { text: { zh: '尊重百越文化,融合中原与岭南文明', en: 'Respect Baiyue culture, fuse Central Plains and Lingnan civilizations' }, correct: true, feedback: { zh: '正是!赵佗的"和辑百越"政策开创了华夏文明南扩的最佳范式:不是强加,而是融合。这片土地两千年前就懂得——开放比封闭更有力量。', en: 'Exactly! Zhao Tuo\'s "harmonize the Baiyue" policy pioneered the best paradigm of Chinese civilization expanding south: not imposition but fusion.' } },
        ],
      },
      {
        q: { zh: '南越王宫遗址出土的文物中,最令考古学家震撼的是什么?', en: 'Among Nanyue Palace artifacts, what shocked archaeologists most?' },
        options: [
          { text: { zh: '中西混合风格的装饰,证明两千年前已与地中海世界有交流', en: 'Mixed Sino-Western decoration proving contact with the Mediterranean world 2,000 years ago' }, correct: true, feedback: { zh: '令人惊叹!宫苑中的波斯银盒、地中海风格的花纹石构件,证明早在张骞通西域之前,海上丝绸之路已将岭南与罗马世界相连。大湾区的全球化基因,比想象中古老得多。', en: 'Astounding! Persian silver boxes and Mediterranean stone elements prove the Maritime Silk Road connected Lingnan to Rome even before Zhang Qian opened the western routes. The Bay Area\'s globalization gene is far more ancient than imagined.' } },
          { text: { zh: '普通的青铜器和陶器', en: 'Ordinary bronze and pottery' }, correct: false, feedback: { zh: '远不止此!南越王宫出土的波斯银盒、地中海风格装饰说明:两千年前,这片土地就已是东西文明的交汇点。大湾区的国际化基因,古已有之。', en: 'Far more! Persian silver boxes and Mediterranean decor from the palace prove this land was an East-West crossroads 2,000 years ago.' } },
        ],
      },
    ],
    reward: { badge: '👑', badgeName: { zh: '岭南王都印', en: 'Seal of the Lingnan Capital' }, insight: { zh: '两千年前,赵佗以融合之道建立南越国——证明大湾区从诞生之日起,就是一个开放包容的文明十字路口。', en: 'Two thousand years ago, Zhao Tuo built Nanyue through fusion — proving the Bay Area was an open, inclusive civilizational crossroads from its very beginning.' } },
  },

  // ============ N-CV03 鹤湖新居·客家围龙屋（古代文化）============
  'N-CV03': {
    characters: [
      { name: { zh: '罗氏族长', en: 'Luo Clan Elder' }, role: { zh: '客家围屋建造者', en: 'Hakka Walled Village Builder' }, portrait: '' },
    ],
    intro: {
      zh: '清朝中叶,你是罗氏家族的一名青年匠人。家族历经数代从中原迁至岭南,如今要在深圳龙岗建造一座大宅。族长说:"我们的房子,要像一座城——挡得住匪患,容得下百人,传得过千年。"',
      en: 'Mid-Qing Dynasty. You are a young craftsman of the Luo clan. After generations migrating from the Central Plains to Lingnan, the clan will build a great mansion in Shenzhen\'s Longgang: "Our house must be like a fortress — repelling bandits, holding a hundred, lasting a thousand years."',
    },
    scenes: [
      {
        q: { zh: '客家人为何要建围龙屋这样的"建筑堡垒"?', en: 'Why did the Hakka build fortress-like walled villages?' },
        options: [
          { text: { zh: '客家人是"客",身处他乡需要自保——围屋是迁徙民族的生存智慧', en: 'Hakka are "guests" — in foreign land they needed protection. Walled villages are migrant survival wisdom' }, correct: true, feedback: { zh: '切中要害。"客家"意为"客人",从中原辗转迁至南方,面对土匪和宗族冲突,围龙屋既是家也是堡垒。一百余间房围合半月形阵,攻不破,守得住——这是建筑写成的民族迁徙史诗。', en: 'Precisely. "Hakka" means "guest people." Migrating south, facing bandits and clan conflicts, the walled village is both home and fortress — a migration epic written in architecture.' } },
          { text: { zh: '纯粹为了炫耀家族财富', en: 'Purely to show off family wealth' }, correct: false, feedback: { zh: '虽然围屋也展示了家族实力,但其核心功能是防御——数百年来客家人作为"客"居者面临的安全威胁,逼迫他们发明了这种集居住、防御、宗祠于一体的建筑形态。', en: 'Though displaying clan power, the core function is defense. Centuries of threats as "guests" forced the invention of architecture combining residence, fortress and ancestral shrine.' } },
        ],
      },
      {
        q: { zh: '鹤湖新居有一百余间房舍,围合成半月形。这种布局有什么讲究?', en: 'Hehu Xinju has 100+ rooms in a crescent. What\'s the logic of this layout?' },
        options: [
          { text: { zh: '半月形呼应风水"环抱聚气",且便于防御瞭望', en: 'Crescent echoes feng shui "embracing qi" and aids defense surveillance' }, correct: true, feedback: { zh: '兼具实用与精神。半月形让建筑成为天然堡垒,同时"背山面水"的风水格局寓意家族绵延昌盛。物质防御与精神信仰,在一座建筑里完美统一。', en: 'Both practical and spiritual. The crescent creates a natural fortress, while "mountain behind, water ahead" feng shui symbolizes eternal clan prosperity. Defense and belief perfectly unified.' } },
          { text: { zh: '随意建造,没有特殊含义', en: 'Random construction, no special meaning' }, correct: false, feedback: { zh: '客家建筑从不随意。每一寸布局都蕴含着风水哲学与防御计算:半月形便于瞭望射击,环抱式聚集"气场",背山面水确保风水吉位。', en: 'Hakka architecture is never random. Every inch encodes feng shui philosophy and defensive calculation.' } },
        ],
      },
    ],
    reward: { badge: '🏠', badgeName: { zh: '围龙传家印', en: 'Seal of the Walled Clan' }, insight: { zh: '一座围龙屋,是一部写在砖石间的迁徙史诗。客家人用建筑回答了永恒的命题:如何在他乡扎根,又不忘来路。', en: 'A walled village is a migration epic in brick and stone — the Hakka answer to: how to root in a new land without forgetting where you came from.' } },
  },

  // ============ N-CV04 开平碉楼·自力村（古代文化）============
  'N-CV04': {
    characters: [
      { name: { zh: '华侨归乡者', en: 'Returning Overseas Chinese' }, role: { zh: '跨洋奋斗的建造者', en: 'Trans-oceanic Builder' }, portrait: '' },
    ],
    intro: {
      zh: '1920年代,你是一位从美国旧金山归来的开平华侨。口袋里装着在金山铁路上挣下的血汗钱,心里装着故乡的父母。你决定建一座碉楼——一座融合中西的家族堡垒,让子孙后代永远记住这段跨洋奋斗的故事……',
      en: 'The 1920s. You are a Kaiping emigrant returning from San Francisco, pocket full of hard-earned railroad money, heart full of home. You will build a diaolou — a tower blending East and West, so future generations remember this trans-oceanic struggle…',
    },
    scenes: [
      {
        q: { zh: '你的碉楼要建成什么风格?开平碉楼为何融合了如此多的西方元素?', en: 'What style for your tower? Why do Kaiping diaolou blend so many Western elements?' },
        options: [
          { text: { zh: '华侨把海外所见所闻带回家乡——每座楼都是一段旅程的纪念碑', en: 'Emigrants brought what they saw abroad home — each tower is a monument to a journey' }, correct: true, feedback: { zh: '每座碉楼都是一部自传。罗马柱来自意大利所见,圆顶来自美国国会大厦印象,而中式飞檐从未缺席。1800余座碉楼,就是1800部跨洋奋斗的家族传记。', en: 'Each diaolou is an autobiography. Roman columns from Italy, domes from the US Capitol, but Chinese flying eaves never absent. 1,800+ towers are 1,800 family biographies of trans-oceanic struggle.' } },
          { text: { zh: '只是模仿西方建筑的流行趋势', en: 'Just imitating Western architectural trends' }, correct: false, feedback: { zh: '远不止模仿。每座碉楼的细节都来自建造者的亲身经历:在美国修铁路时看到的哥特尖塔、在马来亚种植园里见过的南洋骑楼——这是活生生的全球化民间记忆。', en: 'Far more than imitation. Every detail reflects the builder\'s lived experience — Gothic spires from US railroads, Nanyang arcades from Malaya plantations — living folk memory of globalization.' } },
        ],
      },
      {
        q: { zh: '2007年开平碉楼列入世界文化遗产。它向世界讲述了什么故事?', en: 'In 2007 Kaiping Diaolou became UNESCO Heritage. What story does it tell the world?' },
        options: [
          { text: { zh: '华人移民的坚韧与创造力——离散从未割断文化根脉', en: 'Chinese migrants\' resilience and creativity — diaspora never severed cultural roots' }, correct: true, feedback: { zh: '开平碉楼向全世界宣告:无论走多远,华人从未忘本。每一块砖都浸透汗水,每一根柱子都连接着两个世界。这是大湾区"离散与归根"永恒命题最壮美的建筑注脚。', en: 'The diaolou declare to the world: no matter how far, Chinese never forgot their roots. Every brick soaked in sweat, every column connecting two worlds — the Bay Area\'s most magnificent architectural testament to diaspora and homecoming.' } },
          { text: { zh: '只是建筑艺术本身的价值', en: 'Just the value of architecture itself' }, correct: false, feedback: { zh: '建筑之美只是表层。碉楼真正的世界遗产价值在于人的故事:华人移民如何在歧视中崛起、如何将积蓄运回祖地、如何用建筑书写家族荣光与文化认同。', en: 'Architectural beauty is just the surface. The true heritage value is the human story: how Chinese immigrants rose against discrimination and wrote family glory in architecture.' } },
        ],
      },
    ],
    reward: { badge: '🗼', badgeName: { zh: '华侨归根印', en: 'Seal of the Diaspora Homecoming' }, insight: { zh: '1800余座碉楼,是1800部跨洋家族史。每一座都在说:无论世界多大,归来的路永远不会断。', en: '1,800+ towers are 1,800 trans-oceanic family histories. Each says: no matter how vast the world, the road home never breaks.' } },
  },

  // ============ P02 广九铁路旧址（近代化与工程）============
  P02: {
    characters: [
      { name: { zh: '詹天佑', en: 'Zhan Tianyou' }, role: { zh: '中国铁路之父', en: 'Father of China\'s Railways' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/5ed90ca2-c330-48d4-852a-db950aef30a4/image_1781684649_2_3.jpg' },
    ],
    intro: {
      zh: '1911年,你是广九铁路通车典礼的一名年轻记者。汽笛长鸣,蒸汽弥漫。这条穿越深圳的铁路,将彻底改变岭南的命运。而这一切的精神源头,来自一位叫詹天佑的人……',
      en: '1911. You are a young reporter at the opening ceremony of the Kowloon-Canton Railway. The whistle blows, steam billows. This railway through Shenzhen will change Lingnan forever — all tracing back to the spirit of Zhan Tianyou…',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '詹天佑修建京张铁路时,外国人嘲笑"能修这条路的中国人还没出生"。他是如何回应的?', en: 'Foreigners mocked: "The Chinese who can build this railway hasn\'t been born." How did Zhan respond?' },
        options: [
          { text: { zh: '用行动证明——发明"人字形"折返轨道,完美征服陡坡', en: 'Action — inventing the switchback zigzag track to conquer steep gradients' }, correct: true, feedback: { zh: '詹天佑发明的"人字形"折返线至今仍是铁路工程教科书经典。他不仅修通了铁路,更用事实击碎了"中国人不行"的偏见——这份骨气流淌在每一条中国铁路中。', en: 'Zhan\'s switchback remains a textbook classic. He not only built the railway but shattered the prejudice that Chinese can\'t do it — this pride flows through every Chinese railway.' } },
          { text: { zh: '写文章反驳外国报纸', en: 'Write articles refuting foreign newspapers' }, correct: false, feedback: { zh: '詹天佑的字典里没有"争辩"二字。他用最硬的事实回答:京张铁路提前两年完工,造价仅为外国人报价的五分之一。实干,是最有力的回应。', en: 'Zhan didn\'t debate. He answered with facts: the Beijing-Zhangjiakou railway finished two years early at one-fifth the foreign quote. Action is the most powerful reply.' } },
        ],
      },
      {
        q: { zh: '广九铁路对深圳意味着什么?', en: 'What did the Kowloon-Canton Railway mean for Shenzhen?' },
        options: [
          { text: { zh: '它是深圳现代化的绝对起点——铁路把深圳从闭塞渔村推向世界', en: 'The absolute starting point — the railway pushed Shenzhen from isolated village to the world' }, correct: true, feedback: { zh: '准确。广九铁路让深圳第一次接入全球贸易网络。经罗湖桥连通香港后,人流、物流、信息流从此畅通——没有这条铁路,就不会有后来的经济特区。', en: 'Correct. The railway connected Shenzhen to global trade for the first time. Linking Hong Kong via Luohu Bridge, flows of people, goods and information opened — without this railway, no Special Economic Zone.' } },
          { text: { zh: '只是普通的交通工程', en: 'Just an ordinary transport project' }, correct: false, feedback: { zh: '远非普通。这是深圳从"边陲渔村"走向"世界之窗"的第一步——铁路带来的不只是交通,而是思想、资本和机遇的洪流。百年后,深圳因它而起。', en: 'Far from ordinary. This was Shenzhen\'s first step from "border village" to "window to the world" — the railway brought not just transport but a flood of ideas, capital and opportunity.' } },
        ],
      },
    ],
    reward: { badge: '🚂', badgeName: { zh: '铁路先驱印', en: 'Seal of the Railway Pioneer' }, insight: { zh: '詹天佑的精神化为钢轨,从京张到广九——每一条铁路都在说:自强,是连接世界的最短距离。', en: 'Zhan Tianyou\'s spirit became steel rails — every railway says: self-reliance is the shortest distance to the world.' } },
  },

  // ============ M08 前海深港合作区（近代化与工程）============
  M08: {
    characters: [
      { name: { zh: '金融先行者', en: 'Financial Pioneer' }, role: { zh: '前海创新试验区设计师', en: 'Qianhai Innovation Zone Architect' }, portrait: '' },
    ],
    intro: {
      zh: '2010年,你是前海深港合作区规划团队的一名年轻经济学者。脚下还是一片滩涂,领导说:"十年后,这里要成为湾区的曼哈顿。"你看着空旷的海面,思考着一个问题:如何在填海之地上,建造一个金融奇迹？',
      en: '2010. You are a young economist in Qianhai\'s planning team. Below is still mudflat; leaders say: "In ten years, this will be the Manhattan of the Bay." You look at the empty sea, thinking: how to build a financial miracle on reclaimed land?',
    },
    scenes: [
      {
        q: { zh: '前海的核心使命是什么?为什么选择在"一片空白"上建新城?', en: 'What is Qianhai\'s core mission? Why build a new city on a "blank slate"?' },
        options: [
          { text: { zh: '作为深港金融创新的"制度特区",在白纸上画最新的蓝图', en: 'A "policy special zone" for Shenzhen-HK financial innovation — the newest blueprint on a blank canvas' }, correct: true, feedback: { zh: '正是!前海不只是物理空间的开发,更是制度创新的试验田:跨境人民币、港企准入、法律衔接——所有在旧城区难以突破的改革,都在这张白纸上率先落笔。', en: 'Exactly! Qianhai is not just physical development but a laboratory of institutional innovation: cross-border RMB, HK enterprise access, legal alignment — all reforms difficult in old districts are piloted here.' } },
          { text: { zh: '只是因为那里地价便宜', en: 'Just because land is cheap there' }, correct: false, feedback: { zh: '地价只是表面。前海真正的价值在于"制度空白"——在一片没有历史包袱的新区,可以大胆试验最前沿的金融开放政策,为全国提供可复制的经验。', en: 'Price is superficial. Qianhai\'s real value is "institutional blankness" — on land without legacy burdens, boldest financial opening policies can be piloted for national replication.' } },
        ],
      },
      {
        q: { zh: '前海的跨境人民币创新为什么具有世界意义?', en: 'Why does Qianhai\'s cross-border RMB innovation matter globally?' },
        options: [
          { text: { zh: '它是人民币国际化的前哨站,将重塑全球货币格局', en: 'It\'s the outpost of RMB internationalization, reshaping global currency landscape' }, correct: true, feedback: { zh: '精辟。前海率先试点的跨境人民币贷款、双向资本池等创新,正在为人民币成为全球储备货币铺路。从一片滩涂出发,挑战美元霸权——这是大湾区最大胆的金融实验。', en: 'Brilliant. Cross-border RMB lending and two-way capital pools pioneered here pave the way for RMB as a global reserve currency — the Bay Area\'s boldest financial experiment.' } },
          { text: { zh: '只是深圳本地的金融服务升级', en: 'Just a local financial service upgrade' }, correct: false, feedback: { zh: '格局太小。前海的实验意义在全球层面:它是中国金融开放与人民币国际化的先锋阵地,其成功与否将影响21世纪的世界货币秩序。', en: 'Too narrow. Qianhai\'s experimental significance is global: it\'s the vanguard of China\'s financial opening, potentially reshaping 21st-century monetary order.' } },
        ],
      },
    ],
    reward: { badge: '💰', badgeName: { zh: '金融先锋印', en: 'Seal of the Financial Vanguard' }, insight: { zh: '从填海之地到金融心脏,前海用十余年证明:最大胆的创新,往往从一张白纸开始。', en: 'From mudflat to financial heart, Qianhai proves in a decade: the boldest innovation often starts from a blank page.' } },
  },

  // ============ N-EG01 深圳国贸大厦（近代化与工程）============
  'N-EG01': {
    characters: [
      { name: { zh: '建设工人', en: 'Construction Worker' }, role: { zh: '深圳速度的创造者', en: 'Creator of Shenzhen Speed' }, portrait: '' },
    ],
    intro: {
      zh: '1984年,你是国贸大厦工地上的一名钢筋工人。日出开工,日落继续。工头说:"三天一层楼,全世界都在看着深圳——我们要用速度告诉世界,中国人行!"',
      en: '1984. You are a steel worker on the ITC construction site. Sunrise to sunset and beyond. The foreman says: "One floor every three days — the whole world is watching. We\'ll prove through speed that China can do it!"',
    },
    scenes: [
      {
        q: { zh: '"三天一层楼"的深圳速度在当时意味着什么?', en: 'What did "one floor every three days" Shenzhen Speed mean at the time?' },
        options: [
          { text: { zh: '它不只是工程奇迹——它是整个中国向世界宣告"我们能行"的宣言', en: 'Not just an engineering miracle — a national declaration to the world: "We can do it"' }, correct: true, feedback: { zh: '1980年代的中国百废待兴,全世界都在怀疑。深圳用"三天一层楼"证明了改革开放的速度与决心——这不是建筑,是信心的图腾,是一个时代的宣言书。', en: 'In the 1980s China was rebuilding, the world skeptical. "Three days one floor" proved reform\'s speed and resolve — not architecture but a totem of confidence, a manifesto of an era.' } },
          { text: { zh: '只是赶工期而已,没什么特殊', en: 'Just rushing deadlines, nothing special' }, correct: false, feedback: { zh: '绝非普通赶工。在那个年代,中国刚从封闭中苏醒,全世界都在看深圳能不能"搞得起来"。这座大厦用速度回答了一切——它是中国现代化意志的物质化身。', en: 'Not mere rushing. In that era, the world watched whether Shenzhen could "make it work." This tower answered everything with speed — a physical embodiment of China\'s modernization will.' } },
        ],
      },
      {
        q: { zh: '"深圳速度"的精神后来如何延续?', en: 'How did the "Shenzhen Speed" spirit continue?' },
        options: [
          { text: { zh: '从建筑速度进化为创新速度——华为、腾讯、大疆都是深圳速度的新注脚', en: 'From construction speed to innovation speed — Huawei, Tencent, DJI are all new footnotes of Shenzhen Speed' }, correct: true, feedback: { zh: '精辟!当年的"三天一层楼"进化为今天的"72小时硬件打样"。深圳速度不只属于建筑,它已成为中国创新经济的基因密码——快、准、狠、实。', en: 'Brilliant! Yesterday\'s "three days one floor" evolved into today\'s "72-hour hardware prototyping." Shenzhen Speed is now the genetic code of China\'s innovation economy.' } },
          { text: { zh: '已经过时了,现在讲究的是质量', en: 'It\'s outdated — quality matters now' }, correct: false, feedback: { zh: '速度与质量并不矛盾。深圳速度的内核从未消失——它从建筑领域进化为科技创新领域:华为5G研发速度、大疆产品迭代速度,都是这一精神的当代传承。', en: 'Speed and quality aren\'t contradictory. The core never disappeared — it evolved from construction to tech innovation: Huawei\'s 5G R&D pace, DJI\'s iteration speed are contemporary heirs.' } },
        ],
      },
    ],
    reward: { badge: '🏢', badgeName: { zh: '深圳速度印', en: 'Seal of Shenzhen Speed' }, insight: { zh: '三天一层楼,建起的不只是大厦,是一个民族的自信。深圳速度,从未停下。', en: 'One floor every three days built not just a tower but national confidence. Shenzhen Speed never stopped.' } },
  },

  // ============ N-EG02 深圳证券交易所（近代化与工程）============
  'N-EG02': {
    characters: [
      { name: { zh: '市场改革者', en: 'Market Reformer' }, role: { zh: '资本市场先驱', en: 'Capital Market Pioneer' }, portrait: '' },
    ],
    intro: {
      zh: '1990年12月1日,你是深圳证券交易所开市当天的一名交易员。电子屏幕第一次亮起红绿数字,空气中弥漫着紧张与兴奋——一场社会主义国家前所未有的金融实验,从今天开始……',
      en: 'December 1, 1990. You are a trader on the Shenzhen Stock Exchange\'s opening day. Electronic screens flash red and green for the first time. Tension and excitement fill the air — an unprecedented financial experiment in a socialist nation begins today…',
    },
    scenes: [
      {
        q: { zh: '在社会主义国家搞股票交易所,这在当时面临什么最大质疑?', en: 'Opening a stock exchange in a socialist country — what was the biggest doubt?' },
        options: [
          { text: { zh: '"姓资还是姓社"——资本市场能否在社会主义制度下运行?', en: '"Capitalist or socialist?" — Can a capital market function under socialism?' }, correct: true, feedback: { zh: '这是当年最尖锐的争论。深交所的开市是一次豪赌:如果成功,证明社会主义可以驯化资本力量;如果失败,整个改革路径都将被质疑。三十余年后,答案是全球第七大交易所。', en: 'The sharpest debate of the era. SZSE\'s opening was a gamble: success proves socialism can harness capital; failure questions the entire reform path. Thirty years later: the world\'s 7th-largest exchange.' } },
          { text: { zh: '技术问题——电脑系统不够先进', en: 'Technical issues — computer systems not advanced enough' }, correct: false, feedback: { zh: '技术只是小事。真正的挑战是意识形态:在一个"消灭剥削"为信条的国家里引入股票交易,需要的不是代码,而是思想解放的勇气。', en: 'Technology was minor. The real challenge was ideological: introducing stock trading in a nation built on "eliminating exploitation" required not code but courage of intellectual liberation.' } },
        ],
      },
      {
        q: { zh: '深交所30余年来最大的成就是什么?', en: 'What is SZSE\'s greatest achievement in 30+ years?' },
        options: [
          { text: { zh: '证明了中国可以走出一条独特的资本市场道路——制度创新比规模更重要', en: 'Proved China can forge a unique capital market path — institutional innovation matters more than scale' }, correct: true, feedback: { zh: '深交所不是纽约的复制品。它的创业板(ChiNext)孵化了无数科技企业,注册制改革更是中国资本市场走向成熟的里程碑。这个"试验田",结出了世界级的果实。', en: 'SZSE is no NYSE copy. Its ChiNext board incubated countless tech firms; registration reform is a milestone of maturation. This "laboratory" yielded globally significant fruit.' } },
          { text: { zh: '市值排名高', en: 'High market cap ranking' }, correct: false, feedback: { zh: '市值只是结果。更重要的是过程:从5只股票到数千家上市公司,从争议到共识——深交所证明了一个命题:制度创新是最大的"基建"。', en: 'Market cap is just outcome. The process matters: from 5 stocks to thousands of listings — SZSE proved that institutional innovation is the greatest "infrastructure."' } },
        ],
      },
    ],
    reward: { badge: '📈', badgeName: { zh: '资本实验印', en: 'Seal of the Capital Experiment' }, insight: { zh: '深交所是一场思想解放实验的产物。它证明:最好的制度,不是照搬,而是在自己的土壤上创新生长。', en: 'SZSE was born from intellectual liberation. It proves: the best institutions don\'t copy — they innovate on native soil.' } },
  },

  // ============ N-EG03 港珠澳大桥（近代化与工程）============
  'N-EG03': {
    characters: [
      { name: { zh: '岛隧工程师', en: 'Island-Tunnel Engineer' }, role: { zh: '世纪工程总工程师', en: 'Chief Engineer of the Century Project' }, portrait: '' },
    ],
    intro: {
      zh: '2013年,你是港珠澳大桥沉管隧道施工团队的一名工程师。在伶仃洋40米深的海底,你们要完成人类历史上最长的沉管对接——误差不能超过2厘米。海水压力、洋流干扰、能见度为零……',
      en: '2013. You are an engineer on the HKZM Bridge immersed tunnel team. 40 meters below the Lingding Ocean, you must complete the longest immersed tube joint in history — tolerance: 2cm. Water pressure, currents, zero visibility…',
    },
    scenes: [
      {
        q: { zh: '为什么港珠澳大桥中段要采用沉管隧道而非全程桥梁?', en: 'Why use an immersed tunnel for the middle section instead of a continuous bridge?' },
        options: [
          { text: { zh: '为了不阻碍大型船舶通航——伶仃洋是全球最繁忙航道之一', en: 'To not block mega-ship traffic — Lingding is one of the world\'s busiest shipping lanes' }, correct: true, feedback: { zh: '正确!伶仃洋是珠三角的航运命脉,每天数千艘巨轮经过。如果全部用桥,桥墩会堵塞航道。于是工程师们在海底创造了6.7公里的沉管隧道——人类向深海妥协的智慧杰作。', en: 'Correct! Lingding Ocean is the Pearl Delta\'s shipping lifeline with thousands of mega-vessels daily. Bridge pillars would block the channel — so engineers created a 6.7km immersed tunnel, a masterpiece of human ingenuity yielding to the deep sea.' } },
          { text: { zh: '因为桥梁技术不够先进', en: 'Bridge technology wasn\'t advanced enough' }, correct: false, feedback: { zh: '中国的桥梁技术全球领先,问题不在技术而在航运:伶仃洋是世界最繁忙航道之一,全桥方案会封锁航运。沉管隧道是对航运生态的尊重,也是更高难度的工程挑战。', en: 'China\'s bridge tech is world-leading. The issue isn\'t capability but shipping: an all-bridge solution would block one of the world\'s busiest lanes. The tunnel respects maritime ecology — and is a harder engineering challenge.' } },
        ],
      },
      {
        q: { zh: '港珠澳大桥的建成对大湾区意味着什么?', en: 'What does the HKZM Bridge mean for the Greater Bay Area?' },
        options: [
          { text: { zh: '将百年地理隔阂压缩进一小时经济圈——三城真正融为一体', en: 'Compresses centuries of geographic barriers into a one-hour economic circle — three cities truly become one' }, correct: true, feedback: { zh: '55公里大桥将珠海-澳门与香港的车程从4小时压缩至30分钟。这不只是交通工程,是区域一体化的物理宣言——从此,大湾区从概念变为现实。', en: 'The 55km bridge cut Zhuhai-Macau to Hong Kong travel from 4 hours to 30 minutes. Not just transport but a physical declaration of regional integration — the Bay Area became reality.' } },
          { text: { zh: '只是一座普通的交通工程', en: 'Just an ordinary transport project' }, correct: false, feedback: { zh: '一座"普通"的55公里跨海大桥?它是当今世界最长的海洋工程,创造了多项人类极限纪录。更重要的是:它让"大湾区"从地图概念变成了一小时生活圈的现实。', en: 'An "ordinary" 55km sea crossing? It\'s the world\'s longest ocean engineering project. More importantly: it turned "Greater Bay Area" from a map concept into a one-hour living circle.' } },
        ],
      },
    ],
    reward: { badge: '🌉', badgeName: { zh: '世纪大桥印', en: 'Seal of the Century Bridge' }, insight: { zh: '55公里钢铁,溶解了百年地理隔阂。港珠澳大桥证明:世上没有不可逾越的距离,只有不够大胆的梦想。', en: '55km of steel dissolved centuries of barriers. The bridge proves: no distance is insurmountable, only dreams not bold enough.' } },
  },

  // ============ N-EG04 东深供水工程（近代化与工程）============
  'N-EG04': {
    characters: [
      { name: { zh: '工程建设者', en: 'Construction Worker' }, role: { zh: '跨越边界的供水者', en: 'Cross-border Water Provider' }, portrait: '' },
    ],
    intro: {
      zh: '1964年,香港遭遇百年大旱,三百万市民限量供水。你是东江-深圳供水工程的一名水利工人,接到命令:8个月内,把东江水逆流北调至深圳,再输向香港。这条跨越政治边界的生命线,必须在大旱结束前建成……',
      en: '1964. Hong Kong faces its worst drought in a century, 3 million people on water rationing. You are a hydraulic worker on the Dongjiang-Shenzhen supply project. Orders: in 8 months, lift river water uphill to Shenzhen, then to Hong Kong. This lifeline crossing a political border must be built before the drought ends…',
    },
    scenes: [
      {
        q: { zh: '1960年代,大陆与香港政治关系紧张。为什么仍然决定为香港供水?', en: 'In the tense 1960s, why did the mainland decide to supply water to Hong Kong?' },
        options: [
          { text: { zh: '水是生命,人道关怀超越政治分歧——同胞不能渴死', en: 'Water is life — humanitarian care transcends political differences' }, correct: true, feedback: { zh: '正是这份超越意识形态的人道情感。尽管当时政治复杂,但"同胞不能渴死"这一朴素信念推动了工程上马。一渠清水,比任何政治宣言都更能说明两地的血脉相连。', en: 'Precisely this humanitarian feeling transcending ideology. Despite political complexity, the simple belief that "our people cannot die of thirst" drove the project. A canal of clean water speaks louder than any political declaration.' } },
          { text: { zh: '纯粹是政治考量', en: 'Purely political calculation' }, correct: false, feedback: { zh: '不完全是政治。当三百万同胞面临生存危机时,人道本能超越了一切算计。东深供水工程的伟大之处正在于此:它用最朴素的方式——送水——表达了最深的情感。', en: 'Not purely political. When 3 million compatriots faced survival crisis, humanitarian instinct transcended all calculation. The project\'s greatness: expressing deepest emotion in the simplest way — sending water.' } },
        ],
      },
      {
        q: { zh: '这条"生命线"至今仍在运行。它对今天的大湾区有何启示?', en: 'This "lifeline" still operates today. What does it teach the Bay Area?' },
        options: [
          { text: { zh: '大湾区的融合不是口号——水利、交通、制度的互联互通,早在半世纪前就开始了', en: 'Bay Area integration isn\'t a slogan — water, transport and institutional connectivity started half a century ago' }, correct: true, feedback: { zh: '东深供水是大湾区一体化最早的实践:比港珠澳大桥早54年,比前海合作区早46年。一条水管,比任何政策文件都更有说服力——合作的基础,是生存的共同体。', en: 'Dongjiang water supply is the Bay Area\'s earliest integration: 54 years before the HKZM Bridge, 46 years before Qianhai. One pipe speaks louder than any policy document — cooperation\'s foundation is a community of survival.' } },
          { text: { zh: '只是一个历史工程,和今天无关', en: 'Just a historical project, irrelevant today' }, correct: false, feedback: { zh: '它至今仍供应香港70%以上的淡水!这条生命线从未中断,无论政治风云如何变幻——它是大湾区"命运共同体"最坚实的物质证明。', en: 'It still supplies over 70% of Hong Kong\'s fresh water! This lifeline never stopped regardless of political changes — the most solid physical proof of the Bay Area as a "community of shared destiny."' } },
        ],
      },
    ],
    reward: { badge: '💧', badgeName: { zh: '生命之水印', en: 'Seal of the Water of Life' }, insight: { zh: '一渠清水跨越边界,润泽三百万生命。东深供水工程告诉我们:最深的连接,不是桥梁,而是血脉相通的温度。', en: 'A canal crossing borders nourished three million lives. It teaches: the deepest connection is not bridges but the warmth of shared blood.' } },
  },

  // ============ N-SC01 华强北电子市场（科学星火）============
  'N-SC01': {
    characters: [
      { name: { zh: '电子创业者', en: 'Electronics Entrepreneur' }, role: { zh: '华强北档口老板', en: 'Huaqiangbei Booth Owner' }, portrait: '' },
    ],
    intro: {
      zh: '2008年,你是华强北一个10平方米档口的年轻老板。从早上9点到晚上7点,全世界的硬件创业者排着队来找你——因为你的档口能找到地球上任何一颗电子元器件。一位硅谷来的创始人递过来一张PCB设计图,说:"我需要在72小时内做出原型机。"',
      en: '2008. You own a 10sqm booth in Huaqiangbei. From 9AM to 7PM, hardware entrepreneurs worldwide line up — because your booth can source any electronic component on Earth. A Silicon Valley founder hands you a PCB design: "I need a prototype in 72 hours."',
    },
    scenes: [
      {
        q: { zh: '为什么全世界的硬件创业者都要来华强北?这里有什么是硅谷没有的?', en: 'Why do hardware entrepreneurs worldwide come to Huaqiangbei? What does it have that Silicon Valley doesn\'t?' },
        options: [
          { text: { zh: '全球最完整的电子供应链——从芯片到外壳,一个街区全搞定', en: 'World\'s most complete electronics supply chain — chip to case, all within one block' }, correct: true, feedback: { zh: '世界上没有第二个地方能做到这一点。华强北一个街区的零件丰富度,超过美国整个分销体系。这意味着:在这里,72小时内可以从概念到实物——全球任何其他城市需要数周。', en: 'Nowhere else on Earth can match this. One Huaqiangbei block has more component variety than America\'s entire distribution system. Here: concept to physical prototype in 72 hours — weeks anywhere else.' } },
          { text: { zh: '因为便宜', en: 'Because it\'s cheap' }, correct: false, feedback: { zh: '价格只是表面优势。华强北真正的壁垒是"生态完整性":全球三分之一消费电子零件在此流转,从设计、采购、打样到量产的全链路都能在步行范围内完成——这是几十年产业积累的不可复制的生态。', en: 'Price is only surface advantage. The real moat is "ecosystem completeness": one-third of global consumer electronics parts flow here, the entire chain from design to mass production walkable — an irreplicable ecosystem built over decades.' } },
        ],
      },
      {
        q: { zh: '有人说华强北是"山寨之都",你怎么看这个评价的演变?', en: 'Some call Huaqiangbei "Shanzhai Capital." How has this evaluation evolved?' },
        options: [
          { text: { zh: '从"山寨"到"创新"——华强北的逆袭正是中国制造升级的缩影', en: 'From "copycat" to "innovation" — Huaqiangbei\'s transformation mirrors China\'s manufacturing upgrade' }, correct: true, feedback: { zh: '精辟!早期确实有大量仿制,但正是这种"快速学习"能力进化为今天的"快速创新"。大疆的第一台无人机、柔宇的第一块柔性屏,原型都来自华强北生态。从模仿到超越,这是创新的必经之路。', en: 'Brilliant! Early copying evolved into rapid innovation. DJI\'s first drone and Royole\'s first flexible screen prototypes all came from the Huaqiangbei ecosystem. Imitation to transcendence — the necessary path of innovation.' } },
          { text: { zh: '它仍然只是一个卖廉价电子产品的市场', en: 'Still just a market selling cheap electronics' }, correct: false, feedback: { zh: '大错。今天的华强北是全球硬件创新的心脏:物联网模组、AI芯片、可穿戴设备的供应链核心都在这里。曾经的"山寨"基因,已进化为"72小时快速打样"的创新加速器。', en: 'Wrong. Today Huaqiangbei is the global hardware innovation heart: IoT modules, AI chips, wearables supply chains are centered here. Former "copycat" DNA evolved into a 72-hour prototyping accelerator.' } },
        ],
      },
    ],
    reward: { badge: '🔌', badgeName: { zh: '硬件圣地印', en: 'Seal of the Hardware Mecca' }, insight: { zh: '全世界独一无二的华强北,用一个街区的密度,容纳了人类电子文明的所有零件。这里是梦想最快变成现实的地方。', en: 'The unique Huaqiangbei contains all components of electronic civilization in one block — where dreams become reality fastest.' } },
  },

  // ============ N-SC02 腾讯滨海大厦（科学星火）============
  'N-SC02': {
    characters: [
      { name: { zh: '马化腾', en: 'Pony Ma' }, role: { zh: '腾讯创始人·CEO', en: 'Tencent Founder & CEO' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/c7f6d062-42e6-42eb-a2f3-73fd13717f00/image_1781684659_1_1.jpg' },
    ],
    intro: {
      zh: '1998年,你是深圳南山区华强北附近一间小出租屋里的程序员。你的老板马化腾刚从润迅离职,带着5个人、50万启动资金,要做一个叫OICQ的即时通讯软件。没人相信这个小团队能成功……',
      en: '1998. You are a programmer in a tiny rental near Huaqiangbei. Your boss Pony Ma just left his job, leading 5 people with 500K RMB to build an instant messenger called OICQ. Nobody believes this tiny team can succeed…',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '腾讯创业初期几乎活不下去,马化腾曾想100万卖掉公司。为什么没卖成?', en: 'Early Tencent nearly died; Ma once wanted to sell for 1M RMB. Why didn\'t it happen?' },
        options: [
          { text: { zh: '没有买家愿意出价——当时没人看到即时通讯的未来', en: 'No buyer would pay — nobody saw instant messaging\'s future then' }, correct: true, feedback: { zh: '命运的讽刺。1999年没有人愿意花100万买腾讯,因为"网络寻呼"看不到商业模式。今天腾讯市值超过3万亿——那个无人问津的小软件,后来连接了13亿人的数字生活。', en: 'Irony of fate. In 1999 nobody would pay 1M for Tencent — "internet pager" had no business model. Today Tencent\'s market cap exceeds 3 trillion — that unwanted little software now connects 1.3 billion digital lives.' } },
          { text: { zh: '马化腾改变了主意,决定坚持', en: 'Ma changed his mind and persisted' }, correct: false, feedback: { zh: '事实更残酷:不是马化腾不想卖,是真的没人买。所有人都觉得"即时通讯"不值钱——这逼迫腾讯必须自己找到活路。有时候,被拒绝恰恰是命运最好的安排。', en: 'The truth is harsher: Ma wanted to sell but nobody bought. Everyone thought messaging was worthless — forcing Tencent to find its own way. Sometimes rejection is destiny\'s best arrangement.' } },
        ],
      },
      {
        q: { zh: '从QQ到微信,腾讯做对了什么?', en: 'From QQ to WeChat, what did Tencent get right?' },
        options: [
          { text: { zh: '永远在自我革命——用微信颠覆自己的QQ,不给对手留机会', en: 'Constant self-revolution — disrupting its own QQ with WeChat, leaving no chance for competitors' }, correct: true, feedback: { zh: '这是腾讯最可怕的特质:敢于用自己的新产品杀死自己的旧产品。2011年微信诞生时,QQ月活超8亿——腾讯选择自我颠覆而非守旧,这份勇气让它始终站在时代浪尖。', en: 'Tencent\'s most formidable trait: daring to kill its own old product with a new one. When WeChat launched in 2011, QQ had 800M monthly users — choosing self-disruption over legacy, this courage keeps it riding the wave.' } },
          { text: { zh: '运气好,赶上了移动互联网红利', en: 'Lucky, catching the mobile internet wave' }, correct: false, feedback: { zh: '运气只是入场券。腾讯的伟大在于:当所有人都在靠QQ躺着赚钱时,马化腾力排众议孵化微信——这是用自己的左手打右手的勇气。中国科技史上,很少有公司敢这样自我革命。', en: 'Luck is just the entry ticket. Tencent\'s greatness: when everyone was profiting from QQ, Ma championed WeChat — the courage to attack yourself. Few Chinese tech companies dare such self-revolution.' } },
        ],
      },
    ],
    reward: { badge: '💬', badgeName: { zh: '社交帝国印', en: 'Seal of the Social Empire' }, insight: { zh: '从5个人的出租屋到连接13亿人,腾讯告诉我们:最伟大的公司,是敢于革自己命的公司。', en: 'From 5 people in a rental to connecting 1.3 billion — Tencent teaches: the greatest companies dare to revolutionize themselves.' } },
  },

  // ============ N-SC03 大疆天空之城（科学星火）============
  'N-SC03': {
    characters: [
      { name: { zh: '汪滔', en: 'Frank Wang' }, role: { zh: '大疆创始人', en: 'DJI Founder' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/d299e600-7ec0-4a2a-bdf3-ed25ea82f309/image_1781684661_1_3.jpg' },
    ],
    intro: {
      zh: '2006年,你是香港科技大学宿舍里的一名研究生。你的室友汪滔连续三天没睡觉,在焊台前调试他的飞控板——"我要让无人机像手机一样简单,每个人都能飞。"你看着满桌散落的电子零件,觉得他疯了……',
      en: '2006. You are a grad student at HKUST. Your roommate Frank Wang hasn\'t slept in three days, debugging his flight controller — "I want drones as simple as phones. Everyone should fly." Looking at scattered components, you think he\'s crazy…',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '汪滔为什么执着于"让每个人都能飞"?在他之前,无人机是什么样的?', en: 'Why was Wang obsessed with "letting everyone fly"? What were drones like before him?' },
        options: [
          { text: { zh: '之前无人机是军方和科研专属的昂贵玩具——汪滔要把它平民化', en: 'Before: expensive military/research toys — Wang wanted to democratize them' }, correct: true, feedback: { zh: '正是。2006年以前,"无人机"意味着数十万美元的军用装备。汪滔的疯狂之处在于:他相信华强北的供应链+软件算法,可以把成本压到千元级,让普通人拥有"上帝视角"。', en: 'Exactly. Before 2006, "drone" meant military equipment costing hundreds of thousands. Wang\'s madness: he believed Huaqiangbei\'s supply chain + algorithms could bring costs to consumer level, giving everyone a "God\'s eye view."' } },
          { text: { zh: '他只是想做一个好玩的遥控飞机', en: 'He just wanted to make a fun remote-control aircraft' }, correct: false, feedback: { zh: '远不止"好玩"。汪滔的愿景是重新定义人与天空的关系:当每个人都拥有一台稳定飞行的智能相机时,航拍、农业、救援、测绘——整个产业链都将被颠覆。', en: 'Far beyond "fun." Wang\'s vision was to redefine humanity\'s relationship with the sky: when everyone has a stable flying smart camera, aerial photography, agriculture, rescue, surveying — entire industries are disrupted.' } },
        ],
      },
      {
        q: { zh: '大疆如今占全球消费无人机70%以上市场。从宿舍创业到"统治天空",最关键的因素是什么?', en: 'DJI now holds 70%+ of global consumer drones. From dorm startup to "ruling the sky" — what was the key factor?' },
        options: [
          { text: { zh: '极致的技术偏执——不妥协的产品主义,只做最好的飞控和相机', en: 'Extreme tech obsession — uncompromising product-first philosophy, only the best flight control and camera' }, correct: true, feedback: { zh: '汪滔是中国罕见的"技术偏执狂"型创始人。他拒绝价格战,只追求技术巅峰。大疆的飞控算法全球领先,相机技术对标哈苏——这种不妥协,让对手永远追不上。', en: 'Wang is a rare "tech-obsessed" Chinese founder. He rejects price wars, pursuing only technical excellence. DJI\'s flight algorithms lead globally, cameras benchmark Hasselblad — this uncompromising stance keeps competitors forever behind.' } },
          { text: { zh: '市场营销做得好', en: 'Good marketing' }, correct: false, feedback: { zh: '大疆几乎不做传统营销。汪滔本人极度低调,从不参加行业峰会。大疆的增长完全靠产品力:当你的无人机比所有对手都飞得稳、拍得好,市场自然归你。', en: 'DJI barely does traditional marketing. Wang is extremely low-profile, never attending industry summits. Growth is entirely product-driven: when your drone flies steadier and shoots better than all competitors, the market is naturally yours.' } },
        ],
      },
    ],
    reward: { badge: '🛸', badgeName: { zh: '天空之主印', en: 'Seal of the Sky Master' }, insight: { zh: '从宿舍焊台到统治全球天空,大疆证明:最好的创业,是把一个"疯狂"的想法做到极致,然后让世界追赶你。', en: 'From dorm soldering to ruling global skies, DJI proves: the best startup is taking a "crazy" idea to the extreme, then letting the world chase you.' } },
  },

  // ============ N-SC04 光明科学城（科学星火）============
  'N-SC04': {
    characters: [
      { name: { zh: '科学家', en: 'Scientist' }, role: { zh: '大科学装置研究员', en: 'Major Science Facility Researcher' }, portrait: '' },
    ],
    intro: {
      zh: '2025年,你是光明科学城合成生物大装置的一名青年科学家。周围是全球最前沿的脑科学、材料基因组学实验室。你的导师说:"深圳终于不只是\'制造\'了——我们要从这里开始\'创造\'。"',
      en: '2025. You are a young scientist at Guangming Science City\'s synthetic biology facility. Surrounded by cutting-edge brain science and materials genomics labs. Your advisor says: "Shenzhen is finally not just \'making\' — we begin \'creating\' from here."',
    },
    scenes: [
      {
        q: { zh: '深圳为什么要在光明建设大科学装置集群?这对城市意味着什么?', en: 'Why is Shenzhen building major science facilities in Guangming? What does it mean for the city?' },
        options: [
          { text: { zh: '从"世界工厂"升级为"世界实验室"——基础科研是创新金字塔的塔尖', en: 'Upgrading from "world factory" to "world laboratory" — basic research is the pyramid\'s apex' }, correct: true, feedback: { zh: '深圳的产业链从来不缺"应用端",但缺"源头活水"。光明科学城要补的正是这一环:当你拥有世界级大科学装置时,原始创新不再受制于人。这是深圳从"Made"到"Created"的关键一跃。', en: 'Shenzhen\'s industry chain never lacked "application end" but lacked "source water." Guangming fills this gap: with world-class facilities, original innovation is no longer dependent on others. The key leap from "Made" to "Created."' } },
          { text: { zh: '只是政绩工程', en: 'Just a vanity project' }, correct: false, feedback: { zh: '大科学装置是国家战略,不是地方政绩。合成生物、脑科学、材料基因组——这些领域的突破将定义21世纪的产业版图。深圳选择在这里落子,是对未来五十年的战略投资。', en: 'Major science facilities are national strategy, not local vanity. Synthetic biology, brain science, materials genomics breakthroughs will define 21st-century industries — Shenzhen\'s strategic investment for the next fifty years.' } },
        ],
      },
      {
        q: { zh: '光明科学城被称为"大湾区的CERN"。这个类比意味着什么?', en: 'Guangming is called "the CERN of the Bay Area." What does this analogy imply?' },
        options: [
          { text: { zh: '像CERN汇聚全球物理学家一样,光明要成为吸引全球顶尖科学家的磁石', en: 'Like CERN attracting global physicists, Guangming aims to be a magnet for the world\'s top scientists' }, correct: true, feedback: { zh: '正是CERN模式的精髓:顶级装置→吸引顶级人才→产出顶级成果。深圳的策略很清晰:用世界级硬件(大装置)吸引世界级软件(科学家),最终收获世界级知识产权。这是深圳进入全球科研第一梯队的入场券。', en: 'The essence of the CERN model: top facilities → attract top talent → produce top results. Shenzhen\'s strategy: use world-class hardware (facilities) to attract world-class software (scientists), harvesting world-class IP. The ticket to global research\'s first tier.' } },
          { text: { zh: '只是一个夸张的名称', en: 'Just an exaggerated name' }, correct: false, feedback: { zh: '并非夸张。CERN之所以伟大,是因为它用"大装置"汇聚了全世界最聪明的头脑。光明科学城正在复制这一逻辑:当你拥有别人没有的实验条件时,全球人才会主动涌来。', en: 'Not exaggerated. CERN is great because its facilities attract the world\'s brightest minds. Guangming replicates this logic: when you have experimental conditions others don\'t, global talent flows to you.' } },
        ],
      },
    ],
    reward: { badge: '🔬', badgeName: { zh: '科学高地印', en: 'Seal of the Science Frontier' }, insight: { zh: '从"世界工厂"到"世界实验室",光明科学城标志着深圳的终极进化:不再只是制造别人的发明,而是创造自己的未来。', en: 'From "world factory" to "world laboratory," Guangming marks Shenzhen\'s ultimate evolution: no longer just making others\' inventions, but creating its own future.' } },
  },

  // ============ M04 大鹏所城（觉醒主题）============
  M04: {
    characters: [
      { name: { zh: '赖恩爵', en: 'Lai Enjue' }, role: { zh: '大鹏水师将领', en: 'Dapeng Naval Commander' }, portrait: '' },
    ],
    intro: {
      zh: '1839年,你是大鹏所城的一名年轻水兵。英国战舰频繁出现在珠江口外,鸦片走私猖獗。将军赖恩爵正在城头眺望大海,紧握刀柄——一场改变中国命运的战争,即将在这里打响第一枪……',
      en: '1839. You are a young sailor at Dapeng Fortress. British warships lurk off the Pearl River estuary, opium smuggling rampant. General Lai Enjue gazes seaward from the ramparts, gripping his sword — a war that will change China\'s destiny is about to fire its first shot here…',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '赖恩爵在九龙海战中以弱胜强,取得了第一次鸦片战争最早的胜利之一。他是如何做到的?', en: 'Lai won one of the Opium War\'s first victories against stronger forces. How?' },
        options: [
          { text: { zh: '利用本地海况与小型快船优势,在浅水区伏击英军大船', en: 'Using local sea knowledge and fast small boats to ambush British ships in shallow waters' }, correct: true, feedback: { zh: '赖恩爵深谙地利。他率领的大鹏水师用小船灵活穿插,在浅水区让英军巨舰无法施展。这场九龙海战是中国近代反抗的第一声呐喊——深圳之"鹏城"雅号,由此而来。', en: 'Lai knew the terrain. His Dapeng navy used small boats to outmaneuver British warships in shallow waters. This Battle of Kowloon was China\'s first cry of modern resistance — giving Shenzhen its elegant name "Peng Cheng."' } },
          { text: { zh: '凭借武器优势正面硬刚', en: 'Superior weapons in head-on confrontation' }, correct: false, feedback: { zh: '恰恰相反,中国海军武器远逊于英军。赖恩爵的智慧在于"以弱胜强":用地利、速度和士气弥补火力差距。这种精神,正是"鹏城"的骨气所在。', en: 'The opposite — Chinese naval weapons were far inferior. Lai\'s wisdom was "weak defeating strong": using terrain, speed and morale to compensate. This spirit is the backbone of "Peng Cheng."' } },
        ],
      },
      {
        q: { zh: '深圳的古称"鹏城"源自大鹏所城。这个名字对今天的深圳意味着什么?', en: 'Shenzhen\'s ancient name "Peng Cheng" comes from Dapeng. What does it mean today?' },
        options: [
          { text: { zh: '"鹏"是大鹏鸟——象征展翅高飞、不畏强者,这正是深圳的城市精神', en: '"Peng" is the mythic roc — symbolizing soaring fearlessly, Shenzhen\'s city spirit' }, correct: true, feedback: { zh: '从抵御列强的军事要塞,到改革开放的经济奇迹——"鹏城"的精神一脉相承:面对强大的对手,绝不退缩,而是展翅高飞。今天深圳的科技企业家们,继承的正是这份骨气。', en: 'From military fortress resisting foreign powers to economic miracle of reform — "Peng Cheng" spirit is consistent: never retreat against strong opponents, but soar high. Today\'s tech entrepreneurs inherit this spirit.' } },
          { text: { zh: '只是一个历史地名,没有特殊含义', en: 'Just a historical place name, no special meaning' }, correct: false, feedback: { zh: '一个城市的名字不会无缘无故流传六百年。"鹏城"承载着深圳最古老的精神DNA:面对巨浪不退缩,在困境中展翅飞翔——从赖恩爵到任正非,这条精神线从未断裂。', en: 'A city name doesn\'t endure 600 years without reason. "Peng Cheng" carries Shenzhen\'s most ancient spiritual DNA: never retreat before great waves — from Lai Enjue to Ren Zhengfei, this thread never broke.' } },
        ],
      },
    ],
    reward: { badge: '⚔️', badgeName: { zh: '鹏城铁骨印', en: 'Seal of Peng Cheng\'s Iron Spirit' }, insight: { zh: '"鹏城"之名,诞生于一场以弱胜强的海战。六百年后,同样的精神在这座城市的每一家企业中延续。', en: 'The name "Peng Cheng" was born from a battle of the weak defeating the strong. Six centuries later, the same spirit continues in every company in this city.' } },
  },

  // ============ M05 中英街（觉醒主题）============
  M05: {
    characters: [
      { name: { zh: '界碑见证者', en: 'Boundary Witness' }, role: { zh: '百年沧桑的讲述者', en: 'Narrator of a Century\'s Changes' }, portrait: '' },
    ],
    intro: {
      zh: '1997年6月30日深夜,你站在中英街的第三号界碑旁。午夜十二点即将到来——从明天开始,这条分隔两个世界的小街,将拥有全新的意义。百年屈辱的句号,就要在这里画下……',
      en: 'Late night, June 30, 1997. You stand by Boundary Stone No.3 on Zhongying Street. Midnight approaches — from tomorrow, this street dividing two worlds gains new meaning. A century of humiliation\'s period is about to be written here…',
    },
    scenes: [
      {
        q: { zh: '中英街仅数米宽,却曾分隔两种政治制度。这条街最深刻的历史意义是什么?', en: 'Zhongying Street is mere meters wide, yet divided two systems. What is its deepest historical meaning?' },
        options: [
          { text: { zh: '它是中国近代百年屈辱的活化石——从割地到回归的全过程浓缩在一条街上', en: 'A living fossil of China\'s century of humiliation — from cession to return, compressed into one street' }, correct: true, feedback: { zh: '这条街见证了1898年《展拓香港界址专条》的羞辱,也见证了1997年回归的荣光。它不只是一条路,是一部立体的近代史教科书——沧海桑田,尽在咫尺之间。', en: 'This street witnessed the 1898 humiliation of the "Convention for the Extension of Hong Kong Territory" and the 1997 glory of return. Not just a road but a 3D modern history textbook.' } },
          { text: { zh: '只是一个购物的好地方', en: 'Just a good shopping spot' }, correct: false, feedback: { zh: '购物只是表象。每一块界碑上都刻着不平等条约的伤痕:1898年英国强租新界,这条街从此一分为二。走过这里,就是走过一部浓缩的中国近代史。', en: 'Shopping is just surface. Each boundary stone bears scars of unequal treaties. Walking here is walking through concentrated modern Chinese history.' } },
        ],
      },
      {
        q: { zh: '回归后,中英街仍保留着界碑和通行证制度。这种"保留"有什么深意?', en: 'After the return, boundary stones and permits remain. Why keep them?' },
        options: [
          { text: { zh: '铭记历史,警示未来——让后人永远不忘曾经的分离与屈辱', en: 'Remember history, warn the future — never forget past separation and humiliation' }, correct: true, feedback: { zh: '保留界碑不是守旧,是智慧。当游客抚摸那些百年石碑时,他们触摸的是历史的伤口——而伤口的存在,正是为了提醒我们:和平与统一来之不易,值得永远珍惜。', en: 'Keeping the stones isn\'t conservatism but wisdom. When visitors touch century-old stones, they touch history\'s wounds — reminding us: peace and unity are hard-won and forever precious.' } },
          { text: { zh: '只是行政上没来得及拆除', en: 'Just administrative oversight, not yet removed' }, correct: false, feedback: { zh: '刻意保留。中英街的界碑是国家级文物保护单位——它们被刻意留存,因为遗忘历史比记住它更危险。一条街上的八块界碑,是八部浓缩的国耻教材。', en: 'Deliberately preserved. The boundary stones are nationally protected relics — kept because forgetting history is more dangerous than remembering. Eight stones are eight concentrated lessons in national history.' } },
        ],
      },
    ],
    reward: { badge: '🪨', badgeName: { zh: '界碑铭记印', en: 'Seal of the Boundary Stone' }, insight: { zh: '一条数米宽的小街,承载了百年屈辱与回归荣光。中英街告诉我们:最小的地方,也能写下最大的历史。', en: 'A street mere meters wide carries a century of humiliation and glory. The smallest place can write the largest history.' } },
  },

  // ============ M11 莲花山（觉醒主题）============
  M11: {
    characters: [
      { name: { zh: '邓小平', en: 'Deng Xiaoping' }, role: { zh: '改革开放总设计师', en: 'Chief Architect of Reform' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/ab7d0f27-b05b-4c6b-91ff-ada347380add/image_1781684656_1_1.jpg' },
    ],
    intro: {
      zh: '1992年春天,你是一名随行记者。邓小平站在深圳莲花山顶,俯瞰着这座不可思议的城市——十二年前,这里还是一片稻田和渔村。他说:"深圳的发展和经验证明,我们建立经济特区的政策是正确的。"',
      en: 'Spring 1992. You are a journalist accompanying Deng Xiaoping atop Lianhua Mountain. He overlooks this incredible city — twelve years ago, just rice fields and fishing villages. He says: "Shenzhen\'s development proves our SEZ policy was correct."',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '邓小平为什么选深圳作为中国第一个经济特区?', en: 'Why did Deng choose Shenzhen as China\'s first Special Economic Zone?' },
        options: [
          { text: { zh: '紧邻香港,可以承接外资和国际经验,同时用边境隔离"试验风险"', en: 'Adjacent to Hong Kong for foreign investment, while the border isolates "experimental risk"' }, correct: true, feedback: { zh: '一着妙棋。深圳紧贴香港,可以最快速度吸引外资和先进经验;同时作为"边陲小镇",即使试验失败也不会影响内地大局。这就是"在南海边画一个圈"的精妙之处——进可攻退可守。', en: 'A brilliant move. Adjacent to Hong Kong for fastest foreign investment; as a "border town," even failure wouldn\'t affect the mainland. The genius of "drawing a circle by the South Sea" — advance or retreat possible.' } },
          { text: { zh: '只是随机选择', en: 'Random choice' }, correct: false, feedback: { zh: '绝非随机。深圳的地理位置是精心考量:毗邻香港获取国际资本和经验,边境线形成天然的"制度防火墙",面积小便于管控试验。每一个条件都指向同一个答案:这里最适合当中国改革的"试管"。', en: 'Far from random. Geography was carefully considered: Hong Kong adjacency for international capital, the border as institutional firewall, small size for controlled experiments. All pointing to one answer: the best "test tube" for reform.' } },
        ],
      },
      {
        q: { zh: '从1980年"画圈"到今天,深圳用40余年从渔村变为全球科技之都。这对世界意味着什么?', en: 'From 1980\'s "circle" to today, Shenzhen transformed from village to global tech capital in 40 years. What does this mean for the world?' },
        options: [
          { text: { zh: '它证明了一种新的发展模式:不走殖民掠夺的老路,靠改革创新一样可以崛起', en: 'It proves a new development model: rising through reform and innovation, not colonial plunder' }, correct: true, feedback: { zh: '深圳是人类发展史上的奇迹。不靠殖民、不靠战争、不靠资源垄断——仅靠制度创新和人民奋斗,四十年从零到GDP超过2.5万亿。这条路径,为全世界发展中国家提供了全新的想象空间。', en: 'Shenzhen is a miracle in human development. Not through colonialism, war or resource monopoly — only institutional innovation and people\'s struggle, zero to 2.5 trillion GDP in forty years. A new imagination space for all developing nations.' } },
          { text: { zh: '只是中国的一个特例,不可复制', en: 'Just a Chinese exception, not replicable' }, correct: false, feedback: { zh: '确实难以完全复制,但深圳模式的核心——制度创新+对外开放+人才聚集+容错试验——已经启发了全球数十个经济特区。从"深圳奇迹"中提取的智慧,正在以不同形态在全世界生根。', en: 'Hard to fully replicate, but Shenzhen\'s core — institutional innovation + openness + talent + experimental tolerance — has inspired dozens of global SEZs. Wisdom from the "Shenzhen miracle" is taking root worldwide in different forms.' } },
        ],
      },
    ],
    reward: { badge: '⭕', badgeName: { zh: '画圈改革印', en: 'Seal of the Circle of Reform' }, insight: { zh: '"一位老人在南海边画了一个圈"——这个圈里诞生了人类历史上最不可思议的城市奇迹。莲花山是见证者。', en: '"An old man drew a circle by the South Sea" — inside that circle was born the most incredible urban miracle in human history. Lianhua Mountain witnessed it all.' } },
  },

  // ============ N-AW01 沙井蚝文化园（美食文化）============
  'N-AW01': {
    characters: [
      { name: { zh: '蚝民长老', en: 'Oyster Elder' }, role: { zh: '千年蚝乡传承人', en: 'Millennium Oyster Heritage Keeper' }, portrait: '' },
    ],
    intro: {
      zh: '你是宋朝沙井海边的一名年轻蚝民。祖辈从北方迁来此地,发现珠江口的咸淡水交界处,蚝肥美异常。族长教你:以石投水,蚝苗附着而生——千年养蚝法,从这一刻开始传承……',
      en: 'You are a young oyster farmer in Song Dynasty Shajing. Ancestors migrated from the north and discovered the Pearl River\'s brackish waters produce extraordinarily fat oysters. The elder teaches: cast stones in water, spat attaches — a millennium of oyster farming begins…',
    },
    scenes: [
      {
        q: { zh: '沙井蚝为什么格外鲜美?千年来这里的蚝有什么独特之处?', en: 'Why are Shajing oysters exceptionally flavorful? What makes them unique for a millennium?' },
        options: [
          { text: { zh: '珠江口咸淡水交汇处——独特的半咸水环境造就了蚝的鲜甜平衡', en: 'Pearl River estuary brackish zone — unique salinity balance creates perfect sweet-savory flavor' }, correct: true, feedback: { zh: '正是这片珠江口的"咸淡水交界"魔法。海水提供矿物质鲜味,淡水带来甜润——两者完美交融于蚝肉之中。千年来,沙井蚝民世世代代守护着这片咸淡水的秘密。', en: 'The "brackish zone" magic of the Pearl River estuary. Seawater provides mineral umami, freshwater brings sweetness — perfectly fused in the oyster flesh. For a millennium, Shajing farmers have guarded this brackish secret.' } },
          { text: { zh: '品种特殊', en: 'Special species' }, correct: false, feedback: { zh: '品种只是一部分。真正的秘密在于水——珠江入海口独特的咸淡水比例、水温和潮汐节律,共同塑造了沙井蚝无法复制的风味。离开这片水域,同样的蚝种也养不出这个味道。', en: 'Species is only part. The real secret is water — the Pearl River estuary\'s unique salinity ratio, temperature and tidal rhythm create Shajing oysters\' irreplicable flavor. The same species elsewhere can\'t match it.' } },
        ],
      },
      {
        q: { zh: '沙井养蚝千年,对大湾区饮食文化有什么深远影响?', en: 'A millennium of oyster farming — what is its deep impact on Bay Area food culture?' },
        options: [
          { text: { zh: '蚝油、蚝烙、生腌蚝——沙井蚝是岭南饮食"鲜"字的源头之一', en: 'Oyster sauce, oyster omelette, raw cured — Shajing oysters are a source of Lingnan cuisine\'s "freshness"' }, correct: true, feedback: { zh: '发源于此的蚝油,如今是全球中餐厨房的必备调料;蚝烙(蚝煎)成为潮汕粤菜的灵魂小吃。一颗千年的蚝,滋养了整个岭南饮食文明对"鲜"的极致追求。', en: 'Oyster sauce originating here is now essential in Chinese kitchens worldwide; oyster omelette became a soul snack of Cantonese cuisine. One millennium-old oyster nourished Lingnan food culture\'s ultimate pursuit of "freshness."' } },
          { text: { zh: '没什么影响,只是地方特产', en: 'No impact, just local produce' }, correct: false, feedback: { zh: '影响深远!李锦记蚝油就诞生于珠江口一带,如今行销全球。蚝烙、炭烤蚝、蚝豉更是粤菜灵魂。可以说,没有珠江口的蚝,就没有今天岭南饮食的"鲜味底色"。', en: 'Profound impact! Lee Kum Kee oyster sauce was born in the Pearl River area, now sold globally. Without Pearl River oysters, there would be no "umami foundation" of Lingnan cuisine.' } },
        ],
      },
    ],
    reward: { badge: '🦪', badgeName: { zh: '千年蚝乡印', en: 'Seal of the Millennium Oyster Shore' }, insight: { zh: '一颗蚝,养了千年。沙井告诉我们:最好的食物不需要发明,只需要一代代人守护那片恰到好处的水域。', en: 'One oyster, farmed a millennium. Shajing teaches: the best food needs no invention, only generations guarding the perfect waters.' } },
  },

  // ============ N-AW02 深井烧鹅（美食文化）============
  'N-AW02': {
    characters: [
      { name: { zh: '烧腊师傅', en: 'BBQ Master' }, role: { zh: '三代传承的烧鹅匠人', en: 'Third-generation Roast Goose Artisan' }, portrait: '' },
    ],
    intro: {
      zh: '你是香港深井村一位烧腊师傅的学徒。凌晨四点,师父已经开始为烧鹅"上皮水"——蜂蜜、白醋、麦芽糖按秘密比例调配,刷上鹅身后风干。"好烧鹅,三分靠火候,七分靠耐心。"他说。',
      en: 'You are an apprentice to a roast goose master in Sham Tseng. 4AM, master is already applying "skin water" — honey, vinegar, malt sugar in secret ratios, brushed on then air-dried. "Great roast goose: 30% fire, 70% patience," he says.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '深井烧鹅的"皮脆肉滑汁多"是怎么做到的?最关键的技术秘密是什么?', en: 'Crispy skin, smooth meat, juicy inside — what\'s the key technical secret of Sham Tseng roast goose?' },
        options: [
          { text: { zh: '密封烤制法——封炉让蒸汽在内部循环,先蒸后烤,外焦内嫩', en: 'Sealed roasting — closed oven circulates steam, steaming then roasting for crispy outside and tender inside' }, correct: true, feedback: { zh: '师父的绝活!密封炉让水蒸气无法逸出,先以蒸汽将肉质焖至软嫩,再开炉以高温将外皮烤至金红酥脆。这是粤式烧腊对"矛盾统一"最极致的表达:又脆又嫩,看似不可能却做到了。', en: 'Master\'s secret! A sealed oven traps steam, first steaming meat tender, then opening for high heat to crisp the skin golden-red. Cantonese BBQ\'s ultimate expression of "unity of opposites": crispy yet tender, seemingly impossible yet achieved.' } },
          { text: { zh: '用高温大火直接烤', en: 'Direct high-heat roasting' }, correct: false, feedback: { zh: '大火直烤只会得到干柴。深井烧鹅的精妙在于"先蒸后烤"的密封法:利用鹅自身油脂的蒸汽在密闭空间循环,让肉质软嫩后再脆皮——这需要数十年的经验掌控。', en: 'Direct fire only produces dryness. The genius is "steam then roast" in a sealed oven: the goose\'s own fat creates steam circulating in enclosed space, tenderizing before crisping — requiring decades of experience.' } },
        ],
      },
      {
        q: { zh: '烧鹅从珠三角小食到登上全球米其林殿堂,这说明了什么?', en: 'From Pearl River Delta street food to global Michelin recognition — what does this say?' },
        options: [
          { text: { zh: '最伟大的美食不需要昂贵食材——极致的技艺可以让最朴素的食物封神', en: 'Greatest food needs no luxury ingredients — supreme technique can elevate the humblest food to divine' }, correct: true, feedback: { zh: '一只鹅,全世界都有。但只有粤菜师傅用数十年精进的技艺,把一只普通的鹅升华为米其林星级艺术品。这就是岭南美食哲学:不求稀有,但求极致——在平凡中创造不凡。', en: 'Geese exist everywhere. But only Cantonese masters, with decades of refined technique, elevate an ordinary goose to Michelin art. Lingnan food philosophy: not rarity but perfection — creating the extraordinary from the ordinary.' } },
          { text: { zh: '只是运气好被米其林发现', en: 'Just lucky to be discovered by Michelin' }, correct: false, feedback: { zh: '米其林只是认证,而非创造。深井烧鹅在获星之前已经火了半个世纪——是数代匠人的坚持让它达到了"无法忽视"的高度。真正的美食,不需要等待发现,它自己就是传奇。', en: 'Michelin certifies, not creates. Sham Tseng roast goose was famous half a century before stars — generations of persistence made it "impossible to ignore." True cuisine doesn\'t wait for discovery; it is legend.' } },
        ],
      },
    ],
    reward: { badge: '🍗', badgeName: { zh: '烧鹅封神印', en: 'Seal of the Divine Roast Goose' }, insight: { zh: '一只鹅,数代人的极致追求。深井烧鹅告诉我们:平凡的食材加上不凡的匠心,就是最伟大的美食。', en: 'One goose, generations of extreme pursuit. Sham Tseng teaches: ordinary ingredients plus extraordinary craftsmanship is the greatest cuisine.' } },
  },

  // ============ N-AW03 顺德·粤菜宗师之乡（美食文化）============
  'N-AW03': {
    characters: [
      { name: { zh: '粤厨宗师', en: 'Cantonese Grand Chef' }, role: { zh: '顺德凤城菜传人', en: 'Shunde Fengcheng Cuisine Heir' }, portrait: '' },
    ],
    intro: {
      zh: '清晨五点,顺德均安鱼市。你跟随师父——一位三代传承的粤菜宗师——挑选今天的食材。他蹲在鱼摊前,用手指轻弹活鱼的鳃盖:"看这鳃色,红如朱砂,这才是最鲜的。粤菜的魂,就在这一个\'鲜\'字。"',
      en: 'Dawn, 5AM, Shunde fish market. You follow your master — a third-generation Cantonese grand chef — selecting ingredients. He flicks a live fish\'s gill: "See this color, red as cinnabar — that\'s freshest. Cantonese cuisine\'s soul is this one word: \'fresh.\'"',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '为什么说"食在广州,厨出凤城(顺德)"?顺德菜和广州菜有什么本质区别?', en: 'Why say "eat in Guangzhou, chefs come from Fengcheng (Shunde)"? What distinguishes Shunde from Guangzhou cuisine?' },
        options: [
          { text: { zh: '顺德是粤菜的"原产地"——更注重食材本味,广州是"集大成者"——更注重融合创新', en: 'Shunde is the "origin" focusing on natural flavor; Guangzhou is the "synthesizer" focusing on fusion innovation' }, correct: true, feedback: { zh: '精辟!顺德菜追求的是"不加修饰的鲜":一条鱼可以做出三十种吃法,每一种都让鱼的本味发挥到极致。而广州作为省会吸纳各地精华,形成了更华丽的宴席菜系。顺德是根,广州是冠。', en: 'Brilliant! Shunde cuisine pursues "unadorned freshness": one fish, thirty preparations, each maximizing natural flavor. Guangzhou absorbs regional essences into grander banquet cuisine. Shunde is the root, Guangzhou the crown.' } },
          { text: { zh: '没有区别,都是粤菜', en: 'No difference, both Cantonese cuisine' }, correct: false, feedback: { zh: '区别很大。顺德菜是粤菜的"源代码":极致追求食材本味,烹饪手法极简——清蒸、白灼、生滚为主。而广州菜在此基础上融入了西方、北方元素,变得更加丰富复杂。', en: 'Big difference. Shunde is Cantonese cuisine\'s "source code": extreme pursuit of natural flavor with minimal technique — steaming, blanching, quick-boiling. Guangzhou builds on this, adding Western and Northern elements for complexity.' } },
        ],
      },
      {
        q: { zh: '顺德被联合国教科文组织评为"创意城市·美食之都"。这对全球华人饮食意味着什么?', en: 'UNESCO named Shunde a "Creative City of Gastronomy." What does this mean for global Chinese food culture?' },
        options: [
          { text: { zh: '粤菜从"地方风味"升格为"人类文化遗产"——全世界认可了中国美食的哲学高度', en: 'Cantonese cuisine elevated from "regional flavor" to "human cultural heritage" — the world recognizes Chinese food\'s philosophical depth' }, correct: true, feedback: { zh: '这份认证不只是荣誉。它向世界宣告:中国美食不只是"好吃",更蕴含着独特的哲学——"不时不食"的季节观,"一物多烹"的创意观,"清鲜为本"的自然观。这是东方饮食文明对全人类的贡献。', en: 'This recognition declares to the world: Chinese food isn\'t just "tasty" but contains unique philosophy — seasonal eating, multi-method cooking, natural freshness. Eastern food civilization\'s contribution to all humanity.' } },
          { text: { zh: '只是一个荣誉称号', en: 'Just an honorary title' }, correct: false, feedback: { zh: '远不止称号。UNESCO"美食之都"认证意味着:顺德的饮食文化被视为全人类的共同财富——它与法国里昂、日本�的东京并列,代表了人类饮食创造力的最高峰之一。', en: 'Far more. UNESCO recognition means Shunde\'s food culture is viewed as shared human heritage — ranked alongside Lyon and Tokyo, representing one of the peaks of human culinary creativity.' } },
        ],
      },
    ],
    reward: { badge: '🥢', badgeName: { zh: '粤厨宗师印', en: 'Seal of the Cantonese Grand Master' }, insight: { zh: '"食在广州,厨出凤城"——顺德用一个"鲜"字,征服了全世界的味蕾。最伟大的烹饪,是让食材说话。', en: '"Eat in Guangzhou, chefs from Shunde" — one word "fresh" conquered taste buds worldwide. The greatest cooking lets ingredients speak.' } },
  },

  // ============ N-AW04 盆菜文化发源地·元朗（美食文化）============
  'N-AW04': {
    characters: [
      { name: { zh: '围村族长', en: 'Walled Village Elder' }, role: { zh: '元朗围村盆菜传承人', en: 'Yuen Long Poon Choi Keeper' }, portrait: '' },
    ],
    intro: {
      zh: '1279年,南宋末帝赵昺南逃至新界元朗。你是围村的一名年轻妇人,村里突然来了一群饥肠辘辘的皇室随从。族长下令:把所有能找到的食材凑在一起!但器皿不够——只有洗衣用的大木盆……',
      en: '1279. The last Song Emperor flees south to Yuen Long. You are a young village woman; suddenly, starving imperial retainers arrive. The elder orders: gather all food! But there aren\'t enough vessels — only wooden washing basins…',
    },
    scenes: [
      {
        q: { zh: '盆菜为什么用"盆"?它的层叠结构有什么讲究?', en: 'Why use a "basin"? What\'s the logic of Poon Choi\'s layered structure?' },
        options: [
          { text: { zh: '底层放味重耐煮的(萝卜猪皮),顶层放名贵鲜美的(虾鲍鸡)——分层确保每层口感最佳', en: 'Bottom: flavorful slow-cooking items (radish, pork skin); Top: premium delicate items (shrimp, abalone, chicken) — layers ensure each texture is perfect' }, correct: true, feedback: { zh: '智慧!底层萝卜吸收所有上层汤汁精华,越煮越入味;中层猪皮、冬菇承上启下;顶层鲜虾、鲍鱼最后入盆保持嫩滑。看似杂乱的一盆,实则是精密的"立体烹饪"——七百年民间智慧的结晶。', en: 'Wisdom! Bottom radish absorbs all juices from above, more flavorful with time; middle pork skin and mushrooms bridge; top shrimp and abalone added last stay tender. Seeming chaos is precise "3D cooking" — 700 years of folk wisdom crystallized.' } },
          { text: { zh: '没有讲究,随便堆在一起', en: 'No logic, just piled randomly' }, correct: false, feedback: { zh: '绝非随意。盆菜的层叠顺序是数百年实践总结:耐煮的垫底,易老的放上——每一层的位置都经过考量,确保整盆从上到下,每一口都有最佳口感。这是民间烹饪的精密工程学。', en: 'Never random. The layering order summarizes centuries of practice: durable at bottom, delicate on top — every layer\'s position is calculated. Folk cooking\'s precision engineering.' } },
        ],
      },
      {
        q: { zh: '盆菜从"急中生智"的权宜之计,到今天成为大湾区最重要的节庆食物。它代表着什么?', en: 'From improvised emergency to the Bay Area\'s most important festive food. What does Poon Choi represent?' },
        options: [
          { text: { zh: '团圆与共享——一盆菜围坐十人,不分贵贱共食,是最朴素的平等精神', en: 'Reunion and sharing — ten people around one basin, regardless of status, the most basic spirit of equality' }, correct: true, feedback: { zh: '盆菜最动人之处不在食材的奢华,而在形式的民主:无论身份高低,所有人围坐一盆,同筷而食。从皇帝到农妇,七百年来这种"共食"仪式承载着大湾区人最深的情感:团圆,就是最好的味道。', en: 'Poon Choi\'s most touching aspect isn\'t ingredient luxury but democratic form: regardless of status, all sit around one basin, sharing chopsticks. From emperor to farmwoman, 700 years of "communal eating" carries Bay Area people\'s deepest emotion: reunion is the best flavor.' } },
          { text: { zh: '只是一种传统食物,没有特殊含义', en: 'Just traditional food, no special meaning' }, correct: false, feedback: { zh: '远不止食物。盆菜是大湾区人的"情感容器":春节、婚宴、太平清醮,所有最重要的时刻都以盆菜庆祝。它承载的不是美味,是归属感——"我们是一家人"的最朴素表达。', en: 'Far more than food. Poon Choi is an "emotional vessel": Lunar New Year, weddings, festivals — all celebrated with it. It carries not flavor but belonging — the simplest expression of "we are family."' } },
        ],
      },
    ],
    reward: { badge: '🍲', badgeName: { zh: '盆菜团圆印', en: 'Seal of the Reunion Feast' }, insight: { zh: '一盆菜,七百年。从急中生智到节庆灵魂——盆菜告诉我们:最好的宴席,不在于食材多贵,而在于围坐的人。', en: 'One pot, 700 years. From improvisation to festive soul — Poon Choi teaches: the best feast isn\'t about expensive ingredients but the people sitting around it.' } },
  },


  // ============ M07 深圳河 · 红树林（航海贸易）============
  M07: {
    characters: [
      { name: { zh: '湿地守护者', en: 'Wetland Guardian' }, role: { zh: '红树林生态讲述人', en: 'Mangrove Ecology Guide' }, portrait: '' },
    ],
    intro: {
      zh: '傍晚的深圳湾,潮水漫过红树林根系。你跟随湿地守护者巡护海岸,远处是城市天际线,近处是黑脸琵鹭落脚觅食。这里提醒所有航海者:繁忙的港湾,也需要给候鸟留一片安静的岸。',
      en: 'At dusk in Shenzhen Bay, tides wash through mangrove roots. You patrol the shore with a wetland guardian: skyline in the distance, black-faced spoonbills feeding nearby. A busy bay still needs a quiet coast for birds.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '红树林对一座港湾城市最重要的价值是什么?', en: 'What is the key value of mangroves for a port city?' },
        options: [
          { text: { zh: '既是候鸟驿站,也是抵御风浪、净化海湾的生态屏障', en: 'A bird stopover and a living barrier that calms waves and cleans the bay' }, correct: true, feedback: { zh: '正是。红树林不是城市边角料,而是海岸的生命防线。它让航运、城市与迁徙生灵在同一片海湾共存。', en: 'Exactly. Mangroves are not leftover land, but a living coastal defense where shipping, cities and migrating life can coexist.' } },
          { text: { zh: '主要是为了增加海边绿化面积', en: 'Mainly to add greenery along the waterfront' }, correct: false, feedback: { zh: '绿化只是表面。红树林根系能固岸消浪,湿地能净化水质,更是全球候鸟迁徙网络的重要节点。', en: 'Greenery is only the surface. Mangrove roots hold shores, calm waves, clean water and anchor a global bird migration network.' } },
        ],
      },
      {
        q: { zh: '为什么它也属于「航海贸易」主题?', en: 'Why does this belong to maritime trade?' },
        options: [
          { text: { zh: '现代海洋文明不只追求吞吐量,也要守住生态边界', en: 'Modern maritime civilization needs ecology as well as cargo throughput' }, correct: true, feedback: { zh: '答得好。真正成熟的港湾,不是把海岸全部变成码头,而是在贸易动脉旁保留生命栖息地。', en: 'Well said. A mature harbor does not turn every shore into docks; it keeps living habitats beside trade arteries.' } },
          { text: { zh: '因为靠近海边,所以随便归类', en: 'Because it is near the sea, so any category works' }, correct: false, feedback: { zh: '并非随便。红树林展示的是海洋城市的新命题:贸易繁荣与生态韧性如何共存。', en: 'Not at random. Mangroves show a new question for maritime cities: how prosperity and ecological resilience coexist.' } },
        ],
      },
    ],
    reward: { badge: '🌿', badgeIcon: 'mangrove-bird', badgeName: { zh: '湿地护航印', en: 'Seal of the Mangrove Haven' }, insight: { zh: '红树林让深圳湾证明:最好的航海文明,不是只向海索取,也懂得为生命留岸。', en: 'The mangroves prove that maritime civilization should not only take from the sea, but also leave shores for life.' } },
  },

  // ============ M12 大梅沙 · 海上丝路（航海贸易）============
  M12: {
    characters: [
      { name: { zh: '丝路舵手', en: 'Silk Route Helmsman' }, role: { zh: '古代商船领航人', en: 'Ancient Merchant Navigator' }, portrait: '' },
    ],
    intro: {
      zh: '唐宋年间,你随一艘满载丝绸、瓷器与茶叶的商船停靠大梅沙外海。海面月色如银,舵手摊开海图,告诉你:这片海不是边界,而是一条把湾区推向世界的路。',
      en: 'In the Tang-Song era, you arrive off Dameisha on a ship carrying silk, porcelain and tea. Under moonlit waves, the helmsman opens a sea chart: this sea is not a border, but a road to the world.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '古代海上丝绸之路最核心的货物是什么?', en: 'What goods defined the ancient Maritime Silk Road?' },
        options: [
          { text: { zh: '丝绸、瓷器、茶叶,以及随货物传播的审美与技术', en: 'Silk, porcelain, tea, and the aesthetics and skills carried with them' }, correct: true, feedback: { zh: '正是。货物只是表层,真正流动的是工艺、审美、语言与信任。每一次靠岸,都是一次文明交换。', en: 'Correct. Goods were the surface; craft, taste, language and trust moved beneath them. Every landing was an exchange of civilizations.' } },
          { text: { zh: '主要是军械与征服物资', en: 'Mainly weapons and conquest supplies' }, correct: false, feedback: { zh: '海上丝路的底色是贸易与互通,不是征服。丝绸与瓷器让远方认识东方,也让东方理解远方。', en: 'The route was based on trade and connection, not conquest. Silk and porcelain introduced East and West to one another.' } },
        ],
      },
      {
        q: { zh: '大梅沙这样的海湾停泊点有什么历史意义?', en: 'Why did coastal stops like Dameisha matter?' },
        options: [
          { text: { zh: '它们是长航线上的补给节点,把地方海湾接入全球网络', en: 'They were supply nodes linking local bays to global routes' }, correct: true, feedback: { zh: '准确。宏大的丝路,正由无数这样的停泊点串起。地方海湾的每一次补给,都在参与世界贸易。', en: 'Exactly. The grand route was built from countless stops like this; each local replenishment joined world trade.' } },
          { text: { zh: '没有意义,大船只看终点港', en: 'They did not matter; only final ports counted' }, correct: false, feedback: { zh: '远航从来不是两点一线。风向、淡水、修船、避风,都让沿线海湾成为不可或缺的节点。', en: 'Voyages were never just point to point. Wind, water, repairs and shelter made coastal bays essential.' } },
        ],
      },
    ],
    reward: { badge: '🧭', badgeIcon: 'silk-route', badgeName: { zh: '丝路海图印', en: 'Seal of the Sea Silk Chart' }, insight: { zh: '大梅沙的浪花提醒我们:海上丝路不是抽象名词,而是由一处处真实海湾连接出的世界网络。', en: 'Dameisha reminds us that the Maritime Silk Road was not abstract, but a network made from real bays.' } },
  },

  // ============ N-NA01 屯门·唐代季风港（航海贸易）============
  'N-NA01': {
    characters: [
      { name: { zh: '季风商人', en: 'Monsoon Merchant' }, role: { zh: '阿拉伯商船领队', en: 'Arab Merchant Captain' }, portrait: '' },
    ],
    intro: {
      zh: '唐代的屯门港,季风将远方的帆影送入珠江口。你作为港口译员,迎来阿拉伯与波斯商人。他们带来香料、天文学知识与异域器物,也等待下一阵北上的风。',
      en: 'At Tang-era Tuen Mun, monsoon winds bring distant sails into the Pearl River mouth. As a port interpreter, you greet Arab and Persian merchants carrying spices, astronomy and foreign wares, waiting for the next northbound wind.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '为什么唐代远洋商船要等待季风?', en: 'Why did Tang merchant ships wait for monsoons?' },
        options: [
          { text: { zh: '季风决定航行窗口,顺风才能安全高效抵达广州等港口', en: 'Monsoons defined safe sailing windows toward ports like Guangzhou' }, correct: true, feedback: { zh: '没错。古代航海不是随时出发,而是读懂风的日历。屯门这样的港口,正是等待风向与补给的关键驿站。', en: 'Right. Ancient sailing followed the calendar of winds. Ports like Tuen Mun were key places to wait, resupply and sail on.' } },
          { text: { zh: '只是为了等更多货物上船', en: 'Only to wait for more cargo' }, correct: false, feedback: { zh: '货物重要,但风更关键。没有合适季风,再满的船也无法安全穿越大海。', en: 'Cargo mattered, but wind mattered more. Without the right monsoon, no full ship could safely cross the sea.' } },
        ],
      },
      {
        q: { zh: '屯门为何被称作海上丝路进入中国的门户之一?', en: 'Why was Tuen Mun a gateway into China?' },
        options: [
          { text: { zh: '它扼守珠江口,为外来商船提供补给、换帆与进入内河的节点', en: 'It guarded the Pearl River mouth, offering supplies, sail changes and access inland' }, correct: true, feedback: { zh: '正是。门户不一定是最大城市,却一定站在最关键的入口。屯门把远洋航线接进岭南腹地。', en: 'Exactly. A gateway need not be the largest city; it stands at the crucial entrance, linking ocean routes to Lingnan inland.' } },
          { text: { zh: '因为它远离所有贸易路线', en: 'Because it was far from trade routes' }, correct: false, feedback: { zh: '恰恰相反。屯门处在珠江口要冲,是远洋与内河交通交汇的位置。', en: 'The opposite. Tuen Mun sat at the Pearl River mouth where ocean and river traffic met.' } },
        ],
      },
    ],
    reward: { badge: '⛵', badgeIcon: 'monsoon-sail', badgeName: { zh: '季风门户印', en: 'Seal of the Monsoon Gate' }, insight: { zh: '屯门告诉我们:古代全球化靠的不只是货物,还有对风、潮汐与港口节奏的精确理解。', en: 'Tuen Mun shows that ancient globalization depended not only on goods, but on wind, tides and port rhythms.' } },
  },

  // ============ N-NA02 伶仃洋·古战场（航海贸易）============
  'N-NA02': {
    characters: [
      { name: { zh: '海图记录者', en: 'Sea Chart Keeper' }, role: { zh: '伶仃洋历史讲述人', en: 'Lingding Ocean Storyteller' }, portrait: '' },
    ],
    intro: {
      zh: '你乘船穿过伶仃洋,海面看似平静,却承载着航道、诗篇与历史记忆。记录者指向潮流交汇处:这里从来不只是水面,而是珠江口通向世界的门槛。',
      en: 'You cross Lingding Ocean by boat. The surface seems calm, yet it holds sea lanes, poems and memory. The chart keeper points to converging tides: this was never just water, but the threshold from the Pearl River to the world.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '伶仃洋为什么是大湾区重要的海上坐标?', en: 'Why is Lingding Ocean an important maritime coordinate?' },
        options: [
          { text: { zh: '它位于珠江口要冲,连接广州、深圳、香港、澳门等港湾', en: 'It sits at the Pearl River mouth, linking Guangzhou, Shenzhen, Hong Kong and Macau' }, correct: true, feedback: { zh: '正确。伶仃洋是多座港城共同面对的海面,也是货物流、人员流与历史记忆交汇的地方。', en: 'Correct. Lingding Ocean is the shared water of several port cities, where goods, people and memory converge.' } },
          { text: { zh: '因为它与珠江口航线无关', en: 'Because it is unrelated to Pearl River routes' }, correct: false, feedback: { zh: '它恰恰处在珠江口的关键航道上。理解大湾区海洋史,绕不开伶仃洋。', en: 'It lies on key Pearl River routes. One cannot understand Bay Area maritime history without it.' } },
        ],
      },
      {
        q: { zh: '面对承载复杂记忆的海域,今天最应读懂什么?', en: 'What should we learn from waters with layered memories?' },
        options: [
          { text: { zh: '海洋既连接贸易,也保存历史;开放必须与记忆同行', en: 'The sea connects trade and preserves memory; openness should travel with remembrance' }, correct: true, feedback: { zh: '是的。伶仃洋的价值不只在航运,也在提醒我们:每一条繁忙航道,都有自己深处的历史。', en: 'Yes. Lingding Ocean matters not only for shipping, but for reminding us that every busy lane has deep history.' } },
          { text: { zh: '只需关注今天的通航效率', en: 'Only present-day navigation efficiency matters' }, correct: false, feedback: { zh: '效率重要,但如果只看效率,就会错过海域背后沉淀的文化和历史坐标。', en: 'Efficiency matters, but only seeing efficiency misses the cultural and historical coordinates beneath the waters.' } },
        ],
      },
    ],
    reward: { badge: '🌊', badgeIcon: 'storm-stele', badgeName: { zh: '伶仃潮声印', en: 'Seal of Lingding Tides' }, insight: { zh: '伶仃洋是一面海上的史书:它让航线、城市与记忆在同一片潮声中相遇。', en: 'Lingding Ocean is a sea-borne history book where routes, cities and memory meet in the same tide.' } },
  },

  // ============ N-NA03 香港维多利亚港（航海贸易）============
  'N-NA03': {
    characters: [
      { name: { zh: '自由港领航员', en: 'Free Port Pilot' }, role: { zh: '维港航运讲述人', en: 'Victoria Harbour Shipping Guide' }, portrait: '' },
    ],
    intro: {
      zh: '二十世纪的维多利亚港,汽笛与吊机声交织。你跟随领航员登上天星小轮,看茶叶、丝绸、成衣与集装箱从这里进出世界。港湾像一枚巨大的铆钉,把东方与西方钉在同一张贸易图上。',
      en: 'In twentieth-century Victoria Harbour, whistles mix with crane noise. Following a harbor pilot onto the Star Ferry, you watch tea, silk, garments and containers move between China and the world. The harbor pins East and West onto one trade map.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '维多利亚港成为贸易枢纽的关键条件是什么?', en: 'What made Victoria Harbour a trade hub?' },
        options: [
          { text: { zh: '天然深水良港、自由港制度与连接全球航线的位置', en: 'Deep natural water, free-port systems and access to global routes' }, correct: true, feedback: { zh: '准确。港口不是只有码头,还需要制度、航线、仓储、金融与人才共同运转。维港正是这些条件的交汇点。', en: 'Exactly. A port needs more than docks: systems, routes, storage, finance and talent. Victoria Harbour joined them all.' } },
          { text: { zh: '只靠港湾夜景漂亮', en: 'Only because the night view is beautiful' }, correct: false, feedback: { zh: '夜景令人难忘,但真正让维港改变世界贸易的是深水港条件和自由港网络。', en: 'The view is memorable, but deep water and free-port networks made the harbor reshape trade.' } },
        ],
      },
      {
        q: { zh: '从散货到集装箱,维港见证了什么变化?', en: 'What change did the harbor witness from breakbulk to containers?' },
        options: [
          { text: { zh: '全球贸易从手工装卸走向标准化、规模化和高速流动', en: 'Global trade moved toward standardized, large-scale, high-speed flows' }, correct: true, feedback: { zh: '说得对。集装箱让世界贸易像搭积木一样高效,也让香港成为亚太供应链的重要心跳。', en: 'Right. Containers made trade modular and efficient, turning Hong Kong into a heartbeat of Asia-Pacific supply chains.' } },
          { text: { zh: '只是箱子变得更整齐,没有本质变化', en: 'Boxes became neater, but nothing essential changed' }, correct: false, feedback: { zh: '集装箱是贸易史的革命。标准化改变了装卸速度、成本结构和全球制造分工。', en: 'Containers were a trade revolution, changing loading speed, costs and global manufacturing divisions.' } },
        ],
      },
    ],
    reward: { badge: '🏙️', badgeIcon: 'harbor-cranes', badgeName: { zh: '自由港脉印', en: 'Seal of the Free Port Pulse' }, insight: { zh: '维多利亚港证明:一座港湾若能连接制度、资本与航线,就能成为全球贸易的心跳。', en: 'Victoria Harbour proves that when a harbor connects systems, capital and routes, it can become a pulse of global trade.' } },
  },

  // ============ N-NA04 广州黄埔古港（航海贸易）============
  'N-NA04': {
    characters: [
      { name: { zh: '十三行账房', en: 'Thirteen Factories Clerk' }, role: { zh: '清代广州贸易记录者', en: 'Qing Canton Trade Recorder' }, portrait: '' },
    ],
    intro: {
      zh: '清代黄埔古港,外商船只排队入港。你在十三行账房记录茶叶、瓷器与丝绸的流向:白银从远方来,中国货物从这里去往欧洲客厅。黄埔,曾是一整个时代望向世界的窗口。',
      en: 'At Qing-era Huangpu Ancient Port, foreign ships wait to enter. As a clerk, you record the flow of tea, porcelain and silk: silver arrives from afar, Chinese goods leave for European homes. Huangpu was a window to the world.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '黄埔古港在清代对外贸易中的特殊地位是什么?', en: 'What special role did Huangpu play in Qing foreign trade?' },
        options: [
          { text: { zh: '它是广州对外贸易的重要泊船与货物流转节点', en: 'It was a key anchorage and cargo node for Canton foreign trade' }, correct: true, feedback: { zh: '正是。商船在黄埔停泊、查验、转运,再经十三行完成贸易。它是清代中外贸易链条里的关键环节。', en: 'Exactly. Ships anchored, checked and transshipped at Huangpu before trade through the Thirteen Factories. It was a key link.' } },
          { text: { zh: '它只是普通渔港,很少参与国际贸易', en: 'It was only a fishing port with little international trade' }, correct: false, feedback: { zh: '并非如此。黄埔古港长期承载广州口岸的外贸船舶,见证茶叶、瓷器等商品走向世界。', en: 'Not so. Huangpu long handled foreign trade ships for Canton, sending tea, porcelain and other goods to the world.' } },
        ],
      },
      {
        q: { zh: '茶叶从黄埔走向欧洲,改变了什么?', en: 'What changed when tea traveled from Huangpu to Europe?' },
        options: [
          { text: { zh: '它不只改变饮食习惯,也重塑消费、航运和全球贸易结构', en: 'It changed habits, consumption, shipping and global trade structures' }, correct: true, feedback: { zh: '没错。一杯茶背后是航线、金融、仓储与消费文化。黄埔的箱货,改变了远方人的日常生活。', en: 'Yes. Behind a cup of tea were routes, finance, storage and consumer culture. Cargo from Huangpu changed daily life far away.' } },
          { text: { zh: '只多了一种饮料,影响很小', en: 'It merely added one drink and had little impact' }, correct: false, feedback: { zh: '茶叶引发的消费热潮牵动海运、商业公司与全球白银流动,影响远超饮料本身。', en: 'The tea boom affected shipping, trading companies and silver flows far beyond the drink itself.' } },
        ],
      },
    ],
    reward: { badge: '🍵', badgeIcon: 'canton-tea', badgeName: { zh: '茶瓷通商印', en: 'Seal of Tea and Porcelain Trade' }, insight: { zh: '黄埔古港让一杯茶、一只瓷碗成为世界贸易的主角,也让岭南海岸写进全球日常生活。', en: 'Huangpu made tea and porcelain protagonists of world trade, writing the Lingnan coast into global daily life.' } },
  },

  // ============ 新增锚点 · 千年文脉 ============
  'N-CV05': {
    characters: [{ name: { zh: '岭南匠师', en: 'Lingnan Artisan' }, role: { zh: '陈家祠装饰工艺讲述者', en: 'Craft narrator of Chen Clan Hall' }, portrait: '' }],
    intro: { zh: '你走进陈家祠,屋脊陶塑、木雕梁架和石雕门罩层层展开。这里像一本立体书,把宗族、教育与工艺写在建筑表面。', en: 'You enter Chen Clan Ancestral Hall. Roof ceramics, wood beams and stone carvings unfold like a 3D book of clans, education and craft.' },
    scenes: [{ speaker: 0, q: { zh: '陈家祠最适合作为哪类大湾区文化锚点?', en: 'What kind of Bay Area anchor is Chen Clan Hall?' }, options: [
      { text: { zh: '岭南工艺、宗族教育与公共美学的汇合点', en: 'A meeting point of craft, clan education and public aesthetics' }, correct: true, feedback: { zh: '正是。陈家祠的价值不只在“好看”,而在它把岭南社会如何组织教育、身份与审美都留在建筑上。', en: 'Yes. Its value is not only beauty, but how Lingnan society recorded education, identity and aesthetics in architecture.' } },
      { text: { zh: '单纯的近代商业写字楼', en: 'Only a modern commercial office building' }, correct: false, feedback: { zh: '不对。陈家祠是祠堂与书院系统,核心是宗族文化与工艺表达。', en: 'No. It is an ancestral hall and academy system centered on clan culture and craft.' } },
    ] }],
    reward: { badge: '🎨', badgeName: { zh: '岭南工艺印', en: 'Seal of Lingnan Craft' }, insight: { zh: '陈家祠证明:一座建筑可以成为地方社会、教育和手工业的共同档案。', en: 'Chen Clan Hall proves a building can archive society, education and craft together.' } },
  },
  'N-CV06': {
    characters: [{ name: { zh: '祖庙司祝', en: 'Temple Keeper' }, role: { zh: '佛山城市记忆守望者', en: 'Keeper of Foshan memory' }, portrait: '' }],
    intro: { zh: '你站在佛山祖庙前,香火、粤剧锣鼓、武术传说与陶塑屋脊交叠。城市的工商业精神,在这里有了可触摸的炉火。', en: 'Before Foshan Ancestral Temple, incense, opera drums, martial legends and ceramic ridges overlap. The city spirit becomes tangible.' },
    scenes: [{ speaker: 0, q: { zh: '祖庙如何解释佛山的城市性格?', en: 'How does the temple explain Foshan as a city?' }, options: [
      { text: { zh: '它把信仰、行会、工艺和市井生活凝聚在一起', en: 'It gathers belief, guilds, craft and everyday commerce' }, correct: true, feedback: { zh: '没错。佛山不只是制造之城,也是庙宇、行会和手工业共同塑造的岭南城市。', en: 'Correct. Foshan was shaped by temples, guilds and crafts as much as manufacturing.' } },
      { text: { zh: '它与城市产业和民俗没有关系', en: 'It has no relation to industry or folk life' }, correct: false, feedback: { zh: '恰恰相反。祖庙是理解佛山民俗、工艺和城市商业精神的入口。', en: 'The opposite. It is an entry point to Foshan folk life, craft and commerce.' } },
    ] }],
    reward: { badge: '🔥', badgeName: { zh: '祖庙炉火印', en: 'Seal of the Temple Hearth' }, insight: { zh: '佛山祖庙让一座工商业城市拥有了精神中心。', en: 'Foshan Ancestral Temple gives an industrial city a spiritual center.' } },
  },
  'N-CV07': {
    characters: [{ name: { zh: '题刻旅人', en: 'Inscription Traveler' }, role: { zh: '七星岩山水记录者', en: 'Recorder of Seven Star Crags' }, portrait: '' }],
    intro: { zh: '你沿七星岩湖岸慢行,岩壁上历代题刻像一层层时间纹理。山水没有说话,石头却记住了人如何观看岭南。', en: 'You walk along Seven Star Crags. Inscriptions on the cliffs hold layers of time, recording how people saw Lingnan.' },
    scenes: [{ speaker: 0, q: { zh: '七星岩摩崖石刻的核心价值是什么?', en: 'What is the core value of the Seven Star Crags inscriptions?' }, options: [
      { text: { zh: '它把旅行、诗文、官员治理和山水审美刻进同一处空间', en: 'It carves travel, poetry, governance and landscape aesthetics into one place' }, correct: true, feedback: { zh: '准确。七星岩让大湾区叙事向更深的山水文脉延伸。', en: 'Exactly. It extends the Bay Area story into older landscape culture.' } },
      { text: { zh: '它只是现代游客随手涂鸦', en: 'It is only modern tourist graffiti' }, correct: false, feedback: { zh: '不是。许多题刻跨越唐宋明清,是重要的历史文化记录。', en: 'No. Many inscriptions span dynasties and preserve cultural memory.' } },
    ] }],
    reward: { badge: '⛰️', badgeName: { zh: '山水题刻印', en: 'Seal of Landscape Inscriptions' }, insight: { zh: '七星岩说明:城市记忆有时不在街巷,而在山水与石壁之间。', en: 'Seven Star Crags shows that memory can live in landscape and stone.' } },
  },
  'N-CV08': {
    characters: [{ name: { zh: '澳门石匠', en: 'Macau Mason' }, role: { zh: '大三巴立面见证者', en: 'Witness of the St. Paul facade' }, portrait: '' }],
    intro: { zh: '你抬头看见大三巴牌坊,西方宗教图像与东方纹样并置在石面上。澳门的混血身份,浓缩成这一面立面。', en: 'You look up at the Ruins of St. Pauls, where Western religious imagery and Eastern motifs share one stone facade.' },
    scenes: [{ speaker: 0, q: { zh: '大三巴为什么不只是旅游符号?', en: 'Why is St. Pauls more than a tourist icon?' }, options: [
      { text: { zh: '它记录早期全球化中宗教、港口与地方工艺的互译', en: 'It records translation among religion, port trade and local craft' }, correct: true, feedback: { zh: '正是。大三巴是一座港口城市如何吸收、翻译并重组世界元素的证据。', en: 'Yes. It proves how a port city absorbed, translated and recomposed world elements.' } },
      { text: { zh: '因为它完全与澳门港口史无关', en: 'Because it has nothing to do with Macau port history' }, correct: false, feedback: { zh: '不对。它正是澳门作为世界港口和宗教交流节点的重要象征。', en: 'No. It is a key symbol of Macau as a world port and religious contact zone.' } },
    ] }],
    reward: { badge: '⛪', badgeName: { zh: '东西石门印', en: 'Seal of the East-West Facade' }, insight: { zh: '大三巴把澳门的世界性写在一面石头立面上。', en: 'St. Pauls writes Macaus global identity onto stone.' } },
  },
  'N-CV09': {
    characters: [{ name: { zh: '东坡行者', en: 'Su Shi Walker' }, role: { zh: '惠州西湖记忆讲述者', en: 'Narrator of Huizhou West Lake' }, portrait: '' }],
    intro: { zh: '你在惠州西湖边行走,湖光让贬谪故事变得柔和。苏轼留下的不只是诗,也是岭南城市对逆境的温度。', en: 'You walk by Huizhou West Lake. Su Shi left not only poems, but a warm way for Lingnan cities to face hardship.' },
    scenes: [{ speaker: 0, q: { zh: '惠州西湖补充了大湾区哪种叙事?', en: 'What story does Huizhou West Lake add to the Bay Area?' }, options: [
      { text: { zh: '诗人、贬谪、民生与城市温度', en: 'Poets, exile, public life and urban warmth' }, correct: true, feedback: { zh: '没错。湾区不只有速度和港口,也有慢下来的文化韧性。', en: 'Correct. The Bay Area is not only speed and ports, but also cultural resilience.' } },
      { text: { zh: '只代表现代金融交易', en: 'Only modern financial trading' }, correct: false, feedback: { zh: '不对。惠州西湖的核心是山水、诗文与岭南贬谪文化。', en: 'No. Its core is landscape, poetry and Lingnan exile culture.' } },
    ] }],
    reward: { badge: '🌙', badgeName: { zh: '东坡湖光印', en: 'Seal of Su Shi Lake Light' }, insight: { zh: '惠州西湖提醒我们:文化的力量,常常来自人在逆境中保留的温柔。', en: 'Huizhou West Lake reminds us that culture often grows from tenderness in hardship.' } },
  },
  'N-CV10': {
    characters: [{ name: { zh: '南社族老', en: 'Nanshe Elder' }, role: { zh: '明清村落守望者', en: 'Keeper of the Ming-Qing village' }, portrait: '' }],
    intro: { zh: '你走进南社古村,祠堂、书院、水塘和巷道组织出一套旧日秩序。制造业城市的背后,仍能看见宗族社会的骨架。', en: 'You enter Nanshe village, where halls, academies, ponds and lanes form an old order beneath modern manufacturing.' },
    scenes: [{ speaker: 0, q: { zh: '南社古村为什么适合放进湾区地图?', en: 'Why does Nanshe belong on the Bay Area map?' }, options: [
      { text: { zh: '它展示珠三角乡村如何通过宗族、教育和水网协作组织生活', en: 'It shows how clan, education and water networks organized Pearl Delta village life' }, correct: true, feedback: { zh: '正是。现代湾区效率的深层,有很长的乡村协作传统。', en: 'Yes. Beneath modern efficiency lies a long tradition of village cooperation.' } },
      { text: { zh: '它只是一处与地方社会无关的空景', en: 'It is only scenery unrelated to local society' }, correct: false, feedback: { zh: '不对。南社的空间本身就是地方社会结构的可视化。', en: 'No. Nanshe makes local social structure visible.' } },
    ] }],
    reward: { badge: '🏘️', badgeName: { zh: '宗族水乡印', en: 'Seal of the Clan Water Village' }, insight: { zh: '南社古村让我们看见珠三角现代化之前的社会组织能力。', en: 'Nanshe reveals the social organization beneath Pearl Delta modernization.' } },
  },

  // ============ 新增锚点 · 近代化与超级工程 ============
  'N-EG05': {
    characters: [{ name: { zh: '桥梁工程师', en: 'Bridge Engineer' }, role: { zh: '虎门大桥建设见证者', en: 'Witness of Humen Bridge' }, portrait: '' }],
    intro: { zh: '你站在珠江口风里,看见虎门大桥横跨东西两岸。它像一条先行的缝线,把湾区日后的跨海时代提前预告。', en: 'At the Pearl River mouth, Humen Bridge stitches the banks together and foreshadows the Bay Areas cross-sea age.' },
    scenes: [{ speaker: 0, q: { zh: '虎门大桥的历史意义是什么?', en: 'What is the historical meaning of Humen Bridge?' }, options: [
      { text: { zh: '它是珠江口跨海交通一体化的重要先声', en: 'It was an early signal of Pearl River estuary integration' }, correct: true, feedback: { zh: '准确。它为后来的港珠澳大桥、深中通道等超级工程铺垫了想象力。', en: 'Correct. It prepared the imagination for later mega-crossings.' } },
      { text: { zh: '它让珠江口两岸联系变弱', en: 'It weakened links across the estuary' }, correct: false, feedback: { zh: '恰恰相反。它压缩了东西两岸的经济距离。', en: 'The opposite. It compressed economic distance across the estuary.' } },
    ] }],
    reward: { badge: '🌁', badgeName: { zh: '虎门跨海印', en: 'Seal of the Humen Crossing' }, insight: { zh: '虎门大桥是湾区跨海工程谱系中的早期关键笔画。', en: 'Humen Bridge is an early key stroke in the Bay Areas cross-sea engineering lineage.' } },
  },
  'N-EG06': {
    characters: [{ name: { zh: '港口调度员', en: 'Port Dispatcher' }, role: { zh: '南沙港物流观察者', en: 'Observer of Nansha logistics' }, portrait: '' }],
    intro: { zh: '集装箱在南沙港起落,吊机像巨大的笔在海边写字。广州重新面向外海,这一次靠的是现代物流系统。', en: 'Containers rise and fall at Nansha Port. Guangzhou faces the sea again through modern logistics.' },
    scenes: [{ speaker: 0, q: { zh: '南沙港代表了什么样的新海上丝路?', en: 'What kind of new maritime route does Nansha Port represent?' }, options: [
      { text: { zh: '由深水泊位、集装箱、冷链和海关系统构成的供应链网络', en: 'A supply-chain network of berths, containers, cold chains and customs systems' }, correct: true, feedback: { zh: '没错。现代港口的力量来自系统协同,不只是码头本身。', en: 'Yes. Modern port power comes from systems, not docks alone.' } },
      { text: { zh: '只靠古代帆船和市集', en: 'Only ancient sails and markets' }, correct: false, feedback: { zh: '不对。南沙港的关键词是现代物流与全球供应链。', en: 'No. Nansha is about modern logistics and global supply chains.' } },
    ] }],
    reward: { badge: '📦', badgeName: { zh: '集装箱航路印', en: 'Seal of Container Routes' }, insight: { zh: '南沙港说明:今天的海上丝路是一套精密运转的物流基础设施。', en: 'Nansha Port shows that todays maritime route is precision logistics infrastructure.' } },
  },
  'N-EG07': {
    characters: [{ name: { zh: '横琴规划师', en: 'Hengqin Planner' }, role: { zh: '制度工程观察者', en: 'Observer of institutional engineering' }, portrait: '' }],
    intro: { zh: '你站在横琴,澳门近在咫尺。这里的工程不只在地面,更在规则、空间和产业如何重新组合。', en: 'In Hengqin, Macao is close. The project is not only on the ground, but in rules, space and industries recombined.' },
    scenes: [{ speaker: 0, q: { zh: '横琴最像哪一种工程?', en: 'What kind of project is Hengqin most like?' }, options: [
      { text: { zh: '制度工程:让空间、产业和治理方式重新组合', en: 'Institutional engineering that recombines space, industry and governance' }, correct: true, feedback: { zh: '正是。横琴让大湾区从地理连接走向治理实验。', en: 'Exactly. Hengqin moves the Bay Area from geographic connection to governance experiment.' } },
      { text: { zh: '单纯一座观光塔', en: 'Only a sightseeing tower' }, correct: false, feedback: { zh: '不对。横琴的核心是粤澳协同和制度创新。', en: 'No. Hengqin centers on Guangdong-Macao collaboration and institutional innovation.' } },
    ] }],
    reward: { badge: '🧩', badgeName: { zh: '横琴协同印', en: 'Seal of Hengqin Collaboration' }, insight: { zh: '横琴提醒我们:最难的工程,有时不是建桥,而是重组规则。', en: 'Hengqin reminds us that the hardest engineering can be reorganizing rules.' } },
  },
  'N-EG08': {
    characters: [{ name: { zh: '城市结构师', en: 'Urban Structuralist' }, role: { zh: '广州塔天际线讲述者', en: 'Narrator of Canton Tower skyline' }, portrait: '' }],
    intro: { zh: '珠江夜色中,广州塔像一道扭转的光。它让工程结构变成城市名片,也让广州拥有新的世界识别度。', en: 'At night, Canton Tower twists in light. Structural engineering becomes a city calling card.' },
    scenes: [{ speaker: 0, q: { zh: '广州塔的意义不只在高度,还在什么?', en: 'Beyond height, what matters about Canton Tower?' }, options: [
      { text: { zh: '它把工程、城市品牌和珠江新城天际线绑定在一起', en: 'It binds engineering, city branding and the Zhujiang skyline' }, correct: true, feedback: { zh: '准确。超级工程也可以是一座城市向世界介绍自己的方式。', en: 'Correct. Mega-engineering can be how a city introduces itself.' } },
      { text: { zh: '它完全不影响城市形象', en: 'It has no impact on city identity' }, correct: false, feedback: { zh: '不对。广州塔已经成为广州最强识别符号之一。', en: 'No. Canton Tower is one of Guangzhous strongest symbols.' } },
    ] }],
    reward: { badge: '🗼', badgeName: { zh: '羊城天际印', en: 'Seal of the Canton Skyline' }, insight: { zh: '广州塔让结构工程进入城市形象与公共记忆。', en: 'Canton Tower turns structural engineering into urban memory.' } },
  },
  'N-EG09': {
    characters: [{ name: { zh: '高铁乘务员', en: 'High-Speed Rail Attendant' }, role: { zh: '西九龙连接见证者', en: 'Witness of West Kowloon connection' }, portrait: '' }],
    intro: { zh: '列车驶入西九龙站,城市边界被压缩成换乘时间。香港由此接入更大的高铁网络,湾区日常协作变得可操作。', en: 'A train enters West Kowloon. Urban borders shrink into transfer time as Hong Kong connects to the high-speed network.' },
    scenes: [{ speaker: 0, q: { zh: '西九龙站对大湾区最重要的影响是什么?', en: 'What is West Kowloons key impact on the Bay Area?' }, options: [
      { text: { zh: '把香港纳入高铁生活圈,提升跨城协作效率', en: 'It brings Hong Kong into the high-speed living circle and improves collaboration' }, correct: true, feedback: { zh: '没错。一小时生活圈不是口号,而是由车站、线路和制度共同完成的体验。', en: 'Yes. The one-hour circle is built from stations, lines and systems.' } },
      { text: { zh: '让香港与内地交通完全断开', en: 'It disconnects Hong Kong from mainland transport' }, correct: false, feedback: { zh: '恰恰相反。西九龙站强化了香港与内地城市的连接。', en: 'The opposite. West Kowloon strengthens connection.' } },
    ] }],
    reward: { badge: '🚄', badgeName: { zh: '高铁连城印', en: 'Seal of High-Speed Connection' }, insight: { zh: '西九龙站让大湾区的一小时生活圈变得可感知。', en: 'West Kowloon makes the Bay Area one-hour circle tangible.' } },
  },
  'N-EG10': {
    characters: [{ name: { zh: '跨海测量员', en: 'Cross-Sea Surveyor' }, role: { zh: '深中通道路线观察者', en: 'Observer of the Shenzhen-Zhongshan Link' }, portrait: '' }],
    intro: { zh: '你在珠江口远眺深中通道,海面不再只是阻隔,而成为城市重新排列的界面。深圳与中山被折叠到更近。', en: 'Looking at the Shenzhen-Zhongshan Link, the sea becomes an interface that rearranges cities.' },
    scenes: [{ speaker: 0, q: { zh: '深中通道改变的不只是车程,还是什么?', en: 'Beyond travel time, what does the link change?' }, options: [
      { text: { zh: '产业链、通勤、旅游和东西两岸的心理距离', en: 'Supply chains, commuting, tourism and mental distance between banks' }, correct: true, feedback: { zh: '正是。跨海通道改变的是城市之间的组织方式。', en: 'Exactly. A cross-sea link changes how cities organize relations.' } },
      { text: { zh: '只是一条与区域无关的小路', en: 'Only a small road unrelated to the region' }, correct: false, feedback: { zh: '不对。它是珠江口通道网络成型的重要节点。', en: 'No. It is a key node in the estuary corridor network.' } },
    ] }],
    reward: { badge: '🌉', badgeName: { zh: '深中折叠印', en: 'Seal of the Folded Estuary' }, insight: { zh: '深中通道让珠江口东西两岸重新进入同一张生活地图。', en: 'The link brings both banks into one living map.' } },
  },

  // ============ 新增锚点 · 科学星火 ============
  'N-SC05': {
    characters: [{ name: { zh: '清水湾研究员', en: 'Clear Water Bay Researcher' }, role: { zh: '香港科大科研讲述者', en: 'HKUST research narrator' }, portrait: '' }],
    intro: { zh: '山海之间的香港科大,把国际科研、创业教育和湾区产业连接起来。知识在这里并不抽象,它会走向实验室和公司。', en: 'HKUST connects global research, entrepreneurship and Bay Area industry between mountain and sea.' },
    scenes: [{ speaker: 0, q: { zh: '香港科大补足了湾区创新的哪一环?', en: 'What does HKUST add to Bay Area innovation?' }, options: [
      { text: { zh: '国际化科研、人才培养与创业机制', en: 'Global research, talent training and startup mechanisms' }, correct: true, feedback: { zh: '没错。创新不只靠硬件市场,也靠大学和科研共同体。', en: 'Yes. Innovation needs universities and research communities, not hardware markets alone.' } },
      { text: { zh: '完全不参与知识生产', en: 'It does not produce knowledge' }, correct: false, feedback: { zh: '不对。香港科大是大湾区重要研究型大学。', en: 'No. HKUST is a major research university in the Bay Area.' } },
    ] }],
    reward: { badge: '🎓', badgeName: { zh: '清水湾科研印', en: 'Seal of Clear Water Bay Research' }, insight: { zh: '香港科大让湾区创新拥有国际学术接口。', en: 'HKUST gives Bay Area innovation a global academic interface.' } },
  },
  'N-SC06': {
    characters: [{ name: { zh: '康乐园学人', en: 'Kangle Scholar' }, role: { zh: '中山大学南校园讲述者', en: 'Narrator of SYSU South Campus' }, portrait: '' }],
    intro: { zh: '你走进中山大学南校园,近代校园建筑与榕树一起沉默。这里生产的不是短期热度,而是长期人才和知识。', en: 'You enter SYSU South Campus, where old buildings and banyans speak of long-term talent and knowledge.' },
    scenes: [{ speaker: 0, q: { zh: '中山大学南校园代表哪种生产力?', en: 'What productivity does SYSU South Campus represent?' }, options: [
      { text: { zh: '长期积累的人才、医学、海洋与人文研究', en: 'Long-term talent, medicine, ocean studies and humanities' }, correct: true, feedback: { zh: '准确。大湾区不只需要速度,也需要大学提供深层知识土壤。', en: 'Correct. The Bay Area needs deep knowledge soil from universities.' } },
      { text: { zh: '只代表短期消费热点', en: 'Only a short-term consumption trend' }, correct: false, feedback: { zh: '不对。它代表现代高等教育在岭南扎根。', en: 'No. It represents modern higher education rooted in Lingnan.' } },
    ] }],
    reward: { badge: '📚', badgeName: { zh: '康乐学脉印', en: 'Seal of Kangle Scholarship' }, insight: { zh: '中山大学南校园让湾区创新拥有厚重的人才根系。', en: 'SYSU gives Bay Area innovation deep talent roots.' } },
  },
  'N-SC07': {
    characters: [{ name: { zh: '科普导师', en: 'Science Mentor' }, role: { zh: '广东科学中心讲解员', en: 'Guide of Guangdong Science Center' }, portrait: '' }],
    intro: { zh: '展厅里的孩子按下按钮,光、电、力和生命科学变得可触摸。科学从实验室走向周末,创新才有下一代。', en: 'Children press buttons in the hall; science becomes touchable. Innovation needs science in public life.' },
    scenes: [{ speaker: 0, q: { zh: '广东科学中心的重要性在哪里?', en: 'Why is Guangdong Science Center important?' }, options: [
      { text: { zh: '把科学翻译给公众,培养未来工程师和好奇心', en: 'It translates science to the public and grows future engineers' }, correct: true, feedback: { zh: '正是。科普是创新生态的底层土壤。', en: 'Yes. Science education is basic soil for innovation.' } },
      { text: { zh: '科普与创新完全无关', en: 'Science education has nothing to do with innovation' }, correct: false, feedback: { zh: '不对。没有公众理解和下一代好奇心,创新很难持续。', en: 'No. Innovation needs public understanding and curiosity.' } },
    ] }],
    reward: { badge: '🧪', badgeName: { zh: '科普星火印', en: 'Seal of Public Science' }, insight: { zh: '广东科学中心让科学成为大众可以亲近的公共体验。', en: 'Guangdong Science Center makes science a public experience.' } },
  },
  'N-SC08': {
    characters: [{ name: { zh: '中子束线科学家', en: 'Neutron Beam Scientist' }, role: { zh: '散裂中子源研究者', en: 'CSNS researcher' }, portrait: '' }],
    intro: { zh: '松山湖深处,中子束穿透材料内部。大湾区从制造产品走向理解材料,背后离不开这种大科学装置。', en: 'In Songshan Lake, neutron beams look inside materials. Manufacturing moves toward understanding matter.' },
    scenes: [{ speaker: 0, q: { zh: '中国散裂中子源为什么重要?', en: 'Why is CSNS important?' }, options: [
      { text: { zh: '它帮助研究材料内部结构,支撑物理、生命科学和工程升级', en: 'It studies internal material structure and supports science and engineering upgrades' }, correct: true, feedback: { zh: '没错。许多产业突破,先发生在看不见的材料结构里。', en: 'Correct. Many industrial breakthroughs begin inside invisible material structures.' } },
      { text: { zh: '它只是一座普通商场', en: 'It is only a shopping mall' }, correct: false, feedback: { zh: '不对。它是国家级大科学装置。', en: 'No. It is a national big-science facility.' } },
    ] }],
    reward: { badge: '⚛️', badgeName: { zh: '中子探微印', en: 'Seal of Neutron Insight' }, insight: { zh: '散裂中子源让湾区制造业拥有理解材料的深层眼睛。', en: 'CSNS gives Bay Area manufacturing deep eyes into materials.' } },
  },
  'N-SC09': {
    characters: [{ name: { zh: '数码港创业者', en: 'Cyberport Founder' }, role: { zh: '香港数字经济观察者', en: 'Observer of Hong Kong digital economy' }, portrait: '' }],
    intro: { zh: '你走在数码港海边,创业公司、资本和国际市场在这里相遇。香港的数字化不是复制深圳,而是补上金融与软件接口。', en: 'At Cyberport, startups, capital and global markets meet. Hong Kong adds software and finance interfaces.' },
    scenes: [{ speaker: 0, q: { zh: '数码港对湾区创新的补充是什么?', en: 'What does Cyberport add to Bay Area innovation?' }, options: [
      { text: { zh: '金融科技、数字内容、资本与国际服务网络', en: 'Fintech, digital content, capital and global service networks' }, correct: true, feedback: { zh: '对。它让硬件创新之外的软件、金融和国际市场接口更完整。', en: 'Yes. It complements hardware with software, finance and global market interfaces.' } },
      { text: { zh: '只生产传统农业工具', en: 'It only produces traditional farm tools' }, correct: false, feedback: { zh: '不对。数码港的关键词是数字经济和创业生态。', en: 'No. Cyberport is about digital economy and startups.' } },
    ] }],
    reward: { badge: '💻', badgeName: { zh: '数码创业印', en: 'Seal of Digital Startups' }, insight: { zh: '数码港让香港把金融城市能力延展到数字经济。', en: 'Cyberport extends Hong Kongs financial-city strengths into digital economy.' } },
  },
  'N-SC10': {
    characters: [{ name: { zh: '横琴学生', en: 'Hengqin Student' }, role: { zh: '澳门大学校园观察者', en: 'Observer of University of Macau' }, portrait: '' }],
    intro: { zh: '澳门大学横琴校区像一座跨过边界的知识岛。学生、实验室与制度安排每天一起运转,融合变得具体。', en: 'The University of Macau Hengqin Campus is a knowledge island across boundaries, where students, labs and systems work daily.' },
    scenes: [{ speaker: 0, q: { zh: '澳门大学横琴校区象征什么?', en: 'What does the UM Hengqin campus symbolize?' }, options: [
      { text: { zh: '教育空间、制度安排和湾区融合的日常化', en: 'Education space, institutional arrangement and daily integration' }, correct: true, feedback: { zh: '没错。它把融合从宏大词汇变成了校园生活。', en: 'Yes. It turns integration from a grand phrase into campus life.' } },
      { text: { zh: '它与教育和湾区合作无关', en: 'It has nothing to do with education or cooperation' }, correct: false, feedback: { zh: '不对。它正是澳门高等教育与横琴空间协同的代表。', en: 'No. It represents Macao higher education working with Hengqin space.' } },
    ] }],
    reward: { badge: '🏫', badgeName: { zh: '横琴学岛印', en: 'Seal of the Hengqin Campus' }, insight: { zh: '澳门大学横琴校区让知识成为大湾区融合的温和力量。', en: 'The UM Hengqin campus makes knowledge a quiet force of integration.' } },
  },

  // ============ 新增锚点 · 湾区风味 ============
  'N-AW05': {
    characters: [{ name: { zh: '西关街坊', en: 'Xiguan Neighbor' }, role: { zh: '永庆坊生活讲述者', en: 'Narrator of Yongqing Fang life' }, portrait: '' }],
    intro: { zh: '你走入永庆坊,骑楼、粤剧、早茶和新店铺挤在同一条街上。老城更新不是静态保存,而是让生活继续发生。', en: 'In Yongqing Fang, arcades, opera, tea and new shops share one street. Renewal means life continues.' },
    scenes: [{ speaker: 0, q: { zh: '永庆坊最好的理解方式是什么?', en: 'How should Yongqing Fang be understood?' }, options: [
      { text: { zh: '老城烟火、非遗与新消费共存的更新样本', en: 'A renewal sample where old-city life, heritage and new consumption coexist' }, correct: true, feedback: { zh: '正是。它的重点不是变新,而是不丢生活气。', en: 'Exactly. Its point is not becoming new, but keeping everyday warmth.' } },
      { text: { zh: '完全拆掉记忆后的空白商业区', en: 'A blank commercial area after erasing memory' }, correct: false, feedback: { zh: '不对。永庆坊的价值正是保留街巷记忆并继续使用。', en: 'No. Its value is keeping memory in use.' } },
    ] }],
    reward: { badge: '🫖', badgeName: { zh: '西关烟火印', en: 'Seal of Xiguan Everyday Life' }, insight: { zh: '永庆坊说明:城市更新最好不是替换生活,而是给生活续航。', en: 'Yongqing Fang shows renewal should extend life, not replace it.' } },
  },
  'N-AW06': {
    characters: [{ name: { zh: '石湾陶工', en: 'Shiwan Potter' }, role: { zh: '南风古灶守窑人', en: 'Keeper of Nanfeng Kiln' }, portrait: '' }],
    intro: { zh: '南风古灶的火延续数百年。泥土、火候、碗盏与屋脊装饰,让湾区风味从餐桌延伸到器物。', en: 'Nanfeng Ancient Kiln has burned for centuries. Clay and fire extend Bay Area taste into objects.' },
    scenes: [{ speaker: 0, q: { zh: '南风古灶让我们看到什么?', en: 'What does Nanfeng Ancient Kiln reveal?' }, options: [
      { text: { zh: '生活方式也可以由陶土、火候和工艺慢慢烧成', en: 'Lifestyle can be slowly fired from clay, heat and craft' }, correct: true, feedback: { zh: '没错。味道不只在食物中,也在承载食物的器物里。', en: 'Yes. Taste lives not only in food, but also in the vessels that hold it.' } },
      { text: { zh: '陶瓷与岭南生活完全无关', en: 'Ceramics have nothing to do with Lingnan life' }, correct: false, feedback: { zh: '不对。石湾陶长期塑造岭南日用器物和审美。', en: 'No. Shiwan ceramics shaped Lingnan daily objects and aesthetics.' } },
    ] }],
    reward: { badge: '🏺', badgeName: { zh: '石湾陶火印', en: 'Seal of Shiwan Kiln Fire' }, insight: { zh: '南风古灶让湾区风味拥有器物和火候的维度。', en: 'Nanfeng Kiln gives Bay Area flavor the dimension of objects and fire.' } },
  },
  'N-AW07': {
    characters: [{ name: { zh: '石岐食客', en: 'Shiqi Diner' }, role: { zh: '中山味觉讲述者', en: 'Narrator of Zhongshan taste' }, portrait: '' }],
    intro: { zh: '你走在石岐老街,乳鸽香气从骑楼间飘出。香山侨乡、商贸往来与家族记忆,都能在一张餐桌上相遇。', en: 'In Shiqi Old Street, roast pigeon aroma drifts through arcades. Overseas-Chinese memory meets commerce at the table.' },
    scenes: [{ speaker: 0, q: { zh: '石岐老街的食物为何值得成为锚点?', en: 'Why can Shiqi food be an anchor?' }, options: [
      { text: { zh: '它连接侨乡迁徙、地方身份和珠江口商贸', en: 'It connects migration, local identity and estuary commerce' }, correct: true, feedback: { zh: '准确。食物是理解地方身份的一条捷径。', en: 'Correct. Food is a shortcut to local identity.' } },
      { text: { zh: '食物永远不能承载历史', en: 'Food can never carry history' }, correct: false, feedback: { zh: '不对。许多地方记忆正是通过味道保存的。', en: 'No. Many local memories are preserved through taste.' } },
    ] }],
    reward: { badge: '🐦', badgeName: { zh: '石岐风味印', en: 'Seal of Shiqi Flavor' }, insight: { zh: '石岐老街提醒我们:一口地方味,也能讲迁徙和家族的故事。', en: 'Shiqi Old Street shows local taste can tell stories of migration and family.' } },
  },
  'N-AW08': {
    characters: [{ name: { zh: '官也街店主', en: 'Rua do Cunha Shopkeeper' }, role: { zh: '澳门小吃讲述者', en: 'Narrator of Macao snacks' }, portrait: '' }],
    intro: { zh: '官也街上,蛋挞、杏仁饼、猪扒包与手信店排成一条味觉走廊。澳门的混血历史,落在甜咸之间。', en: 'Rua do Cunha turns egg tarts, cookies and pork buns into a taste corridor of Macao history.' },
    scenes: [{ speaker: 0, q: { zh: '官也街最能体现澳门哪种特质?', en: 'What Macao trait does Rua do Cunha show?' }, options: [
      { text: { zh: '中西混合的城市身份可以通过食物被感知', en: 'A mixed East-West identity can be tasted through food' }, correct: true, feedback: { zh: '没错。宏大的交流史,在澳门常常会变成一口点心。', en: 'Yes. In Macao, grand exchange often becomes a snack.' } },
      { text: { zh: '澳门饮食完全没有中西交流', en: 'Macao food has no East-West exchange' }, correct: false, feedback: { zh: '不对。澳门饮食正是多元文化相遇的日常证据。', en: 'No. Macao food is everyday evidence of cultural encounter.' } },
    ] }],
    reward: { badge: '🥧', badgeName: { zh: '官也甜咸印', en: 'Seal of Rua do Cunha Taste' }, insight: { zh: '官也街让城市身份变成可以边走边吃的体验。', en: 'Rua do Cunha turns city identity into a walkable taste.' } },
  },
  'N-AW09': {
    characters: [{ name: { zh: '大澳渔民', en: 'Tai O Fisher' }, role: { zh: '棚屋水道讲述者', en: 'Narrator of stilt houses and waterways' }, portrait: '' }],
    intro: { zh: '你在大澳水道旁听见船声,棚屋、虾酱和咸鱼记录着香港被高楼遮住的海上生活。', en: 'By Tai O waterways, stilt houses, shrimp paste and salted fish preserve Hong Kongs sea life.' },
    scenes: [{ speaker: 0, q: { zh: '大澳渔村补充了香港哪一面?', en: 'What side of Hong Kong does Tai O add?' }, options: [
      { text: { zh: '海上人家、渔港社群与潮汐生活', en: 'Sea families, fishing communities and tidal life' }, correct: true, feedback: { zh: '正确。香港不只有金融天际线,也有棚屋和海风。', en: 'Correct. Hong Kong is not only finance skyline, but stilt houses and sea wind.' } },
      { text: { zh: '它只代表摩天楼金融区', en: 'It only represents skyscraper finance' }, correct: false, feedback: { zh: '不对。大澳保存的是渔村和海岛社区记忆。', en: 'No. Tai O preserves fishing-village and island memory.' } },
    ] }],
    reward: { badge: '🛶', badgeName: { zh: '大澳海家印', en: 'Seal of Tai O Sea Families' }, insight: { zh: '大澳让香港重新显露海上人家的底色。', en: 'Tai O reveals Hong Kongs sea-family roots.' } },
  },
  'N-AW10': {
    characters: [{ name: { zh: '道滘龙舟手', en: 'Daojiao Dragon-Boater' }, role: { zh: '水乡节令讲述者', en: 'Narrator of water-town seasons' }, portrait: '' }],
    intro: { zh: '道滘水道纵横,粽香与龙舟鼓声一起浮起。东莞不只属于工厂,也属于水网和节令。', en: 'Daojiao waterways carry rice dumpling aroma and dragon-boat drums. Dongguan belongs to water and seasons too.' },
    scenes: [{ speaker: 0, q: { zh: '道滘水乡为什么放在“湾区风味”?', en: 'Why is Daojiao under Bay Area flavors?' }, options: [
      { text: { zh: '它把水网、节令饮食和龙舟民俗连成生活时间表', en: 'It connects waterways, seasonal food and dragon-boat customs into a life calendar' }, correct: true, feedback: { zh: '正是。地方味道常常跟节令和水土一起生长。', en: 'Exactly. Local flavor grows with seasons and water.' } },
      { text: { zh: '它与民俗和饮食没有关系', en: 'It has no relation to food or folk custom' }, correct: false, feedback: { zh: '不对。道滘的水乡生活和节令饮食非常紧密。', en: 'No. Daojiao water-town life is closely tied to seasonal food.' } },
    ] }],
    reward: { badge: '🚣', badgeName: { zh: '水乡节令印', en: 'Seal of Water-Town Seasons' }, insight: { zh: '道滘水乡让东莞在制造之外保留了水网生活的节奏。', en: 'Daojiao keeps Dongguans water-town rhythm beyond manufacturing.' } },
  },

  // ============ 新增锚点 · 航海贸易 ============
  'N-NA05': {
    characters: [{ name: { zh: '南沙海民', en: 'Nansha Sea Folk' }, role: { zh: '天后宫航海信仰讲述者', en: 'Narrator of Tianhou maritime belief' }, portrait: '' }],
    intro: { zh: '你在南沙天后宫望向珠江口,现代港区就在不远处。古老信仰和集装箱航线,其实都在回答同一个问题:如何面对大海。', en: 'At Nansha Tianhou Palace, modern port areas are nearby. Old belief and container routes both answer how to face the sea.' },
    scenes: [{ speaker: 0, q: { zh: '南沙天后宫连接了哪两种海洋力量?', en: 'What two maritime forces does Nansha Tianhou Palace connect?' }, options: [
      { text: { zh: '传统航海信仰与现代港口物流', en: 'Traditional maritime belief and modern port logistics' }, correct: true, feedback: { zh: '正确。面对海洋,人既需要技术,也需要精神坐标。', en: 'Correct. Facing the sea requires technology and spiritual coordinates.' } },
      { text: { zh: '它与海洋完全无关', en: 'It has nothing to do with the sea' }, correct: false, feedback: { zh: '不对。天后信仰本来就与航海安全和海民生活相关。', en: 'No. Tianhou belief is deeply tied to maritime safety and sea folk life.' } },
    ] }],
    reward: { badge: '🕯️', badgeName: { zh: '南沙祈风印', en: 'Seal of Nansha Sea Blessing' }, insight: { zh: '南沙天后宫让古老海洋信仰与现代港口站在同一片海边。', en: 'Nansha Tianhou Palace lets old maritime belief stand beside modern ports.' } },
  },
  'N-NA06': {
    characters: [{ name: { zh: '妈阁庙香客', en: 'A-Ma Pilgrim' }, role: { zh: '澳门港口源头讲述者', en: 'Narrator of Macaus maritime origin' }, portrait: '' }],
    intro: { zh: '妈阁庙前海风吹来,澳门名字的传说也从这里展开。小小庙宇,连接华南海民与葡萄牙航海时代。', en: 'Sea wind reaches A-Ma Temple, where the legend of Macaus name begins.' },
    scenes: [{ speaker: 0, q: { zh: '妈阁庙为什么是澳门重要锚点?', en: 'Why is A-Ma Temple an important Macau anchor?' }, options: [
      { text: { zh: '它连接妈祖信仰、港口起源与澳门地名记忆', en: 'It links Mazu belief, port origins and the memory of Macaus name' }, correct: true, feedback: { zh: '正是。澳门的世界港口故事,从这样的小港湾开始。', en: 'Yes. Macaus world-port story begins from such a small harbor.' } },
      { text: { zh: '它只是一座与航海无关的高楼', en: 'It is only a tower unrelated to navigation' }, correct: false, feedback: { zh: '不对。妈阁庙是澳门海上信仰和港口记忆核心。', en: 'No. A-Ma Temple is central to Macaus maritime belief and memory.' } },
    ] }],
    reward: { badge: '🌊', badgeName: { zh: '妈阁海源印', en: 'Seal of A-Ma Maritime Origin' }, insight: { zh: '妈阁庙把澳门的名字、港口和海上信仰连接在一起。', en: 'A-Ma Temple connects Macaus name, port and maritime belief.' } },
  },
  'N-NA07': {
    characters: [{ name: { zh: '桂山船长', en: 'Guishan Captain' }, role: { zh: '万山群岛航线讲述者', en: 'Narrator of Wanshan island routes' }, portrait: '' }],
    intro: { zh: '船靠近桂山岛,珠江口不再只是一条海岸线,而是一串岛屿、航道和渔港组成的网络。', en: 'Approaching Guishan Island, the estuary becomes a network of islands, routes and fishing ports.' },
    scenes: [{ speaker: 0, q: { zh: '桂山岛让湾区地图增加了什么维度?', en: 'What dimension does Guishan Island add to the Bay Area map?' }, options: [
      { text: { zh: '岛链、渔港、航道和海上生活', en: 'Island chains, fishing ports, routes and sea life' }, correct: true, feedback: { zh: '没错。大湾区并不止于陆地城市,海面本身也是网络。', en: 'Yes. The Bay Area is not only land cities; the sea is also a network.' } },
      { text: { zh: '它证明湾区没有海洋空间', en: 'It proves the Bay Area has no maritime space' }, correct: false, feedback: { zh: '恰恰相反。桂山岛强调的是湾区的海岛维度。', en: 'The opposite. Guishan emphasizes the island dimension.' } },
    ] }],
    reward: { badge: '🏝️', badgeName: { zh: '万山岛链印', en: 'Seal of the Wanshan Islands' }, insight: { zh: '桂山岛提醒我们:湾区的城市网络也漂浮在海面上。', en: 'Guishan reminds us that the Bay Area network also floats on the sea.' } },
  },
  'N-NA08': {
    characters: [{ name: { zh: '海防军户', en: 'Coastal Defender' }, role: { zh: '平海古城守望者', en: 'Guardian of Pinghai Ancient City' }, portrait: '' }],
    intro: { zh: '你走近平海古城墙,南海季风从城门穿过。开放的海岸,也曾需要防御、军户和社区共同守望。', en: 'At Pinghai walls, the monsoon passes the gate. Open coasts also needed defense and community watch.' },
    scenes: [{ speaker: 0, q: { zh: '平海古城补充了海洋叙事的哪一面?', en: 'What side of maritime history does Pinghai add?' }, options: [
      { text: { zh: '海防、沿海聚落和开放背后的安全需求', en: 'Coastal defense, settlements and the need for security behind openness' }, correct: true, feedback: { zh: '准确。海洋带来贸易,也要求守望和防御。', en: 'Correct. The sea brings trade, but also demands defense.' } },
      { text: { zh: '海岸永远不需要防御', en: 'Coasts never need defense' }, correct: false, feedback: { zh: '不对。明代海防正是沿海社会的重要部分。', en: 'No. Ming coastal defense was a vital part of coastal society.' } },
    ] }],
    reward: { badge: '🛡️', badgeName: { zh: '平海海防印', en: 'Seal of Pinghai Defense' }, insight: { zh: '平海古城让开放的海洋叙事拥有了防守的一面。', en: 'Pinghai gives the open-sea story a defensive side.' } },
  },
  'N-NA09': {
    characters: [{ name: { zh: '长洲岛民', en: 'Cheung Chau Islander' }, role: { zh: '离岛节庆讲述者', en: 'Narrator of island festivals' }, portrait: '' }],
    intro: { zh: '长洲渡轮靠岸,街巷里包山、庙会和鱼港气息交织。香港的海洋性,也藏在小岛节庆中。', en: 'The ferry reaches Cheung Chau. Bun towers, temple rites and fishing-port air reveal Hong Kongs island character.' },
    scenes: [{ speaker: 0, q: { zh: '长洲岛为什么属于航海贸易图层?', en: 'Why does Cheung Chau belong in the maritime layer?' }, options: [
      { text: { zh: '它展示离岛渡轮、渔港社群和海上节庆如何维系共同体', en: 'It shows ferries, fishing communities and maritime festivals sustaining community' }, correct: true, feedback: { zh: '没错。海港社会不只有大码头,也有小岛日常。', en: 'Yes. Harbor society includes island everyday life.' } },
      { text: { zh: '它与海岛和航线毫无关系', en: 'It has nothing to do with islands or routes' }, correct: false, feedback: { zh: '不对。长洲的渡轮和渔港生活就是海洋网络的一部分。', en: 'No. Its ferries and fishing life are part of the maritime network.' } },
    ] }],
    reward: { badge: '⛴️', badgeName: { zh: '长洲渡海印', en: 'Seal of Cheung Chau Ferry' }, insight: { zh: '长洲岛让香港的海洋文明回到社区与节庆。', en: 'Cheung Chau brings Hong Kongs maritime culture back to community and festival.' } },
  },
  'N-NA10': {
    characters: [{ name: { zh: '沙面洋行职员', en: 'Shamian Firm Clerk' }, role: { zh: '近代外贸记录者', en: 'Recorder of modern foreign trade' }, portrait: '' }],
    intro: { zh: '你走在沙面岛树荫下,银行、洋行、领事馆旧址安静排列。黄埔古港之后,贸易进入建筑、金融和法律空间。', en: 'On Shamian Island, banks, firms and consulates line the shade. After Huangpu, trade moved into architecture, finance and law.' },
    scenes: [{ speaker: 0, q: { zh: '沙面岛把广州贸易史推进到哪一阶段?', en: 'What stage of Guangzhou trade history does Shamian represent?' }, options: [
      { text: { zh: '近代外贸、金融机构和领事空间交织的阶段', en: 'Modern foreign trade mixed with finance and consular space' }, correct: true, feedback: { zh: '正是。沙面让贸易从码头延伸到制度与建筑空间。', en: 'Yes. Shamian extends trade from docks into institutions and architecture.' } },
      { text: { zh: '完全没有近代外贸痕迹', en: 'It has no trace of modern foreign trade' }, correct: false, feedback: { zh: '不对。沙面保存了广州近代外贸城市纹理。', en: 'No. Shamian preserves Guangzhous modern foreign-trade fabric.' } },
    ] }],
    reward: { badge: '🏛️', badgeName: { zh: '沙面洋行印', en: 'Seal of Shamian Trade Houses' }, insight: { zh: '沙面岛说明:贸易史不只在港口,也写在城市制度和建筑里。', en: 'Shamian shows trade history also lives in institutions and buildings.' } },
  },
};

Object.entries(EPISODE_SCENE_EXPANSIONS).forEach(([anchorId, extraScenes]) => {
  if (!EPISODES[anchorId] || !Array.isArray(extraScenes) || extraScenes.length === 0) return;
  EPISODES[anchorId].scenes = [...EPISODES[anchorId].scenes, ...extraScenes];
});

/** 判断某锚点是否拥有剧情副本 */
export function hasEpisode(anchorId) {
  return !!EPISODES[anchorId];
}

/** 取某锚点的剧情副本（无则返回 null）*/
export function getEpisode(anchorId) {
  return EPISODES[anchorId] || null;
}
