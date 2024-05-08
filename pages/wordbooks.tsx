import fs from "fs";
import path from "path";
import Link from "next/link";
import styles from "../styles/index.module.css";
import { useRouter } from "next/router";
import { GetStaticProps } from "next";
import { folderDisplayNameMap } from "../utils/folderDisplayNameMap";

interface Wordbook {
  name: string;
  displayName: string;
}

interface WordbooksProps {
  wordbooks: Wordbook[];
}

export const getStaticProps: GetStaticProps = async () => {
  const wordbooksDirectory = path.join(process.cwd(), "public");
  const folders = fs
    .readdirSync(wordbooksDirectory)
    .filter((file) =>
      fs.statSync(path.join(wordbooksDirectory, file)).isDirectory()
    );

  const wordbooks: Wordbook[] = folders.map((folder) => ({
    name: folder,
    displayName: folderDisplayNameMap[folder] || folder, // マッピングがなければフォルダ名をそのまま使用
  }));

  return {
    props: { wordbooks },
  };
};

const Wordbooks: React.FC<WordbooksProps> = ({ wordbooks }) => {
  const router = useRouter();
  return (
    <div className={styles.container}>
      <h1>単語帳</h1>
      <button onClick={() => router.push("/")}>タイトルに戻る</button>
      <div className={styles.buttons}>
        {wordbooks.map((book) => (
          <button
            key={book.name}
            onClick={() => router.push(`/modes?book=${book.name}`)}
          >
            {book.displayName}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Wordbooks;
