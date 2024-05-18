// Reactコンポーネント
import React, { useState, useEffect } from "react";

interface Content {
  id: number;
  question: string;
  choices: string[];
  selectedChoice: string;
  isCorrect: boolean;
  responseTime: number;
  correctAnswer: string;
}

interface QuizResult {
  id: number;
  name: string;
  contents: Content[];
}

interface QuizResultProps {
  quizResultId: number;
}

const QuizResultDetails: React.FC<QuizResultProps> = () => {
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizResultId, setQuizResultId] = useState(1);

  console.log("quizResultId:", quizResultId);
  useEffect(() => {
    const fetchQuizResult = async () => {
      try {
        const response = await fetch(`/api/quizResult/${quizResultId}`, {
          method: "GET",
        });
        const data = await response.json();
        console.log("Fetched data:", data);
        setQuizResult(data);
        setLoading(false);
      } catch (err) {
        setError("データの取得中にエラーが発生しました。");
        setLoading(false);
      }
    };

    fetchQuizResult();
  }, [quizResultId]);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  if (!quizResult) return <div>データが見つかりません。</div>;

  return (
    <div>
      <h1>クイズ結果詳細: {quizResult.name}</h1>
      {quizResult.contents.map((content, index) => (
        <div key={index}>
          <p>問題: {content.question}</p>
          <p>選択肢: {content.choices.join(", ")}</p>
          <p>選んだ回答: {content.selectedChoice}</p>
          <p>正解: {content.isCorrect ? "正解" : "不正解"}</p>
          <p>正解の回答: {content.correctAnswer}</p>
          <p>反応時間: {content.responseTime / 1000}秒</p>
        </div>
      ))}
    </div>
  );
};

export default QuizResultDetails;
