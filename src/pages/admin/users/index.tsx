import { Box, Heading } from "@chakra-ui/react";
import { useLoaderData, type LoaderFunctionArgs } from "react-router-dom";

import type { HTTPOkResponse, HTTPPaginationResponse, Pagination } from "@/@types";
import type { UserData } from "@/@types/user";
import { TableFilter, TableView } from "@/components/accessories/user";
import { axiosClient, includeToken } from "@/utils";


export const Component: React.FC = () => {
	const pagination = useLoaderData() as Pagination<UserData>;

		return (
		<Box p={5} maxW={"3lg"} mx={"auto"}>
			<Heading
			as={"h1"}
			fontSize={"3xl"}
			fontWeight={"semibold"}
			textAlign={"center"}
			my={7}
			>
				Registered Users
			</Heading>
			<TableFilter />
			<TableView {...pagination} />
		</Box>
	);
};


export const loader = async ({ request }: LoaderFunctionArgs) => {
	try {
		const url = new URL(request.url);
		const { data: { data: token } } = await axiosClient.get<HTTPOkResponse<string>>("/auth/sign-token");
		const config = includeToken(token);
		config.params = url.searchParams;
		const { data } = await axiosClient.get<HTTPPaginationResponse<UserData>>("/users", config);
		return data.data;
	} catch (_) {
		return null;
	}
};