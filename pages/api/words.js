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

    // 全ての行を単語と意味に分けて返す。
    let words = lines.map((line) => {
      const [word, meaning] = line.split("\t"); // タブで分割
      return { word, meaning };
    });

    res.status(200).json(words);
  });
}
