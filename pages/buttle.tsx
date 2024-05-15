import { useState, useEffect, useRef } from "react";
//import styles from "C:/Users/onlyb/quiz-app/styles/index.module.css";
import styles from "../styles/Quiz.module.css";
import { useRouter } from "next/router";
import { folderDisplayNameMap } from "../utils/folderDisplayNameMap";

interface Word {
  word: string;
  meaning: string;
  extra: string[];
}

// interface Result {
//   name: string;
//   book: string;
//   mode: string;
//   start: number;
//   end: number;
//   question: string;
//   choices: string[];
//   selectedChoice: string;
//   isCorrect: boolean;
//   responseTime: number;
//   extra: string[];
// }

interface question {
  id: number;
  name: string; // ユーザー名
  book: string; // 書籍名
  mode: string; // クイズモード（例: "easy", "hard"）
  start: number; // 開始時間（unix timestamp）
  end: number; // 終了時間（unix timestamp）
  contents: content[];
}

interface result {
  name: string; // ユーザー名
  book: string; // 書籍名
  mode: string;
  start: number; // 開始時間（unix timestamp）
  end: number; // 終了時間（unix timestamp）
  rank: string;
  contents: content[]; // クイズの内容配列
}

interface content {
  question: string; // 問題文
  choices: string[]; // 選択肢配列
  selectedChoice: string; // 選択した選択肢
  isCorrect: boolean; // 正解かどうか
  responseTime: number; // 回答時間（秒）
  correctAnswer: string;
  extra: any; // その他の情報（Json形式）
}

export default function Test() {
  const [username, setUsername] = useState(""); // ユーザー名を保存するための状態
  const [hasStarted, setHasStarted] = useState(false); // クイズが開始されたかの状態
  const [allWords, setAllWords] = useState<Word[]>([]); //101-200など100個の単語&意味
  const [quizWords, setQuizWords] = useState<Word[]>([]); //100個の単語から選ばれた10個の出題用単語&意味
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isChoosing, setIsChoosing] = useState(true);

  const [pContent, setPContent] = useState<content[]>([]);
  const [gContent, setGContent] = useState<content[]>([]);
  const [score, setScore] = useState(0);
  const [pScore, setPScore] = useState(0);
  const [gScore, setGScore] = useState(0);
  const [winner, setWinner] = useState<string[]>([]);

  const [result, setResult] = useState<result[]>([]);
  const [content, setContent] = useState<content[]>([]);
  const [timerProgress, setTimerProgress] = useState(100); // タイマー進行状態
  const router = useRouter();

  const [question, setQuestion] = useState<question | null>(null);

  const [book, setBook] = useState("");
  const [mode, setMode] = useState("");
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  // const { book, mode, start, end } = router.query as {
  //   book: string;
  //   mode: string;
  //   start: string;
  //   end: string;
  // };
  const [startTime, setStartTime] = useState<number>(0);
  const [countdown, setCountdown] = useState(3);

  // const [quizResultId, setQuizResultId] = useState(1);
  const quizResultId = router.query.quizResultId as string;

  const [circleColors, setCircleColors] = useState({
    leftSmall: "#ddd",
    large: "#ddd",
    rightSmall: "#ddd",
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const displayBookName = folderDisplayNameMap[book];

  useEffect(() => {
    const fetchQuizResult = async () => {
      const response = await fetch(`/api/quizResult/${quizResultId}`);
      const data = await response.json();
      console.log("Fetched data:", data);
      // レスポンスが成功した場合のみ setQuestion を呼び出す
      if (response.ok) {
        setQuestion(data);
      } else {
        console.error("Failed to fetch data:", data);
      }
    };
    fetchQuizResult();
  }, [quizResultId]);

  useEffect(() => {
    if (question) {
      setBook(question.book);
      setMode(question.mode);
      setStart(question.start);
      setEnd(question.end);
      setContent(question.contents); // クイズの内容を設定
      setGContent(question.contents);
      pickQuestion(0);
      setHasStarted(true);
    }
  }, [question]);

  // useEffect(() => {
  //   console.log("----start----");
  //   if (currentWordIndex) {
  //     setTimeout(() => {
  //       if (
  //         isChoosing == true &&
  //         gContent[currentWordIndex].isCorrect == true
  //       ) {
  //         console.log(
  //           "----setColor----:",
  //           gContent[currentWordIndex].responseTime
  //         );
  //         setCircleColors({
  //           leftSmall: "#ddd",
  //           large: "#ff8e3c",
  //           rightSmall: "#ff8e3c",
  //         });
  //       }
  //     }, gContent[currentWordIndex].responseTime);
  //   }
  // }, [startTime]);

  useEffect(() => {
    console.log("----start----");

    if (
      gContent &&
      currentWordIndex >= 0 &&
      currentWordIndex < gContent.length &&
      gContent[currentWordIndex].responseTime
    ) {
      const gtimer = setTimeout(() => {
        if (
          isChoosing === true &&
          gContent[currentWordIndex].isCorrect === true
        ) {
          console.log(
            "----setColor----:",
            gContent[currentWordIndex].responseTime
          );
          setCircleColors({
            leftSmall: "#ddd",
            large: "#ff8e3c",
            rightSmall: "#ff8e3c",
          });
        }
      }, gContent[currentWordIndex].responseTime);

      return () => {
        clearTimeout(gtimer);
        console.log("gTimer cleared!");
      };
    }
  }, [startTime, currentWordIndex, gContent, isChoosing]);

  function pickQuestion(index: number) {
    console.log("pickQuestion called");
    if (index >= content.length || content.length === 0) {
      return; // 問題がない場合は何もしない
    }

    const currentContent = content[index];

    const wordObject: Word = {
      word: currentContent.question,
      meaning: currentContent.correctAnswer,
      extra: currentContent.extra,
    };

    setCurrentWord(wordObject);
    setChoices(currentContent.choices);
    setCurrentWordIndex(index); // 現在の問題のインデックス
    setCircleColors({
      leftSmall: "#ddd",
      large: "#ddd",
      rightSmall: "#ddd",
    });

    setStartTime(Date.now()); // 回答開始時間の記録

    setSelectedChoice(null);
    setIsChoosing(true);
  }

  // console.log("book:", book);
  // console.log("mode:", mode);
  // console.log("start:", start);
  // console.log("end:", end);
  // useEffect(() => {
  //   console.log("currentWord changed");
  // }, [currentWord]);
  // useEffect(() => {
  //   console.log("hasStarted changed:", hasStarted);
  // }, [hasStarted]);
  // useEffect(() => {
  //   console.log("currentWordIndex changed:", currentWordIndex);
  // }, [currentWordIndex]);
  // useEffect(() => {
  //   console.log("choices changed");
  // }, [choices]);
  useEffect(() => {
    console.log("result changed:", result);
  }, [result]);
  useEffect(() => {
    console.log("content changed:", content);
  }, [content]);
  useEffect(() => {
    console.log("pContent changed:", pContent);
  }, [pContent]);
  useEffect(() => {
    console.log("gContent changed:", gContent);
  }, [gContent]);
  // useEffect(() => {
  //   console.log("question changed:", question);
  // }, [question]);
  useEffect(() => {
    console.log("pScore changed:", pScore);
  }, [pScore]);
  useEffect(() => {
    console.log("gScore changed:", gScore);
  }, [gScore]);
  useEffect(() => {
    console.log("isChoosing changed:", isChoosing);
  }, [isChoosing]);
  useEffect(() => {
    console.log("currentWord changed:", currentWord);
  }, [currentWord]);
  // useEffect(() => {
  //   console.log("allWords changed:", allWords);
  // }, [allWords]);
  // useEffect(() => {
  //   console.log("quizWords changed:", quizWords);
  // }, [quizWords]);

  useEffect(() => {
    // 3秒カウントダウンを管理
    if (hasStarted && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [hasStarted, countdown]);

  const handleStartQuiz = () => {
    setHasStarted(true);
  };

  // useEffect(() => {
  //   if (book && mode && start && end) {
  //     fetch(`/api/words?book=${book}&mode=${mode}&start=${start}&end=${end}`)
  //       .then((response) => response.json())
  //       .then((data) => {
  //         setAllWords(data);
  //         const selectedIndices = new Set<number>();
  //         while (selectedIndices.size < 10) {
  //           selectedIndices.add(Math.floor(Math.random() * data.length));
  //         }
  //         setQuizWords(Array.from(selectedIndices).map((index) => data[index]));
  //         // pickWord(0);
  //       });
  //   }
  // }, [question]);

  useEffect(() => {
    if (countdown == 0) {
      pickQuestion(0);
    }
  }, [countdown]);

  useEffect(() => {
    // 10秒タイマーを管理
    if (countdown == 0 && isChoosing && currentWord) {
      setTimerProgress(100);
      clearInterval(timerRef.current!);
      timerRef.current = setInterval(() => {
        setTimerProgress((prev) => Math.max(0, prev - 0.1));
      }, 10);
    } else {
      clearInterval(timerRef.current!);
    }
    return () => clearInterval(timerRef.current!);
  }, [isChoosing, currentWord, countdown]);

  function pickWord(index: number) {
    if (index >= quizWords.length || quizWords.length === 0) {
      return;
    }

    const word = quizWords[index];
    setCurrentWord(word);

    setCurrentWordIndex(index);
    setStartTime(Date.now());
    console.log("--------StartTime set----------");

    const fakeChoices: string[] = [];
    while (fakeChoices.length < 3) {
      const option = allWords[Math.floor(Math.random() * allWords.length)];
      if (
        option.meaning !== word.meaning &&
        !fakeChoices.includes(option.meaning)
      ) {
        fakeChoices.push(option.meaning);
      }
    }
    setChoices([...fakeChoices, word.meaning].sort(() => Math.random() - 0.5));
    setSelectedChoice(null);
    setIsChoosing(true);
  }

  useEffect(() => {
    if (!isChoosing && currentWordIndex >= content.length - 1) {
      const rank = calculateRank(score, content);
      const newResult: result = {
        name: username,
        book: book,
        mode: mode,
        start: start,
        end: end,
        contents: content,
        rank: rank,
      };
      setResult((prevResult) => [...prevResult, newResult]);
    }
  }, [pContent]);

  useEffect(() => {
    //resultに渡す
    if (!isChoosing && currentWordIndex >= content.length - 1) {
      setTimeout(() => {
        // saveResultToServer();

        console.log("saving result:", result);
        router.push({
          pathname: "/buttleresults",
          query: {
            book: book,
            mode: mode,
            start: start,
            end: end,
            score: score,
            content: JSON.stringify(content),
            pScore: pScore,
            gScore: gScore,
            gName: question?.name,
          },
        });
      }, 2000);
    }
  }, [result]);

  const calculateRank = (score: number, results: content[]) => {
    if (score <= 3) return "D";
    if (score <= 5) return "C";
    if (score <= 7) return "B";
    if (score <= 9) return "A";
    const fastResponses = results.filter((c) => c.responseTime < 5000).length;
    if (fastResponses === 10) return "SS";
    if (fastResponses >= 5) return "S";
    return "A";
  };

  const handleChoice = (choice: string) => {
    if (!isChoosing) return;

    let newColors = { ...circleColors };
    setSelectedChoice(choice);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const currentContent = content[currentWordIndex];
    const isCorrect = currentContent.correctAnswer === choice;

    const newContent: content = {
      ...currentContent,
      selectedChoice: choice,
      isCorrect: isCorrect,
      responseTime: responseTime,
    };
    setPContent((prevContent) => [
      ...prevContent.slice(0, currentWordIndex),
      newContent,
      ...prevContent.slice(currentWordIndex + 1),
    ]);
    setIsChoosing(false);

    if (isCorrect == true && gContent[currentWordIndex].isCorrect == true) {
      if (responseTime <= gContent[currentWordIndex].responseTime) {
        setPScore(pScore + 2);
        setGScore(gScore + 1);
        newColors = {
          leftSmall: "#6246ea",
          large: "#6246ea",
          rightSmall: "#ff8e3c",
        };
      } else {
        setPScore(pScore + 1);
        setGScore(gScore + 2);
        newColors = {
          leftSmall: "#6246ea",
          large: "#ff8e3c",
          rightSmall: "#ff8e3c",
        };
      }
    } else if (
      isCorrect == true &&
      gContent[currentWordIndex].isCorrect == false
    ) {
      setPScore(pScore + 2);
      setGScore(gScore + 0);
      newColors = {
        leftSmall: "#6246ea",
        large: "#6246ea",
        rightSmall: "#ddd",
      };
    } else if (
      isCorrect == false &&
      gContent[currentWordIndex].isCorrect == true
    ) {
      setPScore(pScore + 0);
      setGScore(gScore + 2);
      newColors = {
        leftSmall: "#ddd",
        large: "#ff8e3c",
        rightSmall: "#ff8e3c",
      };
    } else if (
      isCorrect == false &&
      gContent[currentWordIndex].isCorrect == false
    ) {
      setPScore(pScore + 0);
      setGScore(gScore + 0);
    }

    setCircleColors(newColors);

    if (isCorrect) {
      setScore(score + 1);
    }

    const nextIndex = currentWordIndex + 1;
    if (nextIndex < content.length) {
      setTimeout(() => {
        pickQuestion(nextIndex);
      }, 2000);
    }
  };

  function getChoiceClass(choice: string) {
    if (selectedChoice === "") {
      if (choice === currentWord?.meaning) {
        return `${styles.choice} ${styles.correct}`;
      }
      return styles.choice;
    }

    if (!selectedChoice) return styles.choice;
    if (choice === currentWord?.meaning)
      return `${styles.choice} ${styles.correct}`;
    if (choice === selectedChoice)
      return `${styles.choice} ${styles.incorrect}`;
    return styles.choice;
  }

  const saveResultToServer = async () => {
    console.log(
      "JSON.stringify({ result: result }):",
      JSON.stringify({ result: result })
    );
    const response = await fetch("/api/saveResults", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ result: result }),
    });
  };

  return (
    <div className={styles.container}>
      {countdown === 0 && (
        <>
          <h1>{`${displayBookName} ${start}～${end} VS ${question?.name}`}</h1>
          <p>{`${currentWordIndex + 1}/${content.length} 問目`}</p>
          {/* <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBar}
              style={{
                width: `${timerProgress}%`,
                backgroundColor: timerProgress > 50 ? "#6246ea" : "#ff8e3c",
              }}
            />
          </div> */}
          <div
            className={styles.powerBarContainer}
            style={{ position: "relative" }}
          >
            <div
              className={styles.powerBarPlayer}
              style={{
                width: `${
                  pScore + gScore > 0 ? (pScore * 100) / (pScore + gScore) : 50
                }%`,
                // height: pScore >= gScore ? "15px" : "10px",
              }}
            >
              <div className={styles.scoreLabelPlayer}>{pScore}点</div>
            </div>
            <div
              className={styles.powerBarGhost}
              style={{
                width: `${
                  pScore + gScore > 0 ? (gScore * 100) / (pScore + gScore) : 50
                }%`,
                // height: gScore > pScore ? "15px" : "10px",
              }}
            >
              <div className={styles.scoreLabelGhost}>{gScore}点</div>
            </div>
          </div>
          {currentWord && (
            <>
              <p>{`${currentWord.word}`}</p>
              <div className={styles.feedbackContainer}>
                <div className={styles.ChoicesContainer}>
                  <ul>
                    {choices.map((choice, index) => (
                      <li
                        key={index}
                        className={getChoiceClass(choice)}
                        onClick={() => handleChoice(choice)}
                      >
                        {choice}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <li
                key="unknown"
                className={styles.idk}
                onClick={() => handleChoice("")}
              >
                わからない
              </li>
            </>
          )}
        </>
      )}
      {/* {!hasStarted && (
        <div className={styles.fullScreen}>
          <input
            type="text"
            placeholder="名前を入力してください"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleStartQuiz}>クイズを始める</button>
        </div>
      )} */}
      {countdown > 0 && (
        <div className={styles.fullScreen}>
          <div className={styles.countdownText}>
            {`相手より早く正解で+2点\n正解で+1点\n\n`}
            {mode === "fillBrackets"
              ? " ( ) に入る単語を選んで！"
              : mode === "EtoJ"
              ? " 日本語の意味を選んで！"
              : ""}
          </div>
          <div
            className={styles.countdownNumber}
            style={{ fontSize: hasStarted ? "300px" : "70px" }}
          >
            {hasStarted === true ? countdown : "Loading..."}
          </div>
        </div>
      )}
      <div className={styles.circleContainer}>
        <div className={styles.playerNameText}>あなた</div>
        <div
          className={styles.circle}
          style={{ backgroundColor: circleColors.leftSmall }}
        >
          <div className={`${styles.circleText}`}>+1</div>
        </div>
        <div
          className={`${styles.circle} ${styles.largeCircle}`}
          style={{ backgroundColor: circleColors.large }}
        >
          <div className={`${styles.circleText}`}>ボーナス+1</div>
        </div>
        <div
          className={styles.circle}
          style={{ backgroundColor: circleColors.rightSmall }}
        >
          <div className={`${styles.circleText}`}>+1</div>
        </div>
        <div className={styles.ghostNameText}>{question?.name}</div>
      </div>
    </div>
  );
}
