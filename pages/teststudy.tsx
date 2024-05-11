import { useState, useEffect, useRef } from "react";
//import styles from "C:/Users/onlyb/quiz-app/styles/index.module.css";
import styles from "../styles/Quiz.module.css";
import { useRouter } from "next/router";

interface Word {
  word: string;
  meaning: string;
  extra: string[];
}

interface Result {
  question: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseTime: number;
  extra: string[];
}

export default function Study() {
  const [allWords, setAllWords] = useState<Word[]>([]); //101-200など100個の単語&意味
  const [quizWords, setQuizWords] = useState<Word[]>([]); //100個の単語から選ばれた10個の出題用単語&意味
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isChoosing, setIsChoosing] = useState(true);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [timerProgress, setTimerProgress] = useState(100); // タイマー進行状態
  const router = useRouter();
  const { book, mode, start, end } = router.query;
  const [startTime, setStartTime] = useState<number>(0);
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  console.log("book:", book);
  console.log("mode:", mode);
  console.log("start:", start);
  console.log("end:", end);
  // useEffect(() => {
  //   console.log("currentWord changed");
  // }, [currentWord]);
  useEffect(() => {
    console.log("currentWordIndex changed:", currentWordIndex);
  }, [currentWordIndex]);
  // useEffect(() => {
  //   console.log("choices changed");
  // }, [choices]);
  useEffect(() => {
    console.log("results changed:", results);
  }, [results]);
  // useEffect(() => {
  //   console.log("isChoosing changed");
  // }, [isChoosing]);
  useEffect(() => {
    console.log("allWords changed:", allWords);
  }, [allWords]);
  useEffect(() => {
    console.log("quizWords changed:", quizWords);
  }, [quizWords]);

  useEffect(() => {
    //スタート時のカウントダウンを実行
    const timer = setInterval(() => {
      if (countdown > 0) {
        setCountdown((prevCountdown) => prevCountdown - 1);
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    //スタート時のカウントダウン後問題をセット
    // if (countdown === 0 && book && mode && start && end) {
    if (book && mode && start && end) {
      fetch(`/api/words?book=${book}&mode=${mode}&start=${start}&end=${end}`)
        .then((response) => response.json())
        .then((data) => {
          setAllWords(data);
          const selectedIndices = new Set<number>();
          while (selectedIndices.size < 10) {
            selectedIndices.add(Math.floor(Math.random() * data.length));
          }
          setQuizWords(Array.from(selectedIndices).map((index) => data[index]));
          pickWord(0);
        });
    }
  }, [router.query]);

  useEffect(() => {
    // タイマーを管理

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

  useEffect(() => {
    pickWord(0);
  }, [quizWords]);

  function pickWord(index: number) {
    // console.log("---------changed----------");

    if (index >= quizWords.length || quizWords.length === 0) {
      // console.log("No more words or word list is empty.");
      return;
    }

    const word = quizWords[index];
    setCurrentWord(word);

    setCurrentWordIndex(index);
    // console.log("currentWordIndex:", currentWordIndex);
    setStartTime(Date.now());

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
    // もしクイズの問題がすべて終了していたら、結果をサーバーに保存し、結果ページへ遷移する
    if (!isChoosing && currentWordIndex >= quizWords.length - 1) {
      setTimeout(() => {
        saveResultsToServer();
        console.log("saving results:", results);
        router.push({
          pathname: "/results",
          query: { results: JSON.stringify(results), score: score },
        });
      }, 10);
    }
  }, [results]); // results が変わるたびにこの useEffect がトリガーされる

  const handleChoice = (choice: string) => {
    if (!isChoosing) return;

    setSelectedChoice(choice);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const isCorrect = currentWord?.meaning === choice;
    const newResult: Result = {
      question: currentWord!.word,
      correctAnswer: currentWord!.meaning,
      isCorrect: isCorrect,
      responseTime: responseTime,
      extra: currentWord?.extra || [],
    };

    setResults((prevResults) => [...prevResults, newResult]);
    setIsChoosing(false);

    if (isCorrect) {
      setScore(score + 1);
    }

    const nextIndex = currentWordIndex + 1;
    if (nextIndex < quizWords.length) {
      setTimeout(() => {
        pickWord(nextIndex);
      }, 10);
    }
  };

  function getChoiceClass(choice: string) {
    if (!selectedChoice) return styles.choice;
    if (choice === currentWord?.meaning)
      return `${styles.choice} ${styles.correct}`;
    if (choice === selectedChoice)
      return `${styles.choice} ${styles.incorrect}`;
    return styles.choice;
  }

  const saveResultsToServer = async () => {
    try {
      console.log("saving...");
      const response = await fetch("/api/testsaveResults", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ results: results }),
      });
      if (response.ok) {
        console.log("Results saved to server.");
      } else {
        console.error("Failed to save results.");
      }
    } catch (error) {
      console.error("Error saving results to server:", error);
    }
  };

  return (
    <div className={styles.container}>
      {countdown === 0 && (
        <>
          <h1>{`ターゲット1900 ${start}～${end}`}</h1>
          <p>{`${currentWordIndex + 1}/${quizWords.length} 問目`}</p>
          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${timerProgress}%` }}
            />
          </div>
          {currentWord && (
            <>
              <p>{`${currentWord.word}`}</p>
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
            </>
          )}
        </>
      )}
      {countdown > 0 && (
        <div className={styles.fullScreen}>
          <div className={styles.countdownText}>
            {mode === "fillBrackets"
              ? " ( ) に入る単語を選んで！"
              : mode === "EtoJ"
              ? " 日本語の意味を選んで！"
              : ""}
          </div>
          <div className={styles.countdownNumber}>{countdown}</div>
        </div>
      )}
    </div>
  );
}
