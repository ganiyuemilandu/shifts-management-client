import { ActionBar, Box, Button, ButtonGroup, Flex, Heading, Portal, Text } from "@chakra-ui/react";
import { BsArrowUp, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { Navigate, Outlet, useLocation, useNavigation, useSearchParams } from "react-router-dom";

import type { Pagination as PaginationType } from "@/@types";
import type { UserData } from "@/@types/user";
import { useSession } from "./session";
import { axiosClient, includeToken, toast } from "@/utils";
import React, { useState } from "react";


export const ProtectedRoute: React.FC<{ role: UserData["role"] }> = ({ role }) => {
	const { user } = useSession();
	const location = useLocation();

	if (!user)
		return <Navigate to="/login" state={{ from: location }} replace />;

	if (role === "admin" && user.role !== "admin")
		return <AccessDenied />;

	return <Outlet />;
};


export const AccessDenied: React.FC = () => {
	return (
		<Box
		textAlign="center"
		py="10"
		px="6"
		display="flex"
		flexDirection="column"
		justifyContent="center"
		alignItems="center"
		minH="100vh"
		bgGradient="linear(to-r, gray.100, gray.200)"
		>
			<Heading
			as="h1"
			size="2xl"
			color="red.500"
			mb="4"
			>
				Access Denied
			</Heading>
			<Text
			fontSize="lg"
			color="gray.600"
			mb="6"
			>
				You don't have the permission to view this page.
			</Text>
		</Box>
	);
};


export const TableHeader: React.FC<{ header: string, value?: string }> = ({ header, value }) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const order = searchParams.get("order")?.toLowerCase();
	const key = value ? value.toLowerCase() : header.toLowerCase();

	const onOrderBy = (key: string) => {
		const [_, order] = searchParams.getAll("order");
		const val = order && order.toLowerCase() in ["asc", "desc"] ? order : "ASC" ;
		const newSearchParams = new URLSearchParams(searchParams);
		newSearchParams.set("order", key);
		newSearchParams.append("order", val);
		setSearchParams(newSearchParams);
	};

	return (
		<Flex alignItems={"center"} cursor={"pointer"} onClick={() => onOrderBy(value || header)}>
			{header} {order === key && <BsArrowUp />}
		</Flex>
	)
};


export const Pagination = <T extends Record<string, string | number>> ({ page, hasNext, hasPrev }: PaginationType<T>): React.ReactElement | null => {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigation = useNavigation();
	const loading = navigation.state === "loading";

	if (!hasNext && !hasPrev)
		return null;

	const pageScroll = (direction: "prev" | "next") => {
		const newSearchParams = new URLSearchParams(searchParams);
		newSearchParams.set("scroll", direction);
		const cval = direction === "prev" ? page[0] : page[page.length - 1];
		const key = searchParams.get("order") || "id";
		const cursor = cval ? cval[key] : null;
		if (cursor)
			newSearchParams.set("cursor", String(cursor));
		else
			newSearchParams.delete("cursor");
		setSearchParams(newSearchParams, { replace: true });
	};

	return (
		<ButtonGroup align={"center"} gap={2} mt={2}>
			<Button disabled={!hasPrev} loading={loading} aria-label="Previous Page" onClick={() => pageScroll("prev")}>
				<BsChevronLeft />
			</Button>
			<Button disabled={!hasNext} loading={loading} aria-label="Next Page" onClick={() => pageScroll("next")}>
				<BsChevronRight />
			</Button>
		</ButtonGroup>
	);
};


export const ActionToolbar: React.FC<ActionToolbarProps> = ({ preSelection, setPreSelection, selection, setSelection, rootPath }) => {
	const isModified = preSelection.some((val) => !selection.includes(val)) || selection.some((val) => !preSelection.includes(val));
	if (!isModified)
		return null;
	const [loading, setLoading] = useState<boolean>(false);
	const { token } = useSession();
	const config = includeToken(token!);

	const onApplyChanges = async () => {
		setLoading(true);
		const [result1, result2] = await Promise.all([
			new Promise<number[]>(async (resolve) => {
				const ids = selection.filter((val) => !preSelection.includes(val));
				const promises = ids.map((id) => {
					const path = `${rootPath}/${id}`;
					return axiosClient.post(path, undefined, config).then(() => id).catch(() => 0);
				});
				const result = await Promise.all(promises);
				resolve(result.filter((val) => val));
			}),
			new Promise<number[]>(async (resolve) => {
				const ids = preSelection.filter((val) => !selection.includes(val));
				const promises = ids.map((id) => {
					const path = `${rootPath}/${id}`;
					return axiosClient.delete(path, config).then(() => 0).catch(() => id);
				});
				const result = await Promise.all(promises);
				resolve(result.filter((val) => val));
			})
		]);
		const filter = preSelection.filter((val) => selection.includes(val));
		const result3 = [...result1, ...result2, ...filter];
		setPreSelection(result3);
		setSelection(result3);
		toast.success("Changes applied successfully!");
		setLoading(false);
	};

	const onDiscardChanges = () => {
		setSelection([...preSelection]);
	};

	return (
		<Portal>
			<ActionBar.Root open={isModified}>
				<ActionBar.Content role="toolbar" aria-label="Selected actions" id="action-bar-content">
					<ActionBar.SelectionTrigger
					aria-live="polite"
					disabled={loading}
					onClick={() => setSelection([])}
					>
						{selection.length} selected
					</ActionBar.SelectionTrigger>
					<ActionBar.Separator />
					<ButtonGroup gap={3}>
						<Button variant="outline" size="sm" colorPalette="yellow" onClick={onDiscardChanges}>
							Discard Changes
						</Button>
						<Button variant="outline" size="sm" colorPalette="blue" loading={loading} onClick={onApplyChanges}>
							Apply Changes
						</Button>
					</ButtonGroup>
				</ActionBar.Content>
			</ActionBar.Root>
		</Portal>
	);
};

interface ActionToolbarProps {
	preSelection: number[];
	setPreSelection: (selection: number[]) => void;
	selection: number[];
	setSelection: (selection: number[]) => void;
	rootPath: string;
}