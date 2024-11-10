import { useRouter } from "next/router";
import "../styles/index.module.css";
import { folderDisplayNameMap } from "../utils/folderDisplayNameMap";
import Head from "next/head";

interface content {
  question: string; // 問題文
  choices: string[]; // 選択肢配列
  selectedChoice: string; // 選択した選択肢
  isCorrect: boolean; // 正解かどうか
  responseTime: number; // 回答時間（秒）
  correctAnswer: string;
  extra: any; // その他の情報（Json形式）
}
const Results = () => {
  const router = useRouter();
  const { score } = router.query;
  const { content } = router.query;
  console.log("content:", content);
  const resultsArray: content[] = content ? JSON.parse(content as string) : [];
  console.log("resultsArray:", resultsArray);
  const { book, mode, start, end, pScore, gScore, gName, quizResultId } =
    router.query as {
      book: string;
      mode: string;
      start: string;
      end: string;
      pScore: string;
      gScore: string;
      gName: string;
      quizResultId: string;
    };
  const displayBookName = folderDisplayNameMap[book];

  const calculateRank = (score: number, results: content[]) => {
    if (score <= 3) return "D";
    if (score <= 5) return "C";
    if (score <= 7) return "B";
    if (score <= 9) return "A";

    // スコアが10の場合、responseTimeを確認
    const fastResponses = results.filter((c) => c.responseTime < 5000).length;
    if (fastResponses === 10) return "SS";
    if (fastResponses >= 5) return "S";
    return "A"; // デフォルトでAを返す
  };

  const rank = calculateRank(Number(score), resultsArray);

  return (
    <>
      <Head>
        <title>バトル結果</title>
      </Head>
      <div>
        <h1>{`あなた |  ${pScore} : ${gScore}  | ${gName}`}</h1>
        <h1>
          {parseInt(pScore) > parseInt(gScore)
            ? `${gName} に勝利！`
            : parseInt(pScore) == parseInt(gScore)
            ? "引き分け"
            : `${gName} に敗北...`}
        </h1>
        <button
          onClick={() => router.push(`/battle?quizResultId=${quizResultId}`)}
        >
          もう一度挑戦
        </button>
        <button onClick={() => router.push("/ghosts")}>
          ゴースト選択に戻る
        </button>
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
    </>
  );
};

export default Results;
