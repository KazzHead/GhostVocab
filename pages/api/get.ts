import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  _request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const data = await prisma.quizResult.findMany();

    return response.status(200).json({ data });
  } catch (error) {
    return response.status(500).json({ error });
  }
}
