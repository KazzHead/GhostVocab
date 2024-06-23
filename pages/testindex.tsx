import Link from "next/link";
import styles from "../styles/index.module.css";
import router from "next/router";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { folderDisplayNameMap } from "../utils/folderDisplayNameMap";
import { url } from "inspector";

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
  // const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2024, 4));
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

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

  const names = [...new Set(monthlyQuizResults.map((result) => result.name))];
  const books = [...new Set(monthlyQuizResults.map((result) => result.book))];

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
    (result) =>
      (selectedName === "" || result.name === selectedName) &&
      (selectedBook === "" || result.book === selectedBook)
  );

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

  const top3ByCorrectAndTime = rankedByCorrectAndTime.filter(
    ({ ranking }) => ranking <= 3
  );
  useEffect(() => {
    if (quizResults.length > 0) {
      const randomBook =
        quizResults[Math.floor(Math.random() * quizResults.length)].book;
      setSelectedBook(randomBook);
    }
  }, [quizResults]);

  const aggregatedResults = filteredResults.reduce((acc, result) => {
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
  }, {} as Record<string, { name: string; book: string; start: number; end: number; correctCount: number; totalTime: number }>);

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

  const ranking: RankingEntry[] = [];
  const timeRanking: RankingEntry[] = [];
  const firstRanking: RankingEntry[] = [];
  let currentRank = 1;

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

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() - 1);
      if (newDate < new Date(2024, 4)) {
        return prev; // 2024年5月より前には戻さない
      }
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
    );
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
      操作ミスで今までのデータが全部消えてしまいました．残してくれた人たちごめんなさい…
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
      {/* <div className={styles.buttons}>
        <button onClick={() => router.push("/wordbooks?state=study")}>
          練習する
        </button>
        <button onClick={() => router.push("/wordbooks?state=test")}>
          テストする
        </button>
        <button onClick={() => router.push("/ghosts")}>ゴーストと対戦</button>
        <button onClick={() => router.push("/events")}>イベント</button>
      </div> */}
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
