import { Box, Heading, HStack, Icon, Link, Text, VisuallyHidden, VStack } from "@chakra-ui/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Link as RouterLink } from "react-router-dom";
import { LuExternalLink } from "react-icons/lu";
import { useState } from "react";

import type { HTTPOkResponse } from "@/@types";
import type { ShiftAssignmentData } from "@/@types/assignment";
import { useSession } from "@/components/accessories/session";
import { axiosClient, includeToken } from "@/utils";


export const Component: React.FC = () => {
	const { user, token } = useSession();
	const[announcement, setAnnouncement] = useState<string>("");
	const config = includeToken(token!);

	const fetchEvents = async (eventInfo: { startStr: string, endStr: string }) => {
		config.params = { start: eventInfo.startStr, end: eventInfo.endStr };
		const { data: { data: events } } = await axiosClient.get<HTTPOkResponse<ShiftAssignmentData[]>>(`/assignments/staff/${user!.id}`, config);
		return events.map((event) => ({
			id: event.id.toString(),
			title: event.title,
			start: event.start,
			end: event.end,
			allDay: false,
			extendedProps: event.assignment
		}));
	};

	return (
		<Box p={3} maxW={"lg"} mx={"auto"}>
			<Heading
			as={"h1"}
				fontSize={"3xl"}
				fontWeight={"semibold"}
				textAlign={"center"}
				my={7}
			>
				Your Schedule
			</Heading>
		<VisuallyHidden>{announcement}</VisuallyHidden>
			<FullCalendar
			plugins={[dayGridPlugin, interactionPlugin]}
			initialView="dayGridMonth"
			events={fetchEvents}
			editable={true}
			selectable={true}
			displayEventTime={true}
			eventTimeFormat={{
				hour: "numeric",
				minute: "2-digit",
				meridiem: "short"
			}}
			eventContent={(eventInfo) => (
				<EventContent
				shiftId={eventInfo.event.id}
				staffId={eventInfo.event.extendedProps.staffId}
				title={eventInfo.event.title}
				timeText={eventInfo.timeText}
				/>
			)}
			eventClick={(info) => info.jsEvent.preventDefault()} 
			datesSet={(arg) => setAnnouncement(`Displaying date range from ${new Date(arg.startStr).toLocaleDateString()} to ${new Date(arg.endStr).toLocaleDateString()}`)}
			/>
		</Box>
	);
};


const EventContent: React.FC<Record<"shiftId" | "staffId" | "title" | "timeText", string>> = ({ shiftId, staffId, title, timeText }) => {
	return (
		<Box p={1} colorPalette={"blue"} width={"100%"}>
			<Link asChild variant={"plain"} width={"full"}>
				<RouterLink to={`/assignments/${staffId}/${shiftId}`}>
					<VStack align={"start"} gap={0} width={"full"}>
						<HStack justifyContent={"space-between"} width={"full"}>
							<Text fontWeight={"bold"} fontSize={"xs"}>{timeText}</Text>
							<Icon as={LuExternalLink} size={"xs"} opacity={0.5} />
						</HStack>
						<Text fontSize={"xs"}>{title}</Text>
					</VStack>
				</RouterLink>
			</Link>
		</Box>
	);
};