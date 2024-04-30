import { useRouter } from "next/router";

const Results = () => {
  const router = useRouter();
  const { score } = router.query;

  return (
    <div>
      <h1>クイズの結果</h1>
      <p>あなたのスコア: {score} / 10</p>
      <button onClick={() => router.push("/")}>ホームに戻る</button>
    </div>
  );
};

export default Results;
