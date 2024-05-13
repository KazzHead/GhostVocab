// pages/api/quizResult/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const quizResultId = parseInt(req.query.id as string);

  try {
    const quizResult = await prisma.quizResult.findUnique({
      where: { id: quizResultId },
      include: {
        contents: true,
      },
    });

    if (!quizResult) {
      return res.status(404).json({ message: "Quiz result not found" });
    }

    res.status(200).json(quizResult);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
}
