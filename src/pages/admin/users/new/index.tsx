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
				Create New User
			</Heading>
			<Form />
			<Flex gap={2} mt={5}>
				<Text>Want to check out all users?</Text>
				<Link to={"/admin/users"}>
					<Text as={"span"} color={"blue.400"}>Fetch Users</Text>
				</Link>
			</Flex>
		</Box>
	);
};