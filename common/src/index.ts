import { z } from "zod";

export const signupInput = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: "Minimum 6 characters are required" }),
  name: z.string().optional(),
});
export const signinInput = z.object({
  email: z.string().email(),
  password: z.string(),
});
export const createBlogInput = z.object({
  title: z.string(),
  content: z.string(),
});
export const updateBlogInput = z.object({
  title: z.string(),
  content: z.string(),
});

export type SignupInputType = z.infer<typeof signupInput>;
export type SigninInputType = z.infer<typeof signinInput>;
export type CreateBlogInputType = z.infer<typeof createBlogInput>;
export type UpdateBlogInputType = z.infer<typeof updateBlogInput>;
