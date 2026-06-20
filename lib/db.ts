import { openDB, DBSchema, IDBPDatabase } from "idb";
import { TestResult } from "@/types";

interface PingioDB extends DBSchema {
  results: {
    key: string;
    value: TestResult;
    indexes: { "by-timestamp": number };
  };
}

let db: IDBPDatabase<PingioDB> | null = null;

async function getDB(): Promise<IDBPDatabase<PingioDB>> {
  if (db) return db;
  db = await openDB<PingioDB>("pingio-db", 1, {
    upgrade(database) {
      const store = database.createObjectStore("results", { keyPath: "id" });
      store.createIndex("by-timestamp", "timestamp");
    },
  });
  return db;
}

export async function saveResult(result: TestResult): Promise<void> {
  const database = await getDB();
  
  // Limit to last 10 records by deleting older ones first
  const results = await database.getAllFromIndex("results", "by-timestamp");
  if (results.length >= 10) {
    const deleteCount = results.length - 9;
    const toDelete = results.slice(0, deleteCount);
    await Promise.all(toDelete.map((item) => database.delete("results", item.id)));
  }

  await database.put("results", result);
}

export async function getAllResults(): Promise<TestResult[]> {
  const database = await getDB();
  const results = await database.getAllFromIndex("results", "by-timestamp");
  return results.reverse();
}

export async function deleteResult(id: string): Promise<void> {
  const database = await getDB();
  await database.delete("results", id);
}

export async function clearAllResults(): Promise<void> {
  const database = await getDB();
  await database.clear("results");
}
