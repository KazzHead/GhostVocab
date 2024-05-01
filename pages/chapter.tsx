// pages/chapter.tsx
import Link from "next/link";
import styles from "./Chapter.module.css";

const Chapter = () => {
  return (
    <div className={styles.container}>
      <h1>章を選択してください</h1>
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
