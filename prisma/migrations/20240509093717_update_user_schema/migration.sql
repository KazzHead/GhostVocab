-- CreateTable
CREATE TABLE "QuizResult" (
    "id" SERIAL NOT NULL,
    "book" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "extra" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user" TEXT NOT NULL,

    CONSTRAINT "QuizResult_pkey" PRIMARY KEY ("id")
);
