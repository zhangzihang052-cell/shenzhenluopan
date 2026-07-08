import { EPISODE_SCENE_EXPANSIONS } from './episode-expansions.js?rev=episodes-depth-1';

// 锚点剧情副本数据集（v3 · 全锚点覆盖 · 含角色头像）
// 为所有锚点扩展 episode 字段，以「锚点 id」为键。
// episode 结构：
//   characters: [{name,role,portrait}]    角色头像列表
//   intro                                 历史情境代入旁白（第二人称）
//   scenes: [{q, speaker?, options}]      2–3 个抉择/问答（speaker 为 characters 下标）
//   reward: {badge, badgeName, insight}   通关奖励

const NEAR_TENCENT_RPG_REV = 'audio-sfx-1';

function episodeAsset(path) {
  return `${path}?v=${NEAR_TENCENT_RPG_REV}`;
}

function episodeText(value, lang, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value[lang] || value.zh || value.en || fallback;
}

function makeRpgSynthesisText(config) {
  if (config.synthesis) return config.synthesis;
  const sceneZh = episodeText(config.sceneName, 'zh', '这一站');
  const sceneEn = episodeText(config.sceneName, 'en', 'this stop');
  return {
    zh: `现在把刚才的线索合在一起看。「${sceneZh}」不是一个孤立地标，而是一组真实地点、人物、制度与城市能力共同留下的证据。先看它们如何互相解释，再做判断。`,
    en: `Now connect the clues you just found. ${sceneEn} is not an isolated landmark, but evidence left by real places, people, systems, and city capabilities. Read how they explain one another before making a judgment.`,
  };
}

function makeRpgSynthesisChoice(config) {
  if (config.synthesisChoice) return config.synthesisChoice;
  return {
    question: {
      zh: '复盘这些线索时，最稳妥的调查方法是什么？',
      en: 'When reviewing these clues, what is the strongest method?',
    },
    options: [
      {
        text: { zh: '把线索连成一条因果链，看它们如何共同解释这处地点', en: 'Connect the clues into a cause-and-effect chain and see how they explain the place together' },
        correct: true,
        feedback: {
          zh: '对。单条线索只说明局部，连起来才会出现完整的城市逻辑。',
          en: 'Correct. One clue explains only a part; connected clues reveal the full urban logic.',
        },
      },
      {
        text: { zh: '只看最显眼的一处建筑或物件', en: 'Focus only on the most visible building or object' },
        correct: false,
        feedback: {
          zh: '这会漏掉关键。副本真正要训练的是把地点、人物、制度和时代背景放在一起看。',
          en: 'That misses the point. The quest trains you to read place, people, systems, and historical context together.',
        },
      },
      {
        text: { zh: '把每条线索当成互不相关的趣闻', en: 'Treat each clue as an unrelated fact' },
        correct: false,
        feedback: {
          zh: '还不够。线索之间的关系，才是理解城市为什么这样发展的关键。',
          en: 'Not enough. The relationship between clues is the key to understanding why the city developed this way.',
        },
      },
    ],
  };
}

function makeRpgImpactChoice(config) {
  if (config.impactChoice) return config.impactChoice;
  return {
    question: {
      zh: '离开这一站前，最应该带走的判断是什么？',
      en: 'Before leaving this stop, what judgment should you carry with you?',
    },
    options: [
      {
        text: {
          zh: '这处地点的价值来自它连接起历史现场、现实城市与未来想象',
          en: 'This place matters because it connects historical site, present city, and future imagination',
        },
        correct: true,
        feedback: {
          zh: '准确。城市副本不是背答案，而是看懂一处地点为什么能解释深圳。',
          en: 'Exactly. The quest is not about memorizing answers, but understanding why one place can explain Shenzhen.',
        },
      },
      {
        text: { zh: '只要记住这里适合打卡就够了', en: 'It is enough to remember that it is good for check-ins' },
        correct: false,
        feedback: {
          zh: '太浅了。打卡只是到达，理解才是这条路线真正要带走的东西。',
          en: 'Too shallow. A check-in is arrival; understanding is what the route should leave with you.',
        },
      },
      {
        text: { zh: '它与深圳和大湾区的发展没有关系', en: 'It has no relation to Shenzhen or the Greater Bay Area' },
        correct: false,
        feedback: {
          zh: '不对。能成为文化锚点，正因为它和城市发展的更大叙事相连。',
          en: 'No. It becomes a cultural anchor precisely because it links to a larger story of urban development.',
        },
      },
    ],
  };
}

const RPG_CLUE_DIALOGUES = {
  M01: {
    incense: {
      zh: '香火在这里不是背景气氛。你看见的是一套出海前的心理秩序：船员把恐惧、祈愿和纪律交给同一个仪式，船队才可能在漫长海路上保持共同节奏。',
    },
    chart: {
      zh: '这张海图最值得看的不是线条，而是线条背后的安排。季风什么时候转向、哪里补水、哪里换货、哪里递交国书，远航能走多远，先取决于纸上能不能组织起来。',
    },
    anchorage: {
      zh: '赤湾锚地不是船队歇脚的空地。宝船在这里补给、整队、等风，也是在把珠江口的地方港湾接到南海和印度洋的航线上。',
    },
    tribute: {
      zh: '这些贡品不能只理解成珍贵物件。瓷器、丝绸和茶叶是一种外交语言，它们说的是互通有无，而不是占领土地。郑和远航的分量，就藏在这种交换方式里。',
    },
  },
  M06: {
    blast: {
      zh: '这声炮响不是普通施工噪音。它把一个抽象的改革命题炸成了现场：能不能先开工、先试错、先让一片土地证明新的办法行得通。',
    },
    slogan: {
      zh: '这句标语当年锋利得像刀。它表面上说时间和效率，真正刺破的是旧体制里“干多干少差不多”的惯性。',
    },
    dock: {
      zh: '码头这条线索很实在。蛇口如果只是一片工地，改革就停在口号；接上海运、订单和外贸网络之后，它才变成能生产、能出口、能结算的端口。',
    },
    'work-system': {
      zh: '用工制度看起来没有炮声响亮，却更难。奖金、合同、岗位责任和企业自主权把“敢闯”变成日常管理，改革才不会只停留在一阵热血。',
    },
  },
  M03: {
    gate: {
      zh: '城门不是一堵墙的终点，而是治理进入城市的入口。谁进城、税赋怎么登记、军令如何传递，所有秩序都要先经过这道界面。',
    },
    bay: {
      zh: '海湾这条线索要和城门一起看。南头不是孤立在陆地上的城，它一边看向内陆，一边盯着珠江口的船路和海防风险。',
    },
    terrain: {
      zh: '地势说明了南头为什么能“守”和“通”同时成立。进可控海口，退可接腹地，行政、军防和转运才有可能落在同一个位置。',
    },
    record: {
      zh: '文书把传说变成坐标。东晋设东官郡不是一句背景介绍，而是在告诉我们：深圳这片土地很早就进入了国家治理的版图。',
    },
  },
  M08: {
    blueprint: {
      zh: '前海的蓝图不能当成楼盘规划看。它把金融开放、港企服务、法律衔接和城市空间画在一起，说明这里最早要建的不是楼，而是一套新规则。',
    },
    harbor: {
      zh: '港湾这条线索提醒你，制度试验不能悬在空中。港口、机场和香港都在附近，人流、资金流、信息流和货物流能交汇，规则才有被测试的真实场景。',
    },
    finance: {
      zh: '金融清单里的关键词很密：跨境人民币、双向资本池、港资机构服务。它们不是政策名词堆叠，而是在试探资金如何更安全地跨境流动。',
    },
    rules: {
      zh: '规则接口往往比道路更难修。税制、商事登记、仲裁和法律服务如果能接上，前海就不只是新区，而是深港协同可以复制的制度样本。',
    },
  },
  'N-EG02': {
    archive: {
      zh: '首批档案里最重要的不是哪家公司先上市，而是市场怎么被承认、被监管、被记录。证券交易所一开始要解决的，是信任能不能被制度化。',
    },
    screen: {
      zh: '交易屏上的数字跳得很快，但你不能只看涨跌。每一次跳动后面都有企业融资、投资者预期和监管边界，它们一起组成市场的呼吸。',
    },
    listing: {
      zh: '上市规则看起来枯燥，却是市场从热闹买卖走向现代制度的门槛。能进、能披露、能退场，资本市场才不会只剩情绪。',
    },
    chinext: {
      zh: '创业板名单里的价值在于“未完成”。很多企业还在成长，它们需要耐心资本，也把科技创新推到资本市场面前接受检验。',
    },
  },
  'N-SC02': {
    pager: {
      zh: '腾讯早期这段寻呼记录很小，却抓住了一个高频需求：人如何在线找到彼此。一个超级生态往往不是从宏大蓝图开始，而是从这种每天都会发生的连接开始。',
    },
    wechat: {
      zh: '微信这条线索不能只看聊天。公众号、小程序、支付和服务入口叠在一起之后，它就不再只是应用，而成了很多人进入数字生活的门。',
    },
    payment: {
      zh: '支付场景说明平台真正进城了。红包、扫码、地铁、商店和政务服务被接在同一套习惯里，数字生态才从屏幕走到街巷。',
    },
    cloud: {
      zh: '云端机房图要往楼背后看。游戏、企业服务、云计算和产业数字化都需要底层能力支撑，腾讯从消费互联网往下扎根，就是从这里开始变重的。',
    },
  },
  'N-SC03': {
    'flight-control': {
      zh: '飞控板看起来只是一块小电路，但它每一毫秒都在判断姿态、风向和修正量。无人机从玩具变成工具，靠的就是这层看不见的稳定。',
    },
    gimbal: {
      zh: '云台不是为了让画面更漂亮那么简单。它把颠簸的飞行翻译成稳定影像，让普通人第一次可以可靠地使用空中视角。',
    },
    'supply-chain': {
      zh: '零件清单里藏着深圳速度。传感器、模具、电池、主板和装配厂离得足够近，设计错了能很快改，改完又能很快试产。',
    },
    'test-flight': {
      zh: '试飞路线不是表演轨迹。抗风、避障、续航、返航，每一项都在回答同一个问题：这台机器离开实验室后，普通用户能不能放心使用。',
    },
  },
  M11: {
    statue: {
      zh: '铜像真正记录的不是一个姿势，而是一座城市选择继续向南看的方向感。纪念物之所以重要，是因为它把抽象判断固定成了公共记忆。',
    },
    tour: {
      zh: '南方谈话这条线索要读它的时间点。1992年的深圳需要的不是一个新项目，而是继续试验的信心，方向被再次确认，城市才敢往前跑。',
    },
    axis: {
      zh: '城市中轴把改革落到了空间里。山顶看下去，市民中心、商务区和海湾连成骨架，说明方向感最后会变成道路、建筑和公共场所。',
    },
    view: {
      zh: '山顶视野的价值不只是看风景。站在这里，速度、方向和公共记忆同时进入画面，深圳才从一堆地标变成可以被理解的城市叙事。',
    },
  },
  'N-AW04': {
    basin: {
      zh: '木盆不是普通餐具，它先把人安排到同一个圆里。食材共享一个容器，村民也共享一套座次、亲缘和节庆秩序。',
    },
    layers: {
      zh: '层叠食材不是为了摆得热闹。萝卜在底、肉菜在上，口味、火候和长幼礼序都被放进了同一个盆里。',
    },
    genealogy: {
      zh: '族谱这条线索要和宴席连起来看。迁徙之后，人靠祠堂确认来处，也靠一桌盆菜把分散的亲族重新叫回共同身份里。',
    },
    festival: {
      zh: '节庆锣鼓一响，盆菜就不只是饭。它像一个召回机制，让外出的人、留村的人、远亲近邻重新坐到同一张桌边。',
    },
  },
  M07: {
    tide: {
      zh: '潮汐不是背景水纹。它每天把养分、泥沙和压力一起送到岸边，也提醒城市排水、航运和生态保护必须共用同一片海湾。',
    },
    roots: {
      zh: '红树林的根系安静得容易被忽略，但它在替城市做基础设施的工作：固岸、消浪、留泥、净水，用柔软的方式抵住海岸压力。',
    },
    birds: {
      zh: '候鸟让深圳湾接上了另一张世界地图。黑脸琵鹭飞过这里，说明这片岸线不只属于城市开发，也属于跨洲迁徙的生命路线。',
    },
    'city-edge': {
      zh: '城市边界这条线索最现实。高楼、口岸、湿地和海面贴得这么近，真正成熟的湾区不是把岸线用满，而是知道哪里必须留白。',
    },
  },
  'N-EG10': {
    bridge: {
      zh: '桥面让距离变得可计算。过去要绕行的时间被压缩成一段连续道路，工程首先改变的不是地图，而是人们对远近的感觉。',
    },
    island: {
      zh: '人工岛很像海上的临时城市。桥隧转换、施工组织、应急保障都要在这里完成，它把陆地工程能力搬到了水面中央。',
    },
    tunnel: {
      zh: '海底隧道说明连接不一定都要露在海面上。给航道让出空间，同时保证车辆通行和安全，这才是超级工程真正复杂的地方。',
    },
    flows: {
      zh: '产业流线地图要看货怎么走。通道的价值不只是让人跨海更快，而是让制造、物流和供应链重新分配城市之间的协作关系。',
    },
  },
};

function makeNearbyRpgEpisode(config) {
  const playerName = config.playerName || { zh: '我 · 现场记录员', en: 'Me · Field Recorder' };
  const playerRole = config.playerRole || { zh: '案卷批注', en: 'Case Note' };
  const synthesisText = makeRpgSynthesisText(config);
  const synthesisChoice = makeRpgSynthesisChoice(config);
  const impactChoice = makeRpgImpactChoice(config);
  return {
    immersiveMode: 'rpg-dialogue',
    characters: config.characters,
    intro: config.intro,
    rpg: {
      background: episodeAsset(config.background),
      sceneName: config.sceneName,
      subtitle: config.subtitle,
      chapterTitle: config.chapterTitle,
      objective: config.objective,
      objectiveDone: config.objectiveDone,
      chapters: config.chapters || [
        { zh: '序章', en: 'Prologue' },
        { zh: '踏勘', en: 'Survey' },
        { zh: '线索', en: 'Clues' },
        { zh: '判断', en: 'Judgment' },
        { zh: '完成', en: 'Complete' },
      ],
      clues: config.clues,
      beats: [
        {
          type: 'dialogue',
          speakerType: 'npc',
          chapter: 0,
          speaker: 0,
          text: config.start,
        },
        {
          type: 'dialogue',
          speakerType: 'player',
          chapter: 0,
          speakerName: playerName,
          speakerRole: playerRole,
          continueLabel: { zh: '开始踏勘', en: 'Start Survey' },
          text: config.playerNote,
        },
        {
          type: 'investigate',
          speakerType: 'npc',
          chapter: 1,
          speaker: 0,
          text: config.survey,
        },
        {
          type: 'dialogue',
          speakerType: 'npc',
          chapter: 2,
          speaker: 0,
          text: synthesisText,
        },
        {
          type: 'choice',
          speakerType: 'npc',
          chapter: 2,
          speaker: 0,
          question: synthesisChoice.question,
          options: synthesisChoice.options,
        },
        {
          type: 'choice',
          speakerType: 'npc',
          chapter: 2,
          speaker: 0,
          question: config.judge.question,
          options: config.judge.options,
        },
        {
          type: 'dialogue',
          speakerType: 'npc',
          chapter: 3,
          speaker: 0,
          text: config.reflection,
        },
        {
          type: 'choice',
          speakerType: 'npc',
          chapter: 3,
          speaker: 0,
          question: impactChoice.question,
          options: impactChoice.options,
        },
        {
          type: 'choice',
          speakerType: 'player',
          chapter: 3,
          speakerName: playerName,
          speakerRole: playerRole,
          continueLabel: { zh: '记入案卷', en: 'Enter Record' },
          question: config.finalChoice.question,
          options: config.finalChoice.options,
        },
        {
          type: 'dialogue',
          speakerType: 'npc',
          chapter: 4,
          speaker: 0,
          text: config.closing,
        },
      ],
      completion: config.completion,
    },
    reward: config.reward,
  };
}

/** @type {Record<string, Episode>} */
export const EPISODES = {

  // ============ M01 赤湾天后宫 · 郑和（航海贸易）============
  M01: {
    characters: [
      { name: { zh: '郑和', en: 'Zheng He' }, role: { zh: '大明宝船统帅', en: 'Admiral of the Treasure Fleet' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/53cfd435-8785-406e-a8cd-59cfbbbfbd40/image_1781684639_1_3.png' },
      { name: { zh: '你', en: 'You' }, role: { zh: '宝船通译', en: 'Fleet Interpreter' }, portrait: '' },
    ],
    intro: {
      zh: '永乐三年，你是郑和宝船上的年轻通译。船队将自珠江口赤湾起锚远航，出航前夜，你随郑和登上赤湾天后宫——这座宋代始建的天妃庙，此时已是朝廷使臣出洋前必停的祭祀之地。海风裹着香火气息扑面而来，郑和亲手以三牲祭海，行「辞沙」之礼。你的目光越过殿前月池，远处珠江口暗礁密布，前方是从未有人完整丈量过的汪洋。',
      en: 'It is 1405. You are a young interpreter aboard Zheng He\'s treasure fleet. On the eve of departure from Chiwan, you climb with the Admiral to the Tianhou Temple — first built in the Song dynasty as the Tianfei Shrine, now a mandatory stop for imperial envoys. Sea breeze carries incense; Zheng He offers sacrifices and performs the "ci sha" rite. Beyond the temple\'s moon pool, the Pearl River mouth bristles with hidden reefs, and ahead lies an ocean no one has fully charted.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '郑和指殿前石碑问你：「此庙初建何时？原名什么？」', en: 'Zheng He points to a stone tablet: "When was this temple first built, and what was its original name?"' },
        options: [
          { text: { zh: '宋代始建，原名「天妃庙」，清康熙年间才改称「天后宫」', en: 'Founded in the Song dynasty as "Tianfei Temple," renamed "Tianhou Temple" under Emperor Kangxi' }, correct: true, feedback: { zh: '正是。赤湾天后宫创建远溯宋代，初名「天妃庙」，沿用了近四百年，直到清康熙二十三年（1684年）才更名「天后宫」。以天后宫为中心的「赤湾胜概」位列明清「新安八景」之首。', en: 'Exactly. Founded in the Song as "Tianfei Temple," it kept that name for nearly 400 years until 1684, when Emperor Kangxi renamed it "Tianhou Temple." The temple complex was the first of the eight classic views of Xin\'an.' } },
          { text: { zh: '明永乐年间郑和下西洋时才建', en: 'Built during Zheng He\'s voyages in the Yongle reign' }, correct: false, feedback: { zh: '郑和到赤湾时庙已存在数百年。据传郑和途经珠江口遇险，祈天后得平安，归朝后派人整修庙宇。此后明朝船队出航前必到赤湾祭祀，但庙本身并非郑和所建。', en: 'The temple existed centuries before Zheng He. Legend says he was saved at the Pearl River mouth after praying to Tianhou, and later renovated the temple. Ming fleets then always stopped here — but Zheng He did not build it.' } },
        ],
      },
      {
        speaker: 0,
        q: { zh: '祭海仪式开始，郑和命人将祭品置于沙滩之上。你听老水手说这叫「辞沙」——这个仪式有什么来历？', en: 'The sea-rite begins: offerings are placed on the sand. An old sailor calls it "ci sha" — what is its origin?' },
        options: [
          { text: { zh: '赤湾独有的祭海仪式，朝廷使臣出洋前在此「辞沙」告别陆地', en: 'A ritual unique to Chiwan: envoys bid farewell to land before voyaging' }, correct: true, feedback: { zh: '正是。赤湾天后宫是全国唯一的「辞沙」祭海地。明清两朝，凡朝廷使臣出使东南亚各国，经此必停船进香，以大礼祷告。赤湾因此成为海上丝绸之路在珠江口的关键驿站。', en: 'Correct. Chiwan is the only place in China with the "ci sha" rite. Ming and Qing envoys to Southeast Asia always stopped here to offer incense. Chiwan became a key Maritime Silk Road station at the Pearl River mouth.' } },
          { text: { zh: '只是渔民出海前随便烧纸，没有朝廷定制', en: 'Just fishermen burning paper, no official protocol' }, correct: false, feedback: { zh: '「辞沙」绝非民间随意之举。明代朝廷曾颁文：凡朝廷使臣出使东南各国，经过赤湾必停船祭祀。这是国家层面的航海礼仪，赤湾天后宫也因此从民间庙宇升格为官方祭祀场所。', en: '"Ci sha" was no casual folk custom. The Ming court decreed that all envoys passing Chiwan must stop and offer sacrifices. This was state-level maritime protocol, elevating the temple from a folk shrine to an official ritual site.' } },
        ],
      },
    ],
    reward: { badge: '⚓', badgeIcon: 'treasure-fleet', badgeName: { zh: '和平远航印', en: 'Seal of the Peaceful Voyage' }, insight: { zh: '赤湾天后宫创建于宋代，初名「天妃庙」，清康熙二十三年（1684年）更名「天后宫」，是明清「新安八景」之首。明代朝廷颁文：凡使臣出使东南亚，经赤湾必停船祭祀。郑和七下西洋（1405-1433），赤湾天后宫是重要驿站，郑和曾在此行「辞沙」祭海之礼——这是全国独有的祭海仪式。赤湾因此成为海上丝绸之路在珠江口的关键节点。赤湾附近还有宋少帝陵：1279年崖山海战，陆秀夫负南宋末帝赵昺投海，遗骸相传漂至赤湾安葬。一个王朝的终结与远洋开拓的起点，在同一片海岸交汇——这片海湾承载的，不只是信仰，更是中国海洋文明的连续记忆。', en: 'Chiwan Tianhou Temple was founded in the Song dynasty as "Tianfei Temple," renamed in 1684 under Emperor Kangxi. It was the foremost of the eight classic views of Xin\'an. The Ming court decreed that all envoys to Southeast Asia must stop here to offer sacrifices. During Zheng He\'s seven voyages (1405-1433), Chiwan was a key station where he performed the "ci sha" sea rite — unique to this site, making Chiwan a critical Maritime Silk Road node. Nearby lies the tomb of the last Southern Song emperor Zhao Bing, who drowned at the 1279 Battle of Yamen. The end of a dynasty and the dawn of oceanic exploration share this shore — a continuous memory of Chinese maritime civilization.' } },
  },

  // ============ M02 葛洪炼丹遗迹 · 罗浮山（古代文化）============
  M02: {
    characters: [
      { name: { zh: '葛洪', en: 'Ge Hong' }, role: { zh: '东晋道学家·医学家', en: 'Eastern Jin Alchemist & Physician' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/9266e845-4545-416b-8028-a0a9752d9b81/image_1781684643_1_3.jpg' },
      { name: { zh: '屠呦呦', en: 'Tu Youyou' }, role: { zh: '诺贝尔奖得主', en: 'Nobel Laureate' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/e7d9e7e2-7853-4186-98a1-68d8880cbabf/image_1781684668_1_1.jpg' },
    ],
    intro: {
      zh: '你是东晋年间罗浮山下的药童。师父葛洪，字稚川，自号抱朴子，在这座岭南名山修道炼丹已逾十载。丹炉里松脂噼啪作响，竹简上墨迹未干。岭南瘴疠横行，村民高热不退被抬上山来，你看着师父从药柜中取出一把青蒿，在冷水中浸渍——他要把多年行医所得写进一本叫《肘后备急方》的小册子，好让穷苦百姓也能自救。',
      en: 'You are an apprentice at Mount Luofu in the Eastern Jin dynasty. Your master Ge Hong, courtesy name Zhichuan, pen name Baopuzi, has spent over a decade refining elixirs and studying Dao at this Lingnan mountain. Pine resin crackles in the furnace; ink on bamboo slips is still wet. Malaria ravages the region — villagers with burning fever are carried uphill. You watch your master take a handful of sweet wormwood and soak it in cold water. He is compiling years of medical practice into a slim volume called "Zhouhou Beiji Fang," so that even the poorest can treat themselves.',
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
    reward: { badge: '🌿', badgeName: { zh: '青蒿济世印', en: 'Seal of the Healing Herb' }, insight: { zh: '东晋葛洪隐居罗浮山炼丹行医,所著《肘后备急方》载"青蒿一握,以水二升渍,绞取汁,尽服之",强调绞汁冷服而非高温煎煮。这短短一句暗示青蒿有效成分不耐热。一千六百年后,屠呦呦在抗疟研究中反复遭遇高温提取失败的困境,正是葛洪"绞汁"二字启发她改用低温乙醚萃取,成功分离出青蒿素。2015年,屠呦呦因此获得诺贝尔生理学或医学奖,青蒿素至今已挽救全球数百万疟疾患者生命。从罗浮山的丹炉到斯德哥尔摩的领奖台,一条跨越千年的医学因果链,证明古籍文献中蕴藏的实证智慧从未过时。', en: 'Ge Hong, living on Mount Luofu in the Eastern Jin, recorded in "Zhouhou Beiji Fang" that sweet wormwood should be soaked in cold water and the juice wrung out — not boiled. This hinted the active compound is heat-sensitive. Sixteen centuries later, Tu Youyou, struggling with failed high-temperature extractions, was inspired by this single word "wring" to switch to low-temperature ether extraction, successfully isolating artemisinin. She received the 2015 Nobel Prize. From Mount Luofus alchemy furnace to the Stockholm podium, a medical cause-and-effect chain spanning millennia proves that empirical wisdom in ancient texts is never obsolete.' } },
  },

  // ============ P01 罗湖桥 · 钱学森（现代科技）============
  P01: {
    characters: [
      { name: { zh: '钱学森', en: 'Qian Xuesen' }, role: { zh: '中国航天之父', en: 'Father of Chinese Aerospace' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/c7e96924-31e5-44dc-bab4-f44c85753656/image_1781684666_2_3.jpg' },
    ],
    intro: {
      zh: '1955年10月8日,深秋,你是罗湖桥头的一名边检员。罗湖桥横跨深圳河,是深圳与中国香港交界的咽喉要道。一位戴眼镜的中年学者携家眷缓缓从香港一侧走来,行李简朴,眼神却灼灼如炬。他就是钱学森——美国海军部次长曾称他"抵得上五个师",正因如此,他遭美方软禁长达五年。此刻他终于踏上故土,新中国等待他的,是从零开始的导弹与航天事业。',
      en: 'October 8, 1955. Late autumn. You are a border inspector at Luohu Bridge, which spans the Shenzhen River — the chokepoint between Shenzhen and Hong Kong, China. A bespectacled scholar crosses from the Hong Kong side with his family, luggage plain but eyes blazing. He is Qian Xuesen — a US Navy undersecretary once called him "worth five divisions," and for that he was detained by the US for five years. Now he finally steps onto home soil, where New China awaits him to build missile and aerospace programs from nothing.',
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
    reward: { badge: '🚀', badgeName: { zh: '科学归途印', en: 'Seal of the Scientific Homecoming' }, insight: { zh: '1955年钱学森历经五年软禁终于归国,这是中国航天史的关键转折。归国后他主持组建国防部第五研究院,从仿制苏联导弹起步,逐步建立中国自主的导弹与火箭研发体系。1960年东风一号近程导弹发射成功,1964年原子弹试爆,1966年导弹核武器试验成功,1970年东方红一号卫星入轨——"两弹一星"工程在短短十五年内从无到有。钱学森归国不仅带来了技术,更带来了系统工程方法论,使中国从零散的科研探索走向建制化的航天工业体系。一座罗湖桥上的脚步,改写了中国国防与航天的历史进程。', en: 'Qian Xuesen returned in 1955 after five years of house arrest — a turning point in Chinas aerospace history. He established the Fifth Academy of the Ministry of National Defense, starting with reverse-engineering Soviet missiles. By 1970, the "Two Bombs, One Satellite" program had gone from nothing to a full aerospace industrial system. His return brought not just technology but systems engineering methodology, transforming scattered research into an institutionalized aerospace industry.' } },
  },

  // ============ M06 蛇口工业区 · 袁庚（近现代发展）============
  M06: {
    characters: [
      { name: { zh: '袁庚', en: 'Yuan Geng' }, role: { zh: '蛇口工业区创始人', en: 'Founder of Shekou Industrial Zone' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/8c63c59a-5864-454a-9f2a-ded07ddd17ad/image_1781684650_2_1.jpg' },
    ],
    intro: {
      zh: '你是1979年7月8日蛇口工业区工地上的一名施工员。脚下是荒山野岭，耳边突然响起一声巨响——填海建港的"开山炮"炸响了。六十一岁的袁庚站在微波山下，看着这片2.14平方公里的土地。他刚从香港招商局带来一个大胆的计划：在这里建中国第一个外向型工业园区。空气中弥漫着炸药的硝烟和海风的咸味，你知道，这片与香港隔海相望的边陲荒地，即将成为中国改革开放的第一块试验田。',
      en: 'July 8, 1979. You are a construction supervisor at the Shekou Industrial Zone site. Bare hills surround you — then a deafening blast: the "first mountain-clearing cannon" for the port fills the air. Sixty-one-year-old Yuan Geng stands below Weibo Mountain, surveying 2.14 square kilometers of wilderness. He has brought a bold plan from Hong Kong Merchants: China\'s first export-oriented industrial park here. Gunpowder and salt wind fill the air — this barren shore facing Hong Kong, China is about to become the first test ground of Reform and Opening.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '袁庚在蛇口提出的著名口号是什么？它诞生于哪一年？', en: 'What famous slogan did Yuan Geng propose at Shekou, and in which year?' },
        options: [
          { text: { zh: '"时间就是金钱，效率就是生命"——1981年提出', en: '"Time is money, efficiency is life" — proposed in 1981' }, correct: true, feedback: { zh: '1981年3月，袁庚从香港乘船返回蛇口途中，望着海浪写下了"时间就是金钱，效率就是生命"。这句话被印在巨型标语牌上竖立在蛇口最热闹的商业街。1984年国庆35周年，写着这句口号的蛇口工业区彩车驶过天安门广场，同年邓小平视察蛇口时对该口号表示肯定。', en: 'In March 1981, Yuan Geng wrote "Time is money, efficiency is life" on a boat returning from Hong Kong to Shekou. It was mounted on a billboard on Shekou\'s busiest street. In 1984, a Shekou float bearing the slogan passed through Tiananmen Square for National Day, and Deng Xiaoping endorsed it during his Shekou visit that year.' } },
          { text: { zh: '"空谈误国，实干兴邦"——1992年提出', en: '"Empty talk harms the nation, solid work revitalizes it" — proposed in 1992' }, correct: false, feedback: { zh: '"空谈误国，实干兴邦"是蛇口另一块著名标语，但与本题无关。袁庚于1981年提出的口号是"时间就是金钱，效率就是生命"，它比十一届三中全会召开还早了与改革开放同步推进，是蛇口工业区最具标志性的精神表达。', en: '"Empty talk harms the nation" is another Shekou slogan but not the one asked here. Yuan Geng\'s 1981 slogan was "Time is money, efficiency is life" — the most iconic expression of Shekou\'s spirit.' } },
        ],
      },
      {
        speaker: 0,
        q: { zh: '袁庚在蛇口推行的定额超产奖励制度引发了什么争议？', en: 'What controversy did Yuan Geng\'s output-based bonus system at Shekou trigger?' },
        options: [
          { text: { zh: '打破了"大锅饭"后被上级叫停，经中央支持后恢复并推广全国', en: 'It broke the "big pot" system, was halted by superiors, then restored with central support and spread nationwide' }, correct: true, feedback: { zh: '1979年蛇口港开工后，袁庚实行定额超产奖励制度，工人干劲大增。但"工资奖金上不封顶、下不保底"的做法被上级部门叫停，工程进度骤降。袁庚将问题反映到中央，胡耀邦批示谷牧过问，定额超产奖得以恢复，后来成为全国企业普遍采用的激励机制。', en: 'After Shekou Port began in 1979, Yuan Geng\'s output-based bonus system boosted morale. But the "no cap, no floor" pay rule was halted by superiors, stalling progress. Yuan Geng reported to the central leadership; Hu Yaobang ordered Gu Mu to intervene, restoring the bonus — which later became a nationwide incentive mechanism.' } },
          { text: { zh: '没有任何争议，从始至终顺利执行', en: 'No controversy at all; it was implemented smoothly throughout' }, correct: false, feedback: { zh: '事实恰恰相反。蛇口的奖励制度在当时引发了激烈争议，被批评为"奖金挂帅"。正是通过袁庚向上反映和中央领导的介入，这一制度才得以保留。蛇口在数年间还推行了工程承包、干部招聘、民主选举等改革，创下24项全国首创或第一。', en: 'The opposite is true. Shekou\'s bonus system sparked fierce controversy, criticized as "bonus-driven." Only through Yuan Geng\'s appeal and central intervention was it preserved. Shekou also pioneered contracting, cadre recruitment, and democratic elections — 24 national firsts.' } },
        ],
      },
    ],
    reward: { badge: '🏗️', badgeName: { zh: '改革先声印', en: 'Seal of the Reform Pioneer' }, insight: { zh: '1979年1月31日，李先念批复同意设立招商局蛇口工业区。7月8日，蛇口炸响填海建港的"开山炮"，成为中国改革开放的第一块试验田。袁庚在这里推行定额超产奖励制度打破"大锅饭"，实行工程承包、干部招聘、民主选举等改革，创下24项全国首创或第一。1981年他提出"时间就是金钱，效率就是生命"，这句口号在当年被视为石破天惊，1984年邓小平视察蛇口时予以肯定。袁庚执掌招商局十四年间，资产翻了117倍，他还参与创办了招商银行和平安保险。', en: 'On January 31, 1979, Li Xiannian approved the Shekou Industrial Zone under Hong Kong Merchants. On July 8, the "first mountain-clearing cannon" blasted — China\'s first Reform test ground. Yuan Geng broke the "big pot" with output bonuses, pioneered contracting, cadre recruitment, and democratic elections, achieving 24 national firsts. In 1981 he proposed "Time is money, efficiency is life" — endorsed by Deng Xiaoping in 1984. Over 14 years, Merchants\' assets grew 117-fold; he also co-founded China Merchants Bank and Ping An Insurance.' } },
  },

  // ============ M03 南头古城（古代文化）============
  M03: {
    immersiveMode: 'rpg-dialogue',
    rpg: {
      background: './public/assets/episodes/nantou/stage-bg.webp?v=m03-rpg-1',
      sceneName: { zh: '南头古城 · 千年门户', en: 'Nantou Ancient City · Millennium Gateway' },
      subtitle: { zh: '千年文脉与岭南文明 · 南头古城', en: 'Lingnan Civilization · Nantou Ancient City' },
      chapterTitle: { zh: '一千七百年的古都', en: 'A 1,700-Year-Old Capital' },
      objective: {
        zh: '任务：调查城门、海湾、地势、文书，判断南头为何适合成为郡治',
        en: 'Objective: investigate the gate, bay, terrain, and records to judge why Nantou became the prefectural seat',
      },
      objectiveDone: {
        zh: '任务完成：你已理解南头作为岭南海防与治理节点的重要性',
        en: 'Objective complete: you understand Nantou as a Lingnan node of defense and governance',
      },
      chapters: [
        { zh: '序章', en: 'Prologue' },
        { zh: '踏勘', en: 'Survey' },
        { zh: '海防', en: 'Defense' },
        { zh: '判断', en: 'Judgment' },
        { zh: '完成', en: 'Complete' },
      ],
      clues: [
        {
          id: 'gate',
          x: 31,
          y: 48,
          title: { zh: '观察城门', en: 'Inspect the Gate' },
          label: { zh: '城门', en: 'Gate' },
          text: {
            zh: '东晋咸和六年设东官郡后，南头城门便是郡治秩序的物理入口。军令传递、商旅登记、税赋征纳与户籍文书，皆须由此核验放行，城门即治理的第一道界面。',
            en: 'After Dongguan Prefecture was established in 331 AD, the Nantou gate became the physical threshold of governance. Military orders, merchant registration, tax collection, and household records all passed through here for verification — the gate was the first interface of imperial administration.',
          },
          npcFeedback: {
            zh: '很好。城门不只是入口，也是治理秩序的第一道界面。',
            en: 'Good. The gate is not only an entrance. It is the first interface of order.',
          },
        },
        {
          id: 'bay',
          x: 68,
          y: 38,
          title: { zh: '眺望海湾', en: 'Watch the Bay' },
          label: { zh: '海湾', en: 'Bay' },
          text: {
            zh: '珠江口潮汐将岭南腹地与南海航线连为一体。南头扼守此口，既能监控番舶商路，又能预警倭寇海盗，海防与通商在同一个观测点上交汇。',
            en: 'The Pearl River tides linked the Lingnan interior with South China Sea routes. Nantou commanded this estuary, allowing surveillance of foreign merchant routes while warning of pirate raids — coastal defense and trade converged at a single observation point.',
          },
          npcFeedback: {
            zh: '很好。这里不是尽头，而是通向更大海路的入口。',
            en: 'Good. This is not an edge, but an entrance to wider sea routes.',
          },
        },
        {
          id: 'terrain',
          x: 52,
          y: 58,
          title: { zh: '查看地势', en: 'Read the Terrain' },
          label: { zh: '地势', en: 'Terrain' },
          text: {
            zh: '南头半岛三面临海、北接陆地，进可扼控珠江口航道，退可经陆路通往东莞、广州。这种山海相依的形胜，使军事防御、郡治行政与港口转运可以集中于同一处。',
            en: 'The Nantou peninsula faces the sea on three sides and connects northward to Dongguan and Guangzhou by land. It could control the Pearl River shipping lane while maintaining land routes to the Lingnan interior — defense, administration, and port logistics could all concentrate in one place.',
          },
          npcFeedback: {
            zh: '不错。可守、可通、可治，才是郡治该看的形胜。',
            en: 'Yes. Defensible, connected, and governable: that is the terrain a seat needs.',
          },
        },
        {
          id: 'record',
          x: 43,
          y: 31,
          title: { zh: '阅读文书', en: 'Read the Record' },
          label: { zh: '文书', en: 'Record' },
          text: {
            zh: '东晋咸和六年（331年），朝廷析南海郡东部设东官郡，治所即在南头。这一行政建置说明，至迟在四世纪初，南头已从滨海聚落上升为国家海疆治理的关键坐标。',
            en: 'In 331 AD, the Eastern Jin court carved Dongguan Prefecture from the eastern wing of Nanhai Commandery, with its seat at Nantou. This administrative decision shows that by the early fourth century, Nantou had risen from a coastal settlement to a key coordinate of imperial maritime governance.',
          },
          npcFeedback: {
            zh: '记下这一笔。文书会告诉后人：这座城早已在国家治理之中。',
            en: 'Record this. Documents tell later generations this city was already part of state governance.',
          },
        },
      ],
      beats: [
        {
          type: 'dialogue',
          speakerType: 'npc',
          chapter: 0,
          speaker: 0,
          text: {
            zh: '文书小吏，你来得正好。治所之地，不能只看热闹繁华，还要看山海形胜、军防商路与民籍文书。',
            en: 'Clerk, you arrive at the right moment. A seat of rule cannot be chosen by bustle alone. Read the mountains, sea, defense, routes, and records.',
          },
        },
        {
          type: 'dialogue',
          speakerType: 'player',
          chapter: 0,
          speakerName: { zh: '我 · 文书小吏', en: 'Me · Prefecture Clerk' },
          speakerRole: { zh: '案卷批注', en: 'Case Note' },
          continueLabel: { zh: '继续调查', en: 'Continue Survey' },
          text: {
            zh: '我会把所见记入案卷。但南头为何能成为岭南门户，还需继续查证。',
            en: 'I will enter what I see into the record. But why Nantou became a Lingnan gateway still needs proof.',
          },
        },
        {
          type: 'investigate',
          speakerType: 'npc',
          chapter: 1,
          speaker: 0,
          text: {
            zh: '先踏勘四处：城门、海湾、地势、文书。线索齐了，再判断南头为何能设治。',
            en: 'Survey four places first: the gate, bay, terrain, and record. Once the clues are gathered, judge why Nantou could become the seat.',
          },
        },
        {
          type: 'dialogue',
          speakerType: 'npc',
          chapter: 2,
          speaker: 0,
          text: {
            zh: '把四处线索并在一起看：城门让秩序进入城市，海湾让船路连接内外，地势让防守与转运可以兼顾，文书则证明这里被纳入国家治理。它们共同回答同一个问题：为什么治所会落在南头。',
            en: 'Read the four clues together: the gate brings order into the city, the bay connects routes inward and outward, the terrain supports defense and transfer, and records prove the place entered state governance. Together, they answer why the seat settled at Nantou.',
          },
        },
        {
          type: 'choice',
          speakerType: 'npc',
          chapter: 2,
          speaker: 0,
          question: {
            zh: '复盘南头四条线索，哪一种理解最完整？',
            en: 'Reviewing Nantou’s four clues, which reading is the most complete?',
          },
          options: [
            {
              text: { zh: '城门、海湾、地势、文书共同说明南头兼具防御、交通与治理条件', en: 'Gate, bay, terrain, and records together show Nantou had defense, transport, and governance conditions' },
              correct: true,
              feedback: {
                zh: '正是。南头不是靠单一点胜出，而是把山海形势与行政秩序叠在了一处。',
                en: 'Exactly. Nantou mattered not through one feature, but by layering mountain-sea geography with administrative order.',
              },
            },
            {
              text: { zh: '只要有城门，就足够成为郡治', en: 'A gate alone is enough to become a prefectural seat' },
              correct: false,
              feedback: {
                zh: '不够。城门只是入口，真正的治所还要能控海、通陆、管人、记事。',
                en: 'Not enough. A gate is only an entrance; a seat must control sea, connect land, govern people, and keep records.',
              },
            },
            {
              text: { zh: '文书只是背景资料，和选址无关', en: 'Records are only background material and unrelated to site choice' },
              correct: false,
              feedback: {
                zh: '恰恰相反。文书证明这里不是传说中的旧城，而是国家治理体系中的真实节点。',
                en: 'The opposite. Records prove this was not merely a legendary old town, but a real node in the state governance system.',
              },
            },
          ],
        },
        {
          type: 'choice',
          speakerType: 'npc',
          chapter: 2,
          speaker: 0,
          question: {
            zh: '为何朝廷会在南头设郡治？',
            en: 'Why did the court establish the prefectural seat at Nantou?',
          },
          options: [
            {
              text: { zh: '扼守珠江口咽喉，便于海防、贸易与治理', en: 'It commands the Pearl River estuary, supporting defense, trade, and governance' },
              correct: true,
              feedback: {
                zh: '判断准确。南头的价值不在一座城门，而在它把海口、内陆、军防和行政秩序连成一处。',
                en: 'Correct. Nantou matters not for one gate alone, but because it binds the sea mouth, hinterland, defense, and administration together.',
              },
            },
            {
              text: { zh: '因为这里只是随机选中的驿站', en: 'Because it was a randomly chosen relay station' },
              correct: false,
              feedback: {
                zh: '不能如此草率。郡治选址关乎军防、赋役、民籍与交通，南头的山海位置正是关键。',
                en: 'Too careless. A prefectural seat concerns defense, tax labor, household records, and movement. Nantou’s mountain-and-sea position is the key.',
              },
            },
            {
              text: { zh: '因为这里完全不重要，容易被忽略', en: 'Because it was unimportant and easy to ignore' },
              correct: false,
              feedback: {
                zh: '恰恰相反。被设为治所，说明南头已是国家治理必须看见的节点。',
                en: 'The opposite. Becoming the seat means Nantou was already a node state governance had to see.',
              },
            },
          ],
        },
        {
          type: 'dialogue',
          speakerType: 'npc',
          chapter: 3,
          speaker: 0,
          text: {
            zh: '记住，城市的年岁不只写在高楼上，也写在治所、港口、城墙和文书里。南头让深圳的时间向前推回一千七百年。',
            en: 'Remember, a city’s age is not written only in towers. It is written in seats of rule, ports, walls, and records. Nantou pushes Shenzhen’s time back 1,700 years.',
          },
        },
        {
          type: 'choice',
          speakerType: 'npc',
          chapter: 3,
          speaker: 0,
          question: {
            zh: '如果把南头放回今天的深圳叙事，它补上的关键一层是什么？',
            en: 'Placed back into Shenzhen’s story today, what key layer does Nantou restore?',
          },
          options: [
            {
              text: { zh: '它说明深圳既有改革开放的速度，也有岭南治理与海防的长时段根脉', en: 'It shows Shenzhen has not only reform speed, but also long roots in Lingnan governance and maritime defense' },
              correct: true,
              feedback: {
                zh: '判断完整。理解南头，深圳就不再只是“年轻城市”，而是一座在古今叠合中继续生长的城市。',
                en: 'Complete judgment. With Nantou, Shenzhen is no longer merely a “young city,” but a city growing through layered old and new histories.',
              },
            },
            {
              text: { zh: '它只是一处怀旧景点，不改变我们对深圳的理解', en: 'It is only a nostalgic spot and does not change how we understand Shenzhen' },
              correct: false,
              feedback: {
                zh: '太浅了。南头改变的是城市时间感，让人看见深圳更深的历史底层。',
                en: 'Too shallow. Nantou changes the city’s sense of time and reveals a deeper historical layer beneath Shenzhen.',
              },
            },
            {
              text: { zh: '它证明现代深圳与历史没有连续关系', en: 'It proves modern Shenzhen has no continuity with history' },
              correct: false,
              feedback: {
                zh: '不对。正是连续的地理门户与治理记忆，让这片海岸不断生长出新的城市形态。',
                en: 'No. Continuous gateway geography and governance memory allowed this coast to grow new urban forms over time.',
              },
            },
          ],
        },
        {
          type: 'choice',
          speakerType: 'player',
          chapter: 3,
          speakerName: { zh: '我的记录', en: 'My Record' },
          speakerRole: { zh: '我 · 文书小吏', en: 'Me · Prefecture Clerk' },
          continueLabel: { zh: '记入案卷', en: 'Enter Record' },
          question: {
            zh: '若有人说“深圳没有历史”，我会如何在案卷中作答？',
            en: 'If someone says “Shenzhen has no history,” how should I answer in the record?',
          },
          options: [
            {
              text: { zh: '南头古城证明，这里曾是岭南治理与海防的重要门户', en: 'Nantou proves this place was an important Lingnan gateway of governance and maritime defense' },
              correct: true,
              feedback: {
                zh: '这就是本案的结论。理解南头，才能理解深圳并非凭空出现，而是在古今叠合中继续生长。',
                en: 'That is the conclusion. To understand Nantou is to understand Shenzhen as a city growing from layered histories, not from nowhere.',
              },
            },
            {
              text: { zh: '深圳的历史只能从改革开放以后开始算', en: 'Shenzhen’s history can only begin after Reform and Opening' },
              correct: false,
              feedback: {
                zh: '这会漏掉更深的根。改革开放是新章，南头古城则说明这片土地早有治理、海防与交通的长期记忆。',
                en: 'That misses deeper roots. Reform and Opening is a new chapter, while Nantou shows long memories of governance, defense, and transport.',
              },
            },
          ],
        },
        {
          type: 'dialogue',
          speakerType: 'npc',
          chapter: 4,
          speaker: 0,
          text: {
            zh: '很好。把这份踏勘记录封入案卷：南头古城，是深圳千年门户。',
            en: 'Good. Seal this survey into the record: Nantou Ancient City is Shenzhen’s millennium gateway.',
          },
        },
      ],
      completion: {
        title: { zh: '本幕完成', en: 'Scene Complete' },
        insight: {
          zh: '你已理解：南头古城不是单一景点，而是岭南海防、交通与行政治理长期叠合的关键节点。',
          en: 'You now understand: Nantou is not a single attraction, but a key node where Lingnan defense, transport, and administration overlap across time.',
        },
      },
    },
    characters: [
      { name: { zh: '东官郡守', en: 'Prefect of Dongguan' }, role: { zh: '东晋行政长官', en: 'Eastern Jin Administrator' }, portrait: './public/assets/episodes/nantou/official-portrait.webp?v=m03-rpg-1' },
    ],
    intro: {
      zh: '公元331年，你是东晋新设东官郡的一名文书小吏。朝廷从南海郡析出东部之地，沿汉代盐官旧名"东官"设郡，治所定在南头。你登上半岛高地踏勘，珠江口潮声入耳，海风裹着盐味扑面。脚下这片土地，日后将见证从东晋郡治到明洪武二十七年东莞守御千户所城的一千七百年沧桑——而屋背岭商代墓葬的发掘，更将文明根系推前三千年。',
      en: 'It is 331 AD. You are a clerk in the newly established Dongguan Prefecture. The Eastern Jin court carved this territory from Nanhai Commandery, naming it after the Han-era salt official "Dongguan." You climb the peninsula heights to survey the site — Pearl River tides in your ears, salt wind on your face. Beneath your feet lie seventeen centuries of layered history, from this Jin-era seat to the Ming garrison city of 1394 — and the Shang-era tombs at Wubeiling push the roots of civilization back three thousand years further.',
    },
    scenes: [
      {
        q: { zh: '东晋咸和六年（331年）设立东官郡时，"东官"这个名称源自何处？', en: 'When Dongguan Prefecture was established in 331 AD, where did the name "Dongguan" originate?' },
        options: [
          { text: { zh: '源自汉武帝时期设在南头的番禺盐官"东官"', en: 'From the "Dongguan" salt official stationed at Nantou under Emperor Wu of Han' }, correct: true, feedback: { zh: '汉武帝元封元年（前110年）在全国设36处盐官，掌管南头盐业的因位于东部而得名"东官"。东晋沿此旧名设郡，说明盐政是南头成为行政中心的根基。', en: 'In 110 BC, Emperor Wu set up 36 salt officials nationwide; the one at Nantou was named "Dongguan" for its eastern location. The Jin court adopted this name, showing salt administration was the root of Nantou\'s administrative centrality.' } },
          { text: { zh: '源自明代东莞守御千户所的简称', en: 'Abbreviated from the Ming-era Dongguan Garrison' }, correct: false, feedback: { zh: '时序不对。明洪武二十七年（1394年）才设东莞守御千户所城，比东官郡设立晚了一千多年。"东官"之名远早于明代。', en: 'Chronologically impossible. The Ming garrison was established in 1394, over a thousand years after the prefecture. The name predates the Ming by far.' } },
        ],
      },
      {
        q: { zh: '2001年深圳屋背岭遗址获评"全国十大考古新发现"，它的发掘把深圳有人类文明的历史推前到了什么时期？', en: 'The 2001 Wubeiling excavation was named a "Top Ten National Archaeological Discovery." To what era does it push back Shenzhen\'s civilizational history?' },
        options: [
          { text: { zh: '商时期，距今约3000多年，出土94座商代墓葬', en: 'The Shang era, roughly 3,000+ years ago, with 94 Shang-dynasty tombs excavated' }, correct: true, feedback: { zh: '屋背岭遗址发掘商时期墓葬94座，出土石斧、陶罐、玉矛等300余件文物，是广东迄今最大的商时期墓葬群。它证明早在三千多年前，这片土地已有自己的文明。', en: 'Wubeiling yielded 94 Shang-era tombs and over 300 artifacts including stone axes, pottery jars, and jade spears — Guangdong\'s largest Shang-era cemetery. It proves civilization existed here over 3,000 years ago.' } },
          { text: { zh: '唐代，距今约1000多年', en: 'The Tang era, roughly 1,000+ years ago' }, correct: false, feedback: { zh: '远不止唐代。屋背岭遗址以商时期墓葬为主，将深圳文明史推前三千多年，而非一千年。这是南头古城被称为"深港历史之根"的考古依据。', en: 'Far older than Tang. Wubeiling is primarily a Shang-era cemetery, pushing Shenzhen\'s civilizational history back over 3,000 years — the archaeological basis for Nantou being called the "root of Shenzhen-Hong Kong history."' } },
        ],
      },
    ],
    reward: { badge: '🏯', badgeName: { zh: '千年古城印', en: 'Seal of the Ancient City' }, insight: { zh: '南头古城的根系远比想象深长：屋背岭94座商代墓葬将文明推前三千年，汉代盐官"东官"之名沿用至今，东晋设郡开启一千七百年行政中心历程，明洪武二十七年筑东莞守御千户所城。从商周先民到东晋郡治，从明代卫所到今日古城，这片土地从未断过文明的脉动。', en: 'Nantou\'s roots run deeper than imagined: 94 Shang-era tombs at Wubeiling push civilization back 3,000 years; the Han-era salt official name "Dongguan" endures; the 331 AD prefecture launched 1,700 years of administration; the 1394 Ming garrison city still stands. From Shang-era peoples to Jin-era governance, from Ming forts to today\'s ancient city, civilization has never stopped pulsing in this land.' } },
  },

  // ============ M09 文天祥后人聚居地（古代文化）============
  M09: {
    characters: [
      { name: { zh: '文天祥', en: 'Wen Tianxiang' }, role: { zh: '南宋爱国诗人·宰相', en: 'Southern Song Patriot & Prime Minister' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/a14cdb28-a32c-4a16-9991-ebf8cd85709a/image_1781684644_1_1.jpg' },
    ],
    intro: {
      zh: '1279年崖山海战，南宋覆灭。你是跟随文天祥堂弟文天瑞之子文应麟南迁的年轻族人。元军搜捕之下，文应麟潜隐宝安松岗鹤仔园，荒埔筑室，开基创业。他在高处建"望烟楼"，观望邻里炊烟，见有断炊之家便前去接济。七百余年过去，文氏后裔开枝散叶成"宝安文氏七大房"，至今仍以文天祥"正气"精神为家训。',
      en: 'After the 1279 Battle of Yamen, the Southern Song fell. You are a young clansman following Wen Yinglin, son of Wen Tianxiang\'s cousin Wen Tianrui, south into exile. Under Yuan pursuit, Wen Yinglin settled at Hezaiyuan in Songgang, Baoan, building a home in the wilderness. He erected a "Smoke-Watching Tower" on high ground, scanning for households whose hearths had gone cold, then bringing them food. Over seven centuries, the Wen descendants branched into the "Seven Houses of Baoan Wen," still honoring Wen Tianxiang\'s spirit of integrity as their family creed.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '崖山海战后，定居深圳松岗的文氏始祖是文天祥的什么人？', en: 'After the Battle of Yamen, what was the relationship of the Wen clan founder who settled in Songgang, Shenzhen, to Wen Tianxiang?' },
        options: [
          { text: { zh: '文天祥堂弟文天瑞之子文应麟', en: 'Wen Yinglin, son of Wen Tianxiang\'s cousin Wen Tianrui' }, correct: true, feedback: { zh: '文天祥抗元失败殉国后，堂弟文天瑞英勇抗敌，后只身渡海至海南。其长子文应麟潜隐宝安松岗鹤仔园开基创业，繁衍成"宝安文氏七大房"，至今约八万人。', en: 'After Wen Tianxiang\'s martyrdom, his cousin Wen Tianrui fought on, then fled to Hainan. Tianrui\'s eldest son Wen Yinglin settled at Hezaiyuan in Songgang, founding the "Seven Houses of Baoan Wen," now numbering about 80,000 descendants.' } },
          { text: { zh: '文天祥的亲生儿子', en: 'Wen Tianxiang\'s biological son' }, correct: false, feedback: { zh: '据史料记载，定居深圳的文氏始祖是文天祥堂弟文天瑞之子文应麟，并非文天祥的直系子嗣。文天祥本人被俘殉国，其堂弟一脉延续了家族血脉。', en: 'Historical records indicate the Shenzhen Wen founder was Wen Yinglin, son of Wen Tianrui — Wen Tianxiang\'s cousin — not his direct descendant. Wen Tianxiang himself was captured and executed.' } },
        ],
      },
      {
        q: { zh: '文应麟在松岗建造的"望烟楼"有什么用途？', en: 'What was the purpose of the "Smoke-Watching Tower" built by Wen Yinglin in Songgang?' },
        options: [
          { text: { zh: '登高观望邻里炊烟，发现断炊之家便前往接济', en: 'To watch for households whose cooking smoke had stopped, then bring them food' }, correct: true, feedback: { zh: '望烟楼是文应麟扶贫济困的见证。他每日登楼观望，见有断炊之家便送粮接济，留下"望烟楼"与"麻蓝仙印"等故事，至今被文氏后人传颂。', en: 'The Smoke-Watching Tower testifies to Wen Yinglin\'s charity. He climbed it daily; when he saw a home without cooking smoke, he brought grain — a story still honored by Wen descendants.' } },
          { text: { zh: '军事瞭望塔，用于防御元军追击', en: 'A military watchtower for defending against Yuan pursuit' }, correct: false, feedback: { zh: '望烟楼并非军事设施，而是文应麟体察民情的慈善之举。"望烟"二字意为观望炊烟，体现的是文氏家族"关心百姓的爱民精神"家风。', en: 'The tower was not military but charitable — "watching smoke" meant observing cooking fires, embodying the Wen family ethos of caring for the people.' } },
        ],
      },
    ],
    reward: { badge: '📜', badgeName: { zh: '正气传家印', en: 'Seal of Inherited Integrity' }, insight: { zh: '文天祥堂弟文天瑞之子文应麟，在崖山海战后潜隐宝安松岗鹤仔园，建望烟楼扶贫济困。七百余年繁衍出"宝安文氏七大房"，后裔约八万人分布于深圳、东莞、中国香港及海外。文天祥"忠孝廉节义"的家风，借一座望烟楼和七大房的延续，从一首绝命诗化为一个家族七个世纪的活态传承。', en: 'After the Battle of Yamen, Wen Yinglin — son of Wen Tianxiang\'s cousin Wen Tianrui — settled at Hezaiyuan in Songgang, building the Smoke-Watching Tower to aid the poor. Over seven centuries, the "Seven Houses of Baoan Wen" grew to about 80,000 descendants across Shenzhen, Dongguan, Hong Kong China, and overseas. Wen Tianxiang\'s family ethos of loyalty, filial piety, integrity, honor, and righteousness — carried by a tower and seven branch houses — turned a deathbed poem into seven centuries of living inheritance.' } },
  },

  // ============ M10 观澜版画基地（古代文化）============
  M10: {
    characters: [
      { name: { zh: '陈烟桥', en: 'Chen Yanqiao' }, role: { zh: '新兴木刻运动大师', en: 'Master of New Woodcut Movement' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/b7f645e5-8ee3-41b8-addb-87a48ef62675/image_1781684669_1_1.jpg' },
    ],
    intro: {
      zh: '1930年代的上海，你是龙华观澜牛湖村一名赴沪求学的客家青年。你的同乡陈烟桥已先你一步考入上海新华艺专，正跟随鲁迅先生投身新兴木刻运动。1936年10月8日，鲁迅抱病参观第二届全国木刻展，与陈烟桥等青年座谈三小时——这是先生生前最后一次公开活动，十一天后便与世长辞。刻刀在木板上咬出的黑白世界，正在改写一个时代。',
      en: '1930s Shanghai. You are a Hakka youth from Niuhu Village in Guanlan, studying art in the city. Your fellow townsman Chen Yanqiao has already enrolled at Xinhua Art Academy, following Lu Xun into the New Woodcut Movement. On October 8, 1936, Lu Xun visited the Second National Woodcut Exhibition despite his illness, conversing with Chen Yanqiao and other young printmakers for three hours — his last public appearance, eleven days before his death. The black-and-white world carved into woodblocks was rewriting an era.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '1936年10月8日，鲁迅生前最后一次公开活动是参观木刻展览会。他在现场与哪位深圳籍版画家交谈了三小时？', en: 'On October 8, 1936, Lu Xun\'s last public appearance was at a woodcut exhibition. Which Shenzhen-born printmaker did he converse with for three hours?' },
        options: [
          { text: { zh: '陈烟桥，观澜牛湖人，1932年起与鲁迅通信二十余封', en: 'Chen Yanqiao, from Niuhu in Guanlan, who exchanged 20+ letters with Lu Xun from 1932' }, correct: true, feedback: { zh: '陈烟桥是深圳龙华区观澜牛湖社区客家人，1933年起与鲁迅通信，四年间书信往来二十余封。1936年10月8日，鲁迅抱病在第二届全国木刻展上与陈烟桥等青年座谈三小时，十一天后逝世。', en: 'Chen Yanqiao was a Hakka from Niuhu, Guanlan, Longgang. He corresponded with Lu Xun from 1933 — over 20 letters in four years. On Oct 8, 1936, Lu Xun visited the Second National Woodcut Exhibition and talked with Chen for three hours, eleven days before his death.' } },
          { text: { zh: '李桦，广东番禺人', en: 'Li Hua, from Panyu, Guangdong' }, correct: false, feedback: { zh: '李桦确为鲁迅培养的第一代版画家之一，但在此次展览会上与鲁迅交谈三小时、且与深圳有直接渊源的是陈烟桥。陈烟桥1912年生于观澜，是鲁迅亲炙的新兴木刻第一代拓荒者。', en: 'Li Hua was indeed among the first generation trained by Lu Xun, but the one who conversed with Lu Xun for three hours and has direct Shenzhen ties was Chen Yanqiao, born in Guanlan in 1912.' } },
        ],
      },
      {
        q: { zh: '陈烟桥1932年冬与同学在上海新华艺专组织了哪个进步美术团体？', en: 'In the winter of 1932, Chen Yanqiao co-founded which progressive art collective at Xinhua Art Academy in Shanghai?' },
        options: [
          { text: { zh: '野穗社', en: 'The Wild Ear Society' }, correct: true, feedback: { zh: '1932年冬，陈烟桥与陈铁耕、何白涛等在校组织"野穗社"。他创作的《工人头像》刊登在野穗社创刊号封面上。这个团体是中国新兴木刻运动早期的重要组织。', en: 'In winter 1932, Chen co-founded the "Wild Ear Society" with Chen Tiegeng and He Botao. His work "Worker\'s Portrait" appeared on the cover of their inaugural issue — an early organization of the New Woodcut Movement.' } },
          { text: { zh: '木铃木刻研究会', en: 'Muling Woodcut Research Society' }, correct: false, feedback: { zh: '木铃木刻研究会是杭州艺专的胡一川等人组织的，与陈烟桥无直接关系。陈烟桥组织的是上海的"野穗社"。', en: 'The Muling Society was organized by Hu Yichuan and others at the Hangzhou Art Academy, unrelated to Chen Yanqiao. Chen co-founded the "Wild Ear Society" in Shanghai.' } },
        ],
      },
    ],
    reward: { badge: '🖼️', badgeName: { zh: '刀笔觉醒印', en: 'Seal of the Awakening Blade' }, insight: { zh: '1912年生于观澜牛湖的客家青年陈烟桥，1933年起与鲁迅通信二十余封，成为新兴木刻运动第一代拓荒者。1936年10月8日，鲁迅抱病与他在木刻展上座谈三小时，这是先生生前最后一次公开活动。如今，陈烟桥故乡的观澜版画村已成为全球三大版画基地之一，从革命年代的刻刀到国际艺术驻留，八十余年间的刀笔之脉从未断绝。', en: 'Chen Yanqiao, born in 1912 in Niuhu, Guanlan, exchanged over 20 letters with Lu Xun from 1933, becoming a first-generation pioneer of the New Woodcut Movement. On October 8, 1936, Lu Xun visited a woodcut exhibition despite illness and spoke with Chen for three hours — his last public appearance. Today, Chen\'s hometown of Guanlan has become one of the world\'s top three printmaking bases. From revolutionary carving knives to international artist residencies, the blade\'s lineage has endured for over eighty years.' } },
  },

  // ============ N-CV01 东莞可园（古代文化）============
  'N-CV01': {
    characters: [
      { name: { zh: '张敬修', en: 'Zhang Jingxiu' }, role: { zh: '清朝将军·园主', en: 'Qing General & Garden Master' }, portrait: '' },
    ],
    intro: {
      zh: '1850年，清道光三十年。你是东莞博厦村的一名年轻画师，受邀为归乡官员张敬修营造私家园林。张敬修官至江西按察使署理布政使，因弟丧母病辞职回乡，在三亩三的狭小地块上建造可园。他广邀文人雅集，居巢、居廉在此十年创成没骨法、撞粉法，为岭南画派开先河。你跟随他穿行于亭台楼阁之间，体会"咫尺山林"的造园哲学。',
      en: '1850, the thirtieth year of Daoguang. You are a young painter from Boxia Village in Dongguan, invited by the retiring official Zhang Jingxiu to help build his private garden. Zhang had served as Judicial Commissioner of Jiangxi, but returned home after family bereavements to build Keyuan on a tiny plot of three mu and a third. He gathered scholars and artists; Ju Chao and Ju Lian spent a decade here developing the "boneless" and "powder-splash" techniques, pioneering the Lingnan school of painting. You walk with him through pavilions and terraces, absorbing the garden philosophy of "a forest within arm\'s reach."',
    },
    scenes: [
      {
        q: { zh: '东莞可园始建于清道光三十年（1850年），其主人张敬修当时的官职是什么？', en: 'Keyuan Garden was begun in 1850. What official position did its owner Zhang Jingxiu hold at the time?' },
        options: [
          { text: { zh: '广西按察使（后署理布政使），因弟丧母病辞职回乡', en: 'Judicial Commissioner of Guangxi (later acting Administration Commissioner), who resigned after family bereavements' }, correct: true, feedback: { zh: '张敬修官至江西按察使署理布政使，因弟丧母病回乡后开始修建可园，至1864年基本建成。他投笔从戎却精通金石书画、琴棋诗赋，是岭南文人型官员的典型。', en: 'Zhang rose to Judicial Commissioner of Jiangxi and acting Administration Commissioner, then resigned after family losses. He built Keyuan over 14 years until 1864. A soldier turned scholar, he excelled in painting, calligraphy, and poetry.' } },
          { text: { zh: '广州将军，正一品武官', en: 'General of Guangzhou, a first-rank military officer' }, correct: false, feedback: { zh: '张敬修并非正一品武官。他以例捐得官，官至按察使署理布政使，属文官系统。他的独特之处在于"能文能武"——既有军功，又广邀文人雅集。', en: 'Zhang was not a first-rank military officer. He obtained office through donation, rising to Judicial Commissioner — a civil position. His uniqueness lay in combining military merit with scholarly patronage.' } },
        ],
      },
      {
        q: { zh: '居巢、居廉在可园居住十年期间，创造了什么画法，使可园成为岭南画派策源地之一？', en: 'During their decade at Keyuan, what techniques did Ju Chao and Ju Lian develop, making the garden a birthplace of the Lingnan painting school?' },
        options: [
          { text: { zh: '没骨法和撞粉法，画花鸟画', en: 'The "boneless" technique and "powder-splash" method, for bird-and-flower painting' }, correct: true, feedback: { zh: '居巢、居廉在可园十年间创造没骨法、撞粉法画花鸟画并传授后人，为岭南画派开创先河。可园因此不仅是园林艺术珍品，更是岭南近代花鸟画的摇篮。', en: 'Ju Chao and Ju Lian developed the boneless and powder-splash techniques during their decade at Keyuan, pioneering what became the Lingnan school. The garden is thus both a horticultural treasure and the cradle of modern Lingnan bird-and-flower painting.' } },
          { text: { zh: '泼墨山水法', en: 'The ink-splash landscape method' }, correct: false, feedback: { zh: '泼墨山水非居巢居廉所长。他们在可园的贡献在于花鸟画的没骨法和撞粉法，这两种技法后来深刻影响了高剑父、高奇峰等岭南画派创始人。', en: 'Ink-splash landscapes were not their specialty. Their contribution at Keyuan was the boneless and powder-splash techniques for bird-and-flower painting, which later profoundly influenced Lingnan school founders like Gao Jianfu.' } },
        ],
      },
    ],
    reward: { badge: '🏮', badgeName: { zh: '岭南造园印', en: 'Seal of Lingnan Garden Art' }, insight: { zh: '张敬修在三亩三（2204平方米）的狭小地块上建可园，以"咫尺山林"手法将住宅、庭院、书斋、客厅融为一体，亭台楼阁、山水桥榭一应俱全。更重要的是，居巢、居廉在此十年创造没骨法与撞粉法，使可园成为岭南画派的策源地和岭南近代花鸟画的摇篮——一座私家园林，同时承载了空间美学与绘画革命的双重遗产。', en: 'On a tiny plot of three mu and a third (2,204 sqm), Zhang Jingxiu built Keyuan, fusing residence, courtyard, study, and reception hall through the "forest within arm\'s reach" technique, with pavilions, terraces, bridges, and water all present. More importantly, Ju Chao and Ju Lian spent a decade here creating the boneless and powder-splash techniques, making Keyuan the birthplace of the Lingnan school and the cradle of modern Lingnan bird-and-flower painting — a private garden carrying the dual heritage of spatial aesthetics and a painting revolution.' } },
  },

  // ============ N-CV02 南越王宫博物馆（古代文化）============
  'N-CV02': {
    characters: [
      { name: { zh: '赵佗', en: 'Zhao Tuo' }, role: { zh: '南越国开国之王', en: 'Founding King of Nanyue' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/b9f84c03-2e21-4dc0-9f86-b29fc618cae2/image_1781684646_1_1.jpg' },
    ],
    intro: {
      zh: '公元前206年，秦末天下大乱。你是随赵佗南征的秦军校尉。赵佗以南海、桂林、象三郡自立为王，建立南越国，定都番禺。他下令"和辑百越"——学越语、穿越服、娶越妻，以融合之道治理岭南。两千多年后的1983年，广州象岗山工地意外发现南越国第二代王赵眜的陵墓，出土"文帝行玺"金印和波斯银盒，将这段被遗忘的历史重新带回人间。',
      en: '206 BC. The Qin Dynasty is collapsing. You are a military officer who followed Zhao Tuo south. Zhao Tuo declared himself king over Nanhai, Guilin, and Xiang commanderies, founding the Nanyue Kingdom with its capital at Panyu. He decreed the "Harmonization of the Baiyue" — learning Yue language, wearing Yue dress, marrying Yue women, governing through fusion. Two millennia later, in 1983, a construction site at Xianggang Hill in Guangzhou accidentally uncovered the tomb of Zhao Mo, the second Nanyue king, yielding the "Seal of Emperor Wen" gold stamp and a Persian silver box, bringing this forgotten history back to light.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '赵佗治理南越国的核心政策"和辑百越"具体包含哪些做法？', en: 'Zhao Tuo\'s core policy of "Harmonizing the Baiyue" included which specific practices?' },
        options: [
          { text: { zh: '学越语、穿越服、娶越妻，尊重本地风俗并任用越人首领', en: 'Learning Yue language, wearing Yue dress, marrying Yue women, respecting local customs and appointing Yue chieftains' }, correct: true, feedback: { zh: '赵佗本人脱去中原冠带，穿越服、效越俗，自称"蛮夷大长"。他不仅与越人通婚，还任用越人首领治理地方，使南越国在93年间保持了岭南京畿的稳定繁荣。', en: 'Zhao Tuo personally shed Central Plains attire, wore Yue dress, adopted Yue customs, and called himself "Great Chief of the Barbarians." He intermarried with Yue people and appointed Yue chieftains, keeping Nanyue stable and prosperous for 93 years.' } },
          { text: { zh: '推行秦法，强制百越族人迁居关中', en: 'Imposing Qin law and forcibly relocating Baiyue people to the Guanzhong region' }, correct: false, feedback: { zh: '赵佗恰恰相反。他放弃了秦朝的高压同化政策，选择融入百越。正是这种"和辑"之道，使南越国避免了激烈反抗，成为华夏文明南扩最成功的范式之一。', en: 'Zhao Tuo did the opposite. He abandoned Qin\'s coercive assimilation, choosing instead to integrate with the Baiyue. This harmonization prevented violent resistance and became a model for Chinese civilization\'s southward expansion.' } },
        ],
      },
      {
        q: { zh: '1983年在广州象岗山发现的南越王墓，墓主人是谁？', en: 'The Nanyue king\'s tomb discovered at Xianggang Hill in Guangzhou in 1983 belonged to whom?' },
        options: [
          { text: { zh: '南越国第二代王赵眜，出土"文帝行玺"金印确认身份', en: 'Zhao Mo, the second Nanyue king, identified by the "Seal of Emperor Wen" gold stamp' }, correct: true, feedback: { zh: '1983年6月，广州象岗山工地意外发现南越王墓，出土"文帝行玺"金印和刻有"赵眜"的玉印，确认墓主为第二代南越王赵眜。墓中还出土波斯银盒、非洲象牙等千余件文物。', en: 'In June 1983, a construction site at Xianggang Hill accidentally uncovered the tomb, yielding the "Seal of Emperor Wen" gold stamp and a jade seal reading "Zhao Mo," confirming the second Nanyue king. Over 1,000 artifacts included Persian silver boxes and African ivory.' } },
          { text: { zh: '南越国开国之王赵佗本人', en: 'Zhao Tuo himself, the founding king of Nanyue' }, correct: false, feedback: { zh: '赵佗据传享年逾百岁，其陵墓至今成谜，是岭南考古的终极悬案。1983年象岗山发现的是赵佗之孙——第二代王赵眜的墓，而非赵佗本人。', en: 'Zhao Tuo reportedly lived over 100 years, but his tomb remains lost — Lingnan archaeology\'s ultimate mystery. The 1983 Xianggang Hill find was the tomb of his grandson, Zhao Mo, the second king.' } },
        ],
      },
    ],
    reward: { badge: '👑', badgeName: { zh: '岭南王都印', en: 'Seal of the Lingnan Capital' }, insight: { zh: '公元前203年，赵佗建立南越国，推行"和辑百越"——学越语、穿越服、娶越妻、任用越人首领，以文化融合取代军事高压，使岭南在九十三年间保持稳定繁荣。这条融合路线如此成功，以至于两千多年后的1983年，广州象岗山工地意外发掘出南越国第二代王赵眜的陵墓，出土"文帝行玺"龙钮金印和丝缕玉衣，才让这段被史书简略记载的历史有了实物铁证。从赵佗的融合政策到赵眜墓的考古发现，大湾区作为文明十字路口的基因，在两千年的时间跨度上得到了反复验证。', en: 'In 203 BC, Zhao Tuo founded Nanyue and pursued "Harmonizing the Baiyue" — learning Yue language, wearing Yue dress, intermarrying, appointing Yue chieftains — replacing military coercion with cultural fusion, keeping Lingnan stable for 93 years. This fusion was so successful that when the tomb of the second king Zhao Mo was accidentally discovered at Xianggang Hill in 1983, yielding the "Seal of Emperor Wen" gold stamp and a jade suit, it provided material proof for a history only briefly recorded in texts. From Zhao Tuo\'s fusion policy to the archaeological discovery, the Bay Area\'s role as a civilizational crossroads has been repeatedly validated across two millennia.' } },
  },

  // ============ N-CV03 鹤湖新居·客家围龙屋（古代文化）============
  'N-CV03': {
    characters: [
      { name: { zh: '罗氏族长', en: 'Luo Clan Elder' }, role: { zh: '客家围屋建造者', en: 'Hakka Walled Village Builder' }, portrait: '' },
    ],
    intro: {
      zh: '清乾隆二十三年（1758年），兴宁客家人罗瑞凤迁居深圳龙岗，你在他身边做一名年轻匠人。罗瑞凤初为小贩，勤俭致富后开始营建家族大宅，前后历经三代数十年，至嘉庆二十二年（1817年）建成内围，道光年间整体竣工。你亲手用糯米浆、红糖水拌三合土夯筑围墙，将三百余间房舍围合成"九厅十八井，十阁走马廊"的城堡式客家围屋——全国现存最大的客家围屋之一。',
      en: 'In 1758, the twenty-third year of Qianlong, the Hakka merchant Luo Ruifeng moved from Xingning to Longgang in Shenzhen. You serve as a young craftsman at his side. Starting as a peddler, Luo amassed wealth through diligence and began building the family compound — three generations and decades of labor, with the inner ring completed in 1817 and the outer ring finished during the Daoguang reign. You personally mixed glutinous rice paste, brown sugar water, and earth to tamp the walls, enclosing over three hundred rooms in a fortress-style Hakka walled village known for "nine halls, eighteen courtyards, ten pavilions and a running gallery" — one of the largest surviving Hakka walled houses in China.',
    },
    scenes: [
      {
        q: { zh: '鹤湖新居的开基祖罗瑞凤是从哪里迁居深圳龙岗的？', en: 'From where did Luo Ruifeng, the founding patriarch of Hehu Xinju, migrate to Longgang, Shenzhen?' },
        options: [
          { text: { zh: '广东兴宁，清乾隆二十三年（1758年）迁居龙岗', en: 'Xingning, Guangdong; he moved to Longgang in 1758, the 23rd year of Qianlong' }, correct: true, feedback: { zh: '罗瑞凤原籍福建宁化，后迁广东兴宁，再于清乾隆二十三年（1758年）从兴宁迁至龙岗圩马福头立业。初为小贩，勤俭致富后始建鹤湖新居，历三代数十年建成。', en: 'Originally from Ninghua, Fujian, then Xingning, Guangdong, Luo Ruifeng moved to Longgang in 1758. Starting as a peddler, he grew wealthy through diligence and began building Hehu Xinju, completed over three generations.' } },
          { text: { zh: '江西赣州，清康熙年间迁居', en: 'Ganzhou, Jiangxi; he moved during the Kangxi reign' }, correct: false, feedback: { zh: '罗瑞凤是从广东兴宁迁来的客家人，非江西赣州。客家人从中原南迁的路线通常经过福建宁化再入粤东，罗氏家族正是沿此路线最终落脚龙岗。', en: 'Luo came from Xingning in Guangdong, not Jiangxi. The Hakka southward migration typically passed through Ninghua, Fujian into eastern Guangdong — the Luo family followed this route to Longgang.' } },
        ],
      },
      {
        q: { zh: '鹤湖新居的围墙用什么材料夯筑而成？', en: 'What materials were used to tamp the walls of Hehu Xinju?' },
        options: [
          { text: { zh: '三合土，以糯米浆、红糖水甚至鸡蛋清为粘合剂', en: 'Sanhetu (ternary earth), using glutinous rice paste, brown sugar water, and even egg whites as binders' }, correct: true, feedback: { zh: '鹤湖新居围墙高约6米、厚约1米，以石块、三合土夯筑，粘合剂中掺入糯米浆、红糖水甚至鸡蛋清，极为坚固。正门设有石套门、栅栏门等四道防御，暗含易守难攻的智慧。', en: 'The walls are about 6 meters high and 1 meter thick, tamped with stone and ternary earth, bound with glutinous rice paste, brown sugar water, and egg whites — extremely durable. The main gate has four layers of defense including stone doors and grille gates.' } },
          { text: { zh: '普通青砖砌筑', en: 'Ordinary gray brick masonry' }, correct: false, feedback: { zh: '鹤湖新居的围墙并非普通青砖，而是三合土夯筑，以糯米浆等为粘合剂。这种工艺使墙体历经两百年风雨仍坚固如初，体现了客家建筑"以柔克刚"的智慧。', en: 'The walls are not ordinary brick but tamped ternary earth with rice-paste binders. This technique has kept them solid for two centuries, embodying the Hakka principle of flexible strength.' } },
        ],
      },
    ],
    reward: { badge: '🏠', badgeName: { zh: '围龙传家印', en: 'Seal of the Walled Clan' }, insight: { zh: '清乾隆二十三年（1758年），兴宁客家人罗瑞凤迁居深圳龙岗，从小贩起家，勤俭致富后开始营建家族大宅。前后历经三代人数十年努力，以糯米浆、红糖水拌三合土夯筑围墙，将三百余间房舍围合成"九厅十八井，十阁走马廊"的城堡式布局，成为全国现存最大的客家围屋之一。从一介小贩到三代建成一座城堡，鹤湖新居展示了客家人如何用建筑回答"如何在他乡扎根，又不忘来路"的永恒命题——围墙抵御外患，祠堂维系血脉，三合土的坚固让家族记忆穿越两百年风雨而不散。', en: 'In 1758, Hakka merchant Luo Ruifeng moved from Xingning to Longgang, starting as a peddler, growing wealthy through diligence, then building the family compound. Over three generations and decades, using glutinous rice paste and brown sugar water mixed with ternary earth, over 300 rooms were enclosed in a fortress layout of "nine halls, eighteen courtyards, ten pavilions and a running gallery" — one of the largest surviving Hakka walled houses in China. From peddler to castle in three generations, Hehu Xinju shows how the Hakka used architecture to answer the eternal question of rooting in a new land without forgetting the road back — walls for defense, ancestral halls for lineage, ternary earth for memory that endures two centuries.' } },
  },

  // ============ N-CV04 开平碉楼·自力村（古代文化）============
  'N-CV04': {
    characters: [
      { name: { zh: '华侨归乡者', en: 'Returning Overseas Chinese' }, role: { zh: '跨洋奋斗的建造者', en: 'Trans-oceanic Builder' }, portrait: '' },
    ],
    intro: {
      zh: '1920年代，你是一位从美国旧金山归来的开平华侨。开平地处四县交界，清末至民国年间匪患猖獗，潭江流域洪涝频发。你在海外攒下血汗钱，心系故土，决定回乡建一座碉楼——墙体厚达半米以上，铁门钢窗，顶层设瞭望台和射击孔。你把在美国国会大厦见过的穹顶、在旧金山街头见过的罗马柱，同中式飞檐灰塑融在同一座楼里。现存1833座碉楼，每一座都是一部跨洋奋斗的家族传记。',
      en: 'The 1920s. You are a Kaiping emigrant returning from San Francisco. Kaiping sits at the junction of four counties — a lawless region overrun by bandits, where the Tan River floods relentlessly. With your hard-earned savings, you return home to build a diaolou: walls over half a meter thick, iron doors, steel-barred windows, a rooftop watchtower with gun slits. You blend the domes you saw at the US Capitol, the Roman columns from San Francisco streets, with Chinese flying eaves and lime sculpture in a single tower. Of the 1,833 surviving diaolou, each is a family biography of trans-oceanic struggle.',
    },
    scenes: [
      {
        q: { zh: '开平碉楼按功能分为三种类型，下列哪一项不是其中之一？', en: 'Kaiping diaolou are classified into three functional types. Which of the following is NOT one of them?' },
        options: [
          { text: { zh: '更楼，即村落联防瞭望塔', en: 'Genglou — village joint-defense watchtowers' }, correct: false, feedback: { zh: '更楼确实是开平碉楼三大类型之一。现存221座，是村落间的联防预警设施。另外两类是村民集资共建的众楼（现存473座）和富户独建的居楼（现存1149座）。', en: 'Genglou is indeed one of the three types. 221 survive as village defense watchtowers. The other two are zhonglou (collectively funded, 473 surviving) and julou (privately built, 1,149 surviving).' } },
          { text: { zh: '钟楼，即带有大钟的报时塔', en: 'Zhonglou — clock towers with large bells' }, correct: true, feedback: { zh: '开平碉楼没有"钟楼"这一分类。三大类型是众楼（村民集资共建）、居楼（富户独建）、更楼（联防瞭望），不存在以报时功能命名的类型。', en: 'There is no "clock tower" category in Kaiping diaolou. The three types are zhonglou (collectively funded), julou (privately built), and genglou (watchtowers) — no timekeeping type exists.' } },
        ],
      },
      {
        q: { zh: '开平碉楼于哪一年被列入《世界文化遗产名录》？现存碉楼约多少座？', en: 'In what year was Kaiping Diaolou inscribed on the World Heritage List? Approximately how many survive?' },
        options: [
          { text: { zh: '2007年列入，现存约1833座', en: 'Inscribed in 2007; approximately 1,833 survive' }, correct: true, feedback: { zh: '2007年，开平碉楼与村落被列入《世界文化遗产名录》，成为中国首个华侨文化主题的世界遗产。鼎盛时期超过3000座，现存1833座，其中80.4%为钢筋混凝土结构。', en: 'In 2007, Kaiping Diaolou and Villages were inscribed as World Heritage — China\'s first overseas Chinese cultural heritage site. Over 3,000 existed at peak; 1,833 survive, 80.4% of reinforced concrete construction.' } },
          { text: { zh: '2001年列入，现存约500座', en: 'Inscribed in 2001; approximately 500 survive' }, correct: false, feedback: { zh: '2001年是开平碉楼被列为全国重点文物保护单位的年份，而非世界遗产。世界遗产是2007年，现存数量为1833座而非500座。', en: '2001 was when Kaiping Diaolou became a National Cultural Heritage Protection Unit, not a World Heritage Site. The World Heritage inscription came in 2007, with 1,833 surviving towers.' } },
        ],
      },
    ],
    reward: { badge: '🗼', badgeName: { zh: '华侨归根印', en: 'Seal of the Diaspora Homecoming' }, insight: { zh: '1920年代，开平华侨在海外攒下血汗钱后回乡建碉楼，因清末至民国年间匪患猖獗、潭江流域洪涝频发，碉楼墙体厚达半米以上，顶层设瞭望台和射击孔，兼具防御与居住功能。华侨将在美国国会大厦见过的穹顶、旧金山街头的罗马柱同中式飞檐灰塑融在同一座楼里，形成中西建筑融合的独特风格。现存1833座碉楼，每一座都是一部跨洋奋斗的家族传记。2007年，开平碉楼与村落被列入《世界文化遗产名录》，成为中国首个华侨文化主题的世界遗产——从海外谋生到回乡筑楼，再到世界遗产，碉楼把华侨的根脉意识凝固成了永久的地标。', en: 'In the 1920s, Kaiping overseas Chinese returned home with hard-earned savings to build diaolou — walls over half a meter thick, rooftop watchtowers with gun slits — defending against bandits and floods while serving as residences. They blended domes from the US Capitol and Roman columns from San Francisco with Chinese flying eaves, creating a unique Sino-Western architectural fusion. Of the 1,833 surviving towers, each is a family biography of trans-oceanic struggle. In 2007, Kaiping Diaolou and Villages were inscribed as World Heritage — China\'s first overseas Chinese cultural heritage site. From seeking fortune abroad to building towers at home to World Heritage status, the diaolou crystallize the diaspora\'s rootedness into permanent landmarks.' } },
  },

  // ============ P02 广九铁路旧址（现代化与工程）============
  P02: {
    characters: [
      { name: { zh: '詹天佑', en: 'Zhan Tianyou' }, role: { zh: '中国铁路之父', en: 'Father of China\'s Railways' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/5ed90ca2-c330-48d4-852a-db950aef30a4/image_1781684649_2_3.jpg' },
    ],
    intro: {
      zh: '你是清宣统三年（1911年）十月二十八日站在深圳罗湖桥边的一名华段铁路工人。身后是广州大沙头始发的列车，前方是英国人修的英段铁轨。两段铁轨在罗湖桥中孔第二节接轨——广九铁路华段一百四十二点七七公里，英段三十五点七八公里，全线一百七十八公里就此贯通。汽笛长鸣，蒸汽弥漫。华段总办魏瀚、顾问詹天佑站在站台上，你看着他们脸上如释重负的神情。两年前华段动工时，清政府向英国借款一百五十万英镑，如今铁路通了，辛亥革命的烈火也已烧到武昌。',
      en: 'October 28, 1911. You stand by Luohu Bridge as a Chinese-section railway worker. Behind you: the train from Guangzhou\'s Dashatou station; ahead: British-laid rails. The two sections join at the second span of Luohu Bridge — 142.77 km Chinese section, 35.78 km British section, 178 km total. The whistle blows, steam billows. Chief administrator Wei Han and consultant Zhan Tianyou stand on the platform. The Qing government borrowed 1.5 million pounds from Britain two years ago; now the railway is complete, and the Revolution of 1911 has reached Wuchang.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '广九铁路华段与英段在何处接轨分界？', en: 'Where did the Chinese and British sections of the Kowloon-Canton Railway connect?' },
        options: [
          { text: { zh: '深圳罗湖桥中孔第二节，华段长142.77公里，英段长35.78公里', en: 'Luohu Bridge, second span — Chinese section 142.77 km, British section 35.78 km' }, correct: true, feedback: { zh: '中英双方约定以罗湖桥中孔第二节为界。华段自广州大沙头至分界点，1907年8月21日动工，1911年9月28日竣工，10月8日通车。英段自分界点至九龙，1910年10月1日已先行通车。10月28日两段接轨，全线贯通。', en: 'The two sides agreed on the second span of Luohu Bridge as the boundary. The Chinese section ran from Guangzhou Dashatou to the divide, begun August 21, 1907, completed September 28, 1911, opened October 8. The British section opened October 1, 1910. Full connection on October 28.' } },
          { text: { zh: '广州火车站，两段在此合龙', en: 'Guangzhou Railway Station, where the two sections merged' }, correct: false, feedback: { zh: '接轨点不在广州，而在深圳罗湖桥中孔第二节。华段起点是广州大沙头，英段终点是九龙，罗湖桥是两段的分界与接轨处。', en: 'The connection point was not Guangzhou but the second span of Luohu Bridge in Shenzhen. The Chinese section started at Guangzhou Dashatou; the British section ended at Kowloon; Luohu Bridge was the junction.' } },
        ],
      },
      {
        q: { zh: '詹天佑在广九铁路中担任什么职务？', en: 'What role did Zhan Tianyou hold in the Kowloon-Canton Railway?' },
        options: [
          { text: { zh: '华段工程顾问，总办为魏瀚', en: 'Consultant for the Chinese section; the chief administrator was Wei Han' }, correct: true, feedback: { zh: '广九铁路华段总办是中国军舰制造专家魏瀚，詹天佑担任顾问。詹天佑此前已于1909年主持建成京张铁路，在八达岭青龙桥设计"人字形"折返线，是中国自主设计铁路的里程碑。', en: 'The Chinese section\'s chief administrator was Wei Han, a Chinese naval architect; Zhan Tianyou served as consultant. Zhan had previously completed the Beijing-Zhangjiakou Railway in 1909, designing the famous "zigzag" switchback at Qinglongqiao — a milestone in Chinese-designed railways.' } },
          { text: { zh: '广九铁路总工程师，负责全线设计与施工', en: 'Chief engineer of the entire railway, responsible for design and construction' }, correct: false, feedback: { zh: '詹天佑在广九铁路中的职务是华段顾问，并非全线总工程师。英段由英国人自行修建。詹天佑此前主持京张铁路时设计了"人字形"折返线，但那属于京张铁路而非广九铁路。', en: 'Zhan Tianyou was a consultant for the Chinese section, not chief engineer of the entire line. The British section was built by the British. His famous "zigzag" switchback was designed for the Beijing-Zhangjiakou Railway, not the Kowloon-Canton Railway.' } },
        ],
      },
    ],
    reward: { badge: '🚂', badgeName: { zh: '铁路先驱印', en: 'Seal of the Railway Pioneer' }, insight: { zh: '1907年8月21日，广九铁路华段动工，清政府向英国借款一百五十万英镑。华段总办为军舰制造专家魏瀚，顾问为詹天佑。詹天佑此前已于1909年主持建成中国首条自主设计的铁路——京张铁路，在八达岭青龙桥以"人字形"折返线征服陡坡，打破了外国人"中国人不能修铁路"的偏见。1911年10月28日，广九铁路华段与英段在深圳罗湖桥中孔第二节接轨，全线一百七十八公里贯通。以罗湖桥为界，以南英段三十五点七八公里由英国修建，以北华段一百四十二点七七公里由中国自办。这是中国境内第一条连接内地与香港的铁路。通车之时，辛亥革命的烈火已烧到武昌——一条铁路和一个王朝，在同一个月走向了各自的终点。', en: 'On August 21, 1907, the Chinese section of the Kowloon-Canton Railway began construction, funded by a 1.5-million-pound British loan. Chief administrator: naval architect Wei Han; consultant: Zhan Tianyou — who had completed China\'s first self-designed railway, the Beijing-Zhangjiakou, in 1909, conquering steep grades with the famous "zigzag" switchback at Qinglongqiao. On October 28, 1911, the two sections joined at Luohu Bridge — 178 km total, the first railway linking inland China with Hong Kong. As the line opened, the Revolution of 1911 reached Wuchang: a railway and a dynasty reached their respective endpoints in the same month.' } },
  },

  // ============ M08 前海深港合作区（改革开放与制度创新）============
  M08: {
    characters: [
      { name: { zh: '金融先行者', en: 'Financial Pioneer' }, role: { zh: '前海创新试验区设计师', en: 'Qianhai Innovation Zone Architect' }, portrait: '' },
    ],
    intro: {
      zh: '你是2010年前海规划团队里的一名年轻政策研究员。国务院刚刚批复前海深港现代服务业合作区总体发展规划，脚下还是南山半岛西岸的一片填海滩涂。领导递来一份文件，上面写着"深港合作、制度创新"八个字。海风吹过空旷的工地，你望着对岸的中国香港，心里在盘算：在这片没有历史包袱的新地上，到底要先试哪一步棋？跨境人民币贷款、港企准入、法律规则衔接——每一项都可能在旧城区引发地震，但在这里，可以放手一试。',
      en: '2010. You are a young policy researcher on the Qianhai planning team. The State Council has just approved the Qianhai Shenzhen-Hong Kong Modern Service Industry Cooperation Zone plan. Beneath your feet is reclaimed mudflat on the western shore of Nanshan Peninsula. Your director hands you a document: "Shenzhen-Hong Kong cooperation, institutional innovation." The sea breeze sweeps the empty site as you gaze at Hong Kong, China across the water, wondering which move to try first — cross-border RMB lending, Hong Kong enterprise access, or legal rule alignment — each could cause shockwaves in old districts, but here you can test freely.',
    },
    scenes: [
      {
        q: { zh: '前海跨境人民币贷款业务正式启动于哪一年？', en: 'In which year was Qianhai\'s cross-border RMB lending officially launched?' },
        options: [
          { text: { zh: '2012年12月——人行深圳中支发布《前海跨境人民币贷款管理暂行办法》', en: 'December 2012 — PBOC Shenzhen published the Qianhai Cross-Border RMB Loan Management Measures' }, correct: true, feedback: { zh: '2012年12月27日，中国人民银行深圳市中心支行发布《前海跨境人民币贷款管理暂行办法》，标志着前海跨境人民币贷款业务正式启动。这是中国金融开放的重要一步：在前海注册并实际经营的企业可从中国香港经营人民币业务的银行借入人民币资金。截至2015年3月底，前海跨境贷备案金额已达911亿元。', en: 'On December 27, 2012, PBOC Shenzhen published the Interim Measures, officially launching Qianhai cross-border RMB lending. Enterprises registered and operating in Qianhai could borrow RMB from banks in Hong Kong, China. By March 2015, registered loan amounts reached 91.1 billion yuan.' } },
          { text: { zh: '2015年——随自贸区挂牌同步启动', en: '2015 — launched simultaneously with the Free Trade Zone' }, correct: false, feedback: { zh: '时间偏晚。前海跨境人民币贷款试点始于2012年12月，比2015年前海蛇口自贸片区挂牌早了两年多。该试点被放在国务院支持前海开发开放批复的首要位置，是前海金融改革的核心举措之一。', en: 'Too late. Qianhai cross-border RMB lending began in December 2012, over two years before the Qianhai-Shekou FTZ was established in 2015. The pilot was a top priority in the State Council\'s Qianhai approval.' } },
        ],
      },
      {
        q: { zh: '前海提出的"港资港模式港惯例"核心理念是在哪一年明确的？', en: 'In which year was Qianhai\'s "Hong Kong capital, Hong Kong model, Hong Kong conventions" principle established?' },
        options: [
          { text: { zh: '2014年——前海明确对港资企业实行港模式港惯例', en: '2014 — Qianhai explicitly adopted Hong Kong models and conventions for HK-funded enterprises' }, correct: true, feedback: { zh: '2014年，前海明确提出"港资港模式港惯例"，为港资企业提供与香港接轨的营商环境。这一定位使前海成为中国香港企业进入内地的重要门户，也使前海从单纯的物理开发转向制度创新试验田——跨境人民币、港企准入、法律衔接等改革在这片白纸上率先落笔。', en: 'In 2014, Qianhai explicitly adopted "Hong Kong capital, Hong Kong model, Hong Kong conventions," providing HK-funded enterprises a Hong Kong-aligned business environment. This made Qianhai a key gateway for Hong Kong, China enterprises entering the mainland, shifting from physical development to institutional innovation.' } },
          { text: { zh: '2010年——随国务院批复同步提出', en: '2010 — proposed simultaneously with the State Council approval' }, correct: false, feedback: { zh: '2010年国务院批复的是前海总体发展规划，"港资港模式港惯例"是后续在实践中逐步明确的。2012年跨境人民币贷款试点启动，2014年才正式确立该理念，体现了前海从规划到落地的渐进过程。', en: 'The 2010 State Council approval was the overall plan; "Hong Kong models and conventions" was clarified later through practice — the RMB lending pilot in 2012 and the formal principle in 2014, reflecting Qianhai\'s gradual progression from plan to implementation.' } },
        ],
      },
    ],
    reward: { badge: '💰', badgeName: { zh: '金融先锋印', en: 'Seal of the Financial Vanguard' }, insight: { zh: '2010年国务院批复前海深港现代服务业合作区总体发展规划，在南山半岛西岸的填海滩涂上开启制度创新试验。2012年12月，中国人民银行深圳中心支行发布《前海跨境人民币贷款管理暂行办法》，前海注册企业可从中国香港银行借入人民币资金，跨境人民币贷款业务正式启动，截至2015年3月备案金额达911亿元。2014年前海明确"港资港模式港惯例"理念，为中国香港企业提供接轨的营商环境。前海的核心价值不在于物理开发，而在于在一张没有历史包袱的白纸上率先试验跨境金融、法律衔接等改革，为全国提供可复制的经验。', en: 'In 2010 the State Council approved the Qianhai Shenzhen-Hong Kong Modern Service Industry Cooperation Zone on reclaimed mudflat. In December 2012, PBOC Shenzhen published cross-border RMB loan measures, allowing Qianhai enterprises to borrow from Hong Kong, China banks — registered amounts reached 91.1 billion yuan by March 2015. In 2014 Qianhai adopted "Hong Kong capital, Hong Kong model, Hong Kong conventions." Qianhai\'s core value lies not in physical development but in piloting cross-border finance and legal alignment on a blank canvas, providing replicable experience for the nation.' } },
  },

  // ============ N-EG01 深圳国贸大厦（现代化与工程）============
  'N-EG01': {
    characters: [
      { name: { zh: '建设工人', en: 'Construction Worker' }, role: { zh: '深圳速度的创造者', en: 'Creator of Shenzhen Speed' }, portrait: '' },
    ],
    intro: {
      zh: '1983年冬,你是国贸大厦工地上中建三局一公司的一名钢筋工。五十三层、一百六十米——这将是当时全国第一高楼。工地上采用独创的滑模工艺,施工速度从七天一层逐步提速到五天、四天,第三十层起达到持续三天一层。同时期香港最快五天一层,美国四天一层。你站在百米高空的脚手架上,混凝土泵管的轰鸣震动脚底,新华社刚向全国播报了"三天一层楼"的消息。',
      en: 'Winter 1983. You are a steel worker at the ITC site under China Construction Third Bureau. Fifty-three floors, 160 meters — soon to be China\'s tallest. The slip-form method pushes speed from 7 to 5 to 4 days per floor; from the 30th floor, a sustained 3-day pace. Hong Kong\'s fastest is 5 days, America\'s 4. You stand on scaffolding 100 meters up, concrete pump vibration thrumming through your boots, as Xinhua broadcasts the milestone nationwide.',
    },
    scenes: [
      {
        q: { zh: '国贸大厦滑模施工从7天一层逐步提速,最终在哪个楼层开始持续达到三天一层?', en: 'Slip-form speed improved from 7 to 3 days — from which floor was 3 days sustained?' },
        options: [
          { text: { zh: '从第30层开始持续达到三天一层', en: 'From the 30th floor onward' }, correct: true, feedback: { zh: '1983年12月起,中建三局一公司采用独创滑模法,施工速度从7天一层逐步提升至5天、4天。从第30层开始,持续以3天一层的速度推进,207天内滑完43层,平均4.8天一层,创下当时世界领先纪录。', en: 'From December 1983, using their slip-form method, speed went from 7 to 5 to 4 days. From the 30th floor, a sustained 3-day pace: 43 floors in 207 days, averaging 4.8 — world-leading at the time.' } },
          { text: { zh: '从封顶前最后5层才达到三天一层', en: 'Only the last 5 floors before topping out' }, correct: false, feedback: { zh: '实际上从第30层便开始持续三天一层,而非仅最后几层。207天里滑完了43层,平均4.8天一层,最快达到3天一个结构层,这一速度居世界领先地位。', en: 'The 3-day pace started at the 30th floor, not just the final floors. 43 floors in 207 days, averaging 4.8 — world-leading speed.' } },
        ],
      },
      {
        q: { zh: '国贸大厦创造三天一层楼的速度时,同时期香港和美国的最高施工速度分别是多少?', en: 'When ITC set its 3-day pace, what were Hong Kong and America\'s fastest?' },
        options: [
          { text: { zh: '香港最快5天一层,美国最高4天一层', en: 'Hong Kong 5 days, America 4 days' }, correct: true, feedback: { zh: '当时香港的最快速度是5天一层,美国的最高速度是4天一层。国贸大厦的三天一层超越了两者,1984年3月15日新华社播报这一消息后,三天一层楼成为深圳速度的标志。', en: 'Hong Kong\'s fastest was 5 days, America\'s 4. ITC\'s 3-day pace surpassed both. On March 15, 1984, Xinhua broadcast the news, making it the symbol of Shenzhen Speed.' } },
          { text: { zh: '香港和美国都已是3天一层,深圳只是追平', en: 'Both were already at 3 days — Shenzhen merely matched them' }, correct: false, feedback: { zh: '当时香港最快5天一层、美国4天一层,深圳以3天一层超越了两者。这一速度在1980年代世界建筑领域居领先地位,被特区人赞誉为深圳速度。', en: 'Hong Kong was 5 days, America 4 — Shenzhen\'s 3-day pace exceeded both, ranking world-leading in the 1980s and earning the name Shenzhen Speed.' } },
        ],
      },
    ],
    reward: { badge: '🏢', badgeName: { zh: '深圳速度印', en: 'Seal of Shenzhen Speed' }, insight: { zh: '国贸大厦1985年12月29日竣工,53层160米,是当时全国最高建筑。中建三局一公司用独创滑模法,从第30层起持续三天一层,超越了同时期香港5天一层、美国4天一层的速度。1987年该工程获首届鲁班金像奖。三天一层楼不只是一栋楼的建造纪录,更是1980年代中国向世界证明改革开放决心的速度图腾。此后十年,国贸大厦一直戴着全国第一高楼的桂冠。', en: 'ITC was completed December 29, 1985 — 53 floors, 160 meters, China\'s tallest. Using their slip-form method, the team sustained 3 days per floor from the 30th floor, surpassing Hong Kong\'s 5 and America\'s 4. The project won the first Luban Prize in 1987. Three days one floor was more than a construction record — a speed totem proving China\'s reform resolve. ITC held the tallest-building crown for a decade.' } },
  },

  // ============ N-EG02 深圳证券交易所（改革开放与制度创新）============
  'N-EG02': {
    characters: [
      { name: { zh: '市场改革者', en: 'Market Reformer' }, role: { zh: '资本市场先驱', en: 'Capital Market Pioneer' }, portrait: '' },
    ],
    intro: {
      zh: '你是1990年12月1日上午九点深圳证券交易所里的一名"红马甲"出市代表。位于红岭路的交易大厅里，电子屏幕第一次亮起红绿数字。你穿着红色马甲坐在工位上，手心微微出汗。旁边是同样紧张的"蓝马甲"工作人员。这一天，深交所开始试营业，成为新中国第一家开业运行的证券交易所。没有鸣锣仪式，没有媒体报道——但你知道，从这一刻起，一个社会主义国家有了自己的股票集中交易市场。',
      en: '9 AM, December 1, 1990. You are a "red vest" trader at the Shenzhen Stock Exchange on Hongling Road. The electronic screens flash red and green for the first time. You sit at your post in a red vest, palms sweating. Beside you, equally nervous "blue vest" staff. Today SZSE begins trial operation — New China\'s first functioning stock exchange. No gong ceremony, no media — but you know that from this moment, a socialist nation has its own centralized stock market.',
    },
    scenes: [
      {
        q: { zh: '深圳证券交易所开始试营业的确切日期是哪一天？', en: 'On what exact date did the Shenzhen Stock Exchange begin trial operation?' },
        options: [
          { text: { zh: '1990年12月1日——比上海证券交易所早了18天', en: 'December 1, 1990 — 18 days earlier than the Shanghai Stock Exchange' }, correct: true, feedback: { zh: '1990年12月1日上午九时，深圳证券交易所开始试营业，成为新中国第一家开业运行的证券交易所。值得注意的是，深交所是在尚未获得中国人民银行正式批准的情况下"抢跑"开业的，直到1991年4月16日才获批复，7月3日举行正式开业庆典。"深安达"（000004）是开业后第一家上市公司。', en: 'At 9 AM on December 1, 1990, SZSE began trial operation — New China\'s first functioning exchange. Notably, it "jumped the gun" without PBOC approval, which came on April 16, 1991, with a formal opening ceremony on July 3. "Shen Anda" (000004) was the first listed company.' } },
          { text: { zh: '1991年7月3日——正式开业庆典当天', en: 'July 3, 1991 — the day of the formal opening ceremony' }, correct: false, feedback: { zh: '1991年7月3日是深交所举行正式开业庆典的日期，但试营业早在1990年12月1日就已开始。深交所在没有"准生证"的情况下先行试营业，比上交所早了18天，体现了深圳"敢为天下先"的改革精神。', en: 'July 3, 1991 was the formal opening ceremony, but trial operation began on December 1, 1990. SZSE started without official approval, 18 days ahead of SSE, embodying Shenzhen\'s pioneering spirit.' } },
        ],
      },
      {
        q: { zh: '深交所创业板（ChiNext）是在哪一年正式开市的？', en: 'In which year did SZSE\'s ChiNext board officially open?' },
        options: [
          { text: { zh: '2009年——专为创新型中小企业服务', en: '2009 — designed for innovative SMEs' }, correct: true, feedback: { zh: '2009年10月30日，深交所创业板正式开市，首批28家公司挂牌上市。创业板的推出使深交所凤凰涅槃——2000年起深交所曾暂停主板新股上市四年以筹备创业板，创业板开市后深交所取得了不输上交所的业绩。创业板孵化了大量科技企业，后来注册制改革进一步推动了中国资本市场走向成熟。', en: 'On October 30, 2009, ChiNext officially opened with 28 inaugural listings. It revitalized SZSE — which had suspended main board IPOs for four years since 2000 to prepare for it. ChiNext incubated numerous tech firms, and registration-based reform further matured China\'s capital market.' } },
          { text: { zh: '2004年——与中小板同时推出', en: '2004 — launched alongside the SME board' }, correct: false, feedback: { zh: '2004年深交所推出的是中小板，而非创业板。创业板经过多年筹备，直到2009年才正式开市。两者定位不同：中小板面向成熟中小企业，创业板则面向创新型、成长型创业企业。深交所从中小板到创业板的发展，体现了多层次资本市场的逐步构建。', en: 'In 2004 SZSE launched the SME board, not ChiNext. ChiNext opened in 2009 after years of preparation. The SME board targets mature SMEs; ChiNext targets innovative growth companies. Together they build SZSE\'s multi-tier market.' } },
        ],
      },
    ],
    reward: { badge: '📈', badgeName: { zh: '资本实验印', en: 'Seal of the Capital Experiment' }, insight: { zh: '1990年12月1日，深圳证券交易所在红岭路开始试营业，成为新中国第一家开业运行的证券交易所。它是在尚未获中国人民银行正式批准的情况下"抢跑"开业的，比上海证券交易所早了18天，直到1991年4月才获批复。2000年起深交所暂停主板新股上市四年，集中精力筹备创业板。2004年推出中小板，2009年10月30日创业板正式开市，首批28家公司挂牌。创业板孵化了大量科技企业，后来的注册制改革进一步推动了中国资本市场走向成熟。如今深交所已发展为全球前列的证券交易所，从最初的5只股票到数千家上市公司，其历程证明制度创新本身就是最重要的基础设施。', en: 'On December 1, 1990, SZSE began trial operation on Hongling Road — New China\'s first functioning exchange. It "jumped the gun" without PBOC approval, 18 days ahead of SSE, gaining approval only in April 1991. From 2000, SZSE suspended main board IPOs for four years to prepare ChiNext. The SME board launched in 2004; ChiNext opened on October 30, 2009 with 28 inaugural listings, incubating numerous tech firms. Registration-based reform further matured China\'s capital market. Today SZSE ranks among the world\'s top exchanges — from 5 initial stocks to thousands of listings, proving institutional innovation is the most vital infrastructure.' } },
  },

  // ============ N-EG03 港珠澳大桥（现代化与工程）============
  'N-EG03': {
    characters: [
      { name: { zh: '岛隧工程师', en: 'Island-Tunnel Engineer' }, role: { zh: '世纪工程总工程师', en: 'Chief Engineer of the Century Project' }, portrait: '' },
    ],
    intro: {
      zh: '2013年,你是港珠澳大桥岛隧工程团队的一名工程师。2009年12月15日大桥正式开工,全程55公里,是世界上最长的跨海大桥。你负责的沉管隧道长6.7公里,是世界最长的公路沉管隧道,也是中国第一座外海沉管隧道。每个管节重约8万吨,要在40米深海底精准对接,误差不超过几厘米。伶仃洋的洋流、台风和航道密度,让每一次沉放都像在深海穿针。',
      en: '2013. You are an engineer on the HKZM Bridge island-tunnel team. Construction began December 15, 2009. At 55 km it is the world\'s longest sea-crossing bridge. Your immersed tunnel runs 6.7 km — the world\'s longest highway immersed tube, and China\'s first offshore immersed tunnel. Each segment weighs ~80,000 tonnes, joined 40 meters underwater with centimeter-level precision. Lingding currents, typhoons and shipping traffic make every immersion like threading a needle in the deep.',
    },
    scenes: [
      {
        q: { zh: '港珠澳大桥中段为何不全程建桥而要加一段海底沉管隧道?', en: 'Why include an immersed tunnel instead of a continuous bridge?' },
        options: [
          { text: { zh: '伶仃洋是全球最繁忙航道之一,全桥会阻碍大型船舶通航,且桥址邻近香港国际机场,桥高受航空限高约束', en: 'Lingding is among the world\'s busiest shipping lanes; a full bridge would block vessels, and proximity to HK airport imposes height limits' }, correct: true, feedback: { zh: '伶仃洋主航道每天有大量重量级货轮通行,建桥必须留出足够通航净空。但桥址又靠近香港国际机场,飞机降落阶段对建筑物高度有严格限制。两个约束叠加,工程师选择了海底隧道加人工岛的方案——既保航运又不碍飞行。', en: 'The main channel sees heavy cargo traffic daily, requiring clearance for vessels. But proximity to HK International Airport imposes strict height limits. These dual constraints led engineers to the tunnel-plus-island solution — preserving shipping and aviation alike.' } },
          { text: { zh: '因为中国的桥梁技术还不够先进,无法建高桥', en: 'Because Chinese bridge technology was insufficient to build a high bridge' }, correct: false, feedback: { zh: '中国的桥梁技术世界领先。选择隧道不是因为技术不足,而是受限于航道通航需求和机场航空限高两个现实约束。这条6.7公里沉管隧道本身是更高难度的工程挑战,是中国第一座外海沉管隧道,也是世界最长的公路沉管隧道。', en: 'China\'s bridge technology is world-leading. The tunnel was chosen not from lack of capability but due to shipping clearance and aviation height limits. The 6.7 km immersed tube is itself a harder challenge — China\'s first offshore immersed tunnel and the world\'s longest highway immersed tube.' } },
        ],
      },
      {
        q: { zh: '港珠澳大桥的人工岛是如何快速建成的?采用了什么创新工法?', en: 'How were the artificial islands built quickly? What innovative method was used?' },
        options: [
          { text: { zh: '在海上振沉120个巨型钢圆筒围出人工岛,每个高50米、直径22米、重达550吨,由上海振华重工制造', en: '120 giant steel cylinders — each 50m tall, 22m diameter, 550 tonnes — were vibrated into the seabed to form islands, made by Shanghai Zhenhua Heavy Industries' }, correct: true, feedback: { zh: '传统填海造岛约需两年,工期不允许。工程团队提出用巨型钢圆筒围出人工岛的大胆方案,共120个,每个高50米、直径22米、重达550吨。上海振华重工集中20年以上经验的焊接匠师制造,然后通过强大振动力量将它们沉入海底,围成珍珠项链状的人工岛。', en: 'Traditional reclamation takes ~2 years — too long. The team proposed giant steel cylinders: 120 total, each 50m tall, 22m wide, 550 tonnes. Shanghai Zhenhua deployed veteran welders to fabricate them, then vibrated them into the seabed to form the islands.' } },
          { text: { zh: '用炸药炸平海底礁石后直接浇筑混凝土', en: 'Blasting seabed rocks then pouring concrete directly' }, correct: false, feedback: { zh: '实际采用的是巨型钢圆筒振沉法,而非炸礁浇筑。120个高50米、直径22米的大钢圆筒被插入海底,围出两个人工岛,只用了一个月就完善了生产条件,创建了双线并发的生产线。这是世界海洋建桥史上前所未有的创新工法。', en: 'The actual method was steel-cylinder vibration sinking, not blasting. 120 cylinders — 50m tall, 22m wide — were inserted into the seabed to form two islands, with production conditions ready in just one month. An unprecedented innovation in maritime engineering.' } },
        ],
      },
    ],
    reward: { badge: '🌉', badgeName: { zh: '世纪大桥印', en: 'Seal of the Century Bridge' }, insight: { zh: '港珠澳大桥2009年12月开工、2018年通车,全长55公里,是世界上最长的跨海大桥。它集桥、双人工岛、隧道于一体,6.7公里沉管隧道是世界最长的公路沉管隧道,也是中国第一座外海沉管隧道。因伶仃洋主航道通航需求与邻近香港国际机场的航空限高,中段采用海底隧道。120个巨型钢圆筒振沉成岛的工法将传统两年工期压缩至月余。英国《卫报》誉其为新世界七大奇迹之一。大桥连接中国香港、珠海、中国澳门三地,将珠海至中国香港的车程从约4小时压缩至30余分钟。', en: 'Construction began December 2009, opened 2018. At 55 km, the world\'s longest sea-crossing bridge, combining bridges, two artificial islands and a 6.7 km immersed tunnel — the world\'s longest highway immersed tube and China\'s first offshore. The tunnel was chosen because the main shipping channel and proximity to HK airport preclude a full bridge. 120 giant steel cylinders formed the islands in months rather than years. The Guardian called it a "New Seven Wonder." It links Hong Kong (China), Zhuhai and Macao (China), cutting travel from ~4 hours to ~30 minutes.' } },
  },

  // ============ N-EG04 东深供水工程（现代化与工程）============
  'N-EG04': {
    characters: [
      { name: { zh: '工程建设者', en: 'Construction Worker' }, role: { zh: '跨越边界的供水者', en: 'Cross-border Water Provider' }, portrait: '' },
    ],
    intro: {
      zh: '1964年2月,你是东深供水工程石马河工地上的一名水利工人。中国香港遭遇百年大旱,350万市民每四天供水一次、每次四小时,20万人逃离家园。周恩来总理亲自批示兴建此工程。你面前的任务是在一年内,把由南向北流入东江的石马河水提高46米、倒流83公里进入深圳水库,再输向中国香港。缺机械、少技术,你和上万名工友用肩挑人扛,喊着"要高山低头、让河水倒流"的口号开山劈岭。',
      en: 'February 1964. You are a hydraulic worker on the Shima River site of the Dongjiang-Shenzhen supply project. Hong Kong (China) faces its worst drought in a century — 3.5 million people get water every 4 days, 4 hours each; 200,000 flee. Premier Zhou Enlai personally approved the project. Your task: in one year, lift Shima River water 46 meters and reverse it 83 km into Shenzhen Reservoir, then to Hong Kong. Lacking machines and technology, you and tens of thousands of workers carry loads on shoulder poles, carving mountains with the slogan "Make the mountains bow, make the river flow backward."',
    },
    scenes: [
      {
        q: { zh: '东深供水工程于哪一年建成并正式向中国香港供水?', en: 'In which year was the project completed and began supplying Hong Kong (China)?' },
        options: [
          { text: { zh: '1965年3月1日,东深供水工程正式向中国香港供水', en: 'March 1, 1965' }, correct: true, feedback: { zh: '1964年2月全线开工,上万建设者仅用一年时间建成全长83公里的供水工程。1965年3月1日,东江水沿东深供水工程越山而来、奔腾入港,从此终结了中国香港严重缺水的历史。迄今累计对港供水超311亿立方米。', en: 'Construction began February 1964; tens of thousands built the 83 km project in just one year. On March 1, 1965, Dongjiang water flowed into Hong Kong, ending its severe water shortage. Cumulative supply now exceeds 31.1 billion cubic meters.' } },
          { text: { zh: '1956年建成通水', en: '1956' }, correct: false, feedback: { zh: '东深供水工程1964年2月动工、1965年3月建成通水,而非1956年。它将东江水从海拔2米提升至46米,倒流83公里进入深圳水库,是中国香港的生命水线,迄今累计对港供水超311亿立方米。', en: 'The project broke ground in February 1964 and began supplying March 1965, not 1956. It lifts water from 2m to 46m elevation, reversing 83 km into Shenzhen Reservoir. Cumulative supply exceeds 31.1 billion cubic meters.' } },
        ],
      },
      {
        q: { zh: '东深供水工程需要将石马河水位提升多少米,才能让河水倒流83公里进入深圳水库?', en: 'How many meters must the Shima River water level be lifted to reverse flow 83 km into Shenzhen Reservoir?' },
        options: [
          { text: { zh: '提升46米', en: '46 meters' }, correct: true, feedback: { zh: '石马河原本由南向北流入东江,要引水入港需将水位提高46米,使之倒流83公里。上万建设者在缺机械的年代,用肩挑人扛完成全部8级抽水站,喊出"要高山低头、让河水倒流"的口号。工程设计图纸连起来可达10公里长。', en: 'The Shima River naturally flows north into Dongjiang. To divert water to Hong Kong, the level must be raised 46 meters to reverse 83 km. Workers built 8 pumping stations by hand, with blueprints stretching 10 km end to end.' } },
          { text: { zh: '提升10米', en: '10 meters' }, correct: false, feedback: { zh: '实际需提升46米。石马河发源于深圳大脑壳山,原本由南向北流入东江,工程需将水位提高46米使其倒流83公里进入深圳水库。这在缺机械的年代难度极大,高峰期有近2万人现场作业。', en: 'The actual lift is 46 meters. The Shima River flows north into Dongjiang; the project raised the level 46 meters to reverse it 83 km. At peak, nearly 20,000 workers were on site, many without machinery.' } },
        ],
      },
    ],
    reward: { badge: '💧', badgeName: { zh: '生命之水印', en: 'Seal of the Water of Life' }, insight: { zh: '东深供水工程1964年2月动工,1965年3月1日建成通水,全长83公里。1963年中国香港遭遇百年大旱,350万市民每四天供水一次,周恩来总理亲自批示兴建此工程。上万建设者用一年时间,将东江水从海拔2米提升至46米、倒流83公里入深圳水库,高峰期近2万人现场作业。此后历经四次扩建改造,年供水能力从初期0.68亿立方米提升至24.23亿立方米,满足中国香港约80%淡水需求。迄今累计对港供水超311亿立方米,从未中断,比港珠澳大桥早54年,是大湾区最早的互联互通工程。', en: 'Construction began February 1964, completed March 1, 1965, spanning 83 km. In 1963, Hong Kong (China) suffered a century drought — 3.5 million people rationed to water every 4 days. Premier Zhou Enlai personally approved the project. In one year, workers lifted Dongjiang water from 2m to 46m elevation, reversing 83 km into Shenzhen Reservoir, with nearly 20,000 at peak. Four expansions raised annual capacity from 0.68 to 2.423 billion cubic meters, supplying ~80% of Hong Kong\'s freshwater. Cumulative supply exceeds 31.1 billion cubic meters, uninterrupted — 54 years before the HKZM Bridge, the Bay Area\'s earliest interconnection project.' } },
  },

  // ============ N-SC01 华强北电子市场（科学星火）============
  'N-SC01': {
    characters: [
      { name: { zh: '电子创业者', en: 'Electronics Entrepreneur' }, role: { zh: '华强北档口老板', en: 'Huaqiangbei Booth Owner' }, portrait: '' },
    ],
    intro: {
      zh: '2008年。你是华强北一个10平方米档口的年轻老板,柜台里密密麻麻摆满数千种电子元器件。1988年赛格电子市场在这里开业,二十年间,这片街区从电子元器件批发市场长成了全球硬件创新中心。一位硅谷来的创始人挤过人群,递过来一张PCB设计图:"我需要72小时内做出原型机。"你知道,从设计到原型测试,这个周期在华强北是最短的——世界上没有第二个地方能做到。',
      en: '2008. You are a young owner of a 10sqm booth in Huaqiangbei, counters crammed with thousands of electronic components. SEG Electronics Market opened here in 1988; over two decades, this block grew from a wholesale electronics market into a global hardware innovation hub. A Silicon Valley founder pushes through the crowd and hands you a PCB design: "I need a prototype in 72 hours." You know that from design to prototype testing, this cycle is shortest in Huaqiangbei — nowhere else on Earth can match it.',
    },
    scenes: [
      {
        q: { zh: '华强北电子商圈的起点是哪一年、什么事件?', en: 'What year and event marked the starting point of the Huaqiangbei electronics district?' },
        options: [
          { text: { zh: '1988年赛格电子市场开业,是华强北电子商圈的起点', en: 'In 1988 SEG Electronics Market opened — the starting point of the Huaqiangbei electronics district' }, correct: true, feedback: { zh: '1988年赛格电子市场开业,是华强北电子商圈的起点。此后这里从电子元器件批发市场逐步发展为全球硬件创新中心,被称为"中国硅谷"的硬件版。大疆早期原型机的零件在此采购组装,华大基因早期也在华强北周边办公。', en: 'In 1988 SEG Electronics Market opened, marking the starting point of the Huaqiangbei electronics district. From a wholesale components market it grew into a global hardware innovation hub, called the hardware version of "China\'s Silicon Valley." DJI\'s early prototype parts were sourced and assembled here; BGI also operated near Huaqiangbei in its early days.' } },
          { text: { zh: '华强北从改革开放前就是电子市场', en: 'Huaqiangbei was an electronics market since before reform and opening' }, correct: false, feedback: { zh: '华强北电子商圈的起点是1988年赛格电子市场开业,并非改革开放前就有。此后二十年间,这片街区从电子元器件批发市场发展为全球硬件创新中心。"72小时打样"——从设计到原型测试的最快周期——正是这种产业密度积累出来的能力。', en: 'The starting point was the 1988 opening of SEG Electronics Market, not a pre-reform legacy. Over the following two decades, this block grew from a wholesale components market into a global hardware innovation hub. "72-hour prototyping" — the fastest cycle from design to prototype testing — emerged from this density of industry.' } },
        ],
      },
      {
        q: { zh: '"72小时打样"在华强北意味着什么?', en: 'What does "72-hour prototyping" mean in Huaqiangbei?' },
        options: [
          { text: { zh: '从设计到原型测试的最快周期,全球任何其他城市需要数周', en: 'The fastest cycle from design to prototype testing; any other city in the world needs weeks' }, correct: true, feedback: { zh: '"72小时打样"是从设计到原型测试的最快周期,全球任何其他城市需要数周才能完成。大疆早期原型机的零件就在华强北采购组装,华大基因早期也在华强北周边。这种速度来自一个街区内从芯片到外壳的完整供应链密度,是几十年产业积累的结果。', en: '"72-hour prototyping" is the fastest cycle from design to prototype testing; any other city in the world needs weeks. DJI\'s early prototype parts were sourced and assembled in Huaqiangbei; BGI also operated nearby. This speed comes from the density of a complete supply chain — chip to case — within one block, the result of decades of industrial accumulation.' } },
          { text: { zh: '"72小时打样"只是一句广告语,实际做不到', en: '"72-hour prototyping" is just a slogan, not actually achievable' }, correct: false, feedback: { zh: '"72小时打样"是华强北真实存在的产业能力,从设计到原型测试的最快周期。大疆早期原型机就是在此采购零件组装,华大基因早期也在华强北周边。这种速度源于一个街区容纳了从芯片到外壳的完整供应链,是数十年产业积累的不可复制的生态。', en: '"72-hour prototyping" is a real industrial capability in Huaqiangbei — the fastest cycle from design to prototype testing. DJI\'s early prototypes were built with parts sourced here; BGI also operated nearby. This speed stems from one block containing a complete supply chain from chip to case, an irreplicable ecosystem built over decades.' } },
        ],
      },
    ],
    reward: { badge: '🔌', badgeName: { zh: '硬件圣地印', en: 'Seal of the Hardware Mecca' }, insight: { zh: '1988年赛格电子市场开业,是华强北电子商圈的起点。此后二十年间,这片街区从电子元器件批发市场发展为全球硬件创新中心,被称为"中国硅谷"的硬件版。大疆早期原型机的零件在华强北采购组装,华大基因早期也在华强北周边办公。"72小时打样"——从设计到原型测试的最快周期——源于一个街区容纳了从芯片到外壳的完整供应链密度,全球任何其他城市需要数周。从一个卖电子元器件的批发市场,到全球硬件创业者必须朝圣的供应链圣地,华强北用二十年把"快"变成了一种不可复制的生态优势——当整个世界追逐软件速度时,这里证明了硬件也可以有闪电般的迭代节奏。', en: 'In 1988 SEG Electronics Market opened, marking the starting point of the Huaqiangbei electronics district. Over two decades, this block grew from a wholesale electronics components market into a global hardware innovation hub, called the hardware version of "China\'s Silicon Valley." DJI\'s early prototype parts were sourced and assembled here; BGI also operated near Huaqiangbei. "72-hour prototyping" — the fastest cycle from design to prototype testing — stems from one block containing a complete supply chain from chip to case; any other city in the world needs weeks. From a wholesale components market to a supply chain mecca that global hardware entrepreneurs must pilgrimage to, Huaqiangbei spent twenty years turning "speed" into an irreplicable ecological advantage — when the whole world chased software speed, it proved hardware can also iterate at lightning pace.' } },
  },

  // ============ N-SC02 腾讯滨海大厦（科学星火）============
  'N-SC02': {
    characters: [
      { name: { zh: '马化腾', en: 'Pony Ma' }, role: { zh: '腾讯创始人·CEO', en: 'Tencent Founder & CEO' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/c7f6d062-42e6-42eb-a2f3-73fd13717f00/image_1781684659_1_1.jpg' },
    ],
    intro: {
      zh: '1998年，你是深圳南山区科技园里一间小办公室的程序员。窗外是正在拔地而起的写字楼，桌上摆着一台奔III电脑。老板马化腾刚和几个伙伴凑了五十万，注册了一家叫"腾讯"的公司，做一款名叫OICQ的即时通讯软件。服务器天天报警，用户增长却停不下来。你盯着屏幕上不断跳动的在线人数，心里既兴奋又慌——这东西到底能不能赚钱，谁也说不准。',
      en: '1998. You are a programmer in a small office in Nanshan Science and Technology Park, Shenzhen. Cranes and half-built towers fill the view outside; on your desk sits a Pentium III. Your boss Pony Ma and a few partners scraped together 500,000 yuan to register a company called Tencent, building an instant messenger named OICQ. The servers crash daily, yet user numbers keep climbing. You stare at the online counter ticking upward — excited and nervous. Whether this thing can ever make money, nobody knows.',
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
      zh: '2006年，你跟着汪滔挤在深圳莲花村一间民房里。客厅就是车间，电烙铁、碳纤维管和飞控板铺了满桌。汪滔刚从中国香港科技大学毕业，导师李泽湘是机器人技术教授，鼓励他把毕业设计的直升机飞控做成产品。一月，第一台样品焊好了，团队只有四个人。窗外是城中村的嘈杂声，你低头调试飞控参数，手被焊锡烫了好几个泡——没人知道这间民房里会飞出什么。',
      en: '2006. You squeeze into a rented apartment in Lianhua Village, Shenzhen, with Frank Wang. The living room is the workshop: soldering irons, carbon fiber tubes and flight controller boards cover every surface. Wang just graduated from the Hong Kong University of Science and Technology; his advisor Li Zexiang, a robotics professor, encouraged him to turn his helicopter flight-control thesis into a product. In January, the first prototype is soldered together — the team is four people. Outside, the village hums with noise. You hunch over flight parameters, fingers blistered from solder burns. Nobody knows what will fly out of this apartment.',
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
      zh: '2023年4月27日，你是光明科学城合成生物研究大设施的一名青年研究员。搬迁车队缓缓驶入园区，同事们搬着仪器箱穿过崭新的走廊。你路过脑解析与脑模拟设施、材料基因组平台，这些2020年获批复的大装置总投资超过十六亿元。窗外，九个重大科技基础设施沿轴线串珠成链，五千多名科研人员已陆续入驻。你的导师说：这里不是闭门造塔，是面向全球开放共享的实验室。',
      en: 'April 27, 2023. You are a young researcher at the synthetic biology major facility in Guangming Science City. Moving trucks roll into the campus; colleagues carry instrument crates through fresh corridors. You pass the brain parsing and brain simulation facility, the materials genome platform — these major installations were approved in August 2020 with a total investment exceeding 1.6 billion yuan. Outside, nine major science facilities line the axis like beads on a string; over 5,000 researchers have moved in. Your advisor says: this is not a closed tower, but a laboratory open to the world.',
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
      zh: '你是1839年9月4日清晨的大鹏所城水兵。这座城建于明洪武二十七年,城墙高六米、长千余米,六百五十四个雉堞在晨雾中若隐若现。赖恩爵将军站在南门城楼上,海风灌满战袍,目光锁住九龙湾海面——英舰"路易莎"号正向中国师船开炮。他拔刀下令还击,水师师船借潮水逼近敌舰,炮声震得城墙发颤。鸦片战争的第一仗,就在今天打响。',
      en: 'You are a sailor at Dapeng Fortress on the morning of September 4, 1839. Built in 1394, the walls stand six meters high, their 654 battlements barely visible in the dawn mist. General Lai Enjue stands on the south gate tower, robes whipping in the sea wind, eyes fixed on Kowloon Bay — the British warship "Louisa" is firing on Chinese patrol boats. He draws his sword and orders a counterattack. The first battle of the Opium War begins today.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '1839年9月4日九龙海战中,赖恩爵指挥的大鹏水师面对英舰,实际战况如何?', en: 'In the Sept 4, 1839 Battle of Kowloon, how did Lai Enjue\'s Dapeng navy actually fare against the British fleet?' },
        options: [
          { text: { zh: '以师船近距离接战逼退英舰,英方"路易莎"号等撤走,中方取得首战胜利', en: 'Patrol boats engaged at close range, forcing the British "Louisa" to withdraw — China won the first engagement' }, correct: true, feedback: { zh: '1839年9月4日下午,赖恩爵率水师师船在九龙湾炮击英舰,激战数小时后"路易莎"号主帆被打断、仓皇撤走。道光帝闻捷赐赖恩爵"呼尔察图巴图鲁"称号——这是鸦片战争中中国军队打的第一仗,也是打胜的第一仗。', en: 'On the afternoon of Sept 4, 1839, Lai\'s patrol boats engaged British ships in Kowloon Bay. After hours of fighting, the "Louisa" lost its mainsail and fled. Emperor Daoguang granted Lai the title "Hurchatu Baturu" — this was the Opium War\'s first battle and first Chinese victory.' } },
          { text: { zh: '英舰火力碾压,大鹏水师当天即全军覆没', en: 'British firepower crushed the Dapeng navy, which was annihilated that day' }, correct: false, feedback: { zh: '事实恰恰相反。当天英方仅以"路易莎"号等数艘船参战,火力并未形成压倒优势;赖恩爵的水师以师船群抵近射击,将其逼退。若当天真全军覆没,道光帝不可能赐赖恩爵"巴图鲁"勇士号。', en: 'The opposite. The British deployed only a few ships including the "Louisa," without overwhelming firepower. Lai\'s patrol boats closed in and forced their withdrawal. Had the navy been annihilated, Daoguang would not have awarded Lai the "Baturu" warrior title.' } },
        ],
      },
      {
        q: { zh: '深圳别称"鹏城",这个名字的历史来源是什么?', en: 'Shenzhen\'s nickname "Peng Cheng" — where does it come from?' },
        options: [
          { text: { zh: '源自明洪武二十七年所建的大鹏守御千户所城,简称大鹏所城', en: 'From the Dapeng Garrison City built in 1394, abbreviated as "Dapeng"' }, correct: true, feedback: { zh: '明洪武二十七年(1394年),朝廷在今深圳大鹏半岛筑"大鹏守御千户所城",城墙高六米、长一千二百米。这座所城是明清两代南海海防要塞,后来深圳别称"鹏城"便由此而来——一座军事堡垒的名字,成了整座城市的名片。', en: 'In 1394, the Ming court built the "Dapeng Garrison City" on the Dapeng Peninsula — walls six meters high, 1,200 meters long. This fortress guarded the South China Sea for two dynasties. Shenzhen\'s nickname "Peng Cheng" (City of the Peng) derives directly from it — a military fort\'s name became a city\'s identity.' } },
          { text: { zh: '因为深圳有大鹏鸟栖息,故而得名', en: 'Because the mythic Peng bird nested in Shenzhen' }, correct: false, feedback: { zh: '"鹏城"和神鸟大鹏没有直接关系。这个名字的历史根据是1394年修建的大鹏守御千户所城——一座实打实的军事要塞,而非神话传说。赖恩爵"三代五将"的家族就驻守在这座城中,时人称"宋有杨家将,清有赖家帮"。', en: 'The name has no direct link to the mythic Peng bird. Its basis is the 1394 Dapeng Garrison — a real military fortress, not a legend. Lai Enjue\'s family of "five generals across three generations" garrisoned this very city, earning the saying "The Song had the Yang family generals, the Qing had the Lai family."' } },
        ],
      },
    ],
    reward: { badge: '⚔️', badgeName: { zh: '鹏城铁骨印', en: 'Seal of Peng Cheng\'s Iron Spirit' }, insight: { zh: '1394年明朝筑大鹏所城,城墙高六米,六百五十四个雉堞守望南海。四百四十五年后的1839年,赖恩爵在这片海面打赢了鸦片战争第一仗,获赐"呼尔察图巴图鲁"勇士号。他临终前不提家事,只说恨未能收回香港岛。赖家"三代五将"驻守大鹏,时人称"宋有杨家将,清有赖家帮"。这座所城的名字"鹏",后来成了整座深圳的别称——从海防要塞到改革窗口,"鹏城"二字背后是六百年不曾断过的骨气。', en: 'In 1394, the Ming built Dapeng Garrison — walls six meters high, 654 battlements watching the South China Sea. 445 years later in 1839, Lai Enjue won the Opium War\'s first battle here, earning the title "Hurchatu Baturu." On his deathbed he spoke of no family matter, only his regret at not recovering Hong Kong Island. The Lai family\'s "five generals across three generations" garrisoned Dapeng — "The Song had the Yang generals, the Qing had the Lai." The fort\'s name "Peng" became Shenzhen\'s nickname: 600 years of unbroken backbone.' } },
  },

  // ============ M05 中英街（觉醒主题）============
  M05: {
    characters: [
      { name: { zh: '界碑见证者', en: 'Boundary Witness' }, role: { zh: '百年沧桑的讲述者', en: 'Narrator of a Century\'s Changes' }, portrait: '' },
    ],
    intro: {
      zh: '你是1899年春天的一名勘界随员，跟随中方定界委员王存善从梧桐山脚来到沙头角。一条干涸的河道上，工人正竖起木质界桩，上书"大清国新安县界"。界桩以东属华界，以西将被英国租借九十九年。你低头看着脚下这条即将被界碑一分为二的小路，空气中弥漫着初春的潮湿气息——它还不知道，自己将承载一个世纪的分离与重逢，直到1997年中国香港回归的那一夜。',
      en: 'Spring 1899. You are a survey aide following Chinese boundary commissioner Wang Cunshan to Shatoukok. On a dried riverbed, workers drive wooden markers inscribed "Great Qing Xin\'an County Boundary." East is Chinese territory; west will be leased to Britain for ninety-nine years. You look down at the path about to be split in two — it does not yet know it will carry a century of separation and reunion, until the night Hong Kong, China returns in 1997.',
    },
    scenes: [
      {
        q: { zh: '1898年清政府与英国签订的条约叫什么名字？它直接导致了中英街的形成。', en: 'What treaty did the Qing government sign with Britain in 1898 that led to the formation of Zhongying Street?' },
        options: [
          { text: { zh: '《展拓香港界址专条》——英国据此强租新界，租期九十九年', en: 'The Convention for the Extension of Hong Kong Territory — Britain leased the New Territories for 99 years' }, correct: true, feedback: { zh: '1898年6月9日，清政府与英国签订《展拓香港界址专条》，英国强租深圳河以南、九龙界限街以北的土地及230多个岛屿，统称"新界"，租期九十九年。1899年双方勘界时在沙头角干涸河道上竖立界桩，河道东侧为华界、西侧为英界，中英街由此形成。', en: 'On June 9, 1898, the Qing and Britain signed the Convention, leasing the New Territories for 99 years. The 1899 boundary survey placed markers on a dried riverbed at Shatoukok — east was Chinese, west British — giving rise to Zhongying Street.' } },
          { text: { zh: '《南京条约》——割让香港岛', en: 'The Treaty of Nanking — ceding Hong Kong Island' }, correct: false, feedback: { zh: '《南京条约》签订于1842年，割让的是香港岛，与中英街的形成无关。导致中英街出现的是1898年的《展拓香港界址专条》，该条约为英国强租新界提供了法律依据。', en: 'The Treaty of Nanking (1842) ceded Hong Kong Island, unrelated to Zhongying Street. The street formed from the 1898 Convention for the Extension of Hong Kong Territory, which leased the New Territories.' } },
        ],
      },
      {
        q: { zh: '1997年中国香港回归后，中英街的界碑被如何处置？', en: 'After Hong Kong, China\'s return in 1997, what happened to the boundary stones on Zhongying Street?' },
        options: [
          { text: { zh: '界碑被保留并列为文物保护单位，成为"一国两制"的微观缩影', en: 'The stones were preserved as protected cultural relics, a microcosm of "One Country, Two Systems"' }, correct: true, feedback: { zh: '1997年回归后，街东侧属深圳盐田区，西侧属中国香港北区，界碑仍立于街中央。这些界碑是国家级文物保护单位，中英街也因此成为"一国两制"在一条街上的微观缩影。', en: 'After the 1997 return, the east side belongs to Shenzhen Yantian District, the west to Hong Kong, China North District. The stones remain and are nationally protected relics — the street is a microcosm of "One Country, Two Systems."' } },
          { text: { zh: '界碑在回归当日被全部拆除', en: 'All boundary stones were demolished on the day of return' }, correct: false, feedback: { zh: '界碑并未被拆除。相反，它们被作为历史见证刻意保留。中英街的界碑从1905年港英政府将木质界桩改为石质界碑算起，已逾百年，至今仍立于街心。', en: 'The stones were not removed. They were deliberately preserved as historical witnesses. The granite stones date from 1905 when the Hong Kong colonial government replaced wooden markers, and still stand today.' } },
        ],
      },
    ],
    reward: { badge: '🪨', badgeName: { zh: '界碑铭记印', en: 'Seal of the Boundary Stone' }, insight: { zh: '1898年《展拓香港界址专条》签订，英国强租新界九十九年。1899年中英双方在沙头角干涸河道上勘界竖桩，河道东侧为华界、西侧为英界，这条小路遂成"中英街"。1905年港英政府将木质界桩改为石质界碑，界碑上刻"光绪二十四年中英地界第×号"。1997年中国香港回归后，界碑未被拆除，反而作为历史见证被保留并列为文物保护单位。一条仅二百五十米长、三四米宽的街道，东侧属深圳盐田区，西侧属中国香港北区，成为"一国两制"最直观的微观缩影。', en: 'The 1898 Convention for the Extension of Hong Kong Territory leased the New Territories for 99 years. In 1899, Qing and British surveyors placed markers on a dried riverbed at Shatoukok — east was Chinese, west British — creating Zhongying Street. In 1905 the colonial government replaced wooden markers with granite stones inscribed "1898 Sino-British Boundary No. ×." After Hong Kong, China\'s 1997 return, the stones were preserved as protected cultural relics. A street just 250 meters long and 3–4 meters wide, with Shenzhen Yantian District to the east and Hong Kong, China North District to the west, remains the most vivid microcosm of "One Country, Two Systems."' } },
  },

  // ============ M11 莲花山（觉醒主题）============
  M11: {
    characters: [
      { name: { zh: '邓小平', en: 'Deng Xiaoping' }, role: { zh: '改革开放总设计师', en: 'Chief Architect of Reform' }, portrait: 'https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/ab7d0f27-b05b-4c6b-91ff-ada347380add/image_1781684656_1_1.jpg' },
    ],
    intro: {
      zh: '你是2000年11月14日莲花山公园山顶广场上的一名雕塑助手。今天，全国第一座经中央批准、以城市雕塑形式竖立的邓小平铜像将在此揭幕，纪念深圳经济特区成立二十周年。铜像高六米，重六吨，硅青铜材质，塑造的是小平同志身披风衣、大步向前的形象。雕塑家滕文金历时七年完成这尊作品。你站在铜像旁，远处的福田CBD天际线在秋日阳光下闪烁——八年前，1992年春天，就是这位老人在深圳发表了南方谈话，说了那句"深圳的发展和经验证明，我们建立经济特区的政策是正确的"。',
      en: 'November 14, 2000. You are a sculptor\'s assistant at the Lianhua Mountain Park summit plaza. Today, China\'s first central-government-approved urban sculpture of Deng Xiaoping will be unveiled, marking the Shenzhen SEZ\'s 20th anniversary. The bronze figure stands 6 meters tall, 6 tons, in silicon bronze — Deng in a windbreaker, striding forward. Sculptor Teng Wenjin spent seven years on it. Beside the statue, the Futian CBD skyline glitters in autumn sun. Eight years earlier, in spring 1992, this man delivered the Southern Tour speeches in Shenzhen, declaring: "Shenzhen\'s development proves our SEZ policy was correct."',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '邓小平南方谈话发表于哪一年？它对深圳改革开放产生了什么影响？', en: 'In which year did Deng Xiaoping deliver his Southern Tour speeches, and what impact did they have on Shenzhen\'s reform?' },
        options: [
          { text: { zh: '1992年——南方谈话巩固了经济特区政策，打消了"姓资姓社"的争议', en: '1992 — the Southern Tour cemented SEZ policy and dispelled the "capitalist or socialist" debate' }, correct: true, feedback: { zh: '1992年1月至2月，邓小平视察深圳等地并发表南方谈话。他在深圳国贸大厦指出"深圳的发展和经验证明，我们建立经济特区的政策是正确的"。南方谈话回应了当时关于改革方向"姓资还是姓社"的争论，坚定了改革开放路线，使特区政策得以延续并扩展到更多城市。', en: 'In January–February 1992, Deng toured Shenzhen and delivered the Southern Tour speeches. At the Guomao building he declared: "Shenzhen\'s development proves our SEZ policy was correct." The speeches resolved the "capitalist or socialist" debate, cementing Reform and Opening and extending SEZ policy to more cities.' } },
          { text: { zh: '1984年——随第一次视察深圳同步发表', en: '1984 — delivered during his first Shenzhen visit' }, correct: false, feedback: { zh: '邓小平确实在1984年视察过深圳并题词"深圳的发展和经验证明，我们建立经济特区的政策是正确的"，但"南方谈话"特指1992年的视察。1992年的南方谈话影响更为深远，它回应了改革停滞的倾向，是改革开放进程中的关键转折点。', en: 'Deng did visit Shenzhen in 1984 and wrote that inscription, but the "Southern Tour speeches" specifically refer to his 1992 visit. The 1992 speeches had far greater impact, countering reform stagnation and marking a pivotal turning point.' } },
        ],
      },
      {
        speaker: 0,
        q: { zh: '莲花山邓小平铜像是哪一年落成的？它有什么特殊地位？', en: 'In which year was the Deng Xiaoping bronze statue on Lianhua Mountain unveiled, and what is its special significance?' },
        options: [
          { text: { zh: '2000年11月14日——全国第一座经中央批准的城市雕塑形式邓小平铜像', en: 'November 14, 2000 — China\'s first central-government-approved urban sculpture of Deng Xiaoping' }, correct: true, feedback: { zh: '2000年11月14日，深圳经济特区成立二十周年之际，邓小平铜像在莲花山公园山顶广场揭幕，江泽民为铜像揭幕。铜像高六米，硅青铜材质，由雕塑家滕文金历时七年完成，塑造的是小平同志身披风衣大步向前的形象。底座背面刻有邓小平1984年题词。这是全国第一座经中央批准以城市雕塑形式竖立的邓小平铜像。', en: 'On November 14, 2000, marking the Shenzhen SEZ\'s 20th anniversary, the Deng Xiaoping bronze was unveiled at Lianhua Mountain Park summit plaza by Jiang Zemin. Standing 6 meters in silicon bronze, sculpted by Teng Wenjin over seven years, it depicts Deng in a windbreaker striding forward. The base bears his 1984 inscription. It is China\'s first central-government-approved urban sculpture of Deng.' } },
          { text: { zh: '1992年——随南方谈话同步落成', en: '1992 — unveiled simultaneously with the Southern Tour' }, correct: false, feedback: { zh: '铜像落成于2000年而非1992年。1992年南方谈话后，深圳在深南大道上竖立过邓小平画像，但那只是铁皮油漆画像。铜像的筹建始于1994年，经八次选址最终定在莲花山，2000年特区成立二十周年时落成。', en: 'The bronze was unveiled in 2000, not 1992. After the 1992 Southern Tour, Shenzhen put up a painted iron-sheet portrait on Shennan Avenue, but the bronze statue\'s planning began in 1994, with eight site selections before Lianhua Mountain was chosen, unveiled for the SEZ\'s 20th anniversary in 2000.' } },
        ],
      },
    ],
    reward: { badge: '⭕', badgeName: { zh: '画圈改革印', en: 'Seal of the Circle of Reform' }, insight: { zh: '1992年1月至2月，邓小平视察深圳等地发表南方谈话，在国贸大厦指出"深圳的发展和经验证明，我们建立经济特区的政策是正确的"，回应了"姓资姓社"的争论，坚定了改革开放方向。2000年11月14日，深圳经济特区成立二十周年之际，全国第一座经中央批准以城市雕塑形式竖立的邓小平铜像在莲花山公园山顶广场揭幕。铜像高六米、硅青铜材质，由雕塑家滕文金历时七年完成，塑造小平同志身披风衣大步向前的形象，底座背面刻有其1984年题词。莲花山公园位于深圳市区中轴线上，铜像与市民广场呈一条中轴线，如今已成为深圳最重要的城市地标之一。', en: 'In January–February 1992, Deng Xiaoping delivered the Southern Tour speeches in Shenzhen, declaring at the Guomao building: "Shenzhen\'s development proves our SEZ policy was correct," resolving the "capitalist or socialist" debate and cementing Reform. On November 14, 2000, marking the SEZ\'s 20th anniversary, China\'s first central-government-approved urban sculpture of Deng was unveiled at Lianhua Mountain Park summit plaza. The 6-meter silicon bronze statue, sculpted by Teng Wenjin over seven years, depicts Deng in a windbreaker striding forward, with his 1984 inscription on the base. Lianhua Mountain Park sits on Shenzhen\'s central axis; the statue aligns with Civic Plaza and is now the city\'s most iconic landmark.' } },
  },

  // ============ N-AW01 沙井蚝文化园（风味民俗与城市生活）============
  'N-AW01': {
    characters: [
      { name: { zh: '蚝民长老', en: 'Oyster Elder' }, role: { zh: '千年蚝乡传承人', en: 'Millennium Oyster Heritage Keeper' }, portrait: '' },
    ],
    intro: {
      zh: '宋代熙宁年间，你是沙井海边一户蚝民的幼子。父亲带你在退潮的滩涂上插竹竿，蚝苗附着竹面生长。珠江口的咸淡水在这里交汇，你尝了一口海水——不全是咸的，带一丝回甘。父亲说：这片水养出的蚝，别处比不了。九百多年后，这里的人仍在养蚝。',
      en: 'circa 1070, Northern Song. You are the young son of a Shajing oyster farmer. At low tide your father has you drive bamboo poles into the mudflat; oyster spat clings to the bamboo and grows. The Pearl River meets the sea here — you taste the water: not fully salty, with a faint sweetness. \"Oysters from this water cannot be matched elsewhere,\" he says. Over nine hundred years later, people here still farm oysters.',
    },
    scenes: [
      {
        q: { zh: '沙井养蚝的历史最早可以追溯到哪个朝代？', en: 'Shajing oyster farming dates back to which dynasty?' },
        options: [
          { text: { zh: '宋代，距今约一千年', en: 'Song Dynasty, about 1,000 years ago' }, correct: true, feedback: { zh: '对。沙井养蚝的记载可追溯至宋代。蚝民在珠江口咸淡水交汇处插竹养蚝，退潮时收割，这套方法延续了近千年。沙井蚝后来成为国家地理标志产品。', en: 'Correct. Records of Shajing oyster farming go back to the Song Dynasty. Farmers drove bamboo poles into the brackish estuary, harvesting at low tide — a method lasting nearly a millennium. Shajing oysters later became a national geographical-indication product.' } },
          { text: { zh: '明代，距今约五百年', en: 'Ming Dynasty, about 500 years ago' }, correct: false, feedback: { zh: '时间偏晚。宋代的沙井蚝民已经在珠江口插竹养蚝了。明清华南蚝业进一步扩大，但起点远在宋代。', en: 'Too late. Song Dynasty farmers were already cultivating oysters on bamboo in the Pearl River estuary. The industry expanded in Ming-Qing, but its origin lies in the Song.' } },
        ],
      },
      {
        q: { zh: '1888年，李锦裳在珠海发明了蚝油。这件事和沙井蚝有什么关系？', en: 'In 1888 Lee Kum Sheung invented oyster sauce in Zhuhai. How does this relate to Shajing oysters?' },
        options: [
          { text: { zh: '蚝油的原材料就是珠江口一带养殖的蚝，沙井是这一带最著名的蚝乡', en: 'Oyster sauce is made from Pearl River estuary oysters, and Shajing is the most famous oyster village in this area' }, correct: true, feedback: { zh: '对。李锦裳在珠海煮蚝时偶然熬出浓稠酱汁，这就是蚝油的起源。珠江口咸淡水交汇的环境养出的蚝，鲜味浓郁，正是蚝油风味的根基。李锦记后来将工厂迁至中国香港，蚝油行销全球。', en: 'Correct. Lee Kum Sheung accidentally overcooked oysters in Zhuhai and produced a thick savory sauce — the origin of oyster sauce. The brackish Pearl River estuary yields intensely flavorful oysters, the foundation of that taste. Lee Kum Kee later moved its factory to Hong Kong, China, and oyster sauce went global.' } },
          { text: { zh: '没有关系，蚝油是用化学原料合成的', en: 'No relation; oyster sauce is synthetically made from chemicals' }, correct: false, feedback: { zh: '并非如此。蚝油最初就是煮蚝后留下的浓缩汁液。珠江口蚝乡的养殖传统，正是蚝油诞生的物质基础。', en: 'Not so. Oyster sauce originated as concentrated liquid left from boiling oysters. The estuary oyster-farming tradition was the material basis for its invention.' } },
        ],
      },
    ],
    reward: { badge: '🦪', badgeName: { zh: '千年蚝乡印', en: 'Seal of the Millennium Oyster Shore' }, insight: { zh: '沙井蚝民从宋代起在珠江口插竹养蚝，咸淡水的交汇造就了无可替代的鲜味。1888年李锦裳在这片水域边偶然熬出蚝油，一种地方食材就此变成行销全球的调味品。千年养蚝史不是静止的传统，而是一条从滩涂竹竿到世界厨房的因果链。', en: 'Shajing farmers have cultivated oysters on bamboo in the Pearl River estuary since the Song Dynasty; the brackish water creates an irreplaceable flavor. In 1888 Lee Kum Sheung accidentally reduced that local ingredient into oyster sauce, turning a village product into a global condiment. A millennium of oyster farming is not a static tradition but a chain running from mudflat poles to kitchens worldwide.' } },
  },

  // ============ N-AW02 深井烧鹅（风味民俗与城市生活）============
  'N-AW02': {
    characters: [
      { name: { zh: '烧腊师傅', en: 'BBQ Master' }, role: { zh: '三代传承的烧鹅匠人', en: 'Third-generation Roast Goose Artisan' }, portrait: '' },
    ],
    intro: {
      zh: '凌晨四点，中国香港荃湾深井村。你是烧腊师傅的学徒，师父正在给鹅身上刷皮水——蜂蜜、白醋、麦芽糖按比例调匀，刷完挂在通风处风干。他指着院子里一口老井说：深井这名字，就是从这口深水井来的。但烧鹅做法恰好也叫"深井"，用的是密封炉先蒸后烤，纯属巧合。',
      en: '4 AM, Sham Tseng village, Tsuen Wan, Hong Kong China. You are an apprentice to a roast-meat master. He is brushing \"skin water\" — honey, vinegar, and malt sugar in set proportions — onto a goose, then hanging it to air-dry. He points to an old well in the yard: \"Sham Tseng means \'deep well,\' named after this well. But the roasting method is also called \'sham tseng\' — sealed oven, steam then roast. Pure coincidence.\"',
    },
    scenes: [
      {
        q: { zh: '深井烧鹅的"深井"指的是什么？', en: 'What does "Sham Tseng" (deep well) refer to in Sham Tseng roast goose?' },
        options: [
          { text: { zh: '深井是地名，指荃湾深井村，得名于一口深水井；烧鹅做法恰好也叫"深井"（密封炉），纯属巧合', en: 'Sham Tseng is a place name — a village in Tsuen Wan named after a deep well; the roasting method is coincidentally also called "sham tseng" (sealed oven)' }, correct: true, feedback: { zh: '对。深井是荃湾的一个村落，因一口深水井得名。当地烧鹅用特制密封炉"先蒸后烤"，这种做法也叫"深井"——地名与做法的巧合，让深井烧鹅的名字自带双关。', en: 'Correct. Sham Tseng is a village in Tsuen Wan, named after a deep water well. The local roast goose uses a custom sealed oven that steams then roasts — a method also called "sham tseng." The coincidence makes the name a natural pun.' } },
          { text: { zh: '深井就是指烧鹅的密封炉做法，跟地名无关', en: 'Sham Tseng only refers to the sealed-oven method, unrelated to the place name' }, correct: false, feedback: { zh: '不完全准确。深井首先是地名——荃湾深井村，因一口深水井得名。密封炉"先蒸后烤"的做法恰好也叫"深井"，两者是巧合关系，不是同一来源。', en: 'Not fully accurate. Sham Tseng is first a place — the village in Tsuen Wan named after a deep well. The sealed-oven method is coincidentally also called "sham tseng"; the two are a coincidence, not the same origin.' } },
        ],
      },
      {
        q: { zh: '深井烧鹅"先蒸后烤"的密封炉做法，关键原理是什么？', en: 'What is the key principle of the sealed-oven "steam then roast" method?' },
        options: [
          { text: { zh: '密封炉让鹅自身的水分和油脂蒸汽在炉内循环，先把肉焖嫩，再开炉高温烤脆外皮', en: 'The sealed oven traps the goose\'s own moisture and fat steam inside, first tenderizing the meat, then opening for high heat to crisp the skin' }, correct: true, feedback: { zh: '对。封炉后水蒸气无法逸出，鹅肉在自身蒸汽中被焖至软嫩；随后开炉加大火力，把外皮烤至金红酥脆。先蒸后烤是深井烧鹅区别于普通明火烤鹅的核心技艺。', en: 'Correct. Once sealed, steam cannot escape; the goose steams in its own vapor until tender, then the oven is opened for high heat to crisp the skin golden-red. Steam-then-roast is the core technique distinguishing Sham Tseng goose from ordinary open-fire roasting.' } },
          { text: { zh: '就是用大火一直烤到熟', en: 'Just roast over high fire until done' }, correct: false, feedback: { zh: '明火直烤容易外焦内柴。深井烧鹅的密封炉先利用蒸汽把肉蒸熟焖嫩，再烤脆外皮，这样才能同时做到皮脆和肉嫩。', en: 'Direct open fire tends to char the outside while drying the inside. The sealed oven first steams the meat tender with trapped vapor, then crisps the skin — that is how both crisp skin and tender meat are achieved at once.' } },
        ],
      },
    ],
    reward: { badge: '🍗', badgeName: { zh: '烧鹅封神印', en: 'Seal of the Divine Roast Goose' }, insight: { zh: '深井烧鹅的故事从一口深水井开始：荃湾深井村因井得名，当地烧腊师傅发明了密封炉先蒸后烤的做法，做法之名恰好与地名重合。先蒸后烤让鹅肉在自身蒸汽中焖嫩、再经高温烤脆外皮，一道菜同时实现了矛盾的口感。如今深井是中国香港最知名的烧鹅产地，多家餐厅获米其林推荐。地名、工艺与口碑三条线交汇，让一个村落的名字变成了一种烹饪标准。', en: 'The story of Sham Tseng roast goose begins with a deep well: the Tsuen Wan village took its name from the well, local roast-meat masters invented the sealed-oven steam-then-roast method, and the method\'s name coincides with the place name. Steaming first tenderizes the meat in its own vapor; high heat then crisps the skin — one dish achieving contradictory textures. Today Sham Tseng is the most famous roast goose destination in Hong Kong China, with multiple Michelin-recommended restaurants. Place, craft, and reputation converge, turning a village name into a culinary standard.' } },
  },

  // ============ N-AW03 顺德·粤菜宗师之乡（风味民俗与城市生活）============
  'N-AW03': {
    characters: [
      { name: { zh: '粤厨宗师', en: 'Cantonese Grand Chef' }, role: { zh: '顺德凤城菜传人', en: 'Shunde Fengcheng Cuisine Heir' }, portrait: '' },
    ],
    intro: {
      zh: '2014年，顺德被联合国教科文组织授予"世界美食之都"称号。你是大良凤城一位粤菜师傅的学徒，清晨跟随师父去均安看整猪蒸制——一头猪摊开在铁架上，抹满盐和香料，放入大蒸笼。蒸汽弥漫，肉香混着柴火气。师父说：顺德菜就五个字——清、鲜、爽、嫩、滑。均安蒸猪、双皮奶、炒牛奶、鱼生，全靠这五个字撑着。',
      en: 'In 2014, UNESCO named Shunde a "City of Gastronomy." You are an apprentice to a Cantonese chef in Daliang, the old town also called Fengcheng — "Phoenix City." At dawn you follow your master to Jun\'an to watch a whole pig steamed on an iron rack, rubbed with salt and spices, lowered into a great steamer. Steam fills the air, pork aroma mingling with wood smoke. "Shunde cooking is five words," he says: "clean, fresh, crisp, tender, smooth. Jun\'an steamed pig, double-skin milk, stir-fried milk, raw fish — all rest on those five."',
    },
    scenes: [
      {
        q: { zh: '"厨出凤城"中的"凤城"指的是哪里？', en: 'In the saying "chefs come from Fengcheng," what place is Fengcheng?' },
        options: [
          { text: { zh: '顺德大良，古称凤城，是粤菜厨师之乡', en: 'Daliang in Shunde, anciently called Fengcheng (Phoenix City), is the homeland of Cantonese chefs' }, correct: true, feedback: { zh: '对。顺德大良古称凤城，"厨出凤城"说的是顺德出产粤菜厨师。顺德菜讲究清、鲜、爽、嫩、滑，名菜包括均安蒸猪、双皮奶、炒牛奶、鱼生等。', en: 'Correct. Daliang in Shunde was anciently called Fengcheng; "chefs come from Fengcheng" means Shunde produces Cantonese chefs. Shunde cuisine pursues clean, fresh, crisp, tender, and smooth textures. Signature dishes include Jun\'an steamed pig, double-skin milk, stir-fried milk, and raw fish.' } },
          { text: { zh: '广州，因为广州是粤菜中心', en: 'Guangzhou, because it is the center of Cantonese cuisine' }, correct: false, feedback: { zh: '凤城指的是顺德大良，不是广州。"食在广州"说的是广州集大成，"厨出凤城"说的是顺德出厨师——两句话各有所指。', en: 'Fengcheng refers to Daliang in Shunde, not Guangzhou. "Eat in Guangzhou" praises the city\'s synthesis; "chefs from Fengcheng" credits Shunde as the source of chefs — two different claims.' } },
        ],
      },
      {
        q: { zh: '顺德在2014年获得了联合国教科文组织的什么称号？', en: 'What UNESCO title did Shunde receive in 2014?' },
        options: [
          { text: { zh: '"世界美食之都"（UNESCO创意城市网络·美食之都）', en: '"City of Gastronomy" (UNESCO Creative Cities Network)' }, correct: true, feedback: { zh: '对。2014年顺德被联合国教科文组织授予"世界美食之都"称号，是中国第二个获此认定的城市。顺德的均安蒸猪、双皮奶、炒牛奶、鱼生等菜肴，以及"清、鲜、爽、嫩、滑"的烹饪理念，是获评的重要依据。', en: 'Correct. In 2014, UNESCO designated Shunde a "City of Gastronomy" — the second Chinese city to receive the title. Dishes such as Jun\'an steamed pig, double-skin milk, stir-fried milk, and raw fish, along with the culinary philosophy of "clean, fresh, crisp, tender, smooth," were key bases for the designation.' } },
          { text: { zh: '"世界文化遗产"', en: '"World Cultural Heritage"' }, correct: false, feedback: { zh: '称号是"世界美食之都"，属于联合国教科文组织"创意城市网络"项目，不是"世界文化遗产"名录。两者是不同的 UNESCO 认定体系。', en: 'The title is "City of Gastronomy," part of the UNESCO Creative Cities Network — not the World Heritage List. These are two separate UNESCO programs.' } },
        ],
      },
    ],
    reward: { badge: '🥢', badgeName: { zh: '粤厨宗师印', en: 'Seal of the Cantonese Grand Master' }, insight: { zh: '顺德大良古称凤城，"厨出凤城"说明这里是粤菜厨师的源头。顺德菜以清、鲜、爽、嫩、滑为准则，均安蒸猪、双皮奶、炒牛奶、鱼生都是这套理念的具体呈现。2014年联合国教科文组织授予顺德"世界美食之都"称号，把一个县域的烹饪传统放进了全球文化版图。从师傅手艺到国际认证，因果关系很清楚：数百年积累的烹饪方法论，让一个地方获得了世界级的身份。', en: 'Daliang in Shunde, anciently called Fengcheng, is the source of Cantonese chefs — "chefs come from Fengcheng." Shunde cuisine follows five principles: clean, fresh, crisp, tender, smooth — embodied in Jun\'an steamed pig, double-skin milk, stir-fried milk, and raw fish. In 2014, UNESCO granted Shunde the title "City of Gastronomy," placing a county-level culinary tradition onto the global cultural map. From masters\' craft to international recognition, the causal chain is clear: centuries of accumulated culinary methodology earned a place its world-class identity.' } },
  },

  // ============ N-AW04 盆菜文化发源地·元朗（风味民俗与城市生活）============
  'N-AW04': {
    characters: [
      { name: { zh: '围村族长', en: 'Walled Village Elder' }, role: { zh: '元朗围村盆菜传承人', en: 'Yuen Long Poon Choi Keeper' }, portrait: '' },
    ],
    intro: {
      zh: '1279年，南宋末帝赵昺南逃，途经中国香港新界。你是元朗围村的一名年轻妇人，村里突然涌来一群饥疲交加的皇室随从。族长召集全村：把所有能找到的食材凑在一起！但碗碟不够——只有洗衣用的大木盆。萝卜铺底，猪肉、虾、鸡层层叠上，一盆菜端上了桌。七百多年后，围村人仍在宗族节庆时做盆菜。',
      en: '1279. The last Song emperor flees south through Hong Kong China\'s New Territories. You are a young woman in a Yuen Long walled village when starving imperial retainers suddenly arrive. The clan elder calls everyone: gather whatever food can be found! But there are not enough bowls — only large wooden washing basins. Radish lines the bottom; pork, shrimp, and chicken are layered on top. One basin goes to the table. Over seven hundred years later, walled village families still make poon choi at clan festivals.',
    },
    scenes: [
      {
        q: { zh: '盆菜的层叠结构有什么讲究？', en: 'What is the logic behind poon choi\'s layered structure?' },
        options: [
          { text: { zh: '萝卜等耐煮食材垫底吸收汤汁，肉类和海鲜放在上层，既保口感又合礼序', en: 'Durable ingredients like radish go on the bottom to absorb broth; meat and seafood sit on top — both for texture and ritual order' }, correct: true, feedback: { zh: '对。盆菜讲究层叠：萝卜、猪皮等耐煮的垫底，吸收上层渗下的汤汁越煮越入味；虾、鸡、鲍等放在上层，保持鲜嫩。层叠既是烹饪需要，也对应围村宴席中的长幼礼序。', en: 'Correct. Poon choi is layered: radish and pork skin at the bottom absorb juices from above and grow more flavorful; shrimp, chicken, and abalone on top stay fresh and tender. The layering serves both cooking needs and the ritual hierarchy of walled village banquets.' } },
          { text: { zh: '没有讲究，所有食材随便扔进盆里就行', en: 'No logic; just throw everything into the basin randomly' }, correct: false, feedback: { zh: '并非随意。盆菜的层叠顺序是围村数百年实践总结：底层放耐煮吸味的，上层放易熟保嫩的。位置经过考量，不是随手堆放。', en: 'Not random. The layering order reflects centuries of walled village practice: durable, juice-absorbing items at the bottom; quick-cooking, tender items on top. Positions are deliberate, not casual.' } },
        ],
      },
      {
        q: { zh: '盆菜起源于哪个历史事件？', en: 'What historical event is poon choi said to originate from?' },
        options: [
          { text: { zh: '1279年南宋末年，相传与帝昺流亡至香港新界有关', en: '1279, the end of the Southern Song, associated with the last emperor\'s flight to Hong Kong\'s New Territories' }, correct: true, feedback: { zh: '对。相传1279年南宋末帝赵昺南逃至新界，围村村民用木盆盛装各种食材招待随从，盆菜由此而来。元朗是香港新界围村盆菜的代表地区，客家族群在宗族节庆时制作盆菜的传统延续至今。', en: 'Correct. Legend says that in 1279 the last Song emperor Zhao Bing fled to the New Territories; walled village residents used wooden basins to serve assembled ingredients to his retinue, giving rise to poon choi. Yuen Long is the representative area for New Territories walled village poon choi, where Hakka communities still make it at clan festivals.' } },
          { text: { zh: '清代乾隆年间的宫廷宴席', en: 'A court banquet during the Qianlong reign of the Qing Dynasty' }, correct: false, feedback: { zh: '时间偏晚。盆菜相传起源于1279年南宋末年，与帝昺流亡新界的传说有关，比清代早了近四百年。', en: 'Too late. Poon choi is said to originate in 1279 at the end of the Southern Song, linked to the last emperor\'s flight to the New Territories — nearly four centuries before the Qing.' } },
        ],
      },
    ],
    reward: { badge: '🍲', badgeName: { zh: '盆菜团圆印', en: 'Seal of the Reunion Feast' }, insight: { zh: '盆菜相传起源于1279年南宋末年帝昺流亡新界，围村村民以木盆盛菜招待随从。从此，中国香港新界围村的客家族群在宗族节庆时制作盆菜，萝卜垫底、肉菜层叠，口味和礼序同在一盆。元朗是围村盆菜的代表地区，一盆菜把迁徙记忆、宗族认同和团圆仪式叠在一起，七百年没有散。', en: 'Poon choi is said to originate in 1279 when the last Song emperor fled to the New Territories and walled village residents served assembled food in wooden basins to his retinue. Since then, Hakka communities in Hong Kong China\'s New Territories have made poon choi at clan festivals — radish at the bottom, meat layered above, taste and ritual order in one basin. Yuen Long is the representative area. One basin layers migration memory, lineage identity, and reunion ritual, unbroken for seven hundred years.' } },
  },


  // ============ M07 深圳河 · 红树林（航海贸易）============
  M07: {
    characters: [
      { name: { zh: '湿地守护者', en: 'Wetland Guardian' }, role: { zh: '红树林生态讲述人', en: 'Mangrove Ecology Guide' }, portrait: '' },
    ],
    intro: {
      zh: '2023年冬，你是深圳湾红树林自然保护区的巡护员。傍晚退潮，黑脸琵鹭在滩涂上用勺状嘴来回扫水觅食——这种全球濒危水鸟，全世界仅存约六千只，深圳湾是它们最重要的越冬地之一。你的脚下是红树林的根系，固岸消浪、留泥净水。远处是福田口岸和城市天际线，高楼、口岸、湿地和海面近在咫尺。这里是东半球候鸟迁徙路线"东亚-澳大利西亚迁飞路线"的重要中转站。',
      en: 'Winter 2023. You are a patrol ranger at the Shenzhen Bay Mangrove Nature Reserve. At dusk the tide recedes; black-faced spoonbills sweep their spoon-shaped bills through the mudflat — this globally endangered waterbird has only about 6,000 individuals left worldwide, and Shenzhen Bay is one of their most important wintering grounds. Beneath your feet, mangrove roots hold the shore, calm waves, trap sediment, and filter water. In the distance, Futian Port and the city skyline: towers, checkpoint, wetland, and sea lie side by side. This is a key stop on the East Asian-Australasian Flyway, the migration route of the Eastern Hemisphere.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '黑脸琵鹭是全球濒危物种，2023年全球约存多少只？深圳湾对它意味着什么？', en: 'The black-faced spoonbill is globally endangered. Roughly how many were left in 2023, and what does Shenzhen Bay mean for them?' },
        options: [
          { text: { zh: '全球仅存约六千只，深圳湾是最重要的越冬地之一', en: 'Only about 6,000 worldwide; Shenzhen Bay is one of their most important wintering grounds' }, correct: true, feedback: { zh: '对。2023年全球黑脸琵鹭数量约六千只，深圳湾是它们的重要越冬地。黑脸琵鹭对栖息地要求极高，红树林滩涂提供的觅食环境不可替代。深圳湾同时是东亚-澳大利西亚迁飞路线的重要中转站，每年有大量候鸟在此停歇。', en: 'Correct. In 2023, about 6,000 black-faced spoonbills remained worldwide, and Shenzhen Bay is a key wintering ground. The species demands high-quality habitat; the mangrove mudflat\'s feeding environment is irreplaceable. Shenzhen Bay is also a major stop on the East Asian-Australasian Flyway, where large numbers of migratory birds rest each year.' } },
          { text: { zh: '全球有几十万只，深圳湾只是普通栖息地', en: 'Hundreds of thousands worldwide; Shenzhen Bay is just ordinary habitat' }, correct: false, feedback: { zh: '数量偏差很大。黑脸琵鹭是全球濒危物种，2023年全球仅存约六千只。正因数量稀少，深圳湾作为越冬地的保护价值才格外突出。', en: 'Far off. The black-faced spoonbill is globally endangered; only about 6,000 remained in 2023. Its scarcity is exactly what makes protecting Shenzhen Bay as a wintering ground so critical.' } },
        ],
      },
      {
        q: { zh: '红树林根系对海岸城市有什么实际功能？', en: 'What practical function do mangrove roots serve for a coastal city?' },
        options: [
          { text: { zh: '固岸消浪、留泥净水，是天然的海岸防护基础设施', en: 'They hold shorelines, calm waves, trap sediment, and filter water — natural coastal defense infrastructure' }, correct: true, feedback: { zh: '对。红树林根系能固定岸线、削减风浪能量、拦截泥沙、净化水质。2000年后深圳湾红树林面积一度因城市开发缩减，后经保护恢复。它是城市与湿地贴得最近的地方——高楼、口岸、湿地和海面近在咫尺。', en: 'Correct. Mangrove roots stabilize shorelines, reduce wave energy, trap sediment, and filter water. After 2000, Shenzhen Bay\'s mangrove area shrank due to urban development, then recovered through protection efforts. It is where city and wetland sit closest — towers, port, wetland, and sea within arm\'s reach.' } },
          { text: { zh: '只是绿化景观，没有实际防护功能', en: 'Just decorative greenery with no real protective function' }, correct: false, feedback: { zh: '远不止绿化。红树林根系是天然的海岸防护基础设施：固岸、消浪、留泥、净水。这些功能在台风和风暴潮来临时尤为重要。', en: 'Far more than greenery. Mangrove roots are natural coastal defense infrastructure: holding shores, calming waves, trapping sediment, filtering water — functions especially vital during typhoons and storm surges.' } },
        ],
      },
    ],
    reward: { badge: '🌿', badgeIcon: 'mangrove-bird', badgeName: { zh: '湿地护航印', en: 'Seal of the Mangrove Haven' }, insight: { zh: '深圳湾红树林是东亚-澳大利西亚迁飞路线的重要中转站，全球仅存约六千只的黑脸琵鹭在此越冬。红树林根系固岸消浪、留泥净水，是天然的海岸防护基础设施。2000年后这片红树林面积一度因城市开发缩减，后经保护恢复。深圳湾是城市与湿地贴得最近的地方——高楼、口岸、湿地和海面近在咫尺，贸易繁荣与生态韧性在这里被放进了同一幅画面。', en: 'Shenzhen Bay mangroves are a key stop on the East Asian-Australasian Flyway; the globally endangered black-faced spoonbill — only about 6,000 left — winters here. Mangrove roots hold shorelines, calm waves, trap sediment, and filter water, serving as natural coastal defense infrastructure. After 2000, the mangrove area shrank under development pressure, then recovered through protection. Shenzhen Bay is where city and wetland sit closest — towers, port, wetland, and sea within arm\'s reach, placing prosperity and ecological resilience in the same frame.' } },
  },

  // ============ M12 大梅沙 · 海上丝路（航海贸易）============
  M12: {
    characters: [
      { name: { zh: '丝路舵手', en: 'Silk Route Helmsman' }, role: { zh: '古代商船领航人', en: 'Ancient Merchant Navigator' }, portrait: '' },
    ],
    intro: {
      zh: '你蹲在大梅沙村前的海湾沙堤上，手指拂过一片绳纹陶片。身旁的考古队员告诉你：脚下这处沙堤遗址，1980年发现，1992年、1993年两次发掘，新石器时代文化层的碳十四测定年代为距今约6250年。海风穿过你身后防风林，远处有集装箱船缓缓驶过——六千年前，先民就在这片海湾生火煮食，用石斧石锛开垦生活。',
      en: 'You crouch on the sand barrier before Dameisha village, fingertips brushing a cord-marked pottery shard. The archaeologist beside you explains: this site was discovered in 1980, excavated in 1992 and 1993; the Neolithic layer dates to about 6,250 years ago by radiocarbon. Sea wind blows through the shelterbelt behind you as container ships pass in the distance — 6,000 years ago, people cooked and farmed right here on this bay.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '考古队员递给你一块陶片问：「新石器时代文化层出土的陶器，主要是什么纹饰？」', en: 'The archaeologist hands you a shard: "What is the dominant decoration on Neolithic pottery from this site?"' },
        options: [
          { text: { zh: '以绳纹为主，还有划纹、叶脉纹、水波纹、贝印纹等', en: 'Mainly cord-marked, with incised, leaf-vein, wave and shell-impressed patterns' }, correct: true, feedback: { zh: '正是。大梅沙遗址Ⅰ区新石器时代中期文化层出土的陶器有夹砂和泥质两种，器种包括釜、罐、碗、豆、器座等，纹饰以绳纹为主，兼有划纹、叶脉纹、水波纹、贝印纹、指甲纹等。还发现了灶坑遗迹，说明先民在此生火炊煮。', en: 'Correct. Dameisha\'s Neolithic layer yielded sand-tempered and fine clay pottery — fu, jars, bowls, dou, and stands — decorated mainly with cord marks, plus incised, leaf-vein, wave, shell-impressed and fingernail patterns. Hearth pits show people cooked here.' } },
          { text: { zh: '全部是青花瓷纹', en: 'All blue-and-white porcelain patterns' }, correct: false, feedback: { zh: '青花瓷是元明清时期的产物，比新石器时代晚了数千年。大梅沙新石器文化层的陶器是夹砂陶和泥质陶，饰以绳纹和几何纹，这才是六千年前先民的真实生活器物。', en: 'Blue-and-white porcelain dates to the Yuan-Ming-Qing era, thousands of years later. Dameisha\'s Neolithic pottery was sand-tempered and fine clay with cord and geometric marks — the real vessels of 6,000 years ago.' } },
        ],
      },
      {
        q: { zh: '考古队员带你走到沙堤西南部，指着一处墓葬说：「这区是周代的，你猜发现了什么？」', en: 'The archaeologist leads you to the southwest sand barrier: "This zone is Zhou dynasty. What do you think we found?"' },
        options: [
          { text: { zh: '10座墓葬，其中6座出土青铜器，包括短剑、矛、斧、钺', en: '10 tombs, 6 with bronzes: short swords, spears, axes, yue' }, correct: true, feedback: { zh: '正是。大梅沙遗址Ⅱ区为周代文化层，清理了10座长方形竖穴土坑墓，其中6座出土青铜器，包括短剑、矛、斧、钺，还采集到青铜镞和戈。同时出土大量几何印纹陶器，其中多为夔纹陶器，也有原始瓷豆。这说明周代的大梅沙已是一个具备青铜文明的聚落。', en: 'Correct. Dameisha\'s Zone II is a Zhou-dynasty layer with 10 rectangular pit tombs; 6 yielded bronzes — short swords, spears, axes, and yue — plus bronze arrowheads and a ge dagger. Geometric stamped pottery, mainly kui-pattern, and primitive porcelain dou were also found. Zhou-era Dameisha was a Bronze Age settlement.' } },
          { text: { zh: '只有几块碎石头，没有任何金属器', en: 'Only broken stones, no metal artifacts at all' }, correct: false, feedback: { zh: '事实比这丰富得多。周代文化层不仅有青铜兵器，还有大量几何印纹陶器和原始瓷豆。墓葬中青铜短剑和矛的发现，表明当时深圳沿海地区的居民已掌握青铜冶铸技术，社会复杂程度远超想象。', en: 'Far richer than that. The Zhou layer had bronze weapons, geometric stamped pottery, and primitive porcelain. Bronze swords and spears show that coastal Shenzhen residents had mastered bronze metallurgy, with social complexity far beyond expectation.' } },
        ],
      },
    ],
    reward: { badge: '🧭', badgeIcon: 'silk-route', badgeName: { zh: '丝路海图印', en: 'Seal of the Sea Silk Chart' }, insight: { zh: '大梅沙遗址位于深圳市盐田区大梅沙村前海湾沙堤上，1980年发现，1992年和1993年两次发掘共2405平方米。遗址分两区：Ⅰ区为新石器时代中期，碳十四测定年代距今约6250年，出土绳纹陶器（釜、罐、碗、豆）和石器（斧、锛、刀），发现灶坑遗迹；Ⅱ区为周代，清理10座竖穴土坑墓，其中6座出土青铜短剑、矛、斧、钺，还采集到青铜镞和戈，同时出土大量夔纹几何印纹陶器和原始瓷豆。1983年公布为深圳市文物保护单位。大梅沙的沙堤证明：早在六千年前，先民就在这片海湾定居生活；到周代已进入青铜文明——深圳的海岸线不只有现代港口，更有深埋沙下的千年聚落史。', en: 'The Dameisha site, on a sand barrier in Yantian District, Shenzhen, was discovered in 1980 and excavated over 2,405 sq m in 1992-93. Zone I is mid-Neolithic (~6,250 BP by radiocarbon): cord-marked pottery (fu, jars, bowls, dou) and stone tools (axes, adzes, knives) with hearth pits. Zone II is Zhou dynasty: 10 pit tombs, 6 with bronze short swords, spears, axes and yue, plus bronze arrowheads and a ge; abundant kui-pattern stamped pottery and primitive porcelain dou. Listed as a Shenzhen cultural heritage site in 1983. Dameisha\'s sand barrier proves that settlers lived on this bay 6,000 years ago and entered the Bronze Age by the Zhou dynasty — Shenzhen\'s coast holds not only modern ports but millennia of buried settlement history.' } },
  },

  // ============ N-NA01 屯门·唐代季风港（航海贸易）============
  'N-NA01': {
    characters: [
      { name: { zh: '汪鋐', en: 'Wang Hong' }, role: { zh: '广东海道副使', en: 'Guangdong Maritime Vice Commissioner' }, portrait: '' },
    ],
    intro: {
      zh: '你是1521年正德十六年的广东水师哨官。屯门海面,三艘葡萄牙武装帆船抛锚不动,桅杆上飘着陌生的旗帜——七年前西芒·安德拉德在这里擅建炮台、设刑场、掳掠沿海百姓,葡萄牙人把这地方当作自己的据点。海道副使汪鋐站在你身旁,下令点燃火船。你闻到桐油燃烧的焦臭味,火船顺潮水冲向葡舰,烈焰吞没船帆。这是中国人第一次在海上迎战西方殖民者。',
      en: 'You are a Guangdong naval officer in 1521, the 16th year of Zhengde. Off Tuen Mun, three Portuguese armed galleons lie at anchor under foreign flags. Seven years earlier, Simão de Andrade built a fort here, set up an execution ground, and abducted coastal villagers — the Portuguese treated this place as their own. Maritime Vice Commissioner Wang Hong stands beside you and orders fire ships launched. You smell burning tung oil as the fireships ride the tide into the Portuguese fleet. This is the first time Chinese forces fight Western colonizers at sea.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '1521年屯门海战中,汪鋐用什么战术击败了葡萄牙舰队?', en: 'How did Wang Hong defeat the Portuguese fleet in the 1521 Battle of Tuen Mun?' },
        options: [
          { text: { zh: '以火船顺风潮冲撞葡舰,焚烧其帆船,迫使葡人撤离屯门', en: 'Used fire ships carried by wind and tide to ram and burn Portuguese vessels, forcing their withdrawal' }, correct: true, feedback: { zh: '1521年,汪鋐指挥明军水师对屯门海域的葡萄牙船队发起进攻。葡舰火炮射程远,明军难以正面交锋,汪鋐便命人准备数十艘装满柴草桐油的小船,趁南风涨潮时点燃,顺流冲入葡舰阵列。多艘葡船被焚,残部逃往马六甲。这是中国历史上第一次击退西方殖民者的海战。', en: 'In 1521, Wang Hong attacked the Portuguese fleet at Tuen Mun. Portuguese cannon outranged Ming guns, so Wang deployed dozens of small boats loaded with kindling and tung oil, igniting them on a rising south wind. Multiple Portuguese ships burned; the survivors fled to Malacca. This was the first Chinese naval victory over Western colonizers.' } },
          { text: { zh: '用从葡萄牙人手中缴获的佛郎机炮正面轰击,大获全胜', en: 'Used captured Portuguese folangji cannons for frontal bombardment, winning decisively' }, correct: false, feedback: { zh: '佛郎机炮确实是此战的收获之一——但它是战后缴获的,不是战中的制胜武器。汪鋐取胜靠的是火船战术:以己方小船之"拙",克葡舰火炮之"巧"。战后明军缴获葡制佛郎机炮并加以仿制,反而推动了明代火器技术的升级。', en: 'Folangji cannons were indeed a harvest of this battle — but they were captured after the fight, not the weapon that won it. Wang won with fire ships: using "crude" small boats to defeat "clever" Portuguese cannon. After the battle, the Ming copied captured Portuguese folangji cannons, upgrading Ming firearms technology.' } },
        ],
      },
      {
        q: { zh: '葡萄牙人最早是哪一年、由谁带队首次抵达屯门的?', en: 'In what year, and led by whom, did the Portuguese first arrive at Tuen Mun?' },
        options: [
          { text: { zh: '1514年(明正德九年),由阿尔瓦雷斯(Jorge Álvares)首次抵达屯门', en: '1514, led by Jorge Álvares, first arrival at Tuen Mun' }, correct: true, feedback: { zh: '1514年,葡萄牙探险家阿尔瓦雷斯率船队抵达屯门,在屯门岛上竖立石碑,标记为葡萄牙人首次踏足中国海岸。此后1518年西芒·安德拉德率船队而来,擅自建屋树栅、修筑炮台、设立刑场,还掳掠沿海居民贩卖为奴。这些暴行直接引发了1521年汪鋐的屯门海战。', en: 'In 1514, Portuguese explorer Jorge Álvares reached Tuen Mun and erected a stone marker — the first Portuguese landing on the Chinese coast. In 1518, Simão de Andrade arrived, building houses and forts, setting up an execution ground, and abducting coastal villagers into slavery. These atrocities directly provoked Wang Hong\'s 1521 counterattack.' } },
          { text: { zh: '1553年葡萄牙人通过贿赂明朝官员才得以在屯门居住', en: 'In 1553 the Portuguese bribed Ming officials to settle at Tuen Mun' }, correct: false, feedback: { zh: '1553年葡萄牙人获准在澳门而非屯门晾晒货物,是另一个事件。屯门与葡萄牙的交集更早:1514年阿尔瓦雷斯首抵,1518年安德拉德强行占据,1521年被汪鋐驱逐。从首抵到被逐,前后仅七年,但这是中国与西方殖民主义的第一次正面碰撞。', en: 'The 1553 arrangement was at Macau, not Tuen Mun — a separate event. Tuen Mun\'s Portuguese episode was earlier: Álvares arrived in 1514, Andrade seized it in 1518, and Wang Hong expelled them in 1521. First arrival to expulsion took only seven years — but it was China\'s first direct clash with Western colonialism.' } },
        ],
      },
    ],
    reward: { badge: '⛵', badgeIcon: 'monsoon-sail', badgeName: { zh: '季风门户印', en: 'Seal of the Monsoon Gate' }, insight: { zh: '唐代屯门已是阿拉伯商人等候季风的停泊港,是海上丝路进入岭南的门户。七百年后,1514年葡萄牙人阿尔瓦雷斯首抵屯门,1518年安德拉德在此筑炮台、设刑场、掠人口。1521年,海道副使汪鋐以火船焚烧葡舰,把殖民者逐出屯门——这是中国第一次在海上击退西方人。战后明军缴获并仿制了葡萄牙佛郎机炮,推动明代火器升级。从等风的阿拉伯帆到逐炮的葡萄牙舰,屯门海面见证了七百年间东亚海域主人的一次次更替。', en: 'By the Tang dynasty, Tuen Mun was already a monsoon anchorage for Arab traders and a gateway of the Maritime Silk Road. Seven centuries later, Jorge Álvares arrived in 1514, and Simão de Andrade built forts and an execution ground in 1518. In 1521, Vice Commissioner Wang Hong used fire ships to burn the Portuguese fleet and expel them — China\'s first naval repulse of Westerners. Captured Portuguese folangji cannons were then copied, upgrading Ming firearms. From Arab dhows waiting for wind to Portuguese galleons driven out by fire, Tuen Mun witnessed seven centuries of changing masters over East Asian waters.' } },
  },

  // ============ N-NA02 伶仃洋·古战场（航海贸易）============
  'N-NA02': {
    characters: [
      { name: { zh: '文天祥', en: 'Wen Tianxiang' }, role: { zh: '南宋丞相、诗人', en: 'Southern Song Chancellor and Poet' }, portrait: '' },
    ],
    intro: {
      zh: '你是1279年农历二月的南宋水军士卒。伶仃洋上,两千余艘宋船用铁索相连,在崖山海域列成水上堡垒。元将张弘范的水师从四面合围,箭矢如雨,火罐飞来。你听见陆秀夫在船舱深处抱着八岁的幼帝赵昺,海浪拍打船舷,铁链碰撞作响。二十万军民困在这片海面上,粮尽水绝。陆秀夫背起幼帝跃入大海的那一刻,你知道一个朝代就此沉入伶仃洋底。',
      en: 'You are a Song dynasty naval soldier in the second lunar month of 1279. On the Lingding Ocean, over two thousand Song ships chained together form a floating fortress at Yaishan. Yuan admiral Zhang Hongfan\'s fleet closes from all sides — arrows rain, fire pots fly. You hear Lu Xiufu deep in the hold, holding the eight-year-old emperor Zhao Bing. Waves slap the hull, chains clatter. 200,000 soldiers and civilians are trapped here, out of food and water. When Lu Xiufu leaps into the sea with the child emperor on his back, you know a dynasty has sunk to the bottom of the Lingding Ocean.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '1279年崖山海战中,宋军为何全军覆没?', en: 'Why was the Song army annihilated at the 1279 Battle of Yaishan?' },
        options: [
          { text: { zh: '宋军将千余艘战船以铁索相连结成水寨,被元军切断退路后火攻焚毁,二十万军民覆灭', en: 'Song forces chained over a thousand ships into a floating fortress; Yuan forces cut off retreat and burned them, annihilating 200,000' }, correct: true, feedback: { zh: '1279年二月,张世杰将宋船以铁索相连停泊于崖山海域,意图以连环船阵固守。但元将张弘范封锁海口断绝淡水,宋军将士干渴到饮海水,腹泻不止。元军随后以火船冲击连环船阵,宋军大溃。陆秀夫背幼帝赵昺投海,随后十余万具尸体浮于海面。南宋至此灭亡,历时三百一十九年。', en: 'In the second month of 1279, Zhang Shijie chained Song ships together at Yaishan to form a defensive fortress. But Yuan admiral Zhang Hongfan blockaded the harbor, cutting off fresh water — Song soldiers drank seawater and suffered dysentery. Yuan fire ships then struck the chained fleet. Lu Xiufu leapt into the sea with the child emperor Zhao Bing. Over 100,000 bodies floated on the water. The Song dynasty, 319 years old, was no more.' } },
          { text: { zh: '宋军主动放弃崖山防线,有序撤退至台湾', en: 'The Song army voluntarily abandoned the Yaishan line and retreated to Taiwan' }, correct: false, feedback: { zh: '宋军没有撤退,也无路可退。崖山是南宋最后的据点,张世杰将全部兵力集中于这片海域,铁索连船背水一战。陆秀夫投海后,张世杰试图率残部再立赵氏后裔,但船队在海上遭遇风暴倾覆,南宋复国的最后希望也随之沉没。', en: 'There was no retreat. Yaishan was the Song\'s last stronghold — Zhang Shijie concentrated all forces here, chaining ships for a desperate stand. After Lu Xiufu\'s death, Zhang Shijie tried to establish another Zhao heir, but his remaining fleet was wrecked in a storm at sea, ending the last hope of Song restoration.' } },
        ],
      },
      {
        q: { zh: '文天祥被押经伶仃洋时写下的《过零丁洋》,其中"零丁洋"指的是哪里?', en: 'In Wen Tianxiang\'s poem "Crossing Lingding Ocean," where is "Lingding Ocean"?' },
        options: [
          { text: { zh: '伶仃洋,即珠江口喇叭形河口湾,北起东莞虎门,南达港澳海域', en: 'Lingding Ocean — the trumpet-shaped Pearl River estuary, from Humen in the north to the Hong Kong-Macau waters in the south' }, correct: true, feedback: { zh: '伶仃洋北起东莞虎门,南至中国香港、中国澳门一带海域,是珠江口的喇叭形河口湾。1278年文天祥在广东海丰五坡岭兵败被俘,被元军押经伶仃洋时写下"惶恐滩头说惶恐,零丁洋里叹零丁。人生自古谁无死,留取丹心照汗青。"零丁洋即伶仃洋,"零丁"二字既是地名,也是他孤身被囚的心境。', en: 'Lingding Ocean runs from Humen (Dongguan) in the north to the Hong Kong-Macau waters in the south — a trumpet-shaped Pearl River estuary. In 1278, Wen Tianxiang was captured at Wupoling in Haifeng. While being transported across Lingding Ocean by Yuan forces, he wrote: "At Huangkong Beach I spoke of fear; in Lingding Ocean I sigh in loneliness. Since ancient times who has not died? Let me leave a loyal heart to shine in history." "Lingding" is both a place name and his state of mind — alone and captive.' } },
          { text: { zh: '零丁洋是指长江入海口附近的一段水域', en: 'Lingding Ocean refers to waters near the Yangtze River mouth' }, correct: false, feedback: { zh: '零丁洋即伶仃洋,在珠江口而非长江口。文天祥被俘后从广东押往大都(今北京),途经珠江口伶仃洋时写下此诗。惶恐滩在今江西万安,是文天祥早年任官时经过的险滩;"惶恐滩头说惶恐,零丁洋里叹零丁"一句,把过去与当下两段水路、两种心境对举,字字是血。', en: 'Lingding Ocean is at the Pearl River mouth, not the Yangtze. Wen was captured in Guangdong and transported north to Dadu (Beijing) via the Pearl River estuary when he wrote this poem. Huangkong Beach is in modern Wan\'an, Jiangxi — a dangerous rapid Wen had passed earlier in his career. "At Huangkong Beach I spoke of fear; in Lingding Ocean I sigh in loneliness" juxtaposes two waterways and two states of mind — every word written in blood.' } },
        ],
      },
    ],
    reward: { badge: '🌊', badgeIcon: 'storm-stele', badgeName: { zh: '伶仃潮声印', en: 'Seal of Lingding Tides' }, insight: { zh: '1278年文天祥在海丰五坡岭被俘,押经伶仃洋时写下"人生自古谁无死,留取丹心照汗青"。次年二月,陆秀夫背幼帝赵昺在崖山投海,二十万军民覆灭于伶仃洋,南宋灭亡。五百六十年后,1839年关天培在伶仃洋北侧穿鼻洋与英军交战,鸦片战争爆发。同一片海面,沉过南宋最后的帝影,也迎过近代第一声炮响。今天港珠澳大桥跨越伶仃洋,桥下潮水仍带着文天祥的诗句和崖山的遗骨东流入海。', en: 'In 1278, Wen Tianxiang was captured at Wupoling in Haifeng. Transported across Lingding Ocean, he wrote: "Since ancient times who has not died? Let me leave a loyal heart to shine in history." The following February, Lu Xiufu leapt into the sea at Yaishan with the child emperor Zhao Bing — 200,000 perished in Lingding Ocean, and the Song fell. 560 years later, in 1839, Guan Tianpei fought the British at Chuanbi Yang just north of Lingding Ocean — the Opium War erupted. The same waters that sank the last Song emperor witnessed the first shots of modern China. Today the Hong Kong-Zhuhai-Macao Bridge spans Lingding Ocean; beneath it, tides still carry Wen\'s verses and the bones of Yaishan eastward to the sea.' } },
  },

  // ============ N-NA03 香港维多利亚港（航海贸易）============
  'N-NA03': {
    characters: [
      { name: { zh: '杨慕琦', en: 'Mark Young' }, role: { zh: '香港总督', en: 'Governor of Hong Kong' }, portrait: '' },
    ],
    intro: {
      zh: '你是1941年12月25日的驻港英军下级军官。维多利亚港北岸炮声隆隆,日军第三十八师团已经突破醉酒湾防线,攻入九龙。港督杨慕琦在半岛酒店向日军司令酒井隆递交降书——这天是圣诞节,后来被称为"黑色圣诞"。你从太平山顶往下望,维港上飘着日本海军的太阳旗,十八天的香港保卫战结束了。"三年零八个月"的日占时期,从这一天开始。',
      en: 'You are a British garrison officer on December 25, 1941. Artillery booms over Victoria Harbour. The Japanese 38th Division has breached the Gin Drinker\'s Line and seized Kowloon. Governor Mark Young surrenders to Lieutenant General Sakai at the Peninsula Hotel — Christmas Day, later called the "Black Christmas." From Victoria Peak you see the Japanese naval ensign flying over the harbour. The 18-day Battle of Hong Kong is over. The "Three Years and Eight Months" of occupation begin.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '1841年1月26日英国占领香港岛时,在哪个地点举行了升旗仪式?', en: 'Where did the British hold their flag-raising ceremony when they occupied Hong Kong Island on January 26, 1841?' },
        options: [
          { text: { zh: '占领角(Possession Point),即今中国香港上环水坑口街一带', en: 'Possession Point — today\'s Possession Street area in Sheung Wan, Hong Kong, China' }, correct: true, feedback: { zh: '1841年1月26日,英军舰队司令伯麦率队在港岛西北岸登陆,在一处海角举行升旗仪式,将该处命名为"占领角"(Possession Point),中文称"水坑口"。英国随即宣布香港为自由港,不征收进出口关税,以此吸引各国商船。水坑口后来发展为上环街区,而"自由港"政策奠定了中国香港此后百余年的贸易地位。', en: 'On January 26, 1841, British naval Commodore Bremer landed on the northwest shore of Hong Kong Island and held a flag-raising at a promontory he named "Possession Point" — known in Chinese as "Shui Hang Hau." Britain immediately declared Hong Kong a free port with no import or export duties to attract merchant ships. Possession Point later became the Sheung Wan district, and the free-port policy anchored Hong Kong\'s trade status for over a century.' } },
          { text: { zh: '在太平山顶举行升旗仪式,以俯瞰全港', en: 'At Victoria Peak, overlooking the entire harbour' }, correct: false, feedback: { zh: '升旗地点不在山顶而在海岸。1841年1月26日英军在港岛西北岸的占领角(Possession Point,即水坑口)登陆升旗,这里紧邻维港,便于舰船停靠。选择海边而非山顶,是因为英军首先要控制的是港口和航运,而非制高点。香港作为自由港的命运,就是从这片海滩开始的。', en: 'The flag was raised on the shore, not the peak. On Jan 26, 1841, British forces landed at Possession Point on the northwest coast — adjacent to the harbour for ship access. They chose the waterfront, not the hilltop, because their priority was controlling the port and shipping. Hong Kong\'s destiny as a free port began on that beach.' } },
        ],
      },
      {
        q: { zh: '1941年香港保卫战中,港督杨慕琦在什么情况下向日军投降的?', en: 'Under what circumstances did Governor Mark Young surrender to the Japanese in the 1941 Battle of Hong Kong?' },
        options: [
          { text: { zh: '日军突破醉酒湾防线攻入九龙,炮轰港岛北岸,英军在弹药将尽、水源被断后投降', en: 'Japanese broke the Gin Drinker\'s Line, seized Kowloon, bombarded the north shore; British surrendered after running low on ammo and losing water supply' }, correct: true, feedback: { zh: '1941年12月8日日军从深圳方向进攻香港,12月13日占领九龙。18日深夜日军渡海登陆港岛东北,与加拿大援军和英军在黄泥涌峡谷激战。到12月25日,英军弹药将尽、食水断绝,港督杨慕琦亲自走到半岛酒店向日军司令酒井隆投降。此后"三年零八个月"日占期内,约四十万中国居民被害或饿死。', en: 'On Dec 8, 1941, Japanese forces attacked from the Shenzhen direction. By Dec 13 they held Kowloon. On the night of Dec 18 they crossed to the island\'s northeast and fought Canadian and British troops at Wong Nai Chung Gap. By Dec 25, ammunition was spent and water cut off. Governor Young walked to the Peninsula Hotel and surrendered to Lt. Gen. Sakai. During the "Three Years and Eight Months" of occupation, approximately 400,000 Chinese residents were killed or starved to death.' } },
          { text: { zh: '英军坚守半年后因等待援军无望才投降', en: 'British forces held out for six months before surrendering for lack of reinforcements' }, correct: false, feedback: { zh: '香港保卫战仅持续了十八天,从12月8日日军进攻到25日投降。醉酒湾防线在12月9日夜间即被突破,九龙于13日沦陷,港岛在18日遭渡海登陆。杨慕琦投降时,英联邦守军已伤亡过半,而非坚守半年。1945年8月30日英国皇家海军重返维港受降,"三年零八个月"才告结束。', en: 'The Battle of Hong Kong lasted only 18 days, from Dec 8 to Dec 25. The Gin Drinker\'s Line was breached on the night of Dec 9, Kowloon fell on the 13th, and Japanese forces landed on the island on the 18th. Young surrendered when Commonwealth forces had suffered over 50% casualties — not after six months. On Aug 30, 1945, the British Royal Navy returned to Victoria Harbour to accept the Japanese surrender, ending the "Three Years and Eight Months."' } },
        ],
      },
    ],
    reward: { badge: '🏙️', badgeIcon: 'harbor-cranes', badgeName: { zh: '自由港脉印', en: 'Seal of the Free Port Pulse' }, insight: { zh: '1841年1月26日,英军在港岛西北岸的占领角升旗,宣布香港为自由港。一百年后的1941年12月25日,港督杨慕琦在半岛酒店向日军投降,维港上太阳旗取代了米字旗。此后"三年零八个月"日占时期,约四十万中国居民被害或饿死。1945年8月30日,英国皇家海军重临维港受降。从占领角升旗到黑色圣诞投降,再到战后重临,同一片港湾在一百年间经历了占领、沦陷与收复——维港的潮水记住的不只是贸易,还有战争与生死。', en: 'On Jan 26, 1841, the British raised their flag at Possession Point and declared Hong Kong a free port. Exactly a century later, on Dec 25, 1941, Governor Young surrendered at the Peninsula Hotel — the Rising Sun replaced the Union Jack over the harbour. During the "Three Years and Eight Months" of occupation, about 400,000 Chinese residents were killed or starved. On Aug 30, 1945, the Royal Navy returned to accept the Japanese surrender. From the flag-raising at Possession Point to the Black Christmas surrender to the postwar return, the same harbour endured occupation, fall, and recovery in a single century. Its tides remember not only trade, but war and survival.' } },
  },

  // ============ N-NA04 广州黄埔古港（航海贸易）============
  'N-NA04': {
    characters: [
      { name: { zh: '十三行账房', en: 'Thirteen Factories Clerk' }, role: { zh: '清代广州贸易记录者', en: 'Qing Canton Trade Recorder' }, portrait: '' },
    ],
    intro: {
      zh: '1757年,乾隆二十二年。你是广州黄埔古港十三行账房里的一名账房先生。窗外珠江水面上,"夷船蚁泊"——瑞典"哥德堡号"、美国"中国皇后号"等各国商船桅杆林立。清政府刚下令"一口通商",广州成为中国唯一对外贸易口岸,黄埔古港是唯一法定对外通商港口。你蘸墨提笔,在账簿上记下今天运出的茶叶箱数和收到的白银两数。远处码头传来水手们用各国语言喊号子的声音,空气里混着桐油、茶叶和海水的咸腥味。',
      en: '1757, the 22nd year of Qianlong. You are a clerk in the Thirteen Factories accounting office at Huangpu Ancient Port, Guangzhou. Outside, "foreign ships anchor like ants" on the Pearl River — Sweden\'s "Götheborg," America\'s "Empress of China" and other merchant vessels crowd the masts. The Qing court has just decreed "single-port trade," making Guangzhou China\'s only foreign trade port and Huangpu the sole legal port of commerce. You dip your brush and record today\'s tea shipments and silver received. From the distant dock, sailors\' chants in a dozen languages carry over the water, the air thick with tung oil, tea leaves and the salt of the sea.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '1757年清政府实行的"一口通商"政策意味着什么?', en: 'What did the Qing "single-port trade" policy of 1757 mean?' },
        options: [
          { text: { zh: '广州成为中国唯一对外贸易口岸,黄埔古港是唯一法定对外通商港口,持续85年至1842年', en: 'Guangzhou became China\'s only foreign trade port; Huangpu was the sole legal port, lasting 85 years until 1842' }, correct: true, feedback: { zh: '1757年(乾隆二十二年)清政府实行"一口通商",广州成为中国唯一对外贸易口岸,黄埔古港在此后85年间(1757-1842年)是中国唯一法定对外通商港口。瑞典"哥德堡号"、美国"中国皇后号"等商船均在此停靠,形成"夷船蚁泊"的壮观景象。1842年《南京条约》签订后五口通商,十三行的垄断被打破。', en: 'In 1757 (22nd year of Qianlong) the Qing court implemented "single-port trade," making Guangzhou China\'s only foreign trade port. For 85 years (1757-1842) Huangpu was China\'s sole legal port of foreign commerce. Swedish "Götheborg," American "Empress of China" and other ships anchored here, creating the spectacle of "foreign ships like ants." After the 1842 Treaty of Nanjing opened five ports, the Thirteen Factories\' monopoly was broken.' } },
          { text: { zh: '"一口通商"是指只允许广州本地商人内部交易', en: '"Single-port trade" meant only local Guangzhou merchants could trade internally' }, correct: false, feedback: { zh: '"一口通商"不是内部贸易限制,而是对外贸易的集中管控:1757年清政府规定广州为中国唯一对外贸易口岸,黄埔古港成为唯一法定对外通商港口。所有外国商船只能在此停靠交易,十三行作为特许外贸垄断机构集经营、管理、外交于一身。', en: '"Single-port trade" was not an internal restriction but a centralization of foreign trade: in 1757 the Qing court designated Guangzhou as China\'s only foreign trade port, making Huangpu the sole legal port of commerce. All foreign ships had to anchor and trade here; the Thirteen Factories served as the chartered foreign trade monopoly, combining commerce, administration and diplomacy.' } },
        ],
      },
      {
        speaker: 0,
        q: { zh: '十三行在清代对外贸易中扮演了什么角色?', en: 'What role did the Thirteen Factories play in Qing foreign trade?' },
        options: [
          { text: { zh: '清政府特许的外贸垄断机构,集经营、管理、外交于一身', en: 'Qing-chartered foreign trade monopoly combining commerce, administration and diplomacy' }, correct: true, feedback: { zh: '十三行是清政府特许的外贸垄断机构,集经营、管理、外交于一身。所有外商在广州的贸易必须通过十三行进行,十三行不仅负责货物买卖,还要管理外商行为、代征关税、传递官方文书。1757年一口通商后85年间,十三行掌控了中国全部对外贸易,1842年《南京条约》五口通商后其垄断被打破。', en: 'The Thirteen Factories were the Qing-chartered foreign trade monopoly, combining commerce, administration and diplomacy. All foreign trade in Guangzhou had to pass through them; they managed goods trading, supervised foreign merchant behavior, collected tariffs and relayed official documents. During the 85 years after the 1757 single-port decree, the Thirteen Factories controlled all of China\'s foreign trade; the 1842 Treaty of Nanjing\'s five-port trade broke their monopoly.' } },
          { text: { zh: '十三行只是普通的民间商业行会', en: 'The Thirteen Factories were merely an ordinary folk merchant guild' }, correct: false, feedback: { zh: '十三行并非普通民间行会,而是清政府特许的外贸垄断机构,集经营、管理、外交于一身。1757年一口通商后,所有外商在广州的贸易必须通过十三行,十三行还代行管理外商、征收关税等官方职能。这种半官半商的身份使其在85年间掌控中国全部对外贸易。', en: 'The Thirteen Factories were not an ordinary folk guild but a Qing-chartered foreign trade monopoly combining commerce, administration and diplomacy. After the 1757 single-port decree, all foreign trade in Guangzhou had to pass through them; they also managed foreign merchants and collected tariffs on behalf of the government. This semi-official, semi-merchant status let them control all of China\'s foreign trade for 85 years.' } },
        ],
      },
    ],
    reward: { badge: '🍵', badgeIcon: 'canton-tea', badgeName: { zh: '茶瓷通商印', en: 'Seal of Tea and Porcelain Trade' }, insight: { zh: '南宋时期黄埔已是"海舶所集之地"。1757年(乾隆二十二年)清政府实行"一口通商",广州成为中国唯一对外贸易口岸,黄埔古港在此后85年间(1757-1842年)是中国唯一法定对外通商港口。瑞典"哥德堡号"、美国"中国皇后号"等商船在此停靠,"夷船蚁泊"成为珠江口的日常景观。十三行作为清政府特许的外贸垄断机构,集经营、管理、外交于一身,掌控中国全部对外贸易。1842年《南京条约》签订后五口通商,十三行垄断被打破。从一艘艘远洋帆船的停靠,到后来集装箱巨轮的航线——全球贸易的形式在变,但中国南海岸始终是世界货物与白银交汇的坐标,黄埔古港是这段长链上最早被写进账簿的一环。', en: 'As early as the Southern Song, Huangpu was "a gathering place for sea vessels." In 1757 (22nd year of Qianlong) the Qing court implemented "single-port trade," making Guangzhou China\'s only foreign trade port. For 85 years (1757-1842) Huangpu was China\'s sole legal port of foreign commerce. Swedish "Götheborg," American "Empress of China" and other ships anchored here; "foreign ships like ants" became a daily scene on the Pearl River. The Thirteen Factories, as the Qing-chartered foreign trade monopoly combining commerce, administration and diplomacy, controlled all of China\'s foreign trade. The 1842 Treaty of Nanjing\'s five-port trade broke their monopoly. From the anchoring of ocean-going sailing ships to the routes of modern container giants — the form of global trade has changed, but China\'s southern coast remains a coordinate where world goods and silver converge. Huangpu Ancient Port is the earliest link in this long chain to be written into the ledgers.' } },
  },

  // ============ 新增锚点 · 千年文脉 ============
  'N-CV05': {
    characters: [{ name: { zh: '岭南匠师', en: 'Lingnan Artisan' }, role: { zh: '陈家祠装饰工艺讲述者', en: 'Craft narrator of Chen Clan Hall' }, portrait: '' }],
    intro: { zh: '清光绪二十年（1894年），广东省七十二县陈氏宗族共同捐资兴建的陈氏书院落成。你是受邀参与装饰的岭南匠人，手握刻刀与灰批，穿行在尚未完工的厅堂间。屋顶上，石湾烧制的陶塑戏曲人物群像色彩鲜艳；山墙垂脊前沿，十二对朱红色灰塑独角狮子高逾一米。木雕、砖雕、石雕、陶塑、灰塑、铜铁铸、彩绘——"三雕两塑一铸一画"七绝工艺齐聚一楼，共284件雕塑饰件，你正在亲手参与这座岭南建筑艺术殿堂的最后工序。', en: 'In 1894, the twentieth year of Guangxu, the Chen Clan Academy — jointly funded by Chen lineage branches from seventy-two counties of Guangdong — was completed. You are a Lingnan artisan invited to work on the decorations, carving knife and lime-trowel in hand, threading through the unfinished halls. On the roof, Shiwan-fired ceramic opera figures blaze with color; along the gable ridges, twelve pairs of vermilion lime-sculpted unicorn lions stand over a meter tall. Wood carving, brick carving, stone carving, ceramic sculpture, lime sculpture, bronze-and-iron casting, and painting — the "seven supreme crafts" — converge in one building, totaling 284 sculptural pieces. You are helping complete the final touches of this temple of Lingnan architectural art.' },
    scenes: [{ speaker: 0, q: { zh: '陈家祠建成于清光绪二十年（1894年），其正式名称"陈氏书院"中的"书院"二字有何深意？', en: 'Completed in 1894, Chen Clan Hall\'s formal name is "Chen Clan Academy." What is the significance of "Academy" in the name?' }, options: [
      { text: { zh: '兼具祠堂与合族祠书院功能，为广东省七十二县陈氏子弟赴省城科举备考提供寓所', en: 'It served as both ancestral hall and clan academy, providing lodging for Chen clan members from 72 Guangdong counties preparing for the imperial examinations in the provincial capital' }, correct: true, feedback: { zh: '陈家祠是广东省七十二县陈氏宗族共同捐资兴建的合族祠，兼具祭祀祖先和为科举子弟提供落脚处的功能。称"书院"既体现教育功能，也规避了清代对合族祠的政策限制。', en: 'Jointly funded by Chen lineages from 72 Guangdong counties, the hall served both ancestral worship and as lodging for examination candidates. The name "Academy" reflected its educational function and sidestepped Qing restrictions on clan halls.' } },
      { text: { zh: '只是一所普通的私立学校', en: 'It was merely an ordinary private school' }, correct: false, feedback: { zh: '陈家祠远非普通学校。它是广东省陈氏宗族的合族祠，核心是宗族文化与工艺表达，兼为科举子弟提供备考寓所。其284件雕塑饰件本身就是岭南工艺的巅峰之作。', en: 'Far from ordinary. It was a joint clan hall for the Chen lineages of Guangdong, centered on clan culture and craft, also lodging exam candidates. Its 284 sculptural pieces represent the pinnacle of Lingnan decorative art.' } },
    ] }, { q: { zh: '陈家祠建筑装饰"七绝"被概括为"三雕两塑一铸一画"，其中"一铸"指的是什么？', en: 'The "seven supreme crafts" of Chen Clan Hall are summarized as "three carvings, two sculptures, one casting, one painting." What does "one casting" refer to?' }, options: [
      { text: { zh: '铜铁铸，如门廊上的铁铸通花，将铁水浇铸成空心图案', en: 'Bronze and iron casting, such as the cast-iron openwork on the portico, pouring molten iron into hollow patterns' }, correct: true, feedback: { zh: '门廊上的铁铸通花将铁水浇铸成空心图案，工艺难度极高。陈家祠"七绝"为木雕、石雕、砖雕（三雕）、陶塑、灰塑（两塑）、铜铁铸（一铸）、彩绘（一画），共284件雕塑饰件。', en: 'The portico cast-iron openwork was made by pouring molten iron into hollow patterns — extremely demanding. The seven crafts are wood, stone, and brick carving; ceramic and lime sculpture; bronze-iron casting; and painting — 284 pieces in total.' } },
      { text: { zh: '铜钱铸造，指祠内供奉的铜质供器', en: 'Coin casting, referring to bronze ritual vessels enshrined in the hall' }, correct: false, feedback: { zh: '"一铸"指铜铁铸建筑装饰工艺，非供器。陈家祠的铁铸通花门廊是将铁水浇铸成镂空图案的装饰构件，是岭南建筑中极为罕见的金属铸造装饰。', en: '"One casting" refers to architectural bronze-iron decoration, not ritual vessels. The cast-iron openwork portico — molten iron poured into pierced patterns — is an exceptionally rare metal architectural ornament in Lingnan architecture.' } },
    ] }],
    reward: { badge: '🎨', badgeName: { zh: '岭南工艺印', en: 'Seal of Lingnan Craft' }, insight: { zh: '清光绪二十年（1894年），广东省七十二县陈氏宗族共同捐资兴建的陈氏书院落成。它兼具祠堂与合族祠书院功能，为陈氏子弟赴省城科举备考提供寓所，称"书院"既体现教育功能，也规避了清代对合族祠的政策限制。建筑集木雕、砖雕、石雕、陶塑、灰塑、铜铁铸、彩绘"三雕两塑一铸一画"七绝工艺于一楼，共284件雕塑饰件，是岭南装饰艺术的巅峰之作。从七十二县合资到七绝工艺齐聚，陈家祠把宗族凝聚力与地方手工业水平共同凝固在一座建筑里，后来成为广东民间工艺博物馆，让一座建筑成为地方社会、教育和手工业的共同档案。', en: 'In 1894, the Chen Clan Academy — jointly funded by Chen lineage branches from 72 Guangdong counties — was completed. It served as both ancestral hall and clan academy, lodging examination candidates; the name "Academy" reflected its educational function while sidestepping Qing restrictions on clan halls. The building gathers seven supreme crafts — wood, brick, stone carving; ceramic and lime sculpture; bronze-iron casting; and painting — totaling 284 pieces, representing the pinnacle of Lingnan decorative art. From 72-county joint funding to seven crafts in one building, Chen Clan Hall crystallized clan cohesion and local craftsmanship into a single structure, later becoming the Guangdong Folk Art Museum — a building that archives society, education and craft together.' } },
  },
  'N-CV06': {
    characters: [{ name: { zh: '祖庙司祝', en: 'Temple Keeper' }, role: { zh: '佛山城市记忆守望者', en: 'Keeper of Foshan memory' }, portrait: '' }],
    intro: { zh: '你是北宋元丰年间佛山冶铁坊里的一名年轻学徒。炉火映红半条街巷，锤声与风箱声此起彼伏。镇上长老说，北帝司水灭火，护佑炉窑平安，须建一座庙供奉玄天上帝。你随众人搬砖垒石，看一座土庙在冶铁烟气中缓缓成形。那时你不会想到，这座庙将经历元末大火焚毁、明洪武五年重修，最终成为佛山"诸庙之首"——九百余年香火不断，成为珠三角水乡最深厚的信仰根基。', en: 'You are a young apprentice in a Foshan iron forge during the Northern Song Yuanfeng era. Furnace fire reddens the streets; hammers and bellows never cease. Elders say the Northern Emperor governs water and quenches fire, protecting the kilns — a temple must be built to honor him. You carry bricks and stones, watching a humble shrine rise through the foundry smoke. You cannot know it will survive Yuan-era fires, a Ming restoration, and become Foshan\'s foremost temple — over nine centuries of incense, the deepest faith of the Pearl Delta water towns.' },
    scenes: [{ speaker: 0, q: { zh: '佛山祖庙最初供奉的主神是哪一位？', en: 'Which deity was the Foshan Ancestral Temple originally dedicated to?' }, options: [
      { text: { zh: '北帝，即玄天上帝，司水灭火，护佑佛山冶铁炉窑', en: 'The Northern Emperor (Xuantian Shangdi), who governs water and fire, protecting Foshan\'s iron furnaces' }, correct: true, feedback: { zh: '北宋元丰年间佛山已是岭南冶铁中心，火患频仍。北帝司水灭火，随中原人南迁传入岭南，成为佛山工商业城镇的守护神。祖庙也因此被称为"北帝庙""灵应祠"。', en: 'By the Northern Song Yuanfeng era, Foshan was a major iron-smelting center plagued by fire. The Northern Emperor, brought south by migrants, became the city\'s protector. The temple was also called "Northern Emperor Temple" and "Lingying Shrine."' } },
      { text: { zh: '关帝，保佑商贾财运亨通', en: 'Guan Yu, blessing merchants with prosperity' }, correct: false, feedback: { zh: '佛山祖庙供奉的是北帝（玄天上帝），并非关帝。北帝信仰与佛山冶铁业密切相关——火患是冶铁最大的威胁，北帝司水灭火，故成为炉窑平安的守护神。', en: 'The temple enshrines the Northern Emperor, not Guan Yu. His worship is tied to Foshan\'s iron industry — fire was the greatest threat, and the Northern Emperor governs water to quench it.' } },
    ] }, { q: { zh: '佛山祖庙始建于哪个时期？', en: 'When was the Foshan Ancestral Temple first built?' }, options: [
      { text: { zh: '北宋元丰年间（1078-1085年）', en: 'Northern Song Yuanfeng era (1078-1085)' }, correct: true, feedback: { zh: '祖庙始建于北宋元丰年间，元末毁于大火，明洪武五年（1372年）重修。宋元以后这里一直是佛山各姓宗祠公众议事的场所，故被尊称为"祖庙"。', en: 'Founded in the Yuanfeng era, destroyed by fire at the end of the Yuan dynasty, rebuilt in 1372. It served as a council hall for Foshan\'s clans, hence the name "Ancestral Temple."' } },
      { text: { zh: '明洪武五年（1372年）', en: 'Ming dynasty, 5th year of Hongwu (1372)' }, correct: false, feedback: { zh: '洪武五年是重修时间，不是始建时间。祖庙始建于北宋元丰年间（1078-1085年），比明初重修早了近三百年。', en: '1372 was the rebuilding date, not the founding. The temple was first built during 1078-1085, nearly three centuries earlier.' } },
    ] }],
    reward: { badge: '🔥', badgeName: { zh: '祖庙炉火印', en: 'Seal of the Temple Hearth' }, insight: { zh: '北宋元丰年间，南迁的中原人把北帝信仰带到岭南。佛山因冶铁兴旺，火患频仍，北帝司水灭火，成为这座工商业城镇的守护神。祖庙从一座土庙逐步演变为"诸庙之首"，明代以后更成为各姓宗族议事公断的"庙议"之所，集神权、族权与公权于一身。陶塑瓦脊、木雕神案、万福台戏台——每一处构件都记录着佛山人如何把信仰、行会与市井生活熔铸为一座活的城市档案。', en: 'During the Northern Song Yuanfeng era, southward migrants brought Northern Emperor worship to Lingnan. Foshan\'s iron industry made fire a constant threat; the deity who governs water became the city\'s guardian. The temple evolved into Foshan\'s foremost shrine, a council hall where clans arbitrated disputes — fusing divine, clan and civic authority. Ceramic roof ridges, wood-carved altars, the Wanfu Stage — each component records how Foshan people forged faith, guilds and street life into a living urban archive.' } },
  },
  'N-CV07': {
    characters: [{ name: { zh: '题刻旅人', en: 'Inscription Traveler' }, role: { zh: '七星岩山水记录者', en: 'Recorder of Seven Star Crags' }, portrait: '' }],
    intro: { zh: '你是唐开元十五年（727年）途经端州的一名书吏。船靠岸后，你随刺史入石室岩探洞，洞中水滴回响如磬。崖壁上忽然出现一方新刻——书法家李邕刚在此题写《端州石室记》，楷书遒劲，三百八十六字。你伸手描摹石面，指尖触到一处马蹄形凹痕，不知何年所留。此后千年，包拯、周敦颐、俞大猷、黎简……五百余方题刻将层层覆盖这片崖壁，让七星岩成为南中国最密集的摩崖石刻群，被陈毅称为"千年诗廊"。', en: 'You are a clerk passing through Duanzhou in 727 CE. You follow the prefect into Stone Chamber Cave; water drips like chimes. A fresh inscription appears on the cliff — calligrapher Li Yong has just carved "Record of Duanzhou Stone Chamber," 386 characters in vigorous regular script. You trace the stone and feel a horseshoe-shaped mark of unknown age. Over the next millennium, Bao Zheng, Zhou Dunyi, Yu Dayou, Li Jian and hundreds more will cover these cliffs with over 500 inscriptions, making Seven Star Crags the densest cliff-carving cluster in southern China — what Chen Yi called the "Millennium Poetry Gallery."' },
    scenes: [{ speaker: 0, q: { zh: '七星岩现存最早的摩崖石刻是哪一方？', en: 'Which is the earliest surviving cliff inscription at Seven Star Crags?' }, options: [
      { text: { zh: '唐代李邕的《端州石室记》，刻于开元十五年（727年）', en: 'Li Yong\'s "Record of Duanzhou Stone Chamber," carved in 727 CE' }, correct: true, feedback: { zh: '李邕于开元十五年正月廿五日题刻《端州石室记》，正文连题款共十八行三百八十六字，因石面有马蹄形印记又称"马蹄碑"。这是七星岩五百余方石刻中年代最早的一方。', en: 'Li Yong carved this inscription on the 25th day of the first month, 727 CE — 18 lines, 386 characters. A horseshoe mark earned it the nickname "Horseshoe Stele." It is the earliest of over 500 inscriptions at Seven Star Crags.' } },
      { text: { zh: '宋代包拯的题名石刻', en: 'Bao Zheng\'s Song-era inscribed name' }, correct: false, feedback: { zh: '包拯确在七星岩留有题刻，内容为"知郡事包拯同至，庆历二年三月九日题"，但这是北宋庆历二年（1042年），比李邕的开元十五年（727年）晚了三百余年。', en: 'Bao Zheng did leave an inscription here — "Prefect Bao Zheng visited, 9th day of the 3rd month, Qingli 2nd year" — but that was 1042 CE, over three centuries after Li Yong\'s 727 CE carving.' } },
    ] }, { q: { zh: '七星岩摩崖石刻共有多少方？', en: 'How many cliff inscriptions are there at Seven Star Crags?' }, options: [
      { text: { zh: '五百余方，涵盖唐、宋、元、明、清至近现代', en: 'Over 500, spanning Tang, Song, Yuan, Ming, Qing to modern times' }, correct: true, feedback: { zh: '据统计，七星岩摩崖石刻共五百三十一方，其中唐代四方、宋代八十方、元代十三方、明代一百四十六方、清代一百十七方。篆隶楷行草各体皆备，2001年列为全国重点文物保护单位。', en: 'Statistics record 531 inscriptions: 4 Tang, 80 Song, 13 Yuan, 146 Ming, 117 Qing. All major script styles are represented. It was listed as a national-level protected heritage site in 2001.' } },
      { text: { zh: '不足一百方，主要是清代文人题诗', en: 'Fewer than 100, mainly Qing-era poems' }, correct: false, feedback: { zh: '实际数量远超百方。七星岩摩崖石刻共五百三十一方，是南中国保存最集中、数量最多的石刻群之一，有"千年诗廊"之称。', en: 'Far more than 100. With 531 inscriptions, Seven Star Crags is one of southern China\'s densest and best-preserved carving clusters, known as the "Millennium Poetry Gallery."' } },
    ] }],
    reward: { badge: '⛰️', badgeName: { zh: '山水题刻印', en: 'Seal of Landscape Inscriptions' }, insight: { zh: '唐开元十五年，李邕途经端州，在石室岩壁上刻下《端州石室记》，三百八十六字楷书遒劲，因石面马蹄形印记又称"马蹄碑"。此后一千三百年间，包拯、周敦颐、俞大猷、黎简、朱德、叶剑英……五百三十一方题刻层层叠压在这片不足一点五平方公里的崖壁上，篆隶楷行草各体皆备，构成南中国最密集的摩崖石刻群。2001年列为全国重点文物保护单位。这些石头不只是书法展览——每一方题刻都是一位旅人在山水间留下的时间戳，把端州如何被观看、被书写、被治理，逐层刻进了岩壁深处。', en: 'In 727 CE, Li Yong passed through Duanzhou and carved 386 characters onto Stone Chamber Cliff — the "Horseshoe Stele." Over the next 1,300 years, Bao Zheng, Zhou Dunyi, Yu Dayou, Li Jian, Zhu De, Ye Jianying and hundreds more layered 531 inscriptions onto less than 1.5 square kilometers of cliff face, every major script style represented. Listed as national heritage in 2001, these stones are not a calligraphy gallery — each carving is a traveler\'s timestamp, recording how Duanzhou was seen, written and governed, layer by layer into the rock.' } },
  },
  'N-CV08': {
    characters: [{ name: { zh: '澳门石匠', en: 'Macau Mason' }, role: { zh: '大三巴立面见证者', en: 'Witness of the St. Paul facade' }, portrait: '' }],
    intro: { zh: '你是1835年1月26日黄昏中国澳门街头的一名华人石匠。远处圣保禄学院方向突然浓烟冲天，火光把半座城映成橘红。你赶到时，教堂已焚烧两个多小时，穹顶坍塌，石柱断裂。唯独那面花岗岩前壁屹立不倒——三层巴洛克立面上的圣母像、菊花纹、石狮子和汉字在余烬中依然可辨。这面墙始建于1602年，由意大利耶稣会士设计、日本工匠建造，1637年才最终竣工。如今学院已毁，只剩前壁和六十八级石阶，本地人因其形似中国牌坊，称之为"大三巴"。', en: 'You are a Chinese stonemason on the streets of Macao at dusk, January 26, 1835. Smoke rises from St. Paul\'s College — fire engulfs the church for over two hours. The dome collapses, columns crack. Only the granite facade stands: three tiers of Baroque relief — the Virgin, chrysanthemums, stone lions, Chinese characters — still visible in the embers. This wall was begun in 1602, designed by an Italian Jesuit, built by Japanese craftsmen, completed in 1637. The college is gone; only the facade and 68 steps remain. Locals call it "Sanba," for it resembles a Chinese memorial archway.' },
    scenes: [{ speaker: 0, q: { zh: '大三巴牌坊是哪座建筑的遗址？', en: 'The Ruins of St. Paul\'s are the remains of which building?' }, options: [
      { text: { zh: '圣保禄教堂前壁，附属于圣保禄学院', en: 'The facade of St. Paul\'s Church, affiliated with St. Paul\'s College' }, correct: true, feedback: { zh: '圣保禄教堂附属于圣保禄学院。该学院1594年成立，是远东第一所西式大学，设文法、人文、伦理神学等学部，培养赴中国、日本、越南等地的传教士。教堂1602年奠基，1637年竣工，1835年大火后仅存前壁。', en: 'St. Paul\'s Church was affiliated with St. Paul\'s College, founded in 1594 as the first Western-style university in the Far East. The church was begun in 1602, completed in 1637, and only its facade survived the 1835 fire.' } },
      { text: { zh: '澳门总督府的正门门楼', en: 'The gateway of the Macao Governor\'s Palace' }, correct: false, feedback: { zh: '大三巴是圣保禄教堂前壁遗址，与总督府无关。教堂附属于1594年成立的圣保禄学院——远东第一所西式大学。', en: 'The ruins are the facade of St. Paul\'s Church, unrelated to any government building. The church belonged to St. Paul\'s College, the first Western university in the Far East, founded in 1594.' } },
    ] }, { q: { zh: '圣保禄学院在中国文化交流史上有什么特殊地位？', en: 'What is St. Paul\'s College\'s special role in cultural exchange?' }, options: [
      { text: { zh: '它是远东第一所西式大学，培养赴东方传教的耶稣会士', en: 'The first Western-style university in the Far East, training Jesuit missionaries for the East' }, correct: true, feedback: { zh: '圣保禄学院1594年成立、1762年关闭，设文法学部、人文学部、伦理神学部等。利玛窦等传教士经澳门入华，带来西方天文、数学与地理知识，同时学习中文与中国典籍，推动中西文化双向交流。', en: 'Founded 1594, closed 1762, with faculties in grammar, humanities and theology. Missionaries like Matteo Ricci entered China via Macao, bringing Western astronomy, mathematics and geography while studying Chinese — a two-way cultural exchange.' } },
      { text: { zh: '只是一所普通的葡萄牙语言学校', en: 'Only an ordinary Portuguese language school' }, correct: false, feedback: { zh: '圣保禄学院远非语言学校。它是远东第一所西式大学，设多个学部，系统培养传教士，在中国与欧洲之间架起知识与信仰的双向通道。', en: 'Far from a language school. It was the first Western university in the Far East with multiple faculties, systematically training missionaries and bridging knowledge and faith between China and Europe.' } },
    ] }],
    reward: { badge: '⛪', badgeName: { zh: '东西石门印', en: 'Seal of the East-West Facade' }, insight: { zh: '1594年，圣保禄学院在中国澳门成立，是远东第一所西式大学，设文法、人文、伦理神学等学部，培养赴中国、日本及东南亚的传教士。附属教堂1602年奠基，由意大利耶稣会士设计、日本工匠建造，1637年竣工，前壁上巴洛克浮雕与中国石狮、汉字并置，本身就是中西合璧的实物证据。1835年1月26日大火焚毁学院与教堂，唯独前壁和六十八级石阶幸存，本地人因其形似牌坊称之为"大三巴"。2005年，大三巴作为"澳门历史城区"核心组成部分列入世界文化遗产名录。一面残壁，浓缩了四百年中西相遇的全部复杂性。', en: 'In 1594, St. Paul\'s College was founded in Macao — the first Western-style university in the Far East, training missionaries for China, Japan and Southeast Asia. Its church, begun in 1602, was designed by an Italian Jesuit and built by Japanese craftsmen; its Baroque facade bears Chinese stone lions and characters — material proof of East-West fusion. The fire of January 26, 1835 destroyed college and church, leaving only the facade and 68 steps. In 2005, it was inscribed as part of the "Historic Centre of Macao" World Heritage. One ruined wall condenses four centuries of encounter.' } },
  },
  'N-CV09': {
    characters: [{ name: { zh: '东坡行者', en: 'Su Shi Walker' }, role: { zh: '惠州西湖记忆讲述者', en: 'Narrator of Huizhou West Lake' }, portrait: '' }],
    intro: { zh: '你是绍圣元年（1094年）十月二日抵达惠州的一名船夫。你载的客人年近六旬，面色疲惫却目光清亮——他叫苏轼，字子瞻，因"讥讪先朝"贬为宁远军节度副使，惠州安置，不得签书公事。船过罗浮山时，他忽然笑了，说"四时春"三字。寓居合江楼后，他尝到新鲜荔枝，写下"日啖荔枝三百颗，不辞长作岭南人"。两年七个月里，他捐出犀带修西新桥、筑苏堤，写下近六百篇诗文。惠州人后来把这条堤叫"苏公堤"。', en: 'You are a boatman on October 2, 1094, arriving in Huizhou. Your passenger is nearly sixty, weary but clear-eyed — Su Shi, banished for "slandering the former reign," forbidden from signing official documents. Passing Mount Luofu, he laughs and says "four seasons of spring." After settling in, he tastes fresh lychee and writes: "Three hundred lychees a day — I\'ll gladly be a Lingnan man." In two years and seven months, he donates his rhinoceros-horn belt to build the Xixin Bridge and Su Causeway, writes nearly 600 poems and essays. Huizhou people name the embankment "Lord Su\'s Causeway."' },
    scenes: [{ speaker: 0, q: { zh: '苏轼被贬惠州是在哪一年？', en: 'In which year was Su Shi exiled to Huizhou?' }, options: [
      { text: { zh: '绍圣元年（1094年），贬为宁远军节度副使，惠州安置', en: '1094 (Shaosheng 1st year), exiled as deputy military commissioner, placed in Huizhou' }, correct: true, feedback: { zh: '绍圣元年，哲宗亲政，章惇为相，贬斥元祐旧臣。苏轼被指起草诏令中"语涉讥讪"，六月行至当途再贬，十月二日携幼子苏过、侍妾朝云抵达惠州，寓居合江楼。', en: 'In 1094, Emperor Zhezong and Chancellor Zhang Dun purged old ministers. Su Shi was accused of "slandering" in imperial edicts he had drafted; re-exiled in June, he arrived in Huizhou on October 2 with his son Su Guo and concubine Zhaoyun.' } },
      { text: { zh: '元祐元年（1086年），因新旧党争外放', en: '1086 (Yuanyou 1st year), sent out due to factional struggle' }, correct: false, feedback: { zh: '元祐年间苏轼确因党争有外放经历，但被贬惠州是绍圣元年（1094年）的事，比元祐元年晚了八年。', en: 'Su Shi did face exile during the Yuanyou era, but his banishment to Huizhou was in 1094 — eight years later than 1086.' } },
    ] }, { q: { zh: '苏轼在惠州修筑的堤桥叫什么名字？', en: 'What did Su Shi name the causeway and bridge he built in Huizhou?' }, options: [
      { text: { zh: '西新桥与苏公堤（苏堤），他为此捐出皇帝赐予的犀带', en: 'Xixin Bridge and Su Causeway — he donated his imperial rhinoceros-horn belt for it' }, correct: true, feedback: { zh: '惠州西湖无桥，居民涉水常出事故。苏轼与地方官商议建造两座桥：西江口建浮桥"东新桥"，西湖上筑堤修桥"西新桥"。他捐出犀带，动员弟妇史氏捐出黄金钱。惠州人将此堤命名为"苏公堤"，简称苏堤。', en: 'With no bridge on West Lake, residents drowned crossing. Su Shi and local officials built two bridges: a pontoon "Dongxin Bridge" at the river mouth, and "Xixin Bridge" with a causeway on the lake. He donated his imperial belt and persuaded his sister-in-law to give gold coins. Huizhou people named it "Lord Su\'s Causeway."' } },
      { text: { zh: '东坡堤，由惠州百姓自发募捐修建', en: 'Dongpo Causeway, built by Huizhou citizens\' spontaneous donations' }, correct: false, feedback: { zh: '堤桥的正式名称是西新桥与苏公堤（苏堤）。苏轼亲自参与筹划，并捐出犀带资助工程，并非百姓自发募捐。', en: 'The formal names are Xixin Bridge and Su Causeway. Su Shi personally planned the project and donated his imperial belt — it was not a spontaneous citizen effort.' } },
    ] }],
    reward: { badge: '🌙', badgeName: { zh: '东坡湖光印', en: 'Seal of Su Shi Lake Light' }, insight: { zh: '绍圣元年（1094年），五十七岁的苏轼贬谪惠州，"不得签书公事"。然而两年七个月里，他写下近六百篇诗文，"日啖荔枝三百颗，不辞长作岭南人"即作于此。他见西湖无桥，居民涉水多有溺亡，便与地方官商议建造东新桥与西新桥，捐出皇帝赐予的犀带，动员弟妇史氏捐出黄金钱。惠州人将湖堤命名为"苏公堤"。绍圣四年（1097年）四月，苏轼再贬儋州，离开惠州。"一自坡公谪南海，天下不敢小惠州"——一位贬官用诗文与工程，让一座岭南小城从此拥有了不可替代的文化坐标。', en: 'In 1094, the 57-year-old Su Shi was exiled to Huizhou, forbidden from official duties. In two years and seven months, he wrote nearly 600 works — "three hundred lychees a day, I\'ll gladly be a Lingnan man" among them. Seeing residents drown crossing the bridgeless lake, he worked with local officials to build two bridges, donating his imperial belt and persuading family to give gold. Huizhou named the embankment "Lord Su\'s Causeway." In 1097 he was exiled again to Danzhou. "Since Lord Su was banished south, no one dares slight Huizhou" — an exile gave a small Lingnan city an irreplaceable cultural coordinate.' } },
  },
  'N-CV10': {
    characters: [{ name: { zh: '南社族老', en: 'Nanshe Elder' }, role: { zh: '明清村落守望者', en: 'Keeper of the Ming-Qing village' }, portrait: '' }],
    intro: { zh: '你是明崇祯十七年（1644年）十月东莞茶山南社村的一名谢氏青年。族老召集全族，说流寇四起，须夯土筑围墙。你随众人拉红线、和泥浆，沿村界筑起全长三百零二丈半的围墙，建樵楼二十一座，各有名目楹联。围墙后来抵御了顺治五年李万荣七日围攻、康熙十年刘进犯村。你站在长形水塘边，看着二十二间祠堂和两百多间古民居沿塘铺展——谢氏大宗祠三进院落的陶塑瓦脊在阳光下泛着釉光，百岁坊的歇山顶飞檐翘起。八百年前，始祖谢尚仁从会稽经珠玑巷南迁至此，如今这里已是珠三角保存最完整的血缘宗族古村落。', en: 'You are a young Xie clansman in Nanshe village, Chashan, Dongguan, in October 1644. Elders call the clan together: bandits roam, ramparts must be built. You haul lines and mix mud, raising a wall 302.5 zhang long with 21 watchtowers, each named and inscribed. The wall later withstands a seven-day siege in 1648 and an attack in 1671. By the long pond, 22 ancestral halls and over 200 old houses spread out — the Xie Grand Hall\'s three-courtyard ceramic ridge glints in the sun, the Centenarian Arch\'s flying eaves rise. Eight centuries ago, founder Xie Shangren migrated here from Kuaiji via Zhuji Lane; today this is the Pearl Delta\'s best-preserved clan village.' },
    scenes: [{ speaker: 0, q: { zh: '南社古村的始祖是谁？从何处迁来？', en: 'Who was the founding ancestor of Nanshe village, and where did he come from?' }, options: [
      { text: { zh: '谢尚仁，南宋末年从会稽（今浙江绍兴）经珠玑巷南迁定居', en: 'Xie Shangren, who migrated from Kuaiji (modern Shaoxing) via Zhuji Lane in the late Southern Song' }, correct: true, feedback: { zh: '据《南社谢氏族谱》记载，南宋末年会稽人谢希良之子谢尚仁因战乱南迁，于宋恭帝德祐乙亥元年（1275年）定居南社，历经元明清数百年发展，逐步形成以谢姓为主的村落。', en: 'Per the Xie clan genealogy, Xie Shangren — son of a Kuaiji man — fled war southward and settled in Nanshe in 1275. Over Yuan, Ming and Qing, the village grew into a Xie-dominated clan settlement.' } },
      { text: { zh: '谢安，东晋名臣，从南京迁来', en: 'Xie An, the Eastern Jin statesman, from Nanjing' }, correct: false, feedback: { zh: '南社始祖是南宋末年的谢尚仁，从会稽经珠玑巷南迁，于1275年定居南社。谢安是东晋名臣，时代与迁徙路线均不符。', en: 'The founding ancestor was Xie Shangren of the late Southern Song, who came from Kuaiji via Zhuji Lane and settled in 1275. Xie An was an Eastern Jin statesman — wrong era and route.' } },
    ] }, { q: { zh: '南社古村现存祠堂约有多少间？', en: 'Approximately how many ancestral halls survive in Nanshe village?' }, options: [
      { text: { zh: '约二十二间祠堂、两百多间古民居', en: 'About 22 halls and over 200 old houses' }, correct: true, feedback: { zh: '南社明清古村落现存祠堂达二十二间，古民居两百多间，另有古井四十眼、庙宇五座。谢氏大宗祠、百岁翁祠、百岁坊、谢遇奇家庙、资政第等是其代表性建筑。2006年列为全国重点文物保护单位。', en: 'Nanshe preserves 22 halls, over 200 old houses, 40 wells and 5 temples. The Xie Grand Hall, Centenarian Shrine, Centenarian Arch, Xie Yuqi Family Temple and Zizheng Residence are highlights. It is a national-level protected heritage site.' } },
      { text: { zh: '只有三间，规模很小', en: 'Only three, on a very small scale' }, correct: false, feedback: { zh: '南社古村现存祠堂达二十二间，是珠三角保存最完整的明清古村落之一，规模远超三间。', en: 'Nanshe has 22 surviving halls — one of the Pearl Delta\'s best-preserved Ming-Qing villages, far more than three.' } },
    ] }],
    reward: { badge: '🏘️', badgeName: { zh: '宗族水乡印', en: 'Seal of the Clan Water Village' }, insight: { zh: '南宋德祐元年（1275年），会稽人谢尚仁经珠玑巷南迁，定居东莞茶山南社。此后七百余年，谢氏一族在长形水塘两岸建祠堂、修家庙、筑围墙，逐步形成占地约十一万平方米的明清古村落。明崇祯十七年（1644年）十月，族人夯土筑围墙三百零二丈半、樵楼二十一座，先后抵御顺治五年与康熙十年的两次围攻。现存祠堂二十二间、古民居两百多间、古井四十眼，谢氏大宗祠三进院落的陶塑瓦脊、百岁坊的歇山顶飞檐、资政第的木雕灰塑，皆为岭南民间工艺的精品。这里是珠三角保存最完整的血缘宗族古村落——一座用砖石与族谱写就的乡村治理标本。', en: 'In 1275, Xie Shangren migrated from Kuaiji via Zhuji Lane and settled in Nanshe, Chashan, Dongguan. Over 700 years, the Xie clan built halls, family temples and ramparts along a long pond, forming an 110,000-square-meter Ming-Qing village. In October 1644, the clan raised a 302.5-zhang earthen wall with 21 watchtowers, repelling sieges in 1648 and 1671. Today 22 halls, 200+ houses and 40 wells survive; the Xie Grand Hall\'s ceramic ridges, the Centenarian Arch\'s flying eaves and the Zizheng Residence\'s wood carvings are Lingnan craft masterpieces — the Pearl Delta\'s best-preserved clan village, a specimen of rural governance written in brick, stone and genealogy.' } },
  },

  // ============ 新增锚点 · 现代化与超级工程 ============
  'N-EG05': {
    characters: [{ name: { zh: '桥梁工程师', en: 'Bridge Engineer' }, role: { zh: '虎门大桥建设见证者', en: 'Witness of Humen Bridge' }, portrait: '' }],
    intro: { zh: '1992年10月28日,你是虎门大桥工地上的一名桥梁工程师。这是中国自行设计建造的第一座特大型悬索桥,横跨珠江狮子洋,连接广州南沙与东莞虎门。此前珠江口东西两岸只有汽车渡口,运力严重不足。你站在狮子洋入海口的风中,脚下是将要承载888米主跨径悬索桥主缆的锚碇基坑。按计划,大桥要在1997年6月9日建成通车——距香港回归仅21天。', en: 'October 28, 1992. You are a bridge engineer on the Humen Bridge site — China\'s first self-designed large suspension bridge, spanning the Lion\'s Channel of the Pearl River, linking Nansha (Guangzhou) and Humen (Dongguan). Before this, only a car ferry crossed, badly overloaded. You stand in the wind at the estuary, above the anchor pit for the 888-meter main span cables. The target: open June 9, 1997 — 21 days before Hong Kong\'s return.' },
    scenes: [{ speaker: 0, q: { zh: '虎门大桥于哪一天建成通车?', en: 'On what date did Humen Bridge open to traffic?' }, options: [
      { text: { zh: '1997年6月9日', en: 'June 9, 1997' }, correct: true, feedback: { zh: '虎门大桥1992年10月28日动工,1997年6月9日建成通车,距香港回归仅21天。通车后使珠江口两岸通车里程缩短120多公里,改写了粤港澳三地"一水隔天涯"的格局。1999年4月20日通过竣工验收,江泽民题写桥名。', en: 'Construction began October 28, 1992; opened June 9, 1997 — 21 days before Hong Kong\'s return. It shortened cross-estuary routes by over 120 km. Final acceptance April 20, 1999. Jiang Zemin inscribed the bridge name.' } },
      { text: { zh: '1999年4月20日通车', en: 'April 20, 1999' }, correct: false, feedback: { zh: '1999年4月20日是竣工验收日期,不是通车日期。虎门大桥于1997年6月9日正式建成通车,距香港回归仅21天,通车后珠江口两岸缩短120多公里。', en: 'April 20, 1999 was final acceptance, not opening. The bridge opened June 9, 1997 — 21 days before Hong Kong\'s return — shortening cross-estuary routes by over 120 km.' } },
    ] }, { speaker: 0, q: { zh: '虎门大桥通车后,珠江口两岸的行车里程缩短了多少?', en: 'How much did Humen Bridge shorten travel distance across the estuary?' }, options: [
      { text: { zh: '缩短了120多公里', en: 'Over 120 km' }, correct: true, feedback: { zh: '虎门大桥通车前,东莞、深圳及粤东地区到珠海、中山、江门等地需绕道,行车里程多出120多公里。大桥建成后使东西两岸直连,被称为中国第一座大型悬索桥,主航道跨径888米,当时居全国前列,被誉为"世界第一跨"。', en: 'Before the bridge, the route from Dongguan/Shenzhen/eastern Guangdong to Zhuhai/Zhongshan/Jiangmen required a 120+ km detour. The bridge connected both banks directly. With an 888-meter main span, it was China\'s first large suspension bridge, called the "world\'s first crossing."' } },
      { text: { zh: '缩短了10公里', en: '10 km' }, correct: false, feedback: { zh: '实际缩短120多公里,远超10公里。虎门大桥横跨珠江狮子洋,通车后东莞、深圳及粤东地区到珠海、中山、江门粤西地区无须绕道,行车里程缩短120多公里。', en: 'The actual reduction was over 120 km, far more than 10. The bridge spans the Lion\'s Channel, eliminating detours and shortening routes by 120+ km.' } },
    ] }],
    reward: { badge: '🌁', badgeName: { zh: '虎门跨海印', en: 'Seal of the Humen Crossing' }, insight: { zh: '虎门大桥1992年10月28日动工、1997年6月9日建成通车,距香港回归仅21天。它是中国自行设计建造的第一座特大型悬索桥,横跨珠江狮子洋,连接广州南沙与东莞虎门,主航道跨径888米,通车时居全国前列,被誉为"世界第一跨"。大桥全长约15.78公里,通车后珠江口两岸行车里程缩短120多公里,改写了粤港澳三地"一水隔天涯"的格局。它代表了二十世纪中国桥梁建设的最高成就,为后来港珠澳大桥、深中通道等超级工程铺垫了跨海时代的想象力。', en: 'Construction began October 28, 1992; opened June 9, 1997 — 21 days before Hong Kong\'s return. China\'s first self-designed large suspension bridge, it spans the Lion\'s Channel linking Nansha (Guangzhou) and Humen (Dongguan). Main span: 888 meters, among China\'s largest at the time, hailed as "world\'s first crossing." Total length ~15.78 km; it shortened cross-estuary routes by 120+ km, ending the "separated by one river" era. It represented the pinnacle of 20th-century Chinese bridge engineering, paving the way for later mega-crossings.' } },
  },
  'N-EG06': {
    characters: [{ name: { zh: '港口调度员', en: 'Port Dispatcher' }, role: { zh: '南沙港物流观察者', en: 'Observer of Nansha logistics' }, portrait: '' }],
    intro: { zh: '2004年，南沙港正式开港，扼珠江口伶仃洋航道要冲，广州由此重新面向外海。你是南沙港一期码头的一名调度员，看着深水泊位从图纸变成现实。此后近二十年间，南沙港飞速成长——2023年集装箱吞吐量突破1900万标箱，开通超过150条外贸航线，连接全球100多个国家和地区的400多个港口。龙门吊日夜起落，集卡川流不息，你手中的调度屏上闪烁的是一条条延伸到全球的供应链网络。', en: 'In 2004, Nansha Port officially opened at the strategic chokepoint of the Lingdingyang channel at the Pearl River estuary, giving Guangzhou a new ocean-facing gateway. You are a dispatcher at the Phase I terminal, watching deep-water berths turn from blueprints into reality. Over the next two decades, Nansha grew rapidly — in 2023, container throughput exceeded 19 million TEU, with over 150 foreign trade routes connecting to 400+ ports in 100+ countries and regions worldwide. Gantry cranes rise and fall day and night; trucks stream endlessly; your dispatch screen flickers with supply chains stretching across the globe.' },
    scenes: [{ speaker: 0, q: { zh: '南沙港代表了什么样的新海上丝路?', en: 'What kind of new maritime route does Nansha Port represent?' }, options: [
      { text: { zh: '由深水泊位、集装箱、冷链和海关系统构成的供应链网络', en: 'A supply-chain network of berths, containers, cold chains and customs systems' }, correct: true, feedback: { zh: '南沙港2004年开港后迅速崛起，2023年集装箱吞吐量突破1900万标箱，开通超150条外贸航线连接全球100多个国家和地区的400多个港口，现代港口的力量来自深水泊位、集装箱物流和海关系统的协同运转。', en: 'Since opening in 2004, Nansha Port rose rapidly — 2023 throughput exceeded 19 million TEU, with 150+ foreign trade routes connecting 400+ ports in 100+ countries. Modern port power comes from the coordinated operation of berths, container logistics, and customs systems.' } },
      { text: { zh: '只靠古代帆船和市集', en: 'Only ancient sails and markets' }, correct: false, feedback: { zh: '南沙港的关键词是现代物流与全球供应链，与古代帆船和市集无关。它代表的是2023年超1900万标箱、150条外贸航线的精密物流基础设施。', en: 'Nansha Port is about modern logistics and global supply chains, not ancient sails. It represents precision logistics infrastructure of 19M+ TEU in 2023 and 150 foreign trade routes.' } },
      { text: { zh: '只服务珠三角内河运输', en: 'Only serves Pearl River Delta inland water transport' }, correct: false, feedback: { zh: '南沙港是深水海港，扼珠江口伶仃洋航道要冲，连接全球100多个国家和地区的400多个港口，远非内河运输码头。它让广州重新面向外海。', en: 'Nansha is a deep-water seaport at the Lingdingyang channel, connecting 400+ ports in 100+ countries — far from an inland river terminal. It gives Guangzhou a new ocean gateway.' } },
    ] }, { speaker: 0, q: { zh: '2023年南沙港集装箱吞吐量突破了哪个里程碑？', en: 'What milestone did Nansha Port\'s container throughput surpass in 2023?' }, options: [
      { text: { zh: '突破1900万标箱', en: 'Exceeded 19 million TEU' }, correct: true, feedback: { zh: '2023年，南沙港集装箱吞吐量突破1900万标准箱，南沙港区全年集装箱吞吐量超过1800万标箱，稳居全球前十。开通超150条外贸航线，连接全球100多个国家和地区的400多个港口，是华南地区最大的综合性枢纽港之一。', en: 'In 2023, Nansha Port container throughput exceeded 19 million TEU, ranking among the world\'s top 10. With 150+ foreign trade routes connecting 400+ ports in 100+ countries, it is one of South China\'s largest comprehensive hub ports.' } },
      { text: { zh: '突破500万标箱', en: 'Exceeded 5 million TEU' }, correct: false, feedback: { zh: '500万标箱远低于南沙港的实际水平。南沙港2004年开港后高速增长，2023年吞吐量已突破1900万标箱，500万只是它早期的规模。', en: '5 million TEU is far below Nansha\'s actual level. Since opening in 2004, it grew rapidly; by 2023 throughput exceeded 19 million TEU. 5 million was its early-stage scale.' } },
      { text: { zh: '突破800万标箱', en: 'Exceeded 8 million TEU' }, correct: false, feedback: { zh: '800万标箱是南沙港2010年代中期的水平。到2023年，南沙港集装箱吞吐量已突破1900万标箱，翻了一倍多。', en: '8 million TEU was Nansha\'s mid-2010s level. By 2023, throughput exceeded 19 million TEU — more than doubled.' } },
      { text: { zh: '突破1200万标箱', en: 'Exceeded 12 million TEU' }, correct: false, feedback: { zh: '1200万标箱仍低于南沙港2023年的实际吞吐量。2023年南沙港集装箱吞吐量突破1900万标箱，1200万大约是其2018年左右的水平。', en: '12 million TEU is still below Nansha\'s 2023 actual throughput. In 2023, it exceeded 19 million TEU; 12 million was roughly its 2018 level.' } },
    ] }],
    reward: { badge: '📦', badgeName: { zh: '集装箱航路印', en: 'Seal of Container Routes' }, insight: { zh: '珠江口的港口谱系跨越千年：古代黄埔港是海上丝绸之路的起点，清代十三行时期广州一口通商，鸦片战争后黄埔港逐渐衰落。2004年南沙港正式开港，扼伶仃洋航道要冲，让广州重新获得深水海港。此后近二十年间，南沙港飞速成长为华南最大综合性枢纽港之一——2023年集装箱吞吐量突破1900万标箱，开通超150条外贸航线连接全球100多个国家和地区的400多个港口。从黄埔到南沙，珠江口的港口从古代贸易节点演变为现代物流基础设施，南沙港作为"一带一路"重要节点，把千年海上丝绸之路延续为精密运转的全球供应链网络。', en: 'The Pearl River estuary\'s port lineage spans millennia: ancient Huangpu Port was a Maritime Silk Road starting point; during the Qing Thirteen Factories era, Guangzhou was the sole trading port; after the Opium War, Huangpu declined. In 2004, Nansha Port opened at the strategic Lingdingyang channel, giving Guangzhou a deep-water seaport again. Over two decades, Nansha grew into one of South China\'s largest comprehensive hub ports — 2023 throughput exceeded 19 million TEU, with 150+ foreign trade routes connecting 400+ ports in 100+ countries. From Huangpu to Nansha, the estuary\'s ports evolved from ancient trade nodes to modern logistics infrastructure; as a Belt and Road node, Nansha extends the millennia-old Maritime Silk Road into a precision-running global supply chain network.' } },
  },
  'N-EG07': {
    characters: [{ name: { zh: '横琴规划师', en: 'Hengqin Planner' }, role: { zh: '制度工程观察者', en: 'Observer of institutional engineering' }, portrait: '' }],
    intro: { zh: '2009年8月14日，国务院正式批复《横琴总体发展规划》，你作为横琴新区规划组成员站在与澳门仅一河之隔的莲花大桥旁。对面就是中国澳门的霓虹灯牌，脚下这片曾经种甘蔗、养蚝的荒岛，即将变成中国面积最大的粤澳合作示范区。2021年9月，《横琴粤澳深度合作区建设总体方案》发布，横琴被赋予"一线放开、二线管住"的分线管理新模式，面积106.46平方公里的岛屿，从此同时运行内地与澳门两种规则的实验场。你翻开规划图，看到的不只是路网和楼宇，更是一套跨境制度如何被逐条设计。', en: 'August 14, 2009. The State Council approves the Hengqin Master Development Plan. You are a planner in the new Hengqin district, standing by Lotus Bridge — just a river away from Macao. This island once grew sugarcane and farmed oysters; now it is about to become China\'s largest Guangdong-Macao cooperation zone. In September 2021, the Master Plan for the Hengqin Guangdong-Macao Deep Cooperation Zone introduces a "first-line open, second-line controlled" customs model. On 106.46 sq km, two systems — mainland and Macao — will run side by side as a living experiment.' },
    scenes: [{ speaker: 0, q: { zh: '国务院于哪一年正式批复《横琴总体发展规划》？', en: 'In what year did the State Council formally approve the Hengqin Master Development Plan?' }, options: [
      { text: { zh: '2009年8月14日', en: 'August 14, 2009' }, correct: true, feedback: { zh: '2009年8月14日，国务院正式批复《横琴总体发展规划》，将横琴定位为"一国两制"下探索粤澳合作新模式的示范区。横琴新区总面积约106平方公里，是中国面积最大的国家级新区之一。', en: 'On August 14, 2009, the State Council approved the Hengqin Master Development Plan, positioning it as a pilot zone for Guangdong-Macao cooperation under "One Country, Two Systems." At about 106 sq km, it is one of China\'s largest national-level new districts.' } },
      { text: { zh: '2015年3月1日', en: 'March 1, 2015' }, correct: false, feedback: { zh: '2015年是广东自贸区横琴片区挂牌的时间，而非总体发展规划批复时间。国务院批复《横琴总体发展规划》是在2009年8月14日，比自贸区挂牌早了六年。', en: '2015 was when the Guangdong FTZ Hengqin section was inaugurated, not when the master plan was approved. The State Council approved the plan on August 14, 2009, six years earlier.' } },
    ] }, { speaker: 0, q: { zh: '2021年发布的横琴粤澳深度合作区建设总体方案中，"一线放开、二线管住"的含义是什么？', en: 'What does the "first-line open, second-line controlled" customs model in the 2021 Hengqin Cooperation Zone plan mean?' }, options: [
      { text: { zh: '横琴与澳门之间为"一线"，货物、人员基本自由流动；横琴与内地其他地区之间为"二线"，实施海关监管', en: 'The "first line" is between Hengqin and Macao with largely free flow; the "second line" is between Hengqin and the rest of mainland China with customs oversight' }, correct: true, feedback: { zh: '"一线放开、二线管住"是横琴粤澳深度合作区的核心制度创新。横琴与澳门之间的"一线"口岸实行高度便利化的通关模式，而横琴与内地其他地区之间的"二线"通道则保留海关查验，使横琴成为一个制度缓冲带。2024年3月1日零时起，横琴正式实施分线管理，封关运行。', en: 'This is the core institutional innovation of the Hengqin Cooperation Zone. The "first line" between Hengqin and Macao enables highly facilitated clearance, while the "second line" between Hengqin and the rest of mainland China retains customs checks, making Hengqin a regulatory buffer. On March 1, 2024, Hengqin officially began operating under this dual-line system.' } },
      { text: { zh: '横琴全岛完全取消海关，不再有任何查验', en: 'Hengqin completely eliminates all customs checks' }, correct: false, feedback: { zh: '并非完全取消海关。横琴的分线管理是在"一线"高度便利化的同时在"二线"保留监管，既促进琴澳一体化，又维护内地海关体系完整。2024年3月1日正式封关运行后，这条规则已在日常中落地。', en: 'Customs are not eliminated. The dual-line model facilitates the "first line" while retaining oversight at the "second line," promoting Hengqin-Macao integration while maintaining mainland customs integrity. This took effect on March 1, 2024.' } },
    ] }],
    reward: { badge: '🧩', badgeName: { zh: '横琴协同印', en: 'Seal of Hengqin Collaboration' }, insight: { zh: '横琴从甘蔗蚝田到国家级新区，再到粤澳深度合作区，走过了从地理连接到制度实验的完整路径。2009年国务院批复《横琴总体发展规划》，赋予106平方公里的荒岛"一国两制"下探索粤澳合作新模式的使命。2021年《横琴粤澳深度合作区建设总体方案》发布，首创"一线放开、二线管住"分线管理制度。2024年3月1日零时正式封关运行，横琴成为全球罕见的在同一物理空间同时运行两套法律与行政体系的试验区。横琴提醒我们：最难的工程，有时不是建桥，而是让不同制度在同一片土地上协同运转。', en: 'From sugarcane and oyster fields to a national-level new district, then to a Guangdong-Macao deep cooperation zone, Hengqin traced a path from geographic connection to institutional experiment. The 2009 State Council approval gave 106 sq km of former farmland a mission: pilot Guangdong-Macao cooperation under "One Country, Two Systems." The 2021 Master Plan introduced the "first-line open, second-line controlled" customs model. On March 1, 2024, Hengqin officially began sealed operations, becoming one of the world\'s rare zones where two legal and administrative systems run simultaneously in the same physical space. Hengqin reminds us that the hardest engineering is sometimes not building bridges, but making different systems work together on the same land.' } },
  },
  'N-EG08': {
    characters: [{ name: { zh: '城市结构师', en: 'Urban Structuralist' }, role: { zh: '广州塔天际线讲述者', en: 'Narrator of Canton Tower skyline' }, portrait: '' }],
    intro: { zh: '2010年,你是广州塔钢结构安装团队的一名工程师。塔高600米——主体454米,天线桅杆146米,是当时中国第一高塔。外框筒由24根钢柱和46个钢椭圆环交叉构成,中部最细处直径仅30多米,被广州市民昵称为"小蛮腰"。你站在168米处的蜘蛛侠栈道旁,看着一万多个大小规格各不相同的倾斜钢构件被逐一精确安装。广州亚运会开幕在即,这座塔将在开幕式上向全球惊艳亮相。', en: '2010. You are an engineer on the Canton Tower steel installation team. Tower height: 600m — 454m main body, 146m antenna — China\'s tallest tower. The outer tube is formed by 24 steel columns and 46 elliptical rings, with a minimum waist diameter of just over 30m, nicknamed "Slim Waist" by Guangzhou citizens. You stand beside the Spider Walk at 168m, watching over 10,000 uniquely-sized tilted steel components being precisely installed. The Asian Games are approaching — this tower will dazzle the world at the opening ceremony.' },
    scenes: [{ speaker: 0, q: { zh: '广州塔塔身总高度是多少米?', en: 'What is the total height of Canton Tower?' }, options: [
      { text: { zh: '600米,其中主体454米,天线桅杆146米', en: '600m — 454m main body, 146m antenna' }, correct: true, feedback: { zh: '广州塔塔身主体高454米,天线桅杆高146米,总高度600米,是中国第一高塔。外框筒由24根钢柱和46个钢椭圆环交叉构成,塔身中部最细处直径只有30多米,是世界建筑物中腰身最细的。', en: 'Main body 454m, antenna 146m, total 600m — China\'s tallest tower. The outer tube has 24 columns and 46 elliptical rings; the waist narrows to just over 30m, the slimmest of any building in the world.' } },
      { text: { zh: '450米', en: '450m' }, correct: false, feedback: { zh: '总高度是600米,不是450米。主体塔身高454米,天线桅杆高146米,合计600米。广州塔是当时中国第一高塔,2010年广州亚运会前建成,为亚运会转播提供硬件支持。', en: 'Total height is 600m, not 450m. The main body is 454m, antenna 146m, totaling 600m. Canton Tower was China\'s tallest at completion, built for the 2010 Asian Games broadcast.' } },
    ] }, { speaker: 0, q: { zh: '广州塔外框筒的钢结构有什么独特之处?', en: 'What makes the Canton Tower outer steel tube unique?' }, options: [
      { text: { zh: '由24根钢柱和46个钢椭圆环交叉构成,一万多个倾斜钢构件大小规格全部不相同', en: '24 steel columns and 46 elliptical rings, with over 10,000 tilted components all uniquely sized' }, correct: true, feedback: { zh: '广州塔外框筒由24根钢柱和46个钢椭圆环交叉构成,形成镂空开放的独特造型。一万多个钢构件倾斜且大小规格全部不同,每个都需要精确安装。塔身168至334米处设有蜘蛛侠栈道,是世界最高最长的空中漫步云梯。', en: 'The outer tube combines 24 columns and 46 elliptical rings for a hollow, open form. Over 10,000 tilted steel components are each uniquely sized and precisely installed. The Spider Walk at 168-334m is the world\'s highest and longest skywalk.' } },
      { text: { zh: '所有钢构件都是统一规格,便于批量生产', en: 'All components are identical for mass production' }, correct: false, feedback: { zh: '恰恰相反——一万多个钢构件倾斜且大小规格全部不相同,每个都需要单独定制安装。这是广州塔施工难度最大的原因之一。它被称为"小蛮腰",正是因为两个大小不一的椭圆环错开旋转135度形成了纤细腰身。', en: 'The opposite — over 10,000 components are each uniquely sized and tilted, requiring individual fabrication and installation. This is why construction was so challenging. The "Slim Waist" comes from two unequal ellipses rotated 135 degrees, creating the slender midsection.' } },
    ] }],
    reward: { badge: '🗼', badgeName: { zh: '羊城天际印', en: 'Seal of the Canton Skyline' }, insight: { zh: '广州塔2005年动工,2009年9月竣工,2010年正式对外开放,为广州亚运会提供转播服务。总高度600米——主体454米、天线146米,是中国第一高塔,被广州市民昵称"小蛮腰"。外框筒由24根钢柱和46个钢椭圆环交叉构成,两个大小不一的椭圆错开旋转135度,形成中部最细处直径仅30多米的纤细腰身,是世界建筑物中腰身最细的。一万多个倾斜钢构件大小规格全部不相同,施工难度前所未有。塔上设有世界最高摩天轮(450-454米)、世界最高旋转餐厅(422.8米)和世界最高垂直速降游乐项目(484米)。可抵御8级地震、12级台风,设计使用年限超过100年。', en: 'Construction began 2005, completed September 2009, opened 2010 for the Asian Games broadcast. Total height 600m — 454m body, 146m antenna — China\'s tallest tower, nicknamed "Slim Waist." The outer tube combines 24 columns and 46 elliptical rings; two unequal ellipses rotated 135 degrees create a waist of just over 30m — the world\'s slimmest. Over 10,000 uniquely-sized tilted components made construction unprecedentedly difficult. The tower hosts the world\'s highest Ferris wheel (450-454m), revolving restaurant (422.8m) and vertical drop ride (484m). It withstands magnitude-8 earthquakes and force-12 typhoons, with a design life exceeding 100 years.' } },
  },
  'N-EG09': {
    characters: [{ name: { zh: '高铁乘务员', en: 'High-Speed Rail Attendant' }, role: { zh: '西九龙连接见证者', en: 'Witness of West Kowloon connection' }, portrait: '' }],
    intro: { zh: '2018年9月23日,你是广深港高铁中国香港段西九龙站的首发列车乘务员。西九龙站总建筑面积约43万平方米,以建筑楼面面积计算是目前世界最大的地底铁路站。旅客在同一站内即可完成内地和中国香港两地的通关手续——这叫"一地两检"。从今天起,中国香港正式接入超过5万公里的国家高铁网络,直达内地站点从44个起步,逐年递增。', en: 'September 23, 2018. You are an attendant on the first Guangzhou-Shenzhen-Hong Kong high-speed train from West Kowloon Station. The station has ~430,000 sqm gross floor area — the world\'s largest underground railway station. Passengers clear both mainland and Hong Kong (China) immigration in one place — "co-location." From today, Hong Kong connects to China\'s 50,000+ km high-speed network, with direct service to 44 mainland stations initially, growing annually.' },
    scenes: [{ speaker: 0, q: { zh: '广深港高铁中国香港段于哪一天正式投入服务?', en: 'On what date did the HK section of the Guangzhou-Shenzhen-Hong Kong high-speed railway begin service?' }, options: [
      { text: { zh: '2018年9月23日', en: 'September 23, 2018' }, correct: true, feedback: { zh: '广深港高铁中国香港段于2018年9月23日正式投入服务,衔接超过5万公里的国家高铁网络。至2026年1月,中国香港西九龙站直达内地站点从通车初期的44个增至110个。', en: 'Service began September 23, 2018, connecting to China\'s 50,000+ km high-speed network. By January 2026, direct destinations from West Kowloon grew from 44 to 110.' } },
      { text: { zh: '2017年12月28日', en: 'December 28, 2017' }, correct: false, feedback: { zh: '2017年12月28日是全国人大常委会批准西九龙站实施"一地两检"的日期,并非通车日期。正式投入服务是2018年9月23日。', en: 'December 28, 2017 was when the NPC Standing Committee approved co-location — not the opening date. Service began September 23, 2018.' } },
    ] }, { speaker: 0, q: { zh: '西九龙站的"一地两检"具体指什么?', en: 'What exactly does "co-location" at West Kowloon mean?' }, options: [
      { text: { zh: '在同一站点内分别设立内地口岸区和香港口岸区,各自按各自法律查验,旅客一次通关即可完成两地手续', en: 'Mainland and Hong Kong port areas are set up in one station, each applying its own law — passengers clear both in one stop' }, correct: true, feedback: { zh: '"一地两检"指在西九龙站分别设立内地口岸区和香港口岸区,内地和香港各自在自己的口岸区按照自己的法律进行查验。旅客无需在两地分别通关,一站完成。全国人大常委会于2017年12月28日批准此安排。', en: 'Co-location means mainland and Hong Kong port areas operate within one station, each applying its own law. Passengers clear both jurisdictions in one stop. The NPC Standing Committee approved this on December 28, 2017.' } },
      { text: { zh: '内地旅客进入香港后不再需要任何查验', en: 'Mainland travelers entering Hong Kong need no checks at all' }, correct: false, feedback: { zh: '"一地两检"并非取消查验,而是在同一站点内分别设立两个口岸区。内地口岸区按内地法律查验,香港口岸区按香港法律查验,旅客一站完成两地通关,而非免除查验。', en: 'Co-location does not eliminate checks. Two port areas operate in one station — mainland applies its law, Hong Kong applies its own. Passengers complete both in one stop, not skip them.' } },
    ] }],
    reward: { badge: '🚄', badgeName: { zh: '高铁连城印', en: 'Seal of High-Speed Connection' }, insight: { zh: '广深港高铁中国香港段于2018年9月23日正式投入服务,西九龙站总建筑面积约43万平方米,以建筑楼面面积计算是目前世界最大的地底铁路站。该站实施"一地两检"——在同一站点内分别设立内地口岸区和香港口岸区,各自按各自法律进行查验,旅客一次通关即可完成两地手续,2017年12月28日由全国人大常委会批准。通车后中国香港接入超过5万公里的国家高铁网络,直达内地站点从初期44个增至2026年1月的110个,每日开行至少212班车。截至2024年9月口岸开通6周年,累计验放出入境旅客超6280万人次,单日最高达12.1万人次。西九龙站让大湾区一小时生活圈从概念变为可感知的日常。', en: 'The HK section opened September 23, 2018. West Kowloon Station, ~430,000 sqm, is the world\'s largest underground railway station by floor area. It implements "co-location" — mainland and Hong Kong port areas in one station, each applying its own law, approved by the NPC Standing Committee on December 28, 2017. Hong Kong connects to China\'s 50,000+ km high-speed network; direct destinations grew from 44 to 110 by January 2026, with at least 212 daily trains. By the 6th anniversary in September 2024, over 62.8 million passengers had been processed, with peak daily traffic of 121,000. West Kowloon made the Bay Area\'s one-hour circle a tangible daily reality.' } },
  },
  'N-EG10': {
    characters: [{ name: { zh: '跨海测量员', en: 'Cross-Sea Surveyor' }, role: { zh: '深中通道路线观察者', en: 'Observer of the Shenzhen-Zhongshan Link' }, portrait: '' }],
    intro: { zh: '2024年6月30日15时,你是深中通道通车试运营首日的一名测量员。历经七年建设,这条全长约24公里的跨海通道正式开通。它是全球首个集"桥、岛、隧、水下互通"于一体的跨海集群工程——东起深圳机场互通,西至中山马鞍岛,东段是海底沉管隧道,西段是悬索桥,中间由人工岛连接。深圳至中山的车程从此前的约2小时缩短至30分钟。你站在人工岛上,一侧是海面钢箱梁悬索桥,一侧是沉入海底的钢壳混凝土沉管隧道入口。', en: 'June 30, 2024, 3 PM. You are a surveyor on the opening day of the Shenzhen-Zhongshan Link. After seven years of construction, this ~24 km crossing opens to traffic — the world\'s first integrating "bridge, island, tunnel, and underwater interchange." It runs from Shenzhen Airport interchange to Zhongshan Ma\'an Island: an immersed tunnel in the east, a suspension bridge in the west, connected by an artificial island. Shenzhen-to-Zhongshan travel drops from ~2 hours to 30 minutes. You stand on the island — suspension bridge on one side, immersed tunnel portal on the other.' },
    scenes: [{ speaker: 0, q: { zh: '深中通道于哪一天正式通车试运营?', en: 'On what date did the Shenzhen-Zhongshan Link officially open for trial operation?' }, options: [
      { text: { zh: '2024年6月30日', en: 'June 30, 2024' }, correct: true, feedback: { zh: '深中通道于2024年6月30日15时正式通车试运营。历经七年建设,全长约24公里,是全球首个集"桥、岛、隧、水下互通"于一体的跨海集群工程,总投资约446亿元。', en: 'The link opened at 3 PM on June 30, 2024. After seven years, ~24 km long, it is the world\'s first "bridge-island-tunnel-underwater interchange" cluster, with a total investment of ~44.6 billion RMB.' } },
      { text: { zh: '2023年6月30日', en: 'June 30, 2023' }, correct: false, feedback: { zh: '通车日期是2024年6月30日,不是2023年。深中通道历经七年建设,于2024年6月30日15时正式通车试运营,将深圳至中山车程从约2小时缩短至30分钟。', en: 'The opening date is June 30, 2024, not 2023. After seven years of construction, the link opened at 3 PM on June 30, 2024, cutting Shenzhen-Zhongshan travel from ~2 hours to 30 minutes.' } },
    ] }, { speaker: 0, q: { zh: '深中通道的沉管隧道有什么世界之最?', en: 'What world record does the Shenzhen-Zhongshan Link immersed tunnel hold?' }, options: [
      { text: { zh: '世界首例双向8车道海底沉管隧道,断面宽度达46至55.46米,是世界上最宽的海底沉管隧道', en: 'World\'s first dual 8-lane immersed tunnel, 46-55.46m wide — the world\'s widest' }, correct: true, feedback: { zh: '深中通道沉管隧道为世界首例双向8车道海底沉管隧道,断面宽度达46至55.46米,是世界上最宽的海底沉管隧道。深中通道整体创下10项世界之最,包括世界最大跨径全离岸海中钢箱梁悬索桥。', en: 'The immersed tunnel is the world\'s first dual 8-lane undersea immersed tube, 46-55.46m wide — the world\'s widest. The link overall set 10 world records, including the largest fully offshore steel-box-girder suspension bridge span.' } },
      { text: { zh: '只是普通的双向4车道海底隧道', en: 'Just an ordinary dual 4-lane undersea tunnel' }, correct: false, feedback: { zh: '深中通道沉管隧道是世界首例双向8车道海底沉管隧道,断面宽度46至55.46米,远非普通4车道隧道可比。它采用设计时速100公里的双向8车道高速公路技术标准,是当前世界上综合建设难度最高的跨海集群工程之一。', en: 'The tunnel is the world\'s first dual 8-lane undersea immersed tube, 46-55.46m wide — far beyond an ordinary 4-lane tunnel. The link uses 100 km/h dual 8-lane expressway standards and ranks among the world\'s most complex sea-crossing projects.' } },
    ] }],
    reward: { badge: '🌉', badgeName: { zh: '深中折叠印', en: 'Seal of the Folded Estuary' }, insight: { zh: '深中通道于2024年6月30日15时正式通车试运营,历经七年建设,全长约24公里,总投资约446亿元。它是全球首个集"桥、岛、隧、水下互通"于一体的跨海集群工程,东起深圳机场互通,西至中山马鞍岛,采用设计时速100公里的双向8车道高速公路技术标准。沉管隧道为世界首例双向8车道海底沉管隧道,断面宽度46至55.46米,是世界上最宽的海底沉管隧道;悬索桥为世界最大跨径全离岸海中钢箱梁悬索桥。整体创下了10项世界之最。通车后深圳至中山车程从此前约2小时缩短至30分钟,让"深莞惠"与"珠中江"两大城市群实现跨海直连,是粤港澳大湾区基础设施互联互通的关键工程。', en: 'The link opened at 3 PM on June 30, 2024, after seven years of construction. ~24 km long, ~44.6 billion RMB investment. It is the world\'s first "bridge-island-tunnel-underwater interchange" cluster, from Shenzhen Airport interchange to Zhongshan Ma\'an Island, with 100 km/h dual 8-lane expressway standards. The immersed tunnel is the world\'s first dual 8-lane undersea tube, 46-55.46m wide — the world\'s widest; the suspension bridge is the largest fully offshore steel-box-girder span. The project set 10 world records. Travel between Shenzhen and Zhongshan dropped from ~2 hours to 30 minutes, directly connecting the "Shenzhen-Dongguan-Huizhou" and "Zhuhai-Zhongshan-Jiangmen" city clusters — a key infrastructure project for Greater Bay Area interconnection.' } },
  },

  // ============ 新增锚点 · 科学星火 ============
  'N-SC05': {
    characters: [{ name: { zh: '清水湾研究员', en: 'Clear Water Bay Researcher' }, role: { zh: '香港科大科研讲述者', en: 'HKUST research narrator' }, portrait: '' }],
    intro: { zh: '1991年，中国香港清水湾半岛尽头的山丘上，一座大学刚落成。你是港科大第一批入校的研究生，海风从牛尾海吹来，实验室的仪器还在拆箱。工程学院的李泽湘教授正在带学生做机器人实验——多年后，他的一个学生汪滔会在这里完成毕业设计，虽然失败了，但李泽湘看出了这个年轻人的技术理解力和领导力，收他做了研究生。那间实验室，后来被叫作大湾区科技孵化的重要源头之一。', en: '1991. A university just opened on the hilltop at the tip of the Clear Water Bay peninsula, Hong Kong, China. You are among the first graduate students; sea breeze blows in from Tolo Harbour; lab instruments are still being unpacked. Professor Li Zexiang of the engineering school runs robotics experiments — years later, a student named Frank Wang will complete his senior thesis here. Though the thesis project failed, Li saw the young man\'s technical grasp and leadership, and took him on as a graduate student. That lab would later be called one of the key sources of tech incubation in the Greater Bay Area.' },
    scenes: [{ speaker: 0, q: { zh: '香港科大补足了湾区创新的哪一环?', en: 'What does HKUST add to Bay Area innovation?' }, options: [
      { text: { zh: '国际化科研、人才培养与创业机制', en: 'Global research, talent training and startup mechanisms' }, correct: true, feedback: { zh: '香港科大的工程学院拥有国际化师资和前沿实验室，李泽湘教授的机器人课程直接孵化了大疆等科技企业，把学术研究与产业转化打通，补足了湾区创新生态中从基础科研到创业落地的一环。', en: 'HKUST\'s engineering school has international faculty and frontier labs. Professor Li Zexiang\'s robotics course directly incubated companies like DJI, bridging academic research and industrial application — filling the gap from basic science to startup in the Bay Area innovation chain.' } },
      { text: { zh: '完全不参与知识生产', en: 'It does not produce knowledge' }, correct: false, feedback: { zh: '香港科大多次位列全球排名前五十，是大湾区重要的研究型大学，在机器人、人工智能、材料科学等领域都有突出贡献，远非"不参与知识生产"。', en: 'HKUST ranks among the global top 50 and is a major research university in the Bay Area, with significant contributions in robotics, AI, and materials science.' } },
    ] }, { speaker: 0, q: { zh: '香港科技大学建校于哪一年？', en: 'In what year was HKUST founded?' }, options: [
      { text: { zh: '1991年', en: '1991' }, correct: true, feedback: { zh: '1991年10月，香港科技大学正式开学，是香港第三所大学。创校校长吴家玮带领一批国际学者，在清水湾半岛建起这所研究型大学，此后数十年间成为大湾区科技孵化的重要源头之一。', en: 'In October 1991, HKUST officially opened as Hong Kong\'s third university. Founding president Chia-Wei Woo led a team of international scholars to build this research university at Clear Water Bay, which over decades became a key source of tech incubation in the Greater Bay Area.' } },
      { text: { zh: '1980年', en: '1980' }, correct: false, feedback: { zh: '1980年香港只有香港大学和香港中文大学，港科大尚未成立。它是在1991年才正式开学的，建校初衷是为香港培养高科技人才。', en: 'In 1980, only HKU and CUHK existed in Hong Kong. HKUST was not founded until 1991, with the original mission of training high-tech talent for Hong Kong.' } },
      { text: { zh: '2000年', en: '2000' }, correct: false, feedback: { zh: '2000年港科大已经建校近十年，早已在清水湾运转。李泽湘教授的实验室在1990年代末就已开始孵化创业项目，汪滔的大疆项目也在此后不久起步。', en: 'By 2000, HKUST had been operating for nearly a decade. Professor Li Zexiang\'s lab had already begun incubating startups in the late 1990s, and Frank Wang\'s DJI project started shortly after.' } },
      { text: { zh: '1975年', en: '1975' }, correct: false, feedback: { zh: '1975年香港连中文大学都刚成立不久（1963年），港科大的筹建要等到1980年代后期才提上议程，1991年才正式开学。', en: 'In 1975, CUHK had only been established in 1963. HKUST\'s planning began in the late 1980s, and it officially opened in 1991.' } },
    ] }],
    reward: { badge: '🎓', badgeName: { zh: '清水湾科研印', en: 'Seal of Clear Water Bay Research' }, insight: { zh: '1991年，香港科技大学在清水湾半岛建校，创校校长吴家玮延揽了一批国际化师资。工程学院教授李泽湘开设机器人课程，指导学生做实践项目，其中一位研究生汪滔在校期间研究直升机飞行控制系统，毕业后创立大疆创新，把在实验室里打磨的技术理解力和工程能力转化为全球最大的消费级无人机企业。从1991年建校到李泽湘的实验室再到汪滔和大疆，港科大展示了研究型大学如何成为科创孵化器的完整链条——国际化学术土壤培养出人才，人才在实验室里完成技术验证，最终走向产业转化。', en: 'In 1991, HKUST was founded at Clear Water Bay. Founding president Chia-Wei Woo recruited international faculty. Engineering professor Li Zexiang ran robotics courses with hands-on projects; one graduate student, Frank Wang, researched helicopter flight control systems during his studies, then founded DJI, turning lab-honed technical understanding into the world\'s largest consumer drone company. From the 1991 founding through Li Zexiang\'s lab to Wang Tao and DJI, HKUST demonstrates the complete chain of how a research university becomes a tech incubator — international academic soil nurtures talent, talent validates technology in the lab, and the result reaches industry.' } },
  },
  'N-SC06': {
    characters: [{ name: { zh: '康乐园学人', en: 'Kangle Scholar' }, role: { zh: '中山大学南校园讲述者', en: 'Narrator of SYSU South Campus' }, portrait: '' }],
    intro: { zh: '1924年，孙中山在广州创办了一所大学，原名广东大学。你走在康乐园的榕树荫下，脚下是百年红砖铺就的小路，陈寅恪曾在这里教书。1926年，学校改名中山大学，以纪念刚刚去世的创办人。南校园的红砖建筑一栋接一栋，图书馆里藏着民国年间的手稿。2015年，中大深圳校区在光明科学城动工——一所百年学府，把根系从珠江畔伸到了深圳的科技腹地。', en: '1924. Sun Yat-sen founds a university in Guangzhou, originally named Guangdong University. You walk under the banyan shade of Kangle Garden, on century-old red-brick paths where Chen Yinque once taught. In 1926, the school is renamed Sun Yat-sen University to commemorate its recently deceased founder. Red-brick buildings line the south campus one after another; the library holds Republican-era manuscripts. In 2015, the SYSU Shenzhen campus breaks ground in Guangming Science City — a century-old institution extending its roots from the Pearl River to Shenzhen\'s tech heartland.' },
    scenes: [{ speaker: 0, q: { zh: '中山大学南校园代表哪种生产力?', en: 'What productivity does SYSU South Campus represent?' }, options: [
      { text: { zh: '长期积累的人才、医学、海洋与人文研究', en: 'Long-term talent, medicine, ocean studies and humanities' }, correct: true, feedback: { zh: '中山大学南校园汇聚了医学、海洋科学、人文学科等多个领域的长期积累，陈寅恪等学术大师曾在此任教，为湾区提供了深层的知识土壤和人才储备，与快速迭代的科技产业形成互补。', en: 'SYSU South Campus gathers long-term accumulation in medicine, ocean science, and humanities, where scholars like Chen Yinque once taught, providing deep knowledge soil and talent reserves that complement the fast-iterating tech industry.' } },
      { text: { zh: '只代表短期消费热点', en: 'Only a short-term consumption trend' }, correct: false, feedback: { zh: '中山大学是华南顶尖的综合性研究型大学，拥有国家级重点实验室和附属医院体系，在生物医学、海洋科学等领域有深厚积累，远非短期消费热点。', en: 'SYSU is a top comprehensive research university in South China, with national key labs and affiliated hospitals, with deep accumulation in biomedicine and ocean science.' } },
    ] }, { speaker: 0, q: { zh: '中山大学创办于哪一年？', en: 'In what year was Sun Yat-sen University founded?' }, options: [
      { text: { zh: '1924年', en: '1924' }, correct: true, feedback: { zh: '1924年，孙中山创办广东大学，1926年为纪念孙中山而更名为中山大学。学校最初以文明路旧贡院为校址，后迁入康乐园南校园，陈寅恪、鲁迅等学者曾在此任教，成为华南地区最重要的现代高等学府。', en: 'In 1924, Sun Yat-sen founded Guangdong University. In 1926, it was renamed Sun Yat-sen University to commemorate him. Initially located at the old examination hall on Wenming Road, later moving to Kangle Garden South Campus, where scholars like Chen Yinque and Lu Xun taught, it became South China\'s most important modern university.' } },
      { text: { zh: '1905年', en: '1905' }, correct: false, feedback: { zh: '1905年是清末废科举兴学堂的年份，中山大学尚未诞生。孙中山创办广东大学是在1924年，比1905年晚了近二十年。', en: '1905 was when the Qing dynasty abolished the imperial examination — SYSU did not yet exist. Sun Yat-sen founded Guangdong University in 1924, nearly two decades later.' } },
      { text: { zh: '1936年', en: '1936' }, correct: false, feedback: { zh: '1936年中山大学早已更名运转十余年。学校1924年创办，1926年更名，1936年已是抗战前夕的中山大学了。', en: 'By 1936, SYSU had already been operating under its new name for a decade. Founded in 1924, renamed in 1926, 1936 was already on the eve of the war.' } },
      { text: { zh: '1952年', en: '1952' }, correct: false, feedback: { zh: '1952年是全国高校院系调整的年份，中山大学在这一年迁入康乐园南校园，但学校本身创办于1924年，比院系调整早了二十八年。', en: '1952 was the year of the national university restructuring, when SYSU moved to the Kangle Garden South Campus. But the university itself was founded in 1924, 28 years earlier.' } },
    ] }],
    reward: { badge: '📚', badgeName: { zh: '康乐学脉印', en: 'Seal of Kangle Scholarship' }, insight: { zh: '1924年，孙中山在广州创办广东大学，这是华南第一所现代国立大学。1926年，为纪念刚刚去世的创办人，学校更名为中山大学。此后数十年间，陈寅恪等学术大师在康乐园的红砖楼里教书著述，把现代学术体系深深植入岭南土壤。2015年，中山大学深圳校区在光明科学城动工，一所百年学府把根系从珠江畔延伸到深圳的科技腹地。从1924年创办到1926年更名，从陈寅恪时代的学术奠基到2015年深圳校区的拓展，中山大学用近百年的连续积累，为湾区创新提供了人才根系和知识深度。', en: 'In 1924, Sun Yat-sen founded Guangdong University in Guangzhou — South China\'s first modern national university. In 1926, it was renamed Sun Yat-sen University to commemorate its deceased founder. Over the following decades, scholars like Chen Yinque taught in the red-brick buildings of Kangle Garden, embedding the modern academic system deep in Lingnan soil. In 2015, the SYSU Shenzhen campus broke ground in Guangming Science City, extending a century-old institution\'s roots from the Pearl River to Shenzhen\'s tech heartland. From the 1924 founding through the 1926 renaming, from Chen Yinque\'s era to the 2015 Shenzhen expansion, SYSU provides the Bay Area with talent roots and knowledge depth through nearly a century of continuous accumulation.' } },
  },
  'N-SC07': {
    characters: [{ name: { zh: '科普导师', en: 'Science Mentor' }, role: { zh: '广东科学中心讲解员', en: 'Guide of Guangdong Science Center' }, portrait: '' }],
    intro: { zh: '2008年，广州番禺大学城，一座巨大的银色建筑刚竣工开放。你是广东科学中心的首批讲解员之一，站在"科技航母"造型的展厅入口，看着第一批小学生涌进来。一个男孩按下按钮，电磁感应让铜环腾空跳起，他尖叫着拉住同伴的手。这里不是学校，没有考试——建筑面积位居世界科学中心之首，设计理念源自"科技航母"，所有装置只有一个目的：让普通人，尤其是孩子，亲手碰到科学。', en: '2008. A massive silver building just opened in Guangzhou\'s Panyu University Town. You are among the first guides at the Guangdong Science Center, standing at the entrance of the exhibition hall shaped like a "tech aircraft carrier," watching the first group of schoolchildren pour in. A boy presses a button; electromagnetic induction makes a copper ring leap into the air; he shrieks and grabs his friend\'s hand. This is not a school, there are no exams — with the largest floor area of any science center in the world, every exhibit serves one purpose: letting ordinary people, especially children, touch science with their own hands.' },
    scenes: [{ speaker: 0, q: { zh: '广东科学中心的重要性在哪里?', en: 'Why is Guangdong Science Center important?' }, options: [
      { text: { zh: '把科学翻译给公众,培养未来工程师和好奇心', en: 'It translates science to the public and grows future engineers' }, correct: true, feedback: { zh: '广东科学中心建筑面积位居世界科学中心之首，设有多个主题展馆和互动装置，每年接待数百万观众，把科学原理转化为可触摸的体验，为创新生态培养公众理解和下一代好奇心。', en: 'With the largest floor area of any science center in the world, multiple themed galleries and interactive exhibits, it receives millions of visitors annually, translating scientific principles into touchable experiences and growing public understanding and future curiosity for the innovation ecosystem.' } },
      { text: { zh: '科普与创新完全无关', en: 'Science education has nothing to do with innovation' }, correct: false, feedback: { zh: '没有公众理解和下一代好奇心，创新很难持续。广东科学中心的互动展览正是把科学从实验室带到日常生活中，让更多年轻人对科学产生兴趣。', en: 'Innovation needs public understanding and curiosity. The center\'s interactive exhibits bring science from labs to daily life, inspiring more young people to take interest in science.' } },
    ] }, { speaker: 0, q: { zh: '广东科学中心于哪一年建成开放？', en: 'In what year did the Guangdong Science Center open?' }, options: [
      { text: { zh: '2008年', en: '2008' }, correct: true, feedback: { zh: '2008年9月，广东科学中心在广州番禺大学城建成开放，建筑面积13.75万平方米，是当时世界上建筑面积最大的科学中心。建筑造型如同一艘银色"科技航母"，设有多个主题展馆和4D影院。', en: 'In September 2008, the Guangdong Science Center opened in Guangzhou\'s Panyu University Town. With a floor area of 137,500 sqm, it was the world\'s largest science center by floor area. Its design resembles a silver "tech aircraft carrier," with multiple themed galleries and a 4D theater.' } },
      { text: { zh: '2003年', en: '2003' }, correct: false, feedback: { zh: '2003年是广东科学中心项目立项筹建的时间，建成开放则要到2008年9月。从立项到开放历时五年，建筑规模和展项设计都经过反复打磨。', en: '2003 was when the project was approved and planning began. The center did not open until September 2008, five years of planning and construction for its scale and exhibits.' } },
      { text: { zh: '2010年', en: '2010' }, correct: false, feedback: { zh: '2010年是广州亚运会举办之年，广东科学中心早在2008年就已开放，并非为亚运会而建。它比亚运会早两年向公众开放。', en: '2010 was the year of the Guangzhou Asian Games, but the Science Center had already opened in 2008, two years earlier — not built for the Games.' } },
      { text: { zh: '2015年', en: '2015' }, correct: false, feedback: { zh: '2015年广东科学中心已经运营七年，早已成为广州科普地标。它于2008年9月开放，此后不断更新展项，但开放时间远早于2015年。', en: 'By 2015, the center had been operating for seven years and was already a Guangzhou science landmark. It opened in September 2008 and has continuously updated its exhibits since.' } },
    ] }],
    reward: { badge: '🧪', badgeName: { zh: '科普星火印', en: 'Seal of Public Science' }, insight: { zh: '2008年，广东科学中心在广州番禺大学城建成开放，建筑面积13.75万平方米，位居世界科学中心之首。建筑造型源自"科技航母"，银色外壳下设有十余个主题展馆和数百件互动装置，所有展项只有一个目的：让普通人尤其是孩子亲手碰到科学。它不是学校，没有考试，却用电磁感应的铜环、声波共振的沙粒、力学杠杆的齿轮，把科学原理从课本翻译成可触摸的体验。从2008年开放到成为华南最大的科普基地，广东科学中心让科学成为大众可以亲近的公共体验，为湾区创新生态培育底层土壤。', en: 'In 2008, the Guangdong Science Center opened in Guangzhou\'s Panyu University Town with a floor area of 137,500 sqm — the largest of any science center in the world. Its "tech aircraft carrier" design houses over a dozen themed galleries and hundreds of interactive exhibits, all with one purpose: letting ordinary people, especially children, touch science with their own hands. It is not a school, has no exams, yet uses electromagnetic copper rings, resonant sand patterns, and gear levers to translate science from textbooks into touchable experiences. From its 2008 opening to becoming South China\'s largest science education base, the center makes science a public experience, cultivating the foundational soil for the Bay Area\'s innovation ecosystem.' } },
  },
  'N-SC08': {
    characters: [{ name: { zh: '中子束线科学家', en: 'Neutron Beam Scientist' }, role: { zh: '散裂中子源研究者', en: 'CSNS researcher' }, portrait: '' }],
    intro: { zh: '2018年，东莞松山湖，一座环形加速器刚通过国家验收。你是中科院高能物理研究所派驻这里的青年研究员，走在束流隧道里，混凝土墙后是质子加速器和中子靶站。这台中国首台脉冲型散裂中子源被同行称为"超级显微镜"——中子束穿透物质表面，探测原子排列的微观结构。与美国、日本、英国的散裂中子源一起，它位列世界四大脉冲散裂中子源。你盯着控制屏上的第一束中子打靶信号，手心全是汗。', en: '2018. Dongguan\'s Songshan Lake. A ring accelerator has just passed national acceptance. You are a young researcher sent here by the Institute of High Energy Physics, Chinese Academy of Sciences. Walking through the beam tunnel, behind the concrete walls are the proton accelerator and neutron target station. This — China\'s first pulsed spallation neutron source — is called a "super microscope" by peers: neutron beams penetrate material surfaces to probe the microscopic arrangement of atoms. Alongside the spallation neutron sources in the United States, Japan, and the United Kingdom, it ranks among the world\'s four major pulsed spallation neutron sources. You stare at the first neutron-on-target signal on the control screen, palms sweating.' },
    scenes: [{ speaker: 0, q: { zh: '中国散裂中子源为什么重要?', en: 'Why is CSNS important?' }, options: [
      { text: { zh: '它帮助研究材料内部结构,支撑物理、生命科学和工程升级', en: 'It studies internal material structure and supports science and engineering upgrades' }, correct: true, feedback: { zh: '散裂中子源通过中子束穿透物质表面，探测原子排列的微观结构，在航空发动机叶片、高铁车轮、磁性材料等领域提供不可替代的检测手段，许多产业突破都始于看不见的材料结构。', en: 'CSNS uses neutron beams to penetrate material surfaces and probe atomic arrangements, providing irreplaceable detection for aircraft engine blades, high-speed rail wheels, and magnetic materials. Many industrial breakthroughs begin inside invisible material structures.' } },
      { text: { zh: '它只是一座普通商场', en: 'It is only a shopping mall' }, correct: false, feedback: { zh: '散裂中子源是国家级大科学装置，由中科院高能物理研究所建设，总投资约23亿元，是物质科学研究的核心基础设施，与商场毫无关系。', en: 'CSNS is a national big-science facility built by the Institute of High Energy Physics, CAS, with an investment of about 2.3 billion RMB — a core infrastructure for materials science, nothing like a shopping mall.' } },
    ] }, { speaker: 0, q: { zh: '中国散裂中子源于哪一年通过国家验收？', en: 'In what year did CSNS pass national acceptance?' }, options: [
      { text: { zh: '2018年', en: '2018' }, correct: true, feedback: { zh: '2018年8月23日，中国散裂中子源通过国家验收，正式投入运行。它是我国首台脉冲型散裂中子源，填补了国内脉冲中子源领域的空白，与美国、日本、英国的散裂中子源并列为世界四大脉冲散裂中子源。', en: 'On August 23, 2018, CSNS passed national acceptance and began formal operation. It is China\'s first pulsed spallation neutron source, filling a domestic gap, and ranks alongside facilities in the US, Japan, and the UK as one of the world\'s four major pulsed spallation neutron sources.' } },
      { text: { zh: '2015年', en: '2015' }, correct: false, feedback: { zh: '2015年是散裂中子源装置主体工程开工建设的关键阶段，但尚未建成。它于2018年8月才通过国家验收正式投入运行，2015年时还在建设中。', en: '2015 was a key phase in constructing the main accelerator — but it was not yet complete. National acceptance came in August 2018; in 2015 it was still under construction.' } },
      { text: { zh: '2020年', en: '2020' }, correct: false, feedback: { zh: '2020年散裂中子源已经运行两年，完成了多项用户实验。它于2018年8月通过验收，2020年已在为国内外科研团队提供机时服务。', en: 'By 2020, CSNS had been operating for two years and completed many user experiments. It passed acceptance in August 2018 and was already providing beam time to research teams by 2020.' } },
      { text: { zh: '2012年', en: '2012' }, correct: false, feedback: { zh: '2012年是散裂中子源项目获得国家发改委批复立项的年份，从立项到验收历时六年，2018年8月才正式通过国家验收投入运行。', en: '2012 was when the project was approved by the NDRC. From approval to acceptance took six years; it only passed national acceptance and began operation in August 2018.' } },
    ] }],
    reward: { badge: '⚛️', badgeName: { zh: '中子探微印', en: 'Seal of Neutron Insight' }, insight: { zh: '2018年8月23日，中国散裂中子源在东莞松山湖通过国家验收，正式投入运行。它是我国首台脉冲型散裂中子源，由中科院高能物理研究所建设，用质子加速器轰击重金属靶产生中子脉冲，被同行称为"超级显微镜"——中子束穿透物质表面，探测原子排列的微观结构。与美国、日本、英国的散裂中子源并列为世界四大脉冲散裂中子源，填补了国内脉冲中子源领域的空白。从2018年验收到持续服务航空发动机叶片、高铁车轮、新能源电池等领域的材料研究，散裂中子源让湾区制造业拥有理解材料微观结构的深层眼睛，把产业升级的根基深入到原子层面。', en: 'On August 23, 2018, CSNS passed national acceptance at Dongguan\'s Songshan Lake and began formal operation. It is China\'s first pulsed spallation neutron source, built by the Institute of High Energy Physics, CAS, using a proton accelerator to bombard heavy metal targets and generate neutron pulses — a "super microscope" that probes atomic arrangements. Alongside facilities in the US, Japan, and the UK, it is one of the world\'s four major pulsed spallation neutron sources, filling a domestic gap. From the 2018 acceptance to serving materials research in aircraft engine blades, high-speed rail wheels, and new energy batteries, CSNS gives Bay Area manufacturing deep eyes into material microstructure, grounding industrial upgrading at the atomic level.' } },
  },
  'N-SC09': {
    characters: [{ name: { zh: '数码港创业者', en: 'Cyberport Founder' }, role: { zh: '香港数字经济观察者', en: 'Observer of Hong Kong digital economy' }, portrait: '' }],
    intro: { zh: '你站在中国香港薄扶林钢线湾的海边，身后是数码港的玻璃幕墙。2000年，特区政府正式提出「数码港」计划，耗资130亿港元，占地26公顷，在港岛西南的钢线湾填海动工。2003年，香港数码港管理有限公司正式成立并运行，四期工程于2004年全部落成。你面前这片依山傍海的地块，二十年间孕育了全港一半以上的金融科技企业，从众安国际到WeLab，从HashKey到Airwallex——多家独角兽从这里走向世界。', en: 'You stand by the water at Telegraph Bay, Pokfulam, China Hong Kong, Cyberport\'s glass facades behind you. In 2000 the government launched the Cyberport project — HK$13 billion, 26 hectares, reclaimed at Telegraph Bay. In 2003 Cyberport Management Corporation began operations; all four phases were completed by 2004. This hillside-seaside plot has nurtured over half of Hong Kong\'s fintech companies in two decades, from ZA International to WeLab, HashKey to Airwallex — multiple unicorns heading global from here.' },
    scenes: [{ speaker: 0, q: { zh: '数码港是什么时候正式提出建设计划的？位于香港哪里？', en: 'When was Cyberport officially proposed, and where is it located?' }, options: [
      { text: { zh: '2000年提出，位于薄扶林钢线湾，占地26公顷，耗资130亿港元', en: 'Proposed in 2000, at Telegraph Bay, Pokfulam, 26 hectares, HK$13 billion' }, correct: true, feedback: { zh: '正是。2000年特区政府正式提出数码港计划，选址港岛西南薄扶林钢线湾，填海建设。首期工程2001年完成投入使用，2003年数码港管理有限公司正式成立运行，四期工程2004年全部落成。', en: 'Correct. The government proposed Cyberport in 2000 at Telegraph Bay, Pokfulam, built on reclaimed land. Phase I opened in 2001; the management corporation was established in 2003; all four phases completed by 2004.' } },
      { text: { zh: '2010年提出，位于中环金融区', en: 'Proposed in 2010, in Central\'s financial district' }, correct: false, feedback: { zh: '时间和地点都不对。数码港2000年就提出了，比2010年早十年。它不在中环，而在港岛西南的薄扶林钢线湾——远离金融区，选址海滨山坡，是刻意打造的创科园区。', en: 'Both wrong. Cyberport was proposed in 2000, a decade earlier, and is at Telegraph Bay, Pokfulam — not Central. The hillside-seaside location was a deliberate choice for a tech park.' } },
    ] }, { speaker: 0, q: { zh: '数码港目前聚焦的核心产业方向是什么？', en: 'What are Cyberport\'s core industry focuses today?' }, options: [
      { text: { zh: '金融科技、智慧生活、数码娱乐、Web3等，拥有全港最大的金融科技社群', en: 'Fintech, smart living, digital entertainment, Web3 — with Hong Kong\'s largest fintech community' }, correct: true, feedback: { zh: '正是。截至2023年，数码港社群企业已突破2000间，培育了7间独角兽企业，涵盖金融科技、智慧生活、数码娱乐、第三代互联网（Web3）等领域。全港超过350家金融科技公司聚集于此，是香港最大的金融科技社群。', en: 'Correct. By 2023, Cyberport\'s community exceeded 2,000 companies and nurtured 7 unicorns across fintech, smart living, digital entertainment, and Web3. Over 350 fintech companies make it Hong Kong\'s largest fintech cluster.' } },
      { text: { zh: '主要是传统制造业和重工业', en: 'Mainly traditional manufacturing and heavy industry' }, correct: false, feedback: { zh: '完全不对。数码港是数字经济和创业生态园区，聚焦金融科技、数码娱乐、智慧生活等软件和服务领域，与制造业无关。它的定位是把中国香港的金融城市能力延展到数字经济。', en: 'Not at all. Cyberport is a digital economy and startup hub focused on fintech, digital entertainment, and smart living — software and services, not manufacturing. Its role is extending Hong Kong\'s financial-city strengths into the digital economy.' } },
    ] }],
    reward: { badge: '💻', badgeName: { zh: '数码创业印', en: 'Seal of Digital Startups' }, insight: { zh: '数码港2000年由特区政府正式提出，选址中国香港薄扶林钢线湾，耗资130亿港元，占地26公顷，2003年正式成立运行，2004年四期工程全部落成。它起步于互联网泡沫破灭之际，早期发展一度被质疑为地产项目，但从2005年启动初创企业培育计划后逐步走上正轨。如今数码港社群企业突破2000间，培育了7间独角兽企业，拥有全港最大的金融科技社群（超过350家金融科技公司），涵盖金融科技、智慧生活、数码娱乐、Web3等领域。从众安国际、WeLab到HashKey、Airwallex，多家独角兽从这里走向全球。数码港让中国香港把金融城市的制度优势与国际化能力延展到数字经济，在湾区科创版图中补上了金融科技与数字内容的关键一环。', en: 'Cyberport was proposed by the Hong Kong government in 2000 at Telegraph Bay, Pokfulam — HK$13 billion, 26 hectares. The management corporation was established in 2003; all four phases completed by 2004. Launched during the dot-com crash, it was initially criticized as a property project, but its startup incubation program, begun in 2005, gradually built momentum. Today, Cyberport hosts over 2,000 companies, has nurtured 7 unicorns, and holds Hong Kong\'s largest fintech cluster (350+ fintech firms) across fintech, smart living, digital entertainment, and Web3. From ZA International, WeLab, and HashKey to Airwallex, multiple unicorns have gone global from here. Cyberport extends Hong Kong\'s financial-city institutional strengths into the digital economy, adding the fintech and digital content layer to the Bay Area\'s innovation map.' } },
  },
  'N-SC10': {
    characters: [{ name: { zh: '横琴澳大学生', en: 'UM Hengqin Student' }, role: { zh: '澳门大学横琴校区亲历者', en: 'Witness of UM Hengqin Campus' }, portrait: '' }],
    intro: { zh: '2009年12月20日,澳门回归十周年纪念日,时任国家主席胡锦涛亲赴横琴岛,为澳门大学新校区奠基铲土。你站在工地上,脚下是珠海的土地,图纸上的校园却将适用澳门法律。四年后的2013年11月5日,一条河底隧道将横琴校区与澳门连成一体——这是「一国两制」下史无前例的安排:一片广东的土地,由澳门特别行政区依照澳门法律实施管辖。', en: 'December 20, 2009 — the 10th anniversary of Macao\'s return — President Hu Jintao flew to Hengqin Island to break ground for the University of Macao\'s new campus. You stand on the construction site: beneath your feet is Zhuhai soil, yet the blueprint says Macao law will apply. Four years later, on November 5, 2013, a river-bottom tunnel connected the campus to Macao — an unprecedented "One Country, Two Systems" arrangement: a piece of Guangdong land governed by Macao law.' },
    scenes: [{ speaker: 0, q: { zh: '2009年6月27日,全国人大常委会通过了一个什么决定?', en: 'What decision did the NPC Standing Committee pass on June 27, 2009?' }, options: [
      { text: { zh: '授权澳门特别行政区对设在横琴岛的澳门大学新校区实施管辖,校区内适用澳门法律', en: 'Authorized Macao SAR to govern the UM Hengqin campus, applying Macao law within it' }, correct: true, feedback: { zh: '正是。这是全国人大常委会首次授权特别行政区在内地土地上实施管辖。横琴校区与横琴岛其他区域实行隔离式管理,通过河底隧道与澳门连成一体。一片广东的土地,日常运行的却是澳门的法律和行政体系。', en: 'Exactly. This was the first time the NPC authorized an SAR to govern mainland territory. The campus is separated from the rest of Hengqin, linked to Macao by a river tunnel. On Guangdong soil, Macao law and administration run daily.' } },
      { text: { zh: '将横琴岛整体划归澳门', en: 'Transferred all of Hengqin Island to Macao' }, correct: false, feedback: { zh: '不是整体划归。全国人大常委会的决定只授权澳门管辖澳门大学新校区这一特定区域,横琴岛其他部分仍属珠海管辖。这种「隔离式管理」正是「一国两制」的精准操作——不是简单的行政区划调整,而是制度层面的创新。', en: 'Not the whole island. The NPC authorized Macao to govern only the UM campus area; the rest of Hengqin remains under Zhuhai. This "isolated management" is precise "One Country, Two Systems" — not an administrative redraw but institutional innovation.' } },
    ] }, { speaker: 0, q: { zh: '澳门大学为什么要从老校区搬到横琴?', en: 'Why did the University of Macao move from its old campus to Hengqin?' }, options: [
      { text: { zh: '老校园面积太小,严重制约学校发展,新校区比老校园大20倍', en: 'The old campus was too small, severely limiting growth; the new campus is 20 times larger' }, correct: true, feedback: { zh: '正是。澳门大学老校园空间极为有限,在校学生数量远超承载能力。横琴新校区占地约1平方公里,比老校园大20倍,从2009年12月奠基到2013年11月正式启用,历时近四年。校园可以容纳更多学院、实验室和宿舍,让澳大从一所地方性大学走向综合性研究型大学。', en: 'Exactly. The old campus was too cramped for its student body. The Hengqin campus covers about 1 sq km — 20 times larger. From groundbreaking in December 2009 to opening in November 2013, it allowed UM to expand from a local college to a comprehensive research university.' } },
      { text: { zh: '因为澳门没有大学', en: 'Because Macao had no university' }, correct: false, feedback: { zh: '澳门大学1981年就成立了,是澳门一所综合性公立大学。搬到横琴不是因为澳门没有大学,而是因为老校园太小。这个决定背后还有更深的战略意图:用教育合作推动粤澳一体化,横琴也由此成为「一国两制」的新试验场。', en: 'UM was founded in 1981 as Macao\'s public university. The move wasn\'t because Macao lacked a university, but because the old campus was too small. The deeper strategy: use education cooperation to drive Guangdong-Macao integration, making Hengqin a new "One Country, Two Systems" testbed.' } },
    ] }],
    reward: { badge: '🏫', badgeName: { zh: '横琴学岛印', en: 'Seal of the Hengqin Campus' }, insight: { zh: '2009年全国人大常委会授权澳门管辖横琴岛澳大新校区,是「一国两制」的史无前例之举:一片广东土地上运行澳门法律。2013年校园启用时比老校园大20倍,一条河底隧道将它与澳门连成一体。从教育空间到制度试验,横琴校区让知识成为粤澳协同的温和力量——边界可以不动,制度可以跨境。', en: 'The 2009 NPC authorization for Macao to govern its Hengqin campus was an unprecedented "One Country, Two Systems" act: Macao law on Guangdong soil. When it opened in 2013 — 20 times larger than the old campus — a river tunnel connected it to Macao. From education to institutional experiment, the campus makes knowledge a quiet force for Guangdong-Macao synergy: borders stay fixed, systems cross over.' } },
  },

  // ============ 新增锚点 · 风味民俗与城市生活 ============
  'N-AW05': {
    characters: [{ name: { zh: '西关街坊', en: 'Xiguan Neighbor' }, role: { zh: '永庆坊生活讲述者', en: 'Narrator of Yongqing Fang life' }, portrait: '' }],
    intro: { zh: '你是2016年秋天走进恩宁路的行路人。骑楼连廊下光影斑驳，满洲窗的彩色玻璃映出西关大屋的轮廓。9月30日，永庆坊正式开园——全国首个"微改造"试点街区，不拆不改，修旧如旧。你经过永庆一巷13号，1947年李海泉在这里建了祖居，他的儿子李小龙后来名震天下。不远处粤剧艺术博物馆的戏台上，八和会馆的老票友正在开嗓，詹天佑故居就在街巷尽头。', en: '' },
    scenes: [{ speaker: 0, q: { zh: '永庆一巷13号的李小龙祖居，是哪一年由谁建造的？', en: '' }, options: [
      { text: { zh: '1947年，李小龙父亲李海泉所建', en: '' }, correct: true, feedback: { zh: '1947年，粤剧名伶李海泉在恩宁路永庆一巷13号建了这座祖居。他的儿子李小龙后来名震天下，这座西关大屋也因此成为永庆坊最重要的名人故居之一。', en: '' } },
      { text: { zh: '1970年代李小龙回广州时购入', en: '' }, correct: false, feedback: { zh: '不是。李海泉是粤剧"四大名丑"之一，1947年便在此建宅，远早于李小龙成名时期。', en: '' } },
    ] }, { speaker: 0, q: { zh: '永庆坊2016年开园时，在全国城市更新中有什么特殊身份？', en: '' }, options: [
      { text: { zh: '全国首个"微改造"试点街区，采用修旧如旧方式保留骑楼和西关大屋', en: '' }, correct: true, feedback: { zh: '2016年9月30日永庆坊正式开园，作为全国首个"微改造"试点，没有大拆大建，而是保留骑楼连廊、满洲窗、西关大屋等岭南建筑肌理，让原住民继续生活在其中。', en: '' } },
      { text: { zh: '全国第一个完全推倒重建的商业步行街', en: '' }, correct: false, feedback: { zh: '恰恰相反。永庆坊的核心做法是"修旧如旧"，保留恩宁路骑楼街区的历史风貌，而非推倒重来。', en: '' } },
    ] }],
    reward: { badge: '🫖', badgeName: { zh: '西关烟火印', en: 'Seal of Xiguan Everyday Life' }, insight: { zh: '永庆坊的意义不止于一条老街变好看。2016年全国首个"微改造"试点的身份，让恩宁路骑楼街区走出了"拆或留"的二元困境——修旧如旧保留了满洲窗、骑楼连廊和西关大屋的物理肌理，李小龙祖居、詹天佑故居和八和会馆让名人足迹与粤剧行会继续附着在街巷里。老房子没有变成空壳布景，原住民的早茶和粤剧声仍在，新店铺也自然生长进来。城市更新因此多了一条路径：不是替换生活，而是给生活的容器做微创手术。', en: '' } },
  },
  'N-AW06': {
    characters: [{ name: { zh: '石湾陶工', en: 'Shiwan Potter' }, role: { zh: '南风古灶守窑人', en: 'Keeper of Nanfeng Kiln' }, portrait: '' }],
    intro: { zh: '你站在佛山石湾镇的山坡前，一条34.4米长的龙窑沿山势向南蜿蜒而上。窑口火光映红陶工的脸——这是南风古灶，明正德年间由霍氏家族在元代"文灶"基础上改建而成，因窑向正南得名"南风"。五百多年来，窑火从未熄灭，生产从未中断。你伸手触摸窑壁上的釉痕，那是半个千年的柴烧温度层层叠加留下的。"石湾瓦甲天下"，你脚下这片土地烧出的陶瓦曾铺遍岭南的屋脊。', en: '' },
    scenes: [{ speaker: 0, q: { zh: '南风古灶始建于哪个朝代？由哪个家族改建？', en: '' }, options: [
      { text: { zh: '明正德年间（1506-1521年），霍氏家族在元代"文灶"基础上改建', en: '' }, correct: true, feedback: { zh: '明正德年间（1506-1521年），霍氏家族在元代已有的"文灶"基础上将其改建为柴烧龙窑，因窑向正南而得名"南风灶"。此后五百多年窑火不绝，成为中国乃至世界现存最古老、保存最完好且延续使用至今的柴烧龙窑。', en: '' } },
      { text: { zh: '清代由石湾陶业公会在山脚新建', en: '' }, correct: false, feedback: { zh: '南风古灶的历史远早于清代。明代正德年间霍氏家族已在元代"文灶"基础上改建为龙窑，距今已有五百余年。', en: '' } },
    ] }, { speaker: 0, q: { zh: '南风古灶在2002年以什么身份载入吉尼斯世界纪录？', en: '' }, options: [
      { text: { zh: '世界保存最完好、持续使用时间最长的传统柴烧龙窑', en: '' }, correct: true, feedback: { zh: '2002年，南风古灶以"世界保存最完好、持续使用时间最长的传统柴烧龙窑"载入吉尼斯世界纪录。五百多年来窑火不绝、生产未断，全长34.4米，依山势向南伸展，至今仍在使用。', en: '' } },
      { text: { zh: '世界上最大的陶瓷生产工厂', en: '' }, correct: false, feedback: { zh: '南风古灶的吉尼斯纪录关键词是"保存最完好、持续使用时间最长的传统柴烧龙窑"，而非以规模或产量衡量。', en: '' } },
    ] }],
    reward: { badge: '🏺', badgeName: { zh: '石湾陶火印', en: 'Seal of Shiwan Kiln Fire' }, insight: { zh: '南风古灶的价值不在于一座古窑保存完好，而在于它从未停止燃烧。明正德年间霍氏家族在元代"文灶"基础上改建出这条34.4米的柴烧龙窑，因窑向正南得名"南风"。此后五百余年，岭南屋脊上的瓦、祠堂里的陶塑、家家户户的酱缸都从这里烧出——"石湾瓦甲天下"不是一句广告，而是五百年不间断的窑火堆出来的口碑。2002年它以"世界持续使用时间最长的传统柴烧龙窑"载入吉尼斯纪录，因为别处的古窑早已熄火变成标本，南风灶的火还在烧。', en: '' } },
  },
  'N-AW07': {
    characters: [{ name: { zh: '石岐食客', en: 'Shiqi Diner' }, role: { zh: '中山味觉讲述者', en: 'Narrator of Zhongshan taste' }, portrait: '' }],
    intro: { zh: '你走在中山石岐的孙文西路步行街上，欧式柱头与岭南骑楼在同一排立面里混搭。这条街19世纪末至20世纪初兴建，古称"迎恩街"，是香山870多年政治经济文化中心的商业脊梁。拐进一条巷子，乳鸽的焦香从骑楼间飘出——1915年，香山华侨从美国带回了白羽王鸽和贺姆鸽，与本地鸽杂交，到1930年代才形成肉厚味鲜的"石岐鸽"。街尽头那座香山商业文化博物馆，前身是1940年代的石岐镇总商会。', en: '' },
    scenes: [{ speaker: 0, q: { zh: '石岐乳鸽所用的"石岐鸽"是如何培育出来的？', en: '' }, options: [
      { text: { zh: '1915年华侨从美国带回白羽王鸽、贺姆鸽与本地鸽杂交，1930年代形成"石岐鸽"', en: '' }, correct: true, feedback: { zh: '1915年，香山华侨从美国引进白羽王鸽和贺姆鸽，与本地鸽杂交选育，到1930年代终于形成体型大、肉质嫩的"石岐鸽"品种。一道地方名菜的背后，是侨乡人口跨国流动带来的物种交换，花了近二十年才定型。', en: '' } },
      { text: { zh: '石岐本地自古就有的原生鸽种', en: '' }, correct: false, feedback: { zh: '"石岐鸽"并非原生鸽种，而是1915年华侨从美国带回白羽王鸽、贺姆鸽后与本地鸽杂交，经过近二十年选育才在1930年代形成的改良品种。', en: '' } },
    ] }, { speaker: 0, q: { zh: '孙文西路步行街上的香山商业文化博物馆，前身是什么机构？', en: '' }, options: [
      { text: { zh: '1940年代的石岐镇总商会', en: '' }, correct: true, feedback: { zh: '香山商业文化博物馆的前身是1940年代的石岐镇总商会。石岐作为香山870多年的政治经济文化中心，总商会曾在这里协调商贸、维持市面秩序。后来旧址改建为博物馆，专门展示香山商业文化历史。', en: '' } },
      { text: { zh: '孙中山故居纪念馆的分馆', en: '' }, correct: false, feedback: { zh: '该博物馆的前身是1940年代的石岐镇总商会，与孙中山故居纪念馆是不同的机构。石岐是香山的商业中心，总商会曾在此发挥过重要的商贸协调职能。', en: '' } },
    ] }],
    reward: { badge: '🐦', badgeName: { zh: '石岐风味印', en: 'Seal of Shiqi Flavor' }, insight: { zh: '石岐老街的力量在于它让宏大的侨乡史变成了可以咀嚼的东西。孙文西路19世纪末拔地而起时，香山华侨正把南洋和北美的资本、建材和生活方式搬回故乡；1915年有人从美国带回白羽王鸽和贺姆鸽，与本地鸽杂交近二十年，到1930年代才养出肉厚味鲜的"石岐鸽"。总商会的旧址变成了商业文化博物馆，骑楼里的乳鸽店还在用同一个品种。一条街上的建筑、鸽种和商会档案，分别对应着侨乡资本回流、物种跨国交换和商贸制度演进三条线索，最终都落在同一张餐桌上。', en: '' } },
  },
  'N-AW08': {
    characters: [{ name: { zh: '官也街店主', en: 'Rua do Cunha Shopkeeper' }, role: { zh: '澳门小吃讲述者', en: 'Narrator of Macao snacks' }, portrait: '' }],
    intro: { zh: '你踏入中国澳门氹仔的官也街，短短115米、宽不过5米，却塞满了整条街的食物热气。左边晃记饼家的杏仁饼刚出炉，鸡仔饼的油香钻进鼻腔；右前方大利来记的猪扒包在炭火上嗞嗞作响；尽头诚昌饭店的水蟹粥正冒着滚烫的白气。葡挞的焦糖面在蛋心上结出一层琥珀色的脆壳——酥脆塔皮裹着嫩滑蛋心，这是中葡文化四百年交融熬出来的一口甜。', en: '' },
    scenes: [{ speaker: 0, q: { zh: '官也街最知名的猪扒包店是哪一家？', en: '' }, options: [
      { text: { zh: '大利来记', en: '' }, correct: true, feedback: { zh: '大利来记是官也街最知名的猪扒包店。猪扒先腌后炸，夹在脆面包中间，是氹仔街头最有代表性的小吃之一。官也街仅115米长、5米宽，大利来记就挤在这条小巷里，每天排队的食客从店门口一直延伸到街角。', en: '' } },
      { text: { zh: '晃记饼家', en: '' }, correct: false, feedback: { zh: '晃记饼家以传统杏仁饼和鸡仔饼闻名，是官也街的老字号饼家，但最知名的猪扒包店是大利来记。', en: '' } },
    ] }, { speaker: 0, q: { zh: '官也街上能吃到水蟹粥的老字号饭店叫什么？', en: '' }, options: [
      { text: { zh: '诚昌饭店', en: '' }, correct: true, feedback: { zh: '诚昌饭店是官也街上以水蟹粥闻名老字号。水蟹粥用新鲜水蟹熬煮，粥底绵滑，蟹味鲜甜，是中国澳门氹仔最具代表性的地道美食之一。诚昌饭店就开在官也街尽头，和晃记饼家、大利来记一起构成了这条115米小街的味觉版图。', en: '' } },
      { text: { zh: '玛嘉烈蛋挞店', en: '' }, correct: false, feedback: { zh: '玛嘉烈以葡式蛋挞闻名，水蟹粥的代表老字号是诚昌饭店，就开在官也街上。', en: '' } },
    ] }],
    reward: { badge: '🥧', badgeName: { zh: '官也甜咸印', en: 'Seal of Rua do Cunha Taste' }, insight: { zh: '官也街只有115米长、5米宽，却把中国澳门四百年中葡交融压缩成了一条可以边走边吃的走廊。晃记饼家的杏仁饼和鸡仔饼延续着广式饼食的手艺，大利来记的猪扒包把西式炸猪排塞进了中式面包，诚昌饭店的水蟹粥用本地水域的鲜蟹熬出绵粥底，葡挞的酥皮和蛋心则直接来自葡萄牙烘焙传统。四种食物分别对应粤式饼艺、西式肉食、本地水产和葡式甜点四条线索，它们能在同一条巷子里并存，是因为1557年葡萄牙人入居澳门之后，四百年的通婚、贸易和日常往来已经把两种饮食传统磨合成了一套可以同时端上桌的味觉系统。', en: '' } },
  },
  'N-AW09': {
    characters: [{ name: { zh: '大澳蜑家老渔民', en: 'Tai O Tanka Elder' }, role: { zh: '棚屋水道守望者', en: 'Guardian of Stilt-House Waterways' }, portrait: '' }],
    intro: { zh: '你在清晨走进大屿山大澳水道,木桥在脚下轻响,海风里混着虾酱、咸鱼和柴油船的气味。棚屋架在潮间带的木柱上,户户相连,用坤甸木搭成——这种木料泡在海水中七八十年也不腐烂。英国人来港之前,大澳就叫「蜑家村」,是南海蜑家渔民世代以船为家的聚居地。脚下这片水面,藏着香港被高楼遮住的最古老的海事记忆。', en: 'At dawn you enter Tai O on Lantau Island. Timber footbridges creak underfoot; the wind carries shrimp paste, dried fish and diesel. Stilt houses on hardwood pillars — timber that resists seawater for decades — stand connected across the tidal flats. Before the British arrived, Tai O was already a "Tanka village," where boat-dwelling fishers lived for generations. Beneath your feet lies Hong Kong\'s oldest maritime memory, hidden by skyscrapers.' },
    scenes: [{ speaker: 0, q: { zh: '蜑家人为什么不在陆地上盖房,而要在水面上搭棚屋?', en: 'Why did the Tanka build stilt houses on water instead of homes on land?' }, options: [
      { text: { zh: '蜑民世代以船为家,觉得陆地没有安全感,在潮间带打桩搭屋可以兼顾出海和生活', en: 'The Tanka lived on boats for generations; land felt insecure, so they built on tidal pilings to balance sea access and daily life' }, correct: true, feedback: { zh: '正是。蜑家人认为平实土地无法带来安全感,便在海床上以坤甸木打桩搭屋,棚屋建在竖立于水面的木柱之上,户户相连,鳞次栉比。渔民多以舢舨出入,水道就是他们的街道。', en: 'Exactly. The Tanka felt land offered no security; they drove hardwood pilings into the seabed and built houses on them, connected household to household. Boats were their transport; waterways were their streets.' } },
      { text: { zh: '因为陆地地价太贵', en: 'Because land was too expensive' }, correct: false, feedback: { zh: '不是地价问题。大澳在英占之前就是蜑家村,蜑家人是「以船为家」的水上族群,在海上漂流打鱼为生,搭棚屋是延续了水上生活的居住传统,而非经济选择。', en: 'Not about price. Tai O was a Tanka village before the British; the Tanka were a boat-dwelling people. Stilt houses continued their waterborne way of life, not an economic choice.' } },
    ] }, { speaker: 0, q: { zh: '大澳的盐田遗址可以上溯到什么时候?', en: 'How far back do Tai O\'s salt pans date?' }, options: [
      { text: { zh: '据说可上溯至石器时代,有史可考的人类聚落约有三个世纪', en: 'Reportedly Stone Age; documented settlement spans about three centuries' }, correct: true, feedback: { zh: '正是。大澳盐田遗址据说可上溯至石器时代,有史可考的聚落约三百年。百多年来,大澳一直是香港渔盐业重地,出产的咸鱼和虾酱远销各地。今天的棚屋区虽然只剩约两千居民,但仍是香港现存最完整的蜑家水上聚落。', en: 'Exactly. Tai O\'s salt pans reportedly date to the Stone Age; documented settlement spans about 300 years. For over a century, Tai O was a fishing and salt hub; its dried fish and shrimp paste sold widely. Today\'s stilt-house community of ~2,000 remains Hong Kong\'s most complete Tanka settlement.' } },
      { text: { zh: '盐田是近代才有的', en: 'Salt pans are a modern addition' }, correct: false, feedback: { zh: '远不止近代。大澳的盐业历史极为悠久,渔盐并重是这里数百年来的经济基础。即使在今天,大澳仍保留着传统虾酱晒制工艺,是岭南海洋饮食文化的一块活化石。', en: 'Far from modern. Tai O\'s salt industry has deep roots; fishing and salt together formed its economy for centuries. Even today, traditional shrimp paste sun-drying survives — a living fossil of Lingnan maritime food culture.' } },
    ] }],
    reward: { badge: '🛶', badgeName: { zh: '大澳蜑家印', en: 'Seal of Tai O Tanka' }, insight: { zh: '大澳是香港现存最古老的原生渔村,棚屋用坤甸木搭在潮间带上,七八十年不腐。英国人来之前这里就叫「蜑家村」,蜑家人世代以船为家,在海上漂流打鱼。如今摩天楼遮住了香港的天际线,但大澳的木桥、虾酱和咸鱼气味,还守着这座城市最初的海洋底色。', en: 'Tai O is Hong Kong\'s oldest surviving fishing village. Its stilt houses, built on hardwood pilings in the tidal zone, last decades. Called "Tanka Village" before the British, the Tanka lived on boats for generations. While skyscrapers define today\'s skyline, Tai O\'s bridges, shrimp paste and dried-fish scent still guard the city\'s original maritime identity.' } },
  },
  'N-AW10': {
    characters: [{ name: { zh: '道滘龙舟手', en: 'Daojiao Dragon-Boater' }, role: { zh: '水乡节令讲述者', en: 'Narrator of water-town seasons' }, portrait: '' }],
    intro: { zh: '你是端午前后走进道滘的旅人。河涌交错、水网纵横，龙舟鼓从祠堂边一阵阵传来——每年农历五月初二是道滘龙舟狂欢节，明清时期这里已有龙舟竞赛，道滘龙船堂是最早成立的龙舟组织。你经过兴隆街，闻到蒸粽的糯米香和箬叶气息混在一起。上世纪30年代，绰号"红脸潮"的叶潮就在这条街上开了"潮记"，用晚造糯米、咸鸭蛋黄、湘莲、五花腩作馅，五香粉蒜蓉沙姜调味，做出了被誉为"天下第一粽"的道滘裹蒸粽。五月初一涨潮时，水乡人还会把纸花放入河中祈平安——这是放河莲花的百年传统。', en: '' },
    scenes: [{ speaker: 0, q: { zh: '道滘裹蒸粽的创始人是谁？他在哪里开店闻名？', en: '' }, options: [
      { text: { zh: '上世纪30年代创始人叶潮（绰号红脸潮），在兴隆街开设"潮记"闻名', en: '' }, correct: true, feedback: { zh: '上世纪30年代，绰号"红脸潮"的叶潮在道滘兴隆街开设"潮记"粽子店。他用晚造糯米、咸鸭蛋黄、湘莲、五花腩作馅，以五香粉、蒜蓉、沙姜调味，做出的裹蒸粽糯而不烂、咸香透骨，被誉为"天下第一粽"，后入选广东省非物质文化遗产。', en: '' } },
      { text: { zh: '清代道滘龙船堂的龙舟手在船上随手包的粽子', en: '' }, correct: false, feedback: { zh: '道滘裹蒸粽的创始人是上世纪30年代的叶潮（绰号红脸潮），他在兴隆街开"潮记"出名，与龙船堂的龙舟手无关。', en: '' } },
    ] }, { speaker: 0, q: { zh: '道滘龙舟狂欢节定在每年农历哪一天？', en: '' }, options: [
      { text: { zh: '农历五月初二', en: '' }, correct: true, feedback: { zh: '道滘龙舟狂欢节定在每年农历五月初二。明清时期道滘已有龙舟竞赛传统，道滘龙船堂是最早成立的龙舟组织。选择五月初二而非初五端午正日，是道滘水乡自己的节令安排，与五月初一涨潮放河莲花的百年传统衔接在一起。', en: '' } },
      { text: { zh: '农历五月初五端午节当天', en: '' }, correct: false, feedback: { zh: '道滘龙舟狂欢节定在农历五月初二，而非五月初五端午正日。道滘有自己的节令节奏：五月初一涨潮时放河莲花祈平安，初二龙舟竞渡，形成水乡独有的端午前后民俗序列。', en: '' } },
    ] }],
    reward: { badge: '🚣', badgeName: { zh: '水乡节令印', en: 'Seal of Water-Town Seasons' }, insight: { zh: '道滘水乡让东莞在工厂流水线之外保留了一套以水网为骨架的生活时间表。河涌纵横的地貌决定了这里明清就有龙舟竞赛，道滘龙船堂是最早的龙舟组织；农历五月初一涨潮时放河莲花祈平安，初二全乡龙舟竞渡，这套节令序列是水网地理逼出来的协作传统。上世纪30年代叶潮在兴隆街开"潮记"，用晚造糯米、咸鸭蛋黄、湘莲、五花腩和五香粉蒜蓉沙姜做出"天下第一粽"——裹蒸粽的配料全是水乡物产，包扎方式适配长时间柴火蒸煮，后来入选广东省非物质文化遗产。龙舟、河莲花和裹蒸粽分别对应水上协作、潮汐信仰和水乡食材三条线索，它们都长在同一张河网上，说明东莞不只是制造业城市，也是一座有八百年水乡肌理的岭南古镇。', en: '' } },
  },

  // ============ 新增锚点 · 航海贸易 ============
  'N-NA05': {
    characters: [{ name: { zh: '南沙海民', en: 'Nansha Sea Folk' }, role: { zh: '天后宫航海信仰讲述者', en: 'Narrator of Tianhou maritime belief' }, portrait: '' }],
    intro: {
      zh: '1994年。你站在南沙大角山脚,眼前是一片被日寇飞机炸毁的庙基残砖——这里曾是明代鹿颈村天妃庙,清乾隆年间重修后定名"元君古庙",抗战中化为废墟。霍英东倡议并捐资重建,工人们正将一根根梁柱竖起来。两年后,1996年农历三月二十三日——天后林默的诞辰——东南亚最大的妈祖庙将在这里落成。海风从珠江口灌进来,远处南沙港的集装箱吊机正在运转。',
      en: '1994. You stand at the foot of Dajiaoshan in Nansha, before rubble from a temple bombed by Japanese forces — once the Ming-era Lujing Village Tianfei Temple, rebuilt in the Qianlong era as "Yuanjun Ancient Temple," destroyed during the war. Fok Ying-tung has proposed and funded its reconstruction; workers raise pillars one by one. Two years later, on the 23rd day of the third lunar month in 1996 — the birthday of Tianhou Lin Mo — Southeast Asia\'s largest Mazu temple will open here. Sea wind pours in from the Pearl River mouth; Nansha Port\'s container cranes operate in the distance.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '天后林默是哪个时代的人?', en: 'In which era did Tianhou Lin Mo live?' },
        options: [
          { text: { zh: '宋代福建湄洲屿人,生于960年,卒于987年', en: 'A Song Dynasty native of Meizhou Island, Fujian; born 960, died 987' }, correct: true, feedback: { zh: '天后林默(960-987年)是宋代福建湄洲屿人,民间称妈祖。她短短28年的生命在民间传说中被不断演绎,最终从地方渔村女子演变为跨越千年的海神信仰。南沙天后宫供奉的正是这位宋代妈祖。', en: 'Tianhou Lin Mo (960-987) was a Song Dynasty native of Meizhou Island, Fujian, known to the people as Mazu. Her 28 years of life were embellished in folk legend, evolving from a local fishing village woman into a sea goddess worshipped for over a millennium. Nansha Tianhou Palace is dedicated to this Song-era Mazu.' } },
          { text: { zh: '明代广东南沙本地人', en: 'A Ming Dynasty native of Nansha, Guangdong' }, correct: false, feedback: { zh: '林默是宋代福建湄洲屿人,并非南沙本地人。南沙天后宫的前身是明代鹿颈村天妃庙,清乾隆年间重修后定名"元君古庙",但庙中供奉的妈祖信仰源头在福建湄洲。', en: 'Lin Mo was a Song Dynasty native of Meizhou Island, Fujian, not a Nansha local. Nansha Tianhou Palace\'s predecessor was the Ming-era Lujing Village Tianfei Temple, rebuilt in the Qianlong era as "Yuanjun Ancient Temple," but the Mazu belief it enshrines originated in Meizhou, Fujian.' } },
        ],
      },
      {
        speaker: 0,
        q: { zh: '南沙天后宫的前身"元君古庙"经历了什么?', en: 'What happened to the predecessor "Yuanjun Ancient Temple"?' },
        options: [
          { text: { zh: '明代建庙,清乾隆年间重修定名,抗战时期被日寇飞机炸毁,1994年霍英东捐资重建', en: 'Built in the Ming era, rebuilt and named in Qianlong\'s reign, bombed by Japanese forces during the war, rebuilt with Fok Ying-tung\'s funding in 1994' }, correct: true, feedback: { zh: '南沙天后宫的前身是明代鹿颈村天妃庙,清乾隆年间重修后定名"元君古庙"。抗战时期日寇飞机将其炸毁,废墟荒芜数十年。1994年霍英东倡议并捐资重建,1996年农历三月二十三日(天后诞辰)落成,是东南亚最大的妈祖庙。', en: 'Nansha Tianhou Palace\'s predecessor was the Ming-era Lujing Village Tianfei Temple, rebuilt during the Qianlong reign as "Yuanjun Ancient Temple." Japanese warplanes bombed it during the war, leaving rubble for decades. In 1994 Fok Ying-tung proposed and funded its reconstruction; it was completed on the 23rd day of the third lunar month, 1996 — Tianhou\'s birthday — as Southeast Asia\'s largest Mazu temple.' } },
          { text: { zh: '元君古庙从未被毁坏,一直保存至今', en: 'Yuanjun Ancient Temple was never damaged and survives intact today' }, correct: false, feedback: { zh: '元君古庙在抗战时期被日寇飞机炸毁,此后数十年间仅存废墟。直到1994年霍英东倡议并捐资重建,才在原址上建起如今的南沙天后宫,1996年天后诞辰日落成。', en: 'Yuanjun Ancient Temple was bombed by Japanese warplanes during the war and remained rubble for decades. Only in 1994, when Fok Ying-tung proposed and funded reconstruction, was the current Nansha Tianhou Palace built on the original site, completed on Tianhou\'s birthday in 1996.' } },
        ],
      },
    ],
    reward: { badge: '🕯️', badgeName: { zh: '南沙祈风印', en: 'Seal of Nansha Sea Blessing' }, insight: { zh: '南沙天后宫的前身可追溯到明代鹿颈村天妃庙,清乾隆年间重修后定名"元君古庙",抗战时期被日寇飞机炸为废墟。1994年霍英东倡议并捐资重建,1996年农历三月二十三日——天后诞辰——东南亚最大妈祖庙在此落成。天后林默(960-987年)是宋代福建湄洲屿人,短短28年生命化为跨越千年的海神信仰。如今南沙港的集装箱吊机与天后宫的香火遥遥相对——千年间,渔民靠妈祖壮胆出海,港口靠物流系统连接世界,面对大海的敬畏从未改变,只是换了表达方式。', en: 'Nansha Tianhou Palace traces back to the Ming-era Lujing Village Tianfei Temple, rebuilt during the Qianlong reign as "Yuanjun Ancient Temple," and bombed to rubble by Japanese forces during the war. In 1994 Fok Ying-tung proposed and funded reconstruction; on the 23rd day of the third lunar month, 1996 — Tianhou\'s birthday — Southeast Asia\'s largest Mazu temple opened. Tianhou Lin Mo (960-987), a Song Dynasty native of Meizhou Island, Fujian, lived only 28 years yet became a sea goddess worshipped for a millennium. Today Nansha Port\'s container cranes face the temple\'s incense across the water — for a thousand years, fishermen relied on Mazu for courage at sea; ports rely on logistics to connect the world. The awe before the ocean never changed, only its expression.' } },
  },
  'N-NA06': {
    characters: [{ name: { zh: '妈阁庙香客', en: 'A-Ma Pilgrim' }, role: { zh: '澳门港口源头讲述者', en: 'Narrator of Macaus maritime origin' }, portrait: '' }],
    intro: {
      zh: '1553年,明嘉靖三十二年。你是中国澳门妈阁庙前的一个渔民,正修补渔网。一艘葡萄牙商船从海面驶来,几个红发碧眼的外国人从庙附近登岸。他们指着此地问叫什么名字,你随口答了句"妈阁"——妈祖阁的简称。葡萄牙人把这个词音译为"Macau",从此成为这座城市的葡文名称。身后是始建于明代的妈阁庙,香火缭绕,"先有妈阁庙,后有澳门城"。',
      en: '1553, the 32nd year of Jiajing. You are a fisherman before A-Ma Temple in Macau, China, mending nets. A Portuguese merchant ship approaches; foreigners land near the temple. They point at the place and ask its name; you casually answer "A-Ma Ge" — short for A-Ma Pavilion. The Portuguese transliterate this as "Macau," which becomes the city\'s Portuguese name. Behind you stands A-Ma Temple, built in the Ming Dynasty, incense curling — "first came A-Ma Temple, then the city of Macau."',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '中国澳门的葡文名称"Macau"是怎样得来的?', en: 'How did Macau\'s Portuguese name "Macau" originate?' },
        options: [
          { text: { zh: '葡萄牙人从妈阁庙附近登陆,问当地人地名,渔民答"妈阁",葡人音译为"Macau"', en: 'Portuguese landed near A-Ma Temple, asked locals the place name, fishermen answered "A-Ma Ge," which they transliterated as "Macau"' }, correct: true, feedback: { zh: '1553年葡萄牙人从妈阁庙附近登陆,问当地人此地名称,渔民回答"妈阁"(妈祖阁),葡人音译为"Macau",这成为中国澳门葡文名称的由来。一座小庙的名字,成为了一座国际城市的世界符号。', en: 'In 1553 the Portuguese landed near A-Ma Temple and asked locals the place name. Fishermen answered "A-Ma Ge" (A-Ma Pavilion), which the Portuguese transliterated as "Macau" — the origin of Macau\'s Portuguese name. A small temple\'s name became a world symbol for an international city.' } },
          { text: { zh: '葡萄牙人根据地图上已有的标注命名的', en: 'The Portuguese named it based on existing map annotations' }, correct: false, feedback: { zh: '"Macau"的来源并非地图标注,而是1553年葡人登陆后与渔民的口语交流。渔民口中的"妈阁"被葡人音译为"Macau",一个民间对话的瞬间,意外定格了一座城市五百年的名字。', en: '"Macau" did not come from map annotations but from a 1553 verbal exchange between Portuguese arrivals and local fishermen. The fishermen\'s "A-Ma Ge" was transliterated as "Macau" — a casual conversation accidentally fixed a city\'s name for five centuries.' } },
        ],
      },
      {
        speaker: 0,
        q: { zh: '妈阁庙的始建年代,目前有哪两种主要说法?', en: 'What are the two main theories about when A-Ma Temple was built?' },
        options: [
          { text: { zh: '一说1488年(明弘治元年),一说1605年', en: 'One theory: 1488 (first year of Hongzhi); another: 1605' }, correct: true, feedback: { zh: '妈阁庙始建于明代,关于具体年份有两种说法:一说1488年即明弘治元年,一说1605年。无论哪种说法,妈阁庙的建造都早于1553年葡人登陆,"先有妈阁庙,后有澳门城"正是这个意思。妈阁庙也是世界文化遗产"中国澳门历史城区"的重要组成部分。', en: 'A-Ma Temple was built in the Ming Dynasty, with two theories on the exact year: 1488 (first year of Hongzhi) or 1605. Either way, the temple predates the 1553 Portuguese landing — "first came A-Ma Temple, then the city of Macau." A-Ma Temple is an important component of the World Heritage site "Historic Centre of Macau, China."' } },
          { text: { zh: '妈阁庙建于葡萄牙人登陆之后的近代', en: 'A-Ma Temple was built in modern times after the Portuguese landing' }, correct: false, feedback: { zh: '妈阁庙始建于明代,一说1488年(明弘治元年),一说1605年,均早于1553年葡人登陆。"先有妈阁庙,后有澳门城"说明妈祖信仰在葡人到来之前已在此扎根,妈阁庙也是世界文化遗产"中国澳门历史城区"的重要组成部分。', en: 'A-Ma Temple was built in the Ming Dynasty — either 1488 (first year of Hongzhi) or 1605 — both predating the 1553 Portuguese landing. "First came A-Ma Temple, then the city of Macau" shows Mazu belief was rooted here before the Portuguese arrived. A-Ma Temple is an important part of the World Heritage "Historic Centre of Macau, China."' } },
        ],
      },
    ],
    reward: { badge: '🌊', badgeName: { zh: '妈阁海源印', en: 'Seal of A-Ma Maritime Origin' }, insight: { zh: '妈阁庙始建于明代,一说1488年(明弘治元年),一说1605年,"先有妈阁庙,后有澳门城"道出了这座庙宇在城市中的辈分。1553年葡萄牙人从妈阁庙附近登陆,问渔民地名,渔民答"妈阁",葡人音译为"Macau"——一个渔民随口的回答,成为一座城市五百年的国际名称。妈阁庙是世界文化遗产"中国澳门历史城区"的重要组成部分。从一座海边的妈祖小庙,到一座以它命名的国际城市,妈阁庙把一个渔村口音写进了世界地图,也让一段五百年前的对话至今回响在城市的名字里。', en: 'A-Ma Temple was built in the Ming Dynasty — either 1488 (first year of Hongzhi) or 1605. "First came A-Ma Temple, then the city of Macau" speaks to the temple\'s seniority in the city. In 1553 the Portuguese landed near A-Ma Temple, asked fishermen the place name, and heard "A-Ma Ge," which they transliterated as "Macau" — a fisherman\'s casual answer became a city\'s international name for five centuries. A-Ma Temple is an important component of the World Heritage "Historic Centre of Macau, China." From a small seaside Mazu temple to an international city named after it, A-Ma Temple wrote a fishing village\'s accent onto the world map, and a 500-year-old conversation still echoes in the city\'s name.' } },
  },
  'N-NA07': {
    characters: [{ name: { zh: '桂山号枪炮长', en: 'Guishan Gunnery Chief' }, role: { zh: '万山海战亲历者', en: 'Veteran of the Wanshan Battle' }, portrait: '' }],
    intro: { zh: '1950年5月25日凌晨,你随广东军区江防部队从珠海唐家湾隐蔽出航,驶向垃圾尾岛。海雾压得很低,远处只有国民党守军舰艇的探照灯划过水面。火力队副队长林文虎站在你身边,低声说:今天这一仗,是人民海军的第一仗。船头破浪,一场以小船对大军舰的海战,就要在珠江口外打响。', en: 'Before dawn on May 25, 1950, you depart from Tangjiawan with the Guangdong military river-defense force, heading for Lajwei Island. Sea fog hangs low; only the searchlights of enemy warships sweep the water. Deputy commander Lin Wenhu whispers: today is the first battle of the People\'s Navy. The bow cuts the waves — a battle of small boats versus big warships is about to erupt at the Pearl River mouth.' },
    scenes: [{ speaker: 0, q: { zh: '1950年5月25日,林文虎率28吨的「解放号」炮艇冲入马湾,发现港内停着20余艘国民党军舰。他为什么还下令「全速冲进去」?', en: 'On May 25, 1950, Lin Wenhu\'s 28-ton gunboat "Liberation" entered Ma Wan and found 20+ enemy warships. Why did he order "full speed ahead"?' }, options: [
      { text: { zh: '近战夜战是解放军传统,小艇贴上去反而让敌舰大炮够不着', en: 'Close night combat was a PLA tradition; small boats closing in made enemy heavy guns useless' }, correct: true, feedback: { zh: '正是。林文虎当机立断,28吨的「解放号」像尖刀插进敌舰群,专打旗舰「太和」号护卫舰,把舰队司令齐鸿章手臂打断。一小时激战击沉击伤敌舰5艘——天亮后敌人才发现打他们的只有一艘小炮艇。', en: 'Exactly. The 28-ton "Liberation" pierced the enemy fleet like a blade, crippling the flagship "Taihe" and wounding commander Qi Hongzhang. After an hour, 5 enemy ships were sunk or damaged — at dawn they realized it was just one gunboat.' } },
      { text: { zh: '因为后方有大舰队支援', en: 'Because a large fleet was backing them up' }, correct: false, feedback: { zh: '恰恰相反。江防部队全部舰船中最大的「桂山号」也只有358吨,其余全是杂型小炮艇。林文虎的「解放号」仅28吨,面对的敌舰总吨位是它的300倍。这是货真价实的以弱攻强。', en: 'The opposite. The largest ship in the river-defense force was the 358-ton "Guishan"; the rest were miscellaneous gunboats. Lin\'s "Liberation" was 28 tons against an enemy fleet 300 times its tonnage.' } },
    ] }, { speaker: 0, q: { zh: '「桂山号」中弹起火后,舰长郭庆隆做出了什么决定?', en: 'After the "Guishan" caught fire, what did Captain Guo Qinglong decide?' }, options: [
      { text: { zh: '指挥战舰冲上垃圾尾岛滩头,让陆军加强排登陆作战', en: 'Ran the ship aground on Lajwei Island to land the assault troops' }, correct: true, feedback: { zh: '正是。郭庆隆操舵将燃烧的桂山号冲上滩头,两个加强排在海滩石丛中与守军展开激战,最终全部壮烈牺牲,郭庆隆被刺刀刺中殉国。桂山号像钉子一样钉在马湾口,为后续部队赢得了宝贵时间。', en: 'Exactly. Guo ran the burning ship aground; two assault platoons fought on the beach until all fell. Guo was killed by bayonet. The Guishan pinned the harbor mouth, buying precious time for follow-up forces.' } },
      { text: { zh: '立即撤退保存实力', en: 'Retreated immediately to preserve strength' }, correct: false, feedback: { zh: '没有退。桂山号舰长池敬樟已在炮战中牺牲,陆军副团长郭庆隆接替指挥,选择冲滩登陆。正是这个决定让垃圾尾岛后来改名桂山岛——用一艘船的名字纪念一群人的牺牲。', en: 'They did not retreat. Captain Chi Jingzhang had already fallen; army deputy commander Guo Qinglong took over and chose to beach. This is why Lajwei Island was renamed Guishan Island — a ship\'s name for a sacrifice.' } },
    ] }],
    reward: { badge: '🏝️', badgeName: { zh: '万山海战印', en: 'Seal of the Wanshan Battle' }, insight: { zh: '1950年万山群岛海战是人民海军的第一仗。一艘叫「桂山」的船沉在垃圾尾岛,这座岛因此换了名字——从此珠江口的海权换了主人,也为后来七十年的开放贸易守住了一片海上腹地。地图上的「桂山」二字,是历史留给地理的一句备忘。', en: 'The 1950 Wanshan battle was the People\'s Navy\'s first fight. A ship named "Guishan" sank at Lajwei Island, which then changed its name. The Pearl River mouth\'s sea power shifted hands, guarding seventy years of open trade. The word "Guishan" on the map is history\'s memo to geography.' } },
  },
  'N-NA08': {
    characters: [{ name: { zh: '花都司', en: 'Officer Hua' }, role: { zh: '明代平海守御千户所督建官', en: 'Builder of Pinghai Garrison' }, portrait: '' }],
    intro: { zh: '1385年,洪武十八年。你是奉明太祖之命南下广东的花都司。元末明初,稔平半岛南海一带海盗猖獗,民不聊生。你站在海边荒地上,面前是一片要建城的地方——城周五百二十丈,高一丈八尺,雉堞八百七十一个,四座城门楼,一座守御千户所。砖窑的烟火升起,一座要守护六百年海疆的石头城,从你脚下开始。', en: '1385, the 18th year of Hongwu. You are Officer Hua, sent south by the Ming Emperor. Pirates plague the coast. You stand on barren ground by the sea — before you lies the site of a walled city: 520 zhang around, 1.8 zhang high, 871 battlements, four gates, a garrison post. Kiln smoke rises; a stone fortress that will guard the coast for six centuries begins under your feet.' },
    scenes: [{ speaker: 0, q: { zh: '洪武年间,明太祖为什么要在惠东南端建平海所城?', en: 'Why did Emperor Hongwu build Pinghai Garrison at the southern tip of Huidong?' }, options: [
      { text: { zh: '元末明初海盗猖海盗猖獗,稔平半岛是南海海运咽喉,必须设城屯兵防守', en: 'Pirates ravaged the coast; the peninsula was a maritime chokepoint requiring a garrison' }, correct: true, feedback: { zh: '正是。平海所城建成守御千户所,城墙两边用城砖砌筑中间填土,部分城砖印有「官砖」二字。此后数百年,明清两代在此不断加固,康熙年间更在大星山加建炮台,形成壁垒森严的海防线。', en: 'Exactly. Built as a garrison post, its walls were brick-faced with earth core — some bricks stamped "Official." For centuries, Ming and Qing dynasties reinforced it; Kangxi-era batteries on Daxingshan formed a fortified coastal line.' } },
      { text: { zh: '只是皇帝的私人行宫', en: 'Just an imperial private palace' }, correct: false, feedback: { zh: '不是。平海所城从一开始就是军事要塞——「守御千户所」是明代卫所制度下的基层军事编制,专门负责海防。花都司奉旨建城,目的是「抵御外侵,安邦抚民」。', en: 'No. Pinghai was a military fortress from the start — a "Garrison Post" was a Ming military unit for coastal defense. Officer Hua built it to "resist invasion and pacify the people."' } },
    ] }, { speaker: 0, q: { zh: '清康熙年间,施琅在平海驻军时发生过什么故事?', en: 'What happened when Shi Lang stationed troops at Pinghai during Kangxi\'s reign?' }, options: [
      { text: { zh: '军中缺水,施琅掘井得泉,留下「甘泉济师」「师泉」的传说', en: 'Troops lacked water; Shi Lang dug a well and found a spring — "Sweet Spring Aids the Army"' }, correct: true, feedback: { zh: '正是。施琅驻军平海备战征台时,海水潮汐涨退,淡水难求。他命人掘井,竟得甘泉,军心大振。这口「师泉井」至今仍在平海古城内,是六百年海防史的一个活注脚。', en: 'Exactly. When Shi Lang prepared his Taiwan campaign at Pinghai, fresh water was scarce amid the tides. He ordered a well dug and struck sweet spring — morale soared. The "Shi Spring Well" stands in Pinghai to this day.' } },
      { text: { zh: '施琅在平海修筑了长城', en: 'Shi Lang built a Great Wall at Pinghai' }, correct: false, feedback: { zh: '没有长城,但有炮台。康熙至嘉庆年间,平海城前沿相继筑有大星山炮台、盘沿港炮台、墩头港炮台等,构成了一道壁垒森严的海防线。施琅的「甘泉济师」是其中最有人情味的一段。', en: 'No Great Wall, but batteries. From Kangxi to Jiaqing, forts were built at Daxingshan, Panyan and Dundou, forming a fortified sea defense. Shi Lang\'s well story is the most human chapter.' } },
    ] }],
    reward: { badge: '🛡️', badgeName: { zh: '平海所城印', en: 'Seal of Pinghai Garrison' }, insight: { zh: '平海所城建于1385年,是岭南现存较完整的明代守御千户所城。一座军事堡垒在六百年间从抗倭前哨变成民俗名城,城内十字古街和七星古井至今保存完好,独特的「军话」是当年各地驻军留下的语言化石。', en: 'Pinghai, built in 1385, is one of Lingnan\'s best-preserved Ming garrison cities. In six centuries it went from anti-pirate outpost to folk-culture town; its cross-shaped streets, seven wells, and the military dialect "Junhua" are living fossils of garrison life.' } },
  },
  'N-NA09': {
    characters: [{ name: { zh: '长洲岛民', en: 'Cheung Chau Islander' }, role: { zh: '太平清醮传承人', en: 'Cheung Chau Jiao Festival Keeper' }, portrait: '' }],
    intro: { zh: '你是清代晚期的长洲岛渔民。一场瘟疫席卷全岛,染病者高烧不退,草药无验。族中长老从海陆丰请来北帝神像,抬着它绕岛游行每一条街巷,锣鼓鞭炮声震得屋瓦发颤。游行之后,瘟疫竟然止住了。全岛居民跪在北帝庙前叩谢神恩,立誓每年举办太平清醮——搭起三座十余米高的竹棚包山,每座挂满印着"寿"字的莲蓉平安包,让神明和百姓同沾福气。一百多年后,这个仪式仍在延续。', en: 'You are a Cheung Chau fisherman in the late Qing dynasty. A plague sweeps the island — victims burn with fever, herbs fail. The village elder brings the Pak Tai deity statue from Hailufeng, parading it through every street and alley. Drums and firecrackers shake the roof tiles. After the parade, the plague stops. The entire island kneels before Pak Tai Temple, vowing to hold the annual Cheung Chau Jiao Festival — erecting three bamboo bun towers over ten meters tall, each hung with lotus-seed "longevity" buns for gods and people to share. Over a century later, the ritual continues.' },
    scenes: [{ speaker: 0, q: { zh: '长洲太平清醮中的"抢包山"活动,1978年发生了什么导致它停办?', en: 'What happened at the Cheung Chau "Bun Scrambling" in 1978 that caused it to be suspended?' }, options: [
      { text: { zh: '1978年包山竹棚倒塌,压伤24人,港英政府此后停办抢包山至2005年才恢复', en: 'In 1978 a bamboo bun tower collapsed, injuring 24; the colonial government suspended bun scrambling until 2005' }, correct: true, feedback: { zh: '1978年太平清醮期间,数千人聚集在北帝庙前等候抢包。凌晨时分,其中一座包山竹棚突然倒塌,巨大的竹架和万余个包子砸向人群,造成24人受伤。港英政府随即禁止抢包山活动,改为派发平安包。直到2005年,改用钢架结构并限制参赛人数后,抢包山才正式恢复,至今成为长洲太平清醮最引人注目的环节。', en: 'During the 1978 Jiao Festival, thousands gathered before Pak Tai Temple awaiting the bun scramble. At dawn, one bamboo tower suddenly collapsed, sending the massive frame and tens of thousands of buns crashing into the crowd — 24 were injured. The colonial government immediately banned bun scrambling, replacing it with distribution of buns. Only in 2005, after switching to steel-frame structures and limiting participants, was the scramble officially restored. It remains the most spectacular event of the Cheung Chau Jiao Festival.' } },
      { text: { zh: '1978年因遭遇台风袭击,包山被吹倒后停办', en: 'In 1978 a typhoon blew down the bun towers, leading to suspension' }, correct: false, feedback: { zh: '停办原因不是台风,而是包山竹棚结构不堪重负发生倒塌。1978年凌晨,数千人攀附在十余米高的竹棚包山上抢包,超载导致竹架断裂垮塌,24人被压伤。事故发生在太平清醮正日,天气并非异常——是人为超载而非天灾导致了这场意外。2005年恢复后改用钢架,正是吸取了这个教训。', en: 'The suspension was not due to a typhoon but to structural collapse of the bamboo tower. At dawn in 1978, thousands climbed the ten-meter bamboo structure to grab buns; overloading snapped the bamboo frame, injuring 24. The accident happened on the main festival day in normal weather — human overloading, not nature, caused it. The 2005 revival used steel frames precisely to prevent a repeat.' } },
    ] }, { q: { zh: '长洲太平清醮最初是由哪个群体传入长洲岛的?', en: 'Which community originally brought the Cheung Chau Jiao Festival to the island?' }, options: [
      { text: { zh: '由海陆丰移民传入,后扩展至全岛居民共同参与', en: 'Brought by Hailufeng migrants, later expanding to involve all island residents' }, correct: true, feedback: { zh: '长洲太平清醮由清代从海陆丰迁居长洲的居民传入。海陆丰人信奉北帝(玄天上帝),瘟疫发生时依照故乡习俗请北帝神像巡游街道,此后相沿成俗。最初只是海陆丰族群的活动,后来逐渐扩展为全岛居民共同参与的年度盛事。如今长洲太平清醮已列入国家级非物质文化遗产名录,从海陆丰乡俗变成了国家级文化瑰宝。', en: 'The Cheung Chau Jiao Festival was brought by migrants from Hailufeng who settled on the island during the Qing dynasty. Hailufeng people worshipped Pak Tai (the Dark Heaven deity); when plague struck, they followed their hometown custom of parading the Pak Tai statue through the streets. Originally a Hailufeng community ritual, it gradually became an island-wide annual event. Today it is listed as national intangible cultural heritage — from a Hailufeng village custom to a national cultural treasure.' } },
      { text: { zh: '由英国殖民政府引入,作为旅游项目推广', en: 'Introduced by the British colonial government as a tourism project' }, correct: false, feedback: { zh: '太平清醮远早于殖民政府的旅游推广。它是清代晚期海陆丰移民从故乡带来的民间信仰仪式,源于一次真实的瘟疫和居民对北帝的感恩。英治时期政府并未主导这项活动,反而是1978年包山倒塌事故后港英政府一度叫停抢包山。太平清醮能传承百余年,靠的是岛民自发的信仰,而非官方包装。', en: 'The Jiao Festival predates any colonial tourism promotion by far. It was a folk religious ritual brought by Hailufeng migrants in the late Qing, born from a real plague and the islanders\' gratitude to Pak Tai. The colonial government never organized it — in fact, it banned bun scrambling after the 1978 collapse. The festival survived for over a century through the islanders\' own faith, not official packaging.' } },
    ] }],
    reward: { badge: '⛴️', badgeName: { zh: '长洲渡海印', en: 'Seal of Cheung Chau Ferry' }, insight: { zh: '清代晚期长洲瘟疫,海陆丰移民抬北帝神像巡街后瘟疫止息,岛民立誓每年办太平清醮酬神。北帝庙前搭起三座十余米高的竹棚包山,每座挂约一万六千个印"寿"字的莲蓉平安包。1978年包山倒塌压伤24人,抢包山停办27年,2005年改用钢架恢复。如今长洲太平清醮已列入国家级非物质文化遗产名录——从一场瘟疫中的求神仪式,到今天数十万人观看的国家级文化盛事,一座小岛的感恩延续了百余年,包山上的"寿"字仍是当年那份祈愿的回声。', en: 'In the late Qing, plague struck Cheung Chau. Hailufeng migrants paraded the Pak Tai statue through the streets, and the plague stopped. The islanders vowed to hold an annual Jiao Festival. Three bamboo bun towers over ten meters tall were erected before Pak Tai Temple, each hung with about 16,000 lotus-seed "longevity" buns. In 1978 a tower collapsed, injuring 24; bun scrambling was suspended for 27 years, resuming in 2005 with steel frames. Today the Cheung Chau Jiao Festival is listed as national intangible cultural heritage — from a plague-time prayer to a national cultural event watched by hundreds of thousands. The "longevity" character on each bun still echoes that original vow of gratitude.' } },
  },
  'N-NA10': {
    characters: [{ name: { zh: '沙面洋行职员', en: 'Shamian Firm Clerk' }, role: { zh: '近代外贸记录者', en: 'Recorder of modern foreign trade' }, portrait: '' }],
    intro: {
      zh: '1859年。你是广州沙面岛上的一名洋行职员,脚下是刚填平的珠江冲积沙洲。英法两国在第二次鸦片战争后租借了这座小岛,1861年正式签订沙面租约。英国人忙着在岛西侧盖领事馆和汇丰银行,法国人在东侧修天主教堂。法兰西廊柱、英式红砖、铸铁路灯在泥地上拔地而起。你能闻到新锯木料的松脂味和珠江泥腥气混在一起——一座租界正在一块沙洲上被凭空造出来。',
      en: '1859. You are a clerk at a foreign firm on Shamian Island, Guangzhou, standing on a recently reclaimed Pearl River sandbar. Britain and France leased the island after the Second Opium War, signing the Shamian lease in 1861. The British build consulates and HSBC on the west side; the French erect a Catholic church on the east. French columns, English red brick and cast-iron lamps rise from the mud. You smell fresh-cut timber resin mixed with Pearl River silt — a concession is being built from scratch on a sandbar.',
    },
    scenes: [
      {
        speaker: 0,
        q: { zh: '沙面岛成为英法租界是在什么历史背景下?', en: 'Under what historical circumstances did Shamian Island become a British-French concession?' },
        options: [
          { text: { zh: '第二次鸦片战争后,英法两国于1859年租借沙面岛,1861年签订沙面租约', en: 'After the Second Opium War, Britain and France leased Shamian Island in 1859 and signed the lease in 1861' }, correct: true, feedback: { zh: '第二次鸦片战争后,英法两国于1859年租借沙面岛,1861年正式签订沙面租约。沙面从此成为英法租界,英国占西侧,法国占东侧。岛上陆续建起洋行、银行、领事馆等欧式建筑,成为广州近代史的缩影。', en: 'After the Second Opium War, Britain and France leased Shamian Island in 1859 and signed the formal lease in 1861. Shamian became a British-French concession: Britain on the west, France on the east. Foreign firms, banks and consulates in European styles were built, making it a microcosm of Guangzhou\'s modern history.' } },
          { text: { zh: '沙面岛是明代海上丝绸之路的贸易站', en: 'Shamian Island was a Ming Dynasty Maritime Silk Road trading post' }, correct: false, feedback: { zh: '沙面岛成为租界是第二次鸦片战争后的产物,与明代海上丝绸之路无关。1859年英法租借该岛,1861年签订租约,此后岛上才大规模兴建欧式建筑群。沙面是近代屈辱史与商贸史交织的产物,不是古代贸易遗产。', en: 'Shamian became a concession after the Second Opium War, unrelated to the Ming-era Maritime Silk Road. Britain and France leased it in 1859 and signed the lease in 1861; European-style buildings were erected afterward. Shamian is a product of intertwined modern humiliation and commerce, not an ancient trade legacy.' } },
        ],
      },
      {
        speaker: 0,
        q: { zh: '沙面岛上保留了多少栋欧式建筑?这批建筑群的历史价值是什么?', en: 'How many European-style buildings survive on Shamian, and what is their historical value?' },
        options: [
          { text: { zh: '保留150多栋欧式建筑,是广州近代史的缩影', en: 'Over 150 European-style buildings survive, a microcosm of Guangzhou\'s modern history' }, correct: true, feedback: { zh: '沙面岛上保留了150多栋欧式建筑,包括洋行、银行、领事馆等,建筑风格涵盖新古典主义、殖民地式等多种类型。这批建筑群是广州近代史的缩影,记录了从第二次鸦片战争到中国香港港英时期经贸格局变迁的完整轨迹。', en: 'Shamian preserves over 150 European-style buildings — foreign firms, banks, consulates — in neoclassical, colonial and other styles. This architectural group is a microcosm of Guangzhou\'s modern history, recording the full trajectory from the Second Opium War through the Hong Kong, China British-era economic shifts.' } },
          { text: { zh: '只有几栋现代写字楼,没有历史建筑', en: 'Only a few modern office buildings, no historic architecture' }, correct: false, feedback: { zh: '沙面岛上保留了150多栋欧式建筑,涵盖新古典主义、殖民地式等风格,是广州近代建筑规模最大的欧式建筑群。涉及港英时期的相关内容应使用"中国香港"规范表述。这批建筑是广州近代史的物质见证。', en: 'Shamian preserves over 150 European-style buildings in neoclassical, colonial and other styles — Guangzhou\'s largest European architectural group. References to the British era should use "Hong Kong, China." These buildings are physical witnesses to Guangzhou\'s modern history.' } },
        ],
      },
    ],
    reward: { badge: '🏛️', badgeName: { zh: '沙面洋行印', en: 'Seal of Shamian Trade Houses' }, insight: { zh: '1859年英法两国在第二次鸦片战争后租借沙面岛,1861年签订沙面租约,一座珠江冲积沙洲被改造成租界。此后数十年间,洋行、银行、领事馆在岛上拔地而起,150多栋欧式建筑涵盖新古典主义、殖民地式等风格,沙面建筑群成为广州近代史的缩影。涉及中国香港港英时期的内容,均以"中国香港"规范表述。从一块泥沙堆积的荒洲,到近代外贸的制度化空间,沙面让贸易从码头延伸到金融、法律和建筑层面——它记录了一个城市被迫开放后如何在屈辱与适应中重新找到自己的位置。', en: 'In 1859 Britain and France leased Shamian Island after the Second Opium War, signing the formal lease in 1861, transforming a Pearl River sandbar into a concession. Over the following decades, foreign firms, banks and consulates rose on the island — over 150 European-style buildings in neoclassical, colonial and other styles, making the Shamian architectural group a microcosm of Guangzhou\'s modern history. References to the Hong Kong British era use "Hong Kong, China." From a barren sandbar to an institutionalized foreign trade space, Shamian extended trade from docks into finance, law and architecture — recording how a city forced open found its place amid humiliation and adaptation.' } },
  },
};

Object.assign(EPISODES, {
  'N-SC02': makeNearbyRpgEpisode({
    characters: [
      { name: { zh: '数字生态观察员', en: 'Digital Ecosystem Observer' }, role: { zh: '南山科技生态讲述人', en: 'Nanshan Tech Ecosystem Guide' }, portrait: './public/assets/episodes/tencent/npc-cutout.jpg' },
    ],
    intro: {
      zh: '2017年，腾讯滨海大厦在深圳湾畔落成，双塔连廊如同一道直指海面的信号。你站在楼外，海风从深圳湾吹来。1998年，马化腾和同学在深圳华强北一间办公室里写出OICQ第一个版本时，南山还只是刚起步的科技园区。二十多年后，从这里生长出的社交、支付、游戏、云服务已经渗透进数亿人的日常——你不只是在看一座总部大楼，而是在看一套从深圳南山扩散到全球的数字生态系统如何长成。',
      en: 'In 2017, Tencent Binhai Building rose on the shore of Shenzhen Bay, its twin-tower skybridge like a signal pointing seaward. You stand outside as the bay wind arrives. In 1998, when Pony Ma and classmates wrote the first version of OICQ in a small office in Huaqiangbei, Nanshan was barely a tech district. Over two decades later, the social, payment, gaming, and cloud services grown from here have permeated the daily lives of hundreds of millions — you are not just looking at a headquarters, but at how a digital ecosystem grew from Nanshan to span the globe.',
    },
    background: './public/assets/episodes/tencent/stage-bg.jpg',
    sceneName: { zh: '腾讯滨海 · 数字海岸', en: 'Tencent Binhai · Digital Coast' },
    subtitle: { zh: '科学星火 · 腾讯滨海大厦', en: 'Scientific Spark · Tencent Binhai Building' },
    chapterTitle: { zh: '从寻呼到超级生态', en: 'From Pager to Super Ecosystem' },
    objective: {
      zh: '调查寻呼、社交、支付、云端四条线索，判断腾讯如何从深圳南山走向全球数字生活',
      en: 'Survey pager, social, payment, and cloud clues to judge how Tencent grew from Nanshan into global digital life.',
    },
    objectiveDone: {
      zh: '任务完成：你已理解腾讯滨海代表的不是单一产品，而是深圳数字生态的系统能力',
      en: 'Objective complete: Tencent Binhai represents not one product, but Shenzhen systemic digital capability.',
    },
    chapters: [
      { zh: '序章', en: 'Prologue' },
      { zh: '踏勘', en: 'Survey' },
      { zh: '生态', en: 'Ecosystem' },
      { zh: '判断', en: 'Judgment' },
      { zh: '完成', en: 'Complete' },
    ],
    clues: [
      {
        id: 'pager',
        x: 28,
        y: 42,
        title: { zh: '翻看寻呼记录', en: 'Read Pager Records' },
        label: { zh: '寻呼', en: 'Pager' },
        text: { zh: '1999年腾讯推出OICQ，从网络寻呼与即时通讯切入，解决"人如何在线找到彼此"的基础连接需求。此后QQ用户从零增长到2000年百万级，奠定社交帝国第一个入口。', en: 'In 1999 Tencent launched OICQ, entering through online paging and instant messaging to solve the most fundamental need: how people find each other online. QQ users grew from zero to millions by 2000, laying the first entry point for a social empire.' },
        npcFeedback: { zh: '记下。一个超级生态，往往从一个很小但高频的连接需求开始。', en: 'Record that. A super ecosystem often starts from a small but frequent need for connection.' },
      },
      {
        id: 'wechat',
        x: 54,
        y: 30,
        title: { zh: '追踪社交入口', en: 'Trace the Social Gateway' },
        label: { zh: '社交', en: 'Social' },
        text: { zh: '2011年1月微信上线，整合聊天、公众号、小程序、支付与城市服务入口。到2023年月活超13亿，使数字生活从独立应用沉淀为日常基础设施，重塑中国人社交与消费。', en: 'WeChat launched in January 2011, integrating chat, official accounts, mini programs, payments, and city services. By 2023 its monthly active users exceeded 1.3 billion, turning digital life from standalone apps into daily infrastructure and reshaping how Chinese people socialize and consume.' },
        npcFeedback: { zh: '对。它重要的地方，不只在用户量，也在入口密度。', en: 'Yes. Its importance lies not only in user scale, but in the density of entry points.' },
      },
      {
        id: 'payment',
        x: 70,
        y: 45,
        title: { zh: '核对支付场景', en: 'Check Payment Scenes' },
        label: { zh: '支付', en: 'Payment' },
        text: { zh: '2013年微信支付上线后，通过春节红包裂变传播，将社交关系链与线下消费打通。移动支付使数字生态从屏幕延伸到街巷商店，让无现金生活在数年间成为中国城市日常。', en: 'After WeChat Pay launched in 2013, Spring Festival red envelopes triggered viral spread, connecting social chains with offline consumption. Mobile payment extended the digital ecosystem from screens into streets and shops, making cash-free life a Chinese urban routine.' },
        npcFeedback: { zh: '很好。数字平台真正进入城市，是从高频日常开始的。', en: 'Good. Digital platforms truly enter the city through frequent daily actions.' },
      },
      {
        id: 'cloud',
        x: 44,
        y: 56,
        title: { zh: '查看云端机房图', en: 'Inspect the Cloud Diagram' },
        label: { zh: '云端', en: 'Cloud' },
        text: { zh: '2013年腾讯云正式商用，从游戏与视频基础设施起步，逐步覆盖政务、金融、医疗等领域。云服务与游戏引擎使腾讯从消费互联网延伸到产业数字化，构建支撑多行业底层能力。', en: 'Tencent Cloud entered commercial service in 2013, starting with gaming and video infrastructure before expanding into government, finance, and healthcare. Cloud services and game engines extended Tencent from consumer internet to industrial digitization, building capability supporting multiple industries.' },
        npcFeedback: { zh: '准确。平台的下一层，是支撑更多行业运行的基础能力。', en: 'Correct. The next layer of a platform is the capability that supports many industries.' },
      },
    ],
    start: { zh: '别只看大楼。我们要看的是这座大楼背后，一套数字生态如何从南山扩散到全球日常。', en: 'Do not only look at the tower. Read how a digital ecosystem spread from Nanshan into global everyday life.' },
    playerNote: { zh: '我会记录寻呼、社交、支付和云端四条线索，再判断腾讯滨海为何是深圳科技叙事的重要锚点。', en: 'I will record pager, social, payment, and cloud clues, then judge why Tencent Binhai matters to Shenzhen tech story.' },
    survey: { zh: '先踏勘四处：寻呼记录、社交入口、支付场景、云端机房图。线索齐了，再判断平台力量。', en: 'Survey four points: pager records, social gateway, payment scenes, and cloud diagrams. Then judge platform power.' },
    synthesisChoice: {
      question: {
        zh: '寻呼→社交→支付→云端，这四条线索之间最关键的递进关系是什么？',
        en: 'Pager → social → payment → cloud: what is the most critical progression among these four clues?',
      },
      options: [
        {
          text: { zh: '每一步都在解决上一步无法完成的连接问题：从找到人，到聚集人，到让人交易，到支撑行业运转', en: 'Each step solved a connection problem the previous one could not: finding people, gathering them, enabling transactions, then powering industries' },
          correct: true,
          feedback: { zh: '准确。1999年OICQ解决的是"人如何在线找到彼此"，微信把社交入口扩展为日常基础设施，微信支付让数字生态进入街巷商店，腾讯云让平台能力延伸到产业。这不是四个独立产品，而是一条从连接需求逐层向上长出的基础设施链条。', en: 'Correct. In 1999 OICQ solved "how people find each other online"; WeChat expanded social entry into daily infrastructure; WeChat Pay pushed the ecosystem into streets and shops; Tencent Cloud extended platform capability to industries. These are not four independent products, but a chain of infrastructure growing upward from connection needs.' },
        },
        {
          text: { zh: '四条线索没有内在关联，只是腾讯在不同年代推出的不同产品线', en: 'The four clues have no inherent connection — just different product lines Tencent launched in different eras' },
          correct: false,
          feedback: { zh: '不对。寻呼时代的连接经验直接影响了社交产品的设计逻辑，社交关系链又为支付裂变提供了传播通道，而支付和社交积累的技术需求催生了云服务。它们之间存在清晰的因果递进。', en: 'Incorrect. The pager-era connection experience directly shaped social product design; social relationship chains provided the transmission channel for payment virality; and the technical demands of payment and social gave rise to cloud services. There is a clear causal progression.' },
        },
        {
          text: { zh: '真正重要的只有微信，其他三条线索都是附属品', en: 'Only WeChat truly matters; the other three clues are accessories' },
          correct: false,
          feedback: { zh: '太片面了。没有OICQ时代的即时通讯积累，微信不会在2011年找到正确方向；没有微信支付，微信只是一个聊天工具；没有腾讯云，平台能力就停在消费端。四条线索缺一不可。', en: 'Too one-sided. Without the IM experience from the OICQ era, WeChat would not have found the right direction in 2011; without WeChat Pay, WeChat would be just a chat app; without Tencent Cloud, platform capability stops at the consumer side. All four are indispensable.' },
        },
      ],
    },
    judge: {
      question: { zh: '腾讯滨海最能说明深圳科技的哪种能力？', en: 'What Shenzhen tech capability does Tencent Binhai best reveal?' },
      options: [
        { text: { zh: '把高频需求、产品迭代和城市服务连接成数字生态', en: 'Connecting frequent needs, product iteration, and city services into a digital ecosystem' }, correct: true, feedback: { zh: '判断准确。腾讯的意义不止是单个应用，而是把连接能力做成基础设施。', en: 'Correct. Tencent matters not as one app, but as connection turned into infrastructure.' } },
        { text: { zh: '只是一栋造型特别的办公楼', en: 'Only a distinctive office tower' }, correct: false, feedback: { zh: '太表面了。建筑只是入口，真正需要读懂的是数字生态。', en: 'Too superficial. The building is only the entry point; the ecosystem is the story.' } },
        { text: { zh: '它与城市日常没有关系', en: 'It has nothing to do with urban everyday life' }, correct: false, feedback: { zh: '恰恰相反。腾讯影响最深的地方，正是城市日常。', en: 'The opposite. Tencent deepest impact is on everyday urban life.' } },
      ],
    },
    reflection: { zh: '深圳科技的强处，常常不是单点发明，而是把产品、供应链、用户和服务接成可生长的系统。', en: 'Shenzhen tech strength is often not a single invention, but a growing system linking products, supply chains, users, and services.' },
    impactChoice: {
      question: {
        zh: '为什么深圳南山能诞生这样的数字生态，而不是其他城市？',
        en: 'Why could Nanshan, Shenzhen, give birth to such a digital ecosystem rather than another city?',
      },
      options: [
        {
          text: { zh: '深圳的移民文化、硬件供应链和改革开放窗口地位，让人才、技术和市场机会在这里高速交汇', en: 'Shenzhen\'s immigrant culture, hardware supply chain, and reform-era gateway status let talent, technology, and market opportunity converge here at high speed' },
          correct: true,
          feedback: { zh: '对。1998年马化腾从深圳大学毕业后在润讯做寻呼工程师，华强北的电子市场提供了早期硬件环境，改革开放的政策窗口让民营科技公司可以注册成长。南山不是偶然成为起点——它同时拥有人才来源、技术土壤和市场通道。', en: 'Correct. In 1998 Pony Ma graduated from Shenzhen University and worked as a pager engineer at Runxun; Huaqiangbei\'s electronics markets provided the early hardware environment; reform-era policies allowed private tech companies to register and grow. Nanshan was not an accidental starting point — it had talent sources, technical soil, and market channels all at once.' },
        },
        {
          text: { zh: '只是因为深圳的写字楼租金比北京上海便宜', en: 'Only because office rents in Shenzhen were cheaper than Beijing or Shanghai' },
          correct: false,
          feedback: { zh: '太肤浅了。租金从来不是决定科技生态诞生地的关键因素。深圳真正的优势在于移民城市没有根深蒂固的行业壁垒、华强北的硬件迭代速度，以及紧邻香港的信息和资本通道。', en: 'Too shallow. Rent has never been the decisive factor. Shenzhen\'s real advantages were an immigrant city without entrenched industry barriers, Huaqiangbei\'s hardware iteration speed, and proximity to Hong Kong\'s information and capital channels.' },
        },
        {
          text: { zh: '深圳没有任何特殊原因，纯粹是运气', en: 'Shenzhen had no special reason — it was pure luck' },
          correct: false,
          feedback: { zh: '不对。腾讯的诞生和壮大有清晰的结构性条件：改革开放的政策窗口、深圳大学的计算机教育、华强北的硬件生态、紧邻香港的融资渠道。把结果归因于运气，会忽略这些可以被分析和学习的条件。', en: 'Incorrect. Tencent\'s birth and growth had clear structural conditions: reform-era policy windows, CS education at Shenzhen University, Huaqiangbei\'s hardware ecosystem, and proximity to Hong Kong\'s financing channels. Attributing it to luck ignores conditions that can be analyzed and learned from.' },
        },
      ],
    },
    finalChoice: {
      question: { zh: '如果向游客概括腾讯滨海这一站，最准确的是？', en: 'What is the best summary of Tencent Binhai for visitors?' },
      options: [
        { text: { zh: '它是理解深圳数字生态如何改变日常生活的入口', en: 'It is an entry to understanding how Shenzhen digital ecosystems changed daily life' }, correct: true, feedback: { zh: '记入案卷。这里的关键词不是总部，而是数字生态。', en: 'Enter that into the record. The key word here is not headquarters, but digital ecosystem.' } },
        { text: { zh: '这里只能说明互联网公司需要海景办公室', en: 'It only shows internet companies need seafront offices' }, correct: false, feedback: { zh: '太轻了。海岸线只是背景，数字连接才是主题。', en: 'Too light. The coast is the backdrop; digital connection is the theme.' } },
      ],
    },
    closing: { zh: '很好。把腾讯滨海封入案卷：一座海边大楼，记录了中国数字生活从通讯工具走向超级生态的路径。', en: 'Good. Seal Tencent Binhai into the case file: a seafront tower records China digital life moving from communication tool to super ecosystem.' },
    completion: { title: { zh: '本幕完成', en: 'Scene Complete' }, insight: { zh: '你已理解：腾讯滨海大厦代表深圳科技从产品创新走向平台生态、城市服务与全球数字生活的扩展。', en: 'You now understand Tencent Binhai as Shenzhen tech expanding from product innovation to platform ecosystems, city services, and global digital life.' } },
    reward: { badge: '🛰️', badgeName: { zh: '数字海岸印', en: 'Seal of the Digital Coast' }, insight: { zh: '腾讯滨海让深圳南山成为全球数字生活的重要节点。', en: 'Tencent Binhai makes Nanshan a key node of global digital life.' } },
  }),

  'N-AW04': makeNearbyRpgEpisode({
    characters: [
      { name: { zh: '围村宴席记录人', en: 'Walled Village Banquet Keeper' }, role: { zh: '元朗盆菜文化讲述人', en: 'Yuen Long Poon Choi Guide' }, portrait: './public/assets/episodes/yuenlong/npc-cutout.jpg' },
    ],
    intro: { zh: '1279年，南宋末帝赵昺南逃，途经中国香港新界元朗。你走进围村祠堂前的空地，木盆、蒸汽、族谱与节庆锣鼓交织。盆菜不是一道菜——萝卜垫底，肉菜层叠，口味与礼序同在一盆。七百多年来，围村客家族群在宗族节庆时制作盆菜，把迁徙记忆和团圆仪式叠进同一只木盆。', en: '1279. The last Song emperor flees south through Yuen Long in Hong Kong China\'s New Territories. You enter a walled village forecourt where wooden basins, steam, genealogy books, and festival drums overlap. Poon choi is not one dish — radish at the bottom, meat layered above, taste and ritual order in one basin. For over seven hundred years, Hakka walled village communities have made poon choi at clan festivals, layering migration memory and reunion ritual into the same wooden basin.' },
    background: './public/assets/episodes/yuenlong/stage-bg.jpg',
    sceneName: { zh: '元朗围村 · 盆菜宴席', en: 'Yuen Long Walled Village · Poon Choi Banquet' },
    subtitle: { zh: '文化觉醒 · 盆菜文化发源地', en: 'Cultural Awakening · Poon Choi Origin' },
    chapterTitle: { zh: '一盆里的共同体', en: 'Community in One Basin' },
    objective: { zh: '调查木盆、层叠菜、族谱、节庆，判断盆菜为何成为大湾区团聚记忆', en: 'Survey basin, layers, genealogy, and festival to judge why poon choi became a Bay Area reunion memory.' },
    objectiveDone: { zh: '任务完成：你已理解盆菜承载的不只是食物，还有迁徙、礼俗与共同体秩序', en: 'Objective complete: poon choi carries food, migration, ritual, and community order.' },
    clues: [
      { id: 'basin', x: 30, y: 47, title: { zh: '查看木盆', en: 'Inspect the Basin' }, label: { zh: '木盆', en: 'Basin' }, text: { zh: '相传1279年南宋末帝赵昺流亡新界，围村村民以木盆盛菜招待随从。木盆让食材共享同一空间，也让全村围坐同一秩序，容器即共同体形状的物质表达。', en: 'Tradition holds that in 1279 the last Song emperor Zhao Bing fled to the New Territories and walled village residents served his retinue food in wooden basins. The basin lets ingredients share one space and the village sit in one order — the vessel is a physical expression of community.' }, npcFeedback: { zh: '对。容器本身就是共同体的形状。', en: 'Yes. The vessel itself is the shape of community.' } },
      { id: 'layers', x: 54, y: 34, title: { zh: '辨认层叠食材', en: 'Read the Layers' }, label: { zh: '层叠', en: 'Layers' }, text: { zh: '传统盆菜讲究"贱料贵做"：萝卜、猪皮、枝竹垫底吸汁，中层炆猪肉、虾，上层铺鸡与鲮鱼球。层叠既为口味交融，也为长幼尊卑礼序——越上层越尊贵，由长辈先动筷。', en: 'Traditional poon choi follows a principle of humble ingredients, refined craft: radish, pork skin, and bean curd skin at the bottom to absorb juices, braised pork and shrimp in the middle, chicken and fish balls on top. The layering serves both flavor fusion and ritual hierarchy — upper layers are more prestigious, and elders take the first bite.' }, npcFeedback: { zh: '没错。层次不是装饰，而是礼俗语言。', en: 'Exactly. The layers are not decoration, but ritual language.' } },
      { id: 'genealogy', x: 72, y: 48, title: { zh: '翻看族谱', en: 'Read the Genealogy' }, label: { zh: '族谱', en: 'Genealogy' }, text: { zh: '新界围村多属客家与本地宗族，族谱记载迁徙路线、开基年代与丁口田产。祠堂祭祖与盆菜宴席互为表里，通过仪式与共食维系迁徙后身份认同，让散居族人确认彼此同根同源。', en: 'New Territories walled villages belong largely to Hakka and Punti lineages, whose genealogies record migration routes, founding dates, and household land holdings. Ancestral hall rites and poon choi banquets are inseparable, maintaining post-migration identity through ritual and shared meals, confirming common roots among scattered clan members.' }, npcFeedback: { zh: '记下。食物在这里也承担记忆和身份。', en: 'Record this. Food here also carries memory and identity.' } },
      { id: 'festival', x: 44, y: 58, title: { zh: '聆听节庆锣鼓', en: 'Hear the Festival Drums' }, label: { zh: '节庆', en: 'Festival' }, text: { zh: '每年春社、太平清醮与宗族春秋二祭，围村以盆菜宴为高潮，锣鼓开路、舞狮助兴。散居中国香港乃至海外族人循例回村赴宴，一盆菜把流动的族群重新召回同一张桌边。', en: 'Each year at spring she, Tai Ping Ching Chiu, and clan bi-annual ancestral rites, the walled village poon choi banquet is the climax, with drums and lion dance. Clan members scattered across Hong Kong China and overseas return by custom — one basin calls a mobile people back to one table.' }, npcFeedback: { zh: '很好。团圆不是口号，它需要可以被共享的仪式。', en: 'Good. Reunion needs a shared ritual, not just a slogan.' } },
    ],
    start: { zh: '不要只问盆菜好不好吃。要问：为什么一盆菜能让一座围村重新聚拢？', en: 'Do not only ask if poon choi tastes good. Ask why one basin gathers a village again.' },
    playerNote: { zh: '我会记录木盆、层叠菜、族谱和节庆四条线索，判断盆菜如何保存共同体记忆。', en: 'I will record basin, layers, genealogy, and festival clues to judge how poon choi preserves community memory.' },
    survey: { zh: '先踏勘四处：木盆、层叠食材、族谱、节庆锣鼓。线索齐了，再判断盆菜的文化意义。', en: 'Survey basin, layers, genealogy, and festival drums, then judge the cultural meaning.' },
    judge: { question: { zh: '盆菜为什么能成为大湾区团圆记忆？', en: 'Why can poon choi become a Bay Area reunion memory?' }, options: [
      { text: { zh: '它把食物、礼俗、宗族和迁徙记忆压缩进同一场宴席', en: 'It compresses food, ritual, lineage, and migration memory into one banquet' }, correct: true, feedback: { zh: '判断准确。盆菜的核心是共同体，而不只是味道。', en: 'Correct. Poon choi is about community, not only flavor.' } },
      { text: { zh: '因为食材越贵越能代表文化', en: 'Because expensive ingredients represent culture' }, correct: false, feedback: { zh: '不对。文化价值不在价格，而在共享秩序和记忆。', en: 'No. Cultural value lies in shared order and memory, not price.' } },
      { text: { zh: '它与围村历史没有关系', en: 'It has no relation to walled village history' }, correct: false, feedback: { zh: '恰恰相反。围村历史正是盆菜叙事的根。', en: 'The opposite. Walled village history is the root of the story.' } },
    ] },
    reflection: { zh: '一盆菜能跨过几百年，是因为它每一次被端上桌，都在重新确认谁与谁同坐。', en: 'A basin lasts centuries because every serving confirms who sits together.' },
    synthesisChoice: {
      question: {
        zh: '木盆、层叠菜、族谱和节庆四条线索如何共同解释盆菜的意义？',
        en: 'How do the basin, layered ingredients, genealogy, and festival clues together explain the meaning of poon choi?',
      },
      options: [
        {
          text: { zh: '它们分别从容器、礼序、身份和仪式四个层面，共同把盆菜定义为围村共同体的可食用记忆', en: 'They define poon choi as edible memory of the walled-village community across four dimensions: vessel, ritual order, identity, and ceremony' },
          correct: true,
          feedback: { zh: '正确。木盆是共同体的形状，层叠是礼序语言，族谱确认同根同源，节庆把散居族人召回同桌——四条线索缺一不可，共同构成盆菜作为团圆仪式的完整意义。盆菜从来不只是食物，而是一套把迁徙、宗族和身份压缩进同一口锅的文化装置。', en: 'Correct. The basin is the shape of community, layers are ritual language, genealogy confirms shared roots, and festivals call scattered clan members back to one table — all four are indispensable, together forming the complete meaning of poon choi as a reunion ritual. Poon choi is never just food, but a cultural device compressing migration, lineage, and identity into one pot.' },
        },
        {
          text: { zh: '只要记住盆菜的食材和做法就够了', en: 'Just remember the ingredients and cooking method' },
          correct: false,
          feedback: { zh: '不够。食材和做法只是表层，盆菜的核心意义在于木盆、层叠礼序、族谱认同和节庆召唤共同构成的共同体记忆，离开这四重语境，盆菜就只是一种大锅菜，失去了它作为围村文化符号的深层价值。', en: 'Insufficient. Ingredients and method are only surface. The core meaning lies in the community memory jointly formed by basin, layered ritual, genealogical identity, and festival recall. Without these four contexts, poon choi is just a large pot dish, losing its deep value as a walled-village cultural symbol.' },
        },
        {
          text: { zh: '四条线索之间没有关系，各看各的就行', en: 'The four clues have no relationship; just look at each separately' },
          correct: false,
          feedback: { zh: '恰恰相反。木盆提供共享容器，层叠规定礼序，族谱维系身份，节庆激活团圆——四条线索层层嵌套、互为表里。如果割裂来看，就无法理解为什么一盆菜能让一座围村重新聚拢，也错过了盆菜最核心的文化逻辑。', en: 'The opposite. The basin provides a shared vessel, layers define ritual order, genealogy maintains identity, and festivals activate reunion — the four are nested and inseparable. Viewing them in isolation misses why one basin can gather a village, and misses the core cultural logic of poon choi.' },
        },
      ],
    },
    impactChoice: {
      question: {
        zh: '盆菜文化对大湾区文化认同有什么深层意义？',
        en: 'What is the deeper significance of poon choi culture for Bay Area cultural identity?',
      },
      options: [
        {
          text: { zh: '盆菜以共食仪式跨越迁徙与地域，为大湾区提供了一种以团圆和共享为核心的文化纽带', en: 'Poon choi, through shared dining ritual, transcends migration and geography, providing the Bay Area with a cultural bond centered on reunion and sharing' },
          correct: true,
          feedback: { zh: '正确。大湾区由不同城市和族群组成，盆菜文化源自围村迁徙传统，把食物、礼序和宗族记忆融为一炉，证明湾区共享的不只是经济网络，还有一套关于团圆、礼序和身份认同的文化记忆。盆菜让湾区人在同一口锅里找到同根感。', en: 'Correct. The Bay Area comprises different cities and communities. Poon choi, rooted in walled-village migration tradition, fuses food, ritual, and lineage memory, proving the Bay Area shares not only economic networks but also cultural memory of reunion, ritual order, and identity. Poon choi lets Bay Area people find common roots in one pot.' },
        },
        {
          text: { zh: '盆菜只是一种地方小吃，与大湾区文化认同无关', en: 'Poon choi is only a local snack, irrelevant to Bay Area cultural identity' },
          correct: false,
          feedback: { zh: '不对。盆菜不是普通小吃，它承载了七百多年的迁徙记忆和宗族礼序，其共食仪式天然具有跨地域凝聚力。大湾区文化认同需要具体的文化载体，盆菜正是这样一种把不同群体召回到同一张桌边的可共享传统。', en: 'Incorrect. Poon choi is not an ordinary snack. It carries over 700 years of migration memory and lineage ritual, and its shared dining naturally has cross-regional cohesive power. Bay Area cultural identity needs concrete cultural carriers, and poon choi is exactly such a shared tradition that calls different groups to one table.' },
        },
        {
          text: { zh: '大湾区文化认同只需要经济合作就够了，不需要文化传统', en: 'Bay Area cultural identity only needs economic cooperation, not cultural tradition' },
          correct: false,
          feedback: { zh: '错误。经济合作是湾区的基础，但文化认同需要可感知的传统载体。盆菜以一盆菜把迁徙者的礼俗、家族和团圆叠在一起，说明湾区认同不只是一张经济协议，更是一套关于"谁与谁同坐"的文化记忆。没有文化纽带的湾区认同是脆弱的。', en: 'Wrong. Economic cooperation is foundational, but cultural identity needs perceptible traditional carriers. Poon choi layers migrant ritual, family, and reunion in one basin, showing that Bay Area identity is not just an economic agreement but a cultural memory of "who sits together." A Bay Area identity without cultural bonds is fragile.' },
        },
      ],
    },
    finalChoice: { question: { zh: '向游客总结元朗盆菜，最准确的是？', en: 'Best visitor summary for Yuen Long poon choi?' }, options: [
      { text: { zh: '它是一场把食物变成共同体记忆的围村仪式', en: 'It is a walled village ritual turning food into community memory' }, correct: true, feedback: { zh: '记入案卷。盆菜是一口锅里的湾区家族史。', en: 'Enter that into the record. Poon choi is Bay Area family history in one pot.' } },
      { text: { zh: '它只是一种分量很大的菜', en: 'It is only a large dish' }, correct: false, feedback: { zh: '太浅了。分量只是表层，共同体才是核心。', en: 'Too shallow. Size is surface; community is the core.' } },
    ] },
    closing: { zh: '很好。把元朗盆菜封入案卷：一盆层叠食材，盛住了迁徙者的礼俗、家族和团圆。', en: 'Good. Seal Yuen Long poon choi into the case file: layered ingredients hold migrant ritual, family, and reunion.' },
    completion: { title: { zh: '本幕完成', en: 'Scene Complete' }, insight: { zh: '你已理解：盆菜是大湾区围村文化中关于团聚、礼序和身份认同的可食用记忆。', en: 'You now understand poon choi as edible memory of reunion, ritual order, and identity in Bay Area walled villages.' } },
    reward: { badge: '🥘', badgeName: { zh: '围村团圆印', en: 'Seal of Walled Village Reunion' }, insight: { zh: '盆菜相传起源于1279年南宋末年帝昺流亡新界，围村村民以木盆盛菜招待随从。此后中国香港新界围村的客家族群在宗族节庆时制作盆菜，萝卜垫底、肉菜层叠，口味与礼序同在一盆。元朗是围村盆菜的代表地区，一盆菜把迁徙、宗族认同与团圆仪式叠在一起，延续了七百多年。', en: 'Poon choi is said to originate in 1279 when the last Song emperor fled to the New Territories and walled village residents served food in wooden basins to his retinue. Since then, Hakka communities in Hong Kong China\'s New Territories have made poon choi at clan festivals — radish at the bottom, meat layered above, taste and ritual order in one basin. Yuen Long is the representative area. One basin layers migration, lineage identity, and reunion ritual, enduring for over seven hundred years.' } },
  }),

  'N-EG02': makeNearbyRpgEpisode({
    characters: [
      { name: { zh: '制度档案员', en: 'Market Archive Keeper' }, role: { zh: '资本市场改革讲述人', en: 'Capital Market Reform Guide' }, portrait: './public/assets/episodes/szse/npc-cutout.jpg' },
    ],
    intro: { zh: '你走到深圳证券交易所外，玻璃幕墙映着深南大道。这里不是普通办公楼，而是中国资本市场从试点走向制度化的关键现场。', en: 'You reach Shenzhen Stock Exchange as glass reflects Shennan Avenue. This is not an ordinary office block, but a key site where China capital market moved from trial to institution.' },
    background: './public/assets/episodes/szse/stage-bg.jpg',
    sceneName: { zh: '深圳证券交易所 · 制度大厅', en: 'SZSE · Institution Hall' },
    subtitle: { zh: '改革开放 · 深圳证券交易所', en: 'Reform and Opening · Shenzhen Stock Exchange' },
    chapterTitle: { zh: '资本市场试验田', en: 'Capital Market Test Field' },
    objective: { zh: '调查档案、交易屏、上市规则、创业板，判断深交所为何是中国资本市场重要试验地', en: 'Survey archives, trading screens, listing rules, and ChiNext to judge why SZSE is a key capital-market test field.' },
    objectiveDone: { zh: '任务完成：你已理解深交所连接了改革试验、企业融资与制度建设', en: 'Objective complete: SZSE connects reform trials, enterprise financing, and institution building.' },
    clues: [
      { id: 'archive', x: 30, y: 42, title: { zh: '查找首批档案', en: 'Find Early Files' }, label: { zh: '档案', en: 'Files' }, text: { zh: '1990年12月1日深交所试营业，首日挂牌5只股票。早期证券市场面临的核心问题，是在没有成熟法律框架的条件下，如何建立公开、透明、可监管的交易秩序。', en: 'On December 1, 1990, SZSE began trial operations with five listed stocks on its first day. The early market faced a core challenge: how to build open, transparent, and governable trading order without a mature legal framework in place.' }, npcFeedback: { zh: '对。资本市场首先是制度实验。', en: 'Yes. Capital markets are first institutional experiments.' } },
      { id: 'screen', x: 60, y: 31, title: { zh: '观察交易屏', en: 'Watch the Trading Screen' }, label: { zh: '交易', en: 'Trading' }, text: { zh: '交易屏上跳动的数字背后，是企业融资需求、投资者预期博弈与监管规则约束三重力量共同运行。1990年代初手工竞价已被电子化撮合取代，市场透明度由此跃升。', en: 'Behind the moving numbers on the trading screen run three forces: enterprise financing needs, investor expectations, and regulatory constraints. In the early 1990s manual open outcry gave way to electronic matching, sharply improving market transparency.' }, npcFeedback: { zh: '很好。数字不是孤立的，它背后是社会信任。', en: 'Good. Numbers are not isolated; trust sits behind them.' } },
      { id: 'listing', x: 74, y: 48, title: { zh: '核对上市规则', en: 'Check Listing Rules' }, label: { zh: '规则', en: 'Rules' }, text: { zh: '上市审核、信息披露、退市制度与持续监管构成资本市场的制度四柱。1998年《证券法》颁布后，深交所逐步建立起与国际接轨的规则体系，将热闹买卖转化为现代金融制度。', en: 'Listing review, information disclosure, delisting, and continuous supervision form the four institutional pillars of a capital market. After the 1998 Securities Law, SZSE gradually built a rule system aligned with international standards, turning speculative trading into a modern financial institution.' }, npcFeedback: { zh: '准确。真正重要的是市场如何被规则约束。', en: 'Correct. The key is how the market is disciplined by rules.' } },
      { id: 'chinext', x: 45, y: 58, title: { zh: '翻看创业板名单', en: 'Read ChiNext List' }, label: { zh: '创新', en: 'Innovation' }, text: { zh: '2009年10月创业板开板，首批28家企业挂牌。创业板为成长型科技企业提供直接融资通道，使科技创新与资本市场的联动在深圳形成闭环。', en: 'On October 23, 2009, ChiNext launched with 28 first-batch companies. It gave growth-stage tech firms a direct financing channel, closing the loop between tech innovation and capital markets in Shenzhen.' }, npcFeedback: { zh: '记下。资本市场和科技创新在深圳互相推动。', en: 'Record that. Capital markets and tech innovation push each other in Shenzhen.' } },
    ],
    start: { zh: '别把交易所只看成股票买卖的地方。我们要读懂它如何把改革试验变成制度秩序。', en: 'Do not see the exchange only as stock trading. Read how it turned reform trials into institutional order.' },
    playerNote: { zh: '我会记录档案、交易屏、上市规则和创业板四条线索，判断深交所为何重要。', en: 'I will record archives, trading screens, listing rules, and ChiNext to judge why SZSE matters.' },
    survey: { zh: '先踏勘四处：首批档案、交易屏、上市规则、创业板名单。线索齐了，再判断资本市场改革。', en: 'Survey early files, trading screens, listing rules, and ChiNext, then judge capital-market reform.' },
    judge: { question: { zh: '深交所的改革意义主要在哪里？', en: 'Where does SZSE reform meaning mainly lie?' }, options: [
      { text: { zh: '它把企业融资、市场交易和监管规则放入可运行的制度框架', en: 'It placed financing, trading, and regulation into a working institutional framework' }, correct: true, feedback: { zh: '判断准确。深交所是一座制度试验场。', en: 'Correct. SZSE is an institutional testbed.' } },
      { text: { zh: '它只是让股票价格变得更热闹', en: 'It only made stock prices more lively' }, correct: false, feedback: { zh: '太表面了。价格背后是融资、披露、监管和信任。', en: 'Too superficial. Behind prices are financing, disclosure, regulation, and trust.' } },
      { text: { zh: '它与深圳创新没有关系', en: 'It has no relation to Shenzhen innovation' }, correct: false, feedback: { zh: '不对。资本市场为创新企业提供了重要通道。', en: 'No. Capital markets provided important channels for innovative firms.' } },
    ] },
    reflection: { zh: '改革开放不只发生在工地和厂房，也发生在交易规则、披露制度和风险边界里。', en: 'Reform happened not only on worksites and factories, but in trading rules, disclosure systems, and risk boundaries.' },
    synthesisChoice: {
      question: {
        zh: '档案、交易屏、上市规则和创业板四条线索之间呈现怎样的递进关系？',
        en: 'What progressive relationship do the archive, trading screen, listing rules, and ChiNext clues reveal?',
      },
      options: [
        {
          text: { zh: '它们呈现从试点萌芽、技术升级、规则制度化到创新深化的递进链条，共同勾勒深交所的制度演进路径', en: 'They reveal a progressive chain from pilot trial, technology upgrade, rule institutionalization, to innovation deepening, outlining SZSE institutional evolution' },
          correct: true,
          feedback: { zh: '正确。1990年试营业档案记录了资本市场试点起点，交易屏电子化标志着技术升级，1998年证券法后的上市规则把市场纳入制度框架，2009年创业板则把创新企业与资本对接推向新阶段——四条线索构成一条从试验到制度的完整因果链，缺了任何一环都无法理解深交所的改革价值。', en: 'Correct. The 1990 trial archives record the pilot starting point, the electronic trading screen marks technology upgrade, post-1998 listing rules bring the market into an institutional framework, and the 2009 ChiNext pushes innovation-capital integration to a new stage — four clues form a complete causal chain from experiment to institution. Missing any link makes SZSE reform value incomprehensible.' },
        },
        {
          text: { zh: '四条线索是平行的，没有先后或因果关系', en: 'The four clues are parallel, with no sequence or causal relationship' },
          correct: false,
          feedback: { zh: '不对。这四条线索有明确的时间递进和逻辑因果：没有试营业就没有交易屏的运行基础，没有交易实践就不会催生上市规则，没有制度框架就无法支撑创业板的创新。它们是同一改革进程的不同阶段，而非互不相干的片段。', en: 'Incorrect. These four clues have clear chronological progression and logical causation: without trial operations there would be no basis for trading screens, without trading practice there would be no impetus for listing rules, and without an institutional framework ChiNext innovation could not be supported. They are stages of one reform process, not unrelated fragments.' },
        },
        {
          text: { zh: '只要看创业板就够了，前面的线索都不重要', en: 'Only ChiNext matters; the earlier clues are unimportant' },
          correct: false,
          feedback: { zh: '太片面了。创业板是深交所制度演进的成果而非起点。没有早期试点的制度实验、交易屏的技术积累和上市规则的制度框架，创业板就无法落地。只看创业板会忽略深交所从试验到制度化再到创新的完整改革逻辑，也就无法理解它为何是中国资本市场的重要试验地。', en: 'Too one-sided. ChiNext is the outcome of SZSE institutional evolution, not the starting point. Without early pilot experiments, trading screen technology accumulation, and the listing rules framework, ChiNext could not have launched. Looking only at ChiNext ignores the complete reform logic from trial to institutionalization to innovation, and misses why SZSE is a key capital-market testbed.' },
        },
      ],
    },
    impactChoice: {
      question: {
        zh: '深交所对深圳科技创新生态有什么核心意义？',
        en: 'What is the core significance of SZSE for Shenzhen tech innovation ecosystem?',
      },
      options: [
        {
          text: { zh: '深交所为科技企业提供直接融资通道和制度激励，使创新与资本在深圳形成闭环', en: 'SZSE provides tech firms with direct financing channels and institutional incentives, forming a closed loop between innovation and capital in Shenzhen' },
          correct: true,
          feedback: { zh: '正确。深交所不只是股票买卖场所，它通过创业板等板块为成长型科技企业提供直接融资，让创新成果能快速获得资本支持，同时用上市规则和信息披露制度约束企业治理。资本供给与制度激励在深圳互相强化，使创新不再只靠政府补贴，而是有了市场化的可持续动力机制。', en: 'Correct. SZSE is not just a stock trading venue. Through boards like ChiNext, it provides growth-stage tech firms with direct financing, enabling innovation to quickly gain capital support, while listing rules and disclosure requirements discipline corporate governance. Capital supply and institutional incentives reinforce each other in Shenzhen, giving innovation market-based sustainable momentum rather than relying solely on government subsidies.' },
        },
        {
          text: { zh: '深交所只是一个买卖股票的地方，跟科技创新没有关系', en: 'SZSE is just a place to trade stocks, unrelated to tech innovation' },
          correct: false,
          feedback: { zh: '不对。深交所与深圳科技创新深度联动：创业板专门为科技型成长企业开设，提供了从研发到产业化的关键融资通道。深圳大量科技企业通过深交所上市获得发展资本，深交所的制度规则也反过来推动企业完善治理。二者是共生关系，不是平行无关。', en: 'Incorrect. SZSE and Shenzhen tech innovation are deeply linked: ChiNext was specifically created for growth-stage tech firms, providing a critical financing channel from R&D to industrialization. Many Shenzhen tech companies gained development capital through SZSE listings, and SZSE rules in turn push firms to improve governance. The two are symbiotic, not parallel and unrelated.' },
        },
        {
          text: { zh: '深圳科技创新主要靠政府拨款，不需要资本市场', en: 'Shenzhen tech innovation mainly relies on government funding and does not need capital markets' },
          correct: false,
          feedback: { zh: '错误。政府拨款是创新支持的一部分，但无法替代资本市场的力量。深交所通过上市融资、股权激励和市场化定价机制，让科技企业获得远超财政补贴能够覆盖的发展资金。没有深交所，深圳的创新生态就缺少了把研发成果转化为市场价值的关键一环，创新与产业的闭环就断了。', en: 'Wrong. Government funding is part of innovation support but cannot replace capital market power. Through listing financing, equity incentives, and market-based pricing, SZSE gives tech firms far more development capital than fiscal subsidies can cover. Without SZSE, Shenzhen innovation ecosystem would lack the critical link that turns R&D into market value, and the innovation-industry loop would be broken.' },
        },
      ],
    },
    finalChoice: { question: { zh: '最适合写进游客手册的一句话是？', en: 'Best visitor guide summary?' }, options: [
      { text: { zh: '深交所是中国资本市场制度化的重要试验现场', en: 'SZSE is a key experimental site in institutionalizing China capital market' }, correct: true, feedback: { zh: '记入案卷。它让资本市场从试点走向制度。', en: 'Enter that into the record. It moved capital markets from trial to institution.' } },
      { text: { zh: '这里只适合关心股票的人参观', en: 'Only people interested in stocks should visit' }, correct: false, feedback: { zh: '太窄了。这里关乎深圳如何理解改革、融资和创新。', en: 'Too narrow. This place concerns reform, finance, and innovation.' } },
    ] },
    closing: { zh: '很好。把深交所封入案卷：这里让资本、规则与创新在深圳同场实验。', en: 'Good. Seal SZSE into the case file: here capital, rules, and innovation were tested together in Shenzhen.' },
    completion: { title: { zh: '本幕完成', en: 'Scene Complete' }, insight: { zh: '你已理解：深圳证券交易所是改革开放中资本市场制度化、企业融资和科技创新联动的重要节点。', en: 'You now understand SZSE as a key node linking capital-market institutions, enterprise finance, and tech innovation.' } },
    reward: { badge: '📈', badgeName: { zh: '市场试验印', en: 'Seal of the Market Testbed' }, insight: { zh: '深交所让深圳改革从空间开放走向规则建设。', en: 'SZSE moved Shenzhen reform from spatial opening to rule building.' } },
  }),

  M11: makeNearbyRpgEpisode({
    characters: [
      { name: { zh: '改革见证者', en: 'Witness of Reform' }, role: { zh: '莲花山城市记忆讲述人', en: 'Lianhua Mountain Memory Guide' }, portrait: './public/assets/episodes/lianhua/npc-cutout.jpg' },
    ],
    intro: { zh: '你登上莲花山，城市中轴线在脚下展开。铜像望向南方，提醒人们：深圳速度背后，是一次关于方向、信心和开放的历史判断。', en: 'You climb Lianhua Mountain as the city axis opens below. The statue faces south, reminding visitors that Shenzhen speed began with a judgment about direction, confidence, and openness.' },
    background: './public/assets/episodes/lianhua/stage-bg.jpg',
    sceneName: { zh: '莲花山 · 南方眺望', en: 'Lianhua Mountain · Southern View' },
    subtitle: { zh: '改革开放 · 莲花山', en: 'Reform and Opening · Lianhua Mountain' },
    chapterTitle: { zh: '画一个面向未来的圈', en: 'Drawing a Circle Toward the Future' },
    objective: { zh: '调查铜像、南方谈话、城市中轴、山顶视野，判断莲花山为何是深圳改革记忆的高点', en: 'Survey statue, Southern Tour, city axis, and summit view to judge why Lianhua Mountain is a high point of Shenzhen reform memory.' },
    objectiveDone: { zh: '任务完成：你已理解莲花山连接改革判断、城市方向与深圳公共记忆', en: 'Objective complete: Lianhua Mountain connects reform judgment, city direction, and public memory.' },
    clues: [
      { id: 'statue', x: 34, y: 42, title: { zh: '仰望铜像', en: 'Look at the Statue' }, label: { zh: '铜像', en: 'Statue' }, text: { zh: '2000年莲花山山顶矗立邓小平铜像，像高6米、重6吨，面朝南方俯瞰深圳中轴。这座铜像不只纪念个人，更标记了一个关于经济特区、对外开放与发展方向的集体选择。', en: 'In 2000 a six-meter, six-ton bronze statue of Deng Xiaoping was placed atop Lianhua Mountain, facing south over the Shenzhen axis. The statue memorializes not only a person but a collective choice about Special Economic Zones, openness, and development direction.' }, npcFeedback: { zh: '对。纪念物真正记录的是时代选择。', en: 'Yes. Monuments record choices made by an era.' } },
      { id: 'tour', x: 58, y: 31, title: { zh: '重读南方谈话', en: 'Reread the Southern Tour' }, label: { zh: '谈话', en: 'Tour' }, text: { zh: '1992年1月邓小平南方谈话重申特区不是"租界"、市场经济不等于资本主义，为深圳继续试验注入信心，为同年十四大确立社会主义市场经济体制提供关键思想准备。', en: 'In January 1992 Deng Xiaoping\'s Southern Tour reaffirmed that Special Economic Zones were not "concessions" and that a market economy did not equal capitalism. It gave Shenzhen confidence to keep experimenting and laid groundwork for the 14th Party Congress to adopt a socialist market economy that year.' }, npcFeedback: { zh: '记下。方向感有时比具体项目更重要。', en: 'Record that. Direction can matter more than any single project.' } },
      { id: 'axis', x: 72, y: 48, title: { zh: '观察城市中轴', en: 'Observe the City Axis' }, label: { zh: '中轴', en: 'Axis' }, text: { zh: '从山顶北望，市民中心、CBD与深圳湾口岸沿南北中轴线渐次展开。这条轴线由1996年城市总体规划确立，将行政、商业与滨海空间串联成深圳城市脊梁。', en: 'Looking north from the summit, the Civic Center, CBD, and Shenzhen Bay checkpoint unfold along the north-south axis. Established in the 1996 master plan, this framework links administration, commerce, and coastal space into the backbone of modern Shenzhen.' }, npcFeedback: { zh: '很好。改革最后会落成城市空间。', en: 'Good. Reform eventually takes spatial form.' } },
      { id: 'view', x: 47, y: 58, title: { zh: '记录山顶视野', en: 'Record the Summit View' }, label: { zh: '视野', en: 'View' }, text: { zh: '莲花山海拔106米，山顶广场是深圳最重要的公共眺望台。深圳速度、改革方向与公共记忆在此同框，人们从城市上方重新理解一座城如何从渔村走到全球都市。', en: 'At 106 meters elevation, the summit plaza is Shenzhen most important public overlook. Shenzhen speed, reform direction, and collective memory overlap here, letting visitors reinterpret how a fishing village became a global metropolis.' }, npcFeedback: { zh: '准确。这里是观看深圳，也重新理解深圳。', en: 'Correct. Here you view Shenzhen and reinterpret it.' } },
    ],
    start: { zh: '登山不要只为拍照。看清楚：为什么深圳需要在这里保存一段关于方向的记忆？', en: 'Do not climb only for photos. Ask why Shenzhen preserves memory of direction here.' },
    playerNote: { zh: '我会记录铜像、南方谈话、城市中轴和山顶视野，判断莲花山为何成为改革记忆的高点。', en: 'I will record statue, Southern Tour, city axis, and summit view to judge why Lianhua Mountain matters.' },
    survey: { zh: '先踏勘四处：铜像、南方谈话、城市中轴、山顶视野。线索齐了，再判断这座山的城市意义。', en: 'Survey statue, Southern Tour, city axis, and summit view, then judge the mountain urban meaning.' },
    judge: { question: { zh: '莲花山为什么是改革开放的重要锚点？', en: 'Why is Lianhua Mountain an important reform anchor?' }, options: [
      { text: { zh: '它把改革方向、城市空间和公共记忆放在同一个视野里', en: 'It places reform direction, urban space, and public memory in one view' }, correct: true, feedback: { zh: '判断准确。莲花山让抽象的改革变成可以眺望的城市景观。', en: 'Correct. Lianhua Mountain turns abstract reform into a visible city landscape.' } },
      { text: { zh: '只是因为山上空气比较好', en: 'Only because the air is better on the hill' }, correct: false, feedback: { zh: '太轻了。自然景观之外，这里承载的是城市方向感。', en: 'Too light. Beyond scenery, it carries the city sense of direction.' } },
      { text: { zh: '它与深圳发展没有关系', en: 'It has no relation to Shenzhen development' }, correct: false, feedback: { zh: '不对。这里正是理解深圳发展叙事的公共入口。', en: 'No. It is a public entry into Shenzhen development story.' } },
    ] },
    reflection: { zh: '城市需要高处，不只是为了眺望风景，也为了看清自己从哪里来、往哪里去。', en: 'A city needs high points not only for scenery, but to see where it came from and where it is going.' },
    synthesisChoice: {
      question: {
        zh: '铜像、南方谈话、城市中轴和山顶视野四条线索如何共同构成改革记忆？',
        en: 'How do the statue, Southern Tour, city axis, and summit view clues together constitute reform memory?',
      },
      options: [
        {
          text: { zh: '铜像标记选择，南方谈话注入方向，中轴落实空间，视野提供公共观看——四者把抽象的改革叙事转化为可感知的城市记忆', en: 'The statue marks choice, the Southern Tour injects direction, the axis implements space, and the view provides public viewing — together they turn abstract reform narrative into perceptible urban memory' },
          correct: true,
          feedback: { zh: '正确。铜像纪念的是关于特区与开放的集体选择，南方谈话为改革注入信心和方向感，城市中轴把改革理念落成可看见的空间秩序，山顶视野则让市民从高处俯瞰这些选择如何塑造了一座城。四条线索从决策、思想、空间到体验层层递进，共同把莲花山变成一座立体的改革记忆装置，而非单纯的风景点。', en: 'Correct. The statue commemorates the collective choice about SEZs and openness, the Southern Tour injects confidence and direction, the city axis turns reform ideas into visible spatial order, and the summit view lets citizens see from above how these choices shaped a city. The four clues progress from decision, thought, space to experience, together making Lianhua Mountain a three-dimensional reform memory device rather than a mere scenic spot.' },
        },
        {
          text: { zh: '只要看铜像就够了，其他线索都是多余的', en: 'Only the statue matters; the other clues are redundant' },
          correct: false,
          feedback: { zh: '不对。铜像固然重要，但它只是记忆的一个节点。没有南方谈话的思想准备，铜像就缺少历史语境；没有城市中轴，改革理念就缺少空间落地；没有山顶视野，人们就无法从整体上理解改革如何改变城市。四条线索互相补充，割裂任何一条都会让改革记忆变得单薄和模糊。', en: 'Incorrect. The statue is important but is only one node of memory. Without the Southern Tour ideological preparation, the statue lacks historical context; without the city axis, reform ideas lack spatial implementation; without the summit view, people cannot understand holistically how reform changed the city. The four clues complement each other; separating any one makes reform memory thin and blurry.' },
        },
        {
          text: { zh: '这四条线索只是巧合地出现在同一座山上', en: 'The four clues just coincidentally appear on the same mountain' },
          correct: false,
          feedback: { zh: '恰恰相反。铜像选址朝南俯瞰中轴并非偶然，它与南方谈话的历史逻辑、1996年城市总体规划的中轴设计以及山顶公共眺望台的功能定位相互呼应。这不是巧合，而是深圳有意把改革的方向感、思想资源、空间秩序和公共体验压缩到同一座山上，让莲花山成为可登、可望、可记忆的改革地标。', en: 'The opposite. The statue south-facing placement overlooking the axis is no accident. It echoes the historical logic of the Southern Tour, the 1996 master plan axis design, and the summit public overlook function. This is not coincidence but Shenzhen intentional compression of reform direction, ideological resources, spatial order, and public experience onto one mountain, making Lianhua Mountain a climbable, viewable, memorable reform landmark.' },
        },
      ],
    },
    impactChoice: {
      question: {
        zh: '为什么深圳需要一座像莲花山这样的"记忆之山"？',
        en: 'Why does Shenzhen need a "mountain of memory" like Lianhua Mountain?',
      },
      options: [
        {
          text: { zh: '因为城市需要可登临的公共空间来保存改革方向感，让市民和游客从高处重新理解深圳从哪里来', en: 'Because a city needs a climbable public space to preserve the sense of reform direction, letting citizens and visitors understand from above where Shenzhen came from' },
          correct: true,
          feedback: { zh: '正确。深圳是一座以速度和未来著称的城市，但速度容易让人遗忘来路。莲花山以铜像、中轴和山顶视野把改革的关键判断固化在城市中心，让人们在登高中重温方向选择的历史重量。一座记忆之山让城市不只追逐未来，也能回望起点，这正是深圳保持改革连续性而非断裂式发展的公共空间保障。', en: 'Correct. Shenzhen is known for speed and future, but speed easily makes people forget where they came from. Lianhua Mountain fixes the key judgment of reform in the city center through the statue, axis, and summit view, letting people relive the historical weight of directional choice while climbing. A mountain of memory lets the city not only chase the future but also look back at its starting point — this is the public space safeguard for Shenzhen continuous rather than fractured development.' },
        },
        {
          text: { zh: '深圳不需要记忆之山，只要继续往前发展就够了', en: 'Shenzhen does not need a mountain of memory; just keep developing forward' },
          correct: false,
          feedback: { zh: '不对。城市发展如果缺少记忆载体，就会失去方向感的连续性。莲花山不只是休闲公园，它保存了深圳关于改革开放方向选择的关键记忆。没有这样的公共记忆空间，市民和决策者都容易在快速变化中迷失来路，改革的精神动力也会逐渐稀释。记忆之山不是发展的阻碍，而是持续改革的思想坐标。', en: 'Incorrect. Urban development without memory carriers loses directional continuity. Lianhua Mountain is not just a leisure park; it preserves the key memory of Shenzhen reform and opening direction. Without such public memory space, citizens and decision-makers can easily lose their bearings amid rapid change, and the spiritual driving force of reform gradually dilutes. A mountain of memory is not an obstacle to development but the ideological coordinate for continued reform.' },
        },
        {
          text: { zh: '莲花山只是一个普通公园，谈不上记忆之山', en: 'Lianhua Mountain is just an ordinary park, not a "mountain of memory"' },
          correct: false,
          feedback: { zh: '错误。莲花山的海拔虽不高，但它承载的改革记忆密度远超普通公园。山顶邓小平铜像、南方谈话的历史回响、城市中轴的空间叙事和公共眺望功能，共同把它打造为深圳独一无二的改革记忆现场。把它当作普通公园，就忽略了这座城市有意把方向感和公共记忆安放在城市中心的深层意图。', en: 'Wrong. Lianhua Mountain elevation is modest, but the density of reform memory it carries far exceeds an ordinary park. The summit Deng Xiaoping statue, the historical echo of the Southern Tour, the spatial narrative of the city axis, and the public overlook function together make it Shenzhen unique reform memory site. Treating it as an ordinary park ignores the city deep intention of placing direction and public memory at its center.' },
        },
      ],
    },
    finalChoice: { question: { zh: '向游客概括莲花山，应强调什么？', en: 'What should a visitor summary emphasize?' }, options: [
      { text: { zh: '这里是深圳把改革方向转化为公共记忆的山顶现场', en: 'It is the summit where Shenzhen turns reform direction into public memory' }, correct: true, feedback: { zh: '记入案卷。莲花山是一座城市的方向牌。', en: 'Enter that into the record. Lianhua Mountain is a direction marker for the city.' } },
      { text: { zh: '这里和普通城市公园没有差别', en: 'It is no different from an ordinary city park' }, correct: false, feedback: { zh: '太浅了。它的公共记忆价值非常明确。', en: 'Too shallow. Its public-memory value is clear.' } },
    ] },
    closing: { zh: '很好。把莲花山封入案卷：一座山，托起深圳关于改革、方向与未来的共同记忆。', en: 'Good. Seal Lianhua Mountain into the case file: one hill carries Shenzhen shared memory of reform, direction, and future.' },
    completion: { title: { zh: '本幕完成', en: 'Scene Complete' }, insight: { zh: '你已理解：莲花山不是单纯景点，而是深圳改革开放叙事中承载方向感和公共记忆的城市高点。', en: 'You now understand Lianhua Mountain as an urban high point carrying direction and public memory in Shenzhen reform story.' } },
    reward: { badge: '⛰️', badgeName: { zh: '南方眺望印', en: 'Seal of the Southern View' }, insight: { zh: '莲花山让深圳把改革开放的方向感留在一座可眺望的山上。', en: 'Lianhua Mountain preserves Shenzhen reform direction on a hill people can overlook from.' } },
  }),

  'N-EG10': makeNearbyRpgEpisode({
    characters: [
      { name: { zh: '跨海工程师', en: 'Cross-Sea Engineer' }, role: { zh: '深中通道现场讲述人', en: 'Shenzhen-Zhongshan Link Site Guide' }, portrait: './public/assets/episodes/shenzhong/npc-cutout.jpg' },
    ],
    intro: { zh: '你来到珠江口东岸的观测点，远处海面上桥、岛、隧和航道被重新编织。深中通道不是孤立道路，而是一笔改变东西两岸距离感的工程。', en: 'You reach an eastern Pearl River Estuary viewpoint. Bridges, islands, tunnel, and shipping lanes are rewoven offshore. The Shenzhen-Zhongshan Link is not an isolated road, but an engineering stroke that changes distance between east and west banks.' },
    background: './public/assets/episodes/shenzhong/stage-bg.jpg',
    sceneName: { zh: '深中通道 · 珠江口工程线', en: 'Shenzhen-Zhongshan Link · Estuary Engineering Line' },
    subtitle: { zh: '工程奇迹 · 深中通道', en: 'Engineering Miracle · Shenzhen-Zhongshan Link' },
    chapterTitle: { zh: '把海湾重新折叠', en: 'Folding the Bay Together' },
    objective: { zh: '调查桥梁、人工岛、海底隧道、产业流线，判断深中通道如何重塑珠江口网络', en: 'Survey bridge, artificial island, undersea tunnel, and industry flows to judge how the link reshapes the estuary network.' },
    objectiveDone: { zh: '任务完成：你已理解深中通道的意义在于压缩时空、重排产业与城市联系', en: 'Objective complete: the link compresses time-space and rearranges industry and city connections.' },
    clues: [
      { id: 'bridge', x: 30, y: 44, title: { zh: '观测桥面', en: 'Observe the Bridge Deck' }, label: { zh: '桥梁', en: 'Bridge' }, text: { zh: '深中通道桥梁段全长约17公里，2024年6月通车。深圳到中山车程从约2小时缩短至30分钟，工程首先改变的是人们对珠江口距离的感受。', en: 'The Shenzhen-Zhongshan Link bridge section spans approximately 17 kilometers and opened in June 2024. Shenzhen-to-Zhongshan drive time fell from about two hours to thirty minutes — engineering that first changes how people perceive Pearl River estuary distance.' }, npcFeedback: { zh: '对。工程首先改变的是人们对距离的感觉。', en: 'Yes. Engineering first changes how distance feels.' } },
      { id: 'island', x: 54, y: 32, title: { zh: '查看人工岛', en: 'Inspect the Artificial Island' }, label: { zh: '人工岛', en: 'Island' }, text: { zh: '西人工岛面积约13.7万平方米，采用钢圆筒振沉法施工，由57个直径28米巨型钢圆筒围合成岛。人工岛是桥隧转换的枢纽节点，也是深中通道施工组织的中枢基地。', en: 'The west artificial island covers about 137,000 square meters, built by vibrating 57 giant steel cylinders each 28 meters in diameter into the seabed. The island serves as the bridge-tunnel transition hub and the central base for construction logistics of the entire link.' }, npcFeedback: { zh: '很好。海上工程需要把"陆地能力"临时搬到海面。', en: 'Good. Offshore engineering temporarily moves land capability onto the sea.' } },
      { id: 'tunnel', x: 72, y: 47, title: { zh: '追踪海底隧道', en: 'Trace the Undersea Tunnel' }, label: { zh: '隧道', en: 'Tunnel' }, text: { zh: '海底沉管隧道长约6.8公里，由32个巨型沉管对接而成，最深处位于海平面下40米。隧道为30万吨级航道让出通航空间，说明超级工程需同时处理交通、航运与生态。', en: 'The undersea immersed tube tunnel extends about 6.8 kilometers, assembled from 32 giant tube segments, reaching 40 meters below sea level. The tunnel reserves navigation clearance for 300,000-ton-class shipping lanes, showing mega projects must balance traffic, maritime safety, and marine ecology.' }, npcFeedback: { zh: '准确。不是所有连接都适合架在海面上。', en: 'Correct. Not every connection should sit above the sea.' } },
      { id: 'flows', x: 44, y: 58, title: { zh: '比对产业流线', en: 'Compare Industry Flows' }, label: { zh: '流线', en: 'Flows' }, text: { zh: '深中通道通车后，深圳电子信息、中山先进制造与珠江西岸家电集群间的通勤、物流与协作动线被重新组合，珠江口从天然分隔变为半小时通勤圈，两岸城市分工格局由此重构。', en: 'After the link opened, commuting, logistics, and collaboration flows between Shenzhen electronics, Zhongshan manufacturing, and west-bank appliance clusters are being recomposed. The estuary became a half-hour commute circle, restructuring the east-west division of labor.' }, npcFeedback: { zh: '记下。道路真正改变的，是城市之间的协作方式。', en: 'Record this. Roads truly change how cities cooperate.' } },
    ],
    start: { zh: '别只把深中通道看成一条路。我们要读懂它如何把珠江口两岸的时间距离重新折叠。', en: 'Do not see the link as only a road. Read how it folds the time distance between the estuary banks.' },
    playerNote: { zh: '我会记录桥梁、人工岛、海底隧道和产业流线四条线索，判断这条通道为何关键。', en: 'I will record bridge, island, tunnel, and industry-flow clues to judge why this link matters.' },
    survey: { zh: '先踏勘四处：桥梁、人工岛、海底隧道、产业流线。线索齐了，再判断珠江口网络变化。', en: 'Survey bridge, island, undersea tunnel, and industry flows, then judge changes to the estuary network.' },
    judge: { question: { zh: '深中通道的核心意义是什么？', en: 'What is the core meaning of the Shenzhen-Zhongshan Link?' }, options: [
      { text: { zh: '它压缩东西两岸时空距离，并重排产业、通勤与旅游网络', en: 'It compresses time-space between east and west banks and rearranges industry, commuting, and tourism networks' }, correct: true, feedback: { zh: '判断准确。超级工程的价值不只在长度，而在它改变网络。', en: 'Correct. A mega project matters not only by length, but by changing networks.' } },
      { text: { zh: '它只是为了让海面上多一座桥', en: 'It only adds one more bridge over the sea' }, correct: false, feedback: { zh: '太表面了。关键是桥、岛、隧和城市网络共同改变。', en: 'Too superficial. The key is how bridge, island, tunnel, and urban networks change together.' } },
      { text: { zh: '它与珠江西岸没有关系', en: 'It has no relation to the west bank' }, correct: false, feedback: { zh: '不对。它的意义恰恰在于把东西两岸重新连接。', en: 'No. Its meaning lies in reconnecting east and west banks.' } },
    ] },
    reflection: { zh: '大湾区的工程不是单点炫技，而是在海、城、港、产业之间重写连接方式。', en: 'Bay Area engineering is not isolated spectacle; it rewrites connections among sea, city, port, and industry.' },
    synthesisChoice: {
      question: {
        zh: '把桥梁、人工岛、海底隧道和产业流线连起来看，它们如何共同改变珠江口的格局？',
        en: 'Connecting bridge, artificial island, undersea tunnel, and industry flows — how do they together reshape the Pearl River estuary?',
      },
      options: [
        {
          text: { zh: '桥—岛—隧构成跨海通道骨架，产业流线则把两岸城市与经济重新编入同一张协作网络', en: 'Bridge-island-tunnel forms the corridor skeleton, while industry flows reweave both banks into one collaborative network' },
          correct: true,
          feedback: { zh: '判断准确。超级工程的意义不在单一构件，而在于桥、岛、隧提供了物理通道，产业流线则把通行能力转化为真实的城市协作与经济重组。', en: 'Correct. A mega project matters not in any single component, but in how bridge, island, and tunnel provide physical passage while industry flows turn capacity into real urban collaboration and economic reorganization.' },
        },
        {
          text: { zh: '四条线索各管各的，桥只管通车、岛只管景观、隧道只是技术展示', en: 'The four clues are independent: bridge for traffic, island for scenery, tunnel for tech display' },
          correct: false,
          feedback: { zh: '这割裂了工程的系统性。桥、岛、隧不是独立展品，而是互相咬合的工程整体；产业流线更不是配角，它才把通道变成真正的经济走廊。', en: 'This fragments the engineering system. Bridge, island, and tunnel are not independent exhibits but interlocking parts; industry flows are no sidekick — they turn the corridor into a real economic axis.' },
        },
        {
          text: { zh: '只有海底隧道重要，桥梁和人工岛都是可有可无的配角', en: 'Only the undersea tunnel matters; bridge and island are dispensable' },
          correct: false,
          feedback: { zh: '不对。隧道解决深水区通行，但没有桥梁接岸、人工岛做转换节点，整条通道就无法贯通。每个构件都不可替代，缺一环则全链断裂。', en: 'Wrong. The tunnel solves deep-water crossing, but without the bridge reaching shore and the island as a transition node, the corridor cannot be complete. Each part is irreplaceable; lose one link and the whole chain breaks.' },
        },
      ],
    },
    impactChoice: {
      question: {
        zh: '深中通道对大湾区一体化最重要的意义是什么？',
        en: 'What is the most significant impact of the Shenzhen-Zhongshan Link on Greater Bay Area integration?',
      },
      options: [
        {
          text: { zh: '它把珠江口东西两岸从绕行变为直连，让产业、通勤与要素流动真正迈向"半小时生活圈"', en: 'It turns the estuary banks from detour to direct link, pushing industry, commuting, and factor flows toward a half-hour circle' },
          correct: true,
          feedback: { zh: '判断准确。深中通道不只是缩短了车程，它从空间结构上把珠江口两岸的经济、产业与日常生活重新折叠，是大湾区一体化最具标志性的物理基础设施之一。', en: 'Correct. The link does not just shorten drive time; it structurally refolds the economy, industry, and daily life of both estuary banks, making it one of the most iconic physical infrastructure projects for Bay Area integration.' },
        },
        {
          text: { zh: '它只是为了方便中山人去深圳打工，没有更深远的意义', en: 'It only helps Zhongshan residents commute to Shenzhen for work, with no deeper meaning' },
          correct: false,
          feedback: { zh: '太窄了。深中通道改变的远不止通勤，它重塑的是珠江口两岸的产业布局、物流网络与城市协作模式，影响覆盖整个大湾区东西轴带。', en: 'Too narrow. The link transforms far more than commuting; it reshapes industry layout, logistics networks, and urban collaboration across the entire east-west axis of the Bay Area.' },
        },
        {
          text: { zh: '它让两岸差异消失，以后不再需要各自发展特色', en: 'It erases differences between banks, so each side no longer needs its own character' },
          correct: false,
          feedback: { zh: '误解了。一体化的目的不是消除差异，而是让两岸各自优势在更紧密的连接中互补共赢。深中通道创造的是协同，不是同质化。', en: 'Misunderstood. Integration does not aim to erase differences but to let each bank complement the other through tighter connections. The link creates synergy, not homogenization.' },
        },
      ],
    },
    finalChoice: { question: { zh: '向游客总结深中通道，最准确的是？', en: 'Best visitor summary for the link?' }, options: [
      { text: { zh: '它是一条把珠江口东西两岸重新编入同一张网络的超级通道', en: 'It is a mega corridor weaving the estuary east and west banks into one network' }, correct: true, feedback: { zh: '记入案卷。通道改变的，是湾区协同的空间想象。', en: 'Enter that into the record. The link changes the spatial imagination of Bay Area coordination.' } },
      { text: { zh: '它只适合开车经过，不值得理解', en: 'It is only for driving through and not worth understanding' }, correct: false, feedback: { zh: '太低估了。经过之前，更值得理解它如何改变湾区。', en: 'That underestimates it. Before passing through, understand how it changes the Bay Area.' } },
    ] },
    closing: { zh: '很好。把深中通道封入案卷：桥、岛、隧穿过海面，也穿过城市之间原有的距离感。', en: 'Good. Seal the link into the case file: bridge, island, and tunnel cross the sea and the old sense of distance between cities.' },
    completion: { title: { zh: '本幕完成', en: 'Scene Complete' }, insight: { zh: '你已理解：深中通道的价值在于把珠江口东西两岸的交通、产业和城市协作重新编织。', en: 'You now understand the link as reweaving traffic, industry, and urban cooperation across the estuary.' } },
    reward: { badge: '🌉', badgeName: { zh: '跨海折叠印', en: 'Seal of the Folded Bay' }, insight: { zh: '深中通道让珠江口从绕行的海湾变成被重新编织的城市网络。', en: 'The Shenzhen-Zhongshan Link turns the estuary from a detour bay into a reworked urban network.' } },
  }),

  M08: makeNearbyRpgEpisode({
    characters: [
      { name: { zh: '金融先行者', en: 'Financial Pioneer' }, role: { zh: '前海制度试验讲述人', en: 'Qianhai Policy Experiment Guide' }, portrait: './public/assets/episodes/qianhai/npc-cutout.jpg?v=rpg-assets-fix-2' },
    ],
    intro: {
      zh: '2010年，你作为前海规划团队的现场记录员，站在尚未完全成形的滩涂边。这里要承接的不只是高楼，而是一套深港协同、金融开放与法治衔接的新规则。',
      en: 'In 2010, you stand on the edge of the still-forming Qianhai district as a field recorder. This place will carry not only towers, but new rules for Shenzhen-Hong Kong coordination, financial opening, and legal connection.',
    },
    background: './public/assets/episodes/qianhai/stage-bg.jpg',
    sceneName: { zh: '前海 · 制度试验场', en: 'Qianhai · Policy Testbed' },
    subtitle: { zh: '改革开放与制度创新 · 前海深港合作区', en: 'Reform and Institutional Innovation · Qianhai' },
    chapterTitle: { zh: '从滩涂到制度新区', en: 'From Mudflat to Policy District' },
    objective: {
      zh: '调查蓝图、港湾、跨境金融、规则接口，判断前海为何适合做深港制度试验场',
      en: 'Survey the blueprint, harbor, cross-border finance, and rule interface to judge why Qianhai became a Shenzhen-Hong Kong policy testbed',
    },
    objectiveDone: {
      zh: '任务完成：你已理解前海的价值不止在楼宇，而在规则先行与深港协同',
      en: 'Objective complete: you understand Qianhai as more than towers, but as early rules and Shenzhen-Hong Kong coordination',
    },
    chapters: [
      { zh: '序章', en: 'Prologue' },
      { zh: '踏勘', en: 'Survey' },
      { zh: '制度', en: 'Institutions' },
      { zh: '判断', en: 'Judgment' },
      { zh: '完成', en: 'Complete' },
    ],
    clues: [
      {
        id: 'blueprint',
        x: 30,
        y: 50,
        title: { zh: '查阅蓝图', en: 'Read the Blueprint' },
        label: { zh: '蓝图', en: 'Blueprint' },
          text: {
            zh: '2010年前海深港现代服务业合作区获批，首张蓝图并非画楼，而是将金融开放、港企服务、法律衔接与城市空间叠加于同一规划框架，国务院批复定位为深港合作先导区。',
            en: 'In 2010 the Qianhai Shenzhen-Hong Kong Modern Service Industry Cooperation Zone was approved. Its first blueprint did not simply draw towers, but layered financial opening, Hong Kong enterprise services, legal linkage, and urban space within one planning framework. The State Council designation positioned Qianhai as a Shenzhen-Hong Kong cooperation pilot zone.',
          },
        npcFeedback: {
          zh: '记下这一点。前海最先动工的，是规则想象。',
          en: 'Record this. The first thing built in Qianhai was an imagination of rules.',
        },
      },
      {
        id: 'harbor',
        x: 22,
        y: 65,
        title: { zh: '观察港湾', en: 'Observe the Harbor' },
        label: { zh: '港湾', en: 'Harbor' },
          text: {
            zh: '前海紧邻蛇口集装箱码头、宝安机场与中国香港，三十公里内覆盖三个深水港与两个国际机场，天然适合重新编织人流、资金流、信息流与货物流，使制度试验有真实流动网络支撑。',
            en: 'Qianhai sits adjacent to Shekou container terminal, Bao\'an Airport, and Hong Kong China. Within thirty kilometers lie three deep-water ports and two international airports, naturally supporting the reweaving of people, capital, information, and goods flows for policy experiments.',
          },
        npcFeedback: {
          zh: '对。制度试验不能离开真实的流动网络。',
          en: 'Yes. Policy experiments need real networks of movement.',
        },
      },
      {
        id: 'finance',
        x: 65,
        y: 42,
        title: { zh: '核对金融清单', en: 'Check the Finance List' },
        label: { zh: '金融', en: 'Finance' },
          text: {
            zh: '2013年前海启动跨境人民币贷款试点，随后双向资本池、港资金融机构准入等政策相继落地，使前海成为观察中国金融开放的前沿窗口，为深港资本双向流动提供制度化通道。',
            en: 'In 2013 Qianhai launched cross-border RMB loan pilots, followed by two-way capital pools and Hong Kong financial institution access. These made Qianhai a front window for China financial opening and institutionalized two-way capital flows between Shenzhen and Hong Kong.',
          },
        npcFeedback: {
          zh: '很好。这里试验的不是一个项目，而是一套金融连接方式。',
          en: 'Good. The experiment here is not one project, but a way of financial connection.',
        },
      },
      {
        id: 'rules',
        x: 77,
        y: 61,
        title: { zh: '比对规则接口', en: 'Compare Rule Interfaces' },
        label: { zh: '规则', en: 'Rules' },
          text: {
            zh: '企业所得税15%优惠、商事登记简化、国际商事仲裁与港资律师事务所联营等接口，是前海区别于普通新区的关键。这些规则接口使深港两地制度差异可操作、可衔接、可复制。',
            en: 'A 15% corporate income tax rate, streamlined business registration, international commercial arbitration, and joint ventures with Hong Kong law firms are the interfaces distinguishing Qianhai from an ordinary new district. These rule interfaces make the institutional gap between Shenzhen and Hong Kong operable, connectable, and replicable.',
          },
        npcFeedback: {
          zh: '正是。真正难建的不是道路，而是可以复制的规则接口。',
          en: 'Exactly. Roads are not the hardest thing to build; repeatable rule interfaces are.',
        },
      },
    ],
    start: {
      zh: '来到前海，不要先数楼。先看这片新区为什么能承接深港之间最难落地的制度试验。',
      en: 'When you arrive at Qianhai, do not count towers first. Read why this district can host the hardest Shenzhen-Hong Kong policy experiments.',
    },
    playerNote: {
      zh: '我会记录空间、港湾、金融与规则四条线索，再判断这片滩涂为何会成为制度新区。',
      en: 'I will record four clues: space, harbor, finance, and rules, then judge why this mudflat became a policy district.',
    },
    survey: {
      zh: '先踏勘四处：蓝图、港湾、跨境金融、规则接口。线索齐了，才能看懂前海。',
      en: 'Survey four points first: blueprint, harbor, cross-border finance, and rule interfaces. With all clues, Qianhai becomes legible.',
    },
    judge: {
      question: {
        zh: '为什么前海适合成为深港制度创新试验场？',
        en: 'Why is Qianhai suited to be a Shenzhen-Hong Kong institutional testbed?',
      },
      options: [
        {
          text: { zh: '它把空白新区、港口区位、金融开放与规则衔接放在同一处', en: 'It combines a blank district, harbor location, financial opening, and rule connection in one place' },
          correct: true,
          feedback: {
            zh: '判断准确。前海的关键不是“新”，而是能把深港协同变成可测试、可复制的制度现场。',
            en: 'Correct. Qianhai matters not because it is new, but because it turns Shenzhen-Hong Kong coordination into a testable and repeatable policy site.',
          },
        },
        {
          text: { zh: '只是因为这里地价低，适合盖新楼', en: 'Only because land was cheap and suitable for new towers' },
          correct: false,
          feedback: {
            zh: '这只看到了表面。前海真正的价值在于制度试验，而不只是土地开发。',
            en: 'That only sees the surface. Qianhai real value lies in institutional experiments, not only land development.',
          },
        },
        {
          text: { zh: '因为它远离香港，可以减少跨境协同', en: 'Because it is far from Hong Kong and can reduce cross-border coordination' },
          correct: false,
          feedback: {
            zh: '恰恰相反。前海就是为了更好衔接香港的专业服务、资本与规则经验。',
            en: 'The opposite. Qianhai was designed to connect more deeply with Hong Kong professional services, capital, and rule experience.',
          },
        },
      ],
    },
    reflection: {
      zh: '前海提醒我们：一座新区的高度，不只取决于楼有多高，也取决于规则能走多远。',
      en: 'Qianhai reminds us that a district height is not only measured by towers, but by how far its rules can travel.',
    },
    synthesisChoice: {
      question: {
        zh: '蓝图、港湾、跨境金融与规则接口四条线索如何共同构成前海的制度试验场？',
        en: 'How do blueprint, harbor, cross-border finance, and rule interfaces together form Qianhai institutional testbed?',
      },
      options: [
        {
          text: { zh: '蓝图定方向、港湾供流动网络、金融开窗口、规则做接口，四者叠加才使制度试验可操作、可衔接', en: 'Blueprint sets direction, harbor provides flow networks, finance opens windows, rules create interfaces — together they make policy experiments operable and connectable' },
          correct: true,
          feedback: { zh: '判断准确。前海不是靠单一要素成立，而是蓝图规划、港口区位、金融开放与规则衔接缺一不可，四者叠加才让深港协同从概念变成可落地的制度现场。', en: 'Correct. Qianhai is not built on a single factor; blueprint planning, harbor location, financial opening, and rule connection are all indispensable, together turning Shenzhen-Hong Kong coordination from concept into an operable policy site.' },
        },
        {
          text: { zh: '只要港湾区位好就够了，蓝图和规则都不重要', en: 'A good harbor location is enough; blueprint and rules are unimportant' },
          correct: false,
          feedback: { zh: '忽略了制度的核心。前海真正的壁垒不是地理区位，而是规划蓝图与规则接口——没有这些，港湾只是天然条件，无法自动转化为深港制度试验场。', en: 'Misses the institutional core. Qianhai real barrier is not geography but planning blueprint and rule interfaces — without them, the harbor is just a natural condition that cannot automatically become a policy testbed.' },
        },
        {
          text: { zh: '四条线索只是凑在一起的景点介绍，没有内在关联', en: 'The four clues are just grouped sightseeing spots with no intrinsic connection' },
          correct: false,
          feedback: { zh: '割裂了前海的系统逻辑。蓝图定义了试验框架，港湾提供了流动条件，金融是开放抓手，规则是衔接工具——它们共同构成一条制度创新的因果链。', en: 'This fragments Qianhai systemic logic. The blueprint defines the experiment frame, the harbor provides flow conditions, finance is the opening lever, and rules are the connection tool — together they form a causal chain of institutional innovation.' },
        },
      ],
    },
    impactChoice: {
      question: {
        zh: '前海模式对大湾区制度创新最大的可复制性意义是什么？',
        en: 'What is the greatest replicable significance of the Qianhai model for Bay Area institutional innovation?',
      },
      options: [
        {
          text: { zh: '它证明了"规则先行、小步试验、可复制推广"的路径，为大湾区制度衔接提供了可学习的模板', en: 'It proves the path of rules first, small-step experiments, and replicable scaling, providing a learnable template for Bay Area rule connection' },
          correct: true,
          feedback: { zh: '判断准确。前海最大的贡献不是盖了多少楼，而是用十余年实践验证了一套制度创新方法论：先在局部试验规则接口，成功后再向更大范围推广，这为大湾区制度一体化提供了可参照的路径。', en: 'Correct. Qianhai greatest contribution is not its towers but a methodology validated over a decade: test rule interfaces locally first, then scale upon success, offering a reference path for Bay Area institutional integration.' },
        },
        {
          text: { zh: '前海经验只适用于前海，无法复制到其他地方', en: 'Qianhai experience only works in Qianhai and cannot be replicated elsewhere' },
          correct: false,
          feedback: { zh: '低估了前海的价值。前海试验的跨境人民币贷款、商事登记简化、国际仲裁等规则已被逐步推广到南沙、横琴等其他合作区，证明其经验具有可复制性。', en: 'Underestimates Qianhai. Cross-border RMB loans, streamlined registration, and international arbitration tested in Qianhai have been gradually extended to Nansha, Hengqin, and other cooperation zones, proving replicability.' },
        },
        {
          text: { zh: '可复制的只是高楼建设模式，与制度无关', en: 'Only the tower-building model is replicable, not the institutions' },
          correct: false,
          feedback: { zh: '本末倒置。前海真正值得复制的恰恰是制度层面的创新——税收优惠、仲裁机制、港资准入等规则接口，而非物理空间的楼宇建设。制度才是前海的核心资产。', en: 'Puts the cart before the horse. What is truly worth replicating from Qianhai is institutional innovation — tax incentives, arbitration mechanisms, Hong Kong capital access — not physical towers. Institutions are Qianhai core asset.' },
        },
      ],
    },
    finalChoice: {
      question: {
        zh: '如果向游客总结前海这一站，最准确的一句话是什么？',
        en: 'What is the most accurate one-line summary of Qianhai for visitors?',
      },
      options: [
        {
          text: { zh: '这里是把深港协同写进规则的制度试验场', en: 'It is a policy testbed that writes Shenzhen-Hong Kong coordination into rules' },
          correct: true,
          feedback: {
            zh: '记入案卷。前海的故事，是中国改革开放从“给空间”走向“造规则”的新阶段。',
            en: 'Enter that into the record. Qianhai marks a new stage of Reform and Opening: from granting space to building rules.',
          },
        },
        {
          text: { zh: '这里只是深圳西部一个普通 CBD', en: 'It is just an ordinary CBD in western Shenzhen' },
          correct: false,
          feedback: {
            zh: '太轻了。CBD 是结果，制度创新才是前海最值得被理解的底层逻辑。',
            en: 'Too light. A CBD is an outcome; institutional innovation is the deeper logic visitors should understand.',
          },
        },
      ],
    },
    closing: {
      zh: '很好。把前海封入案卷：它不是单纯造城，而是在湾区现场试写一套开放规则。',
      en: 'Good. Seal Qianhai into the case file: it is not only city-building, but an on-site draft of open rules for the Bay Area.',
    },
    completion: {
      title: { zh: '本幕完成', en: 'Scene Complete' },
      insight: {
        zh: '你已理解：前海的核心不是一片新楼宇，而是深港规则衔接、金融开放和制度创新的现场试验。',
        en: 'You now understand: Qianhai is not just new buildings, but an on-site experiment in Shenzhen-Hong Kong rule connection, financial opening, and institutional innovation.',
      },
    },
    reward: { badge: '💰', badgeName: { zh: '金融先锋印', en: 'Seal of the Financial Vanguard' }, insight: { zh: '从填海之地到金融心脏，前海用十余年证明：最大胆的创新，往往从一张白纸开始。', en: 'From mudflat to financial heart, Qianhai proves in a decade: the boldest innovation often starts from a blank page.' } },
  }),

  M06: makeNearbyRpgEpisode({
    characters: [
      { name: { zh: '袁庚', en: 'Yuan Geng' }, role: { zh: '蛇口工业区创始人', en: 'Founder of Shekou Industrial Zone' }, portrait: './public/assets/episodes/shekou/npc-cutout.jpg?v=rpg-assets-fix-2' },
    ],
    intro: {
      zh: '1979年，你来到蛇口工地。远处是填海与开山的声音，近处是临时办公室、码头和第一批拓荒者。袁庚要在这里把改革变成可以被看见的现场。',
      en: 'In 1979, you arrive at the Shekou construction site. Reclamation and blasting echo in the distance; nearby are temporary offices, docks, and first pioneers. Yuan Geng wants to make reform visible here.',
    },
    background: './public/assets/episodes/shekou/stage-bg.jpg',
    sceneName: { zh: '蛇口工业区 · 改革工地', en: 'Shekou Industrial Zone · Reform Worksite' },
    subtitle: { zh: '近现代发展 · 蛇口工业区', en: 'Modern Development · Shekou Industrial Zone' },
    chapterTitle: { zh: '一声开山炮', en: 'A First Blast of Reform' },
    objective: {
      zh: '调查炮声、标语、码头、用工制度，判断蛇口为何成为改革开放的先声',
      en: 'Survey the blast, slogan, dock, and work system to judge why Shekou became the first sound of Reform and Opening',
    },
    objectiveDone: {
      zh: '任务完成：你已理解蛇口的价值在于先试、实干与可复制的制度实验',
      en: 'Objective complete: you understand Shekou as trial-first action and repeatable institutional experiment',
    },
    chapters: [
      { zh: '序章', en: 'Prologue' },
      { zh: '踏勘', en: 'Survey' },
      { zh: '效率', en: 'Efficiency' },
      { zh: '判断', en: 'Judgment' },
      { zh: '完成', en: 'Complete' },
    ],
    clues: [
      {
        id: 'blast',
        x: 35,
        y: 37,
        title: { zh: '听见炮声', en: 'Hear the Blast' },
        label: { zh: '炮声', en: 'Blast' },
        text: {
          zh: '1979年蛇口工业区破土动工，开山炮声轰响于珠江口东岸。这不是普通施工爆破，而是在计划经济体制缝隙中撕开一个外向型试验场，第一声炮响即改革先声。',
          en: 'In 1979 the Shekou Industrial Zone broke ground. The mountain-blast echoed across the eastern Pearl River estuary. It was not ordinary construction blasting, but the tearing open of an export-oriented testing ground within the cracks of the planned economy — the first cannon of reform.',
        },
        npcFeedback: {
          zh: '听得准。改革有时先以现场声音出现，再变成制度文字。',
          en: 'Good ear. Reform sometimes appears first as a site sound, then becomes policy language.',
        },
      },
      {
        id: 'slogan',
        x: 58,
        y: 30,
        title: { zh: '记录标语', en: 'Record the Slogan' },
        label: { zh: '标语', en: 'Slogan' },
        text: {
          zh: '1984年蛇口提出"时间就是金钱，效率就是生命"，将效率观念刻入工地计时与奖金制度，冲击计划经济时代的劳动价值观，成为改革开放最标志性的精神宣言。',
          en: 'In 1984 Shekou declared "Time is money, efficiency is life." This slogan etched efficiency into worksite timekeeping and bonus systems, challenging planned-economy labor values and becoming reform most iconic manifesto.',
        },
        npcFeedback: {
          zh: '这句话当年很锋利。它真正指向的是效率背后的制度松绑。',
          en: 'This line was sharp in its time. It points to the loosening of systems behind efficiency.',
        },
      },
      {
        id: 'dock',
        x: 22,
        y: 58,
        title: { zh: '查看码头', en: 'Inspect the Dock' },
        label: { zh: '码头', en: 'Dock' },
        text: {
          zh: '蛇口码头由交通部第四航务工程局1979年起建造，1981年通航。码头使工业区直连中国香港航运线，原料进口与成品出口不再经广州中转，蛇口从工地变为外向型生产港口。',
          en: 'Shekou dock was built from 1979 by the Ministry of Communications Fourth Harbour Engineering Bureau and opened in 1981. It connected the zone directly to Hong Kong shipping, letting imports and exports bypass Guangzhou, turning Shekou from a worksite into an export-oriented port.',
        },
        npcFeedback: {
          zh: '对。没有外向型流动，改革就难以转化为产业能力。',
          en: 'Yes. Without outward flows, reform is hard to turn into industrial capacity.',
        },
      },
      {
        id: 'work-system',
        x: 73,
        y: 57,
        title: { zh: '翻看用工制度', en: 'Read the Work System' },
        label: { zh: '制度', en: 'System' },
        text: {
          zh: '蛇口率先打破铁饭碗，1980年实行定额超产奖励，1983年推出合同制与浮动工资。这些创新让企业获得用工与分配自主权，使"敢闯"精神落地为可运转的激励机制。',
          en: 'Shekou ended the iron rice bowl, introducing output-based bonuses in 1980 and employee contracts with floating wages in 1983. These innovations gave enterprises autonomy over hiring and pay, turning daring into a functioning incentive mechanism.',
        },
        npcFeedback: {
          zh: '很好。改革不是口号，它必须落到组织和激励里。',
          en: 'Good. Reform is not a slogan; it must land in organization and incentives.',
        },
      },
    ],
    start: {
      zh: '蛇口没有等到所有条件成熟才开始。我们要看的，是它如何把不确定变成试验，把试验变成经验。',
      en: 'Shekou did not wait for all conditions to mature. We need to see how it turned uncertainty into experiments, and experiments into experience.',
    },
    playerNote: {
      zh: '我会记录炮声、标语、码头与制度四条线索，判断蛇口为何能成为改革开放的先声。',
      en: 'I will record four clues: blast, slogan, dock, and system, then judge why Shekou became an early voice of Reform and Opening.',
    },
    survey: {
      zh: '先踏勘四处：炮声、标语、码头、用工制度。看完再判断蛇口经验的核心。',
      en: 'Survey four places first: blast, slogan, dock, and work system. Then judge the core of the Shekou experience.',
    },
    judge: {
      question: {
        zh: '蛇口经验最关键的突破是什么？',
        en: 'What was the key breakthrough of the Shekou experience?',
      },
      options: [
        {
          text: { zh: '先试、再改、再推广，用现场实验打开制度想象', en: 'Test first, adjust, then scale, using field experiments to open institutional imagination' },
          correct: true,
          feedback: {
            zh: '判断准确。蛇口的价值不只在速度，而在它把改革变成可验证、可复制的现场实验。',
            en: 'Correct. Shekou value lies not only in speed, but in turning reform into a testable and repeatable field experiment.',
          },
        },
        {
          text: { zh: '所有改革都必须等到条件完全成熟后才开始', en: 'Every reform must wait until every condition is perfect' },
          correct: false,
          feedback: {
            zh: '不对。蛇口最重要的精神恰恰是敢于在不确定中启动试验。',
            en: 'No. Shekou spirit was daring to begin under uncertainty.',
          },
        },
        {
          text: { zh: '只要有土地开发，工业区自然就会成功', en: 'With land development alone, an industrial zone will naturally succeed' },
          correct: false,
          feedback: {
            zh: '土地不是答案。真正让蛇口成立的，是组织机制、外向连接和效率观念一起发生变化。',
            en: 'Land is not the answer. Shekou worked because organization, outward connection, and efficiency ideas changed together.',
          },
        },
      ],
    },
    reflection: {
      zh: '"时间就是金钱"真正改变的，不只是工地节奏，而是人们理解发展、劳动与机会的方式。',
      en: '"Time is money" changed not only the worksite rhythm, but how people understood development, labor, and opportunity.',
    },
    synthesisChoice: {
      question: {
        zh: '开山炮、标语、码头与用工制度四条线索如何共同构成蛇口的改革实验？',
        en: 'How do the blast, slogan, dock, and work system together form Shekou reform experiment?',
      },
      options: [
        {
          text: { zh: '炮声破土开工、标语重塑效率观念、码头打开外向通道、用工制度落地激励机制，四者构成完整的改革链条', en: 'The blast breaks ground, the slogan reshapes efficiency values, the dock opens an outward channel, and the work system creates incentives — together a complete reform chain' },
          correct: true,
          feedback: { zh: '判断准确。蛇口改革不是单一事件的偶发，而是从物理开工（炮声）到观念变革（标语），再到外向连接（码头）和制度落地（用工），四个环节环环相扣才构成完整的改革实验场。', en: 'Correct. Shekou reform was not a single accidental event but a chain from physical groundbreaking (blast) to value transformation (slogan), to outward connection (dock) and institutional implementation (work system) — each link essential to the complete reform experiment.' },
        },
        {
          text: { zh: '四条线索只是蛇口的历史花絮，彼此之间没有共同逻辑', en: 'The four clues are just historical anecdotes with no shared logic' },
          correct: false,
          feedback: { zh: '割裂了蛇口的内在逻辑。炮声是行动起点，标语是精神宣言，码头是物质通道，用工制度是组织保障——它们共同回答"改革如何从口号变成可运转的机制"这一核心问题。', en: 'This fragments Shekou internal logic. The blast is the action start, the slogan the spiritual manifesto, the dock the material channel, and the work system the organizational guarantee — together they answer how reform turns from slogan into functioning mechanism.' },
        },
        {
          text: { zh: '只有开山炮重要，标语和用工制度都是附属品', en: 'Only the blast matters; slogan and work system are accessories' },
          correct: false,
          feedback: { zh: '以偏概全。炮声只是序幕，真正让蛇口改革持续运转的是效率观念的植入和用工制度的突破。没有标语和制度，炮声只是一次普通施工爆破，无法承载改革意义。', en: 'Overgeneralizes. The blast was just the opening; what kept Shekou reform running was the embedding of efficiency values and breakthroughs in work systems. Without the slogan and institutional changes, the blast was just ordinary construction, unable to carry reform significance.' },
        },
      ],
    },
    impactChoice: {
      question: {
        zh: '蛇口经验对整个深圳改革开放最重要的意义是什么？',
        en: 'What is the most significant impact of the Shekou experience on Shenzhen overall Reform and Opening?',
      },
      options: [
        {
          text: { zh: '它提供了"先试先行、用现场实验验证制度"的方法论，使深圳后续改革有可参照的起点和信心', en: 'It provided the methodology of trial first, verifying institutions through field experiments, giving Shenzhen reform a reference point and confidence' },
          correct: true,
          feedback: { zh: '判断准确。蛇口的价值远超一个工业区的成败，它用开山炮、效率标语、外向码头和合同制用工证明了改革可以在局部先行试验、取得经验后再推广。这套方法论成为整个深圳乃至全国改革开放的操作范本。', en: 'Correct. Shekou value far exceeds one industrial zone success or failure. Through the blast, efficiency slogan, outward dock, and contract-based employment, it proved reform could be tested locally first, then scaled after gaining experience. This methodology became the operational template for all of Shenzhen and even national Reform and Opening.' },
        },
        {
          text: { zh: '蛇口只贡献了一个口号，没有实际的制度价值', en: 'Shekou only contributed a slogan, with no real institutional value' },
          correct: false,
          feedback: { zh: '严重低估了蛇口。标语只是最显眼的符号，蛇口真正的制度贡献是打破铁饭碗、实行合同制与浮动工资、建立外向型港口经济——这些才是影响深远的改革实践，远超一句口号。', en: 'Seriously underestimates Shekou. The slogan is just the most visible symbol; Shekou real institutional contributions were ending the iron rice bowl, implementing contracts and floating wages, and building an export-oriented port economy — these are the far-reaching reform practices, far beyond a catchphrase.' },
        },
        {
          text: { zh: '蛇口经验只适用于工业区，与深圳城市改革无关', en: 'Shekou experience only applies to industrial zones, unrelated to Shenzhen urban reform' },
          correct: false,
          feedback: { zh: '忽略了蛇口的辐射效应。蛇口的用工制度、效率观念和外向型经济模式很快从工业区扩散到整个深圳经济特区，成为特区建设的底层方法论。蛇口是深圳改革的试验田，而非孤立案例。', en: 'Ignores Shekou spillover effect. Shekou work system, efficiency values, and export-oriented model quickly spread from the industrial zone to the entire Shenzhen SEZ, becoming the foundational methodology for special zone development. Shekou was a testing ground for Shenzhen reform, not an isolated case.' },
        },
      ],
    },
    finalChoice: {
      question: {
        zh: '如果把蛇口写入今天的大湾区叙事，应强调什么？',
        en: 'If Shekou is written into today Bay Area narrative, what should be emphasized?',
      },
      options: [
        {
          text: { zh: '改革需要敢闯的现场，也需要能复制的制度经验', en: 'Reform needs a daring field site and repeatable institutional experience' },
          correct: true,
          feedback: {
            zh: '记入案卷。蛇口的意义，是把“敢为天下先”做成了可被学习的城市方法。',
            en: 'Enter that into the record. Shekou turned daring to be first into a city method others could learn.',
          },
        },
        {
          text: { zh: '它只是深圳早期一个普通施工项目', en: 'It was only an ordinary early construction project in Shenzhen' },
          correct: false,
          feedback: {
            zh: '太低估了。蛇口不是普通工地，而是改革开放早期最重要的制度现场之一。',
            en: 'That underestimates it. Shekou was not an ordinary worksite, but one of the key institutional sites of early Reform and Opening.',
          },
        },
      ],
    },
    closing: {
      zh: '很好。把蛇口封入案卷：一声开山炮，炸开的不只是山石，也是一个时代的制度想象。',
      en: 'Good. Seal Shekou into the case file: one blast opened not only rock, but an era of institutional imagination.',
    },
    completion: {
      title: { zh: '本幕完成', en: 'Scene Complete' },
      insight: {
        zh: '你已理解：蛇口工业区的历史价值在于用实干和试验，把改革开放从口号变成可运行的现场机制。',
        en: 'You now understand: Shekou made Reform and Opening operational through action, experimentation, and working site mechanisms.',
      },
    },
    reward: { badge: '🏗️', badgeName: { zh: '改革先声印', en: 'Seal of the Reform Pioneer' }, insight: { zh: '改革开放的第一声炮响，自蛇口炸响。“时间就是金钱”六个字，炸开了一个时代。', en: 'The first cannon of Reform fired at Shekou. Six words blasted open an era.' } },
  }),

  'N-SC03': makeNearbyRpgEpisode({
    characters: [
      { name: { zh: '汪滔', en: 'Frank Wang' }, role: { zh: '大疆创始人', en: 'DJI Founder' }, portrait: './public/assets/episodes/dji/npc-cutout.jpg?v=rpg-assets-fix-2' },
    ],
    intro: {
      zh: '你来到大疆天空之城的研发现场。玻璃塔楼之间，无人机从试飞区掠过。这里的故事不是“会飞的玩具”，而是飞控、云台、供应链与工程偏执共同构成的产品系统。',
      en: 'You enter the R&D site of DJI Sky City. Drones pass through the test area between glass towers. This is not a story of flying toys, but of flight control, gimbals, supply chains, and engineering obsession.',
    },
    background: './public/assets/episodes/dji/stage-bg.jpg',
    sceneName: { zh: '大疆天空之城 · 飞控实验室', en: 'DJI Sky City · Flight Control Lab' },
    subtitle: { zh: '科学星火 · 大疆天空之城', en: 'Scientific Spark · DJI Sky City' },
    chapterTitle: { zh: '让机器稳定飞行', en: 'Making Machines Fly Steadily' },
    objective: {
      zh: '调查飞控板、云台、供应链、试飞路线，判断大疆如何把无人机变成大众工具',
      en: 'Survey the flight board, gimbal, supply chain, and test flight route to judge how DJI turned drones into everyday tools',
    },
    objectiveDone: {
      zh: '任务完成：你已理解大疆的护城河来自硬件、算法与供应链的系统协同',
      en: 'Objective complete: you understand DJI moat as a system of hardware, algorithms, and supply-chain coordination',
    },
    chapters: [
      { zh: '序章', en: 'Prologue' },
      { zh: '踏勘', en: 'Survey' },
      { zh: '飞控', en: 'Flight' },
      { zh: '判断', en: 'Judgment' },
      { zh: '完成', en: 'Complete' },
    ],
    clues: [
      {
        id: 'flight-control',
        x: 38,
        y: 55,
        title: { zh: '检查飞控板', en: 'Check the Flight Board' },
        label: { zh: '飞控', en: 'Flight' },
          text: {
            zh: '稳定飞行不靠"会转的桨"，而是IMU陀螺仪、加速度计与飞控算法在毫秒级持续修正姿态。大疆2006年自研飞控系统，使多旋翼从遥控模型跨越到可自主悬停的智能平台。',
            en: 'Stable flight relies not on spinning propellers, but on IMU gyroscopes, accelerometers, and flight-control algorithms correcting posture every millisecond. DJI self-developed its flight control system in 2006, moving multirotors from remote-control models to intelligent platforms with autonomous hover and precise positioning.',
          },
        npcFeedback: {
          zh: '对。飞控是无人机从遥控模型变成智能工具的关键。',
          en: 'Yes. Flight control is what turned drones from remote-control models into smart tools.',
        },
      },
      {
        id: 'gimbal',
        x: 64,
        y: 58,
        title: { zh: '校准云台', en: 'Calibrate the Gimbal' },
        label: { zh: '云台', en: 'Gimbal' },
          text: {
            zh: '三轴机械云台以无刷电机实现毫秒级增稳补偿，让普通人在飞行中获得电影级画面。云台不是配件，而是把飞行能力转化为影像生产力的关键桥梁，大疆由此打开航拍消费市场。',
            en: 'The three-axis mechanical gimbal uses brushless motors for millisecond-level stabilization, giving ordinary people cinema-quality aerial footage. The gimbal is not an accessory but the crucial bridge turning flight capability into imaging productivity, opening the consumer aerial photography market for DJI.',
          },
        npcFeedback: {
          zh: '很好。真正的产品力，常藏在用户不会主动注意的稳定细节里。',
          en: 'Good. Real product power often hides in stable details users do not actively notice.',
        },
      },
      {
        id: 'supply-chain',
        x: 24,
        y: 66,
        title: { zh: '追踪零件', en: 'Trace the Parts' },
        label: { zh: '供应链', en: 'Supply' },
          text: {
            zh: '深圳华强北及周边电子供应链让试错周期从数月压缩到数天。PCB打样、元器件采购、模具开注到小批量试产可在方圆十公里内快速循环，这种产业密度是大疆速度的底层优势。',
            en: 'Shenzhen Huaqiangbei and surrounding electronics supply chains compressed trial cycles from months to days. PCB prototyping, component sourcing, mold making, and small-batch production could loop within a ten-kilometer radius — an industrial density that is DJI speed unrepeatable underlying advantage.',
          },
        npcFeedback: {
          zh: '记下。大疆的速度不是孤立天才，而是城市产业网络在协同。',
          en: 'Record that. DJI speed is not isolated genius, but the city industrial network working together.',
        },
      },
      {
        id: 'test-flight',
        x: 72,
        y: 30,
        title: { zh: '观察试飞路线', en: 'Watch the Test Route' },
        label: { zh: '试飞', en: 'Testing' },
          text: {
            zh: '每一次试飞都在验证可靠性：抗风等级、续航极限、避障精度与自动返航逻辑。大疆产品在上市前需经历数千小时环境测试，这是走向全球100多个国家市场前必须经受的考验。',
            en: 'Every test flight verifies reliability: wind resistance class, endurance limits, obstacle avoidance precision, and auto-return logic. DJI products undergo thousands of hours of environmental testing before launch — trials they must pass before reaching over 100 country markets worldwide.',
          },
        npcFeedback: {
          zh: '没错。飞得起来只是开始，飞得稳、拍得准、用得放心才是产品。',
          en: 'Exactly. Taking off is only the start; a product must fly steadily, shoot accurately, and feel trustworthy.',
        },
      },
    ],
    start: {
      zh: '别只看它飞得高。真正要调查的是：什么系统让一台小机器稳定、可靠，并能被全世界普通人使用。',
      en: 'Do not only watch how high it flies. Investigate the system that makes a small machine stable, reliable, and usable by ordinary people worldwide.',
    },
    playerNote: {
      zh: '我会记录飞控、云台、供应链和试飞四条线索，判断大疆为何能重新定义无人机。',
      en: 'I will record four clues: flight control, gimbal, supply chain, and test flight, then judge why DJI redefined drones.',
    },
    survey: {
      zh: '先踏勘四处：飞控板、云台、供应链、试飞路线。线索齐了，再判断大疆的护城河。',
      en: 'Survey four points: flight board, gimbal, supply chain, and test route. Then judge DJI moat.',
    },
    judge: {
      question: {
        zh: '大疆最关键的护城河是什么？',
        en: 'What is DJI most important moat?',
      },
      options: [
        {
          text: { zh: '飞控算法、稳定影像、供应链迭代组成的产品系统', en: 'A product system of flight algorithms, stable imaging, and supply-chain iteration' },
          correct: true,
          feedback: {
            zh: '判断准确。大疆赢在系统能力：不是单点技术，而是把硬件、算法、影像和制造一起做到极致。',
            en: 'Correct. DJI wins through system capability: not one technology, but hardware, algorithms, imaging, and manufacturing refined together.',
          },
        },
        {
          text: { zh: '主要靠营销，把普通遥控飞机包装成高科技', en: 'Mainly marketing ordinary remote-control aircraft as high tech' },
          correct: false,
          feedback: {
            zh: '不对。大疆的增长靠的是产品体验本身：稳定、易用、可靠，才让市场自然扩散。',
            en: 'No. DJI growth came from product experience itself: stability, usability, and reliability spread the market.',
          },
        },
        {
          text: { zh: '只靠低价代工，技术并不重要', en: 'Only low-cost manufacturing; technology does not matter' },
          correct: false,
          feedback: {
            zh: '这正相反。大疆拒绝只做低价竞争，真正壁垒是飞控、云台和工程迭代。',
            en: 'The opposite. DJI did not rely on cheap competition; its barriers are flight control, gimbals, and engineering iteration.',
          },
        },
      ],
    },
    reflection: {
      zh: '大疆把“天空视角”从少数专业机构手里释放出来，这是一种技术民主化，也是一座城市产业链能力的证明。',
      en: 'DJI released aerial viewpoints from a few professional institutions. That is technological democratization and proof of a city industrial chain.',
    },
    synthesisChoice: {
      question: {
        zh: '飞控板、云台、供应链与试飞路线四条线索，如何共同解释大疆为什么能从深圳走向全球？',
        en: 'How do flight control, gimbal, supply chain, and test flight routes together explain why DJI went global from Shenzhen?',
      },
      options: [
        {
          text: { zh: '飞控算法构筑核心壁垒，云台实现稳定影像，供应链保障快速迭代，试飞路线验证产品可靠性——四者形成从研发到量产的完整闭环', en: 'Flight control algorithms build the core barrier, gimbals deliver stable imaging, the supply chain enables rapid iteration, and test routes verify reliability — together forming a complete loop from R&D to mass production' },
          correct: true,
          feedback: { zh: '判断准确。大疆的全球竞争力并非来自单一技术突破，而是飞控算法的毫秒级姿态修正、三轴云台的机械稳定、华强北周边供应链的快速打样与试飞路线的真实场景验证环环相扣。缺少任何一环，无人机都无法从实验室原型变成普通人可以信赖的大众产品。', en: 'Correct. DJI global competitiveness comes not from a single technology, but from the interlocking chain of millisecond-level flight control, three-axis gimbal stabilization, rapid prototyping via Huaqiangbei supply chains, and real-world test flight validation. Without any link, drones could not move from lab prototype to a trusted consumer product.' },
        },
        {
          text: { zh: '只要飞控技术好就够了，云台、供应链和试飞都不重要', en: 'Only flight control matters; gimbal, supply chain, and test flights are irrelevant' },
          correct: false,
          feedback: { zh: '以偏概全。飞控只是让机器能飞，但如果没有云台稳定镜头、供应链快速迭代降本、试飞路线验证真实场景可靠性，产品无法走向大众市场。大疆的成功恰恰在于四个环节的系统协同，而非单点技术优势。', en: 'Overgeneralizes. Flight control only makes the machine fly; without gimbals stabilizing cameras, supply chains driving iteration and cost reduction, and test routes verifying real-world reliability, the product could not reach the mass market. DJI success lies in systemic synergy across all four links, not single-point advantage.' },
        },
        {
          text: { zh: '四条线索各自独立运作，彼此之间没有关联', en: 'The four clues operate independently with no connection between them' },
          correct: false,
          feedback: { zh: '割裂了内在逻辑。飞控算法的迭代依赖试飞路线反馈的真实数据，云台设计受飞控姿态参数约束，供应链的元器件选型直接影响飞控和云台的协同性能。四者紧密耦合，共同构成产品系统的核心竞争力。', en: 'Fragments the internal logic. Flight control iteration depends on real data from test routes, gimbal design is constrained by flight control posture parameters, and supply chain component selection directly affects the synergy between flight control and gimbal. The four are tightly coupled, forming the core competitiveness of the product system.' },
        },
      ],
    },
    impactChoice: {
      question: {
        zh: '大疆模式对深圳硬件创新生态最重要的启示是什么？',
        en: 'What is the most important inspiration of the DJI model for Shenzhen hardware innovation ecosystem?',
      },
      options: [
        {
          text: { zh: '深度整合算法、硬件与供应链，把复杂技术做成普通人可用的大众产品，而非停留在实验室原型', en: 'Deeply integrate algorithms, hardware, and supply chains to turn complex technology into consumer products, not just lab prototypes' },
          correct: true,
          feedback: { zh: '判断准确。大疆给深圳硬件生态的最大启示是：真正的创新壁垒不是单一技术，而是把飞控算法、精密机械、供应链迭代和场景验证整合为可量产、可信赖的产品系统。这种从研发到量产的完整闭环能力，正是深圳从制造基地走向创新策源地的关键路径。', en: 'Correct. DJI greatest inspiration for Shenzhen hardware ecosystem is that the real innovation barrier is not a single technology, but the integration of flight control algorithms, precision mechanics, supply chain iteration, and scenario validation into a mass-producible, trustworthy product system. This complete R&D-to-production loop is the key path for Shenzhen to evolve from manufacturing base to innovation source.' },
        },
        {
          text: { zh: '只要做硬件就能成功，不需要长期技术积累', en: 'Hardware alone guarantees success; no long-term technology accumulation is needed' },
          correct: false,
          feedback: { zh: '严重误读。大疆从2006年自研飞控到2013年推出精灵系列，其间经历了七年的算法迭代和工程积累。深圳硬件创业的门槛不在开模打样，而在能否像大疆一样在核心技术上长期投入，把供应链速度转化为产品迭代速度而非价格战。', en: 'Serious misreading. DJI spent seven years from self-developing flight control in 2006 to launching the Phantom series in 2013, with continuous algorithm iteration and engineering accumulation. The barrier for Shenzhen hardware startups is not molding and prototyping, but whether one can invest long-term in core technology like DJI, turning supply chain speed into product iteration speed rather than price wars.' },
        },
        {
          text: { zh: '深圳硬件创新只能靠低价代工，无法做高端品牌', en: 'Shenzhen hardware innovation can only rely on low-cost OEM, unable to build premium brands' },
          correct: false,
          feedback: { zh: '恰恰相反。大疆正是从深圳出发，用飞控算法和产品体验建立了全球高端品牌，占据消费级无人机七成以上市场份额。它证明深圳的供应链优势完全可以支撑技术密集型高端产品，关键在于是否有将技术做深做透的工程偏执和产品主义。', en: 'The opposite. DJI started from Shenzhen and built a global premium brand through flight control algorithms and product experience, capturing over 70% of the consumer drone market. It proves Shenzhen supply chain advantages can fully support technology-intensive premium products — the key is whether one has the engineering obsession and product-first discipline to deepen technology.' },
        },
      ],
    },
    finalChoice: {
      question: {
        zh: '为什么大疆属于深圳创新叙事的关键锚点？',
        en: 'Why is DJI a key anchor in Shenzhen innovation story?',
      },
      options: [
        {
          text: { zh: '它把硬件供应链与工程算法结合，让小众技术成为全球产品', en: 'It combines hardware supply chains and engineering algorithms, turning niche technology into a global product' },
          correct: true,
          feedback: {
            zh: '记入案卷。大疆证明深圳创新不是单纯“快”，而是能把复杂系统做成普通人愿意使用的产品。',
            en: 'Enter that into the record. DJI proves Shenzhen innovation is not only fast, but able to turn complex systems into products ordinary people use.',
          },
        },
        {
          text: { zh: '因为无人机看起来很酷，适合拍照打卡', en: 'Because drones look cool and are good for photo check-ins' },
          correct: false,
          feedback: {
            zh: '这只看到表层。大疆的关键是技术系统、产业网络和全球产品能力。',
            en: 'That only sees the surface. DJI key lies in technical systems, industrial networks, and global product capability.',
          },
        },
      ],
    },
    closing: {
      zh: '很好。把大疆封入案卷：从一块飞控板到全球天空，它展示了深圳制造如何升级为深圳创造。',
      en: 'Good. Seal DJI into the case file: from one flight board to the global sky, it shows how Shenzhen manufacturing became Shenzhen creation.',
    },
    completion: {
      title: { zh: '本幕完成', en: 'Scene Complete' },
      insight: {
        zh: '你已理解：大疆的故事不只是无人机，而是飞控算法、影像稳定、供应链迭代和产品主义共同形成的全球创新样本。',
        en: 'You now understand: DJI is not only about drones, but a global innovation case formed by flight algorithms, stable imaging, supply-chain iteration, and product-first discipline.',
      },
    },
    reward: { badge: '🛸', badgeName: { zh: '天空之主印', en: 'Seal of the Sky Master' }, insight: { zh: '从宿舍焊台到统治全球天空，大疆证明：最好的创业，是把一个“疯狂”的想法做到极致，然后让世界追赶你。', en: 'From dorm soldering to ruling global skies, DJI proves: the best startup is taking a wild idea to the extreme, then letting the world chase you.' } },
  }),

  M01: makeNearbyRpgEpisode({
    characters: [
      { name: { zh: '郑和', en: 'Zheng He' }, role: { zh: '大明宝船统帅', en: 'Admiral of the Treasure Fleet' }, portrait: './public/assets/episodes/chiwan/npc-cutout.jpg?v=rpg-assets-fix-2' },
    ],
    intro: {
      zh: '永乐三年，你随郑和船队抵达赤湾。出航前夜，海风穿过天后宫，香火、海图、锚地与贡品把一次远航的秩序连在一起。',
      en: 'In the third year of Yongle, you arrive at Chiwan with Zheng He fleet. On the eve of departure, sea wind moves through the Tianhou Temple, linking incense, charts, anchorage, and tribute into the order of a voyage.',
    },
    background: './public/assets/episodes/chiwan/stage-bg.jpg',
    sceneName: { zh: '赤湾天后宫 · 出海前夜', en: 'Chiwan Tianhou Temple · Eve of Departure' },
    subtitle: { zh: '航海贸易 · 赤湾天后宫', en: 'Maritime Trade · Chiwan Tianhou Temple' },
    chapterTitle: { zh: '宝船启航前的祈愿', en: 'Before the Treasure Fleet Sails' },
    objective: {
      zh: '调查香火、海图、锚地、贡品，判断赤湾如何连接海洋信仰与郑和远航',
      en: 'Survey incense, charts, anchorage, and tribute to judge how Chiwan connected maritime belief with Zheng He voyages',
    },
    objectiveDone: {
      zh: '任务完成：你已理解赤湾是远航秩序、海洋信仰与和平贸易的交汇点',
      en: 'Objective complete: you understand Chiwan as a meeting point of voyage order, maritime belief, and peaceful trade',
    },
    chapters: [
      { zh: '序章', en: 'Prologue' },
      { zh: '踏勘', en: 'Survey' },
      { zh: '远航', en: 'Voyage' },
      { zh: '判断', en: 'Judgment' },
      { zh: '完成', en: 'Complete' },
    ],
    clues: [
      {
        id: 'incense',
        x: 72,
        y: 51,
        title: { zh: '观察香火', en: 'Observe the Incense' },
        label: { zh: '香火', en: 'Incense' },
          text: {
            zh: '赤湾天后宫始建于宋，明永乐年间由郑和副使张庆重修。天后信仰为跨海船队提供出发前的精神安定，远航之前统领与水手在此祭拜祈安，信念是远航组织风险管理系统的一部分。',
            en: 'Chiwan Tianhou Temple was first built in the Song dynasty and rebuilt in the Yongle reign by Zheng He deputy Zhang Qing. Tianhou belief steadied fleet commanders and sailors before departure — faith was part of the risk-management system for long-distance voyages.',
          },
        npcFeedback: {
          zh: '记下。海上远航不只靠技术，也靠共同信念维持秩序。',
          en: 'Record that. Long voyages need not only technology, but shared belief to maintain order.',
        },
      },
      {
        id: 'chart',
        x: 60,
        y: 68,
        title: { zh: '摊开海图', en: 'Unroll the Sea Chart' },
        label: { zh: '海图', en: 'Chart' },
          text: {
            zh: '《郑和航海图》记录自南京至东非的季风航线、港口与补给点，是世界上现存最早的远洋航海图集。海图将风向规律与外交路线写成可执行的航行方案，是严密的组织工程。',
            en: 'The Zheng He Navigation Charts recorded monsoon routes, ports, and supply points from Nanjing to East Africa — the earliest surviving ocean-going atlas in the world. The charts turned wind patterns, fresh water supply, and diplomatic routes into executable navigation plans, representing rigorous organizational engineering.',
          },
        npcFeedback: {
          zh: '很好。大航海不是冒险冲动，而是严密的组织工程。',
          en: 'Good. Great voyages were not impulsive adventures, but rigorous organizational engineering.',
        },
      },
      {
        id: 'anchorage',
        x: 26,
        y: 56,
        title: { zh: '查看锚地', en: 'Inspect the Anchorage' },
        label: { zh: '锚地', en: 'Anchorage' },
          text: {
            zh: '赤湾扼珠江口东岸，北接虎门水道，南连南海主航线。郑和七下西洋中，船队曾在此修整、补给淡水与集结编队，赤湾由此成为面向外洋的关键出发节点与返航停靠港。',
            en: 'Chiwan commands the eastern shore of the Pearl River estuary, connecting northward to the Humen waterway and southward to South China Sea main routes. During Zheng He seven voyages, fleets rested here, replenished fresh water, and assembled formations, making Chiwan a key departure node and return harbor facing the open ocean.',
          },
        npcFeedback: {
          zh: '对。锚地不是停顿，而是把地方海湾接入世界航线。',
          en: 'Yes. An anchorage is not a pause; it connects a local bay to world routes.',
        },
      },
      {
        id: 'tribute',
        x: 45,
        y: 41,
        title: { zh: '清点贡品', en: 'Check the Gifts' },
        label: { zh: '贡品', en: 'Gifts' },
          text: {
            zh: '郑和船队携带青花瓷、丝绸、茶叶与铜器，以朝贡贸易与亚非三十余国交往。货物承载的不是军事征服，而是和平贸易、礼仪往来与文明互鉴，构筑了十五世纪印度洋的网络秩序。',
            en: 'Zheng He fleets carried blue-and-white porcelain, silk, tea, and bronze wares, engaging over thirty Afro-Asian states through tribute trade. These goods carried not military conquest, but peaceful commerce, ritual exchange, and civilizational dialogue, constructing a networked order across the fifteenth-century Indian Ocean.',
          },
        npcFeedback: {
          zh: '正是。郑和远航的底色，是和平贸易与互相认识。',
          en: 'Exactly. The foundation of Zheng He voyages was peaceful trade and mutual recognition.',
        },
      },
    ],
    start: {
      zh: '宝船将启，先别急着上船。看懂赤湾，才能看懂远航之前需要怎样的信仰、补给、航线与礼制。',
      en: 'The treasure ships are about to sail, but do not board too quickly. To understand Chiwan is to understand the belief, supply, routes, and ritual needed before departure.',
    },
    playerNote: {
      zh: '我会记录香火、海图、锚地和贡品四条线索，判断赤湾为何能承接郑和远航的出海秩序。',
      en: 'I will record four clues: incense, chart, anchorage, and gifts, then judge why Chiwan could support the order of Zheng He voyage.',
    },
    survey: {
      zh: '先踏勘四处：香火、海图、锚地、贡品。线索齐了，再判断这座海边庙宇的真正意义。',
      en: 'Survey four points: incense, chart, anchorage, and gifts. With all clues, judge the true meaning of this seaside temple.',
    },
    judge: {
      question: {
        zh: '郑和船队出航前为何重视赤湾与天后信仰？',
        en: 'Why did Zheng He fleet value Chiwan and Tianhou belief before departure?',
      },
      options: [
        {
          text: { zh: '远航需要航线、补给、秩序与共同信念共同支撑', en: 'Long voyages needed routes, supplies, order, and shared belief together' },
          correct: true,
          feedback: {
            zh: '判断准确。赤湾把海洋信仰、锚地功能和远航组织连接起来。',
            en: 'Correct. Chiwan linked maritime belief, anchorage function, and voyage organization.',
          },
        },
        {
          text: { zh: '只是出发前举行一次热闹仪式', en: 'It was only a lively ritual before departure' },
          correct: false,
          feedback: {
            zh: '不止如此。仪式背后，是远洋航行对风险、秩序与共同信念的管理。',
            en: 'More than that. Behind the ritual was management of risk, order, and shared belief for ocean travel.',
          },
        },
        {
          text: { zh: '因为船队主要目的就是征服沿途国家', en: 'Because the fleet main purpose was conquering states along the route' },
          correct: false,
          feedback: {
            zh: '不对。郑和远航以和平贸易、礼仪往来和文明互访为主要特征。',
            en: 'No. Zheng He voyages were mainly marked by peaceful trade, ritual exchange, and civilizational visits.',
          },
        },
      ],
    },
    reflection: {
      zh: '赤湾的海风里同时有香火、潮声和世界航线。它让湾区海洋文明不是抽象概念，而是可以起锚的现场。',
      en: 'Chiwan sea wind carries incense, tides, and world routes at once. It makes Bay Area maritime civilization a place where ships can truly weigh anchor.',
    },
    synthesisChoice: {
      question: {
        zh: '香火、海图、锚地与贡品四条线索，如何共同构成赤湾的古代远洋体系？',
        en: 'How do incense, charts, anchorage, and tribute together form Chiwan\'s ancient ocean-going system?',
      },
      options: [
        {
          text: { zh: '香火提供远航信念与精神秩序，海图规划航线与补给节点，锚地保障船队停泊编队，贡品定义外交贸易目的——四者共同支撑和平远航的组织体系', en: 'Incense provides belief and spiritual order for voyages, charts plan routes and supply points, anchorage supports fleet mooring and formation, and tribute defines diplomatic trade purposes — together they sustain the organizational system of peaceful voyages' },
          correct: true,
          feedback: { zh: '判断准确。赤湾的远洋体系并非单点功能，而是一套精密的组织工程：天后宫的香火为跨海船队提供出发前的精神安定与集体信念；《郑和航海图》将季风规律写成可执行的航行方案；赤湾锚地让庞大船队得以集结、补给、编队；贡品贸易则为整个远航提供了外交框架和经济动力。四者缺一不可。', en: 'Correct. Chiwan ocean-going system was not a single-point function but a precise organizational engineering project: Tianhou Temple incense provided spiritual steadiness and collective belief before departure; Zheng He Navigation Charts turned monsoon patterns into executable plans; Chiwan anchorage allowed the massive fleet to assemble, resupply, and form up; and tribute trade provided the diplomatic framework and economic motive. None can be omitted.' },
        },
        {
          text: { zh: '只有海图重要，香火和锚地只是仪式性的附属品', en: 'Only charts matter; incense and anchorage are merely ceremonial accessories' },
          correct: false,
          feedback: { zh: '低估了远洋航行的复杂性。在古代远航中没有GPS和现代通讯，天后信仰是维持船队士气与集体秩序的心理基础设施；锚地则是数万人船队出发前集结、编队和补给的物理前提。没有信念和锚地，再好的海图也无法让船队真正起航。', en: 'Underestimates the complexity of ancient ocean voyages. Without GPS or modern communications, Tianhou belief was the psychological infrastructure sustaining fleet morale and collective order; anchorage was the physical prerequisite for assembling, forming, and resupplying a fleet of tens of thousands. Without belief and anchorage, even the best charts could not launch a fleet.' },
        },
        {
          text: { zh: '四条线索只是碰巧在同一地点，彼此没有系统性关联', en: 'The four clues merely happen to be at the same location with no systemic connection' },
          correct: false,
          feedback: { zh: '割裂了赤湾作为远洋起点的整体逻辑。赤湾之所以被选为远航前的重要站点，正是因为它同时具备信仰中心（天后宫）、航海知识（海图传承）、深水锚地和贸易口岸四重功能。这四者并非偶然聚合，而是古代远洋组织对起航地的系统性选择。', en: 'Fragments the holistic logic of Chiwan as an ocean-going departure point. Chiwan was chosen as a key pre-voyage station precisely because it simultaneously offered a belief center (Tianhou Temple), navigational knowledge (chart heritage), deep-water anchorage, and trade port. These four were not a chance gathering but a systemic selection by ancient ocean-going organizations.' },
        },
      ],
    },
    impactChoice: {
      question: {
        zh: '赤湾作为海上丝绸之路起点的历史意义，对今天大湾区建设最重要的启示是什么？',
        en: 'What is the most important inspiration of Chiwan\'s historical role as a Maritime Silk Road starting point for today\'s Bay Area development?',
      },
      options: [
        {
          text: { zh: '开放贸易需要航线规划、港口基础设施、文化信任与和平秩序的共同支撑，而非单一维度的扩张', en: 'Open trade requires route planning, port infrastructure, cultural trust, and peaceful order together, not single-dimensional expansion' },
          correct: true,
          feedback: { zh: '判断准确。赤湾的历史告诉今天的大湾区：真正的国际航运中心和贸易枢纽不是只靠港口吞吐量，而是需要航海技术、基础设施、文化信任和和平秩序的系统支撑。郑和远航的厚往薄来、协和万邦精神，对今天大湾区在全球化逆流中坚持开放合作、文明互鉴具有深远的镜鉴价值。', en: 'Correct. Chiwan history tells today Bay Area: a true international shipping center and trade hub depends not only on port throughput, but on systemic support from navigation technology, infrastructure, cultural trust, and peaceful order. Zheng He ethos of generous giving and harmonious relations offers profound reference for today Bay Area to uphold openness and mutual learning amid globalization headwinds.' },
        },
        {
          text: { zh: '古代远航经验对现代社会毫无参考价值，可以完全忽略', en: 'Ancient voyage experience has zero reference value for modern society and can be completely ignored' },
          correct: false,
          feedback: { zh: '过于武断。虽然技术手段已天翻地覆，但赤湾承载的远洋组织智慧——如何在长距离跨文化贸易中建立信任、管理风险、维持秩序——仍然是今天大湾区参与全球贸易和一带一路建设需要面对的核心命题。历史不是技术手册，而是战略思维的参照系。', en: 'Too categorical. While technology has transformed beyond recognition, the ocean-going organizational wisdom Chiwan carried — how to build trust, manage risk, and maintain order in long-distance cross-cultural trade — remains a core proposition for today Bay Area in global trade and Belt and Road construction. History is not a technical manual but a reference for strategic thinking.' },
        },
        {
          text: { zh: '只要建好港口设施，就自然能成为国际航运中心', en: 'Building port facilities alone naturally makes a place an international shipping center' },
          correct: false,
          feedback: { zh: '过于简化。赤湾之所以成为远航起点，不只因为有深水锚地，更因为有天后信仰凝聚的远航共识、航海图积累的航线知识以及朝贡体系提供的外交贸易框架。今天的大湾区要建设国际航运中心，同样需要在硬件之外构建规则衔接、文化互信和制度开放，而非只造码头。', en: 'Overly simplistic. Chiwan became a voyage departure point not only because of deep-water anchorage, but because of the远航 consensus凝聚 by Tianhou belief, route knowledge accumulated in navigation charts, and the diplomatic-trade framework of the tribute system. Today Bay Area must similarly build rule connection, cultural trust, and institutional openness alongside hardware — not just build docks.' },
        },
      ],
    },
    finalChoice: {
      question: {
        zh: '赤湾故事如何回应今天的大湾区海洋叙事？',
        en: 'How does the Chiwan story speak to today Bay Area maritime narrative?',
      },
      options: [
        {
          text: { zh: '开放需要贸易能力，也需要尊重海洋与彼此的信任', en: 'Openness needs trade capacity, respect for the sea, and mutual trust' },
          correct: true,
          feedback: {
            zh: '记入案卷。赤湾让和平远航、海洋信仰与开放精神在同一处汇合。',
            en: 'Enter that into the record. Chiwan brings peaceful voyages, maritime belief, and openness together.',
          },
        },
        {
          text: { zh: '海洋贸易只关乎货物吞吐量，与文化无关', en: 'Maritime trade is only about cargo throughput and has nothing to do with culture' },
          correct: false,
          feedback: {
            zh: '太窄了。海洋贸易从来同时携带货物、信仰、礼仪与文明想象。',
            en: 'Too narrow. Maritime trade has always carried goods, belief, ritual, and civilizational imagination together.',
          },
        },
      ],
    },
    closing: {
      zh: '很好。把赤湾封入案卷：这里不是一座孤立庙宇，而是一条和平远航的精神锚点。',
      en: 'Good. Seal Chiwan into the case file: it is not an isolated temple, but a spiritual anchor for peaceful voyages.',
    },
    completion: {
      title: { zh: '本幕完成', en: 'Scene Complete' },
      insight: {
        zh: '你已理解：赤湾天后宫连接海洋信仰、出海秩序与郑和远航，是湾区和平贸易叙事的重要起点。',
        en: 'You now understand: Chiwan Tianhou Temple connects maritime belief, voyage order, and Zheng He voyages as an important starting point of the Bay Area peaceful trade story.',
      },
    },
    reward: { badge: '⚓', badgeIcon: 'treasure-fleet', badgeName: { zh: '和平远航印', en: 'Seal of the Peaceful Voyage' }, insight: { zh: '郑和七下西洋，以和平贸易连接四海。赤湾的锚地，正是中华海洋文明“厚往薄来、协和万邦”精神的起点。', en: 'Zheng He seven voyages connected the seas through peaceful trade. Chiwan is the origin of China maritime ethos.' } },
  }),

  M07: makeNearbyRpgEpisode({
    characters: [
      { name: { zh: '湿地守护者', en: 'Wetland Guardian' }, role: { zh: '红树林生态讲述人', en: 'Mangrove Ecology Guide' }, portrait: './public/assets/episodes/mangrove/npc-cutout.jpg?v=rpg-assets-fix-2' },
    ],
    intro: {
      zh: '2023年冬，你是深圳湾红树林自然保护区的巡护员。傍晚退潮，黑脸琵鹭在滩涂上觅食——这种全球濒危水鸟仅存约六千只，深圳湾是它们最重要的越冬地之一。你巡护的红树林根系固岸消浪、留泥净水。远处是福田口岸和城市天际线，高楼、口岸、湿地和海面近在咫尺。这里是东亚-澳大利西亚迁飞路线的重要中转站。',
      en: 'Winter 2023. You are a patrol ranger at the Shenzhen Bay Mangrove Nature Reserve. At dusk the tide recedes; black-faced spoonbills feed on the mudflat — this globally endangered bird numbers only about 6,000, and Shenzhen Bay is one of their key wintering grounds. The mangrove roots you patrol hold the shore, calm waves, trap sediment, and filter water. Futian Port and the city skyline rise nearby: towers, checkpoint, wetland, and sea side by side. This is a major stop on the East Asian-Australasian Flyway.',
    },
    background: './public/assets/episodes/mangrove/stage-bg.jpg',
    sceneName: { zh: '深圳湾红树林 · 候鸟驿站', en: 'Shenzhen Bay Mangroves · Bird Stopover' },
    subtitle: { zh: '航海贸易 · 深圳河与红树林', en: 'Maritime Trade · Shenzhen River and Mangroves' },
    chapterTitle: { zh: '给海湾留一片岸', en: 'Leaving a Shore for the Bay' },
    objective: {
      zh: '调查潮汐、根系、候鸟、城市边界，判断红树林为何是现代海湾文明的一部分',
      en: 'Survey tides, roots, birds, and the city edge to judge why mangroves are part of modern bay civilization',
    },
    objectiveDone: {
      zh: '任务完成：你已理解红树林是繁忙海湾中的生态屏障、候鸟驿站与城市边界',
      en: 'Objective complete: you understand mangroves as ecological barrier, bird stopover, and city edge in a busy bay',
    },
    chapters: [
      { zh: '序章', en: 'Prologue' },
      { zh: '踏勘', en: 'Survey' },
      { zh: '生态', en: 'Ecology' },
      { zh: '判断', en: 'Judgment' },
      { zh: '完成', en: 'Complete' },
    ],
    clues: [
      {
        id: 'tide',
        x: 25,
        y: 63,
        title: { zh: '观察潮汐', en: 'Observe the Tide' },
        label: { zh: '潮汐', en: 'Tide' },
        text: {
          zh: '深圳湾每日两次潮汐带来营养盐与浮游生物，也带来城市排水与航运压力。潮间带咸淡水交汇、泥沙沉积，形成盐沼湿地，是红树林赖以生存的基础生态条件。',
          en: 'Twice-daily tides bring nutrients and plankton to Shenzhen Bay, along with urban drainage and shipping pressure. Brackish water mixing and sediment deposition form salt marsh wetlands in the intertidal zone — the foundation for mangrove survival and one of the most productive coastal ecosystems.',
        },
        npcFeedback: {
          zh: '很好。红树林理解的第一步，是把海湾看成流动系统。',
          en: 'Good. The first step to understanding mangroves is seeing the bay as a flowing system.',
        },
      },
      {
        id: 'roots',
        x: 48,
        y: 70,
        title: { zh: '查看根系', en: 'Inspect the Roots' },
        label: { zh: '根系', en: 'Roots' },
        text: {
          zh: '红树林支柱根与气生根网状固岸，消减风浪能量达70%，同时过滤陆源污染物。深圳湾368公顷红树林保护区虽是中国最小的国家级保护区，却是海岸最柔韧的天然基础设施。',
          en: 'Mangrove prop roots and pneumatophores stabilize shorelines, reducing wave energy by up to 70 percent and filtering land-based pollutants. The 368-hectare Shenzhen Bay reserve is China smallest national nature reserve, yet the most resilient natural infrastructure on the urban coastline.',
        },
        npcFeedback: {
          zh: '对。它看起来安静，却在替城市挡风浪、留泥沙、净水质。',
          en: 'Yes. It looks quiet, but it blocks waves, holds sediment, and filters water for the city.',
        },
      },
      {
        id: 'birds',
        x: 58,
        y: 32,
        title: { zh: '记录候鸟', en: 'Record Migrating Birds' },
        label: { zh: '候鸟', en: 'Birds' },
        text: {
          zh: '深圳湾是东亚-澳大利西亚候鸟迁飞路线的关键驿站，每年超10万只候鸟在此越冬。全球黑脸琵鹭约6000只，其中约五分之一在深圳湾度冬，城市岸线由此接入全球生态网络。',
          en: 'Shenzhen Bay is a key stopover on the East Asian-Australasian Flyway, with over 100,000 birds wintering here each year. The global black-faced spoonbill population is about 6,000, of which roughly one-fifth winters in Shenzhen Bay, connecting the urban shoreline to a global ecological network.',
        },
        npcFeedback: {
          zh: '记下。这里的“国际化”不只属于资本和航线，也属于迁徙生命。',
          en: 'Record that. International connection here belongs not only to capital and routes, but also to migrating life.',
        },
      },
      {
        id: 'city-edge',
        x: 76,
        y: 47,
        title: { zh: '比对城市边界', en: 'Compare the City Edge' },
        label: { zh: '城市', en: 'City' },
        text: {
          zh: '福田红树林保护区西邻CBD摩天楼，东隔深圳湾口岸与中国香港米埔湿地相望。高楼、口岸、湿地与海面在两公里内并置，提醒城市发展必须给生态留下可呼吸的边界。',
          en: 'Futian Mangrove Reserve borders the CBD skyline to the west and faces Hong Kong Mai Po wetlands across Shenzhen Bay checkpoint to the east. Towers, checkpoints, wetlands, and sea sit within two kilometers of each other, reminding urban development to leave breathing boundaries for ecology.',
        },
        npcFeedback: {
          zh: '准确。成熟的海湾不是把每寸岸线都变成开发强度。',
          en: 'Correct. A mature bay does not turn every inch of shore into development intensity.',
        },
      },
    ],
    start: {
      zh: '不要把红树林看成城市边角料。它是这座海湾的呼吸系统，也是贸易与生态之间的缓冲带。',
      en: 'Do not treat mangroves as leftover land. They are the breathing system of this bay and a buffer between trade and ecology.',
    },
    playerNote: {
      zh: '我会记录潮汐、根系、候鸟与城市边界四条线索，判断红树林为何属于海洋文明叙事。',
      en: 'I will record four clues: tide, roots, birds, and city edge, then judge why mangroves belong to the maritime civilization story.',
    },
    survey: {
      zh: '先踏勘四处：潮汐、根系、候鸟、城市边界。线索齐了，再判断红树林的城市价值。',
      en: 'Survey four points: tide, roots, birds, and city edge. With all clues, judge the urban value of mangroves.',
    },
    judge: {
      question: {
        zh: '红树林为什么不只是海边绿化带？',
        en: 'Why are mangroves more than waterfront greenery?',
      },
      options: [
        {
          text: { zh: '它既是候鸟驿站，也是固岸消浪、净化海湾的生态屏障', en: 'It is both a bird stopover and an ecological barrier that holds shores, calms waves, and cleans the bay' },
          correct: true,
          feedback: {
            zh: '判断准确。红树林不是装饰，而是海湾韧性的一部分。',
            en: 'Correct. Mangroves are not decoration, but part of bay resilience.',
          },
        },
        {
          text: { zh: '主要是为了让海边看起来更绿', en: 'Mainly to make the waterfront look greener' },
          correct: false,
          feedback: {
            zh: '太表面了。红树林承担的是生态屏障、迁徙节点和城市海岸缓冲功能。',
            en: 'Too superficial. Mangroves serve as ecological barrier, migration node, and urban coastal buffer.',
          },
        },
        {
          text: { zh: '因为它不影响城市发展，所以可以随意保留', en: 'Because it does not affect urban development, so it can be kept casually' },
          correct: false,
          feedback: {
            zh: '不对。红树林需要主动保护、边界管理和长期修复，不能靠“顺手保留”。',
            en: 'No. Mangroves need active protection, boundary management, and long-term restoration, not casual preservation.',
          },
        },
      ],
    },
    reflection: {
      zh: '真正成熟的港湾，不只追求吞吐量，也懂得把生命栖息地留在贸易动脉旁。',
      en: 'A truly mature harbor does not only pursue throughput; it keeps living habitats beside trade arteries.',
    },
    synthesisChoice: {
      question: {
        zh: '潮汐、根系、候鸟与城市边界四条线索，如何共同解释红树林为何是现代海湾文明不可缺少的一部分？',
        en: 'How do tides, roots, birds, and the city edge together explain why mangroves are an indispensable part of modern bay civilization?',
      },
      options: [
        {
          text: { zh: '潮汐带来营养与咸淡水交汇的生态基础，根系固岸消浪构成天然基础设施，候鸟连接全球生态网络，城市边界则提醒发展与生态必须共存——四者共同定义了成熟海湾的文明尺度', en: 'Tides bring nutrients and brackish water exchange as the ecological foundation, roots stabilize shores and reduce waves as natural infrastructure, birds connect a global ecological network, and the city edge reminds us that development and ecology must coexist — together they define the civilizational measure of a mature bay' },
          correct: true,
          feedback: { zh: '判断准确。红树林不是一个孤立的生态景点，而是深圳湾作为现代海湾城市的核心基础设施：潮汐滋养的盐沼湿地是红树林生存的基础，支柱根系消减七成风浪能量替城市挡灾，十万只候鸟将城市岸线接入东亚-澳大利西亚迁飞路线，而CBD与湿地两公里并置则提出了发展必须给生态留呼吸边界的命题。四者缺一不可。', en: 'Correct. Mangroves are not an isolated ecological attraction but core infrastructure of Shenzhen Bay as a modern bay city: tides nourish salt marshes as the foundation for mangrove survival, prop roots reduce 70% of wave energy protecting the city, 100,000 birds connect the urban shoreline to the East Asian-Australasian Flyway, and the two-kilometer juxtaposition of CBD and wetland raises the proposition that development must leave breathing boundaries for ecology. None can be omitted.' },
        },
        {
          text: { zh: '红树林主要是景观绿化，与潮汐、候鸟和城市边界没有实质关联', en: 'Mangroves are mainly landscaping with no substantive connection to tides, birds, or the city edge' },
          correct: false,
          feedback: { zh: '严重误读。红树林的生态功能完全依赖于潮汐带来的咸淡水交汇和营养循环；候鸟依赖红树林滩涂作为越冬和觅食栖息地；城市边界则决定了红树林能否在城市化压力下存活。把红树林看作孤立绿化，会忽略它作为海岸防护、生物栖息和城市生态缓冲的多重系统功能。', en: 'Serious misreading. Mangrove ecological functions depend entirely on the brackish water exchange and nutrient cycles brought by tides; birds depend on mangrove mudflats as wintering and feeding habitat; the city edge determines whether mangroves can survive urbanization pressure. Treating mangroves as isolated landscaping ignores their multi-layered system functions as coastal protection, biological habitat, and urban ecological buffer.' },
        },
        {
          text: { zh: '只有候鸟重要，潮汐和根系只是物理背景', en: 'Only birds matter; tides and roots are just physical background' },
          correct: false,
          feedback: { zh: '以偏概全。候鸟之所以来深圳湾，恰恰因为潮汐带来丰富的底栖生物作为食物，红树林根系固岸留泥形成适宜的滩涂栖息地。没有潮汐和根系，就没有候鸟驿站。城市边界的存在则说明这些生态功能是在高度城市化环境中维持的，这本身就是现代海湾文明的独特命题。', en: 'Overgeneralizes. Birds come to Shenzhen Bay precisely because tides bring abundant benthic organisms as food, and mangrove roots stabilize shores and trap sediment to form suitable mudflat habitat. Without tides and roots, there would be no bird stopover. The city edge shows these ecological functions are maintained in a highly urbanized environment, which is itself a unique proposition of modern bay civilization.' },
        },
      ],
    },
    impactChoice: {
      question: {
        zh: '红树林保护对深圳建设现代化海湾城市最重要的启示是什么？',
        en: 'What is the most important inspiration of mangrove protection for Shenzhen building a modern bay city?',
      },
      options: [
        {
          text: { zh: '成熟的海湾城市必须把生态韧性纳入规划核心，让贸易繁荣与生命栖息地在同一片海岸共存', en: 'A mature bay city must integrate ecological resilience into planning, letting trade prosperity and living habitats coexist on the same coast' },
          correct: true,
          feedback: { zh: '判断准确。深圳湾红树林保护区是中国最小的国家级保护区，却紧邻CBD和口岸，这种高楼与湿地并置的格局本身就是对现代海湾文明的定义：真正的国际化不只体现在资本和航线，也体现在能否为黑脸琵鹭留一片滩涂、为城市留一道生态缓冲。红树林提醒深圳，发展强度与生态边界不是对立选择，而是成熟城市的必答题。', en: 'Correct. Shenzhen Bay Mangrove Reserve is China smallest national reserve yet sits adjacent to CBD and checkpoint. This juxtaposition of towers and wetlands defines modern bay civilization: true internationalization is measured not only by capital and routes, but by whether a city can leave a mudflat for black-faced spoonbills and an ecological buffer for itself. Mangroves remind Shenzhen that development intensity and ecological boundaries are not opposing choices but mandatory questions for a mature city.' },
        },
        {
          text: { zh: '红树林保护阻碍了城市发展，应该优先考虑填海造地', en: 'Mangrove protection hinders urban development; land reclamation should be prioritized' },
          correct: false,
          feedback: { zh: '本末倒置。红树林替城市消减七成风浪能量、过滤陆源污染物、保护海岸线免受侵蚀，这些生态服务功能的经济价值远超填海获得的土地。更重要的是，在全球候鸟迁飞路线中，深圳湾红树林是不可替代的节点，一旦消失将造成不可逆的生态断裂。发展与保护不是零和博弈，而是成熟城市治理的必修课。', en: 'Puts the cart before the horse. Mangroves reduce 70% of wave energy, filter land-based pollutants, and protect coastlines from erosion — ecosystem services whose economic value far exceeds land from reclamation. More importantly, in the global bird flyway, Shenzhen Bay mangroves are an irreplaceable node; their loss would cause irreversible ecological rupture. Development and protection are not a zero-sum game but a required course in mature urban governance.' },
        },
        {
          text: { zh: '保护红树林只是为了满足环保合规要求，没有深层意义', en: 'Protecting mangroves is only about environmental compliance with no deeper significance' },
          correct: false,
          feedback: { zh: '过于浅薄。红树林保护的意义远超合规：它是深圳作为东亚-澳大利西亚迁飞路线关键驿站的国际生态责任，是海湾城市在气候变化时代构建韧性的战略选择，更是深圳从速度城市走向品质城市的文明标志。把红树林保护贬低为合规应付，会错过它对城市未来发展的深层战略价值。', en: 'Too shallow. Mangrove protection means far more than compliance: it is Shenzhen international ecological responsibility as a key stopover on the East Asian-Australasian Flyway, a strategic choice for building climate resilience in a bay city, and a civilizational marker of Shenzhen evolving from a speed city to a quality city. Reducing mangrove protection to compliance misses its deep strategic value for the city future.' },
        },
      ],
    },
    finalChoice: {
      question: {
        zh: '为什么航海贸易主题中需要红树林这一站？',
        en: 'Why does a maritime trade theme need a mangrove stop?',
      },
      options: [
        {
          text: { zh: '现代海洋文明必须同时处理开放、航运与生态韧性', en: 'Modern maritime civilization must handle openness, shipping, and ecological resilience together' },
          correct: true,
          feedback: {
            zh: '记入案卷。红树林让湾区海洋叙事从“通向世界”走向“与生命共存”。',
            en: 'Enter that into the record. Mangroves move the Bay Area maritime story from reaching the world to coexisting with life.',
          },
        },
        {
          text: { zh: '因为靠近海边，所以随便归到航海贸易里', en: 'Because it is near the sea, so it can be casually placed under maritime trade' },
          correct: false,
          feedback: {
            zh: '不是随便归类。红树林展示的是海洋城市的新命题：贸易繁荣与生态边界如何共存。',
            en: 'It is not random. Mangroves show a new question for maritime cities: how prosperity and ecological boundaries coexist.',
          },
        },
      ],
    },
    closing: {
      zh: '很好。把红树林封入案卷：这里让深圳湾证明，最好的海洋文明也会为生命留岸。',
      en: 'Good. Seal the mangroves into the case file: Shenzhen Bay proves the best maritime civilization leaves a shore for life.',
    },
    completion: {
      title: { zh: '本幕完成', en: 'Scene Complete' },
      insight: {
        zh: '你已理解：深圳湾红树林不是城市余地，而是生态屏障、候鸟驿站和现代海湾文明的边界意识。',
        en: 'You now understand: Shenzhen Bay mangroves are not leftover space, but ecological barrier, bird stopover, and boundary consciousness of modern bay civilization.',
      },
    },
    reward: { badge: '🌿', badgeIcon: 'mangrove-bird', badgeName: { zh: '湿地护航印', en: 'Seal of the Mangrove Haven' }, insight: { zh: '深圳湾红树林是东亚-澳大利西亚迁飞路线的重要中转站，全球仅存约六千只的黑脸琵鹭在此越冬。红树林根系固岸消浪、留泥净水，是天然的海岸防护基础设施。2000年后这片红树林面积一度因城市开发缩减，后经保护恢复。深圳湾是城市与湿地贴得最近的地方——高楼、口岸、湿地和海面近在咫尺，贸易繁荣与生态韧性在这里被放进了同一幅画面。', en: 'Shenzhen Bay mangroves are a key stop on the East Asian-Australasian Flyway; the globally endangered black-faced spoonbill — only about 6,000 left — winters here. Mangrove roots hold shorelines, calm waves, trap sediment, and filter water, serving as natural coastal defense infrastructure. After 2000, the mangrove area shrank under development pressure, then recovered through protection. Shenzhen Bay is where city and wetland sit closest — towers, port, wetland, and sea within arm\'s reach, placing prosperity and ecological resilience in the same frame.' } },
  }),
});

Object.entries(RPG_CLUE_DIALOGUES).forEach(([anchorId, clueDialogues]) => {
  const clues = EPISODES[anchorId] && EPISODES[anchorId].rpg && EPISODES[anchorId].rpg.clues;
  if (!Array.isArray(clues)) return;
  clues.forEach((clue) => {
    if (clueDialogues[clue.id]) clue.dialogue = clueDialogues[clue.id];
  });
});

Object.entries(EPISODE_SCENE_EXPANSIONS).forEach(([anchorId, extraScenes]) => {
  if (
    !EPISODES[anchorId] ||
    !Array.isArray(EPISODES[anchorId].scenes) ||
    !Array.isArray(extraScenes) ||
    extraScenes.length === 0
  ) {
    return;
  }
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
