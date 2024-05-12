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

interface result {
  name: string; // ユーザー名
  book: string; // 書籍名
  mode: string; // クイズモード（例: "easy", "hard"）
  start: number; // 開始時間（unix timestamp）
  end: number; // 終了時間（unix timestamp）
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
  const [hasStarted, setHasStarted] = useState(true); // クイズが開始されたかの状態
  const [allWords, setAllWords] = useState<Word[]>([]); //101-200など100個の単語&意味
  const [quizWords, setQuizWords] = useState<Word[]>([]); //100個の単語から選ばれた10個の出題用単語&意味
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isChoosing, setIsChoosing] = useState(true);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<result[]>([]);
  const [content, setContent] = useState<content[]>([]);
  const [timerProgress, setTimerProgress] = useState(100); // タイマー進行状態
  const router = useRouter();
  const { book, mode, start, end } = router.query as {
    book: string;
    mode: string;
    start: string;
    end: string;
  };
  const [startTime, setStartTime] = useState<number>(0);
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const displayBookName = folderDisplayNameMap[book];

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
  // useEffect(() => {
  //   console.log("isChoosing changed");
  // }, [isChoosing]);
  // useEffect(() => {
  //   console.log("allWords changed:", allWords);
  // }, [allWords]);
  // useEffect(() => {
  //   console.log("quizWords changed:", quizWords);
  // }, [quizWords]);

  useEffect(() => {
    // クイズのカウントダウンを管理
    if (hasStarted && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [hasStarted, countdown]);

  const handleStartQuiz = () => {
    setHasStarted(true);
  };

  useEffect(() => {
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
    if (index >= quizWords.length || quizWords.length === 0) {
      return;
    }

    const word = quizWords[index];
    setCurrentWord(word);

    setCurrentWordIndex(index);
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
    if (!isChoosing && currentWordIndex >= quizWords.length - 1) {
      const newResult: result = {
        //10問以上なら
        name: "studyMode",
        book: book,
        mode: mode,
        start: parseInt(start, 10),
        end: parseInt(end, 10),
        contents: content,
      };
      setResult((prevResult) => [...prevResult, newResult]);
    }
  }, [content]);

  useEffect(() => {
    if (!isChoosing && currentWordIndex >= quizWords.length - 1) {
      setTimeout(() => {
        //10問以上なら
        console.log("saving result:", result);
        router.push({
          pathname: "/results",
          query: {
            book: book,
            start: start,
            end: end,
            score: score,
            content: JSON.stringify(content),
          },
        });
      }, 2000);
    }
  }, [result]);

  const handleChoice = (choice: string) => {
    if (!isChoosing) return;

    setSelectedChoice(choice);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const isCorrect = currentWord?.meaning === choice;

    console.log("chices:", [...choices]);
    console.log("chice:", choice);

    const newContent: content = {
      question: currentWord!.word,
      choices: [...choices],
      selectedChoice: choice,
      isCorrect: isCorrect,
      responseTime: responseTime,
      correctAnswer: currentWord!.meaning,
      extra: currentWord?.extra || {},
    };
    setContent((prevContent) => [...prevContent, newContent]);
    setIsChoosing(false);

    if (isCorrect) {
      setScore(score + 1);
    }

    const nextIndex = currentWordIndex + 1;
    if (nextIndex < quizWords.length) {
      //10問未満なら
      setTimeout(() => {
        pickWord(nextIndex);
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
    const response = await fetch("/api/testsaveResults", {
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
          <h1>{`${displayBookName} ${start}～${end}`}</h1>
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
      {countdown > 0 && hasStarted && (
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
