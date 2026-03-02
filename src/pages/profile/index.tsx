import { Box, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import { DeleteUserConfirmation, LogoutConfirmation } from "@/components/accessories/dialog";
import { useSession } from "@/components/accessories/session";
import Form from "./form";


export const Component: React.FC = () => {
	const { user } = useSession();

			return (
		<Box p={3} maxW={"lg"} mx={"auto"}>
			<Heading
			as={"h1"}
			fontSize={"3xl"}
			fontWeight={"semibold"}
			textAlign={"center"}
			my={7}
			>
				Your Profile
			</Heading>
			<Form />

			<Stack gap={4} mt={5}>
				{user!.role === "admin" && (
					<Link asChild
					p={2}
					bg={"blue.500"}
					rounded={"lg"}
					textTransform={"uppercase"}
					textAlign={"center"}
					fontWeight={"semibold"}
					_hover={{ bg: "blue.400" }}
					>
						<RouterLink to={"/admin/shifts/schedule"}>Schedule New Shift</RouterLink>
					</Link>
				)}

				<Flex justify={"space-between"} mt={5}>
					<LogoutConfirmation>
						<Text as={"span"} color={"red.600"} cursor={"pointer"}>Log out</Text>
					</LogoutConfirmation>
					{user!.role === "admin" ? (
						<Link asChild color={"blue.500"} _hover={{ textDecor: "none" }}>
							<RouterLink to={"/admin/shifts"}>View Scheduled Shifts</RouterLink>
						</Link>
					) : (
						<DeleteUserConfirmation>
							<Text as={"span"} color={"red.600"} cursor={"pointer"}>Delete Account</Text>
						</DeleteUserConfirmation>
					)}
				</Flex>
			</Stack>
		</Box>
	);
};