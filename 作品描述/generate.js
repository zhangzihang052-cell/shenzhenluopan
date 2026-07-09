const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat } = require('docx');

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'SimSun', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'SimHei' },
        paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 0 } },
    ]
  },
  numbering: {
    config: [{
      reference: 'bullets',
      levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    }]
  },
  sections: [{
    properties: {
      page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
        children: [new TextRun({ text: '湾区罗盘（Bay Compass）', size: 36, bold: true, font: 'SimHei' })]
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 360 },
        children: [new TextRun({ text: '可探索、可规划、可留念、可分享的 APEC 文化交互地图', size: 22, color: '555555', font: 'SimSun' })]
      }),

      // 一、用户痛点
      new Paragraph({ heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: '一、用户痛点 / 鹅民观察', bold: true, font: 'SimHei' })]
      }),
      new Paragraph({ spacing: { after: 60 },
        children: [new TextRun({ text: '在接待 APEC 外宾过程中，传统导览有三个系统性失效：', font: 'SimSun', size: 22 })]
      }),
      new Paragraph({ spacing: { after: 50 }, numbering: { reference: 'bullets', level: 0 },
        children: [
          new TextRun({ text: '信息孤立：', bold: true, font: 'SimSun', size: 22 }),
          new TextRun({ text: '地点被当作孤立"景点"，访客无法串联文明脉络。"深圳只有 40 年历史"的刻板印象根深蒂固。', font: 'SimSun', size: 22 })
        ]
      }),
      new Paragraph({ spacing: { after: 50 }, numbering: { reference: 'bullets', level: 0 },
        children: [
          new TextRun({ text: '缺乏参与感：', bold: true, font: 'SimSun', size: 22 }),
          new TextRun({ text: '被动聆听式讲解没有记忆锚点，听完就忘，外宾无法真正"带走"大湾区。', font: 'SimSun', size: 22 })
        ]
      }),
      new Paragraph({ spacing: { after: 160 }, numbering: { reference: 'bullets', level: 0 },
        children: [
          new TextRun({ text: '无法个性化：', bold: true, font: 'SimSun', size: 22 }),
          new TextRun({ text: '有人想看海上丝路、有人关心科技崛起、有人只想记录旅途瞬间，但传统导览只有一条固定路线。', font: 'SimSun', size: 22 })
        ]
      }),

      // 二、解决思路
      new Paragraph({ heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: '二、解决思路', bold: true, font: 'SimHei' })]
      }),
      new Paragraph({ spacing: { after: 80 },
        children: [new TextRun({ text: '以全屏水墨地图为底座，构建三引擎并列架构：', font: 'SimSun', size: 22 })]
      }),
      new Paragraph({ spacing: { after: 50 }, numbering: { reference: 'bullets', level: 0 },
        children: [
          new TextRun({ text: '探索附近：', bold: true, font: 'SimSun', size: 22 }),
          new TextRun({ text: '64 个文化锚点覆盖大湾区 11 城，每个锚点配备 RPG 剧情副本（历史叙事 + 线索探索 + 思辨问答），完成后点亮专属印章。地图采用纯矢量水墨渲染（宣纸底色 + 黛青朱印二分年代色 + 浓墨海岸线），放大始终锐利。', font: 'SimSun', size: 22 })
        ]
      }),
      new Paragraph({ spacing: { after: 50 }, numbering: { reference: 'bullets', level: 0 },
        children: [
          new TextRun({ text: '留下记忆：', bold: true, font: 'SimSun', size: 22 }),
          new TextRun({ text: '拍照/录像/录音 + 文字，在地图上钉下私人金色记忆锚点。好友当天可见（次日隐藏），制造"限时窥见"社交动力。支持生成水墨分享卡片和旅行明信片，可下载或原生分享。', font: 'SimSun', size: 22 })
        ]
      }),
      new Paragraph({ spacing: { after: 80 }, numbering: { reference: 'bullets', level: 0 },
        children: [
          new TextRun({ text: '路线规划：', bold: true, font: 'SimSun', size: 22 }),
          new TextRun({ text: '混合勾选文化/个人/好友四类锚点，自动生成专属路线。六语言国际化（中/英/日/韩/俄/西），游客无需注册直接使用，右上角可选邮箱登录云端同步。', font: 'SimSun', size: 22 })
        ]
      }),
      new Paragraph({ spacing: { after: 160 },
        children: [new TextRun({ text: '核心叙事：地理坐标 + 古代微小事件/人物 = 对现代中国与世界的巨大影响。', font: 'SimSun', size: 22, italics: true })]
      }),

      // 三、AI 在其中的作用
      new Paragraph({ heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: '三、AI 在其中的作用', bold: true, font: 'SimHei' })]
      }),
      new Paragraph({ spacing: { after: 50 }, numbering: { reference: 'bullets', level: 0 },
        children: [
          new TextRun({ text: '内容生成引擎：', bold: true, font: 'SimSun', size: 22 }),
          new TextRun({ text: 'AI 参与编制全部 64 个文化锚点的 RPG 剧情副本，包含带年代/人物/感官细节的旁白、史实问答（4 选项 + 知识 feedback）、线索探索（含真实历史细节），以及"从小事件到全球影响"的因果链洞察，遵循不套模板的质量标准。', font: 'SimSun', size: 22 })
        ]
      }),
      new Paragraph({ spacing: { after: 160 }, numbering: { reference: 'bullets', level: 0 },
        children: [
          new TextRun({ text: '个性化感悟生成：', bold: true, font: 'SimSun', size: 22 }),
          new TextRun({ text: '"我的回忆"系统中，AI 基于记忆 ID 哈希生成多语言诗意感悟（6 语言），同一条记忆每次文案一致；生成旅行明信片时根据记忆特征动态生成旅程总结。全程客户端模板池 + 哈希机制，离线可用。', font: 'SimSun', size: 22 })
        ]
      }),

      // 四、落地路径与可行性
      new Paragraph({ heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: '四、落地路径与可行性', bold: true, font: 'SimHei' })]
      }),
      new Paragraph({ spacing: { after: 50 }, children: [
        new TextRun({ text: '当前状态：', bold: true, font: 'SimSun', size: 22 }),
        new TextRun({ text: 'V2.0 已上线可演示，部署于 Cloudflare Pages（CDN 全球加速），GitHub 推送自动部署。', font: 'SimSun', size: 22 })
      ]}),
      new Paragraph({ spacing: { after: 50 }, children: [
        new TextRun({ text: '技术栈：', bold: true, font: 'SimSun', size: 22 }),
        new TextRun({ text: '无构建静态前端（原生 ES Modules），MapLibre GL JS + deck.gl CDN 引入，Supabase 免费档提供数据库/存储/邮箱认证，零后端服务器。', font: 'SimSun', size: 22 })
      ]}),
      new Paragraph({ spacing: { after: 50 }, children: [
        new TextRun({ text: '降级兜底：', bold: true, font: 'SimSun', size: 22 }),
        new TextRun({ text: 'Supabase 不可用 → 纯访客本地模式；GPS 失败 → 模拟定位；地图 API 失败 → OSRM/直线概览；网络不可达 → 全功能离线保留。', font: 'SimSun', size: 22 })
      ]}),
      new Paragraph({ spacing: { after: 160 }, children: [
        new TextRun({ text: '后续路线与范式意义：', bold: true, font: 'SimSun', size: 22 }),
        new TextRun({ text: '路线规划升级（2-3 天）→ 集成打磨 → APEC 路演定制版（1-2 周）。单人开发 + AI 辅助内容 + 免运维后端 + CDN 零部署成本，为 APEC 各经济体示范低成本数字化文化创作范式。', font: 'SimSun', size: 22 })
      ]}),

      // 五、对 APEC 议题的价值
      new Paragraph({ heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: '五、对 APEC 议题的价值', bold: true, font: 'SimHei' })]
      }),
      new Paragraph({ spacing: { after: 50 }, numbering: { reference: 'bullets', level: 0 },
        children: [
          new TextRun({ text: '数字化包容性：', bold: true, font: 'SimSun', size: 22 }),
          new TextRun({ text: '无需下载 App、无需注册，一个链接任意设备打开，降低不同经济体访客的使用门槛。', font: 'SimSun', size: 22 })
        ]
      }),
      new Paragraph({ spacing: { after: 50 }, numbering: { reference: 'bullets', level: 0 },
        children: [
          new TextRun({ text: '区域经济一体化：', bold: true, font: 'SimSun', size: 22 }),
          new TextRun({ text: '地图覆盖 11 城，可视化呈现"跨区域经济走廊"的中国实践。科技走廊、贸易枢纽等锚点本身就是经济一体化的实体注脚。', font: 'SimSun', size: 22 })
        ]
      }),
      new Paragraph({ spacing: { after: 50 }, numbering: { reference: 'bullets', level: 0 },
        children: [
          new TextRun({ text: '文明互鉴：', bold: true, font: 'SimSun', size: 22 }),
          new TextRun({ text: '"地理坐标 + 古代微小事件 = 对现代世界的巨大影响"这一核心叙事，恰好是 APEC "互联互通"蓝图中"人与人的连接"最生动的文化诠释。', font: 'SimSun', size: 22 })
        ]
      }),
      new Paragraph({ spacing: { after: 50 }, numbering: { reference: 'bullets', level: 0 },
        children: [
          new TextRun({ text: '记忆即外交：', bold: true, font: 'SimSun', size: 22 }),
          new TextRun({ text: '外宾在真实坐标留下照片和感受，生成水墨分享卡片。当代表回国后手机上保留"深圳湾 22.5°N"的卡片——这就是最长效的文化传播。', font: 'SimSun', size: 22 })
        ]
      }),

      new Paragraph({ spacing: { before: 400, after: 120 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: '— END —', font: 'SimSun', size: 20, color: '999999' })]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('湾区罗盘作品详细描述.docx', buffer);
  console.log('Done: 湾区罗盘作品详细描述.docx');
}).catch(err => { console.error(err); process.exit(1); });
