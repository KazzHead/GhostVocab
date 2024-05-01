// pages/index.tsx
import Link from "next/link";
import styles from "./Home.module.css";

const Home = () => {
  return (
    <div className={styles.container}>
      <h1>英単語クイズ スタート画面</h1>
      <div className={styles.buttons}>
        <Link href="/chapter">
          <button>一人で挑戦</button>
        </Link>
        <button>ゴーストと対戦</button>
      </div>
    </div>
  );
};

export default Home;
