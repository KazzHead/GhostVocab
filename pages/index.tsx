import { useState, useEffect } from "react";
import styles from "C:/Users/onlyb/quiz-app/styles/index.module.css";

interface Word {
  word: string;
  meaning: string;
}

export default function Home() {
  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [choices, setChoices] = useState<string[]>([]);

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
                onClick={() =>
                  alert(choice === currentWord.meaning ? "正解！" : "不正解！")
                }
              >
                {choice}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>単語をロードしています...</p>
      )}
      <button onClick={() => pickWord(words)}>次の問題</button>
    </div>
  );
}
