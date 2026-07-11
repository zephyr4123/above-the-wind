# 批量采集蓝图 (harvest plan)

> P0 先行,尽量走 SPARQL/API/dump 整批拉 SAFE 源


## [P0] 全库事实骨架:14座8000+标志峰+登山家+远征+事件+首登+伤亡,以 QID 为主键
- **源**: Wikidata (CC0) · **量级**: 数千实体(14峰+数百标志峰+数百人物+上千远征/事件)
- **方法**: Wikidata SPARQL 按 WikiProject Mountains 精准筛(instance-of-mountain / eight-thousander 类 / significant-event 首登)分页导出 JSON,超大集回落每周 RDF dump 建本地库

## [P0] 全球山峰海拔真值 DEM + 自渲等高线/地形剖面底图
- **源**: SRTM/NASADEM (CC0/PD) · **量级**: 数百 tile(覆盖主要山脉)
- **方法**: earthaccess/CMR 按喜马拉雅-喀喇昆仑-阿尔卑斯-安第斯-Alaska bbox 批量下 SRTMGL1+NASADEM GeoTIFF tile

## [P0] 山峰坐标/海拔/多语别名底表(交叉校验 Wikidata)
- **源**: GeoNames (CC-BY) · **量级**: 数万山峰要素
- **方法**: 下载 allCountries.zip 全库 dump,按 feature class T.MT/T.PK 过滤

## [P0] 1786-1930 一手叙事全文+期内插图(可全文商用入库)
- **源**: Project Gutenberg + Internet Archive (PD) · **量级**: 数十种书 + Alpine Journal 1863-1929 约40卷
- **方法**: GutenDex JSON API 枚举登山 subject/author ID → 官方 harvest 拉 txt/epub 剥 PG boilerplate;IA 走 scraping API 枚举 collection → `ia download` OCR+PDF

## [P0] 早期珠峰官方志(1921/1922/1924)高质量全文
- **源**: Gutenberg/IA (PD) · **量级**: 3-4 部核心官方志
- **方法**: 从 Gutenberg #39421/#61083 + IA 对应 item 直拉(绕开限速的 loc.gov)

## [P0] 可商用山峰卫星底图/峰位标注图 + Denali 登顶时间序列
- **源**: NASA Earth Observatory + NPS (PD) · **量级**: 约20张图 + Denali 1979-今逐年统计
- **方法**: NASA EO 逐页抓14张影像走 Visible Earth/EOL 原图链接;NPS 下 Excel 统计表+十年分组 PDF

## [P1] 尼泊尔侧8座8000峰远征×死亡×用氧金标准事实层
- **源**: The Himalayan Database (CAUTION,抽事实) · **量级**: 11500+远征 / 90800+成员记录(取8座相关切片)
- **方法**: 下载 HD v2.74 程序,从 DBF/SQL 导表,抽离散事实字段重构入自研 schema,清晰致谢;不整包镜像

## [P1] 全域叙事层 + 已整理榜单(死亡列表/纪录/all-14/冬季首登序列)
- **源**: Wikipedia (CC-BY-SA) · **量级**: 数百条目 + 十余张结构化列表
- **方法**: dumps.wikimedia.org 拉 en/zh XML dump 解析目标条目 wikitable;事实提取重写脱 SA,逐字引用挂署名+SA

## [P1] 山峰坐标/海拔独立几何交叉校验
- **源**: OpenStreetMap (ODbL) · **量级**: 14峰+数百标志峰节点
- **方法**: Overpass API 按 [natural=peak][ele] 拉目标峰点;区域走 Geofabrik extract。设计数据边界避 ODbL 传染

## [P1] 分级体系跨制换算样本(gear-technique)
- **源**: OpenBeta (CC0) + UIAA(事实转录) · **量级**: 数千路线分级对照 + 4体系谱系表
- **方法**: clone OpenBeta climbing-data 仓库(CC0)取分级数据;UIAA 分级符号/映射人工转录

## [P1] 高原生理开放获取文献事实锚定
- **源**: PMC OA (CC0/CC-BY) + PD 老文本 · **量级**: 数十篇 OA 论文 + 3部 PD 生理专著
- **方法**: AWS Open Data S3(pmc-oa-opendata)先按 license 字段过滤 Commercial-Use-Allowed 再下 JATS XML;PD 老文本(Bert/Mosso/1922志)从 IA/Gutenberg 全文入库

## [P2] 喀喇昆仑/巴基斯坦侧6座8000峰事实缺口补齐
- **源**: Wikidata + AAJ(事实核验) / 8000ers 授权申请 · **量级**: 6峰的登顶/死亡编年(密度受限)
- **方法**: 不抓 8000ers.com——从 Wikidata/Wikipedia 事实层 + AAJ/Himalayan Journal 逐案事实核验重采(或发函 Jurgalski 申请授权)

## [P2] Wikidata 事实缺口补漏 + 一致性交叉校验
- **源**: DBpedia (CC-BY-SA) · **量级**: 数百实体字段核对
- **方法**: DBpedia Databus dump 取登山子集比对 Wikidata infobox 派生字段

## [P2] 全库配图层(PD/CC0/CC-BY 可复用图)
- **源**: Wikimedia Commons(逐文件核) · **量级**: 数百张(历史 PD 版画/照片优先)
- **方法**: Commons MediaWiki API(imageinfo+extmetadata)逐文件落库 License/Artist 字段,隔离 CC-BY-SA 与 CC0/PD,20世纪名照+在世肖像人工复核后放行;受版权图走 ae-image-decopyrighter

## [P2] 中文登山史事实层(1960/1975珠峰、1991梅里等)
- **源**: Wikidata + 中文 Wikipedia · **量级**: 数十事件/人物事实条目
- **方法**: 从 Wikidata(CC0)+ 中文维基(CC-BY-SA,署名+SA)重建事实;中文站仅作事实线索不灌库,图片走去版权重绘
