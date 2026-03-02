import { Badge, Box, Button, Card, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { format, formatDistanceToNow } from "date-fns";
import { BsChevronLeft } from "react-icons/bs";
import { Link as RouterLink, useLoaderData, type LoaderFunctionArgs } from "react-router-dom";
import { useState } from "react";

import type { HTTPOkResponse } from "@/@types";
import type { ShiftAssignmentData } from "@/@types/assignment";
import type { UserData } from "@/@types/user";
import { ActionConfirmation, DeleteUserConfirmation, LogoutConfirmation } from "@/components/accessories/dialog";
import { useSession } from "@/components/accessories/session";
import { axiosClient, includeToken, toast } from "@/utils";


export const Component: React.FC = () => {
	const { user: defaultUser, shift } = useLoaderData() as LoaderData;
	const [user, setUser] = useState<UserData>(defaultUser);
	const[loading, setLoading] = useState<boolean>(false);
	const { token, user: admin } = useSession();
	const assignment = shift?.assignment;
	const config = includeToken(token!);
	const alternateRole:UserData["role"] = user.role === "admin" ? "staff" : "admin";

	const onChangeRole = async () => {
		try {
			setLoading(true);
			const { data } = await axiosClient.put<HTTPOkResponse<UserData>>(`/users/${user.id}`, { role: user.role === "admin" ? "staff" : "admin" }, config);
			setUser(data.data);
			toast.success("Successfully changed user role");
		} catch (_) {
			toast.error("Failed to change user role");
		}
		setLoading(false);
	};

	return (
		<Box p={3} maxW={"lg"} mx={"auto"}>
			<Link asChild
			color={"teal"}
			_hover={{ textDecor: "none" }}
			display={"flex"}
			alignItems={"center"}
			>
				<RouterLink to={"/admin/users"}>
					<BsChevronLeft /> View All Users
				</RouterLink>
			</Link>
			<Heading
			fontSize={"3xl"}
			fontWeight={"semibold"}
			textAlign={"center"}
			my={7}
			>
				{user.firstName} {user.lastName}
			</Heading>

			<Flex justify={"center"} align={"center"} gap={3} mb={8}>
				{user.id === admin!.id ? (
					<Badge colorPalette={user.role === "admin" ? "blue" : "gray"} variant={"solid"} mr={2}>
						{user.role.toUpperCase()}
					</Badge>
				) : (
					<ActionConfirmation
					title={`Confirm user role as ${ alternateRole}`}
					description={alternateRole === "admin" ? "User will be able to create, read, update, and delete a myriad of resources." : "User will lose all administrative priveleges."}
					onConfirm={onChangeRole}
					>
						<Button
						variant={"outline"}
						size={"sm"}
						loading={loading}
						>
							<Badge colorPalette={user.role === "admin" ? "blue" : "gray"} variant={"solid"} mr={2}>
								{user.role.toUpperCase()}
							</Badge>
							<Text fontSize={"xs"}>Click to change</Text>
						</Button>
					</ActionConfirmation>
				)}
				<Text fontSize={"sm"} color={"fg.muted"}>
					Joined {format(new Date(user.createdAt), "PP")}
				</Text>
			</Flex>

			<Card.Root mb={6} variant={"outline"}>
				<Card.Header>
					<Heading fontSize={"md"}>Next Assignment</Heading>
				</Card.Header>
				<Card.Body>
					{shift ? (
						<Text>
							Scheduled for a {" "}
							<Link asChild color="teal.500" fontWeight="bold">
								<RouterLink to={`/admin/shifts/${shift.id}`}>shift</RouterLink>
							</Link>
							{" "}{formatDistanceToNow(new Date(shift.start), { addSuffix: true })}
						</Text>
					): (
						<Text color={"fg.muted"}>No upcoming shifts scheduled.</Text>
					)}
				</Card.Body>
				{assignment && (
					<Card.Footer justifyContent={"space-between"} alignItems={"center"}>
						<Badge variant={"outline"} colorPalette={assignment?.status === "accepted" ? "green" : "red"}>
							Status: {assignment.status || "pending"}
						</Badge>
						<Button size={"sm"}>Send reminder</Button>
					</Card.Footer>
				)}
			</Card.Root>

			<Flex justify={"space-between"} mt={5}>
				<Link asChild
				color={"teal"}
				_hover={{ textDecor: "none" }}
				>
					<RouterLink to={"/assignments"}>View User Assignments</RouterLink>
				</Link>
				<Link asChild
				color={"teal"}
				_hover={{ textDecor: "none" }}
				>
					<RouterLink to={`/admin/assignments/staff/${user.id}`}>Manage User Assignments</RouterLink>
				</Link>
			</Flex>

			{user.id === admin!.id? (
				<LogoutConfirmation>
					<Text
					textAlign={"center"}
					as={"span"}
					color={"red.600"}
					cursor={"pointer"}
					>
						Log Out
					</Text>
				</LogoutConfirmation>
			) : (
				<DeleteUserConfirmation userId={user.id}>
					<Text
					textAlign={"center"}
					as={"span"}
					color={"red.600"}
					cursor={"pointer"}
					>
						Delete User
					</Text>
				</DeleteUserConfirmation>
			)}
		</Box>
	);
};


export const loader = async ({ params }: LoaderFunctionArgs): Promise<LoaderData> => {
	const { id } = params;
	const { data: { data: token } } = await axiosClient.get<HTTPOkResponse<string>>("/auth/sign-token");
	const config = includeToken(token);
	const [{ data: { data: user } }, { data: { data: shift } }] = await Promise.all([
		axiosClient.get<HTTPOkResponse<UserData>>(`/users/${id}`, config),
		axiosClient.get<HTTPOkResponse<ShiftAssignmentData | null>>(`/assignments/staff/${id}/0`, config)
	]);
	return { user, shift };
};


type LoaderData = { user: UserData, shift: ShiftAssignmentData | null };