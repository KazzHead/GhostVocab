// /api/quizResults.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const quizResults = await prisma.quizResult.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.status(200).json(quizResults);
  } catch (error: unknown) {
    // `unknown` 型としてエラーをキャッチ
    if (error instanceof Error) {
      // エラーが Error 型のインスタンスかどうかをチェック
      console.error("An error occurred on /api/quizResults:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      console.error("An unexpected error occurred:", error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
}
