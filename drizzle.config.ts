import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: process.env.PRIVATE_TURSO_DATABASE_URL!,
    authToken: process.env.PRIVATE_TURSO_AUTH_TOKEN!,
  },
});
