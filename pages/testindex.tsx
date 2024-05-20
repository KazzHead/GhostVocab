import Link from "next/link";
import styles from "../styles/index.module.css";
import router from "next/router";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { folderDisplayNameMap } from "../utils/folderDisplayNameMap";

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

interface RankingEntry {
  rank: number;
  name: string;
  bookStartEnds: string[];
}

const Home = () => {
  const router = useRouter();
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [selectedName, setSelectedName] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const handleToggle = (name: string) => {
    setExpandedItems((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

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

  // useEffect(() => {
  //   if (names.length > 0) {
  //     setSelectedName(names[Math.floor(Math.random() * names.length)]);
  //   }
  //   if (books.length > 0) {
  //     setSelectedBook(books[Math.floor(Math.random() * books.length)]);
  //   }
  // }, [isLoading]);

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

  const rankedByCorrectAndTime = sortedByCorrectAndTime.map((result, index) => {
    return { ranking: index + 1, ...result };
  });

  //トップ3のみ抽出
  const top3ByCorrectAndTime = rankedByCorrectAndTime.filter(
    ({ ranking }) => ranking <= 3
  );

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

  // 順位計算のための新しい配列を作成し、同順位を適切に処理する
  const ranking: RankingEntry[] = [];
  const timeRanking: RankingEntry[] = [];
  const firstRanking: RankingEntry[] = [];
  let currentRank = 1;

  sortedFirstPlaceCounts.forEach(([name, bookStartEnds], index, array) => {
    // 前のユーザーと同じポイントの場合、同順位にする
    if (index > 0 && bookStartEnds.length === array[index - 1][1].length) {
      firstRanking.push({
        rank: firstRanking[firstRanking.length - 1].rank,
        name,
        bookStartEnds,
      });
    } else {
      firstRanking.push({ rank: currentRank, name, bookStartEnds });
    }
    currentRank++;
  });

  // ランキングに基づいてCSSクラスを割り当てる関数
  const getRankClassName = (rank: number) => {
    console.log("rank", rank);
    switch (rank) {
      case 1:
        return styles.rank1;
      case 2:
        return styles.rank2;
      case 3:
        return styles.rank3;
      default:
        return styles.rankDefault;
    }
  };

  return (
    <div className={styles.container}>
      <h1>Vocabulary Quiz</h1>
      <div className={styles.buttons}>
        <button onClick={() => router.push("/wordbooks?state=study")}>
          練習する
        </button>
        <button onClick={() => router.push("/wordbooks?state=test")}>
          テストする
        </button>
        <button onClick={() => router.push("/ghosts")}>ゴーストと対戦</button>
        <button onClick={() => router.push("/events")}>イベント</button>
      </div>
      <h1>ランキング</h1>

      {isLoading ? (
        <div>
          <h1>Loading...</h1>
        </div>
      ) : (
        <div>
          <div className={styles.selectBox}>
            {/* <select
          value={selectedName}
          onChange={(e) => setSelectedName(e.target.value)}
        >
          <option value="">すべての名前</option>
          {names.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select> */}
            <div className={styles.rankingSelectBox}>
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
          </div>

          <h3>合計解答時間ランキング</h3>
          <ul>
            {top3ByCorrectAndTime.map((result) => {
              const { correctCount, totalTime } = calculateResults(
                result.contents
              );
              return (
                <div
                  key={result.id}
                  className={getRankClassName(result.ranking)}
                >
                  <li
                    key={result.id}
                    // className={getRankClassName(result.ranking)}
                  >
                    <div>
                      <span>
                        {result.ranking}位 {result.name}{" "}
                        {(totalTime / 1000).toFixed(1)}秒
                      </span>
                      {"\n"}
                      {folderDisplayNameMap[result.book]} {result.start}～
                      {result.end} {correctCount}点
                    </div>
                  </li>
                </div>
              );
            })}
          </ul>

          <h3>1位取得数ランキング</h3>
          <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
            {firstRanking
              .filter(({ rank }) => rank <= 3)
              .map(({ rank, name, bookStartEnds }) => (
                <div
                  key="ranking"
                  className={getRankClassName(rank)}
                  onClick={() => handleToggle(name)}
                >
                  <li key={name}>
                    <div>
                      <span>
                        {rank}位 {name} {bookStartEnds.length}冠
                      </span>
                      {expandedItems[name] && (
                        <ul>
                          {bookStartEnds.map((bookStartEnd, index) => (
                            <li key={index}>{bookStartEnd}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                </div>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;
