import { Box, Heading } from "@chakra-ui/react";
import { useLoaderData, type LoaderFunctionArgs } from "react-router-dom";

import type { ShiftData } from "@/@types/shift";
import type { HTTPOkResponse } from "@/@types";
import { axiosClient, includeToken } from "@/utils";
import Form from "../form";


export const Component: React.FC = () => {
	const shift = useLoaderData() as ShiftData;

	return (
		<Box p={3} maxW={"4xl"} mx={"auto"}>
			<Heading
			as={"h1"}
			fontSize={"3xl"}
			fontWeight={"semibold"}
			textAlign={"center"}
			my={7}
			>
				Edit Shift Details
			</Heading>
			<Form shift={shift} />
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