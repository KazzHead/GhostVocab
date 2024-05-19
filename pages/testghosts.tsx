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

  const sortedResults = [...filteredResults].sort((a, b) => {
    const aResults = calculateResults(a.contents);
    const bResults = calculateResults(b.contents);
    if (aResults.correctCount === bResults.correctCount) {
      return aResults.totalTime - bResults.totalTime; // 同じ正解数の場合は合計時間で昇順
    }
    return bResults.correctCount - aResults.correctCount; // 正解数で降順
  });

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
        <ul>
          {sortedResults.map((result) => {
            const { correctCount, totalTime } = calculateResults(
              result.contents
            );
            return (
              <li key={result.id}>
                <div>
                  {result.name} - {folderDisplayNameMap[result.book]} - 正解数:{" "}
                  {correctCount}, 合計時間: {totalTime / 1000}秒
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default QuizResultsList;
