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

  //quizResultsをセット
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

  //コンテンツをいれると正答数と合計時間を計算
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

  //プルダウンによって選ばれたnameとbookでquizResultsを絞り込み
  const filteredResults = quizResults.filter(
    (result) =>
      (selectedName === "" || result.name === selectedName) &&
      (selectedBook === "" || result.book === selectedBook)
  );

  //正答数と合計時間によってfilteredResultsをソート
  const sortedByCorrectAndTime = [...filteredResults].sort((a, b) => {
    const aResults = calculateResults(a.contents);
    const bResults = calculateResults(b.contents);
    if (aResults.correctCount === bResults.correctCount) {
      return aResults.totalTime - bResults.totalTime;
    }
    return bResults.correctCount - aResults.correctCount;
  });

  //トップ3のみ抽出
  const top3ByCorrectAndTime = sortedByCorrectAndTime.slice(0, 3);

  const aggregatedResults = filteredResults.reduce((acc, result) => {
    // クイズ結果を識別するためのキーを生成（例: "book1-0-100"）
    const key = `${result.book}-${result.start}-${result.end}`;

    // まだこのキーが存在しない場合、新しいユーザーの結果を設定
    if (!acc[key]) {
      acc[key] = {
        name: result.name,
        book: result.book,
        start: result.start,
        end: result.end,
        ...calculateResults(result.contents),
      };
    } else {
      // 既に存在する場合、現在の最良の結果と新しい結果を比較して更新
      const currentBest = acc[key];
      const newResult = calculateResults(result.contents);
      if (
        newResult.correctCount > currentBest.correctCount || // 新しい結果の方が正解数が多い場合
        (newResult.correctCount === currentBest.correctCount &&
          newResult.totalTime < currentBest.totalTime) // 正解数が同じ場合、合計時間が短い方が優先
      ) {
        acc[key] = {
          name: result.name,
          book: result.book,
          start: result.start,
          end: result.end,
          ...newResult,
        }; // 最良の結果を更新
      }
    }
    return acc; // 累積結果を返す
  }, {} as Record<string, { name: string; book: string; start: number; end: number; correctCount: number; totalTime: number }>);

  // 各book、start、endごとに1位を取ったユーザーのカウントを集計
  const firstPlaceCounts = Object.values(aggregatedResults).reduce(
    (acc, { name, book, start, end }) => {
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(`${folderDisplayNameMap[book]} ${start}～${end}`);
      return acc;
    },
    {} as Record<string, string[]>
  );

  // 1位を取った数が多い順にソート
  const sortedFirstPlaceCounts = Object.entries(firstPlaceCounts).sort(
    ([, a], [, b]) => b.length - a.length
  );
  console.log("sortedFirstPlaceCounts", sortedFirstPlaceCounts);

  let rank = 1;
  let previousCount = -1;
  const rankedFirstPlaceCounts = sortedFirstPlaceCounts.map(
    ([name, bookStartEnds], index) => {
      if (bookStartEnds.length !== previousCount) {
        rank = index + 1;
        previousCount = bookStartEnds.length;
      }
      return { rank, name, bookStartEnds };
    }
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
        <div>
          <h2>合計時間ランキング</h2>
          <ul>
            {top3ByCorrectAndTime.map((result) => {
              const { correctCount, totalTime } = calculateResults(
                result.contents
              );
              return (
                <li key={result.id}>
                  <div>
                    {result.name} {folderDisplayNameMap[result.book]}{" "}
                    {correctCount}点 合計{totalTime / 1000}秒
                  </div>
                </li>
              );
            })}
          </ul>
          <h2>選ばれた単語帳ごとのランキング上位3人</h2>
          <ul>
            {sortedFirstPlaceCounts.map(([name, bookStartEnds]) => (
              <li key={name}>
                <div>
                  {name} {bookStartEnds.length}冠
                  <ul>
                    {bookStartEnds.map((bookStartEnd, index) => (
                      <li key={index}>{bookStartEnd}</li>
                    ))}
                  </ul>
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
