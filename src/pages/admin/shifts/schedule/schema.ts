import { z } from "zod";

export const schema = z.object({
	title: z.string().trim().nonempty("Title is required"),
	location: z.string().trim().nonempty("Location is required"),
	start: z.date("Start time must be a valid date time"),
	end: z.date("End time must be a valid date time"),
	break: z.coerce.number().min(0, "Break duration cannot be negative").catch(0),
	remark: z.string().trim().nonempty("Remark is required")
});

export type SchemaType = z.input<typeof schema>;