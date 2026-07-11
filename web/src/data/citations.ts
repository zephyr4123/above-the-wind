// 首登史引用源(可追溯) —— 由 research/first-ascent-citations.md 誊录,URL 均经 WebFetch 核实。
// 三层口径(见 research/SOURCES.md):① 当年同期期刊(最接近一手)· ② 权威百科 · ③ 权威纪录/媒体。
// 许可现实:1950–1964 官方远征志仍在版权期,故这里是「可追溯 + 公开可读」而非「公版可转载」——
// 展示层只标来源、给链接,不复制正文/图。key = peaks.ts 的 id(Wikidata QID)。

export type CitationTier = 1 | 2 | 3;

export interface Citation {
  tier: CitationTier;
  code?: string; // 期刊参考码,如 HJ/18/1、AJ 1964
  title: string;
  url: string;
  license: string; // 方括号许可标签(诚实)
}

const HJ = "© 喜马拉雅俱乐部 · 公开可读";
const AAJ = "© 美国高山会 · 公开可读";
const AJ = "© 英国高山会 · 公开 PDF";
const WIKI = "CC-BY-SA 4.0";
const GWR = "专有 · 仅佐证 who/when";
const MEDIA = "专有 · 仅佐证";

export const CITATIONS: Record<string, Citation[]> = {
  // Everest
  Q513: [
    { tier: 1, code: "HJ/18/1", title: "Everest 1953(Charles Wylie 编,含 Hillary 第一人称记述)", url: "https://www.himalayanclub.org/hj/18/1/everest-1953-1/", license: HJ },
    { tier: 2, title: "1953 British Mount Everest expedition · Wikipedia", url: "https://en.wikipedia.org/wiki/1953_British_Mount_Everest_expedition", license: WIKI },
  ],
  // K2
  Q43512: [
    { tier: 1, code: "HJ/19/7", title: "The 1954 Italian Expedition to the Karakoram and the First Ascent of K2", url: "https://www.himalayanclub.org/hj/19/7/ghimalayan-journalhimalayan-journal-19the-1954-italian-expedition-to-the-karakoram-and-the-first-ascent-of-k2l/", license: HJ },
    { tier: 2, title: "1954 Italian expedition to K2 · Wikipedia", url: "https://en.wikipedia.org/wiki/1954_Italian_expedition_to_K2", license: WIKI },
  ],
  // Kangchenjunga —— HJ/75 是 2020 年 Conefrey 的回溯文章(非当年同期),不标 tier1
  Q82019: [
    { tier: 2, title: "1955 British Kangchenjunga expedition · Wikipedia", url: "https://en.wikipedia.org/wiki/1955_British_Kangchenjunga_expedition", license: WIKI },
    { tier: 3, title: "Kangchenjunga 1955(Himalayan Journal Vol 75,2020 回溯)", url: "https://www.himalayanclub.org/hj/75/4/kangchenjunga-1955/", license: "© 喜马拉雅俱乐部 · 2020 回溯" },
  ],
  // Lhotse
  Q168702: [
    { tier: 1, code: "AAJ 1956", title: "Everest — Lhotse, 1956(同期远征报告)", url: "http://publications.americanalpineclub.org/articles/12195712100/Everest-Lhotse-1956", license: AAJ },
    { tier: 2, title: "Fritz Luchsinger · Wikipedia", url: "https://en.wikipedia.org/wiki/Fritz_Luchsinger", license: WIKI },
  ],
  // Makalu
  Q169986: [
    { tier: 2, title: "1955 French Makalu expedition · Wikipedia", url: "https://en.wikipedia.org/wiki/1955_French_Makalu_expedition", license: WIKI },
    { tier: 3, title: "First ascent of Makalu · Guinness World Records", url: "https://www.guinnessworldrecords.com/world-records/first-ascent-of-makalu", license: GWR },
  ],
  // Cho Oyu
  Q170089: [
    { tier: 2, title: "Cho Oyu · Wikipedia(References 含 Tichy 记述)", url: "https://en.wikipedia.org/wiki/Cho_Oyu", license: WIKI },
    { tier: 3, title: "First ascent of Cho Oyu · Guinness World Records", url: "https://www.guinnessworldrecords.com/world-records/first-ascent-of-cho-oyu", license: GWR },
  ],
  // Dhaulagiri I
  Q165440: [
    { tier: 1, code: "HJ/22/6", title: "Dhaulagiri, the 'White Mountain': A Chronicle of the 1960 Expedition", url: "https://www.himalayanclub.org/hj/22/6/dhaulagiri-the-white-mountain-a-chronicle-of-the-1960-expedition/", license: HJ },
    { tier: 3, title: "First ascent of Dhaulagiri I · Guinness World Records", url: "https://www.guinnessworldrecords.com/world-records/first-ascent-of-dhaulagiri-i", license: GWR },
  ],
  // Manaslu
  Q170070: [
    { tier: 1, code: "HJ/20/2", title: "The Ascent of Manaslu(日方同期记述)", url: "https://www.himalayanclub.org/hj/20/2/the-ascent-of-manaslu/", license: HJ },
    { tier: 2, title: "Manaslu · Wikipedia", url: "https://en.wikipedia.org/wiki/Manaslu", license: WIKI },
  ],
  // Nanga Parbat
  Q130736: [
    { tier: 2, title: "1953 German–Austrian Nanga Parbat expedition · Wikipedia", url: "https://en.wikipedia.org/wiki/1953_German%E2%80%93Austrian_Nanga_Parbat_expedition", license: WIKI },
    { tier: 2, title: "Hermann Buhl · Wikipedia", url: "https://en.wikipedia.org/wiki/Hermann_Buhl", license: WIKI },
  ],
  // Annapurna I
  Q16466024: [
    { tier: 2, title: "1950 French Annapurna expedition · Wikipedia(References 含 Herzog、Lachenal、Rébuffat)", url: "https://en.wikipedia.org/wiki/1950_French_Annapurna_expedition", license: WIKI },
    { tier: 3, title: "The 75th Anniversary of the First Ascent of an 8,000m Peak: Annapurna I · ExplorersWeb", url: "https://explorersweb.com/the-75th-anniversary-of-the-first-ascent-of-an-8000m-peak-annapurna-i/", license: MEDIA },
  ],
  // Gasherbrum I
  Q187138: [
    { tier: 1, code: "HJ/21/5", title: "The Ascent of Gasherbrum I(同期记述)", url: "https://www.himalayanclub.org/hj/21/5/the-ascent-of-gasherbrum-i/", license: HJ },
    { tier: 2, title: "Gasherbrum I · Wikipedia", url: "https://en.wikipedia.org/wiki/Gasherbrum_I", license: WIKI },
  ],
  // Broad Peak
  Q180996: [
    { tier: 1, code: "HJ/21/1", title: "Broad Peak and Chogolisa, 1957", url: "https://www.himalayanclub.org/hj/21/1/broad-peak-and-chogolisa-1957/", license: HJ },
    { tier: 3, title: "First ascent of Broad Peak · Guinness World Records", url: "https://www.guinnessworldrecords.com/world-records/114102-first-ascent-of-broad-peak", license: GWR },
  ],
  // Gasherbrum II
  Q186853: [
    { tier: 1, code: "HJ/20/3", title: "Austrian Karakoram Expedition, 1956(Moravec 记述)", url: "https://www.himalayanclub.org/hj/20/3/austrian-karakoram-expedition-1956/", license: HJ },
    { tier: 2, title: "Gasherbrum II · Wikipedia", url: "https://en.wikipedia.org/wiki/Gasherbrum_II", license: WIKI },
  ],
  // Shishapangma
  Q105124: [
    { tier: 1, code: "AJ 1964", title: "The Ascent of Shisha Pangma, pp.211–216(Cheng,免费 PDF)", url: "https://www.alpinejournal.org.uk/Contents/Contents_1964_files/AJ%201964%20211-216%20Cheng%20Shisha%20Pangma.pdf", license: AJ },
    { tier: 2, title: "Shishapangma · Wikipedia", url: "https://en.wikipedia.org/wiki/Shishapangma", license: WIKI },
  ],
};

export const TIER_LABEL: Record<CitationTier, string> = {
  1: "同期期刊",
  2: "百科",
  3: "纪录",
};
