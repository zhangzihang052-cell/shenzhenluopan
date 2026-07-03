// 剧情副本扩展题库
// 目标：
// - 所有锚点副本至少 2 题，避免体验过薄。
// - 重点锚点追加第 3 题，形成「事实理解 → 关系判断 → 价值提炼」的叙事层次。

function text(zh, en) {
  return { zh, en };
}

function option(item, correct) {
  return {
    text: text(item.text[0], item.text[1]),
    correct,
    feedback: text(item.feedback[0], item.feedback[1]),
  };
}

function scene({ q, correct, wrong, wrong2, rightFeedback, wrongFeedback, wrong2Feedback, correctIndex = 0, speaker = 0 }) {
  const right = option({ text: correct, feedback: rightFeedback }, true);
  const distractors = [
    option({ text: wrong, feedback: wrongFeedback }, false),
  ];
  if (wrong2 && wrong2Feedback) distractors.push(option({ text: wrong2, feedback: wrong2Feedback }, false));
  const options = distractors.slice();
  options.splice(Math.max(0, Math.min(correctIndex, options.length)), 0, right);
  return {
    speaker,
    q: text(q[0], q[1]),
    options,
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
      q: ['前海最难的不是造楼,而是造规则,为什么?', 'Why is Qianhais hardest task not building towers, but building rules?'],
      correct: ['它要把深港合作、金融开放、法律服务和跨境规则衔接放进同一片试验区', 'It must align Shenzhen-Hong Kong cooperation, financial opening, legal services and cross-border rules in one pilot zone'],
      wrong: ['前海只是普通地产开发,核心价值在楼宇密度', 'Qianhai is just real-estate development, and its core value is building density'],
      wrong2: ['只要交通接上香港,制度和服务规则自然会跟上', 'Once transport connects to Hong Kong, rules and services will naturally follow'],
      rightFeedback: ['准确。前海的关键不在填海后能建多少楼,而在能否把投资便利、金融开放、法律服务和深港规则衔接做成可复制的制度样本。楼宇是外壳,规则才是引擎。', 'Correct. Qianhais key is not how many towers can rise on reclaimed land, but whether investment, finance, legal services and Shenzhen-Hong Kong rule alignment can become a repeatable institutional model. Buildings are the shell; rules are the engine.'],
      wrongFeedback: ['这个判断把表面当成了核心。前海当然有城市建设,但国家赋予它的是全面深化改革创新试验平台和高水平开放门户的任务,不是普通商业地产项目。', 'That mistakes the surface for the core. Qianhai has urban construction, but its mandate is to be a reform-and-opening pilot platform and high-level gateway, not an ordinary real-estate project.'],
      wrong2Feedback: ['交通只能缩短距离,不能自动解决规则差异。前海要处理的是金融、法律、人才、贸易等服务体系如何对接,这比修一条路更难,也更能体现制度创新。', 'Transport shortens distance, but it does not automatically solve rule differences. Qianhai must connect finance, law, talent and trade services; that is harder than building a road and better shows institutional innovation.'],
      correctIndex: 1,
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
      q: ['唐代远洋商船为什么必须在屯门等风?', 'Why did Tang ocean-going ships need to wait for wind at Tuen Mun?'],
      correct: ['屯门处在珠江口外港位置,商船要借季风窗口补给、停泊并进入广州水道', 'Tuen Mun was an outer harbour of the Pearl River mouth, where ships used monsoon windows to resupply, anchor and enter routes toward Guangzhou'],
      wrong: ['因为唐代广州没有海贸,船只只能停在香港水域', 'Because Tang Guangzhou had no maritime trade, ships could only stop in Hong Kong waters'],
      wrong2: ['主要是为了躲避城市税收,与航行条件关系不大', 'Mainly to avoid urban taxes, with little relation to sailing conditions'],
      rightFeedback: ['正是。史籍记载广州东南海行可至屯门山,唐代还设置屯门镇防守海口。它不是终点港,而是远洋船进入广州前读风、补给和等候的关键外港。', 'Exactly. Historical records place Tuen Mun on the sea route southeast of Guangzhou, and Tang records mention a Tuen Mun garrison guarding the sea entrance. It was not the final port, but a key outer harbour for wind, supplies and waiting.'],
      wrongFeedback: ['这个说法反了。广州正是唐宋以来重要的对外贸易港口之一,屯门的价值来自它与广州水道的关系:远洋船要先在珠江口外找到安全窗口。', 'This reverses the logic. Guangzhou was an important foreign-trade port; Tuen Muns value came from its relationship with the Guangzhou route, where ocean ships needed a safe window at the estuary.'],
      wrong2Feedback: ['税收可能影响商人选择,但解释不了季风航海。古代远航最硬的约束是风向、潮汐、淡水和避风条件,屯门正好承担这些外港功能。', 'Taxes could affect merchants, but they do not explain monsoon navigation. Ancient voyages were constrained by wind, tides, water and shelter; Tuen Mun served those outer-harbour functions.'],
      correctIndex: 2,
    }),
  ],
  'N-NA03': [
    scene({
      q: ['维港成为贸易枢纽的真正关键是什么?', 'What truly made Victoria Harbour a trade hub?'],
      correct: ['天然深水避风港、自由港制度、金融服务和全球航线共同放大了它的位置优势', 'Deep sheltered waters, free-port institutions, financial services and global routes amplified its location together'],
      wrong: ['只要海景漂亮,港口自然会成为国际贸易中心', 'A beautiful harbour view naturally turns a port into an international trade centre'],
      wrong2: ['只靠深水条件就足够,制度和航线网络并不重要', 'Deep water alone is enough; institutions and route networks are not important'],
      rightFeedback: ['准确。维港的力量不是单一条件,而是深水良港、南中国海位置、自由港制度、仓储金融和航运网络叠加。少了制度和航线,深水也只是地理潜力。', 'Correct. Victoria Harbour was powerful because deep sheltered water, South China Sea location, free-port rules, warehousing, finance and shipping networks worked together. Without systems and routes, deep water is only geographic potential.'],
      wrongFeedback: ['夜景是今天的城市记忆,不是贸易枢纽的成因。真正改变香港命运的是港湾条件与全球航运、自由港制度、金融和转口贸易一起形成的系统能力。', 'The night view is urban memory, not the cause of a trade hub. Hong Kongs fate changed through harbour conditions combined with global shipping, free-port rules, finance and entrepot trade.'],
      wrong2Feedback: ['深水是底盘,但不是全部。许多深水港没有成为全球枢纽,因为还缺制度、航线、资本和服务业网络；维港恰恰把这些要素组合了起来。', 'Deep water is the base, not the whole story. Many deep-water ports never become global hubs because they lack rules, routes, capital and services; Victoria Harbour combined them.'],
      correctIndex: 1,
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
  P02: [
    scene({
      q: ['广九铁路给湾区留下的真正遗产是什么?', 'What is the real legacy of the Kowloon-Canton Railway for the Bay Area?'],
      correct: ['它把人员、货物和观念沿铁路线压缩到同一套跨境流动节奏里', 'It compressed people, goods and ideas into a shared cross-border rhythm along the railway'],
      wrong: ['铁路只是交通工具,不会改变城市关系', 'A railway is only transport and cannot change city relations'],
      wrong2: ['它只服务观光旅行,与近代商贸和人口流动无关', 'It served only sightseeing, unrelated to modern trade and migration'],
      rightFeedback: ['准确。广九铁路不是一条孤立铁轨,而是把广州、深圳、香港之间的通勤、贸易和信息交换变得更稳定。后来湾区的跨城日常,可以从这类近代交通基础设施里找到早期影子。', 'Correct. The railway was not an isolated track; it stabilized commuting, trade and information between Guangzhou, Shenzhen and Hong Kong. Later Bay Area daily mobility has an early shadow in this kind of modern infrastructure.'],
      wrongFeedback: ['这个判断低估了交通的制度后果。铁路一旦固定班次、站点和边界手续,城市之间就不再只是地图上的邻居,而开始形成可预期的经济与生活联系。', 'That underestimates the institutional effect of transport. Once timetables, stations and border procedures exist, cities become predictable economic and daily partners, not just neighbours on a map.'],
      wrong2Feedback: ['观光只是铁路的一小部分。广九铁路更重要的是把货物、劳工、商人和学生送进同一条走廊,使珠江口东岸的城市联系持续加密。', 'Sightseeing was only a small part. More importantly, the railway carried goods, workers, merchants and students through one corridor, thickening links on the Pearl River east bank.'],
      correctIndex: 2,
    }),
  ],
  M04: [
    scene({
      q: ['如果没有大鹏所城这样的海防节点,珠江口会失去什么?', 'What would the Pearl River mouth lose without coastal-defense nodes like Dapeng Fortress?'],
      correct: ['海贸通道会少一道军事屏障,地方聚落也更难在海盗和外敌压力下稳定生长', 'Maritime routes would lose a military shield, and local settlements would struggle under piracy and foreign threats'],
      wrong: ['海防只会阻碍贸易,对沿海社会没有保护意义', 'Coastal defense only blocks trade and offers no protection to coastal society'],
      wrong2: ['只要有商船和市场,海岸就天然安全', 'As long as there are ships and markets, the coast is naturally safe'],
      rightFeedback: ['正是。大鹏所城的意义不只是城墙,而是明清海防体系把风险挡在珠江口外。贸易要开放,也要有守望者；鹏城之名背后,藏着深圳更早的海防记忆。', 'Exactly. Dapeng Fortress matters not just as walls, but as part of a Ming-Qing coastal-defense system holding risks outside the estuary. Trade needs openness and guardians; behind Pengcheng lies an older defense memory.'],
      wrongFeedback: ['这把防御和开放对立得太简单。没有稳定海防,商船、渔村和市场都更容易被海盗、走私和战事扰动,贸易也难以长期持续。', 'This too simply opposes defense and openness. Without stable coastal defense, ships, fishing villages and markets are more vulnerable to pirates, smuggling and war, making trade harder to sustain.'],
      wrong2Feedback: ['市场不能自动带来安全。沿海社会长期要处理风浪、盗患和外来军事压力,所以所城、炮台和水师才会成为港口秩序的一部分。', 'Markets do not automatically produce safety. Coastal communities long faced weather, piracy and military pressure, which is why forts, batteries and naval forces became part of port order.'],
      correctIndex: 1,
    }),
  ],
  M05: [
    scene({
      q: ['中英街最适合让外宾理解哪种边界经验?', 'What kind of border experience does Chung Ying Street best explain to international visitors?'],
      correct: ['一条街可以同时承载边界、日常贸易、身份记忆和改革开放前后的生活差异', 'One street can hold a boundary, everyday trade, identity memory and the life differences before and after reform'],
      wrong: ['边界只是一条线,不会进入居民日常生活', 'A border is only a line and never enters daily life'],
      wrong2: ['它只是购物街,不需要放进历史叙事', 'It is only a shopping street and does not belong in historical narrative'],
      rightFeedback: ['准确。中英街的特殊性在于边界不在远处,而在脚下。居民购物、通行、亲缘和制度差异都被压进一条街,它让宏大的近代边界史变成可触摸的日常现场。', 'Correct. The street is special because the boundary is not distant; it is underfoot. Shopping, passage, kinship and institutional difference are compressed into one street, making modern border history tangible.'],
      wrongFeedback: ['边界当然是线,但它也会变成票证、关卡、价格、亲属往来和生活想象。中英街的价值正是让人看见边界如何进入日常。', 'A border is a line, but also permits, checkpoints, prices, kinship visits and imagination. Chung Ying Street shows how borders enter daily life.'],
      wrong2Feedback: ['购物是现象,不是全部。中英街之所以值得讲,是因为消费背后连着近代边界、香港与深圳关系、以及改革开放前后生活落差的记忆。', 'Shopping is the surface, not the whole story. The street matters because consumption connects to modern boundaries, Hong Kong-Shenzhen relations and memories of life before and after reform.'],
    }),
  ],
  M09: [
    scene({
      q: ['文天祥后人的故事为什么不应只讲成家族传奇?', 'Why should the descendants of Wen Tianxiang not be told only as a family legend?'],
      correct: ['它把忠义记忆、宗族迁徙和岭南地方社会的精神传承连在一起', 'It links loyalist memory, clan migration and the moral inheritance of Lingnan local society'],
      wrong: ['家族记忆只属于私人生活,无法进入城市文化叙事', 'Clan memory is private life and cannot enter urban cultural narrative'],
      wrong2: ['只要记住一句诗,就足够理解这条历史线', 'Remembering one poem is enough to understand this historical line'],
      rightFeedback: ['正是。文天祥的意义不止在诗句,也在后人如何迁徙、立祠、续谱,把国家危亡时的道德选择变成地方社会长期保存的精神坐标。', 'Exactly. Wen Tianxiang matters not only through a poem, but through descendants migrating, building shrines and keeping genealogies, turning a moral choice in national crisis into a local spiritual coordinate.'],
      wrongFeedback: ['宗族记忆并不只是私事。祠堂、族谱和祭祀把个人家史嵌入地方公共文化,也是岭南社会保存历史价值的一种方式。', 'Clan memory is not merely private. Shrines, genealogies and rites place family history inside public local culture, a way Lingnan society preserves values.'],
      wrong2Feedback: ['诗句能打开入口,但不能替代历史理解。真正有力量的是诗背后的遭遇、选择和后世传承,这条链条才让记忆跨过朝代。', 'The poem opens the door, but cannot replace historical understanding. The power lies in the experience, choice and later inheritance behind it, the chain that carries memory across dynasties.'],
      correctIndex: 1,
    }),
  ],
  M10: [
    scene({
      q: ['观澜版画从革命木刻走向国际艺术村,说明了什么?', 'What does Guanlan printmaking show as it moves from revolutionary woodcut to an international art village?'],
      correct: ['一种地方技艺可以先服务社会动员,再转化为全球艺术交流语言', 'A local craft can first serve social mobilization and later become a language of global artistic exchange'],
      wrong: ['版画只能属于过去的宣传工具,没有当代生命力', 'Printmaking can only be an old propaganda tool with no contemporary life'],
      wrong2: ['只要变成旅游景点,原来的艺术精神就必然消失', 'Once it becomes a tourist site, its artistic spirit must disappear'],
      rightFeedback: ['准确。木刻版画曾因可复制、传播快而参与时代动员；今天观澜把刻刀、纸墨和驻留创作带进国际对话。它不是断裂,而是媒介生命的转场。', 'Correct. Woodcuts once joined social mobilization through reproducibility and speed; today Guanlan brings carving, ink and residencies into international dialogue. That is not rupture, but a change of stage.'],
      wrongFeedback: ['这个看法太窄。版画的复制性、黑白张力和手工痕迹仍有当代价值,只是从街头动员转向美术馆、驻留和跨文化创作。', 'That view is too narrow. Printmakings reproducibility, black-white force and hand traces still matter, shifting from street mobilization to galleries, residencies and cross-cultural creation.'],
      wrong2Feedback: ['旅游化确实可能稀释内容,但不是必然。关键在于是否保留创作、教育和艺术家交流机制；观澜的价值正是让旧技艺继续生产新作品。', 'Tourism can dilute meaning, but not inevitably. The key is whether creation, education and artist exchange remain; Guanlans value is letting an old craft keep producing new works.'],
      correctIndex: 2,
    }),
  ],
  'N-CV01': [
    scene({
      q: ['可园为什么能用很小的面积讲出岭南空间智慧?', 'Why can Keyuan express Lingnan spatial wisdom in such a small area?'],
      correct: ['它靠连廊、借景、叠石和曲折动线把有限空间组织成多层意境', 'It uses corridors, borrowed views, rocks and winding movement to turn limited space into layered atmosphere'],
      wrong: ['园林价值主要看面积大小,越大越能代表文化', 'A gardens value depends mainly on size; bigger means more cultural value'],
      wrong2: ['它只是张敬修的私人爱好,与岭南建筑传统无关', 'It was only Zhang Jingxius private hobby, unrelated to Lingnan architectural tradition'],
      rightFeedback: ['正是。可园的高明不在大,而在小中见大:一步一景、廊道转折、山石与水面互相借势,让咫尺空间产生山林气象。', 'Exactly. Keyuans brilliance is not size, but vastness inside smallness: scenes unfold step by step, corridors turn, rocks and water borrow from each other, creating a forest-like mood in inches.'],
      wrongFeedback: ['这个判断忽略了岭南园林的核心。可园恰恰证明面积不是全部,空间组织、视线控制和生活诗意才决定园林的文化厚度。', 'This misses the core of Lingnan gardens. Keyuan proves size is not everything; spatial organization, sightline control and poetic living create cultural depth.'],
      wrong2Feedback: ['私人园林也能沉淀地方传统。可园把岭南文人生活、造园手法和建筑审美合在一起,后来成为理解岭南园林的重要样本。', 'A private garden can still crystallize local tradition. Keyuan combines Lingnan literati life, garden methods and architectural aesthetics, becoming an important sample of Lingnan gardens.'],
    }),
  ],
  'N-CV03': [
    scene({
      q: ['鹤湖新居这样的客家围屋为什么像一部迁徙史?', 'Why is a Hakka walled house like Hehu Xinju a history of migration?'],
      correct: ['它把防御、宗祠、合族居住和迁徙后的安全焦虑写进同一座建筑', 'It writes defense, ancestral rites, clan living and migrant security anxiety into one building'],
      wrong: ['围屋只是民居样式,和迁徙、防御、宗族没有关系', 'A walled house is only a housing style, unrelated to migration, defense or clan life'],
      wrong2: ['客家建筑只要看外形,不必理解里面的生活制度', 'For Hakka architecture, the exterior shape is enough; inner social life is unnecessary'],
      rightFeedback: ['准确。客家人长期迁徙,需要既能住人、祭祖、议事,又能防御风险的空间。围龙屋不是造型奇观,而是把家族秩序和生存策略凝成建筑。', 'Correct. Long-migrating Hakka communities needed space for living, ancestral rites, deliberation and defense. The walled house is not a visual curiosity, but clan order and survival strategy in architecture.'],
      wrongFeedback: ['这把建筑看扁了。围屋的门楼、围合、宗祠和房间秩序都回应迁徙社会的安全与组织需求,不是随便形成的民居样式。', 'That flattens the building. Its gate, enclosure, ancestral hall and room order answer the safety and organization needs of a migrant society, not a random house type.'],
      wrong2Feedback: ['外形只是入口。真正重要的是谁住在里面、怎样祭祖、怎样分房、怎样共同防御；这些制度让一座房子变成族群记忆。', 'The exterior is only the entry. The real questions are who lives inside, how they worship ancestors, divide rooms and defend together; those systems turn a house into group memory.'],
      correctIndex: 1,
    }),
  ],
  'N-EG01': [
    scene({
      q: ['“三天一层楼”如果只被理解成快,会漏掉什么?', 'What is missed if "one floor in three days" is understood only as speed?'],
      correct: ['它也是改革初期组织效率、建设信心和城市信用被同时建立的过程', 'It was also a process of building organizational efficiency, confidence and urban credibility in early reform'],
      wrong: ['速度就是全部,质量、组织和象征意义都不重要', 'Speed is everything; quality, organization and symbolism do not matter'],
      wrong2: ['它只是单个工地的偶然纪录,不能代表深圳叙事', 'It was only an accidental record on one site and cannot represent Shenzhens story'],
      rightFeedback: ['正是。国贸大厦的速度被记住,不是因为数字漂亮,而是它在改革初期把施工组织、城市信心和外界想象一起抬升。深圳速度首先是一种可被看见的动员能力。', 'Exactly. ITCs speed is remembered not because the number looks good, but because it lifted construction organization, civic confidence and external imagination at once. Shenzhen Speed first meant visible mobilization capacity.'],
      wrongFeedback: ['只讲快会变成口号。真正的深圳速度必须同时回答怎么组织、怎么保证质量、怎么让一座城市相信自己可以追上世界。', 'Only saying fast turns it into a slogan. Real Shenzhen Speed must also explain organization, quality and how a city came to believe it could catch up with the world.'],
      wrong2Feedback: ['国贸当然是一个工地,但它成为城市记忆,说明它击中了时代情绪。改革初期需要可见证据,而这栋楼正好把信心建成了高度。', 'ITC was one site, but it became civic memory because it struck the mood of the era. Early reform needed visible evidence, and this tower built confidence into height.'],
      correctIndex: 2,
    }),
  ],
  'N-EG04': [
    scene({
      q: ['东深供水工程为什么比普通水利工程更适合放进湾区叙事?', 'Why does the Dongjiang-Shenzhen Water Supply Project belong in the Bay Area story more than an ordinary water project?'],
      correct: ['它把生存需求、跨境供水和长期协作变成香港与内地之间最稳定的物质连接', 'It turned survival need, cross-border water supply and long cooperation into one of the most stable material links between Hong Kong and the mainland'],
      wrong: ['供水只是技术问题,不会产生区域共同体记忆', 'Water supply is only technical and creates no regional memory'],
      wrong2: ['只要有资金,任何地方都能立刻复制这种工程', 'With enough money, any place can instantly copy this kind of project'],
      rightFeedback: ['准确。东深供水的特殊性在于它几十年持续运行,把东江水送到香港日常生活里。桥梁连接道路,而水连接身体,这种连接更基础也更难被遗忘。', 'Correct. Its special power is decades of continuous operation, bringing Dongjiang water into Hong Kongs daily life. Bridges connect roads, but water connects bodies; that link is deeper and harder to forget.'],
      wrongFeedback: ['技术当然重要,但水利工程一旦跨越城市和边界,就会变成生活共同体的证据。每天打开水龙头,其实也在使用一段区域协作史。', 'Technology matters, but once water crosses cities and boundaries, it becomes evidence of a living community. Every tap also uses a history of regional cooperation.'],
      wrong2Feedback: ['资金不能替代水源、地形、治理和长期维护。东深供水难在工程之外:它需要持续协调、稳定管理和对民生需求的长期承诺。', 'Money cannot replace water sources, terrain, governance or maintenance. The projects difficulty lies beyond engineering: coordination, stable management and long-term commitment to livelihood.'],
    }),
  ],
  'N-AW01': [
    scene({
      q: ['沙井蚝为什么不是普通地方特产?', 'Why are Shajing oysters more than a local specialty?'],
      correct: ['它把珠江口咸淡水环境、养殖技艺和粤菜鲜味传统连成一条风味链', 'They link Pearl River brackish waters, cultivation techniques and Cantonese freshness into one flavor chain'],
      wrong: ['只要换个地方养同样的蚝,风味就完全一样', 'If the same oysters are farmed elsewhere, the flavor will be identical'],
      wrong2: ['地方食物只关乎口味,无法说明水文和产业关系', 'Local food is only taste and cannot explain hydrology or industry'],
      rightFeedback: ['正是。沙井蚝的味道来自水域、潮汐和人的养殖经验共同作用。它让“鲜”不再只是形容词,而是珠江口自然条件和岭南饮食技艺的结果。', 'Exactly. Shajing oyster flavor comes from waters, tides and farming experience together. Freshness becomes not an adjective, but the result of estuary conditions and Lingnan culinary skill.'],
      wrongFeedback: ['这忽略了风土。蚝种重要,但咸淡水比例、潮汐、温度和养殖方式都会改变肉质与鲜味,地方食物往往离不开地方水土。', 'This ignores terroir. Species matters, but salinity, tides, temperature and cultivation all change texture and flavor; local food often depends on local waters.'],
      wrong2Feedback: ['口味背后常有生态和产业。沙井蚝连着珠江口水文、养殖社区、调味品和粤菜餐桌,正适合用来解释湾区风味如何生成。', 'Behind taste are ecology and industry. Shajing oysters connect estuary hydrology, farming communities, condiments and Cantonese tables, making them ideal for explaining Bay Area flavor.'],
      correctIndex: 1,
    }),
  ],
  'N-AW02': [
    scene({
      q: ['深井烧鹅的价值为什么不只在“好吃”?', 'Why is Sham Tseng roast goose valuable beyond being delicious?'],
      correct: ['它把火候、腌制、炉具和街坊餐饮网络变成可传承的粤式烧腊技艺', 'It turns heat control, marinating, ovens and neighbourhood dining networks into a transmissible Cantonese roasting craft'],
      wrong: ['烧鹅只靠食材贵,和技艺关系不大', 'Roast goose depends only on expensive ingredients, not craft'],
      wrong2: ['名店越多,越说明传统技艺已经不重要', 'The more famous restaurants there are, the less traditional craft matters'],
      rightFeedback: ['准确。深井烧鹅的核心是火候和工序:上皮水、风干、入炉、控温、出油都要经验判断。它让一门街坊手艺被城市反复验证,最后成为香港味道的标识。', 'Correct. Its core is process: glazing, air-drying, roasting, temperature and fat control all require judgement. A neighbourhood craft was repeatedly tested by the city and became a marker of Hong Kong taste.'],
      wrongFeedback: ['食材只是起点。粤式烧腊最怕火候失衡,皮脆、肉滑、汁多要靠师傅经验,不是单靠贵食材就能换来。', 'Ingredients are only the start. Cantonese roasting depends on balance; crisp skin, tender meat and juice require experience, not just costly ingredients.'],
      wrong2Feedback: ['名店化不必然消灭技艺,反而可能让技艺被更严格地复制和比较。问题在于是否仍尊重工序,而不是只追求招牌。', 'Famous restaurants do not necessarily erase craft; they can make craft more rigorously repeated and compared. The issue is whether process is respected, not whether the brand is famous.'],
      correctIndex: 2,
    }),
  ],
  'N-AW03': [
    scene({
      q: ['顺德被称为美食之都,最不该被误读成什么?', 'What is the biggest misunderstanding of Shundes status as a food capital?'],
      correct: ['不能只把它看成餐厅密集,更要看食材、河网、厨师训练和地方生活共同塑造的饮食系统', 'It should not be reduced to many restaurants; ingredients, waterways, chef training and local life form a food system together'],
      wrong: ['美食之都只是营销称号,不需要历史和技艺支撑', 'Food capital is only marketing and needs no history or craft'],
      wrong2: ['只要菜式精致,就与地方水土和市井生活无关', 'If dishes are refined, they have nothing to do with local waters or everyday life'],
      rightFeedback: ['正是。顺德菜的底层逻辑是水乡物产、厨师行当和对“鲜”的长期训练。它不是一份菜单,而是一套从鱼市到灶台、从家宴到酒楼的地方系统。', 'Exactly. Shunde cuisine rests on water-town produce, chef guilds and long training in freshness. It is not a menu, but a local system from fish market to stove, family banquet to restaurant.'],
      wrongFeedback: ['这个说法太轻。称号背后若没有稳定的食材、技艺、师承和公共认可,很快就会空心化；顺德的价值正在于这些基础很厚。', 'That is too light. Without produce, technique, apprenticeship and public recognition, a title becomes hollow; Shundes value lies in the depth of those foundations.'],
      wrong2Feedback: ['精致并不等于脱离地方。顺德许多烹法都围绕河鲜、时令和本味展开,越高级越要回到水土和日常经验。', 'Refinement does not mean detachment. Many Shunde methods revolve around river fish, seasons and natural flavor; the more refined, the more they return to place and daily experience.'],
    }),
  ],
  'N-NA02': [
    scene({
      q: ['伶仃洋如果只作为工程海面被看见,会漏掉什么?', 'What is missed if Lingding Ocean is seen only as an engineering seascape?'],
      correct: ['会漏掉文天祥诗篇、珠江口航道和近现代跨海连接叠在同一片水域的历史厚度', 'It misses the historical depth where Wen Tianxiangs poem, Pearl River routes and modern cross-sea links overlap in one water space'],
      wrong: ['海面没有历史,只有今天的桥梁和船流', 'The sea has no history, only todays bridges and vessel traffic'],
      wrong2: ['文学记忆和交通工程完全无关,不应放在同一条线讲', 'Literary memory and transport engineering are unrelated and should not be told together'],
      rightFeedback: ['准确。伶仃洋既是珠江口航道,也是“人生自古谁无死”的记忆现场,今天又承载跨海工程。它让同一片海同时拥有诗、路和城市群。', 'Correct. Lingding Ocean is a Pearl River route, the remembered site of Wen Tianxiangs famous line, and now a space of cross-sea engineering. One sea holds poetry, routes and a city cluster.'],
      wrongFeedback: ['海面当然有历史。航线、战事、诗篇、桥梁都会在水域上叠加,只是这些痕迹不像城墙那样容易被看见。', 'The sea absolutely has history. Routes, wars, poems and bridges all layer over water, though the traces are less visible than city walls.'],
      wrong2Feedback: ['文学和工程不是同一件事,但可以讲同一片水域如何被不同时代赋义。伶仃洋的价值就在于这种跨时代叠合。', 'Literature and engineering are not the same, but they can explain how one water space gains meaning across eras. Lingding Oceans value lies in that overlap.'],
      correctIndex: 1,
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
  M01: [
    scene({
      q: ['明永乐年间郑和下西洋,船队出海前为何要在赤湾天后宫祭拜妈祖?', 'Why did Zheng Hes fleet worship Mazu at Chiwan Tianhou Temple before setting sail?'],
      correct: ['赤湾地处珠江口东岸,是远洋船队出洋前的重要补给与祭拜节点,妈祖信仰被视为航海平安的庇佑', 'Chiwan sits on the east bank of the Pearl River estuary, serving as a key resupply and worship point before ocean voyages, with Mazu belief seen as protection for safe sailing'],
      wrong: ['赤湾天后宫只是清代渔民自发修建的小庙,与郑和船队无关', 'Chiwan Tianhou Temple was only a small shrine built by Qing fishermen and had nothing to do with Zheng Hes fleet'],
      wrong2: ['郑和船队信奉伊斯兰教,不会在妈祖庙祭拜', 'Zheng Hes fleet practiced Islam and would not worship at a Mazu temple'],
      rightFeedback: ['赤湾天后宫始建于宋代,明永乐年间郑和率船队七下西洋,赤湾是珠江口远洋航线的重要起点。船队出海前在此祭拜妈祖,祈求航海平安,这一传统反映了明代国家航海事业与妈祖信仰的深度结合。明永乐至宣德年间,郑和船队规模庞大,每次出洋都需在沿海港口补给修整,赤湾因其扼守珠江口的地理位置而成为关键节点。', 'Chiwan Tianhou Temple was first built in the Song dynasty. During the Yongle reign of the Ming, Zheng He led seven maritime expeditions, and Chiwan was a key departure point on the Pearl River estuary. The fleet worshipped Mazu here before sailing, reflecting the deep integration of state maritime enterprise and Mazu belief.'],
      wrongFeedback: ['赤湾天后宫并非清代才有的小庙,其历史可追溯至宋代,明代已是珠江口重要的官方祭海场所。郑和下西洋时,妈祖信仰已被朝廷敕封为天妃,郑和本人也曾奏请修建妈祖庙,赤湾天后宫正是这一航海信仰体系的重要组成部分。将赤湾与郑和船队割裂,忽略了明代国家航海战略与沿海妈祖信仰网络之间的密切关联。', 'Chiwan Tianhou Temple dates back to the Song dynasty, not the Qing. By the Ming it was already an official sea-sacrifice site. Zheng He petitioned to build Mazu temples, and Chiwan was part of this maritime belief network.'],
      wrong2Feedback: ['郑和虽然出身穆斯林家庭,但郑和下西洋是明代国家行为,船队成员信仰多元,祭拜妈祖是当时航海界的普遍习俗,也是朝廷推崇的官方信仰。明永乐七年,成祖封妈祖为天妃,郑和在太仓、长乐等地也修建天妃宫。因此郑和船队在赤湾祭拜妈祖完全符合历史事实,不能以个人信仰背景否定这一史实。', 'Although Zheng He came from a Muslim family, the expeditions were a state enterprise with diverse crew beliefs. Mazu worship was a common maritime custom and official faith. Emperor Yongle enfeoffed Mazu as Tianfei in 1409.'],
      correctIndex: 0,
    }),
  ],
  M03: [
    scene({
      q: ['南头古城的历史可追溯到东晋咸和六年(331年)设东官郡,"东官"之名来源于什么?', 'Nantou Citys history traces to 331 AD when Dongguan Commandery was established. Where does the name "Dongguan" come from?'],
      correct: ['汉代在此地设有盐官机构,"东官"即东部盐官的简称,后演变为郡名', 'The Han dynasty set up a salt official here; "Dongguan" abbreviates "eastern salt official" and later became the commandery name'],
      wrong: ['"东官"是明代东莞县令的官职名称,与盐业无关', '"Dongguan" was the title of a Ming dynasty county magistrate, unrelated to salt'],
      wrong2: ['"东官"源自当地一个叫东官的土著部落名称', '"Dongguan" came from a local indigenous tribe of the same name'],
      rightFeedback: ['东晋咸和六年(331年),朝廷设东官郡,治所就在今南头古城一带。"东官"之名可追溯至汉代,当时南海郡设有盐官,管理珠江口沿海盐业,此地因位于东部而称"东官"。从盐官机构到郡名,反映了深圳地区早在1700年前就因盐业资源而具有行政地位。南头古城作为东官郡治所,是深港地区最早的行政中心,这一历史脉络使南头成为理解深圳古代城市起源的关键。', 'In 331 AD, the Eastern Jin established Dongguan Commandery with its seat near present-day Nantou. The name traces to the Han dynasty salt official. This reflects that the Shenzhen area had administrative significance 1,700 years ago due to salt resources.'],
      wrongFeedback: ['"东官"并非明代官职。早在东晋咸和六年(331年)已有东官郡,比明代早了千年以上。汉代南海郡设盐官管理沿海盐业,此地位于盐官辖区东部,故称"东官"。南头古城作为东官郡治所,是深港地区行政建制的起点。将"东官"归于明代,等于抹去了南头从汉代盐官到东晋郡治再到明清所城的完整城市沿革。', 'Dongguan is not a Ming title. The commandery existed in 331 AD, over a thousand years before the Ming. The name comes from the Han salt official. Nantou as the commandery seat is the starting point of administrative history in the Shenzhen-Hong Kong region.'],
      wrong2Feedback: ['"东官"并非源自部落名称,而是与汉代盐官制度直接相关。汉代在南海郡设盐官,管理珠江口盐田,此地位于盐官辖区东部,故简称"东官"。东晋咸和六年(331年)正式设东官郡,治所在南头。考古发现也证实,南头一带自汉代起就有盐业生产活动,屋背岭遗址更将这一区域的人类活动史推至商代。', 'The name is not from a tribe but from the Han salt official system. Archaeological evidence confirms salt production in the Nantou area since the Han dynasty, and the Wubeiling site pushes human activity here back to the Shang dynasty.'],
      correctIndex: 1,
    }),
  ],
  M07: [
    scene({
      q: ['深圳湾红树林为什么是东半球候鸟迁徙路线上的关键驿站?它与哪种全球珍稀鸟类关系最密切?', 'Why is Shenzhen Bay mangrove a key stopover on the Eastern Hemisphere migratory bird route? Which globally rare bird is most closely associated with it?'],
      correct: ['黑脸琵鹭,全球种群约6000只,每年冬季在深圳湾越冬,红树林湿地为其提供觅食和栖息地', 'The black-faced spoonbill, with a global population of about 6,000, winters in Shenzhen Bay where mangrove wetlands provide feeding and habitat'],
      wrong: ['丹顶鹤,全球仅存约3000只,每年从北方飞至深圳湾越冬', 'The red-crowned crane, with only about 3,000 globally, flies to Shenzhen Bay each winter'],
      wrong2: ['白鹭,虽然常见但并非全球珍稀候鸟,与红树林生态保护关系不大', 'The egret, though common, is not a globally rare migrant and has little connection to mangrove conservation'],
      rightFeedback: ['深圳湾红树林位于东亚-澳大利西亚候鸟迁徙路线(EAAF)上,是东半球最重要的候鸟驿站之一。福田红树林自然保护区成立于1984年,是中国面积最小的国家级自然保护区,却保护了约200种鸟类。黑脸琵鹭是全球六大鹮科濒危物种之一,2023年全球同步调查记录到约6600只,其中深圳湾是重要的越冬地。红树林的根系为底栖生物提供生境,底栖生物又支撑候鸟食物链,形成完整的湿地生态系统。', 'Shenzhen Bay mangrove sits on the East Asian-Australasian Flyway. The Futian reserve, established in 1984, is Chinas smallest national reserve yet protects about 200 bird species. The black-faced spoonbill, with roughly 6,600 individuals recorded in 2023 global counts, winters here.'],
      wrongFeedback: ['丹顶鹤的主要越冬地在江苏盐城和日本,并非深圳湾。深圳湾红树林最关键的珍稀候鸟是黑脸琵鹭,全球仅约6000只,被IUCN列为濒危物种。黑脸琵鹭对栖息地要求极高,需要大面积浅水滩涂觅食,深圳湾红树林湿地恰好满足这一条件。混淆越冬地会导致对候鸟保护优先级的误判,红树林的保护价值正在于它为黑脸琵鹭等濒危物种提供了不可替代的越冬生境。', 'Red-crowned cranes winter mainly at Yancheng in Jiangsu and in Japan, not Shenzhen Bay. The key rare bird here is the black-faced spoonbill, with about 6,000 globally, listed as endangered by IUCN.'],
      wrong2Feedback: ['白鹭虽然常见于红树林,但并非红树林生态保护的核心指标物种。真正代表深圳湾红树林保护价值的是黑脸琵鹭,全球仅约6000只,每年冬季在深圳湾越冬。黑脸琵鹭的种群数量直接反映湿地生态健康程度,2023年全球同步调查记录到约6600只,其中深圳湾是重要越冬地之一。保护红树林不仅保护常见鸟类,更关键的是为全球濒危物种提供栖息地。', 'Although egrets are common in mangroves, they are not the key indicator species. The black-faced spoonbill, with about 6,000 globally, represents the conservation value of Shenzhen Bay mangrove. Its population directly reflects wetland ecological health.'],
      correctIndex: 2,
    }),
  ],
  'N-AW04': [
    scene({
      q: ['元朗盆菜的起源与哪一历史事件直接相关?', 'Which historical event is directly linked to the origin of Yuen Long Poon Choi?'],
      correct: ['南宋1279年崖山海战后,帝昺南逃至新界围村,村民以盆菜款待随行官兵', 'After the 1279 Battle of Yashan in the late Southern Song, Emperor Bing fled to the New Territories walled villages, where villagers served Poon Choi to the retreating soldiers'],
      wrong: ['明代郑和下西洋途经中国香港,元朗村民以盆菜犒劳船队', 'Zheng Hes fleet passed through Hong Kong, China during the Ming, and Yuen Long villagers served Poon Choi to reward the crew'],
      wrong2: ['清代林则徐虎门销烟后,元朗围村以盆菜宴待虎门水师', 'After Lin Zexus destruction of opium at Humen in the Qing, Yuen Long walled villages served Poon Choi to the Humen naval force'],
      rightFeedback: ['南宋祥兴二年(1279年),元军与南宋残余势力在崖山展开海战,宋军覆灭,丞相陆秀夫负帝昺投海。据新界围村世代相传,帝昺南逃途中曾经过新界,围村村民以木盆盛装菜肴款待随行官兵,因条件简陋便将各种食材层层叠放于一盆之中,这便是盆菜的起源。围村盆菜因此承载着南宋遗民的忠义记忆,成为新界宗族文化的重要象征,至今仍在打醮、宗族祭祀等场合中制作。', 'In 1279, the Yuan and Southern Song fought the Battle of Yashan. Lu Xiufu carried Emperor Bing into the sea. According to walled village tradition, the emperor passed through the New Territories, and villagers served food in wooden basins, the origin of Poon Choi.'],
      wrongFeedback: ['郑和下西洋发生在明代永乐至宣德年间(1405-1433年),比南宋灭亡晚了一百多年,与盆菜起源无关。盆菜的起源传说明确指向南宋末年帝昺南逃新界的历史事件。1279年崖山海战后,南宋覆亡,相传帝昺途经新界,围村村民以木盆盛菜款待随行官兵。这一传说虽难以严格考证,但与南宋末年的历史背景高度吻合,且已成为新界围村宗族文化认同的核心叙事。', 'Zheng Hes voyages (1405-1433) occurred over a century after the Song fell, unrelated to Poon Choi. The origin story points to Emperor Bings flight to the New Territories after the 1279 Battle of Yashan.'],
      wrong2Feedback: ['林则徐虎门销烟发生在1839年,属于清代中后期,而盆菜的起源传说指向南宋末年(1279年),两者相隔近600年。新界围村盆菜的核心叙事是南宋帝昺南逃时村民以盆盛菜款待官兵,这一传统至今在元朗、锦田、粉岭等围村的宗族活动中延续。围村盆菜的制作讲究层层叠放,食材从底层萝卜、枝竹到顶层焖猪肉、鸡鸭,象征宗族凝聚力和共享精神。', 'Lin Zexus opium destruction was in 1839, nearly 600 years after the Song fell. Poon Chois origin story points to the late Southern Song. Walled village Poon Choi is made in layers, symbolizing clan cohesion and sharing.'],
      correctIndex: 0,
    }),
  ],
  'N-SC03': [
    scene({
      q: ['大疆创新(DJI)由汪滔于哪一年创立?其核心技术竞争力是什么?', 'In what year did Wang Tao found DJI, and what is its core technological competitive advantage?'],
      correct: ['2006年创立,以飞行控制系统(飞控)为核心技术竞争力', 'Founded in 2006, with flight control systems as its core technological competitive advantage'],
      wrong: ['2010年创立,以无人机航拍摄影技术为核心竞争力', 'Founded in 2010, with aerial photography technology as its core advantage'],
      wrong2: ['2008年创立,以无线图传技术为核心竞争力', 'Founded in 2008, with wireless video transmission as its core advantage'],
      rightFeedback: ['大疆创新由汪滔于2006年在深圳创立,最初在香港科技大学宿舍中研发直升机飞控系统。汪滔的本科毕业论文正是关于直升机自主悬停飞控算法,这项技术成为大疆最核心的竞争力。2013年大疆推出精灵(Phantom)系列一体机,将飞控、云台、航拍整合为消费级产品,迅速占领全球消费级无人机市场。大疆的成功体现了深圳硬件创新生态的优势:供应链完备、迭代速度快、工程师密集,使飞控技术从实验室原型快速转化为量产产品。', 'DJI was founded by Wang Tao in Shenzhen in 2006. He developed helicopter flight control systems in his HKUST dorm. His thesis on autonomous hovering algorithms became DJIs core technology. The Phantom series in 2013 integrated flight control, gimbal and aerial photography into a consumer product.'],
      wrongFeedback: ['大疆创立于2006年,而非2010年。汪滔2006年从香港科技大学毕业后即在深圳创办大疆,最初专注直升机飞控系统的研发。航拍摄影虽然是大疆产品的重要功能,但并非最核心的技术壁垒。大疆真正的竞争力在于飞控算法,即让无人机实现稳定悬停、精准定位和自主飞行的底层控制系统。2013年推出的精灵系列之所以能迅速占领市场,正是因为飞控技术降低了消费级无人机的操作门槛。', 'DJI was founded in 2006, not 2010. Wang Tao started the company after graduating from HKUST, focusing on helicopter flight control. Aerial photography is a key feature but not the core barrier; flight control algorithms are.'],
      wrong2Feedback: ['大疆创立于2006年,而非2008年。虽然无线图传是大疆产品链中的重要技术,但大疆最核心的竞争力始终是飞控系统。汪滔在香港科技大学攻读本科和研究生期间,研究方向就是直升机自主悬停飞控算法。2006年创业后,大疆首先推出的产品就是飞控板,供航模爱好者使用。无线图传、云台稳定、视觉避障等技术是后来逐步叠加的能力,但飞控始终是大疆技术体系的基石,也是其区别于其他无人机厂商的根本所在。', 'DJI was founded in 2006, not 2008. Wireless video transmission is important but not the core. Flight control is DJIs foundation. Wang Taos research at HKUST focused on autonomous hovering algorithms, and DJIs first product was a flight control board for hobbyists.'],
      correctIndex: 1,
    }),
  ],
};
