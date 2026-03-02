import { Box, Heading, Text } from "@chakra-ui/react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router-dom";

import type { HTTPOkResponse, HTTPPaginationResponse, Pagination } from "@/@types";
import type { ShiftData } from "@/@types/shift";
import type { UserData } from "@/@types/user";
import { TableFilter, TableSelect } from "@/components/accessories/shift";
import { axiosClient, includeToken } from "@/utils";


type LoaderData = { user: UserData, shifts: Pagination<ShiftData> };

export const Component: React.FC = () => {
	const { user, shifts } = useLoaderData() as LoaderData;

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
				Manage <Link to={`/admin/users/${user.id}`}>{user.firstName} {user.lastName}'s</Link> Shift Assignments
			</Heading>
			<Text textAlign={"center"} fontSize={"md"} color={"gray.600"} mb={8}>
				Check a box to <strong>assign</strong> a shift, or uncheck to <strong>remove</strong>. <br />
				Save changes by clicking the "Apply Changes" button at the bottom of the page.
			</Text>
			<TableFilter />
			<TableSelect { ...shifts} />
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
		const [{ data: { data: user } }, { data: { data: shifts } }] = await Promise.all([
			axiosClient.get<HTTPOkResponse<UserData>>(`/users/${id}`, config),
			axiosClient.get<HTTPPaginationResponse<ShiftData>>("/shifts", config)
		]);
		return { user, shifts };
	} catch (_) {
		return null;
	}
};