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
  // userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export default function Home() {
  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  // const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isChoosing, setIsChoosing] = useState(true);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchWords() {
      const response = await fetch("/api/words");
      const data: Word[] = await response.json();
      console.log("Words fetched:", data);
      setWords(data);
      console.log("Words fetched:", words);
      pickWord(0);
    }
    fetchWords();
  }, []);

  useEffect(() => {
    // if (currentWordIndex >= words.length && words.length > 0) {
    //   pickWord(0);
    // }
    pickWord(0);
  }, [words]);

  function pickWord(index: number) {
    console.log(`pickWord called with index: ${index}`);
    console.log(`words.length: ${words.length}`);

    if (index >= words.length) {
      console.log("No more words to display.");
      // router.push({
      //   pathname: "/results",
      //   query: { results: JSON.stringify(results), score: score },
      // });
      return;
    }
    const word = words[index];
    setCurrentWord(word);
    setCurrentWordIndex(index);

    const fakeChoices: string[] = [];
    while (fakeChoices.length < 3) {
      const option = words[Math.floor(Math.random() * words.length)];
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
    // const currentWord = words[currentQuestionIndex];
    // const isCorrect = currentWord.meaning === choice;
    // const newResult = {
    //   question: currentWord.word,
    //   userAnswer: choice,
    //   correctAnswer: currentWord.meaning,
    //   isCorrect,
    // };
    // setResults([...results, newResult]);

    if (!isChoosing) return; // 選択が有効な場合のみ処理を実行
    setSelectedChoice(choice);
    setIsChoosing(false); // 選択後は他の選択肢をクリックできないようにする
    // if (choice === currentWord?.meaning) {
    //   setScore(score + 1); // 正解の場合はスコアをインクリメント
    // }
    const isCorrect = currentWord?.meaning === choice;
    setResults((prevResults) => [
      ...prevResults,
      {
        question: currentWord?.word || "",
        correctAnswer: currentWord?.meaning || "",
        isCorrect,
      },
    ]);

    if (isCorrect) {
      setScore(score + 1); // 正解の場合はスコアをインクリメント
    }

    const nextIndex = currentWordIndex + 1;
    if (nextIndex < words.length) {
      setTimeout(() => {
        pickWord(nextIndex);
      }, 2000);
    } else {
      setTimeout(() => {
        router.push({
          pathname: "/results",
          query: { results: JSON.stringify(results), score: score },
        });
      }, 2000);
    }
    // const nextIndex = currentWordIndex + 1;
    // setTimeout(() => {
    //   if (nextIndex < words.length) {
    //     pickWord(nextIndex);
    //   } else {
    //     router.push(`/results?score=${score}`);
    //   }
    // }, 2000);
  };

  function getChoiceClass(choice: string) {
    if (!selectedChoice) return styles.choice;
    if (choice === currentWord?.meaning)
      return `${styles.choice} ${styles.correct}`;
    if (choice === selectedChoice)
      return `${styles.choice} ${styles.incorrect}`;
    return styles.choice;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.container}>英単語クイズ</h1>
      <p>{`${currentWordIndex + 1}/${words.length} 問目`}</p>
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
    </div>
  );
}
