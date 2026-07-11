# 喀喇昆仑侧八千米峰 —— 事实密度补齐笔记

> 采集红线:8000ers.com = AVOID(未使用)。事实层来源:Wikidata(QID 主键,CC0)+ 英文维基百科 + NASA Earth Observatory。首登史与海拔均经 Wikidata 与维基百科交叉印证。
> 采集日期:2026-07-12。

## 「6 座」口径说明(核心结论)

喀喇昆仑山脉**独立**的八千米峰(即列入公认「十四座」的独立山峰)只有 **4 座**:

| 峰 | 海拔 | 全球排名 |
|---|---|---|
| K2 乔戈里峰 | 8611 m | 2 |
| Gasherbrum I(隐峰) | 8080 m | 11 |
| Broad Peak 布洛阿特峰 | 8051 m | 12 |
| Gasherbrum II | 8034 m | 13 |

issue 说的「6 座」并非把 Nanga Parbat 算进来 —— **Nanga Parbat 属西喜马拉雅**(喜马拉雅山脉最西端锚点),不是喀喇昆仑,只是同在巴基斯坦 Gilgit-Baltistan,常与前四座并称「巴基斯坦 5 座八千米峰」。

「6 座」最站得住脚的事实解释是 **按「海拔超过 8000 米的顶峰(含次高峰)」计数**:Broad Peak 是一条山脊上的复合体,含三个越过 8000 米的顶:
- 主峰 8051 m
- Rocky Summit(岩石峰)8028 m
- Central Summit(中央峰)8011 m

于是喀喇昆仑越过 8000 米的**顶峰**共 **6 个**:K2、Gasherbrum I、Gasherbrum II、Broad Peak 主峰、Broad Peak Rocky、Broad Peak Central。这与「6 座」吻合。

注意:Rocky/Central 因相对山脊鞍部突起不足(prominence 太小)不构成独立山峰,**不计入十四座**;它们是 Broad Peak 的次高峰。因此:
- **独立八千米峰口径 = 4 座**(项目 peaks.ts 现有的 4 座,正确)
- **8000 米顶峰口径(含次高峰) = 6 座**(issue 的说法,可自洽)

建议在前端用「4 座独立主峰」为准,若要体现「6」可在 Broad Peak 词条内标注两处次高峰,避免把次高峰误列为独立山峰。

---

## 逐峰事实卡(均高置信)

### K2 乔戈里峰 · Q43512
- 海拔 8611 m(Wikidata P2044 / 维基百科一致);坐标 35.8811, 76.5133
- 山脉:喀喇昆仑 - Baltoro Muztagh(巴尔托洛)
- 首登:1954-07-31,意大利队;Ardito Desio 领队;Lino Lacedelli 与 Achille Compagnoni 登顶;路线 **Abruzzi Spur(阿布鲁齐山脊)**
- 冬季首登:2021-01-16,尼泊尔团队(Nirmal Purja / Nimsdai + Mingma Gyalje Sherpa 领衔的十人队)—— 十四座中最后一座被冬攀征服
- 死亡率:2021 前约「每 4 人登顶 1 人殒命」;截至 2023-08 约 800 人登顶 / 96 死。别名「野蛮之峰(Savage Mountain)」,源自 1953 年 George Bell 的话。

### Gasherbrum I(隐峰 / Hidden Peak)· Q187138
- 海拔 8080 m;坐标 35.7244, 76.6964;突起 2155 m;全球第 11
- 山脉:喀喇昆仑 Gasherbrum 群
- 首登:1958-07-05,美国队;领队 Nicholas B. Clinch(8 人队);Pete Schoening 与 Andy Kauffman 登顶;路线 **Roch Ridge(IHE / 西北支脉)**
- 名字:Montgomerie 1856 年编号 K5;「Hidden Peak」由 W.M. Conway 1892 命名,因深藏 Gasherbrum 群之后、从巴尔托洛冰川难以窥见。Gasherbrum 源自 Balti 语「rgasha(美)+ brum(山)」= 美丽之山
- 里程碑:1975 年 Messner 与 Habeler 以纯阿尔卑斯式(无氧、无搬运工、3 天)完成 —— 八千米峰史上首次真正阿式登顶。2012 年 Bielecki / Gołąb(波兰)冬季首登。

### Broad Peak 布洛阿特峰 · Q180996
- 海拔 8051 m(主峰);坐标 35.8106, 76.5681;突起 1701 m;全球第 12
- 次高峰:Rocky Summit 8028 m、Central Summit 8011 m(均 >8000 但不足独立)
- 山脉:喀喇昆仑,紧邻 K2
- 首登:1957-06-09(6/8 出发、6/9 登顶),奥地利队;领队 Marcus Schmuck;登顶四人 Fritz Wintersteller、Marcus Schmuck、Kurt Diemberger、Hermann Buhl;路线 **West Spur(西支脉)**;**无氧、无高山搬运工、无大本营支援** 的极简阿式风格 —— 当年八千米峰上罕见
- 冬季首登:2013-03-05,波兰队 Berbeka / Bielecki / Kowalski / Małek;下撤中 Berbeka 与 Kowalski 遇难
- 关联:Buhl 首登 Broad Peak 后不久,于近旁 Chogolisa(乔戈里萨)踩穿雪檐坠亡

### Gasherbrum II · Q186853
- 海拔 8034 m(Wikidata;维基百科作 8035);坐标 35.7575, 76.6528;突起 1524 m;全球第 13
- 山脉:喀喇昆仑 Gasherbrum 群
- 首登:1956-07-07,奥地利队;Fritz Moravec(兼领队)、Josef Larch、Hans Willenpart 登顶;路线 **Southwest Ridge(西南山脊)**
- 冬季首登:2011-02-02,Cory Richards、Denis Urubko、Simone Moro(无氧无搬运工,曾遭四级雪崩掩埋)—— **首座被冬攀的喀喇昆仑八千米峰**
- 公认技术门槛较低、较易接近,是许多人进入 8000 米俱乐部的首选之一;有 ABC 起算 10 小时内的速攀记录

---

## 来源(均真实可达)

- Wikidata: Q43512(K2)、Q187138(GI)、Q180996(Broad Peak)、Q186853(GII) —— https://www.wikidata.org/wiki/Q43512 等
- Wikipedia: en.wikipedia.org/wiki/K2 · /Gasherbrum_I · /Broad_Peak · /Gasherbrum_II
- NASA Earth Observatory「8,000-meter Peaks of the Himalaya and Karakoram」—— https://science.nasa.gov/earth/earth-observatory/8000-meter-peaks-of-the-himalaya-and-karakoram-82581/

## 与现有 peaks.ts 的核对

现有 4 座 Karakoram 条目的海拔、坐标、首登日期、登顶者、队伍均与 Wikidata/维基百科一致,无需更正。可补的字段:**route(路线)**、**首登领队全名**(GI 的 Clinch、Broad Peak 的 Schmuck)、**次高峰**(Broad Peak 的 Rocky/Central,用于解释「6」)、以及冬季首登的精确信息。集成由主控做,此处不改 peaks.ts。
