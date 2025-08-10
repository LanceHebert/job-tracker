-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "url" TEXT,
    "source" TEXT,
    "salary" TEXT,
    "employmentType" TEXT,
    "remoteType" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SAVED',
    "position" INTEGER NOT NULL DEFAULT 0,
    "appliedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Job" ("appliedAt", "company", "createdAt", "description", "employmentType", "id", "location", "notes", "remoteType", "salary", "source", "status", "title", "updatedAt", "url") SELECT "appliedAt", "company", "createdAt", "description", "employmentType", "id", "location", "notes", "remoteType", "salary", "source", "status", "title", "updatedAt", "url" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE INDEX "Job_status_position_idx" ON "Job"("status", "position");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
