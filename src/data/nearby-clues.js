// Nearby Clues data layer.
// Each clue links to an existing anchor through anchorId; anchors / episodes stay unchanged.

export const nearbyClues = [
  {
    id: 'clue_szse_archive',
    anchorId: 'N-EG02',
    type: 'archive',
    typeLabel: {
      zh: '档案线索',
      en: 'Archive Clue',
    },
    title: {
      zh: '为什么中国资本市场的重要试验地会出现在深圳？',
      en: "Why did China's capital market experiment begin in Shenzhen?",
    },
    coverImage: '/assets/clues/N-EG02-cover.webp',
backgroundImage: './public/clue-backgrounds/quest-szse.webp',
    accentColor: '#2f8f80',
    visualStyleTag: 'sealed_archive',
    backgroundPrompt: {
      zh: '新中式文化科技感，高级叙事插画，游戏任务卡底纹素材；深圳证券交易所线索，资本市场档案、旧文书、制度实验、金融地标、股市图表，被封存的档案与制度实验起点；深墨、青绿、旧金、瓷白，低饱和，非低幼，非旅游海报，适合低透明度融入卡片底板。',
      en: 'Neo-Chinese cultural technology style, premium narrative illustration, game quest-card background motif; Shenzhen Stock Exchange clue, capital market archive, old documents, institutional experiment, financial landmark, stock chart motifs, sealed dossier and the origin point of a market reform experiment; deep ink, jade green, aged gold, porcelain white, low saturation, mature, not a tourism poster, suitable for low-opacity integration into a card surface.',
    },
    distancePrefix: {
      zh: '477m 处',
      en: '477m away',
    },
    hook: {
      zh: '一份关于中国资本市场改革的档案缺少了最后一页。',
      en: "An archive about China's capital market reform is missing its final page.",
    },
    mergedDescription: {
      zh: '一份关于中国资本市场改革的档案缺少了最后一页。展开它，找到这场制度实验的起点。',
      en: "An archive about China's capital market reform is missing its final page. Open it and find the starting point of this institutional experiment.",
    },
    question: {
      zh: '为什么深圳会成为中国资本市场的重要试验地？',
      en: "Why did Shenzhen become an important testing ground for China's capital market?",
    },
    reward: {
      zh: ['资本市场徽章', '制度实验知识卡'],
      en: ['Capital Market Badge', 'Institutional Experiment Card'],
    },
    cta: {
      zh: '展开档案',
      en: 'Open Archive',
    },
    priority: 96,
  },
  {
    id: 'clue_lianhua_memory',
    anchorId: 'M11',
    type: 'character',
    typeLabel: {
      zh: '人物线索',
      en: 'Character Clue',
    },
    title: {
      zh: '为什么深圳会成为中国改革开放的窗口？',
      en: "Why did Shenzhen become China's window of reform and opening?",
    },
    coverImage: '/assets/clues/M11-cover.webp',
backgroundImage: './public/clue-backgrounds/quest-lianhua.webp',
    accentColor: '#b06b36',
    visualStyleTag: 'reform_witness',
    backgroundPrompt: {
      zh: '新中式文化科技感，高级叙事插画，游戏任务卡底纹素材；莲花山改革开放线索，改革见证者、山体轮廓、纪念像、城市天际线、时代记忆，城市精神、开放窗口、上升感；深墨、青绿、旧金、瓷白，低饱和，非低幼，非旅游海报，适合低透明度融入卡片底板。',
      en: 'Neo-Chinese cultural technology style, premium narrative illustration, game quest-card background motif; Lianhua Mountain reform and opening clue, reform witness, mountain silhouette, commemorative statue, Shenzhen skyline, era memory, civic spirit, open window, upward momentum; deep ink, jade green, aged gold, porcelain white, low saturation, mature, not a tourism poster, suitable for low-opacity integration into a card surface.',
    },
    distancePrefix: {
      zh: '1.9km 处',
      en: '1.9km away',
    },
    hook: {
      zh: '一位改革见证者留下了一段关于“深圳速度”的记忆。',
      en: 'A witness to reform left behind a memory of "Shenzhen Speed", waiting for your questions.',
    },
    mergedDescription: {
      zh: '一位改革见证者留下了一段关于“深圳速度”的记忆。追寻这段记忆，理解这座城市为何被称为改革开放的窗口。',
      en: 'A witness to reform left behind a memory of "Shenzhen Speed". Trace it to understand why this city became a window of reform and opening.',
    },
    question: {
      zh: '为什么深圳被称为中国改革开放的窗口？',
      en: "Why is Shenzhen called China's window of reform and opening?",
    },
    reward: {
      zh: ['改革开放徽章', '城市精神知识卡'],
      en: ['Reform and Opening Badge', 'Urban Spirit Card'],
    },
    cta: {
      zh: '追寻记忆',
      en: 'Trace the Memory',
    },
    priority: 95,
  },
  {
    id: 'clue_huaqiangbei_component',
    anchorId: 'N-SC01',
    type: 'object',
    typeLabel: {
      zh: '器物线索',
      en: 'Object Clue',
    },
    title: {
      zh: '为什么深圳能成为全球硬件创新的重要城市？',
      en: 'Why did Shenzhen become a major city for global hardware innovation?',
    },
    coverImage: '/assets/clues/N-SC01-cover.webp',
backgroundImage: './public/clue-backgrounds/quest-huaqiangbei.webp',
    accentColor: '#287f8f',
    visualStyleTag: 'component_network',
    backgroundPrompt: {
      zh: '新中式文化科技感，高级叙事插画，游戏任务卡底纹素材；华强北电子市场线索，电子元件、芯片、供应链、创客、科技网络、全球连接，器物追踪、创新生态、硬件创业；深墨、青绿、旧金、瓷白，低饱和，非低幼，非旅游海报，适合低透明度融入卡片底板。',
      en: 'Neo-Chinese cultural technology style, premium narrative illustration, game quest-card background motif; Huaqiangbei electronics market clue, electronic component, chip, supply chain, maker culture, technology network, global connection, object tracking, innovation ecosystem, hardware entrepreneurship; deep ink, jade green, aged gold, porcelain white, low saturation, mature, not a tourism poster, suitable for low-opacity integration into a card surface.',
    },
    distancePrefix: {
      zh: '3.3km 处',
      en: '3.3km away',
    },
    hook: {
      zh: '一块普通电子元件，连接着柜台、工厂、创客空间与全球市场。',
      en: 'An ordinary electronic component connects counters, factories, maker spaces and global markets.',
    },
    mergedDescription: {
      zh: '一块普通电子元件，连接着柜台、工厂、创客空间与全球市场。追踪它，看看深圳如何长出自己的创新生态。',
      en: 'An ordinary electronic component connects counters, factories, maker spaces and global markets. Trace it to see how Shenzhen grew its own innovation ecosystem.',
    },
    question: {
      zh: '深圳为什么能成为全球硬件创新的重要城市？',
      en: 'Why did Shenzhen become a major city for global hardware innovation?',
    },
    reward: {
      zh: ['科技创新徽章', '全球供应链知识卡'],
      en: ['Tech Innovation Badge', 'Global Supply Chain Card'],
    },
    cta: {
      zh: '追踪器物',
      en: 'Trace the Object',
    },
    priority: 88,
  },
  {
    id: 'clue_dji_drone_network',
    anchorId: 'N-SC03',
    type: 'object',
    typeLabel: {
      zh: '器物线索',
      en: 'Object Clue',
    },
    title: {
      zh: '一台无人机为什么能连向全球天空？',
      en: 'Why can one drone connect to the global sky?',
    },
    coverImage: '/assets/clues/N-SC03-cover.webp',
backgroundImage: './public/clue-backgrounds/quest-dji.webp',
    accentColor: '#287f8f',
    visualStyleTag: 'drone_supply_network',
    backgroundPrompt: {
      zh: '新中式文化科技感，高级叙事插画，游戏任务卡底纹素材；大疆天空之城线索，无人机、云台、飞控板、供应链、深圳湾科技天际线、全球航拍网络，器物追踪、硬件创新、产品系统；深墨、青绿、旧金、瓷白，低饱和，非低幼，非旅游海报，适合低透明度融入卡片底板。',
      en: 'Neo-Chinese cultural technology style, premium narrative illustration, game quest-card background motif; DJI Sky City clue, drone, gimbal, flight-control board, supply chain, Shenzhen Bay technology skyline, global aerial-imaging network, object tracking, hardware innovation, product system; deep ink, jade green, aged gold, porcelain white, low saturation, mature, not a tourism poster, suitable for low-opacity integration into a card surface.',
    },
    hook: {
      zh: '一台看似轻巧的无人机，背后连着飞控、云台、制造网络与全球应用场景。',
      en: 'A seemingly light drone links flight control, gimbals, manufacturing networks, and global use cases.',
    },
    mergedDescription: {
      zh: '一台看似轻巧的无人机，背后连着飞控、云台、制造网络与全球应用场景。追踪它，理解深圳创新如何把复杂技术做成世界通用的产品。',
      en: 'A seemingly light drone links flight control, gimbals, manufacturing networks, and global use cases. Trace it to understand how Shenzhen innovation turns complex technology into a product used worldwide.',
    },
    question: {
      zh: '深圳创新为什么能把复杂硬件变成全球产品？',
      en: 'Why can Shenzhen innovation turn complex hardware into global products?',
    },
    reward: {
      zh: ['天空创新徽章', '全球硬件知识卡'],
      en: ['Aerial Innovation Badge', 'Global Hardware Card'],
    },
    cta: {
      zh: '追踪无人机',
      en: 'Trace the Drone',
    },
    priority: 86,
  },
  {
    id: 'clue_tencent_digital_ecosystem',
    anchorId: 'N-SC02',
    type: 'digital-ecosystem',
    typeLabel: {
      zh: '数字线索',
      en: 'Digital Clue',
    },
    title: {
      zh: '从网络寻呼到超级生态，腾讯如何改变日常连接？',
      en: 'How did Tencent grow from paging into a digital ecosystem?',
    },
    coverImage: '/assets/clues/N-SC02-cover.webp',
    accentColor: '#2f8f80',
    visualStyleTag: 'digital_ecosystem',
    hook: {
      zh: '腾讯滨海大厦背后，不只是一家公司的办公楼，而是一套从寻呼、社交、支付到云服务逐层长出的数字生态。',
      en: 'Behind Tencent Seafront Towers is not just an office building, but a digital ecosystem that grew from paging to social connection, payments and cloud services.',
    },
    mergedDescription: {
      zh: '从网络寻呼、即时通讯、移动支付到云端能力，进入副本看腾讯如何在南山海边把“连接人”扩展成影响日常生活的超级生态。',
      en: 'From online paging and messaging to mobile payments and cloud services, enter the episode to see how Tencent turned connection into an everyday digital ecosystem.',
    },
    question: {
      zh: '腾讯如何从深圳南山走向全球数字生活？',
      en: 'How did Tencent grow from Nanshan into global digital life?',
    },
    reward: {
      zh: ['数字生态徽章', '社交网络知识卡'],
      en: ['Digital Ecosystem Badge', 'Social Network Card'],
    },
    cta: {
      zh: '追踪数字生态',
      en: 'Trace the Ecosystem',
    },
    priority: 94,
  },
  {
    id: 'clue_nantou_ancient_gate',
    anchorId: 'M03',
    type: 'old-city',
    typeLabel: {
      zh: '古城线索',
      en: 'Ancient City Clue',
    },
    title: {
      zh: '踏勘城门、海湾与文书，判断深圳的千年门户为何在这里。',
      en: 'Read gates, bay routes and records to understand why this became Shenzhen’s ancient gateway.',
    },
    coverImage: '/assets/clues/M03-cover.webp',
    accentColor: '#8a6a2d',
    visualStyleTag: 'ancient_gate',
    softBackground: true,
    hook: {
      zh: '南头古城不是一段孤立的旧城墙，而是深圳更早行政、海防与商贸记忆交汇的门户。',
      en: 'Nantou Ancient City is not an isolated old wall, but a gateway where administration, coastal defense and trade memories meet.',
    },
    mergedDescription: {
      zh: '跟随城门、海湾、地势与文书四条线索，判断南头为什么能成为岭南海防与城市治理的重要节点。',
      en: 'Follow gates, bay routes, terrain and records to judge why Nantou became a key node of Lingnan coastal defense and urban governance.',
    },
    question: {
      zh: '深圳的城市来路为什么要从南头读起？',
      en: 'Why should Shenzhen’s deeper urban history begin at Nantou?',
    },
    reward: {
      zh: ['千年门户徽章', '古城治理知识卡'],
      en: ['Ancient Gateway Badge', 'Old City Governance Card'],
    },
    cta: {
      zh: '踏勘古城',
      en: 'Survey the Old City',
    },
    priority: 91,
  },
  {
    id: 'clue_qianhai_institution_trial',
    anchorId: 'M08',
    type: 'institution',
    typeLabel: {
      zh: '制度线索',
      en: 'Institution Clue',
    },
    title: {
      zh: '拆解蓝图、港湾与规则接口，看前海怎样试写开放制度。',
      en: 'Read blueprints, bay routes and rule interfaces to see how Qianhai tests open systems.',
    },
    coverImage: '/assets/clues/M08-cover.webp',
    accentColor: '#2f8f80',
    visualStyleTag: 'institution_trial',
    softBackground: true,
    hook: {
      zh: '前海的重点不是从滩涂变成高楼，而是把深港协作、金融开放与规则衔接放进同一张制度蓝图。',
      en: 'Qianhai is not only about turning reclaimed land into towers, but about placing Shenzhen-Hong Kong cooperation, financial opening and rule interfaces on one blueprint.',
    },
    mergedDescription: {
      zh: '查看蓝图、港湾、跨境金融与规则接口，理解前海为什么能成为深港合作与制度创新的试验场。',
      en: 'Inspect blueprints, bay routes, cross-border finance and rule interfaces to understand why Qianhai became a testing ground for cooperation and institutional innovation.',
    },
    question: {
      zh: '前海为什么能成为深港制度创新的试验场？',
      en: 'Why can Qianhai become a testing ground for Shenzhen-Hong Kong institutional innovation?',
    },
    reward: {
      zh: ['制度试验徽章', '湾区规则知识卡'],
      en: ['Institution Trial Badge', 'Bay Area Rules Card'],
    },
    cta: {
      zh: '拆解制度',
      en: 'Decode the System',
    },
    priority: 90,
  },
  {
    id: 'clue_shekou_reform_engine',
    anchorId: 'M06',
    type: 'reform-site',
    typeLabel: {
      zh: '改革线索',
      en: 'Reform Clue',
    },
    title: {
      zh: '从开山炮、标语与码头，听见蛇口改革如何真正运转。',
      en: 'From the first blast, slogans and docks, hear how Shekou’s reform really worked.',
    },
    coverImage: '/assets/clues/M06-cover.webp',
    accentColor: '#b06b36',
    visualStyleTag: 'shekou_reform',
    softBackground: true,
    hook: {
      zh: '蛇口的意义不止是一句口号，而是把效率、用工、招商和港口物流变成可执行的改革机制。',
      en: 'Shekou is more than a slogan: it turned efficiency, labor, investment and port logistics into a working reform mechanism.',
    },
    mergedDescription: {
      zh: '沿着炮声、标语、码头与用工制度，追问“时间就是金钱”为什么能从一句话变成城市发展的发动机。',
      en: 'Follow the blast, slogan, docks and labor system to ask how “time is money” became an engine of urban development.',
    },
    question: {
      zh: '蛇口怎样把改革口号变成可执行的城市机制？',
      en: 'How did Shekou turn a reform slogan into a working urban mechanism?',
    },
    reward: {
      zh: ['蛇口改革徽章', '市场机制知识卡'],
      en: ['Shekou Reform Badge', 'Market Mechanism Card'],
    },
    cta: {
      zh: '进入改革工地',
      en: 'Enter the Reform Site',
    },
    priority: 89,
  },
  {
    id: 'clue_chiwan_maritime_route',
    anchorId: 'M01',
    type: 'maritime',
    typeLabel: {
      zh: '航海线索',
      en: 'Maritime Clue',
    },
    title: {
      zh: '从赤湾启航，读懂香火、海图与郑和远航的世界连接。',
      en: 'Set out from Chiwan to read worship, sea charts and Zheng He’s world connections.',
    },
    coverImage: '/assets/clues/M01-cover.webp',
    accentColor: '#9a7b32',
    visualStyleTag: 'maritime_memory',
    softBackground: true,
    hook: {
      zh: '赤湾天后宫把地方海湾、航海信仰、宝船远航与跨海贸易连在一起。',
      en: 'Chiwan Tianhou Temple connects a local bay, maritime worship, treasure voyages and cross-sea trade.',
    },
    mergedDescription: {
      zh: '观察香火、海图、锚地与贡品，理解郑和远航为什么代表和平贸易，而不只是一次遥远的航海故事。',
      en: 'Observe worship, sea charts, anchorage and tribute goods to understand why Zheng He’s voyages represent peaceful trade, not just a distant sailing story.',
    },
    question: {
      zh: '赤湾如何把深圳海湾连接到古代世界航线？',
      en: 'How did Chiwan connect Shenzhen Bay to ancient world routes?',
    },
    reward: {
      zh: ['海上丝路徽章', '和平贸易知识卡'],
      en: ['Maritime Silk Road Badge', 'Peaceful Trade Card'],
    },
    cta: {
      zh: '启航赤湾',
      en: 'Set Sail from Chiwan',
    },
    priority: 88,
  },
  {
    id: 'clue_yuenlong_poon_choi',
    anchorId: 'N-AW04',
    type: 'food-heritage',
    typeLabel: {
      zh: '风味线索',
      en: 'Food Heritage Clue',
    },
    title: {
      zh: '从一盆菜看迁徙、宗族与围村礼序如何被端上桌。',
      en: 'Read migration, clans and walled-village ritual through one shared basin feast.',
    },
    coverImage: './public/anchors/generated/N-AW04.webp',
    accentColor: '#b5762a',
    visualStyleTag: 'poon_choi_memory',
    softBackground: true,
    hook: {
      zh: '元朗盆菜不是简单的乡土美食，而是一套把迁徙记忆、宗族座次和节庆互助装进同一个木盆的礼序。',
      en: 'Yuen Long poon choi is not simply local food, but a ritual that places migration memory, clan seating and festival reciprocity into one shared basin.',
    },
    mergedDescription: {
      zh: '沿着木盆、食材层次、族谱与节庆锣鼓，理解一桌盆菜如何把围村共同体重新聚到同一个圆里。',
      en: 'Follow the basin, layered ingredients, genealogy and festival sounds to understand how poon choi gathers a walled-village community back into one circle.',
    },
    question: {
      zh: '一盆菜为什么能成为岭南围村共同体的记忆容器？',
      en: 'Why can one basin feast become a memory vessel for Lingnan walled-village communities?',
    },
    reward: {
      zh: ['围村风味徽章', '宗族礼序知识卡'],
      en: ['Walled Village Flavor Badge', 'Clan Ritual Card'],
    },
    cta: {
      zh: '围坐开席',
      en: 'Join the Feast',
    },
    priority: 82,
  },
  {
    id: 'clue_mangrove_question',
    anchorId: 'M07',
    type: 'city-question',
    typeLabel: {
      zh: '城市问题',
      en: 'City Question',
    },
    title: {
      zh: '一座高速发展的城市，为什么还要保留一片湿地？',
      en: 'Why would a fast-growing city keep a wetland at its center?',
    },
    coverImage: '/assets/clues/M07-cover.webp',
backgroundImage: './public/clue-backgrounds/quest-mangrove.webp',
    accentColor: '#3f7d6e',
    visualStyleTag: 'green_question',
    backgroundPrompt: {
      zh: '新中式文化科技感，高级叙事插画，游戏任务卡底纹素材；深圳河红树林线索，湿地、城市边界、水鸟、生态保护、都市与自然交界，绿色记忆、城市问题、生态平衡；深墨、青绿、旧金、瓷白，低饱和，非低幼，非旅游海报，适合低透明度融入卡片底板。',
      en: 'Neo-Chinese cultural technology style, premium narrative illustration, game quest-card background motif; Shenzhen River mangrove clue, wetland, city boundary, water birds, ecological protection, urban-nature edge, green memory, city question, ecological balance; deep ink, jade green, aged gold, porcelain white, low saturation, mature, not a tourism poster, suitable for low-opacity integration into a card surface.',
    },
    distancePrefix: {
      zh: '3.5km 处',
      en: '3.5km away',
    },
    hook: {
      zh: '一片湿地被保留在城市中心，像一个留给现代城市的开放问题。',
      en: 'A wetland remains inside a fast-growing city, like an answer surrounded by urban life.',
    },
    mergedDescription: {
      zh: '一片湿地被保留在城市中心，像一个留给现代城市的开放问题。调查它，理解发展与生态如何寻找平衡。',
      en: 'A wetland remains in the city center like an open question left for modern urban life. Investigate it to understand how development and ecology search for balance.',
    },
    question: {
      zh: '现代城市如何在发展与生态之间寻找平衡？',
      en: 'How can a modern city balance development and ecology?',
    },
    reward: {
      zh: ['生态城市徽章', '自然记忆知识卡'],
      en: ['Eco-City Badge', 'Natural Memory Card'],
    },
    cta: {
      zh: '调查问题',
      en: 'Investigate the Question',
    },
    priority: 84,
  },
];
