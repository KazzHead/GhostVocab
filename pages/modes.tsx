import fs from "fs";
import path from "path";
import Link from "next/link";
import styles from "../styles/index.module.css";
import { useRouter } from "next/router";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { folderDisplayNameMap } from "../utils/folderDisplayNameMap";
import { fileDisplayNameMap } from "../utils/fileDisplayNameMap";

interface Mode {
  name: string;
  displayName: string;
}

interface ModesProps {
  bookName: string;
  modes: Mode[];
  displayName: string;
  state: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { query } = context;
  const bookName = query.book as string;
  const state = query.state as string;
  const bookPath = path.join(process.cwd(), "public", "wordbooks", bookName);

  const files = fs
    .readdirSync(bookPath)
    .filter((file) => path.extname(file) === ".csv");

  const modes: Mode[] = files.map((file) => ({
    name: file,
    displayName: fileDisplayNameMap[file] || file.replace(".csv", ""), // ここで表示名をカスタマイズ可能
  }));

  const displayName = folderDisplayNameMap[bookName] || bookName;

  return {
    props: { state, bookName, displayName, modes },
  };
};

const Modes: React.FC<ModesProps> = ({
  state,
  bookName,
  displayName,
  modes,
}) => {
  const router = useRouter();
  return (
    <div className={styles.container}>
      <div className={styles.titleBox}>
        <div className={styles.titleText}> {displayName}</div>
      </div>

      <button onClick={() => router.push(`/wordbooks?state=${state}`)}>
        単語帳選択に戻る
      </button>
      {modes.map((mode) => (
        <button
          key={mode.name.replace(".csv", "")}
          onClick={() =>
            router.push(
              `/chapter?state=${state}&book=${bookName}&mode=${mode.name.replace(
                ".csv",
                ""
              )}`
            )
          }
        >
          {mode.displayName}
        </button>
      ))}
    </div>
  );
};

export default Modes;
