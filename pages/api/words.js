import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), "public", "vocabulary.csv");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ message: "ファイルを読み込めませんでした。" });
      return;
    }
    const words = data.split("\n").map((line) => {
      const [word, meaning] = line.split(",");
      return { word, meaning };
    });
    res.status(200).json(words);
  });
}
