import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useState } from "react";

import type { VerificationData } from "@/@types";
import Form, { VerificationForm } from "./form";


export const Component: React.FC = () => {
	const [verificationData, setVerificationData] = useState<VerificationData | null>(null);

	return verificationData ? (
		<Box p={3} maxW={"lg"} mx={"auto"}>
			<Heading
			as={"h1"}
			textAlign={"center"}
			fontSize={"3xl"}
			fontWeight={"semibold"}
			my={7}
			>
				Verify Your Email
			</Heading>
			<VerificationForm {...verificationData} />
		</Box>
	) : (
		<Box p={3} maxW={"lg"} mx={"auto"}>
			<Heading
			as={"h1"}
			textAlign={"center"}
			fontSize={"3xl"}
			fontWeight={"semibold"}
			my={7}
			>
				Create an Account
			</Heading>
			<Form setVerificationData={setVerificationData} />
			<Flex gap={2} mt={5}>
				<Text>Have an account?</Text>
				<Link to={"/login"}>
					<Text as={"span"} color={"blue.400"}>Log in</Text>
				</Link>
			</Flex>
		</Box>
	);
};