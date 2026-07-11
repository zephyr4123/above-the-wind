# 14 座八千米峰 · 首登史引用源(可追溯)

> 为 `web/src/data/peaks.ts` 每座峰的策展首登事实(登顶者 / 年份 / 路线)挂公开可达、可溯源的引用。
> 由 WebSearch / WebFetch 逐条核对,2026-07-12。**不修改 peaks.ts**(集成由主控做)。

## 许可现实(诚实说明)

这 14 座首登发生在 1950–1964。**当年的官方远征志(Herzog《Annapurna》、Buhl《Nanga Parbat》、Desio《La Conquista del K2》、Tichy《Cho Oyu》等)全部仍在版权期**(作者 life+70),不是公有领域。项目已采集的 1921/1922/1924 珠峰官方远征志虽是 PD,但**只覆盖珠峰的早期侦察与尝试,不覆盖这 14 座里的任何一次首登**。

因此本轮引用的定位是**「可追溯 + 公开可读」而非「公版可转载」**,分三层,按 SOURCES.md 的优先级:

- **① 当年同期期刊记述(最接近一手)**:The Himalayan Journal(himalayanclub.org 免费全文)、American Alpine Journal(publications.americanalpineclub.org)、Alpine Journal(alpinejournal.org.uk 免费 PDF)。这些**版权归各俱乐部所有**,官方公开托管、任何人可读——按 SOURCES.md 把 AAJ 归为「事实核验线索,不搬正文与图」的口径,**只作溯源引用,不得转载正文/图**。
- **② 权威百科**:英文 Wikipedia 的**专条**(多为独立远征条目),正文 CC-BY-SA 4.0,且在 References 里指回一手源——满足「能标出其引用的一手源」。
- **③ 权威纪录方**:Guinness World Records 首登条目,专有版权,仅作事实佐证(who/when),不入库正文。

所有事实均与 peaks.ts 现值**逐条吻合**,无冲突;全部 high 置信。唯一需在集成层注明的是:**这些引用可点击溯源,但除 Wikipedia(CC-BY-SA)外多为版权所有的公开条目,展示层引用时标来源、不复制正文**。

## 已核实为真实可达的关键源

- Everest 1953 Himalayan Journal HJ/18/1 —— WebFetch 确认为 Charles Wylie 编、含 Hillary 第一人称「To the Summit」的同期记述,明载 29 May 1953、Hillary+Tenzing。
- Shishapangma 1964 Alpine Journal PDF —— WebFetch 确认 alpinejournal.org.uk 免费托管的真实 PDF(2.4MB),即 AJ 1964 pp.211-216「The Ascent of Shisha Pangma」。

## 逐峰引用

| 峰 | 首登事实(peaks.ts) | ① 同期期刊 | ② 百科 / ③ 纪录 |
|---|---|---|---|
| Everest | 1953-05-29 Hillary·Tenzing / 英国队(Hunt)/ 南坳-东南山脊 | HJ/18/1 Everest 1953 | Wiki: 1953 British Mount Everest expedition |
| K2 | 1954-07-31 Lacedelli·Compagnoni / 意大利队(Desio)/ Abruzzi Spur | HJ/19/7 1954 Italian Expedition … K2 | Wiki: 1954 Italian expedition to K2 |
| Kangchenjunga | 1955-05-25 Brown·Band / 英国队 / 止步真顶下 | HJ/75/4 Kangchenjunga 1955 | Wiki: 1955 British Kangchenjunga expedition |
| Lhotse | 1956-05-18 Luchsinger·Reiss / 瑞士队 | AAJ「Everest — Lhotse, 1956」 | Wiki: Fritz Luchsinger |
| Makalu | 1955-05-15 Couzy·Terray / 法国队(Franco)/ 全队登顶 | (HJ Vol XIX 有 Franco 记述) | Wiki: 1955 French Makalu expedition + GWR |
| Cho Oyu | 1954-10-19 Tichy·Jöchler·Pasang Dawa Lama / 奥地利小队 / NW 脊 | HJ Vol XIX Tichy「Cho Oyu」(译 Barbara Tobin) | Wiki: Cho Oyu + GWR |
| Dhaulagiri I | 1960-05-13 Diemberger 等 6 人 / 瑞士-奥地利国际队 | HJ/22/6 Dhaulagiri 1960 Chronicle | GWR: first ascent of Dhaulagiri I |
| Manaslu | 1956-05-09 Imanishi·Gyalzen Norbu / 日本队(Maki) | HJ/20/2 The Ascent of Manaslu | Wiki: Manaslu |
| Nanga Parbat | 1953-07-03 Buhl 单人冲顶 / 奥德队(Herrligkoffer)/ 无氧 | —— | Wiki: 1953 German–Austrian Nanga Parbat expedition + Wiki: Hermann Buhl |
| Annapurna I | 1950-06-03 Herzog·Lachenal / 法国队 / 无氧 | —— | Wiki: 1950 French Annapurna expedition + Explorersweb |
| Gasherbrum I | 1958-07-05 Schoening·Kauffman / 美国队(Clinch) | HJ/21/5 The Ascent of Gasherbrum I | Wiki: Gasherbrum I |
| Broad Peak | 1957-06-09 Buhl·Diemberger·Schmuck·Wintersteller / 奥地利四人队 / 阿式无氧 | HJ/21/1 Broad Peak and Chogolisa, 1957 | GWR: first ascent of Broad Peak |
| Gasherbrum II | 1956-07-07 Moravec·Larch·Willenpart / 奥地利队 / SW 脊 | HJ/20/3 Austrian Karakoram Expedition, 1956 | Wiki: Gasherbrum II |
| Shishapangma | 1964-05-02 许竞领衔中国队(10 人登顶)/ 北侧路线 | AJ 1964「The Ascent of Shisha Pangma」PDF | Wiki: Shishapangma |

## 集成建议

- 三个「真顶争议」峰(Shishapangma / Annapurna 未争 / Manaslu)以及 K2 的 Bonatti 争议:peaks.ts 现值均取公认口径,无需改;若日后加「争议 flag」,K2 可引 Wiki「1954 Italian Karakoram expedition controversy」。
- 展示层引用期刊/AAJ/AJ 源时:**标题+链接+「© 各俱乐部,公开可读」**,不复制正文段落与图。
- Wikipedia 引用可标 CC-BY-SA 4.0;若逐字复用其文字需署名+share-alike,否则只做事实提取。
