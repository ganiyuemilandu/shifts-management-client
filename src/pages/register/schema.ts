import { z } from "zod";


const baseSchema = z.string().trim().nonempty("This field is required");

export const schema = z.object({
	firstName: baseSchema.regex(/^[A-Za-z]+$/, "Must contain only letters"),
	lastName: baseSchema.regex(/^[A-Za-z]+$/, "Must contain only letters"),
	email: baseSchema.email("Must be a valid email address"),
	password: baseSchema.min(8, "Must be at least 8 characters long")
			.regex(/[A-Z]/, "Must contain at least 1 uppercase letter")
			.regex(/[a-z]/, "Must contain at least 1 lowercase letter")
			.regex(/[0-9]/, "Must contain at least 1 digit"),
});

export type SchemaType = z.input<typeof schema>;