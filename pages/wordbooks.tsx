import fs from "fs";
import path from "path";
import Head from "next/head";
import styles from "../styles/index.module.css";
import { useRouter } from "next/router";
import { GetStaticProps } from "next";
import { folderDisplayNameMap } from "../utils/folderDisplayNameMap";
import React, { useEffect, useState } from "react";

interface Wordbook {
  name: string;
  displayName: string;
}

interface WordbooksProps {
  wordbooks: Wordbook[];
}

export const getStaticProps: GetStaticProps = async () => {
  const wordbooksDirectory = path.join(process.cwd(), "public", "wordbooks");
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
  const { state } = router.query as {
    state: string;
  };
  const [title, setTitle] = useState<string>("単語帳");

  useEffect(() => {
    if (state === "study") {
      setTitle("練習する");
    } else if (state === "test") {
      setTitle("テストする");
    }
  }, [state]);

  return (
    <>
      <Head>
        <title>単語帳選択</title>
      </Head>
      <div className={styles.container}>
        <h1>{title}</h1>
        <button onClick={() => router.push("/")}>タイトルに戻る</button>
        <div className={styles.bookimages}>
          {wordbooks.map((book) => (
            <button
              key={book.name}
              onClick={() =>
                router.push(`/modes?state=${state}&book=${book.name}`)
              }
            >
              {book.displayName}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Wordbooks;
