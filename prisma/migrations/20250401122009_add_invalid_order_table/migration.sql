-- CreateTable
CREATE TABLE "core_invalid_order" (
    "id" TEXT NOT NULL,
    "rawData" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "core_invalid_order_pkey" PRIMARY KEY ("id")
);
