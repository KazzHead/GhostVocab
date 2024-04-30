import { useState, useEffect } from "react";
//import styles from "C:/Users/onlyb/quiz-app/styles/index.module.css";
import styles from "../styles/Quiz.module.css";

interface Word {
  word: string;
  meaning: string;
}

export default function Home() {
  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWords() {
      const response = await fetch("/api/words");
      const data: Word[] = await response.json();
      setWords(data);
      pickWord(data);
    }
    fetchWords();
  }, []);

  function pickWord(words: Word[]) {
    if (words.length === 0) return;
    const word = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);
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
  }

  function handleChoice(choice: string) {
    setSelectedChoice(choice);
    setTimeout(() => pickWord(words), 2000);
  }

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
      {currentWord ? (
        <>
          <p>{`「${currentWord.word}」の意味は何ですか？`}</p>
          <ul className={styles.container}>
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
      ) : (
        <p>単語をロードしています...</p>
      )}
    </div>
  );
}
