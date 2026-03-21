import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import logger from "@/lib/logger";

const TEMPLATES_FILE = path.join(process.cwd(), "data", "templates.json");

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // 1. Check if the file exists
        try {
            await fs.access(TEMPLATES_FILE);
        } catch {
            // If the file does not exist, we simply return an empty array
            logger.warn("templates.json was not found. Sending an empty list.");
            return NextResponse.json([]);
        }

        // 2. Read and parse the file
        const fileContents = await fs.readFile(TEMPLATES_FILE, "utf-8");
        const templates = JSON.parse(fileContents);

        // 3. Send templates to the frontend
        return NextResponse.json(templates);

    } catch (error: any) {
        logger.error("Error loading templates from JSON file:", error.message);
        return NextResponse.json(
            { error: "Error loading templates" },
            { status: 500 }
        );
    }
}