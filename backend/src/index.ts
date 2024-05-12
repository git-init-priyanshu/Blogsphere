import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { userRouter } from "./routes/users";
import { blogRouter } from "./routes/blog";

// Todos: 
// 1. Encrypt password
// 2. Zod verification
// 3. Pagination for bulk route
const app = new Hono<{
  Bindings: {
    DATABSE_URL: string;
    JWT_SECRET: string;
  };
}>();

export const getPrismaInstance = (poolURL: string) => {
  const prisma = new PrismaClient({
    datasourceUrl: poolURL,
  }).$extends(withAccelerate());
  return prisma;
};

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

export default app;
