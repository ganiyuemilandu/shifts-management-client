import { Button, Dialog, Portal } from "@chakra-ui/react";
import { useRef } from "react";


type DeleteConfirmationProps = {
	children: React.ReactElement,
	onConfirm: React.MouseEventHandler<HTMLButtonElement>,
	title?: string,
};


const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ children, onConfirm, title = "Delete Confirmation" }) => {
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

export default DeleteConfirmation;