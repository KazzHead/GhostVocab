import fs from "fs";
import path from "path";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { folderDisplayNameMap } from "../utils/folderDisplayNameMap";
import { fileDisplayNameMap } from "../utils/fileDisplayNameMap";

interface ChapterProps {
  bookName: string;
  modeName: string;
  displayBookName: string;
  displayModeName: string;
  totalLines: number;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  const bookName = query.book as string;
  const modeName = query.mode as string;
  const filePath = path.join(
    process.cwd(),
    "public",
    bookName,
    `${modeName}.csv`
  );
  const fileContent = fs.readFileSync(filePath, "utf8");
  const lines = fileContent.split("\n").filter((line) => line.trim() !== "");

  const displayBookName = folderDisplayNameMap[bookName] || bookName;
  const displayModeName = fileDisplayNameMap[`${modeName}.csv`] || modeName;

  return {
    props: {
      bookName,
      modeName,
      displayBookName,
      displayModeName,
      totalLines: lines.length,
    },
  };
};

const Chapter: React.FC<ChapterProps> = ({
  bookName,
  modeName,
  displayBookName,
  displayModeName,
  totalLines,
}) => {
  const router = useRouter();
  const rangeSize = 100;
  const ranges = [];

  for (let i = 0; i < totalLines; i += rangeSize) {
    const start = i + 1;
    const end = Math.min(i + rangeSize, totalLines);
    ranges.push({ start, end });
  }

  return (
    <div>
      <h1>{`${displayBookName} ${displayModeName}`}</h1>
      <button onClick={() => router.push(`/modes?book=${bookName}`)}>
        戻る
      </button>
      {ranges.map((range, index) => (
        <button
          key={index}
          onClick={() =>
            router.push(
              `/study?book=${bookName}&mode=${modeName}&start=${range.start}&end=${range.end}`
            )
          }
        >
          {`${range.start}～${range.end}`}
        </button>
      ))}
    </div>
  );
};

export default Chapter;
