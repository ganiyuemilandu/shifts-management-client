import { Badge, Box, Card, Flex, Heading, Separator, Stack, Text } from "@chakra-ui/react";
import { format, formatDistance } from "date-fns";
import { LuCircleAlert, LuClock, LuCoffee, LuMapPin, LuTimer } from "react-icons/lu";
import { useLoaderData, type LoaderFunctionArgs } from "react-router-dom";

import type { HTTPOkResponse } from "@/@types";
import type { ShiftAssignmentData } from "@/@types/assignment";
import { axiosClient, includeToken } from "@/utils";


export const Component: React.FC = () => {
	const shift = useLoaderData() as ShiftAssignmentData;
	const assignment = shift.assignment;
	const start = new Date(shift.start);
	const end = new Date(shift.end);

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

			{assignment.status === "declined" && (
				<Card.Footer bg={"red.50"} borderBottomRadius={"xl"} borderTop={"1px solid"} borderColor={"red.100"}>
					<Flex gap={3} align={"start"}>
						<LuCircleAlert color="var(--chakra-colors-red-600)" style={{ marginTop: "2px" }} />
						<Box>
							<Text fontSize={"xs"} fontWeight={"bold"} color={"red.700"}>DECLINE NOTE</Text>
							<Text fontSize={"sm"} color={"red.800"}>{assignment.declineNote || "No reason provided."}</Text>
						</Box>
					</Flex>
				</Card.Footer>
			)}
		</Card.Root>
	);
};


export const loader = async ({ params }: LoaderFunctionArgs): Promise<ShiftAssignmentData | null> => {
	try {
	const { shiftId, staffId } = params;
		const { data: { data: token } } = await axiosClient.get<HTTPOkResponse<string>>("/auth/sign-token");
		const { data: { data: shift } } = await axiosClient.get<HTTPOkResponse<ShiftAssignmentData>>(`/assignments/staff/${staffId}/${shiftId}`, includeToken(token));
		return shift;
	} catch (_) {
		return null;
	}
};