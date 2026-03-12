import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs/promises";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "docker-manager.db");

let dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null =
  null;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      // Ensure data directory exists
      await fs.mkdir(DB_DIR, { recursive: true });

      const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database,
      });

      // Create users table
      await db.exec(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL
                )
            `);

      // Output info
      console.log("Database initialized at", DB_PATH);

      // Check if any user exists, if not, create default admin:admin
      const userCount = await db.get("SELECT COUNT(*) as count FROM users");
      if (userCount && userCount.count === 0) {
        const defaultUsername = "admin";
        const defaultPassword = "admin";
        const hash = await bcrypt.hash(defaultPassword, 10);

        await db.run(
          "INSERT INTO users (username, password_hash) VALUES (?, ?)",
          [defaultUsername, hash],
        );
        console.log("Default admin user created.");
      }

      return db;
    })();
  }

  return dbPromise;
}
