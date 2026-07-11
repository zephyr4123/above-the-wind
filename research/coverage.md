# 12 领域数据覆盖矩阵

> availability: rich(富) / moderate(中) / thin(薄)


## 8000ers(14 座八千米峰) — **rich**
- **最佳源**: Wikidata(CC0 事实骨架)+ Himalayan Database(尼泊尔侧8座远征/死亡/用氧金标准,CAUTION 抽事实)+ SRTM(海拔校验)+ Wikipedia 列表(署名)
- **缺口**: 喀喇昆仑/巴基斯坦侧6座(K2/Nanga Parbat/GI/GII/Broad Peak)无 HD 等价库,唯一系统源 8000ers.com=AVOID;'真顶争议'(Shishapangma/Annapurna/Manaslu)致各库登顶数不一,需存 source+disputed-flag;海拔存在竞争值(8848.86 vs 8848),须存 source+year

## iconic-peaks(非8000标志峰:马特洪/艾格/Denali/阿空加瓜/乞力马扎罗/七大洲/大岩壁) — **rich**
- **最佳源**: Wikidata(CC0)+ GeoNames(CC-BY)+ OSM(ODbL)+ NPS Denali(联邦公版统计)+ Gutenberg/IA(Whymper/Muir PD 全文)+ NASA 影像
- **缺口**: 七大洲最高峰榜单权威源 Peakbagger=AVOID,需从 Wikidata/GNIS 重建;大岩壁路线拓扑 Mountain Project=CC-BY-NC 未纳入;swisstopo 官方测绘许可待核;现代攀登照片(Dawn Wall/free solo)受版权

## expeditions(1786→今首登编年) — **rich**
- **最佳源**: Wikidata + Wikipedia list-articles(编年骨架)+ Himalayan Database(尼泊尔远征)+ Gutenberg/IA(1786-1930 一手叙事)
- **缺口**: Wikidata 首登属性覆盖不均(常在 P793 限定符或仅在正文),需从 Wikipedia infobox + HD 回填;非尼泊尔区域(喀喇昆仑/Alaska/Andes)一手报告在 AAJ=AVOID,只能事实核验;K2 Bonatti 事件等细节历史争议需标 flag

## mountaineers(传奇登山家小传) — **rich**
- **最佳源**: Wikidata(生卒/国籍/获奖/死亡地)+ Wikipedia 多语传记(波语/意语更详)+ Himalayan Database(远征逐条)
- **缺口**: 波兰黄金一代(Rutkiewicz/Kukuczka/Wielicki)最详资料在波兰语源需补;人物肖像可复用性逐图核 Commons,在世人物近照多专有+涉肖像权;现代登山家著作(Messner/Krakauer)全在版权期只作引用

## disasters(著名山难与生还史诗) — **moderate**
- **最佳源**: Wikidata(事件/伤亡结构化)+ Wikipedia 专条+List of deaths on eight-thousanders(可解析为结构化行)+ Himalayan Database(尼泊尔侧逐人死因)+ Mummery 1895(PD,南迦灾难史起点)
- **缺口**: 1985-2008 现代灾难奠基名著(Into Thin Air/The Climb/Touching the Void/No Way Down/Buried in the Sky)全在版权期,只能取事实;巴基斯坦侧(K2/Nanga)死亡统计权威 8000ers.com=AVOID;现场照片几乎全受版权;死因分类口径各库不一需三方对账消歧

## alpine-history(19世纪黄金/白银时代) — **rich**
- **最佳源**: Wikidata(CC0)+ Gutenberg/Wikisource(Whymper《Scrambles》/Stephen/Tyndall/Saussure PD 全文+版画)+ IA(Alpine Journal 1863-1929)
- **缺口**: Alpine Journal 取数管道复杂(HathiTrust=AVOID,OLBP/官方站只做索引),须绕道 IA 逐卷核出版年;瑞士侧 SAC《Die Alpen》/e-periodica.ch 许可待核;Zermatt/Chamonix 地方向导档案未覆盖

## science-physiology(高海拔生理医学) — **moderate**
- **最佳源**: Wikidata(疾病实体+ICD/MeSH)+ PMC OA Commercial 子集(CC0/CC-BY)+ PD 老文本(Paul Bert 1878、Mosso 1898、1922 珠峰志)
- **缺口**: 几乎全部现代权威源 AVOID(WMS/MSD/ISMM/J Appl Physiol);Lake Louise Score 版权归 Mary Ann Liebert;供氧技术史二次文献(Windsor&Rodway)专有;藏族 EPAS1/安第斯慢性高山病子题需 PMC 补;每条事实建议双绑 Wikidata QID + 一条 PD/PMC 出处

## gear-technique(装备/技术/分级演进) — **moderate**
- **最佳源**: Wikidata(概念/人物)+ Wikipedia(分级谱系正文)+ OpenBeta(CC0 分级换算样本)+ Gutenberg/Wikisource(Whymper/Mummery PD)+ UIAA 官方(事实转录)
- **缺口**: UIAA 文档/AAJ/厂商 blog(Grivel/Wild Country)均专有,仅提事实;theCrag=NC 排除;冰瀑 WI/M 混合分级细则、萨克森/英国 E-grade 谱系、UIAA/EN 装备认证史未覆盖;Himalayan Database style/oxygen 字段是围攻↔阿式量化金矿(CAUTION)

## records-stats(纪录与统计) — **moderate**
- **最佳源**: Wikidata(CC0,获奖/首登可 SPARQL 一次拉)+ Wikipedia 列表(已整理榜单)+ Himalayan Database(尼泊尔侧死亡率/无氧金真值)
- **缺口**: 8000ers.com(纪录仲裁权威)+Peakbagger(雪豹奖名单)均 AVOID,须事实重采;登顶真实性系统性争议(Harila/早期完成者真顶/用氧)须每条带来源+是否用氧+是否核实字段并允许多源分歧;速登须标用氧/直升机转场;年龄纪录受尼泊尔/中国许可政策约束

## data-apis(结构化数据地基) — **rich**
- **最佳源**: Wikidata(CC0 主键)+ SRTM/NASADEM(PD 海拔)+ GeoNames(CC-BY)+ OSM(ODbL)+ DBpedia(交叉校验)
- **缺口**: 封闭商业库(PeakVisor/Peakbagger)AVOID;Himalayan Database 无 CSV 直供须从 DBF 导出评估 vs 社区镜像子集完整性;OSM/GeoNames 只提供地理属性不含登山史;ODbL/CC-BY-SA share-alike 传染需设计发布形态

## public-domain-lit(公有领域登山文学) — **rich**
- **最佳源**: Gutenberg(GutenDex API 枚举+txt/epub)+ IA(metadata/scraping API+OCR)+ Wikisource(校勘章节)+ Wikidata(P2034/P724 反查关联电子文本)
- **缺口**: 取数管道要绕开被封源(HathiTrust=AVOID,OLBP/官方 AJ 站只作索引);Norton《Fight for Everest 1924》等 1925 前后书跨法域按 life+70 逐本复核;Mallory 档案文字多数法域已 PD 但学院扫描件=AVOID;Freshfield/Conway/Guido Rey 等二线经典可用性待扩

## chinese-mountaineering(中文登山史) — **thin**
- **最佳源**: Wikidata(CC0,1960 珠峰远征 Q18651339 等有条目)+ 中文维基百科(CC-BY-SA,专条最全)+ 英文维基(西方视角与1960争议)
- **缺口**: 所有中文站(体育总局/中国探险协会/登山协会/8264/百度)CAUTION-AVOID,原文与图受版权只提事实;1960北坡登顶真实性有西方质疑需并存多视角;梅里山难/玉珠峰历史照片几全受版权;深度史料需中文一手档案但可复用性差,是全库最薄领域
