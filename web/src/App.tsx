import "./App.css";
import { GOLDEN_AGE, PEAKS } from "./data/peaks";
import { PeakLadder } from "./components/PeakLadder";

export default function App() {
  return (
    <div className="page">
      <div className="page__glow" aria-hidden />

      <header className="masthead">
        <p className="masthead__mark mono">ABOVE THE WIND · 风之上</p>
        <h1 className="masthead__title">
          十四座
          <br />
          八千米
        </h1>
        <p className="masthead__lede">
          地球上仅有十四座山峰高过海拔八千米——氧气稀薄到人体无法长久存活的“死亡地带”。它们全部在{" "}
          {GOLDEN_AGE.from}–{GOLDEN_AGE.to}{" "}
          这十五年间被首次登顶，那是喜马拉雅登山的黄金年代。
        </p>
        <dl className="masthead__stats">
          <div>
            <dt>山峰</dt>
            <dd className="mono">14</dd>
          </div>
          <div>
            <dt>最高</dt>
            <dd className="mono">8,849 m</dd>
          </div>
          <div>
            <dt>首登年代</dt>
            <dd className="mono">1950–1964</dd>
          </div>
        </dl>
      </header>

      <main>
        <PeakLadder peaks={PEAKS} />
      </main>

      <footer className="colophon">
        <p>
          事实数据来自{" "}
          <a href="https://www.wikidata.org" target="_blank" rel="noreferrer">
            Wikidata
          </a>{" "}
          （CC0）；山峰剪影为数据确定性生成、无版权；首登史为公认史实。
        </p>
        <p className="colophon__note">编年档案 · 第一辑 / 十四座八千米</p>
      </footer>
    </div>
  );
}
