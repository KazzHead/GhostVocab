import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const quizResultId = parseInt(req.query.id as string);

  switch (req.method) {
    case "GET":
      return handleGET(quizResultId, res);
    case "PUT":
      return handlePUT(quizResultId, req, res);
    case "DELETE":
      return handleDELETE(quizResultId, res);
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleGET(quizResultId: number, res: NextApiResponse) {
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
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function handlePUT(
  quizResultId: number,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name, book } = req.body;
  try {
    const updatedQuizResult = await prisma.quizResult.update({
      where: { id: quizResultId },
      data: {
        name,
        book,
      },
    });

    res.status(200).json(updatedQuizResult);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update quiz result",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function handleDELETE(quizResultId: number, res: NextApiResponse) {
  console.log("quizResultId:", quizResultId);
  await prisma.contents.deleteMany({
    where: { quizResultId: quizResultId },
  });

  // QuizResultを削除
  await prisma.quizResult.delete({
    where: { id: quizResultId },
  });
}
