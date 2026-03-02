import { Button, Field, Flex, Input, Stack, Textarea } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { isBefore, setHours, startOfTomorrow } from "date-fns";
import DatePicker from "react-datepicker";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

import type { ShiftData } from "@/@types/shift";
import type { HTTPOkResponse } from "@/@types";
import { useSession } from "@/components/accessories/session";
import { handleRequestError } from "@/utils/handlers";
import { axiosClient, includeToken, toast } from "@/utils";
import { schema, type SchemaType } from "./schema";


interface CustomInputProps extends React.ComponentProps<typeof Input> {
	ref?: React.Ref<HTMLInputElement>;
}

const CustomDateInput: React.FC<CustomInputProps> = ({ ref, ...props }) => {
	return <Input ref={ref} {...props} />;
};

const Form: React.FC<{ shift?: Partial<ShiftData> }> = ({ shift = {} }) => {
	const tomorrow = startOfTomorrow();
	const { id, start, end, ...rest } = shift;

	type ShiftInterval = Record<"start" | "end", Date | null>;
	const [shiftInterval, setShiftInterval] = useState<ShiftInterval>({ start: tomorrow, end: setHours(tomorrow, 2) });
	const [scheduledShift, setScheduledShift] = useState<ShiftData | null>(null);
	const { token } = useSession();
	const navigate = useNavigate();

const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SchemaType>({
		resolver: zodResolver(schema),
		defaultValues: {
			...rest,
			start: start ? new Date(start) : undefined,
			end: end ? new Date(end) : undefined,
		},
	});

	const onSubmit = async (formData: SchemaType) => {
		try {
			const config = includeToken(token!);
			if (!id) {
				const { data } = await axiosClient.post<HTTPOkResponse<ShiftData>>("/shifts", formData, config);
				toast.success("Shift created successfully. You may schedule another, or click button below to view shift.");
				setScheduledShift(data.data);
				reset();
			}
			else {
				await axiosClient.put(`/shifts/${id}`, formData, config);
				toast.success("Shift updated successfully");
				navigate(`/admin/shifts/${id}`);
			}
		} catch (error) {
			handleRequestError(error);
		}
	};

	const onDateChange = (range: Partial<ShiftInterval>, onChange: (date: Date | null) => void) => {
		if ("start" in range) {
			const start = range.start!;
			const end = start && (!shiftInterval.end || !isBefore(start, shiftInterval.end)) ? setHours(start, 2) : shiftInterval.end;
			setShiftInterval({ start, end });
			onChange(start);
		}
		else {
			const end = range.end!;
			const start = end && (!shiftInterval.start || isBefore(end, shiftInterval.start)) ? setHours(end, -2) : shiftInterval.start;
			setShiftInterval({ start, end });
			onChange(end);
		}
		/*
		const date = range.start || range.end || null;
		onChange(date);
		const start = range.start || shiftInterval.start;
		const end = range.end || shiftInterval.end;
		setShiftInterval({
			start: range.end && isBefore(range.end, start!) ? setHours(range.end, -2) : start,
			end: range.start && !isBefore(range.start, end!) ? setHours(range.start, 2) : end
		});
		*/
	};

				return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate>
			<Flex direction={"column"} flex={1} gap={4}>
			<Stack direction={{ base: "column", md: "row" }} gap={4}>
					<Field.Root invalid={!!errors.title}>
						<Field.Label htmlFor="title">Title</Field.Label>
						<Input required
						id="title"
						type="text"
						placeholder="Enter shift title"
						{...register("title")}
						/>
						<Field.ErrorText>{errors.title?.message}</Field.ErrorText>
					</Field.Root>

					<Field.Root invalid={!!errors.location}>
						<Field.Label htmlFor="location">Location</Field.Label>
						<Input required
						id="location"
						type="text"
						placeholder="Enter shift location"
						{...register("location")}
						/>
						<Field.ErrorText>{errors.location?.message}</Field.ErrorText>
					</Field.Root>
				</Stack>

				<Stack direction={{ base: "column", md: "row" }} gap={4}>
					<Field.Root invalid={!!errors.start}>
						<Field.Label htmlFor="start">Start Time</Field.Label>
						<Controller
						control={control}
						name="start"
						render={({ field: { onChange, ref } }) => (
							<DatePicker required
							id="start"
							placeholderText="Select start time"
							minDate={tomorrow}
							selected={shiftInterval.start}
							timeInputLabel="Start time:"
							dateFormat="yyyy-MM-dd hh:mm aa"
							showTimeSelect
							customInput={<CustomDateInput ref={ref} />}
							onChange={(start: Date | null) => onDateChange({ start }, onChange)}
							/>
						)}
						/>
						<Field.ErrorText>{errors.start?.message}</Field.ErrorText>
					</Field.Root>

					<Field.Root invalid={!!errors.end}>
						<Field.Label htmlFor="end">End Time</Field.Label>
						<Controller
						control={control}
						name="end"
						render={({ field: { onChange, ref } }) => (
							<DatePicker required
							id="end"
							placeholderText="Select end time"
							minDate={tomorrow}
							selected={shiftInterval.end}
							timeInputLabel="End time:"
							dateFormat="yyyy-MM-dd hh:mm aa"
							showTimeSelect
							onChange={(end: Date | null) => onDateChange({ end }, onChange)}
							customInput={<CustomDateInput ref={ref} />}
							/>
						)}
						/>
						<Field.ErrorText>{errors.end?.message}</Field.ErrorText>
					</Field.Root>
				</Stack>

				<Stack direction={{ base: "column", md: "row" }} gap={4}>
					<Field.Root invalid={!!errors.break}>
						<Field.Label htmlFor="break">Break (optional)</Field.Label>
						<Input
						id="break"
						type="number"
						min={0}
						placeholder="Enter shift break in minutes"
						{...register("break", { valueAsNumber: true })}
						/>
						<Field.ErrorText>{errors.break?.message}</Field.ErrorText>
					</Field.Root>

					<Field.Root invalid={!!errors.remark}>
						<Field.Label htmlFor="remark">Remark (optional)</Field.Label>
						<Textarea
						id="remark"
						{...register("remark")}
						/>
					</Field.Root>
				</Stack>


				<Stack direction={{ base: "column", md: "row" }} gap={4}>
					<Button
					type="submit"
					loading={isSubmitting}
					colorPalette={"teal"}
					textTransform={"uppercase"}
					alignSelf={"center"}
					>
						{id? "Update": "Create"}
					</Button>

					{scheduledShift ? (
						<Button
						type="button"
						colorPalette={"blue"}
						textTransform={"uppercase"}
						onClick={() => navigate(`/admin/shifts/${scheduledShift.id}`)}
						>
							View Scheduled Shift
						</Button>
					) : (
						<Button
						type="button"
						colorPalette={"red"}
						textTransform={"uppercase"}
						onClick={() => navigate(-1)}
						>
							Cancel
						</Button>
					)}
				</Stack>
			</Flex>
		</form>
	);
};

export default Form; 