-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);
