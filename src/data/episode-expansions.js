// 剧情副本扩展题库
// 目标：
// - 所有锚点副本至少 2 题，避免体验过薄。
// - 重点锚点追加第 3 题，形成「事实理解 → 关系判断 → 价值提炼」的叙事层次。

function text(zh, en) {
  return { zh, en };
}

function scene({ q, correct, wrong, rightFeedback, wrongFeedback, speaker = 0 }) {
  return {
    speaker,
    q: text(q[0], q[1]),
    options: [
      {
        text: text(correct[0], correct[1]),
        correct: true,
        feedback: text(rightFeedback[0], rightFeedback[1]),
      },
      {
        text: text(wrong[0], wrong[1]),
        correct: false,
        feedback: text(wrongFeedback[0], wrongFeedback[1]),
      },
    ],
  };
}

export const EPISODE_SCENE_EXPANSIONS = {
  // ============ 既有重点锚点：追加第 3 题 ============
  M02: [
    scene({
      speaker: 1,
      q: ['如果向外宾总结罗浮山这一站,最有力量的表达是什么?', 'What is the strongest summary of the Mount Luofu story for international guests?'],
      correct: ['古籍经验、现代实验与全球公共健康可以跨越千年相互点亮', 'Ancient records, modern experiments and global health can illuminate each other across centuries'],
      wrong: ['传统知识只能停留在传说里,无法进入现代科学', 'Traditional knowledge can only remain legend and never enter modern science'],
      rightFeedback: ['对。罗浮山的价值不是把古代说成现代,而是展示一条严谨的知识接力链:观察、记录、再验证。', 'Yes. Luofu is not about calling the ancient modern, but showing a rigorous chain of observation, record and verification.'],
      wrongFeedback: ['不对。青蒿素的故事恰恰说明,传统知识经过现代科学验证后,可以成为影响世界的公共健康成果。', 'No. Artemisinin proves traditional knowledge can become world-changing public health through modern verification.'],
    }),
  ],
  P01: [
    scene({
      q: ['罗湖桥在钱学森故事里为什么不只是一个口岸?', 'Why is Luohu Bridge more than a checkpoint in Qian Xuesens story?'],
      correct: ['它把个人归途、国家战略和科学体系建设连在一起', 'It links a personal return, national strategy and scientific system building'],
      wrong: ['它只是一座与科学史无关的普通桥梁', 'It is only an ordinary bridge unrelated to science history'],
      rightFeedback: ['准确。一座桥的意义被人的选择放大:跨过边界,也跨进了中国航天和国防科技的新阶段。', 'Correct. The bridge gains meaning through a choice that moved China into a new aerospace stage.'],
      wrongFeedback: ['不对。罗湖桥的重要性来自这一历史时刻:科学家归国让国家科技路径发生转折。', 'No. Its importance comes from the turning point of scientists returning home.'],
    }),
  ],
  M06: [
    scene({
      q: ['蛇口经验给今天的大湾区留下的核心方法是什么?', 'What method did the Shekou experiment leave for todays Bay Area?'],
      correct: ['先试、再改、再推广,用小范围实验打开制度想象', 'Test first, adjust, then scale, using small experiments to open institutional imagination'],
      wrong: ['所有改革都必须等到条件完全成熟后才开始', 'Every reform must wait until all conditions are perfect'],
      rightFeedback: ['正是。蛇口的价值不只在速度,而在它把改革变成可验证、可复制的现场实验。', 'Exactly. Shekous value is not just speed, but turning reform into a testable and repeatable field experiment.'],
      wrongFeedback: ['不对。蛇口最重要的精神恰恰是敢于在不确定中启动试验。', 'No. Shekous spirit is daring to begin experiments under uncertainty.'],
    }),
  ],
  M08: [
    scene({
      q: ['腾讯滨海大厦为什么能代表深圳科技叙事?', 'Why can Tencent Seafront Towers represent Shenzhens technology story?'],
      correct: ['它把互联网平台、城市办公和全球数字生活压缩到一座建筑里', 'It compresses platforms, urban work and global digital life into one building'],
      wrong: ['它只是一栋与数字经济无关的普通写字楼', 'It is only an office tower unrelated to digital economy'],
      rightFeedback: ['没错。这里的建筑意义来自背后的网络:社交、支付、游戏、云服务共同改变了日常生活。', 'Yes. The building matters because of the network behind it: social, payment, games and cloud services reshape daily life.'],
      wrongFeedback: ['不对。腾讯滨海大厦是观察深圳数字经济和平台生态的关键入口。', 'No. The towers are a key entry point into Shenzhens digital economy and platform ecosystem.'],
    }),
  ],
  M11: [
    scene({
      q: ['“画圈”这件事为什么适合放在湾区罗盘的主线里?', 'Why does the story of drawing a circle belong in the main Bay Area narrative?'],
      correct: ['它把抽象改革转化为具体空间,让一片土地成为制度实验场', 'It turned abstract reform into concrete space, making land a field for institutional experiment'],
      wrong: ['它只是一个没有现实影响的传说动作', 'It was only a legendary gesture with no real effect'],
      rightFeedback: ['对。深圳的特殊性在于,改革不是口号,而是被落到边界、园区、港口和城市生活里。', 'Yes. Shenzhens reform became boundaries, zones, ports and daily urban life, not only slogans.'],
      wrongFeedback: ['不对。这个动作之所以被反复讲述,正因为它象征了中国现代化路径的空间化。', 'No. It is retold because it symbolizes how Chinas modernization became spatial.'],
    }),
  ],
  M12: [
    scene({
      q: ['黄埔古港与今天南沙、前海等节点之间是什么关系?', 'How is Huangpu Ancient Port related to Nansha, Qianhai and other modern nodes?'],
      correct: ['它们构成从古代商船到现代供应链的连续海贸谱系', 'They form a maritime trade lineage from ancient ships to modern supply chains'],
      wrong: ['古港和现代湾区港口之间完全没有连续性', 'Ancient ports and modern Bay Area ports have no continuity'],
      rightFeedback: ['准确。港口形态变了,但开放、通商、连接世界的逻辑一直在珠江口延续。', 'Correct. Port forms changed, but openness, trade and world connection continue around the estuary.'],
      wrongFeedback: ['不对。湾区的现代港口网络,正是在更长的珠江口海贸传统上生长出来的。', 'No. The modern port network grows from a longer estuary trade tradition.'],
    }),
  ],
  'N-CV02': [
    scene({
      q: ['南越王墓为什么能打破“岭南边缘”的刻板印象?', 'Why does the Nanyue King Mausoleum challenge the idea that Lingnan was peripheral?'],
      correct: ['它证明两千年前岭南已深度参与王国政治、海贸和礼制网络', 'It proves Lingnan was already part of politics, maritime trade and ritual networks two millennia ago'],
      wrong: ['它说明岭南直到现代才开始有历史', 'It shows Lingnan only gained history in modern times'],
      rightFeedback: ['正是。墓葬里的玉器、海贸痕迹和王权礼制,让岭南成为古代中国与海洋世界之间的重要节点。', 'Exactly. Jade, trade traces and royal rites make Lingnan a key node between ancient China and the maritime world.'],
      wrongFeedback: ['不对。南越王墓正是证明岭南古代文明深度的核心证据。', 'No. The mausoleum is core evidence of ancient Lingnan depth.'],
    }),
  ],
  'N-CV04': [
    scene({
      q: ['开平碉楼最值得讲给国际观众的点是什么?', 'What is most worth telling international audiences about Kaiping Diaolou?'],
      correct: ['它把侨汇、家族安全、中西建筑和全球迁徙放在同一座楼里', 'It puts remittances, family security, East-West architecture and migration into one tower'],
      wrong: ['它只是孤立的乡村高楼,与世界流动无关', 'It is only an isolated village tower unrelated to global movement'],
      rightFeedback: ['没错。碉楼不是奇观摆件,而是华侨把世界经验带回家乡后的空间结晶。', 'Yes. Diaolou are not curiosities, but spatial results of overseas Chinese bringing world experience home.'],
      wrongFeedback: ['不对。开平碉楼的世界遗产价值,恰恰来自迁徙、汇款和建筑混合。', 'No. Its heritage value comes from migration, remittances and architectural hybridity.'],
    }),
  ],
  'N-EG02': [
    scene({
      q: ['深交所这一站最适合提出哪一个核心问题?', 'What core question should the Shenzhen Stock Exchange raise?'],
      correct: ['资本市场如何在改革中被引入、驯化并服务实体经济', 'How a capital market was introduced, governed and connected to the real economy'],
      wrong: ['股票交易只是娱乐活动,与改革路径无关', 'Stock trading is only entertainment and unrelated to reform'],
      rightFeedback: ['准确。深交所的价值在于它把“资本”这个敏感工具放进制度实验,并让市场机制参与发展。', 'Correct. SZSE placed the sensitive tool of capital inside an institutional experiment.'],
      wrongFeedback: ['不对。深交所是理解中国改革开放和资本市场制度化的重要锚点。', 'No. SZSE is vital to understanding reform and capital-market institutionalization.'],
    }),
  ],
  'N-EG03': [
    scene({
      q: ['港珠澳大桥最能体现大湾区哪种能力?', 'What Bay Area capability does the Hong Kong-Zhuhai-Macao Bridge best show?'],
      correct: ['在复杂海域、制度边界和城市协作之间完成超级连接', 'Building mega-connection across complex sea, institutional borders and city cooperation'],
      wrong: ['只是在平地上修了一条普通道路', 'It is only an ordinary road on flat land'],
      rightFeedback: ['对。它的难点不只在桥,也在跨城、跨制度、跨口岸的协同。', 'Yes. The challenge is not only the bridge, but cross-city and cross-system coordination.'],
      wrongFeedback: ['不对。港珠澳大桥是工程、治理和区域一体化共同完成的超级节点。', 'No. It is a mega node of engineering, governance and integration.'],
    }),
  ],
  'N-SC01': [
    scene({
      q: ['华强北为什么不是普通电子卖场?', 'Why is Huaqiangbei not just an electronics market?'],
      correct: ['它把供应链密度、试错速度和草根创业压缩到一个街区', 'It compresses supply-chain density, fast iteration and grassroots entrepreneurship into one district'],
      wrong: ['它只适合购买现成商品,无法孕育创新', 'It only sells finished goods and cannot nurture innovation'],
      rightFeedback: ['正是。华强北的魔力在于“今天想到,明天打样”的速度,这是硬件创新的独特土壤。', 'Exactly. Huaqiangbeis magic is the speed from idea to prototype, a unique hardware innovation soil.'],
      wrongFeedback: ['不对。华强北曾经是无数硬件创业、山寨创新和供应链学习的现场。', 'No. Huaqiangbei has been a field for hardware startups, copycat innovation and supply-chain learning.'],
    }),
  ],
  'N-SC02': [
    scene({
      q: ['腾讯这一站为什么要放在“科学星火”里?', 'Why does Tencent belong in the science and innovation layer?'],
      correct: ['它展示数字平台如何把技术能力变成社会级基础设施', 'It shows how digital platforms turn technology into social-scale infrastructure'],
      wrong: ['互联网产品只影响娱乐,不影响城市和社会运行', 'Internet products only affect entertainment, not cities or society'],
      rightFeedback: ['没错。社交、支付、云和小程序让数字技术进入公共服务、商业和日常协作。', 'Yes. Social, payment, cloud and mini-programs bring digital tech into services, commerce and collaboration.'],
      wrongFeedback: ['不对。平台技术已经深度改变城市生活、商业流通和社会协作。', 'No. Platform technology deeply reshapes urban life, commerce and cooperation.'],
    }),
  ],
  'N-SC04': [
    scene({
      q: ['光明科学城为什么能被称为大湾区的基础研究节点?', 'Why can Guangming Science City be called a basic-research node of the Bay Area?'],
      correct: ['它把大科学装置、大学、医院和产业转化放到同一片创新空间', 'It gathers big-science facilities, universities, hospitals and industrial translation in one space'],
      wrong: ['它只是普通住宅新区,与科研没有关系', 'It is only a residential district unrelated to research'],
      rightFeedback: ['准确。科学城的关键不是单个实验室,而是让基础研究和产业应用拥有相遇的空间。', 'Correct. The point is not one lab, but a space where basic research and application meet.'],
      wrongFeedback: ['不对。光明科学城正是深圳补齐基础研究能力的重要空间。', 'No. Guangming Science City is a key space for Shenzhens basic-research capability.'],
    }),
  ],
  'N-NA01': [
    scene({
      q: ['南头古城为什么适合作为深圳历史的入口?', 'Why is Nantou Ancient City a good entrance to Shenzhen history?'],
      correct: ['它证明深圳不是突然出现的城市,而是海防、县治和商贸长期叠加的结果', 'It proves Shenzhen did not appear suddenly, but grew from defense, county governance and trade'],
      wrong: ['深圳在改革开放前没有任何城市记忆', 'Shenzhen had no urban memory before reform and opening'],
      rightFeedback: ['正是。南头古城把深圳的时间轴往前拉回千年,让现代速度有了历史地基。', 'Exactly. Nantou pulls Shenzhens timeline back centuries and gives modern speed a historical foundation.'],
      wrongFeedback: ['不对。南头古城就是反驳这种刻板印象的关键锚点。', 'No. Nantou is the key anchor that counters that stereotype.'],
    }),
  ],
  'N-NA03': [
    scene({
      q: ['澳门历史城区为什么是“海上贸易”而不只是“老建筑”?', 'Why is Macaus Historic Centre maritime trade history, not just old buildings?'],
      correct: ['它保存了港口城市中宗教、商业、街巷和跨文化生活的叠层', 'It preserves layers of religion, commerce, streets and cross-cultural life in a port city'],
      wrong: ['建筑只负责好看,无法说明贸易和文化交流', 'Buildings only look nice and cannot explain trade or exchange'],
      rightFeedback: ['没错。澳门的街道和建筑是全球海贸时代留下的城市文本。', 'Yes. Macaus streets and buildings are an urban text from the age of global maritime trade.'],
      wrongFeedback: ['不对。澳门历史城区的价值正是港口贸易和文化互译共同留下的空间证据。', 'No. Its value is spatial evidence of port trade and cultural translation.'],
    }),
  ],
  'N-NA04': [
    scene({
      q: ['十三行为什么能成为广州连接世界的关键节点?', 'Why did the Thirteen Hongs become a key node connecting Guangzhou to the world?'],
      correct: ['它把外贸、行商制度、商品流动和全球需求集中在珠江岸边', 'It concentrated foreign trade, merchant systems, goods and global demand along the Pearl River'],
      wrong: ['它只是本地小集市,与世界市场无关', 'It was only a local market unrelated to the world market'],
      rightFeedback: ['准确。十三行让广州在相当长时间里成为中国对外贸易的重要窗口。', 'Correct. The Thirteen Hongs made Guangzhou a major window of Chinas foreign trade for a long period.'],
      wrongFeedback: ['不对。十三行正是理解广州全球贸易角色的核心地点。', 'No. The Thirteen Hongs are central to Guangzhous global trade role.'],
    }),
  ],

  // ============ 新增 30 个锚点：全部补到至少 2 题，重点锚点追加第 3 题 ============
  'N-CV05': [
    scene({
      q: ['如果只用一句话向外宾解释陈家祠,哪句最准确?', 'Which sentence best explains Chen Clan Ancestral Hall to international guests?'],
      correct: ['它是一座把岭南工艺、宗族教育和公共审美合在一起的建筑档案', 'It is an architectural archive of Lingnan craft, clan education and public aesthetics'],
      wrong: ['它只是一个与地方社会无关的装饰展厅', 'It is only a decorative hall unrelated to local society'],
      rightFeedback: ['对。陈家祠最动人的地方,是每一处雕刻都在说明地方社会如何组织身份、教育和审美。', 'Yes. Its carvings show how local society organized identity, education and aesthetics.'],
      wrongFeedback: ['不对。陈家祠不是单纯展示物,而是岭南社会结构和工艺能力的复合证据。', 'No. It is compound evidence of Lingnan social structure and craft capability.'],
    }),
    scene({
      q: ['陈家祠和现代湾区的创新气质有什么隐性关系?', 'What hidden link connects Chen Clan Hall with modern Bay Area innovation?'],
      correct: ['都依赖细密分工、手艺协作和把复杂系统做成可感知成果的能力', 'Both rely on fine division of work, collaboration and turning complex systems into visible results'],
      wrong: ['传统工艺只属于过去,与今天的制造和设计毫无关系', 'Traditional craft belongs only to the past and has nothing to do with todays design or making'],
      rightFeedback: ['很好。岭南工艺不是怀旧装饰,它展示的是协作生产和审美转译能力,这和现代制造设计有深层连续性。', 'Good. Lingnan craft is not nostalgia, but collaborative production and aesthetic translation, deeply continuous with modern design.'],
      wrongFeedback: ['不对。湾区的制造和设计能力,与更长的手艺协作传统并不是断裂关系。', 'No. Bay Area making and design are not disconnected from older craft collaboration.'],
    }),
  ],
  'N-CV06': [
    scene({
      q: ['佛山祖庙如何把“城市精神”变得可见?', 'How does Foshan Ancestral Temple make city spirit visible?'],
      correct: ['通过庙宇、行会、粤剧、武术和陶塑屋脊把城市共同体聚合起来', 'Through temple, guilds, opera, martial arts and ceramic ridges that gather the urban community'],
      wrong: ['它只是一座孤立建筑,不承载城市共同体记忆', 'It is an isolated building carrying no urban community memory'],
      rightFeedback: ['对。祖庙像佛山的精神中轴,把信仰、商业、工艺和街坊生活拴在一起。', 'Yes. The temple is a spiritual axis tying belief, commerce, craft and neighborhood life together.'],
      wrongFeedback: ['不对。祖庙的价值就在于它与佛山的市井生活和工商业传统紧密相连。', 'No. Its value lies in its close link with Foshan everyday life and industry-commerce tradition.'],
    }),
  ],
  'N-CV07': [
    scene({
      q: ['七星岩题刻为什么比普通风景照更有信息量?', 'Why do Seven Star Crags inscriptions carry more information than scenery photos?'],
      correct: ['它们记录不同朝代的人如何观看、命名和理解岭南山水', 'They record how people across dynasties viewed, named and understood Lingnan landscape'],
      wrong: ['题刻不会留下历史信息,只会破坏自然景观', 'Inscriptions leave no historical information and only damage scenery'],
      rightFeedback: ['正是。石刻把观看山水的人也留下来了,让自然景观变成文化档案。', 'Exactly. The inscriptions preserve the viewers too, turning scenery into cultural archive.'],
      wrongFeedback: ['不对。历代题刻是理解岭南山水审美和地方治理的重要材料。', 'No. Inscriptions are important material for landscape aesthetics and local governance.'],
    }),
  ],
  'N-CV08': [
    scene({
      q: ['大三巴牌坊的“混合感”应该如何理解?', 'How should we understand the mixed character of the Ruins of St Pauls?'],
      correct: ['它不是拼贴,而是港口城市长期翻译世界元素后的结果', 'It is not collage, but the result of a port city translating world elements over time'],
      wrong: ['它说明不同文化只能彼此隔绝,无法共处', 'It shows different cultures can only remain separate and cannot coexist'],
      rightFeedback: ['准确。大三巴的力量在于它把宗教、工艺、港口和地方审美压在同一面石墙上。', 'Correct. Its power is pressing religion, craft, port life and local aesthetics into one stone facade.'],
      wrongFeedback: ['不对。澳门最重要的特质之一,正是多种文化在日常空间里共处和互译。', 'No. One of Macaus key traits is coexistence and translation in everyday space.'],
    }),
    scene({
      q: ['为什么这一站适合放在国际路演里重点讲?', 'Why is this stop worth highlighting in an international roadshow?'],
      correct: ['它用一个极易识别的符号说明大湾区早已参与全球交流', 'It uses a highly recognizable symbol to show the Bay Area has long joined global exchange'],
      wrong: ['因为它只能说明澳门是孤立的旅游景点', 'Because it only shows Macau as an isolated tourist spot'],
      rightFeedback: ['没错。大三巴是高识别度入口,能迅速把观众带进“港口、交流、混合文明”的主线。', 'Yes. It quickly brings audiences into the themes of port, exchange and mixed civilization.'],
      wrongFeedback: ['不对。大三巴的意义远超打卡,它是澳门世界性的浓缩符号。', 'No. St Pauls is much more than a photo spot. It condenses Macaus global character.'],
    }),
  ],
  'N-CV09': [
    scene({
      q: ['惠州西湖为什么能给高速发展的湾区增加一种“慢”的力量?', 'Why does Huizhou West Lake add a slower force to the fast Bay Area?'],
      correct: ['它让诗文、贬谪、民生和山水疗愈进入城市叙事', 'It brings poetry, exile, public life and landscape healing into the urban story'],
      wrong: ['湾区只需要速度,不需要诗文和山水记忆', 'The Bay Area only needs speed, not poetry or landscape memory'],
      rightFeedback: ['正是。苏轼的故事让湾区不只是一套效率系统,也有面对逆境的文化温度。', 'Exactly. Su Shis story gives the Bay Area cultural warmth for facing hardship, beyond efficiency.'],
      wrongFeedback: ['不对。真正有厚度的城市群,需要速度,也需要慢下来的文化记忆。', 'No. A deep urban region needs speed as well as slower cultural memory.'],
    }),
  ],
  'N-CV10': [
    scene({
      q: ['南社古村的空间布局最能说明什么?', 'What does Nanshe villages layout best explain?'],
      correct: ['珠三角乡村通过祠堂、书院、水塘和巷道组织共同生活', 'Pearl Delta villages organized communal life through halls, academies, ponds and lanes'],
      wrong: ['古村布局完全随机,看不出任何社会关系', 'Ancient village layouts were random and show no social relations'],
      rightFeedback: ['对。南社不是只看老房子,而是看一个地方社会如何把秩序写进空间。', 'Yes. Nanshe is not just old houses, but social order written into space.'],
      wrongFeedback: ['不对。祠堂、水塘和书院的位置,恰恰能看见乡村协作和宗族结构。', 'No. The placement of halls, ponds and academies reveals cooperation and clan structure.'],
    }),
  ],
  'N-EG05': [
    scene({
      q: ['虎门大桥和后来的跨海通道之间有什么关系?', 'How is Humen Bridge related to later cross-sea links?'],
      correct: ['它是珠江口桥隧网络成型前的重要先声', 'It was an important early signal before the estuary bridge-tunnel network took shape'],
      wrong: ['它与湾区一体化交通没有任何关系', 'It has no relation to Bay Area transport integration'],
      rightFeedback: ['准确。虎门大桥让珠江口两岸距离第一次被大幅压缩,为后来的超级工程打开想象。', 'Correct. It compressed distance across the estuary and opened imagination for later mega projects.'],
      wrongFeedback: ['不对。虎门大桥正是理解珠江口交通一体化的早期节点。', 'No. Humen Bridge is an early node for understanding estuary transport integration.'],
    }),
  ],
  'N-EG06': [
    scene({
      q: ['现代南沙港相比古代港口,最大的变化是什么?', 'What is the biggest difference between modern Nansha Port and ancient ports?'],
      correct: ['港口变成由航线、集装箱、冷链、海关和数据共同驱动的系统', 'The port becomes a system driven by routes, containers, cold chains, customs and data'],
      wrong: ['现代港口只比古代港口多了几条船', 'Modern ports only have a few more ships than ancient ports'],
      rightFeedback: ['对。南沙港讲的是系统能力:货物、信息和规则一起高速流动。', 'Yes. Nansha is about system capability where goods, information and rules move together.'],
      wrongFeedback: ['不对。现代港口的核心变化是供应链系统化,不是船只数量的简单增加。', 'No. The core change is supply-chain systemization, not just more ships.'],
    }),
    scene({
      q: ['南沙港为什么适合作为新海上丝路的节点?', 'Why is Nansha Port a good node for the new maritime route?'],
      correct: ['它把广州传统外贸基因转化为面向全球供应链的现代枢纽', 'It turns Guangzhous trade tradition into a modern global supply-chain hub'],
      wrong: ['它只服务本地,无法连接全球市场', 'It only serves locally and cannot connect global markets'],
      rightFeedback: ['正是。南沙港让“广州通海”的老叙事获得了新的物流和产业形态。', 'Exactly. Nansha gives Guangzhous old sea-facing story a new logistics and industrial form.'],
      wrongFeedback: ['不对。南沙港的价值正是在全球航线和湾区制造之间建立连接。', 'No. Nanshas value is linking global routes with Bay Area manufacturing.'],
    }),
  ],
  'N-EG07': [
    scene({
      q: ['横琴的“工程感”为什么不只在土木建设?', 'Why is Hengqins engineering character not only about construction?'],
      correct: ['它更像制度工程,需要重组通关、产业、教育和生活规则', 'It is more like institutional engineering, reorganizing customs, industry, education and daily rules'],
      wrong: ['横琴只要盖楼就能完成粤澳合作', 'Hengqin only needs buildings to complete Guangdong-Macao cooperation'],
      rightFeedback: ['对。横琴真正难的地方在于让不同制度和生活方式在日常中协同运行。', 'Yes. The hard part is making different systems and ways of life work together daily.'],
      wrongFeedback: ['不对。横琴的核心不是楼宇数量,而是粤澳规则协同和产业承接。', 'No. Hengqin is not about building count, but rule coordination and industry integration.'],
    }),
    scene({
      q: ['横琴给大湾区提供的想象力是什么?', 'What imagination does Hengqin offer the Bay Area?'],
      correct: ['城市群一体化不只是交通相连,还要让制度和生活场景相连', 'Urban integration is not only transport links, but connected systems and living scenes'],
      wrong: ['只要距离近,城市自然就会融合', 'If cities are close, integration naturally happens'],
      rightFeedback: ['很好。横琴提醒我们,真正的融合要落到工作、学习、通关和居住的细节里。', 'Good. Hengqin shows integration must enter work, study, customs and living details.'],
      wrongFeedback: ['不对。地理靠近只是起点,制度和日常协同才是融合的关键。', 'No. Geographic closeness is only the start. System and daily coordination matter.'],
    }),
  ],
  'N-EG08': [
    scene({
      q: ['广州塔为什么不只是“高”?', 'Why is Canton Tower not only about height?'],
      correct: ['它把结构技术、城市天际线、夜间公共空间和城市品牌结合起来', 'It combines structural technology, skyline, night public space and city branding'],
      wrong: ['高度之外没有任何城市意义', 'Beyond height it has no urban meaning'],
      rightFeedback: ['没错。广州塔成为地标,靠的不只是高度,还有它在珠江新城天际线中的识别力。', 'Yes. It became a landmark through recognizability in the Zhujiang skyline, not only height.'],
      wrongFeedback: ['不对。城市地标的意义往往来自空间位置、公共记忆和视觉识别共同作用。', 'No. Landmarks gain meaning from location, memory and visual identity together.'],
    }),
  ],
  'N-EG09': [
    scene({
      q: ['西九龙站如何把“跨城”变成日常?', 'How does West Kowloon Station make cross-city life daily?'],
      correct: ['通过高铁班次、口岸安排和城市中心换乘压缩时间成本', 'By combining train frequency, border arrangements and central transfers to reduce time cost'],
      wrong: ['车站只负责停靠列车,不会改变生活圈', 'A station only stops trains and cannot change living circles'],
      rightFeedback: ['准确。高铁站的力量在于把区域合作变成可计算、可选择的日常行程。', 'Correct. The station turns regional cooperation into calculable daily trips.'],
      wrongFeedback: ['不对。枢纽车站会直接改变通勤、商务和旅游的空间半径。', 'No. Hub stations directly change commuting, business and travel radius.'],
    }),
  ],
  'N-EG10': [
    scene({
      q: ['深中通道会怎样影响珠江口两岸关系?', 'How does the Shenzhen-Zhongshan Link affect both sides of the estuary?'],
      correct: ['让产业分工、通勤半径和旅游线路重新组合', 'It recombines industrial division, commuting radius and travel routes'],
      wrong: ['它只改变地图上的一条线,不改变城市关系', 'It only changes a line on the map, not city relations'],
      rightFeedback: ['对。跨海通道真正改变的是人、货、企业和想象中的距离。', 'Yes. A sea crossing changes distances for people, goods, firms and imagination.'],
      wrongFeedback: ['不对。重大通道一旦开通,会重塑城市之间的机会分布。', 'No. Major links reshape opportunity distribution between cities.'],
    }),
    scene({
      q: ['深中通道最适合放在哪条产品故事线上?', 'Which product story line best fits the Shenzhen-Zhongshan Link?'],
      correct: ['从桥梁工程走向湾区城市群重组', 'From bridge engineering to Bay Area urban-region recomposition'],
      wrong: ['只作为单个景点孤立展示', 'Only as an isolated tourist point'],
      rightFeedback: ['正是。它不是“看一座桥”,而是理解珠江口东西两岸如何被重新折叠。', 'Exactly. It is not just seeing a bridge, but understanding how both banks are folded closer.'],
      wrongFeedback: ['不对。深中通道的意义必须放在湾区通道网络和城市分工里看。', 'No. Its meaning must be read inside the Bay Area corridor network and urban division.'],
    }),
  ],
  'N-SC05': [
    scene({
      q: ['香港科大为什么不是“校园孤岛”?', 'Why is HKUST not an isolated campus?'],
      correct: ['它通过科研、创业、资本和国际网络连接湾区产业', 'It links Bay Area industry through research, entrepreneurship, capital and global networks'],
      wrong: ['大学只负责上课,与产业创新没有关系', 'Universities only teach classes and have no relation to industrial innovation'],
      rightFeedback: ['没错。研究型大学是湾区创新生态里最重要的长期变量之一。', 'Yes. Research universities are one of the most important long-term variables in Bay Area innovation.'],
      wrongFeedback: ['不对。大学通过人才、论文、实验室和创业网络持续影响产业。', 'No. Universities shape industry through talent, papers, labs and startup networks.'],
    }),
    scene({
      q: ['这一站给“深圳速度”补充了什么?', 'What does this stop add to the story of Shenzhen speed?'],
      correct: ['补充长期科研、国际学术共同体和从实验室到市场的转化路径', 'It adds long-term research, global academic communities and lab-to-market translation'],
      wrong: ['速度越快越好,不需要基础研究和大学体系', 'The faster the better, with no need for basic research or universities'],
      rightFeedback: ['很好。湾区创新既需要快,也需要慢变量:人才培养、基础研究和国际合作。', 'Good. Bay Area innovation needs speed and slow variables: talent, basic research and global cooperation.'],
      wrongFeedback: ['不对。没有长期知识积累,速度很容易变成短跑,难以持续。', 'No. Without long-term knowledge, speed becomes a sprint and is hard to sustain.'],
    }),
  ],
  'N-SC06': [
    scene({
      q: ['中山大学南校园为什么适合作为“知识根系”来讲?', 'Why can SYSU South Campus be told as a knowledge root?'],
      correct: ['它代表现代高等教育在岭南长期扎根,持续输出人才和研究', 'It represents modern higher education rooted in Lingnan, producing talent and research over time'],
      wrong: ['老校园只剩怀旧价值,与今天湾区无关', 'Old campuses only have nostalgia value and no relation to todays Bay Area'],
      rightFeedback: ['对。湾区的创新不是凭空出现,它需要一代代大学和学科积累。', 'Yes. Bay Area innovation did not appear from nothing. It needs generations of university accumulation.'],
      wrongFeedback: ['不对。中山大学这样的长期教育机构,正是区域知识能力的根系。', 'No. Long-term institutions like SYSU are roots of regional knowledge capacity.'],
    }),
  ],
  'N-SC07': [
    scene({
      q: ['广东科学中心为什么不应被看作普通亲子场馆?', 'Why should Guangdong Science Center not be seen as only a family venue?'],
      correct: ['它把科学素养变成公共体验,为未来创新培养好奇心', 'It turns scientific literacy into public experience and grows curiosity for future innovation'],
      wrong: ['科普只是一种娱乐,不会影响创新生态', 'Science education is only entertainment and does not affect innovation ecology'],
      rightFeedback: ['正是。真正的创新生态不只在实验室,也在公众是否愿意理解科学。', 'Exactly. Innovation ecology lives not only in labs, but in whether the public understands science.'],
      wrongFeedback: ['不对。科普能影响下一代职业想象和社会对科学的信任。', 'No. Science education shapes career imagination and public trust in science.'],
    }),
  ],
  'N-SC08': [
    scene({
      q: ['散裂中子源为什么对制造业升级很关键?', 'Why is the spallation neutron source important for manufacturing upgrades?'],
      correct: ['它让科学家看见材料内部结构,从而改进能源、生命科学和工程材料', 'It lets scientists see internal material structure to improve energy, life science and engineering materials'],
      wrong: ['制造业只需要组装,不需要理解材料内部', 'Manufacturing only needs assembly and does not need material understanding'],
      rightFeedback: ['准确。高端制造的突破,常常先发生在材料结构和微观机制的理解里。', 'Correct. Advanced manufacturing breakthroughs often begin in materials and microscopic mechanisms.'],
      wrongFeedback: ['不对。越往高端制造走,越需要基础科学装置支撑材料理解。', 'No. Advanced manufacturing increasingly needs big-science facilities for material insight.'],
    }),
    scene({
      q: ['这个锚点为什么能提升整张地图的“科学含量”?', 'Why does this anchor raise the scientific depth of the whole map?'],
      correct: ['它说明湾区创新不只在应用层,也开始拥有国家级基础研究平台', 'It shows Bay Area innovation is not only applied, but also has national basic-research platforms'],
      wrong: ['大科学装置与区域创新没有联系', 'Big-science facilities have no connection with regional innovation'],
      rightFeedback: ['很好。散裂中子源让湾区从“会制造”走向“懂原理、能发现”。', 'Good. CSNS moves the Bay Area from making things to understanding principles and discovering.'],
      wrongFeedback: ['不对。大科学装置会吸引人才、课题和产业应用,是创新生态的深层基础。', 'No. Big-science facilities attract talent, research topics and industrial applications.'],
    }),
  ],
  'N-SC09': [
    scene({
      q: ['香港数码港和深圳硬件生态如何互补?', 'How does Hong Kong Cyberport complement Shenzhens hardware ecosystem?'],
      correct: ['它提供金融科技、数字内容、资本和国际服务网络接口', 'It offers fintech, digital content, capital and global service-network interfaces'],
      wrong: ['软件、资本和国际市场对硬件创新没有帮助', 'Software, capital and global markets do not help hardware innovation'],
      rightFeedback: ['对。湾区创新的完整链条,需要硬件、软件、资本和全球市场共同工作。', 'Yes. A complete innovation chain needs hardware, software, capital and global markets together.'],
      wrongFeedback: ['不对。硬件能否走向世界,常常取决于软件服务、融资和国际化能力。', 'No. Hardware reaching the world often depends on software services, finance and international capability.'],
    }),
    scene({
      q: ['为什么数码港适合讲“香港的创新角色”?', 'Why is Cyberport useful for explaining Hong Kongs innovation role?'],
      correct: ['它说明香港的优势不只在金融,也能转化为数字创业基础设施', 'It shows Hong Kongs financial strength can become digital startup infrastructure'],
      wrong: ['香港只适合做传统贸易,无法参与数字经济', 'Hong Kong only suits traditional trade and cannot join digital economy'],
      rightFeedback: ['正是。数码港把香港的资本、规则、国际连接转译成数字经济生态。', 'Exactly. Cyberport translates Hong Kongs capital, rules and global links into a digital economy ecosystem.'],
      wrongFeedback: ['不对。香港正在通过金融科技、数据服务和创业平台参与湾区创新。', 'No. Hong Kong participates through fintech, data services and startup platforms.'],
    }),
  ],
  'N-SC10': [
    scene({
      q: ['澳门大学横琴校区为什么是“融合”的日常样本?', 'Why is the University of Macau Hengqin Campus a daily sample of integration?'],
      correct: ['学生、教师、实验室和制度安排每天跨越边界协同运行', 'Students, teachers, labs and institutional arrangements cross boundaries every day'],
      wrong: ['融合只存在于口号中,不会进入校园生活', 'Integration only exists in slogans and never enters campus life'],
      rightFeedback: ['对。宏大的湾区合作,在这里变成通勤、上课、实验和生活管理的细节。', 'Yes. Grand cooperation becomes commuting, classes, experiments and daily management here.'],
      wrongFeedback: ['不对。横琴校区正是把制度融合落到校园日常的典型场景。', 'No. The Hengqin campus makes institutional integration a campus routine.'],
    }),
  ],
  'N-AW05': [
    scene({
      q: ['永庆坊的城市更新最需要避免什么?', 'What should Yongqing Fangs urban renewal most avoid?'],
      correct: ['把真实街坊生活替换成只有消费符号的空壳', 'Replacing real neighborhood life with an empty shell of consumption symbols'],
      wrong: ['保留街巷记忆和非遗内容', 'Preserving street memory and intangible heritage'],
      rightFeedback: ['准确。好的更新不是把老城“清空再包装”,而是让原有生活有尊严地继续。', 'Correct. Good renewal does not empty and repackage old city life, but lets it continue with dignity.'],
      wrongFeedback: ['不对。永庆坊的价值就在于街巷记忆、粤剧文化和日常烟火还在现场。', 'No. Its value is precisely street memory, Cantonese opera culture and everyday life remaining on site.'],
    }),
  ],
  'N-AW06': [
    scene({
      q: ['南风古灶为什么能把“味道”扩展到器物?', 'Why can Nanfeng Kiln extend taste into objects?'],
      correct: ['陶器承载饮食、审美和手艺,让生活方式有了物质形状', 'Ceramics carry food, aesthetics and craft, giving lifestyle a material shape'],
      wrong: ['餐桌上的器物不会影响地方生活方式', 'Tableware does not affect local lifestyle'],
      rightFeedback: ['没错。风味不只在入口那一刻,也在碗盏、火候和手艺里。', 'Yes. Flavor is not only the bite, but also vessels, firing and craft.'],
      wrongFeedback: ['不对。器物长期塑造饮食方式和审美习惯。', 'No. Objects shape eating habits and aesthetics over time.'],
    }),
  ],
  'N-AW07': [
    scene({
      q: ['石岐乳鸽为什么能讲出侨乡故事?', 'Why can Shiqi roast pigeon tell an overseas-Chinese story?'],
      correct: ['地方食物连接家族记忆、商贸往来和香山侨乡身份', 'Local food connects family memory, trade and Xiangshan overseas-Chinese identity'],
      wrong: ['食物只能提供口味,无法承载迁徙记忆', 'Food only provides taste and cannot carry migration memory'],
      rightFeedback: ['对。很多地方身份不是写在纪念碑上,而是保存在一张餐桌和一门手艺里。', 'Yes. Many local identities live not in monuments, but at a table and in a craft.'],
      wrongFeedback: ['不对。饮食常常是迁徙、家庭和地方认同最稳定的载体。', 'No. Food is often a stable carrier of migration, family and local identity.'],
    }),
  ],
  'N-AW08': [
    scene({
      q: ['官也街为什么像一条“味觉翻译街”?', 'Why is Rua do Cunha like a street of taste translation?'],
      correct: ['蛋挞、手信和街巷小吃把中西交流变成可入口的日常', 'Egg tarts, gifts and snacks turn East-West exchange into edible daily life'],
      wrong: ['澳门饮食越单一越能体现城市特色', 'The more uniform Macao food is, the more it shows city character'],
      rightFeedback: ['正是。澳门的混合身份不是抽象概念,常常就在甜、咸、酥、香之间。', 'Exactly. Macaus mixed identity is often found between sweet, savory, crisp and fragrant.'],
      wrongFeedback: ['不对。澳门最迷人的地方正在于多元味道共存。', 'No. Macaus charm lies in coexistence of many tastes.'],
    }),
  ],
  'N-AW09': [
    scene({
      q: ['大澳渔村为什么能修正我们对香港的单一想象?', 'Why can Tai O correct a single image of Hong Kong?'],
      correct: ['它让香港从金融天际线回到棚屋、水道和海上人家', 'It brings Hong Kong from finance skyline back to stilt houses, waterways and sea families'],
      wrong: ['香港只有高楼和金融,没有海岛社区记忆', 'Hong Kong only has towers and finance, with no island community memory'],
      rightFeedback: ['对。大澳让香港的海洋底色重新显影,也让城市叙事更完整。', 'Yes. Tai O reveals Hong Kongs maritime base color and completes the city story.'],
      wrongFeedback: ['不对。香港的离岛和渔村记忆是理解这座城市的重要部分。', 'No. Hong Kongs islands and fishing villages are vital to understanding the city.'],
    }),
  ],
  'N-AW10': [
    scene({
      q: ['道滘水乡的节令生活说明了什么?', 'What does Daojiaos seasonal water-town life show?'],
      correct: ['地方风味来自水网、农事、节庆和社区协作的长期配合', 'Local flavor comes from long cooperation among waterways, farming, festivals and community'],
      wrong: ['节令、龙舟和食物之间没有关系', 'Seasons, dragon boats and food have no relation'],
      rightFeedback: ['没错。水乡味道不是孤立菜品,而是一整套跟时间和水土同步的生活节奏。', 'Yes. Water-town flavor is not isolated dishes, but a rhythm synchronized with time and place.'],
      wrongFeedback: ['不对。道滘的龙舟、粽香和水网生活本来就是同一套地方节奏。', 'No. Daojiaos dragon boats, rice dumplings and waterways are one local rhythm.'],
    }),
  ],
  'N-NA05': [
    scene({
      q: ['南沙天后宫和南沙港放在一起看,能得出什么结论?', 'What can we conclude by reading Nansha Tianhou Palace with Nansha Port?'],
      correct: ['同一片海岸上,精神坐标和物流系统共同回应海洋', 'On the same coast, spiritual coordinates and logistics systems both respond to the sea'],
      wrong: ['古老信仰和现代港口之间没有任何叙事关系', 'Old belief and modern ports have no narrative relation'],
      rightFeedback: ['准确。技术改变了航海方式,但人面对海洋时对安全、方向和连接的需求一直存在。', 'Correct. Technology changed navigation, but safety, direction and connection remain human needs.'],
      wrongFeedback: ['不对。把它们并置,正能看见湾区海洋文明的连续性。', 'No. Reading them together reveals continuity in Bay Area maritime civilization.'],
    }),
  ],
  'N-NA06': [
    scene({
      q: ['妈阁庙为什么能讲出澳门名字背后的海洋性?', 'Why can A-Ma Temple tell the maritime nature behind Macaus name?'],
      correct: ['地名传说、妈祖信仰和葡萄牙航海者相遇在同一个港湾', 'Place-name legend, Mazu belief and Portuguese sailors met in one harbor'],
      wrong: ['澳门的名字与海湾、庙宇和航海者无关', 'Macaus name has nothing to do with bay, temple or sailors'],
      rightFeedback: ['正是。一个名字的形成,往往藏着港口城市最早的相遇场景。', 'Exactly. The formation of a name often hides the earliest encounter of a port city.'],
      wrongFeedback: ['不对。妈阁庙正是澳门海上起源叙事中最有象征力的地点。', 'No. A-Ma Temple is one of the strongest symbols of Macaus maritime origin.'],
    }),
    scene({
      q: ['这一站和大三巴、官也街共同说明了澳门什么特质?', 'What trait of Macau do A-Ma Temple, St Pauls and Rua do Cunha show together?'],
      correct: ['海港城市会把信仰、建筑和味觉都变成跨文化记忆', 'A port city turns belief, architecture and taste into cross-cultural memory'],
      wrong: ['澳门的文化层次彼此孤立,无法形成整体叙事', 'Macaus cultural layers are isolated and cannot form one narrative'],
      rightFeedback: ['很好。妈阁是海上源头,大三巴是石头立面,官也街是日常味觉,三者共同构成澳门的混合城市性。', 'Good. A-Ma is maritime origin, St Pauls is stone facade, Rua do Cunha is daily taste. Together they form Macaus mixed urbanity.'],
      wrongFeedback: ['不对。澳门最适合做成连续叙事,因为不同文化层次在很小空间里高度叠合。', 'No. Macau works as a continuous narrative because many cultural layers overlap in a small space.'],
    }),
  ],
  'N-NA07': [
    scene({
      q: ['桂山岛提醒我们地图上哪些地方不应被忽略?', 'What places does Guishan Island remind us not to ignore on the map?'],
      correct: ['海岛、航道、渔港和看似空白的海面网络', 'Islands, routes, fishing ports and the seemingly blank sea network'],
      wrong: ['只有陆地城区才算湾区,海面不重要', 'Only land districts count as the Bay Area, the sea is not important'],
      rightFeedback: ['对。大湾区首先是“湾”,海面不是空白,而是连接城市的基础空间。', 'Yes. The Bay Area is first a bay. The sea is not blank, but a base space connecting cities.'],
      wrongFeedback: ['不对。忽略海岛和航道,就无法理解湾区这个地理概念。', 'No. Ignoring islands and routes makes the Bay Area impossible to understand.'],
    }),
  ],
  'N-NA08': [
    scene({
      q: ['平海古城为什么让海洋叙事更完整?', 'Why does Pinghai Ancient City make the maritime story more complete?'],
      correct: ['它提醒我们开放贸易背后也有海防、军户和社区守望', 'It reminds us that behind open trade were coastal defense, garrisons and community watch'],
      wrong: ['讲海洋只能讲贸易,不能讲防御', 'Maritime stories can only discuss trade, not defense'],
      rightFeedback: ['准确。真正的海洋文明既要走出去,也要守得住。', 'Correct. A real maritime civilization both goes outward and holds the coast.'],
      wrongFeedback: ['不对。海防是沿海社会长期面对海洋风险的重要一面。', 'No. Coastal defense is a major side of long-term maritime risk.'],
    }),
  ],
  'N-NA09': [
    scene({
      q: ['长洲岛的节庆为什么不只是热闹?', 'Why are Cheung Chau festivals more than spectacle?'],
      correct: ['它们维系离岛社区、渔港信仰和渡海生活的共同记忆', 'They sustain island community, fishing-port belief and shared ferry-life memory'],
      wrong: ['节庆只负责吸引游客,不会保存社区关系', 'Festivals only attract tourists and do not preserve community relations'],
      rightFeedback: ['没错。小岛节庆常常是社区自我组织和历史记忆的年度更新。', 'Yes. Island festivals often renew community organization and memory each year.'],
      wrongFeedback: ['不对。长洲的节庆和渡轮、渔港、庙宇共同维系离岛生活。', 'No. Cheung Chau festivals, ferries, harbor and temples sustain island life together.'],
    }),
  ],
  'N-NA10': [
    scene({
      q: ['沙面岛为什么说明贸易史会进入城市制度?', 'Why does Shamian show that trade history enters urban institutions?'],
      correct: ['银行、洋行、领事馆和街区管理把贸易转化为金融与法律空间', 'Banks, firms, consulates and district management turned trade into financial and legal space'],
      wrong: ['贸易只发生在码头,不会影响城市建筑和制度', 'Trade only happens at docks and never affects urban buildings or institutions'],
      rightFeedback: ['对。沙面把港口贸易的后半段显影出来:合同、金融、领事和城市治理。', 'Yes. Shamian reveals the second half of port trade: contracts, finance, consulates and governance.'],
      wrongFeedback: ['不对。近代外贸深刻塑造了广州的建筑、街区和制度空间。', 'No. Modern foreign trade deeply shaped Guangzhous architecture, districts and institutions.'],
    }),
    scene({
      q: ['沙面岛和黄埔古港、十三行之间最好的串联方式是什么?', 'What is the best way to connect Shamian, Huangpu Ancient Port and the Thirteen Hongs?'],
      correct: ['从船舶停靠,到行商交易,再到近代金融和领事空间', 'From ships docking, to merchant trade, then to modern finance and consular space'],
      wrong: ['三者互不相关,只能分别作为景点讲解', 'They are unrelated and can only be explained as separate sights'],
      rightFeedback: ['很好。这条线能把广州海贸史讲成一个连续演化的城市系统。', 'Good. This line turns Guangzhous maritime trade history into a continuous urban system.'],
      wrongFeedback: ['不对。三者恰好构成广州外贸从港口到制度空间的递进链条。', 'No. They form a progression from port to institutional space.'],
    }),
  ],
};
