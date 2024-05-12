import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();
console.log("testsaveResults起動");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("req.body:", req.body);
    const { result } = req.body;
    console.log("testsaveResults.handler起動");
    console.log("result:", result);

    for (const item of result) {
      const quizResult = await prisma.quizResult.create({
        data: {
          name: item.name,
          book: item.book,
          mode: item.mode,
          start: item.start,
          end: item.end,
          contents: {
            create: item.contents.map((content: any) => ({
              question: content.question,
              selectedChoice: content.selectedChoice,
              isCorrect: content.isCorrect,
              responseTime: content.responseTime,
              correctAnswer: content.correctAnswer,
              extra: content.extra,
              choices: content.choices,
            })),
          },
        },
      });
      console.log(
        "QuizResult and related data created successfully",
        quizResult
      );
    }
    res.status(200).json({ message: "Results saved successfully." });
  } catch (error: unknown) {
    // unknown型として明示
    if (error instanceof Error) {
      // Errorインスタンスであるかチェック
      console.error("エラー発生:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    } else {
      // エラーがErrorインスタンスでない場合のハンドリング
      console.error("非Error型のエラー発生:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: "Unknown error" });
    }
  }
}
