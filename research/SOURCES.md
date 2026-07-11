# 数据源 · 许可地图 (source-license map)

> mountain-data-recon workflow 生成 · 机读版见 `synth.json`
> **verdict**: SAFE=可放心复用 · CAUTION=有条件(署名/非商用/限抓) · AVOID=专有,只做事实核验线索,**绝不搬正文与图**


## Wikidata (WikiProject Mountains) — SAFE
- **许可**: CC0 1.0(结构化数据主命名空间);说明文本 CC-BY-SA 3.0
- **覆盖**: 全 12 域事实骨架:8000ers/iconic-peaks/expeditions/mountaineers/disasters/alpine-history/records-stats/data-apis/chinese-mountaineering;为全库主键层
- **采集**: SPARQL 窄查询(按类/属性筛山峰/人物/远征/事件)+ 每周全量 JSON/RDF dump 建本地库;单实体走 Wikibase REST。合规 UA + gzip + 429 退避。图片不走此链,P18 指向的 Commons 文件逐个另核。
- URL: https://query.wikidata.org/

## SRTM / NASADEM 数字高程 (NASA/USGS via Earthdata/LP DAAC) — SAFE
- **许可**: CC0 1.0 等价(NASA 主导任务默认 CC0);仅取 C 波段 SRTM+NASADEM,避开 DLR/ASI 的 X 波段
- **覆盖**: data-apis/8000ers/iconic-peaks:海拔真值校验 + 地形剖面/等高线/阴影自渲染底图
- **采集**: earthaccess Python 库 / NASA CMR+STAC API / OpenTopography 按 bbox 云端裁切;全球 tile dump 可整包。免费 Earthdata Login。
- URL: https://www.earthdata.nasa.gov/data/instruments/srtm

## GeoNames — SAFE
- **许可**: CC-BY 4.0(仅署名,可商用)
- **覆盖**: data-apis/iconic-peaks/8000ers:坐标/海拔/多语别名底表、地名消歧
- **采集**: allCountries.zip 全库 dump 或分国家文件,按 feature class T(T.MT/T.PK)筛;动态富化走限流 REST API(10000 credits/日)。
- URL: https://www.geonames.org/export/

## Project Gutenberg — 登山经典公版书 — SAFE
- **许可**: 美国公有领域(底层文本);PG 商标为独立叠加层,入库前剥 boilerplate 即完全规避
- **覆盖**: public-domain-lit/alpine-history/expeditions/gear-technique:Whymper/Mummery/Stephen/Tyndall/1922 珠峰官方志全文+插图
- **采集**: 官方 harvest 端点(wget -w 2 限速)或镜像;元数据走 RDF/CSV catalog dump + GutenDex JSON API 枚举 ID;剥 PG 头尾后只留正文。禁直接爬 gutenberg.org。
- URL: https://www.gutenberg.org/ebooks/41234

## Internet Archive — PD 登山书刊 + Alpine Journal 早卷 — SAFE(逐条核 rights;1929 前 PD,近卷 borrow-only)
- **许可**: 公有领域(pre-1929 项);近人扫描为借阅受限
- **覆盖**: public-domain-lit/alpine-history/disasters/expeditions:Alpine Journal 1863-1929、早期珠峰志、Mummery/Whymper 原扫描、AAJ 早卷、Himalayan Journal Vol.1
- **采集**: `pip install internetarchive` → `ia download {id}`;批量用 Advanced Search/Scraping API 枚举 collection;单件走 /metadata + _djvu.txt 直链。2-3 并发限速。
- URL: https://archive.org/

## Library of Congress — 《Everest Reconnaissance 1921》等 — SAFE
- **许可**: 美国公有领域(1922 出版,满 95 年);LOC 不叠加版权
- **覆盖**: public-domain-lit/expeditions:早期珠峰官方志高质量副本来源核对
- **采集**: 不直连 loc.gov(403+CAPTCHA,限速 ≤10/分)——改从 Gutenberg #39421 或 IA `mounteverestreco00howa` 拉同一 PD 全文;LOC 仅作元数据核对。
- URL: https://www.loc.gov/item/22013019/

## NASA Earth Observatory — The Eight-Thousanders — SAFE
- **许可**: 美国联邦政府作品公有领域;本页图均 NASA 自署无第三方版权
- **覆盖**: 8000ers/iconic-peaks:可商用卫星底图/峰位标注图(少数可复用的图片源之一)
- **采集**: 逐页脚本抓 14 张卫星影像 + ISS 航天员照,走正文内 Visible Earth / EOL 原图下载链接;礼貌限速。不得暗示 NASA 背书。
- URL: https://science.nasa.gov/earth/earth-observatory/the-eight-thousanders/

## NPS — Denali 年度登山统计 — SAFE(数据层);内嵌第三方照片除外
- **许可**: 美国联邦政府作品公有领域(17 USC §105)
- **覆盖**: iconic-peaks/records-stats:Denali 逐年远征/登顶/事故定量时间序列(联邦公版权威)
- **采集**: 下载 Excel 统计总表(1903-当季,按路线)+ 按十年分组年度 summary PDF 批量;剥离/单独处理 PDF 内富媒体。无专用 API。
- URL: https://www.nps.gov/dena/planyourvisit/mountaineering-summary-reports.htm

## 英文/中文 Wikipedia + 全站 dump — CAUTION
- **许可**: 正文 CC-BY-SA 4.0(+旧版 GFDL);图片逐文件混合(含非自由/fair-use)
- **覆盖**: 全 12 域叙事层 + 已整理列表(List of deaths on eight-thousanders / Everest records / all-14 完成者 / 冬季首登序列)
- **采集**: 批量走 dumps.wikimedia.org 的 XML dump(禁爬活站);增量用 MediaWiki API。事实自由提取重写(脱 SA);逐字复用正文须署名+share-alike。图片逐文件核 extmetadata,默认排除。
- URL: https://en.wikipedia.org/wiki/Eight-thousander

## The Himalayan Database (Hawley 档案) — CAUTION
- **许可**: 专有免费,无开放许可;Salisbury & Hawley 版权,明文禁再分发
- **覆盖**: 8000ers(尼泊尔侧8座)/expeditions/mountaineers/disasters/records-stats:尼泊尔远征×死亡×用氧金标准事实核验层
- **采集**: 下载 v2.74 zip(Visual FoxPro DBF 表)+ SQL 版,导 Excel/CSV;抽离散事实(峰/远征/成员/用氧/存殁)入自研 schema,清晰致谢;商用大切片前发函授权。社区 CSV 镜像(Maven/Kaggle)可能是子集,建库回官方程序取全字段。
- URL: https://www.himalayandatabase.com/

## PMC (PubMed Central, NIH) — CAUTION
- **许可**: 混合;仅 OA Subset 的 Commercial Use Allowed 档(CC0/CC-BY/CC-BY-SA/CC-BY-ND)可商用
- **覆盖**: science-physiology:开放获取高原生理文献(West 史学、Operation Everest II、AMREE 数据的事实锚定)
- **采集**: 走 AWS Open Data S3(pmc-oa-opendata)或 PMC FTP bulk;先按 license 字段过滤 Commercial-Use-Allowed 再下 JATS XML;检索用 E-utilities。禁抓主站。
- URL: https://pmc.ncbi.nlm.nih.gov/

## OpenStreetMap (natural=peak) — CAUTION
- **许可**: ODbL-1.0(署名 + 数据库 share-alike);wiki 文档 CC-BY-SA 2.0
- **覆盖**: data-apis/8000ers/iconic-peaks:坐标+海拔+峰名的独立几何交叉校验(仅地理属性,不含登山史)
- **采集**: 少量峰走 Overpass API([natural=peak][ele]);区域走 Geofabrik extract;全量走 Planet dump(AWS S3/BT)。展示层(Produced Work)只需署名,原始数据集再分发触发 ODbL 传染,需设计数据边界。
- URL: https://www.openstreetmap.org/copyright

## OpenBeta (climbing-data, CC0) — CAUTION(OpenBeta 部分 SAFE;theCrag=AVOID)
- **许可**: OpenBeta CC0/PD(文本);theCrag CC-BY-NC-SA(禁商用)——只吃 OpenBeta
- **覆盖**: gear-technique:路线级多体系分级换算样本(UIAA/YDS/French/Font 对照,CC0 可商用)
- **采集**: clone GitHub 仓库(jsonlines/csv)或 climb-api GraphQL;raw dump 官方标暂缺。照片不采。彻底排除 theCrag 与一切照片。
- URL: https://github.com/OpenBeta/climbing-data

## UIAA 官方 — 分级标准 — CAUTION
- **许可**: 专有 all-rights-reserved,无 CC;Terms 为空壳(未授权即保留)
- **覆盖**: gear-technique:UIAA/法国/器械分级体系定义与谱系(Benesch→Welzenbach→UIAA)事实源
- **采集**: 人工转录事实性分级数据(符号/跨体系等价映射),历史沿革散文自行重写,官方 PDF 图表不原样再发布。无 API,数据量极小。
- URL: https://www.theuiaa.org/grades-standards/rock-climbing/

## DBpedia — CAUTION
- **许可**: CC-BY-SA 3.0 + GFDL(继承 Wikipedia,含 ShareAlike 传染)
- **覆盖**: 全域:infobox 派生字段(首登者/海拔)对 Wikidata 缺口的补漏与一致性核对
- **采集**: 走 Databus 批量 dump 取登山子集;定向字段用公共 SPARQL(Fair Use 限 10000 行)。作 Wikidata(CC0)之外的第二结构化交叉校验源,勿逐页抓 HTML。
- URL: https://www.dbpedia.org/

## Wikimedia Commons — CAUTION
- **许可**: 平台层纯自由(PD/CC0/CC-BY/CC-BY-SA,禁 NC/ND);逐文件混合,无统一口径
- **覆盖**: 全域配图层:历史 PD 版画/照片可用,现代照片须逐张核,基金会不担保许可正确性
- **采集**: MediaWiki API(prop=imageinfo&iiprop=extmetadata)逐文件落库 License/Artist/Attribution 字段;结构化走 WCQS SPARQL。隔离 CC-BY-SA 与 CC0/PD;20 世纪名照+在世人物肖像人工复核版权+肖像权后再放行。
- URL: https://commons.wikimedia.org/wiki/Commons:Licensing

## 中文来源(国家体育总局/中国探险协会/中国登山协会/8264/中文维基图片) — CAUTION(政府媒体正文)/ AVOID(社团站+图片)
- **许可**: 专有全保留;政府网站≠公有领域;转载文含第三方(人民日报/新华社)版权;图片风险更高
- **覆盖**: chinese-mountaineering:事实线索源,叙事与图另找 PD/CC 替代
- **采集**: 仅抽不受版权的史实事实(1960/1975 珠峰、1991 梅里 17 人名单/日期/人物)自行改写并逐条溯源;正文原文与照片不入库,图片走 ae-image-decopyrighter。
- URL: https://www.sport.gov.cn/

## 8000ers.com (Eberhard Jurgalski) — AVOID
- **许可**: 专有 © Jurgalski;德国法 + EU sui generis 数据库权;明文禁商用/禁再分发/禁直链/禁抓
- **覆盖**: 8000ers/records-stats/disasters:全14座统计与喀喇昆仑侧覆盖是其独有价值,但许可红线只能事实重采
- **采集**: 不抓。要么发函申请书面商用授权(降级 CAUTION),要么从一手源(Himalayan Database + 官方远征记录 + 各国协会公告)独立重采同批事实并交叉核验。
- URL: https://www.8000ers.com/cms/en/legal-notice-mainmenu-181.html

## AAC Publications (American Alpine Journal + ANAC) — AVOID
- **许可**: 专有 © AAC All Rights Reserved;报告/照片版权归作者,图书馆政策要求逐案授权
- **覆盖**: expeditions/gear-technique/records-stats/iconic-peaks:北美+喀喇昆仑一手报告的事实核验线索(非入库源)
- **采集**: 不抓正文/图。仅作研究线索+事实交叉核对(who/when/where/what);产出只落事实层,叙述与图改用 PD 源或重写。
- URL: https://publications.americanalpineclub.org/

## Peakbagger.com — AVOID
- **许可**: 专有 All Rights Reserved;ToS 明文禁 copy/mine/scrape,主数据库声明为全资资产
- **覆盖**: iconic-peaks/records-stats:七大洲最高峰/雪豹奖名单等榜单——改走 PD/CC 替代源交叉补全
- **采集**: 不抓。峰名/海拔/坐标改用 USGS GNIS(PD)/OSM/Wikidata;纪录榜单改从原始权威源自建。要用其数据须书面授权。
- URL: https://www.peakbagger.com/help/TermsOfService.aspx

## HathiTrust Digital Library — AVOID(商用管道);仅元数据 harvest 窄用途 CAUTION
- **许可**: Google 扫描件合约限制:非商用/禁再托管;AUP 禁批量下载
- **覆盖**: alpine-history/public-domain-lit:Alpine Journal 卷列发现层,取数绕道 IA
- **采集**: 不作商用图源/扫描源。同批 PD 文本改从 IA/Gutenberg/Wikisource 取;仅 Bibliographic API + Hathifiles 取少量元数据。
- URL: https://www.hathitrust.org/

## TidyTuesday Himalayan CSV / Maven Analytics 抽取 — AVOID(商用再分发)
- **许可**: CC0 badge 仅覆盖 TidyTuesday 整理层;底层 HD EULA 禁再分发;PD 标签不实
- **覆盖**: 8000ers/records-stats:便捷 CSV 起点但商用禁用,改事实重采
- **采集**: 研究/建模可拉 CSV;商用不得再分发该 HD 衍生集。窄事实(14 座海拔/坐标/首登/统计)改从 Wikidata(CC0)重采,HD/Maven 仅校验。
- URL: https://github.com/rfordatascience/tidytuesday/

## 高原医学专有源(WMS 指南 / MSD Merck / ISMM / J Appl Physiol) — AVOID
- **许可**: 全部专有 all-rights-reserved,无 CC;免费可读≠可复用
- **覆盖**: science-physiology:权威事实核对锚点(非入库源)
- **采集**: 仅引用临床事实(AMS/HACE/HAPE 分级、药物剂量、下撤原则、253 mmHg/VO2max 等测量值)并规范署名引注;原文文字/表/图一律不入库;需原文走 RightsLink 付费授权。
- URL: https://www.msdmanuals.com/professional/injuries-poisoning/altitude-illness/

## PeakVisor / Himalayan Journal(印度)/ Magdalene Mallory 档案 — AVOID
- **许可**: 均专有 All Rights Reserved;禁抓/禁再分发;Mallory 扫描 © Max Communications
- **覆盖**: iconic-peaks/expeditions/public-domain-lit:均为事实核验/授权申请对象,不入库
- **采集**: PeakVisor 只可 iframe 单点嵌入,数据改走 OSM/Wikidata;Himalayan Journal 只提事实、原文/图逐案授权;Mallory 主题改用已入 PD 的信件内容+PD 文本源,扫描件走学院申请。
- URL: https://peakvisor.com/api
