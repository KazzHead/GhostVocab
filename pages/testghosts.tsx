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
  updatedAt: Date;
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

  const filteredResults = quizResults.filter(
    (result) =>
      (selectedName === "" || result.name === selectedName) &&
      (selectedBook === "" || result.book === selectedBook)
  );

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
          {filteredResults.map((result) => (
            <li key={result.id}>
              <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                {result.name}
              </span>
              {`\n${folderDisplayNameMap[result.book]} ${result.start}～${
                result.end
              } \n ${formatDate(result.updatedAt)}`}
              <button
                onClick={() => router.push(`/buttle?quizResultId=${result.id}`)}
              >
                このゴーストに挑戦
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuizResultsList;
