/*
  Warnings:

  - You are about to drop the `Grade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_student_id_fkey";

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "grade" TEXT;

-- DropTable
DROP TABLE "Grade";
