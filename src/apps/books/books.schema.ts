import {z} from "zod";

export const booksSchema = z.object({
  title: z.string().min(1, {message: "Title is required"}),
})