import { Box, Button, Checkbox, Flex, NativeSelect, Table } from "@chakra-ui/react";
import { addWeeks, endOfDay, endOfMonth, endOfWeek, format, isPast, startOfDay, startOfMonth, startOfWeek, subWeeks } from "date-fns";
import { Link, useLocation, useNavigation, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

import type { HTTPOkResponse, Pagination as PaginationType } from "@/@types";
import type { ShiftData } from "@/@types/shift";
import { useSession } from "./session";
import { axiosClient, includeToken } from "@/utils";
import { ActionToolbar, Pagination } from ".";


export const TableView: React.FC<PaginationType<ShiftData>> = (pagination) => {
	const shifts = pagination.page;

	return (
		<>
		<Table.ScrollArea>
				<Table.Root px={3} border={"2px solid"} borderColor={"gray.100"} stickyHeader>
					<Table.Header backgroundColor={"gray.100"}>
						<Table.Row>
							<Table.ColumnHeader>Title</Table.ColumnHeader>
							<Table.ColumnHeader>Location</Table.ColumnHeader>
							<Table.ColumnHeader>Start time</Table.ColumnHeader>
							<Table.ColumnHeader>End time</Table.ColumnHeader>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{shifts.map((shift) => (
							<Table.Row key={shift.id}>
								<Table.Cell>
									<Link to={`/admin/shifts/${shift.id}`}>{shift.title}</Link>
								</Table.Cell>
								<Table.Cell>{shift.location}</Table.Cell>
								<Table.Cell>{format(shift.start, "PP p")}</Table.Cell>
								<Table.Cell>{format(shift.end, "PP p")}</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			</Table.ScrollArea>
			<Pagination {...pagination} />
		</>
	);
};


export const TableSelect: React.FC<PaginationType<ShiftData>> = (pagination) => {
	const shifts = pagination.page;
const { token } = useSession();
	const [preSelection, setPreSelection] = useState<number[]>([]);
	const [selection, setSelection] = useState<number[]>([]);
	const allChecked = selection.length === shifts.length;
	const indeterminate = selection.length > 0 && !allChecked;
	const rootPath = useLocation().pathname.substring(6);
	const config = includeToken(token!);

	const toggleAll = (checked: boolean | string) => {
		const nextSelection = checked ? shifts.map((shift) => shift.id) : [];
		setSelection(nextSelection);
	};

	const toggleOne = (shiftId: number, checked: boolean | string) => {
		const nextSelection = checked ? [...selection, shiftId] : selection.filter((val) => val !== shiftId);
		setSelection(nextSelection);
	};

	const fetchAssignments = async () => {
		const promises = shifts.map(async ({ id: shiftId }) => {
			try {
				const path = `${rootPath}/${shiftId}`;
				const { data } = await axiosClient.get<HTTPOkResponse>(path, config);
				return data.data === null ? 0 : shiftId;
			} catch (_) {
				return 0;
			}
		});
		const result = await Promise.all(promises);
		const filter = result.filter((val) => val);
		setPreSelection(filter);
		setSelection(filter);
	};

	const actionToolbar = <ActionToolbar preSelection={preSelection} setPreSelection={setPreSelection} selection={selection} setSelection={setSelection} rootPath={rootPath} />;

	useEffect(() => {
		fetchAssignments();
	}, []);

	return (
		<>
			<Table.ScrollArea>
				<Table.Root px={3} border={"2px solid"} borderColor={"gray.100"} stickyHeader>
					<Table.Header backgroundColor={"gray.100"}>
						<Table.Row>
							<Table.ColumnHeader>
								<Checkbox.Root
									checked={indeterminate ? "indeterminate" : allChecked}
									disabled={shifts.some((shift) => isPast(new Date(shift.start)))}
									onCheckedChange={(d) => toggleAll(d.checked)}
								>
									<Checkbox.HiddenInput />
									<Checkbox.Control />
								</Checkbox.Root>
							</Table.ColumnHeader>
							<Table.ColumnHeader>Title</Table.ColumnHeader>
							<Table.ColumnHeader>Location</Table.ColumnHeader>
							<Table.ColumnHeader>Start time</Table.ColumnHeader>
							<Table.ColumnHeader>End time</Table.ColumnHeader>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{shifts.map((shift) => {
							const preChecked = preSelection.includes(shift.id);
							const checked = selection.includes(shift.id);
							let rowBg = "transparent";
							if (checked && !preChecked) rowBg = "green.50";
							else if (!checked && preChecked) rowBg = "red.50";
							return (
								<Table.Row key={shift.id} data-selected={checked} backgroundColor={rowBg}>
									<Table.Cell>
										<Checkbox.Root
											checked={checked}
											disabled={isPast(new Date(shift.start))}
											onCheckedChange={(d) => toggleOne(shift.id, d.checked)}
										>
											<Checkbox.HiddenInput />
											<Checkbox.Control />
										</Checkbox.Root>
									</Table.Cell>
									<Table.Cell>
										<Link to={`/admin/shifts/${shift.id}`}>{shift.title}</Link>
									</Table.Cell>
									<Table.Cell>{shift.location}</Table.Cell>
									<Table.Cell>{format(shift.start, "PP p")}</Table.Cell>
									<Table.Cell>{format(shift.end, "PP p")}</Table.Cell>
								</Table.Row>
							);
						})}
					</Table.Body>
				</Table.Root>
			</Table.ScrollArea>
			{actionToolbar || <Pagination {...pagination} />}
		</>
	);
};


export const TableFilter: React.FC<{ period?: keyof typeof dateOptions }> = ({ period }) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigation = useNavigation();
	const loading = navigation.state === "loading";

	const filterBy = async (event: React.ChangeEvent<HTMLSelectElement>) => {
		const nextSearchParams = new URLSearchParams(searchParams);
		const key = event.target.value as keyof typeof dateOptions;
		const range = key? dateOptions[key]: undefined;
		const value = range? range(): undefined;
		if (value) {
			nextSearchParams.set("start", format(value.start, "yyyy-MM-dd"));
			nextSearchParams.set("end", format(value.end, "yyyy-MM-dd"));
		}
		else {			nextSearchParams.delete("start");
			nextSearchParams.delete("end");
		}
		setSearchParams(nextSearchParams, { replace: true, preventScrollReset: true });
	};

	return (
		<>
			<Flex justify={"space-between"} mb={3}>
				<Box w={"100px"}>
					<NativeSelect.Root disabled={loading}>
						<NativeSelect.Field
						placeholder="Filter by ..."
						defaultValue={period}
						onChange={filterBy}
						>
							<option value={"today"}>Today</option>
							<option value={"thisWeek"}>This week</option>
							<option value={"thisMonth"}>This month</option>
							<option value={"nextWeek"}>Next week</option>
							<option value={"lastWeek"}>Last week</option>
						</NativeSelect.Field>
					</NativeSelect.Root>
				</Box>
				<Button loading={loading} colorPalette={"blue"} fontWeight={"semibold"} textTransform={"uppercase"}>
					<Link to={"/admin/shifts/schedule"}>Schedule New Shift</Link>
				</Button>
			</Flex>
		</>
	);
};


const dateOptions = {
	today: () => {
		const today = new Date();
		return { start: startOfDay(today), end: endOfDay(today) };
	},
	thisWeek: () => {
		const today = new Date();
		return { start: startOfWeek(today), end: endOfWeek(today) };
	},
	thisMonth: () => {
		const today = new Date();
		return { start: startOfMonth(today), end: endOfMonth(today) };
	},
	nextWeek: () => {
		const nextWeek = addWeeks(new Date(), 1);
		return { start: startOfWeek(nextWeek), end: endOfWeek(nextWeek) };
	},
	lastWeek: () => {
		const lastWeek = subWeeks(new Date(), 1);
		return { start: startOfWeek(lastWeek), end: endOfWeek(lastWeek) };
	}
} as const;