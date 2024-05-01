import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { start, end } = req.query;
  const filePath = path.join(process.cwd(), "public", "vocabulary.csv");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ message: "ファイルを読み込めませんでした。" });
      return;
    }
    let lines = data.split("\n").slice(Number(start) - 1, Number(end));

    // lines からランダムに10個の項目を選択
    let chosenLines = [];
    for (let i = 0; i < 10 && lines.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * lines.length);
      chosenLines.push(lines.splice(randomIndex, 1)[0]); // lines から削除しながら chosenLines に追加
    }

    let words = chosenLines.map((line) => {
      const [word, meaning] = line.split("	");
      return { word, meaning };
    });

    res.status(200).json(words);
  });
}
