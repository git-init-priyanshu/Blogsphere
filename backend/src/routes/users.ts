import { Hono } from "hono";
import { sign } from "hono/jwt";
import { getPrismaInstance } from "..";
import { signupInput, signinInput } from "@priyanshu_bartwal/blogsphere-common";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const prisma = getPrismaInstance(c.env.DATABASE_URL);

  const body = await c.req.json();
  const { success } = signupInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ error: "Invalid input" });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });
  if (existingUser) {
    c.status(411);
    return c.json({ error: "Email already exists" });
  }

  try {
    // Creating the user
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      },
    });
    console.log(user);

    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ token });
  } catch (error) {
    console.log(error);
    c.status(411);
    return c.text("Invalid");
  }
});

userRouter.post("/signin", async (c) => {
  const prisma = getPrismaInstance(c.env.DATABASE_URL);

  const body = await c.req.json();
  const { success } = signinInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ error: "Invalid input" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: body.email, password: body.password },
    });
    if (!user) {
      c.status(403);
      return c.json({ error: "User does not exists" });
    }

    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ token });
  } catch (error) {
    console.log(error);
    c.status(411);
    return c.text("Invalid");
  }
});
