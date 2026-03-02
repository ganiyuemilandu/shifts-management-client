import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import Form from "./form";


export const Component: React.FC = () => {
	return (
		<Box p={3} maxW={"lg"} mx={"auto"}>
			<Heading
			as={"h1"}
			textAlign={"center"}
			fontSize={"3xl"}
			fontWeight={"semibold"}
			my={7}
			>
				Enter Your Credentials
			</Heading>
			<Form />
			<Flex gap={2} mt={5}>
				<Text>Don't have an account?</Text>
				<Link to={"/register"}>
					<Text as={"span"} color={"blue.400"}>Register</Text>
				</Link>
			</Flex>
		</Box>
	);
};