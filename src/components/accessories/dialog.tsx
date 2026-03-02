import { Button, Dialog, Field, Input, Portal } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

import type { AssignmentData } from "@/@types/assignment";
import { deleteUser, logoutUser } from "@/utils/handlers";
import { useSession } from "./session";


interface DeleteConfirmationProps {
	children: React.ReactNode;
	onConfirm: React.MouseEventHandler<HTMLButtonElement>;
	title?: string;
}


export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ children, onConfirm, title = "Delete Confirmation" }) => {
	const cancelRef = useRef<HTMLButtonElement>(null);

	return (
		<Dialog.Root role="alertdialog" initialFocusEl={() => cancelRef.current}>
			<Dialog.Trigger asChild>{children}</Dialog.Trigger>
			<Portal>
				<Dialog.Positioner>
					<Dialog.Backdrop />
					<Dialog.Content>
						<Dialog.Header fontSize={"lg"} fontWeight="bold">
							<Dialog.Title>{title}</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							Are you sure you want to delete this item? This action cannot be undone.
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.CloseTrigger asChild>
								<Button variant={"outline"} ref={cancelRef}>Cancel</Button>
							</Dialog.CloseTrigger>
							<Dialog.ActionTrigger asChild>
								<Button colorPalette={"red"} ml={3} onClick={onConfirm}>Delete</Button>
							</Dialog.ActionTrigger>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
};


interface ActionConfirmationProps extends DeleteConfirmationProps {
	description?: string;
}


export const ActionConfirmation: React.FC<ActionConfirmationProps> = ({ children, onConfirm, title = "Confirm Action", description = "" }) => {
	const cancelRef = useRef<HTMLButtonElement>(null);

	return (
		<Dialog.Root role="alertdialog" initialFocusEl={() => cancelRef.current}>
			<Dialog.Trigger asChild>{children}</Dialog.Trigger>
			<Portal>
				<Dialog.Positioner>
					<Dialog.Backdrop />
					<Dialog.Content>
						<Dialog.Header fontSize={"lg"} fontWeight="bold">
							<Dialog.Title>{title}</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							{description} Do you wish to proceed?
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.CloseTrigger asChild>
								<Button variant={"outline"} ref={cancelRef}>Cancel</Button>
							</Dialog.CloseTrigger>
							<Dialog.ActionTrigger asChild>
								<Button colorPalette={"teal"} ml={3} onClick={onConfirm}>Proceed</Button>
							</Dialog.ActionTrigger>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
};


export const LogoutConfirmation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { updateSession } = useSession();

	const onLogout = async () => {
		if (await logoutUser())
			updateSession(null);
	};

	return (
		<ActionConfirmation
		title="Confirm Logout"
		description="You'll be logged out of your account."
		onConfirm={onLogout}
		>
			{children}
		</ActionConfirmation>
	);
};


export const DeleteUserConfirmation: React.FC<{ children: React.ReactNode, userId?: number }> = ({ children, userId }) => {
	const navigate = useNavigate();
	const { user, updateSession, token } = useSession();
	const id = userId ?? user!.id;

	const onDelete = async () => {
		if ((await deleteUser(id, token!)) && id === user!.id) {
			updateSession(null);
			navigate("/", { replace: true });
		}
	};

	return (
		<DeleteConfirmation
		title={id === user!.id ? "Confirm Account Deletion" : "Confirm User Deletion"}
		onConfirm={onDelete}
		>
			{children}
		</DeleteConfirmation>
	);
};


interface UpdateAssignmentConfirmationProps extends Omit<ActionConfirmationProps, "onConfirm"> {
	field: keyof Omit<AssignmentData, "shiftId" | "staffId" | "declineNote" | "status"> | AssignmentData["status"];
	updateField: (data: Partial<AssignmentData>) => Promise<void>;
}

export const UpdateAssignmentConfirmation: React.FC<UpdateAssignmentConfirmationProps> = ({ children, title, description, field, updateField }) => {
	if (field !== "declined") {
		return (
			<ActionConfirmation
			title={title ?? "Confirm Assignment Update"}
			description={description ?? "You are about to update your assignment"}
			onConfirm={() => {
				if (field === "accepted")
					updateField({ status: "accepted", declineNote: null });
				else
					updateField({ [field as string]: new Date().toISOString() })
			}}
			>
				{children}
			</ActionConfirmation>
		);
	}

	const cancelRef = useRef<HTMLButtonElement>(null);
	const [note, setNote] = useState<string>("");

	return (
		<Dialog.Root role="alertdialog" initialFocusEl={() => cancelRef.current}>
			<Dialog.Trigger asChild>{children}</Dialog.Trigger>
			<Portal>
				<Dialog.Positioner>
					<Dialog.Backdrop />
					<Dialog.Content>
						<Dialog.Header fontSize={"lg"} fontWeight="bold">
							<Dialog.Title>Decline Shift Assignment</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							<form  onSubmit={() => updateField({ status: "declined", declineNote: note })}>
								<Field.Root>
									<Field.HelperText>Provide a short note for declining</Field.HelperText>
									<Input
									type="text"
									placeholder="100 or less characters"
									max={100}
									value={note}
									onChange={(e) => setNote(e.target.value.trimStart())}
									required autoFocus
									/>
								</Field.Root>
								<Button
								type="submit"
								colorPalette={"teal"}
								textTransform={"uppercase"}
								>
									Submit
								</Button>
							</form>
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.CloseTrigger asChild>
								<Button variant={"outline"} ref={cancelRef}>Cancel</Button>
							</Dialog.CloseTrigger>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
};