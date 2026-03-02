import { Box, Button, Checkbox, Flex, NativeSelect, Table } from "@chakra-ui/react";
import { Link, useLocation, useNavigation, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

import type { HTTPOkResponse, Pagination as PaginationType } from "@/@types";
import type { UserData } from "@/@types/user";
import { axiosClient, includeToken } from "@/utils";
import { useSession } from "./session";
import { ActionToolbar, Pagination, TableHeader } from ".";


export const TableView: React.FC<PaginationType<UserData>> = ({ page: users, hasNext, hasPrev }) => {
	return (
		<>
			<Table.ScrollArea>
				<Table.Root px={3} border={"2px solid"} borderColor={"gray.100"} stickyHeader>
					<Table.Header backgroundColor={"gray.100"}>
						<Table.Row>
							<Table.ColumnHeader><TableHeader header="Name" value="firstName" /></Table.ColumnHeader>
							<Table.ColumnHeader>Role</Table.ColumnHeader>
							<Table.ColumnHeader><TableHeader header="Email" /></Table.ColumnHeader>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{users.map((user) => (
							<Table.Row key={user.id}>
								<Table.Cell>
									<Link to={`/admin/users/${user.id}`}>
										{user.firstName} {user.lastName}
									</Link>
								</Table.Cell>
								<Table.Cell>{user.role}</Table.Cell>
								<Table.Cell>{user.email}</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			</Table.ScrollArea>
			<Pagination page={users} hasNext={hasNext} hasPrev={hasPrev} />
		</>
	);
};


export const TableSelect: React.FC<PaginationType<UserData>> = ({ page: users, hasNext, hasPrev }) => {
	const { token } = useSession();
	const [preSelection, setPreSelection] = useState<number[]>([]);
	const [selection, setSelection] = useState<number[]>([]);
	const allChecked = selection.length === users.length;
	const indeterminate = selection.length > 0 && !allChecked;
	const rootPath = useLocation().pathname.substring(6);
	const config = includeToken(token!);

	const toggleAll = (checked: boolean | string) => {
		const nextSelection = checked ? users.map((user) => user.id) : [];
		setSelection(nextSelection);
	};

	const toggleOne = (staffId: number, checked: boolean | string) => {
		const nextSelection = checked ? [...selection, staffId] : selection.filter((val) => val !== staffId);
		setSelection(nextSelection);
	};

	const fetchAssignments = async () => {
		const promises = users.map(async ({ id: staffId }) => {
			try {
				const path = `${rootPath}/${staffId}`;
				const { data } = await axiosClient.get<HTTPOkResponse>(path, config);
				return data.data === null ? 0 : staffId;
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
								onCheckedChange={(d) => toggleAll(d.checked)}
								>
									<Checkbox.HiddenInput />
									<Checkbox.Control />
								</Checkbox.Root>
							</Table.ColumnHeader>
							<Table.ColumnHeader><TableHeader header="Name" value="firstName" /></Table.ColumnHeader>
							<Table.ColumnHeader>Role</Table.ColumnHeader>
							<Table.ColumnHeader><TableHeader header="Email" /></Table.ColumnHeader>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{users.map((user) => {
							const preChecked = preSelection.includes(user.id);
							const checked = selection.includes(user.id);
							let rowBg = "transparent";
							if (checked && !preChecked) rowBg = "green.50";
							else if (!checked && preChecked) rowBg = "red.50";
							return (
								<Table.Row key={user.id} data-selected={checked} backgroundColor={rowBg}>
									<Table.Cell>
										<Checkbox.Root
										checked={checked}
										onCheckedChange={(d) => toggleOne(user.id, d.checked)}
										>
											<Checkbox.HiddenInput />
											<Checkbox.Control />
										</Checkbox.Root>
									</Table.Cell>
									<Table.Cell>
										<Link to={`/admin/users/${user.id}`}>
											{user.firstName} {user.lastName}
										</Link>
									</Table.Cell>
									<Table.Cell>{user.role}</Table.Cell>
									<Table.Cell>{user.email}</Table.Cell>
								</Table.Row>
							);
						})}
					</Table.Body>
				</Table.Root>
			</Table.ScrollArea>
			{actionToolbar || <Pagination page={users} hasNext={hasNext} hasPrev={hasPrev} />}
		</>
	);
};


export const TableFilter: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigation = useNavigation();
	const loading = navigation.state === "loading";

	const filterBy = async (event: React.ChangeEvent<HTMLSelectElement>) => {
		const nextSearchParams = new URLSearchParams(searchParams);
		const role = event.target.value;
		if (role)
			nextSearchParams.set("role", role);
		else
			nextSearchParams.delete("role");
		setSearchParams(nextSearchParams, { replace: true, preventScrollReset: true });
	};

	return (
		<>
			<Flex justify={"space-between"} mb={3}>
				<Box w={"100px"}>
					<NativeSelect.Root disabled={loading}>
						<NativeSelect.Field
						placeholder="Filter by ..."
						defaultValue={searchParams.get("role") || undefined}
						onChange={filterBy}
						>
							<option value={"staff"}>Staff</option>
							<option value={"admin"}>Admin</option>
						</NativeSelect.Field>
					</NativeSelect.Root>
				</Box>
				<Button loading={loading} colorPalette={"blue"} fontWeight={"semibold"} textTransform={"uppercase"}>
					<Link to={"/admin/users/new"}>Create New User</Link>
				</Button>
			</Flex>
		</>
	);
};