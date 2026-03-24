import { Button, Field, Input, Stack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import type { HTTPOkResponse, SessionData } from "@/@types";
import { useSession } from "@components/accessories/session";
import { PasswordInput } from "@components/ui/password-input";
import { handleRequestError } from "@/utils/handlers";
import { axiosClient, toast } from "@/utils";
import { type SchemaType, schema } from "./schema";


const Form: React.FC = () => {
	const { updateSession } = useSession();
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SchemaType>({ resolver: zodResolver(schema) });
	const location = useLocation();
	const navigate = useNavigate();

	const onSubmit = async (formData: SchemaType) => {
		try {
			const { data } = await axiosClient.post<HTTPOkResponse<SessionData>>("/auth/login", formData);
				toast.success("Success! You are now logged in");
				const { user, token } = data.data;
				updateSession(user, token);
				const from = location.state?.from?.pathname || "/";
				navigate(from, { replace: true });
		} catch (error) {
			handleRequestError(error);
		}							
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate>
			<Stack gap={6}>
				<Field.Root invalid={!!errors.email}>
					<Field.Label htmlFor="email">Email</Field.Label>
					<Input required
					id="email"
					type="email"
					placeholder="Enter your email"
					aria-invalid={!!errors.email}
					{...register("email")}
					/>
					<Field.ErrorText>{errors.email?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root invalid={!!errors.password}>
					<Field.Label htmlFor="password">Password</Field.Label>
					<PasswordInput required
					id="password"
					placeholder="Enter your password"
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
					Log in
				</Button>
			</Stack>
		</form>
	);
};

export default Form;