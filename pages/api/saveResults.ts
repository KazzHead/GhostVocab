// pages/api/saveResults.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("saveResults.handler起動");
  if (req.method === "POST") {
    const { results } = req.body;
    // // const headers =
    //   "Question,Correct Answer,Is Correct,Timestamp Start,Timestamp End,Response Time\n";
    const csvContent = results
      .map(
        (result: any) =>
          `${result.name},${result.question},${result.choices},${result.selectedChoice},${result.isCorrect},${result.responseTime},${result.extra}`
      )
      .join("\n");
    if (!fs.existsSync(path.join(process.cwd(), "data"))) {
      fs.mkdirSync(path.join(process.cwd(), "data"));
    }

    const filePath = path.join(process.cwd(), "data", "quiz_results.csv");
    fs.writeFileSync(filePath, csvContent);

    res.status(200).json({ message: "Results saved successfully" });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
