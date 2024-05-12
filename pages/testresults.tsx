import { useRouter } from "next/router";
import "../styles/index.module.css";

interface content {
  question: string;
  correctAnswer: string;
  isCorrect: boolean;
  extra: string[];
}

const Results = () => {
  const router = useRouter();
  const { score } = router.query;
  const { content } = router.query;
  console.log("content:", content);
  const resultsArray: content[] = content ? JSON.parse(content as string) : [];
  console.log("resultsArray:", resultsArray);

  return (
    <div>
      <h1>クイズの結果</h1>
      <p>あなたのスコア: {score} / 10</p>
      <button onClick={() => router.push("/")}>ホームに戻る</button>
      <ul>
        {resultsArray.map((content, index) => (
          <li key={index}>
            {`${index + 1}. ${content.isCorrect ? "◯" : "✕"} ${
              content.question
            } \n${content.correctAnswer} ${content.extra?.join(", ")}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Results;
