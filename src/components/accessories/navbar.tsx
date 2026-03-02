import { Box, Flex, Link, Menu, Spacer, Portal, Button, Image } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import { logoutUser } from "@/utils/handlers";
import { useSession } from "./session";


const Navbar: React.FC = () => {
	const { user, updateSession } = useSession();

	const onLogout = async () => {
		if (await logoutUser())
			updateSession(null);
	};

		return (
		<Box as={"nav"} bg={"blue.500"}>
			<Flex
			minWidth={"max-content"}
			alignItems={"center"}
			px={{ base: "16px", md: "24px" }}
			py={"12px"}
			maxW={"7xl"}
			m={"0 auto"}
			>
				{/* Logo and Home Link Container */}
				<Flex alignItems={"center"} gap={{ base: 2, md: 4 }}>
					<RouterLink to={"/"}>
						<Image
						src="/assets/logo.jpeg"
						alt="Shifts Manager Logo"
						height={{ base: "30px", md: "45px" }}
						objectFit={"contain"}
						_hover={{ opacity: 0.8, transform: "scale(1.05)" }}
						transition={"all 0.2s"}
						/>
					</RouterLink>
					<Box p={2}>
						<Link
						asChild
						fontWeight={"bold"}
						color={"white"}
						fontSize={{ base: "md", md: "lg" }}
						display={{ base: "none", md: "block" }}
						>
							<RouterLink to={"/"}>Home</RouterLink>
						</Link>
					</Box>
				</Flex>
				<Spacer/>

				<Box>
					{user? (
						<Menu.Root>
							<Menu.Trigger asChild>
								<Button variant={"subtle"}>
									{user.firstName} {user.lastName} ({user.role})
								</Button>
							</Menu.Trigger>
							<Portal>
								<Menu.Positioner>
									<Menu.Content>
										<Menu.Item value="profile" asChild>
											<RouterLink to={"/profile"}>Profile</RouterLink>
										</Menu.Item>
										{user.role === "admin" && (
											<>
												<Menu.Item value="users" asChild>
													<RouterLink to={"/admin/users"}>Users</RouterLink>
												</Menu.Item>
												<Menu.Item value="shifts" asChild>
													<RouterLink to={"/admin/shifts"}>Shifts</RouterLink>
												</Menu.Item>
											</>
										)}
										<Menu.Item value="logout" onClick={onLogout}>Log out</Menu.Item>
									</Menu.Content>
								</Menu.Positioner>
							</Portal>
						</Menu.Root>
					): (
						<Link asChild>
							<RouterLink to={"/login"}>Log in</RouterLink>
						</Link>
					)}
				</Box>
			</Flex>
		</Box>
	);
};

export default Navbar;