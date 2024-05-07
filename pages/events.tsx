// import styles from "../styles/index.module.css";
import router from "next/router";

const Events = () => {
  return (
    <div>
      <h1>イベント</h1>
      <button onClick={() => router.push(`/`)}>タイトルに戻る</button>
      <button
        onClick={() =>
          router.push(
            `/study?book=target1900&mode=fillBrackets&start=1&end=230`
          )
        }
      >
        5月 唐津東高2年 統一テスト ターゲット1900 1～230
      </button>
    </div>
  );
};

export default Events;
