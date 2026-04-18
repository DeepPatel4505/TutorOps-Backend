/*
  Warnings:

  - A unique constraint covering the columns `[classId,studentId]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Attempt_studentId_idx" ON "Attempt"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_classId_studentId_key" ON "Enrollment"("classId", "studentId");

-- CreateIndex
CREATE INDEX "ProblemInstance_assignmentId_idx" ON "ProblemInstance"("assignmentId");
