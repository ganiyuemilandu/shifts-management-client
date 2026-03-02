import { z } from "zod";

const preprocess = (val?: string): string | undefined => {
	const str = val && val.trim();
	return str === "" ? undefined : str;
};

export const schema = z.object({
	firstName: z.preprocess(preprocess, z.string().regex(/^[A-Za-z]+$/, "Must contain only letters").optional()),
	lastName: z.preprocess(preprocess, z.string().regex(/^[A-Za-z]+$/, "Must contain only letters").optional()),
	password: z.preprocess(preprocess, z.string().min(8, "Must be at least 8 characters long")
			.regex(/[A-Z]/, "Must contain at least 1 uppercase letter")
			.regex(/[a-z]/, "Must contain at least 1 lowercase letter")
			.regex(/[0-9]/, "Must contain at least 1 digit").optional()),
}).partial();

export type SchemaType = z.input<typeof schema>;