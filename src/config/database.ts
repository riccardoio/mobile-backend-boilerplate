import { DataSource } from "typeorm"
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { User } from "@/entities/User"


const isProd = process.env.NODE_ENV === 'production';

const isTsRuntime = __filename.endsWith(".ts");

const getDbConfig = () => {
  if (isProd && process.env.DATABASE_URL) {
    return {
      url: process.env.DATABASE_URL,
    };
  }
  
  return {
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    username: process.env.POSTGRES_USER || "mobile",
    password: process.env.POSTGRES_PASSWORD || "mobile",
    database: process.env.POSTGRES_DB || "mobile",
  };
};

// Note: Use globs for entities so both ts-node and compiled js work
const entityGlobs = isTsRuntime ? ["src/entities/**/*.ts"] : ["dist/entities/**/*.js"]

export const Database = new DataSource({
  logging: ["error", "migration"],
  type: "postgres",
  ...getDbConfig(),
  // Always prefer migrations over sync to avoid drift
  synchronize: false,
  migrationsRun: true,
  entities: entityGlobs,
  subscribers: [],
  migrations: isTsRuntime ? ["src/migrations/**/*.ts"] : ["dist/migrations/**/*.js"],
  namingStrategy: new SnakeNamingStrategy(),
});

// Optional: minimal debug
// console.log('[Database] Entities globs:', Database.options.entities)