import { Box, Heading, Text } from "@chakra-ui/react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router-dom";

import type { HTTPOkResponse, HTTPPaginationResponse, Pagination } from "@/@types";
import type { ShiftData } from "@/@types/shift";
import type { UserData } from "@/@types/user";
import { TableFilter, TableSelect } from "@/components/accessories/user";
import { axiosClient, includeToken } from "@/utils";


type LoaderData = { users: Pagination<UserData>, shift: ShiftData };

export const Component: React.FC = () => {
	const { users, shift } = useLoaderData() as LoaderData;

	return (
		<Box p={5} maxW={"3lg"} mx={"auto"}>
			<Heading
			as={"h1"}
			fontSize={"3xl"}
			fontWeight={"semibold"}
			textAlign={"center"}
			my={7}
			alignItems={"center"}
			>
				Manage <Link to={`/admin/shifts/${shift.id}`}>{shift.title}</Link> Staff Assignments
			</Heading>
			<Text textAlign={"center"} fontSize={"md"} color={"gray.600"} mb={8}>
				Check a box to <strong>assign</strong> a staff member, or uncheck to <strong>remove</strong>. <br />
				Save changes by clicking the "Apply Changes" button at the bottom of the page.
			</Text>
			<TableFilter />
			<TableSelect {...users} />
		</Box>
	);
};


export const loader = async ({ params, request }: LoaderFunctionArgs): Promise<LoaderData | null> => {
	try {
		const id = params.id;
		const url = new URL(request.url);
		const { data: { data: token } } = await axiosClient.get<HTTPOkResponse<string>>("/auth/sign-token");
		const config = includeToken(token);
		config.params = url.searchParams;
		const [{ data: { data: shift } }, { data: { data: users } }] = await Promise.all([
			axiosClient.get<HTTPOkResponse<ShiftData>>(`/shifts/${id}`, config),
			axiosClient.get<HTTPPaginationResponse<UserData>>("/users", config)
		]);
		return { shift, users };
	} catch (_) {
		return null;
	}
};