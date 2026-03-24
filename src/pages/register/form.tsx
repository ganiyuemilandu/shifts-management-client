import { Button, Field, Group, Input, Link, PinInput, Stack, Text } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

import type { HTTPOkResponse, SessionData } from "@/@types";
import { PasswordInput } from "@components/ui/password-input";
import { handleRequestError } from "@/utils/handlers";
import { axiosClient, includeToken, toast } from "@/utils";
import { type SchemaType, schema } from "./schema";
import { useSession } from "@/components/accessories/session";


const Form: React.FC<{ setVerificationData: (data: Record<"email" | "token", string>) => void }> = ({ setVerificationData }) => {
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SchemaType>({ resolver: zodResolver(schema) });

	const onSubmit = async (formData: SchemaType) => {
		try {
			const { data } = await axiosClient.post<HTTPOkResponse<string>>("/auth/register", formData);
			toast.success("Registration Successful! You may now check your email for a verification code.");
			setVerificationData({ email: formData.email, token: data.data });
		} catch (error) {
			handleRequestError(error);
		}							
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate>
			<Stack gap={6}>
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
					Register
				</Button>
			</Stack>
		</form>
	);
};


export const VerificationForm: React.FC<Record<"email" | "token", string>> = ({ email, token: verificationToken }) => {
	const navigate = useNavigate();
	const { updateSession } = useSession();
	const [timer, setTimer] = useState<number>(120);
	const [token, setToken] = useState<string>(verificationToken);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);
	const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
	const codeString = code.join("");

	const verifyEmail = async (codeString: string) => {
		if (codeString.length !== 6)
			return;
		try {
			setIsSubmitting(true);
			const { data: { data } } = await axiosClient.post<HTTPOkResponse<SessionData>>(
				`/email/verify`,
				{ code: codeString },
				includeToken(token)
			);
			updateSession(data.user, data.token);
			toast.success("Verification successful! You are now logged in.");
			navigate("/profile", { replace: true });
		} catch (error) {
			setIsError(true);
			handleRequestError(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const sendCode = async () => {
		try {
			setIsSubmitting(true);
			const { data } = await axiosClient.post<HTTPOkResponse<string>>(`/email/send`, { email });
			toast.success("A new code has been sent!");
			setToken(data.data);
			setCode(["", "", "", "", "", ""]);
			setIsError(false);
			setTimer(120);
		} catch (_) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	useEffect(() => {
		if (timer === 0)
			return;
		const interval = setInterval(() => setTimer(timer - 1), 1000);
		return () => clearInterval(interval);
	}, [timer]);

	return (
		<Stack gap={4}>
			<Text textStyle={"sm"} fontWeight={"medium"}>
				Enter 6-digit code
			</Text>

			<PinInput.Root
			invalid={isError}
			count={6}
			type={"numeric"}
			placeholder="○"
			value={code}
			onValueChange={(details) => {
				setIsError(false);
				setCode(details.value);
			}}
			onValueComplete={(details) => verifyEmail(details.valueAsString)}
			>
				<Group>
					<PinInput.Control>
						{code.map((_, index) => (
							<PinInput.Input key={index} index={index} />
						))}
					</PinInput.Control>
				</Group>
			</PinInput.Root>

			<Button
			disabled={codeString.length < 6}
			loading={isSubmitting}
			colorPalette={"blue"}
			textTransform={"uppercase"}
			onClick={() => verifyEmail(codeString)}
			>
				Verify
			</Button>

			<Text textStyle={"xs"} textAlign={"center"}>
				Didn't receive a code?{" "}
				{timer > 0 ? (
					<Text as={"span"} color={"fg.muted"} aria-live="polite">
						Resend in {timer}s
					</Text>
				) : (
					<Link
					color={"blue.500"}
					fontWeight={"bold"}
					onClick={sendCode}
					>
						Resend Now
					</Link>
				)}
			</Text>
		</Stack>
	);
};

export default Form;