import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("testsaveResults.handler起動");

  try {
    const data = await prisma.quizResult.create({
      data: {
        book: "kinhure",
        mode: "EtoJ",
        start: 1, // 仮の値
        end: 2, // 仮の値
        question: "What is the capital of France?", // 仮の質問
        correctAnswer: "Paris", // 仮の正解
        isCorrect: true, // 仮の結果
        responseTime: 30, // 仮の応答時間
        extra: {}, // 必要に応じて追加情報をJson形式で
        user: "Aoi", // 適切なユーザーID
      },
    });

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error });
  }

  // if (req.method === "POST") {
  //   const { results } = req.body;
  //   try {
  //     await prisma.quizResult.createMany({
  //       data: results.map((result: any) => ({
  //         ...result,
  //         userId: "777", // ユーザーIDを適切に設定する必要があります
  //       })),
  //     });
  //     res.status(200).json({ message: "Results saved successfully." });
  //   } catch (error) {
  //     res.status(500).json({ message: "Failed to save results.", error });
  //   }
  // } else {
  //   res.setHeader("Allow", ["POST"]);
  //   res.status(405).end(`Method ${req.method} Not Allowed`);
  // }
}
