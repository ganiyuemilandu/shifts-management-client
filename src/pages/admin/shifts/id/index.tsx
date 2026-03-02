import { Badge, Box, Card, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { BsChevronLeft } from "react-icons/bs";
import { Link as RouterLink, useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router-dom";

import type { HTTPOkResponse } from "@/@types";
import type { ShiftData } from "@/@types/shift";
import { useSession } from "@/components/accessories/session";
import { deleteShift } from "@/utils/handlers";
import { axiosClient, includeToken } from "@/utils";
import { DeleteConfirmation } from "@/components/accessories/dialog";


export const Component: React.FC = () => {
	const shift = useLoaderData() as ShiftData;
	const navigate = useNavigate();
	const { token } = useSession();

	const start = new Date(shift.start);
	const end = new Date(shift.end);

	let badgeColor, badgeText;
	if (isPast(end)) {
		badgeColor = "red";
		badgeText = "Ended " + formatDistanceToNow(end, { addSuffix: true });
	} else if (isPast(start)) {
		badgeColor = "green";
		badgeText = "In progress";
	} else {
		badgeColor = "yellow";
		badgeText = "Starts " + formatDistanceToNow(start, { addSuffix: true });
	}

	const onConfirmDelete = async () => {
		if (await deleteShift(shift, token!))
			navigate("/admin/shifts", { replace: true });
	};

	return (
		<Box p={3} maxW={"lg"} mx={"auto"}>
			<Link asChild
			color={"teal"}
			_hover={{ textDecor: "none" }}
			display={"flex"}
			alignItems={"center"}
			>
				<RouterLink to={"/admin/shifts"}>
					<BsChevronLeft /> View All Shifts
				</RouterLink>
			</Link>
			<Heading
			fontSize={"3xl"}
			fontWeight={"semibold"}
			textAlign={"center"}
			my={7}
			>
				{shift.title} at {shift.location}
			</Heading>
			<Stack direction={"row"}>
				<Text>{format(start, "PP p")} - {format(end, "PP p")}</Text>
				<Badge fontSize={"md"} colorPalette={badgeColor}>{badgeText}</Badge>
			</Stack>

			<Card.Root mt={4} border={"1px solid"} borderColor={"gray.200"}>
				<Card.Body>
					<Text>{shift.remark}</Text>
				</Card.Body>
				{shift.break > 0 && (
					<Card.Footer>
						{shift.break} minutes break.
					</Card.Footer>
				)}
			</Card.Root>

			<Flex justify={"space-between"} mt={5}>
				<DeleteConfirmation onConfirm={onConfirmDelete} title="Confirm Shift Deletion">
					<Text as={"span"} color={"red.600"} cursor={"pointer"}>
						Delete Shift
					</Text>
				</DeleteConfirmation>
				<Link asChild
				color={"teal"}
				_hover={{ textDecor: "none" }}
				>
					<RouterLink to={`/admin/shifts/schedule/${shift.id}`}>Edit Shift</RouterLink>
				</Link>
			</Flex>

			<Text textAlign={"center"}>
				<Link asChild color={"teal"} _hover={{ textDecor: "none" }}>
					<RouterLink to={`/admin/assignments/shift/${shift.id}`}>Manage shift assignments</RouterLink>
				</Link>
			</Text>
		</Box>
	);
};


export const loader = async ({ params }: LoaderFunctionArgs): Promise<ShiftData | null> => {
	try {
		const { id } = params;
		const { data: { data: token } } = await axiosClient.get<HTTPOkResponse<string>>("/auth/sign-token");
		const { data: { data: shift } } = await axiosClient.get<HTTPOkResponse<ShiftData>>(`/shifts/${id}`, includeToken(token));
		return shift;
	} catch (_) {
		return null;
	}
};