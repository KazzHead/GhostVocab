import Link from "next/link";
import styles from "../styles/index.module.css";
import router from "next/router";

const Home = () => {
  return (
    <div className={styles.container}>
      <h1>Vocubulary Quiz</h1>
      <div className={styles.buttons}>
        <button onClick={() => router.push("/wordbooks")}>練習する</button>
        <button>テストする</button>
        <button>ゴーストと対戦</button>
        <button onClick={() => router.push("/events")}>イベント</button>
      </div>
    </div>
  );
};

export default Home;
