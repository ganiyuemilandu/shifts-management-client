import { z } from "zod";


const baseSchema = z.string().trim().nonempty("This field is required");

export const schema = z.object({
	email: baseSchema.email("Invalid email address"),
	password: baseSchema.min(8, "Invalid password").regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/)
});

export type SchemaType = z.infer<typeof schema>;