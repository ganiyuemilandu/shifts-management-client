import { Badge, Box, Button, Card, Flex, Group, Heading, Separator, Stack, Text } from "@chakra-ui/react";
import { format, formatDistance, formatDistanceToNow, isFuture, subHours } from "date-fns";
import { LuClock, LuCoffee, LuMapPin, LuTimer } from "react-icons/lu";
import { useState } from "react";

import type { HTTPOkResponse } from "@/@types";
import type { AssignmentData, ShiftAssignmentData } from "@/@types/assignment";
import { axiosClient, includeToken, toast } from "@/utils";
import { ProgressBar, ProgressRoot } from "../ui/progress";
import { UpdateAssignmentConfirmation } from "./dialog";
import { useSession } from "./session";


export const ShiftAssignmentView: React.FC<{ shift: ShiftAssignmentData }> = ({ shift: defaultShift }) => {
	const { token } = useSession();
	const [shift, setShift] = useState<ShiftAssignmentData>(defaultShift);
	const [loading, setLoading] = useState<boolean>(false);
	const assignment = shift.assignment;
	const config = includeToken(token!);
	const start = new Date(shift.start);
	const end = new Date(shift.end);

	const updateShift = async (assignmentData: Partial<AssignmentData>) => {
		setLoading(true);
		try {
			const { data } = await axiosClient.put<HTTPOkResponse<ShiftAssignmentData>>(`/assignments/staff/${assignment.staffId}/${shift.id}`, assignmentData, config);
			toast.success("Success!");
			setShift(data.data);
		} catch (_) {
			toast.error("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card.Root
		flex={1}
		width={"full"}
		variant={"outline"}
		boxShadow={"sm"}
		borderRadius={"xl"}
		>
			<Card.Header pb={2}>
				<Flex justify={"space-between"} align={"center"}>
					<Badge
					size={"lg"}
					variant={"subtle"}
					colorPalette={
						assignment.status === "accepted" ? "green" : 
						assignment.status === "declined" ? "red" : "orange"
					}
					>
						{assignment.status || "pending"}
					</Badge>
					<Text fontSize={"xs"} color={"fg.muted"} fontFamily={"mono"}>
						REF: {shift.id}
					</Text>
				</Flex>
				<Heading size={"md"} mt={4}>{shift.title}</Heading>
			</Card.Header>

			<Card.Body>
				<Stack gap={4}>
					<Flex align={"center"} gap={3}>
						<Box p={2} bg={"blue.50"} color={"blue.600"} borderRadius={"md"}>
							<LuMapPin />
						</Box>
						<Text fontWeight={"medium"}>{shift.location}</Text>
					</Flex>

					<Flex align={"center"} gap={3}>
						<Box p={2} bg={"purple.50"} color={"purple.600"} borderRadius={"md"}>
							<LuClock />
						</Box>
						<Stack gap={0}>
							<Text fontSize={"sm"} fontWeight={"bold"}>
								{format(start, "eeee, MMM do")}
							</Text>
							<Text fontSize={"xs"} color={"fg.muted"}>
								{format(start, "p")} - {format(end, "p") + " "}
								({formatDistance(start, end)})
							</Text>
						</Stack>
					</Flex>

					<Separator />

					{/* Attendance & Breaks Section */}
					<Stack gap={3}>
						<Flex align={"center"} gap={3}>
							<Box p={2} bg={"gray.50"} color={"gray.600"} borderRadius={"md"}>
								<LuTimer size={18} />
							</Box>
							<Flex gap={6}>
								<Box>
									<Text fontSize={"xs"} fontWeight={"bold"} color={"fg.subtle"}>IN</Text>
									<Text fontSize={"sm"}>{assignment.clockedIn ? format(new Date(assignment.clockedIn), "p") : "--:--"}</Text>
								</Box>
								<Box>
									<Text fontSize={"xs"} fontWeight={"bold"} color={"fg.subtle"}>OUT</Text>
									<Text fontSize={"sm"}>{assignment.clockedOut ? format(new Date(assignment.clockedOut), "p") : "--:--"}</Text>
								</Box>
							</Flex>
						</Flex>

						<Flex align={"center"} gap={3}>
							<Box p={2} bg={"orange.50"} color={"orange.600"} borderRadius={"md"}>
								<LuCoffee size={18} />
							</Box>
							<Box>
								<Text fontSize={"xs"} fontWeight={"bold"} color={"orange.700"}>BREAK</Text>
								{shift.break > 0 ? (
									<Text fontSize={"sm"}>
										{`${assignment.breakStart ? format(new Date(assignment.breakStart), "p") : "--:--"} - ${assignment.breakEnd ? format(new Date(assignment.breakEnd), "p") : "--:--"}`}
									</Text>
								) : (
									<Text fontSize={"sm"}>
										No break minutes allotted
									</Text>
								)}
							</Box>
						</Flex>
					</Stack>

					<Box
					mt={2}
					p={3}
					bg={"blue.50"}
					borderRadius={"lg"}
					borderLeft={"4px solid"}
					borderLeftColor={"blue.400"}
					>
						<Text
						fontSize={"xs"}
						fontWeight={"bold"}
						color={"blue.700"}
						textTransform={"uppercase"}
						mb={1}
						>
							Staff Notes
						</Text>
						<Text fontSize={"sm"} color={"gray.700"} lineHeight={"short"}>
							{shift.remark}
						</Text>
					</Box>
				</Stack>
			</Card.Body>

			<Card.Footer bg={"gray.50"} borderBottomRadius={"xl"} flexDirection={"column"} gap={4}>
				{isFuture(end) ? (
					<ShiftProgressView shift={shift} updateShift={updateShift} loading={loading} />
				): (
					<Flex justify={"space-between"} align={"center"}>
						<Text width={"full"}>
							ended {formatDistanceToNow(end, { addSuffix: true })}
						</Text>
						<Button asChild size={"sm"}>
							See assignment link
						</Button>
					</Flex>
				)}
			</Card.Footer>
		</Card.Root>
	);
};


interface ShiftAssignmentProps {
	loading: boolean;
	shift: ShiftAssignmentData;
	updateShift: (data: Partial<AssignmentData>) => Promise<void>;
}

const ShiftProgressView: React.FC<ShiftAssignmentProps> = ({ shift, updateShift, loading }) => {
	const start = new Date(shift.start);
	const assignment = shift.assignment;

	const acceptButton = (
		<UpdateAssignmentConfirmation
		title="Confirm Assignment"
		description="Check your email for any update"
		field={"accepted"}
		updateField={updateShift}
		>
			<Button size={"sm"} colorPalette={"teal"} loading={loading} disabled={assignment.status === "accepted"}>Accept</Button>
		</UpdateAssignmentConfirmation>
	);

	const declineButton = (
		<UpdateAssignmentConfirmation
		title="Confirm Assignment"
		description="Check your email for any update"
		field={"declined"}
		updateField={updateShift}
		>
			<Button size={"sm"} variant={"outline"} loading={loading} disabled={assignment.status === "declined"}>Decline</Button>
		</UpdateAssignmentConfirmation>
	);

	return (
		<Stack width={"full"} gap={4}>
			{isFuture(subHours(start, 1)) ? (
				<Flex justify={"space-between"} align={"center"}>
					<Text fontSize={"sm"}>
						Commences in {formatDistanceToNow(start)}
					</Text>
					<Group attached>
						{acceptButton}
						{declineButton}
					</Group>
				</Flex>
			) : (
				<>
					<ProgressRoot value={10}>
						<ProgressBar />
					</ProgressRoot>
					{assignment.clockedIn && !isFuture(start) ? (
						<Group attached>
							{!assignment.breakStart ? (
								<UpdateAssignmentConfirmation
								title="Confirm Break Start"
								description={`Take a ${shift.break} minutes break.`}
								field={"breakStart"}
								updateField={updateShift}
								>
									<Button size={"sm"} loading={loading} disabled={!shift.break}>Take a break</Button>
								</UpdateAssignmentConfirmation>
							) : (
								<UpdateAssignmentConfirmation
								title="Resume work"
								field={"breakEnd"}
								updateField={updateShift}
								>
									<Button size={"sm"} loading={loading} disabled={!shift.break && !!assignment.breakEnd}>Resume shift</Button>
								</UpdateAssignmentConfirmation>
							)}
							<UpdateAssignmentConfirmation
							title="Resume work"
							field={"clockedOut"}
							updateField={updateShift}
							>
								<Button size={"sm"} loading={loading} disabled={!!assignment.clockedOut}>Clock out</Button>
							</UpdateAssignmentConfirmation>
						</Group>
					) : (
						<Group attached>
							{assignment.status === "accepted" ? (
								<UpdateAssignmentConfirmation
								description="Clock in to work"
								field={"clockedIn"}
								updateField={updateShift}
								>
									<Button size={"sm"} colorPalette={"teal"} loading={loading} disabled={!!assignment.clockedIn}>Clock in</Button>
								</UpdateAssignmentConfirmation>
							) : (
								acceptButton
							)}
							{declineButton}
						</Group>
					)}
				</>
			)}
		</Stack>
	);
};