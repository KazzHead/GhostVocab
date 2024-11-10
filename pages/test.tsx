import { useState, useEffect, useRef } from "react";
//import styles from "C:/Users/onlyb/quiz-app/styles/index.module.css";
import styles from "../styles/Quiz.module.css";
import { useRouter } from "next/router";
import { folderDisplayNameMap } from "../utils/folderDisplayNameMap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeUp, faVolumeMute } from "@fortawesome/free-solid-svg-icons";

interface Word {
  word: string;
  meaning: string;
  extra: string[];
}

interface Item {
  name: string;
}

interface ApiResponse {
  name: string;
}

interface result {
  name: string;
  book: string;
  mode: string;
  start: number;
  end: number;
  rank: string;
  contents: content[];
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
  const [inputName, setInputName] = useState("");
  const [selectedName, setSelectedName] = useState("");

  const [userList, setUserList] = useState<string[]>([]);
  const [warning, setWarning] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [username, setUsername] = useState(""); // ユーザー名を保存するための状態
  const [hasStarted, setHasStarted] = useState(false); // クイズが開始されたかの状態
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
  const [isSoundOn, setisSoundOn] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const displayBookName = folderDisplayNameMap[book];

  const [activeTab, setActiveTab] = useState("registered"); // 'new' または 'registered'

  let synth: SpeechSynthesis | null = null;
  if (typeof window !== "undefined") {
    synth = window.speechSynthesis;
  }
  useEffect(() => {
    console.log("activeTab changed:", activeTab);
  }, [activeTab]);
  useEffect(() => {
    console.log("----start-----");
  }, [startTime]);
  useEffect(() => {
    console.log("result changed:", result);
  }, [result]);
  useEffect(() => {
    console.log("content changed:", content);
  }, [content]);

  function handleInputChange(e: any) {
    const name = e.target.value;
    setUsername(name);
    setInputName(name); // 新規登録用のステートも更新
  }

  function handleSelectChange(e: any) {
    const name = e.target.value;
    setUsername(name);
    setSelectedName(name); // 既に登録されている人用のステートも更新
  }

  useEffect(() => {
    // APIからユーザリストを取得する
    fetch("/api/quizResults")
      .then((response) => response.json())
      .then((data: ApiResponse[]) => {
        const users = data.map((item: { name: string }) => item.name); // itemの型を明示
        setUserList([...new Set(users)]); // Setを使用して重複を削除
        setIsLoading(false);
      })
      .catch((error) => console.error("Error fetching user data:", error));
  }, []);

  useEffect(() => {
    setIsLoading(true); // データの取得を開始
    fetch("/api/quizResults")
      .then((response) => response.json())
      .then((data: ApiResponse[]) => {
        const users = data.map((item: { name: string }) => item.name); // itemの型を明示
        setUserList([...new Set(users)]); // Setを使用して重複を削除
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setIsLoading(false); // エラーが発生した場合もローディングを終了
      });
  }, []);

  const handleStartQuiz = () => {
    if (!username) {
      setWarning("名前を入力してください。");
    } else if (userList.includes(inputName) && activeTab == "new") {
      setWarning("選択した名前は既に存在します。別の名前を入力してください。");
    } else {
      setWarning("");
      console.log("Starting quiz for:", username);
      setHasStarted(true);
    }
  };

  useEffect(() => {
    // クイズのカウントダウンを管理
    if (hasStarted && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [hasStarted, countdown]);

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
    if (countdown == 0) {
      pickWord(0);
    }
  }, [countdown]);

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
      const rank = calculateRank(score, content);
      const newResult: result = {
        name: username,
        book: book,
        mode: mode,
        start: parseInt(start, 10),
        end: parseInt(end, 10),
        contents: content,
        rank: rank,
      };
      setResult((prevResult) => [...prevResult, newResult]);
    }
  }, [content]);

  useEffect(() => {
    if (!isChoosing && currentWordIndex >= quizWords.length - 1) {
      setTimeout(() => {
        saveResultToServer();
        console.log("saving result:", result);
        router.push({
          pathname: "/testresults",
          query: {
            book: book,
            mode: mode,
            start: start,
            end: end,
            score: score,
            content: JSON.stringify(content),
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

    // スコアが10の場合、responseTimeを確認
    const fastResponses = results.filter((c) => c.responseTime < 5000).length;
    if (fastResponses === 10) return "SS";
    if (fastResponses >= 5) return "S";
    return "A"; // デフォルトでAを返す
  };

  function handleMuteChange(event: React.ChangeEvent<HTMLInputElement>) {
    setisSoundOn(event.target.checked);
  }

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

    if (currentWord && isSoundOn && synth) {
      const utterThis = new SpeechSynthesisUtterance(currentWord.word);

      var voices = synth.getVoices();

      const targetVoice = voices.find(
        (voice) => voice.name === "Karen" || voice.name === "Google US English"
      );
      if (targetVoice) {
        utterThis.voice = targetVoice;
        console.log(
          `Using specified voice: ${targetVoice.name} (${targetVoice.lang})`
        );
      } else {
        console.warn(
          "指定された英語の音声が見つかりませんでした。デフォルトの音声を使用します。"
        );
      }
      utterThis.lang = "en-US";
      synth.speak(utterThis);
    }

    const nextIndex = currentWordIndex + 1;
    if (nextIndex < quizWords.length) {
      setTimeout(() => {
        pickWord(nextIndex);
      }, 2000);
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
          {mode === "EtoJ" && (
            <div className={styles.soundBox}>
              <FontAwesomeIcon
                icon={isSoundOn ? faVolumeUp : faVolumeMute}
                size="2x"
              />
              <label className={styles.toggleButton}>
                <input
                  type="checkbox"
                  checked={isSoundOn}
                  onChange={handleMuteChange}
                />
              </label>
            </div>
          )}
          <h1>{`${displayBookName} ${start}～${end}`}</h1>
          <p>{`${currentWordIndex + 1}/${quizWords.length} 問目`}</p>
          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBar}
              style={{
                width: `${timerProgress}%`,
                backgroundColor: timerProgress > 50 ? "#6246ea" : "#ff8e3c",
              }}
            />
          </div>
          {currentWord && (
            <>
              <p style={{ fontSize: "18px", fontWeight: "bold" }}>
                {`${currentWord.word}`}
              </p>
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

      {!hasStarted && (
        <div>
          <h1>{`${displayBookName} ${start}～${end}`}</h1>
          <button
            onClick={() =>
              router.push(`/chapter?state=test&book=${book}&mode=${mode}`)
            }
          >
            範囲選択に戻る
          </button>
          テストモードではあなたのゴーストが記録され，誰もがあなたと対戦することができるようになります！
          <div className={styles.tabs}>
            <button
              onClick={() => setActiveTab("registered")}
              className={
                activeTab === "registered"
                  ? styles.activeTab
                  : styles.inactiveTab
              }
            >
              テストしたことがある人
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={
                activeTab === "new" ? styles.activeTab : styles.inactiveTab
              }
            >
              はじめてテストをする人
            </button>
          </div>
          {activeTab === "new" ? (
            <div className={styles.tabcontents}>
              公開する名前
              <input
                type="text"
                placeholder="名前を入力してください"
                value={inputName}
                onChange={handleInputChange}
              />
            </div>
          ) : (
            <div className={styles.tabcontents}>
              公開する名前
              <select
                value={selectedName}
                onChange={handleSelectChange}
                onBlur={handleSelectChange}
              >
                <option value="">名前を選択してください</option>
                {userList.map((user, index) => (
                  <option key={index} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>
          )}
          {warning && <div className={styles.warning}>{warning}</div>}
          <button onClick={handleStartQuiz}>テストを始める</button>
        </div>
      )}
      {countdown > 0 && hasStarted && (
        <div className={styles.fullScreen}>
          {mode === "EtoJ" && (
            <div className={styles.soundBox}>
              <FontAwesomeIcon
                icon={isSoundOn ? faVolumeUp : faVolumeMute}
                size="2x"
              />
              <label className={styles.toggleButton}>
                <input
                  type="checkbox"
                  checked={isSoundOn}
                  onChange={handleMuteChange}
                />
              </label>
            </div>
          )}
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
