import { Box, Heading } from "@chakra-ui/react";
import { useLoaderData, type LoaderFunctionArgs } from "react-router-dom";

import type { HTTPOkResponse, HTTPPaginationResponse, Pagination } from "@/@types";
import type { ShiftData } from "@/@types/shift";
import { TableFilter, TableView } from "@/components/accessories/shift";
import { axiosClient, includeToken } from "@/utils";


export const Component: React.FC = () => {
	const pagination = useLoaderData() as Pagination<ShiftData>;

		return (
		<Box p={5} maxW={"3lg"} mx={"auto"}>
			<Heading
			as={"h1"}
			fontSize={"3xl"}
			fontWeight={"semibold"}
			textAlign={"center"}
			my={7}
			>
				Scheduled Shifts
			</Heading>
			<TableFilter period="thisWeek" />
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
		const { data } = await axiosClient.get<HTTPPaginationResponse<ShiftData>>("/shifts", config);
		return data.data;
	} catch (_) {
		return null;
	}
};