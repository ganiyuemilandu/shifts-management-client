import { Box, Heading } from "@chakra-ui/react";
import Form from "./form"


export const Component: React.FC = () => {
	return (
		<Box p={3} maxW={"4xl"} mx={"auto"}>
			<Heading
			as={"h1"}
			fontSize={"3xl"}
			fontWeight={"semibold"}
			textAlign={"center"}
			my={7}
			>
				Schedule a New Shift
			</Heading>
			<Form />
		</Box>
	);
};