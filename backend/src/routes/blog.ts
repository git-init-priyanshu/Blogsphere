import { Hono } from "hono";
import { verify } from "hono/jwt";
import { getPrismaInstance } from "..";
import {
  createBlogInput,
  updateBlogInput,
} from "@priyanshu_bartwal/blogsphere-common";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  const header = c.req.header("Authorization") || "";

  try {
    const token = header.split(" ")[1];
    const user = await verify(token, c.env.JWT_SECRET);
    if (user.id) {
      c.set("userId", user.id);
      await next();
    } else {
      c.status(403);
      return c.json({ error: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    c.status(403);
    return c.text("Not logged in");
  }
});

blogRouter.post("/", async (c) => {
  const prisma = getPrismaInstance(c.env.DATABASE_URL);

  const body = await c.req.json();
  const { success } = createBlogInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ error: "Invalid input" });
  }

  const id = c.get("userId");
  try {
    const blog = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: id,
      },
    });

    return c.json({ id: blog.id });
  } catch (error) {
    c.status(411);
    return c.text("Invalid");
  }
});

blogRouter.put("/:id", async (c) => {
  const prisma = getPrismaInstance(c.env.DATABASE_URL);
  const id = c.req.param("id");

  const body = await c.req.json();
  const { success } = updateBlogInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ error: "Invalid input" });
  }

  try {
    const blog = await prisma.post.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
      },
    });

    return c.json({ id: blog.id });
  } catch (error) {
    c.status(411);
    return c.text("Invalid");
  }
});

blogRouter.get("/bulk", async (c) => {
  const prisma = getPrismaInstance(c.env.DATABASE_URL);

  try {
    const blogs = await prisma.post.findMany();

    return c.json({ blogs });
  } catch (error) {
    c.status(411);
    return c.text("Invalid");
  }
});

blogRouter.get("/:id", async (c) => {
  const prisma = getPrismaInstance(c.env.DATABASE_URL);
  const id = c.req.param("id");

  try {
    const blog = await prisma.post.findFirst({
      where: {
        id,
      },
    });

    return c.json({ blog });
  } catch (error) {
    c.status(411);
    return c.text("Invalid");
  }
});
