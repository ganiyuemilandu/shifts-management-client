import { Button, Field, Input, NativeSelect, Stack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useSession } from "@components/accessories/session";
import { PasswordInput } from "@components/ui/password-input";
import { handleRequestError } from "@/utils/handlers";
import { axiosClient, includeToken, toast } from "@/utils";
import { type SchemaType, schema } from "./schema";


const Form: React.FC = () => {
	const { token } = useSession();
	const config = includeToken(token!);

	const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SchemaType>({ resolver: zodResolver(schema) });

	const onSubmit = async (formData: SchemaType) => {
		try {
			await axiosClient.post("/users", formData, config);
			toast.success("User created successfully");
			reset();
		} catch (error) {
			handleRequestError(error);
		}							
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate>
			<Stack gap={4}>
				<Field.Root invalid={!!errors.firstName}>
					<Field.Label htmlFor="firstName">First name</Field.Label>
					<Input required
					id="firstName"
					type="text"
					placeholder="Enter your first name"
					aria-invalid={!!errors.firstName}
					{...register("firstName")}
					/>
					<Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root invalid={!!errors.lastName}>
					<Field.Label htmlFor="lastName">Last name</Field.Label>
					<Input required
					id="lastName"
					type="text"
					placeholder="Enter your last name"
					aria-invalid={!!errors.lastName}
					{...register("lastName")}
					/>
					<Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root invalid={!!errors.role}>
					<Field.Label htmlFor="role">Role</Field.Label>
					<NativeSelect.Root>
						<NativeSelect.Field id="role" placeholder="Select role" {...register("role")}>
							<option value="admin">Admin</option>
							<option value="staff">Staff</option>
						</NativeSelect.Field>
					</NativeSelect.Root>
					<Field.ErrorText>{errors.role?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root invalid={!!errors.email}>
					<Field.Label htmlFor="email">Email</Field.Label>
					<Input required
					id="email"
					type="email"
					placeholder="Enter a valid email address"
					aria-invalid={!!errors.email}
					{...register("email")}
					/>
					<Field.ErrorText>{errors.email?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root invalid={!!errors.password}>
					<Field.Label htmlFor="password">Password</Field.Label>
					<PasswordInput required
					id="password"
					placeholder="Enter a strong password"
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
				>
					Create User
				</Button>
			</Stack>
		</form>
	);
};

export default Form;