import Link from "next/link";
import styles from "../styles/index.module.css";
import { useRouter } from "next/router";

const Chapter = () => {
  const router = useRouter();
  return (
    <div className={styles.container}>
      <h1>ターゲット1900</h1>
      <button onClick={() => router.push("/")}>ホームに戻る</button>
      <div className={styles.buttons}>
        {[...Array(19)].map((_, i) => {
          const start = 1 + 100 * i;
          const end = 100 * (i + 1);
          return (
            <Link key={i} href={`/one_player_game?start=${start}&end=${end}`}>
              <button>
                ターゲット1900 {start}-{end}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Chapter;
