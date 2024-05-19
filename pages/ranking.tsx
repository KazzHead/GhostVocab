import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { folderDisplayNameMap } from "../utils/folderDisplayNameMap";
import styles from "../styles/index.module.css";

interface QuizResult {
  id: number;
  name: string;
  book: string;
  mode: string;
  start: number;
  end: number;
  contents: Contents[];
  updatedAt: Date;
}

interface Contents {
  responseTime: number;
  isCorrect: boolean;
}

const QuizResultsList: React.FC = () => {
  const router = useRouter();
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [selectedName, setSelectedName] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        const response = await fetch("/api/quizResults");
        const data = await response.json();
        if (response.ok) {
          setQuizResults(data);
        } else {
          console.error("Failed to fetch quiz results");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizResults();
  }, []);

  const names = [...new Set(quizResults.map((result) => result.name))];
  const books = [...new Set(quizResults.map((result) => result.book))];

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const calculateResults = (contents: Contents[]) => {
    if (!contents) {
      return { correctCount: 0, totalTime: 0 };
    }
    const correctCount = contents.filter((content) => content.isCorrect).length;
    const totalTime = contents.reduce(
      (total, content) => total + content.responseTime,
      0
    );
    return { correctCount, totalTime };
  };

  const filteredResults = quizResults.filter(
    (result) =>
      (selectedName === "" || result.name === selectedName) &&
      (selectedBook === "" || result.book === selectedBook)
  );
  console.log("filteredResults:", filteredResults);

  const sortedByCorrectAndTime = [...filteredResults].sort((a, b) => {
    const aResults = calculateResults(a.contents);
    const bResults = calculateResults(b.contents);
    if (aResults.correctCount === bResults.correctCount) {
      return aResults.totalTime - bResults.totalTime; // 同じ正解数の場合は合計時間で昇順
    }
    return bResults.correctCount - aResults.correctCount; // 正解数で降順
  });

  const top3ByCorrectAndTime = sortedByCorrectAndTime.slice(0, 3);

  const aggregatedResults = quizResults.reduce((acc, result) => {
    const key = `${result.book}-${result.start}-${result.end}`;
    if (!acc[key]) {
      acc[key] = {};
    }
    if (!acc[key][result.name]) {
      acc[key][result.name] = calculateResults(result.contents);
    } else {
      const currentBest = acc[key][result.name];
      const newResult = calculateResults(result.contents);
      if (
        newResult.correctCount > currentBest.correctCount ||
        (newResult.correctCount === currentBest.correctCount &&
          newResult.totalTime < currentBest.totalTime)
      ) {
        acc[key][result.name] = newResult;
      }
    }
    return acc;
  }, {} as Record<string, Record<string, { correctCount: number; totalTime: number }>>);

  const sortedByBook = Object.entries(
    aggregatedResults[selectedBook] || {}
  ).sort(([, a], [, b]) => {
    if (b.correctCount === a.correctCount) {
      return a.totalTime - b.totalTime;
    }
    return b.correctCount - a.correctCount;
  });

  const top3ByBook = sortedByBook.slice(0, 3);

  return (
    <div>
      <h1>ゴースト一覧</h1>
      <button onClick={() => router.push("/")}>タイトルに戻る</button>
      <div className={styles.selectBox}>
        <select
          value={selectedName}
          onChange={(e) => setSelectedName(e.target.value)}
        >
          <option value="">すべての名前</option>
          {names.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
        >
          <option value="">すべての単語帳</option>
          {books.map((book) => (
            <option key={book} value={book}>
              {folderDisplayNameMap[book] || book}
            </option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <div>
          <h1>Loading...</h1>
        </div>
      ) : (
        <div>
          <h2>正解数が多く時間が短かったランキング上位3人</h2>
          <ul>
            {/* {top3ByCorrectAndTime.map((result) => { */}
            {sortedByCorrectAndTime.map((result) => {
              const { correctCount, totalTime } = calculateResults(
                result.contents
              );
              return (
                <li key={result.id}>
                  <div>
                    {result.name} {folderDisplayNameMap[result.book]}{" "}
                    {result.start}～{result.end} 正解数: {correctCount},
                    合計時間: {totalTime / 1000}秒
                  </div>
                </li>
              );
            })}
          </ul>
          <h2>選ばれた単語帳ごとのランキング上位3人</h2>
          <ul>
            {top3ByBook.map(([name, { correctCount, totalTime }]) => (
              <li key={name}>
                <div>
                  {name} - 正解数: {correctCount}, 合計時間: {totalTime / 1000}
                  秒
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuizResultsList;
