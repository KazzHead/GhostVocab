import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { folderDisplayNameMap } from "../utils/folderDisplayNameMap";
import styles from "../styles/index.module.css"; // スタイルシートのインポート（使用していない場合は省略可）

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
  const [isLoading, setIsLoading] = useState<boolean>(true); // ローディング状態のステート

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
        setIsLoading(false); // ローディング状態を解除
      }
    };

    fetchQuizResults();
  }, []);

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24時間表示
    });
  };

  return (
    <div>
      <h1>ゴースト一覧</h1>
      <button onClick={() => router.push("/")}>タイトルに戻る</button>
      {isLoading ? (
        <div>
          <h1>Loading...</h1>
        </div>
      ) : (
        <ul>
          {quizResults.map((result) => (
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
