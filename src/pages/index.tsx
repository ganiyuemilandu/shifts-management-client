import { Box, Button, Card, Flex, Heading, Link, Skeleton, SkeletonCircle, Stack, Text } from "@chakra-ui/react";
import { formatDistanceToNow, isFuture } from "date-fns";
import { LuArrowRight, LuCalendarDays, LuClock, LuPlus, LuUsers } from "react-icons/lu";
import { Link as RouterLink } from "react-router-dom";
import { useEffect, useState } from "react";

import type { HTTPOkResponse } from "@/@types";
import type { ShiftAssignmentData } from "@/@types/assignment";
import { ShiftAssignmentView } from "@/components/accessories/assignment";
import { useSession } from "@/components/accessories/session";
import { axiosClient, includeToken, toast } from "@/utils";


export const Component: React.FC = () => {
	const [shift, setShift] = useState<ShiftAssignmentData | null>();
	const [loading, setLoading] = useState<boolean>(true);
	const { user, token } = useSession();
	const config = includeToken(token!);

	useEffect(() => {
		if (!user)
			return;
		const fetchNextAssignment = async () => {
			try {
				const { data } = await axiosClient.get<HTTPOkResponse<ShiftAssignmentData | null>>(`/assignments/staff/${user!.id}/0`, config);
				setShift(data.data);
			} catch (_) {
				toast.error("Error fetching your next assignment");
			} finally {
				setLoading(false);
			}
		};
		if (user.role === "staff")
			fetchNextAssignment();
	}, []);

	if (!user)
		return <LandingPage />;

	return (
		<Box p={{ base: 6, md: 14 }} maxW={"6xl"} mx={"auto"}>
			{user.role === "admin" ? (
				/* --- ADMIN VIEW --- */
				<Stack gap={8}>
					<Stack gap={2}>
						<Heading
						as={"h1"}
						size={"4xl"}
						fontWeight={"bold"}
						letterSpacing={"tight"}
						>
							Admin Dashboard
						</Heading>
						<Text color={"gray.600"} fontSize={"lg"}>Manage your staff's shifts and assignments</Text>
					</Stack>
					<AdminDashboardActions />
				</Stack>
			) : (
				<Flex
				direction={{ base: "column", lg: "row" }}
				gap={10}
				p={{ base: 6, md: 14 }}
				maxW={"6xl"}
				mx={"auto"}
				align={"center"}
				>
					{/* Left Side: Welcome Text */}
					<Stack flex={1} gap={5}>
						<Heading
						as="h1"
						size={"4xl"}
						fontWeight={"bold"}
						color={"gray.800"}
						letterSpacing={"tight"}
						>
							Hi, {user.firstName} 👋
						</Heading>
						<Skeleton loading={loading} height="40px" width="80%">
							<Box color={"gray.600"} fontSize={"lg"}>
								{shift ? (!isFuture(new Date(shift.start)) ? (
									<>
										You have a shift in <strong>progress</strong>.
										<Text mt={1} fontSize={"md"}>
											Please review the details and update your status.
										</Text>
									</>
								) : (
									<>
										Your next shift starts in about <strong>{formatDistanceToNow(new Date(shift.start))}</strong>.
										<Text mt={1} fontSize={"md"}>
											Please review the details and update your status.
										</Text>
									</>
								)) : (
									"You have no upcoming shifts scheduled at the moment."
								)}
							</Box>
						</Skeleton>
						<Link
						asChild
						fontWeight={"bold"}
						color={"blue.500"}
						display={"flex"}
						alignItems={"center"}
						gap={2}
						>
							<RouterLink to={"/assignments"}>
								View your full schedule <LuArrowRight />
							</RouterLink>
						</Link>
					</Stack>

					{/* Right Side: Action Card */}
					<Box flex={1} width={"full"}>
						{loading ? (
							<ShiftCardSkeleton />
						) : shift ? (
							<ShiftAssignmentView shift={shift} />
						) : (
							<EmptyShiftState />
						)}
					</Box>
				</Flex>
			)}
		</Box>
	);
};


const LandingPage: React.FC = () => {
	return (
		<Flex
		direction={"column"}
		align={"center"}
		justify={"center"}
		textAlign={"center"}
		minH={"80vh"}
		px={6}
		maxW={"4xl"}
		mx={"auto"}
		>
			<Stack align={"center"} gap={8}>
				{/* Main Headline */}
				<Heading
				as="h1"
				fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
				fontWeight={"extrabold"}
				color={"gray.800"}
				lineHeight={1.1}
				letterSpacing={"tight"}
				>
					Keep track of your{" "}
					<Text as="span" color={"blue.500"}>assigned shifts</Text>
					{" "} today
				</Heading>
				{/* Subtext */}
				<Text
				color={"gray.600"}
				fontSize={{ base: "lg", md: "xl" }}
				maxW={"2xl"}
				lineHeight={"tall"}
				>
					Our platform helps you manage your schedule with ease. 
					Accept assignments, clock in, and track your progress all in one place.
				</Text>
				{/* Primary CTA */}
				<Stack direction={{ base: "column", sm: "row" }} gap={4} pt={4}>
					<Button
					asChild
					size={"xl"}
					colorPalette={"blue"}
					px={10}
					height={14}
					borderRadius={"full"}
					fontSize={"lg"}
					>
						<RouterLink to={"/login"}>Log in</RouterLink>
					</Button>
					<Button
					asChild
					variant={"ghost"}
					size={"xl"}
					px={10}
					height={14}
					borderRadius={"full"}
					fontSize={"lg"}
					>
						<RouterLink to={"/register"}>Register</RouterLink>
					</Button>
				</Stack>
			</Stack>
		</Flex>
	);
};


const ShiftCardSkeleton: React.FC = () => {
	return (
		<Card.Root width={"full"} variant={"outline"} borderRadius={"xl"}>
			<Card.Header pb={2}>
				<Flex justify={"space-between"}>
					<Skeleton height={"24px"} width={"80px"} />
					<Skeleton height={"12px"} width={"60px"} />
				</Flex>
				<Skeleton height={"28px"} width={"60%"} mt={4} />
			</Card.Header>
			<Card.Body>
				<Stack gap={4}>
					<Flex align={"center"} gap={3}>
						<SkeletonCircle size={8} />
						<Skeleton height={"20px"} width={"140px"} />
					</Flex>
					<Flex align={"center"} gap={3}>
						<SkeletonCircle size={8} />
						<Skeleton height={"20px"} width={"180px"} />
					</Flex>
					<Box mt={2}>
						<Skeleton height={"10px"} width={"50px"} mb={2} />
						<Skeleton height={"45px"} width={"full"} borderRadius={"md"} />
					</Box>
				</Stack>
			</Card.Body>
			<Card.Footer bg={"gray.50"} borderBottomRadius={"xl"}>
				<Skeleton height={"40px"} width={"full"} />
			</Card.Footer>
		</Card.Root>
	);
};


const EmptyShiftState: React.FC = () => {
	return (
		<Card.Root
		flex={1}
		width={"full"}
		variant={"outline"}
		bg={"gray.50/50"}
		borderRadius={"xl"}
		py={10}
		>
			<Card.Body textAlign={"center"}>
				<Stack align={"center"} gap={4}>
					<Box
					p={4}
					bg={"white"}
					borderRadius={"full"}
					boxShadow={"sm"}
					color={"gray.400"}
					>
						<LuClock size={"32px"} />
					</Box>
					<Stack gap={1}>
						<Heading size={"sm"} color={"gray.700"}>No Upcoming Shifts Right Now!</Heading>
						<Text fontSize={"sm"} color={"gray.500"} maxW={"250px"}>
							We'll notify you as soon as a new shift is assigned to you.
						</Text>
					</Stack>
					<Button
					variant={"outline"}
					size	={"sm"}
					asChild
					mt={2}
					colorPalette={"blue"}
					>
						<RouterLink to={"/assignments"}>Check History</RouterLink>
					</Button>
				</Stack>
			</Card.Body>
		</Card.Root>
	);
};


const AdminDashboardActions: React.FC = () => {
	return (
		<Stack gap={6}>
			{/* Primary Action Grid */}
			<Flex gap={4} direction={{ base: "column", md: "row" }} wrap={"wrap"}>
				<AdminActionCard
				title="View Staff"
				description="Manage employee profiles and roles"
				icon={<LuUsers />}
				to="/admin/users"
				/>
				<AdminActionCard
				title="View Shifts"
				description="Monitor and edit shift schedule"
				icon={<LuCalendarDays />} 
				to="/admin/shifts"
				/>
			</Flex>

			{/* Quick Utility Links */}
			<Box borderTop={"1px solid"} borderColor={"gray.100"} pt={6}>
				<Text fontWeight={"bold"} mb={4} fontSize={"sm"} color={"gray.500"} textTransform={"uppercase"}>
					Quick Actions
				</Text>
				<Flex gap={3}>
					<Button variant={"outline"} size={"sm"} asChild>
						<RouterLink to={"/admin/shifts/schedule"}><LuPlus /> Schedule Shift</RouterLink>
					</Button>
					<Button variant={"outline"} size={"sm"} asChild>
						<RouterLink to={"/admin/users/new"}><LuPlus /> Create User</RouterLink>
					</Button>
				</Flex>
			</Box>
		</Stack>
	);
};

const AdminActionCard: React.FC<AdminActionCardProps> = ({ title, description, to, icon }) => {
	return (
		<Card.Root
		asChild
		flex={1}
		minW={"280px"}
		variant={"outline"}
		transition={"all 0.2x"}
		_hover={{ shadow: "md", borderColor: "blue.400", cursor: "pointer" }}
		>
			<RouterLink to={to}>
				<Card.Body p={6}>
					<Flex align={"center"} gap={4}>
						<Box fontSize={"3xl"} color={"blue.500"} bg={"blue.50"} p={3} borderRadius={"lg"}>
							{icon}
						</Box>
						<Stack gap={0}>
							<Heading size={"md"}>{title}</Heading>
							<Text fontSize={"sm"} color={"gray.500"}>{description}</Text>
						</Stack>
					</Flex>
				</Card.Body>
			</RouterLink>
		</Card.Root>
	);
};

interface AdminActionCardProps {
	title: string;
	description: string;
	to: string;
	icon: React.ReactNode;
}