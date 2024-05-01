import { useState, useEffect } from "react";
//import styles from "C:/Users/onlyb/quiz-app/styles/index.module.css";
import styles from "../styles/Quiz.module.css";
import { useRouter } from "next/router";

interface Word {
  word: string;
  meaning: string;
}

interface Result {
  question: string;
  correctAnswer: string;
  isCorrect: boolean;
  // timestampStart: number;
  // timestampEnd: number;
  responseTime: number;
}

export default function Home() {
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isChoosing, setIsChoosing] = useState(true);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const router = useRouter();
  const { start, end } = router.query;
  const [startTime, setStartTime] = useState<number>(0);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
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
    if (countdown === 0 && start && end) {
      fetch(`/api/words?start=${start}&end=${end}`)
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
  }, [countdown, router.query]);

  useEffect(() => {
    pickWord(0);
  }, [quizWords]);

  function pickWord(index: number) {
    if (index >= quizWords.length || quizWords.length === 0) {
      console.log("No more words or word list is empty.");
      return;
    }

    console.log(`pickWord called with index: ${index}`);
    // console.log(`words.length: ${words.length}`);

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

    console.log(`isChoosing set to true after picking word: ${word.word}`);
  }

  const handleChoice = (choice: string) => {
    if (!isChoosing) return; // 選択が有効な場合のみ処理を実行
    setSelectedChoice(choice);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const isCorrect = currentWord?.meaning === choice;
    const newResult: Result = {
      question: currentWord!.word,
      correctAnswer: currentWord!.meaning,
      isCorrect: isCorrect,
      // timestampStart: startTime,
      // timestampEnd: endTime,
      responseTime: responseTime,
    };
    setResults([...results, newResult]);
    console.log("result:", results);

    setIsChoosing(false);

    if (isCorrect) {
      setScore(score + 1); // 正解の場合はスコアをインクリメント
    }

    const nextIndex = currentWordIndex + 1;
    if (nextIndex < quizWords.length) {
      setTimeout(() => {
        pickWord(nextIndex);
      }, 2000);
    } else {
      setTimeout(() => {
        saveResultsToServer();
        router.push({
          pathname: "/results",
          query: { results: JSON.stringify(results), score: score },
        });
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

  const saveResultsToServer = async () => {
    try {
      const response = await fetch("/api/saveResults", {
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
      <h1>{`ターゲット1900 ${start}～${end}`}</h1>
      <p className={styles.container}>{`${currentWordIndex + 1}/${
        quizWords.length
      } 問目`}</p>
      {countdown > 0 && (
        <div className={styles.fullScreen}>
          <div className={styles.countdownText}> ( ) に入る単語を選んで</div>
          <div className={styles.countdownNumber}>{countdown}</div>
        </div>
      )}
      {countdown === 0 && currentWord && (
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
    </div>
  );
}
