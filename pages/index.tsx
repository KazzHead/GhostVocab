import Link from "next/link";
import styles from "../styles/index.module.css";
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

interface RankedQuizResult extends QuizResult {
  ranking: number;
}

const Home = () => {
  const router = useRouter();
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [bookWordCount, setBookWordCount] = useState<number>(0);

  const handleToggle = (name: string) => {
    setExpandedItems((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

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

  // 選択された単語帳の単語数を取得
  useEffect(() => {
    const fetchBookWordCount = async () => {
      if (selectedBook === "") {
        setBookWordCount(0);
        return;
      }

      try {
        const response = await fetch(`/wordbooks/${selectedBook}/EtoJ.csv`);
        if (response.ok) {
          const csvText = await response.text();
          const lineCount = csvText.trim().split("\n").length;
          setBookWordCount(lineCount);
        } else {
          console.error("Failed to fetch CSV file");
          setBookWordCount(0);
        }
      } catch (error) {
        console.error("An error occurred while fetching CSV:", error);
        setBookWordCount(0);
      }
    };

    fetchBookWordCount();
  }, [selectedBook]);

  const getMonthRange = (date: Date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { startOfMonth, endOfMonth };
  };

  const { startOfMonth, endOfMonth } = getMonthRange(currentMonth);

  const monthlyQuizResults = quizResults.filter(
    (result) =>
      new Date(result.updatedAt) >= startOfMonth &&
      new Date(result.updatedAt) <= endOfMonth
  );

  const books = [...new Set(monthlyQuizResults.map((result) => result.book))];

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

  const filteredResults = monthlyQuizResults.filter(
    (result) => selectedBook === "" || result.book === selectedBook
  );

  // ユーザーと範囲ごとのタイムデータを保持
  const userRangeTimes: Record<
    string,
    Record<string, { totalTime: number; correctCount: number }>
  > = {};

  // 各ユーザーのベスト記録を取得
  const bestResultsByName: Record<string, QuizResult> = {};
  filteredResults.forEach((result) => {
    const name = result.name;
    const resultStats = calculateResults(result.contents);

    // ユーザーと範囲ごとのタイムを格納
    const range = `${result.start}～${result.end}`;
    if (!userRangeTimes[name]) {
      userRangeTimes[name] = {};
    }
    if (
      !userRangeTimes[name][range] ||
      resultStats.correctCount > userRangeTimes[name][range].correctCount ||
      (resultStats.correctCount === userRangeTimes[name][range].correctCount &&
        resultStats.totalTime < userRangeTimes[name][range].totalTime)
    ) {
      userRangeTimes[name][range] = {
        totalTime: resultStats.totalTime,
        correctCount: resultStats.correctCount,
      };
    }

    if (!bestResultsByName[name]) {
      bestResultsByName[name] = result;
    } else {
      const currentBestStats = calculateResults(
        bestResultsByName[name].contents
      );
      if (
        resultStats.correctCount > currentBestStats.correctCount ||
        (resultStats.correctCount === currentBestStats.correctCount &&
          resultStats.totalTime < currentBestStats.totalTime)
      ) {
        bestResultsByName[name] = result;
      }
    }
  });

  const uniqueBestResults = Object.values(bestResultsByName);

  const sortedBestResults = uniqueBestResults.sort((a, b) => {
    const aResults = calculateResults(a.contents);
    const bResults = calculateResults(b.contents);
    if (aResults.correctCount === bResults.correctCount) {
      return aResults.totalTime - bResults.totalTime;
    }
    return bResults.correctCount - aResults.correctCount;
  });

  // ランキングを計算（同点・同タイムの場合は同順位）
  const rankedResults: RankedQuizResult[] = [];
  let currentRank = 1;

  sortedBestResults.forEach((result, index) => {
    const resultStats = calculateResults(result.contents);
    if (index > 0) {
      const prevResultStats = calculateResults(
        sortedBestResults[index - 1].contents
      );
      if (
        resultStats.correctCount === prevResultStats.correctCount &&
        resultStats.totalTime === prevResultStats.totalTime
      ) {
        // 同点・同タイムの場合、currentRankを更新しない
      } else {
        currentRank = index + 1;
      }
    }
    const rankedResult: RankedQuizResult = {
      ...result,
      ranking: currentRank,
    };
    rankedResults.push(rankedResult);
  });

  const top3ByCorrectAndTime = rankedResults.filter(
    ({ ranking }) => ranking <= 3
  );

  const aggregatedResults = filteredResults.reduce(
    (acc, result) => {
      const key = `${result.book}-${result.start}-${result.end}`;

      if (!acc[key]) {
        acc[key] = {
          name: result.name,
          book: result.book,
          start: result.start,
          end: result.end,
          ...calculateResults(result.contents),
        };
      } else {
        const currentBest = acc[key];
        const newResult = calculateResults(result.contents);
        if (
          newResult.correctCount > currentBest.correctCount ||
          (newResult.correctCount === currentBest.correctCount &&
            newResult.totalTime < currentBest.totalTime)
        ) {
          acc[key] = {
            name: result.name,
            book: result.book,
            start: result.start,
            end: result.end,
            ...newResult,
          };
        }
      }
      return acc;
    },
    {} as Record<
      string,
      {
        name: string;
        book: string;
        start: number;
        end: number;
        correctCount: number;
        totalTime: number;
      }
    >
  );

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

  const sortedFirstPlaceCounts = Object.entries(firstPlaceCounts).sort(
    ([, a], [, b]) => b.length - a.length
  );

  const firstRanking: RankingEntry[] = [];
  currentRank = 1;

  sortedFirstPlaceCounts.forEach(([name, bookStartEnds], index, array) => {
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

  const getRankClassName = (rank: number) => {
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

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() - 1);
      if (newDate < new Date(2024, 4)) {
        return prev;
      }
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() + 1);
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      if (newDate > currentMonthStart) {
        return prev;
      }
      return newDate;
    });
  };

  // ユーザーと範囲のリストを取得
  const users = [...new Set(filteredResults.map((result) => result.name))];

  // 全ての範囲を生成
  const ranges: string[] = [];
  const rangeSize = 100; // 範囲のサイズ
  if (bookWordCount > 0 && selectedBook !== "") {
    for (let i = 0; i < bookWordCount; i += rangeSize) {
      const start = i + 1;
      const end = Math.min(i + rangeSize, bookWordCount);
      ranges.push(`${start}～${end}`);
    }
  }

  // 各範囲ごとに最速タイムのユーザーを特定
  const fastestResultsByRange: Record<
    string,
    { name: string; totalTime: number; correctCount: number }
  > = {};

  filteredResults.forEach((result) => {
    const range = `${result.start}～${result.end}`;
    const { totalTime, correctCount } = calculateResults(result.contents);

    if (!fastestResultsByRange[range]) {
      fastestResultsByRange[range] = {
        name: result.name,
        totalTime,
        correctCount,
      };
    } else {
      const currentFastest = fastestResultsByRange[range];
      if (
        correctCount > currentFastest.correctCount ||
        (correctCount === currentFastest.correctCount &&
          totalTime < currentFastest.totalTime)
      ) {
        fastestResultsByRange[range] = {
          name: result.name,
          totalTime,
          correctCount,
        };
      }
    }
  });

  // ユーザーごとの取り組んだ範囲をマッピング
  const userRangeMap: Record<
    string,
    Record<string, "fastest" | "attempted" | "notAttempted">
  > = {};

  // ユーザーごとに初期化
  users.forEach((user) => {
    userRangeMap[user] = {};
    ranges.forEach((range) => {
      userRangeMap[user][range] = "notAttempted"; // 初期値を 'notAttempted'
    });
  });

  // ユーザーごとの状態を設定
  filteredResults.forEach((result) => {
    const user = result.name;
    const range = `${result.start}～${result.end}`;
    if (userRangeMap[user] && userRangeMap[user][range] !== undefined) {
      const fastestResult = fastestResultsByRange[range];
      if (fastestResult && fastestResult.name === user) {
        userRangeMap[user][range] = "fastest";
      } else {
        userRangeMap[user][range] = "attempted";
      }
    }
  });

  // ユーザーと範囲からタイムを取得する関数を追加
  const getTimeForUserRange = (user: string, range: string) => {
    if (
      userRangeTimes[user] &&
      userRangeTimes[user][range] &&
      userRangeTimes[user][range].totalTime
    ) {
      return userRangeTimes[user][range].totalTime;
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleBox}>
        <img
          src="/images/outlined_ghost.png"
          style={{
            width: "30px",
          }}
        ></img>
        <div className={styles.titleText}>Ghost Vocab</div>
      </div>
      <div className={styles.ghostButtonsBox}>
        <div
          className={styles.purpleGhostButton}
          onClick={() => router.push("/wordbooks?state=study")}
          style={{
            backgroundImage: "url(/images/purple_ghost.png)",
          }}
        ></div>
        <div
          className={styles.redGhostButton}
          onClick={() => router.push("/wordbooks?state=test")}
          style={{
            backgroundImage: "url(/images/red_ghost.png)",
          }}
        ></div>{" "}
        <div
          className={styles.greenGhostButton}
          onClick={() => router.push("/ghosts")}
          style={{
            backgroundImage: "url(/images/green_ghost.png)",
          }}
        ></div>{" "}
        <div
          className={styles.yellowGhostButton}
          onClick={() => router.push("/events")}
          style={{
            backgroundImage: "url(/images/yellow_ghost.png)",
          }}
        ></div>
      </div>
      <h2>月間ランキング</h2>

      {isLoading ? (
        <div>
          <h1>Loading...</h1>
        </div>
      ) : (
        <div>
          <div className={styles.monthControls}>
            <div
              className={styles.leftTriangle}
              onClick={handlePreviousMonth}
            ></div>
            <span>
              {currentMonth.toLocaleString("ja-JP", {
                year: "numeric",
                month: "long",
              })}
            </span>
            <div
              className={styles.rightTriangle}
              onClick={handleNextMonth}
            ></div>
          </div>
          <div className={styles.selectBox}>
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

          {users.length > 0 && ranges.length > 0 ? (
            <table className={styles.achievementTable}>
              <thead>
                <tr>
                  <th>ユーザー</th>
                  {ranges.map((range) => (
                    <th key={range}>{range}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user}>
                    <td>{user}</td>
                    {ranges.map((range) => (
                      <td key={range} style={{ textAlign: "center" }}>
                        {userRangeMap[user][range] === "fastest" ||
                        userRangeMap[user][range] === "attempted" ? (
                          <div className={styles.tooltipContainer}>
                            <span
                              className={
                                userRangeMap[user][range] === "fastest"
                                  ? styles.fastest
                                  : styles.attempted
                              }
                            >
                              {userRangeMap[user][range] === "fastest"
                                ? "★"
                                : "●"}
                            </span>
                            <div className={styles.tooltip}>
                              {getTimeForUserRange(user, range)
                                ? `${(
                                    getTimeForUserRange(user, range)! / 1000
                                  ).toFixed(1)}秒`
                                : "-"}
                            </div>
                          </div>
                        ) : userRangeMap[user][range] === "notAttempted" ? (
                          <span className={styles.notAttempted}>-</span>
                        ) : (
                          "-"
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            ""
          )}

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
                  <li>
                    <div>
                      <span>
                        {result.ranking}位 {result.name} {correctCount}点{" "}
                        {(totalTime / 1000).toFixed(1)}秒
                      </span>
                      {"\n"}
                      {folderDisplayNameMap[result.book]} {result.start}～
                      {result.end}
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
                  key={name}
                  className={getRankClassName(rank)}
                  onClick={() => handleToggle(name)}
                >
                  <li>
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
