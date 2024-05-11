import React, { useState } from "react";
import styles from "../styles/Quiz.module.css";

interface KeyboardProps {
  onKeyPress: (key: string) => void; // 'onKeyPress' の型を明確に定義
}

const Keyboard = ({ onKeyPress }: KeyboardProps) => {
  const keys = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "BACKSPACE",
  ];

  return (
    <div className={styles.keyboard}>
      {keys.map((key) => (
        <button key={key} onClick={() => onKeyPress(key)}>
          {key}
        </button>
      ))}
    </div>
  );
};

export default function Study() {
  const [input, setInput] = useState("");
  const [currentWord, setCurrentWord] = useState({
    word: "EXAMPLE",
    meaning: "例",
  }); // 仮の単語

  const handleKeyPress = (key: string) => {
    if (key === "BACKSPACE") {
      setInput(input.slice(0, -1));
    } else {
      setInput(input + key);
    }
  };

  const checkAnswer = () => {
    if (input === currentWord.word) {
      alert("Correct!");
    } else {
      alert("Incorrect, try again!");
    }
  };

  return (
    <div className={styles.container}>
      <h1>スペルチェック</h1>
      <p>単語をスペルしてください: {currentWord.word}</p>
      <div>
        <input type="text" value={input} readOnly />
        <button onClick={checkAnswer}>回答する</button>
      </div>
      <Keyboard onKeyPress={handleKeyPress} />
    </div>
  );
}
