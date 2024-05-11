-- CreateTable
CREATE TABLE "QuizResult" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "book" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contents" (
    "id" SERIAL NOT NULL,
    "quizResultId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "choices" TEXT[],
    "selectedChoice" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "extra" JSONB NOT NULL,

    CONSTRAINT "Contents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contents" ADD CONSTRAINT "Contents_quizResultId_fkey" FOREIGN KEY ("quizResultId") REFERENCES "QuizResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
