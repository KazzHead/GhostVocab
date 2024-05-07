import { useRouter } from "next/router";
import "../styles/index.module.css";

interface Result {
  question: string;
  correctAnswer: string;
  isCorrect: boolean;
  extra: string[];
}

const Results = () => {
  const router = useRouter();
  const { score } = router.query;
  const { results } = router.query;
  const resultsArray: Result[] = results ? JSON.parse(results as string) : [];

  return (
    <div>
      <h1>クイズの結果</h1>
      <p>あなたのスコア: {score} / 10</p>
      <button onClick={() => router.push("/")}>ホームに戻る</button>
      <ul>
        {resultsArray.map((result, index) => (
          <li key={index}>
            {`${index + 1}. ${result.isCorrect ? "◯" : "✕"} ${
              result.question
            } \n${result.correctAnswer} ${result.extra?.join(", ")}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Results;
