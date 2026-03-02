import { Button, Field, Group, Input, Link, PinInput, Stack, Text } from "@chakra-ui/react";
import type { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

import type { HTTPOkResponse, SessionData, VerificationData } from "@/@types";
import { PasswordInput } from "@components/ui/password-input";
import { handleRequestError } from "@/utils/handlers";
import { axiosClient, includeToken, toast } from "@/utils";
import { type SchemaType, schema } from "./schema";
import { useSession } from "@/components/accessories/session";


const Form: React.FC<{ setVerificationData: (data: VerificationData) => void }> = ({ setVerificationData }) => {
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SchemaType>({ resolver: zodResolver(schema) });

	const onSubmit = async (formData: SchemaType) => {
		try {
			const { data } = await axiosClient.post<HTTPOkResponse<VerificationData>>("/auth/register", formData);
			toast.success("Registration Successful! You may now check your email for a verification code.");
			setVerificationData(data.data);
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


export const VerificationForm: React.FC<VerificationData> = (verificationData) => {
	const seconds = 120;
	const [{ verifyToken, resendToken }, setVerificationData] = useState<VerificationData>(verificationData);
	const navigate = useNavigate();
	const { updateSession } = useSession();
	const [timer, setTimer] = useState<number>(seconds);
	const [code, setCode] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);

	const verify = async (code: string) => {
		try {
			setIsSubmitting(true);
			const { data: { data } } = await axiosClient.post<HTTPOkResponse<SessionData>>(`/auth/verify-email`, { code }, includeToken(verifyToken));
			updateSession(data.user, data.token);
			toast.success("Verification successful! You are now logged in.");
			navigate("/profile", { replace: true });
		} catch (error) {
			const { response } = error as AxiosError;
			if (response?.status === 400) {
				setIsError(true);
				toast.error("Incorrect code! Try again.");
			}
			else
				toast.error("Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const onVerify = (details: PinInput.ValueChangeDetails) => {
		const code = details.valueAsString;
		setCode(code);
		verify(code);
	};

	const onResendCode = async () => {
		try {
			setIsSubmitting(true);
			setTimer(seconds);
			const { data } = await axiosClient.post<HTTPOkResponse<VerificationData>>(`/auth/send-email`, undefined, includeToken(resendToken));
			setVerificationData(data.data);
			toast.success("A new code has been sent!");
		} catch (_) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	useEffect(() => {
		const interval = setInterval(() => {
			setTimer((prev) => prev === 0 ? 0 : prev - 1);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

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
			onValueChange={() => setIsError(false)}
			onValueComplete={onVerify}
			>
				<Group>
					<PinInput.Control>
						<PinInput.Input key={0} index={0} autoFocus />
						{[1, 2, 3, 4, 5].map((index) => (
							<PinInput.Input key={index} index={index} />
						))}
					</PinInput.Control>
				</Group>
			</PinInput.Root>

			<Button
			disabled={code.length < 6}
			loading={isSubmitting}
			colorPalette={"blue"}
			textTransform={"uppercase"}
			onClick={() => verify(code)}
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
					onClick={onResendCode}
					>
						Resend Now
					</Link>
				)}
			</Text>
		</Stack>
	);
};

export default Form;