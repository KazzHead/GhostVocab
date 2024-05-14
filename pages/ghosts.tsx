import React, { useEffect, useState } from "react";
import { folderDisplayNameMap } from "../utils/folderDisplayNameMap";
import { fileDisplayNameMap } from "../utils/fileDisplayNameMap";
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
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    const fetchQuizResults = async () => {
      const response = await fetch("/api/quizResults");
      const data = await response.json();
      if (response.ok) {
        setQuizResults(data);
      } else {
        console.error("Failed to fetch quiz results");
      }
    };

    fetchQuizResults();
  }, []);

  return (
    <div>
      <h1>ゴースト一覧</h1>
      <ul>
        {quizResults.map((result) => (
          <li key={result.id}>
            {`${result.name}\n${folderDisplayNameMap[result.book]} ${
              result.start
            }～${result.end} \n ${new Date(result.updatedAt).toLocaleString()}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizResultsList;
