import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), "public", "vocabulary.csv");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ message: "ファイルを読み込めませんでした。" });
      return;
    }
    let words = data
      .split("\n")
      .slice(0, 10)
      .map((line) => {
        const [word, meaning] = line.split(",");
        return { word, meaning };
      });
    // 問題をランダムにシャッフル
    words = words.sort(() => Math.random() - 0.5);
    res.status(200).json(words);
  });
}
