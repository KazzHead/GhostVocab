import Link from "next/link";
import styles from "../styles/index.module.css";

const Home = () => {
  return (
    <div className={styles.container}>
      <h1>Vocubulary Quiz</h1>
      <div className={styles.buttons}>
        <Link href="/wordbooks">
          <button>一人で挑戦</button>
        </Link>
        <button>ゴーストと対戦</button>
      </div>
    </div>
  );
};

export default Home;
