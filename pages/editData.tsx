import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { folderDisplayNameMap } from "../utils/folderDisplayNameMap";
import styles from "../styles/index.module.css";

interface QuizResult {
  id: number;
  name: string;
  book: string;
  mode: string;
  start: number;
  end: number;
  updatedAt: Date;
}

const QuizResultsList: React.FC = () => {
  const router = useRouter();
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editBook, setEditBook] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const password = prompt(
      "このページを表示するにはパスワードを入力してください。"
    );
    if (password === "0416") {
      setIsAuthenticated(true);
      fetchQuizResults();
    } else {
      alert("パスワードが間違っています。");
    }
  }, []);

  // useEffect(() => {
  //   fetchQuizResults();
  // }, []);

  const fetchQuizResults = async () => {
    try {
      const response = await fetch("/api/quizResults");
      if (response.ok) {
        const data = await response.json();
        setQuizResults(data);
      } else {
        console.error("Failed to fetch quiz results");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const deleteQuizResult = async (id: number) => {
    try {
      const response = await fetch(`/api/quizResult/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchQuizResults(); // データを再読込
      } else {
        console.error("Failed to delete quiz result");
      }
    } catch (error) {
      console.error("Error deleting quiz result:", error);
    }
  };

  const startEdit = (result: QuizResult) => {
    setEditId(result.id);
    setEditName(result.name);
    setEditBook(result.book);
  };

  const submitEdit = async () => {
    try {
      const response = await fetch(`/api/quizResult/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, book: editBook }),
      });
      if (response.ok) {
        setEditId(null);
        fetchQuizResults(); // データを再読込
      } else {
        console.error("Failed to edit quiz result");
      }
    } catch (error) {
      console.error("Error editing quiz result:", error);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  if (!isAuthenticated) {
    return <div>認証が必要です。</div>;
  }

  return (
    <div>
      <h1>ゴースト一覧</h1>
      <button onClick={() => router.push("/")}>タイトルに戻る</button>
      <div className={styles.selectBox}>
        {quizResults.map((result) => (
          <div key={result.id}>
            {editId === result.id ? (
              <div>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <input
                  value={editBook}
                  onChange={(e) => setEditBook(e.target.value)}
                />
                <button onClick={submitEdit}>保存</button>
                <button onClick={cancelEdit}>キャンセル</button>
              </div>
            ) : (
              <div>
                <span>
                  {result.name} -{" "}
                  {folderDisplayNameMap[result.book] || result.book}
                </span>
                <button onClick={() => startEdit(result)}>編集</button>
                <button onClick={() => deleteQuizResult(result.id)}>
                  削除
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizResultsList;
