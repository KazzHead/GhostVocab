import fs from "fs";
import path from "path";

export default function handler(req, res) {
  console.log("handler起動");

  const { book, mode, start, end } = req.query;
  const filePath = path.join(process.cwd(), "public", book, `${mode}.csv`);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ message: "ファイルを読み込めませんでした。" });
      return;
    }
    let lines = data.split("\n").slice(Number(start) - 1, Number(end));

    // 全ての行を単語、意味、その他の情報に分けて返す。
    let words = lines.map((line) => {
      const parts = line.split("\t"); // タブで分割
      const word = parts[0];
      const meaning = parts[1];
      const extra = parts.slice(2); // 3列目以降の情報を配列として保持
      return { word, meaning, extra };
    });

    res.status(200).json(words);
  });
}
