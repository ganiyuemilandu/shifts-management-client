import { Button, Field, Input, Stack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { HTTPOkResponse } from "@/@types";
import type { UserData } from "@/@types/user";
import { useSession } from "@components/accessories/session";
import { PasswordInput } from "@components/ui/password-input";
import { handleRequestError } from "@/utils/handlers";
import { axiosClient, includeToken, toast } from "@/utils";
import { type SchemaType, schema } from "./schema";


const Form: React.FC = () => {
	const { user, token, updateSession } = useSession();

	const { register, handleSubmit, formState: { errors, isDirty, isSubmitting } } = useForm<SchemaType>({
		resolver: zodResolver(schema),
		defaultValues: {
			firstName: user!.firstName,
			lastName: user!.lastName,
			password: "",
		},
	});

	const onSubmit = async (formData: SchemaType) => {
		try {
			const { data } = await axiosClient.put<HTTPOkResponse<UserData>>("/", formData, includeToken(token!));
			updateSession(data.data);
				toast.success("Profile updated successfully!");
		} catch (error) {
			handleRequestError(error);
		}							
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate>
			<Stack gap={6}>
				<Field.Root invalid={!!errors.firstName}>
					<Field.Label htmlFor="firstName">First name</Field.Label>
					<Input
					id="firstName"
					type="text"
					placeholder="Edit your first name"
					aria-invalid={!!errors.firstName}
					{...register("firstName")}
					/>
					<Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root invalid={!!errors.lastName}>
					<Field.Label htmlFor="lastName">Last name</Field.Label>
					<Input
					id="lastName"
					type="text"
					placeholder="Edit your last name"
					aria-invalid={!!errors.lastName}
					{...register("lastName")}
					/>
					<Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root invalid={!!errors.password}>
					<Field.Label htmlFor="password">Password</Field.Label>
					<PasswordInput
					id="password"
					placeholder="Enter a new password"
					aria-invalid={!!errors.password}
					{...register("password")}
					/>
					<Field.ErrorText>{errors.password?.message}</Field.ErrorText>
				</Field.Root>

				<Button
				type="submit"
				colorPalette={"blue"}
				textTransform={"uppercase"}
				loading={isSubmitting}
				disabled={!isDirty}
				>
					Update
				</Button>
			</Stack>
		</form>
	);
};

export default Form;