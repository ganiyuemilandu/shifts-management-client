import { Button, Field, Flex, Input, Stack, Textarea } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { addHours, addMinutes, differenceInMinutes, startOfTomorrow, subHours } from "date-fns";
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
	const hourInterval = 5;
	const { id, start, end, ...rest } = shift;

		const [scheduledShift, setScheduledShift] = useState<ShiftData | null>(null);
	const { token } = useSession();
	const navigate = useNavigate();

const { control, register, handleSubmit, reset, getValues, setValue, formState: { errors, isSubmitting } } = useForm<SchemaType>({
		resolver: zodResolver(schema),
		defaultValues: {
			...rest,
			start: start ? new Date(start) : tomorrow,
			end: end ? new Date(end) : addHours(tomorrow, hourInterval)
		},
	});

	const onSubmit = async (formData: SchemaType) => {
		try {
			const config = includeToken(token!);
			if (!id) {
				const { data } = await axiosClient.post<HTTPOkResponse<ShiftData>>("/shifts", formData, config);
				toast.success("Shift created successfully. You may schedule another, or click button below to view shift.");
				setScheduledShift(data.data);
				const [start, end, location] = getValues(["start", "end", "location"]);
				reset({
					title: "",
					break: "",
					remark: "",
					location: location,
					start: end,
					end: addMinutes(end, differenceInMinutes(end, start))
				});
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

	const handleStartChange = (start: Date | null, onChange: (date: Date | null) => void) => {
		onChange(start);
		const end = getValues("end");
		if (start && end && start >= end)
			setValue("end", addHours(start, hourInterval), { shouldValidate: true });
	};

	const handleEndChange = (end: Date | null, onChange: (date: Date | null) => void) => {
		onChange(end);
		const start = getValues("start");
		if (end && start && end <= start)
			setValue("start", subHours(end, hourInterval), { shouldValidate: true });
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
						render={({ field: { onChange, value, ...fieldProps } }) => (
							<DatePicker required
							{...fieldProps}
							id="start"
							placeholderText="Select start time"
							minDate={tomorrow}
							selected={value}
							timeInputLabel="Start time:"
							dateFormat="yyyy-MM-dd hh:mm aa"
							showTimeSelect
							onChange={(date: Date | null) => handleStartChange(date, onChange)}
							customInput={<CustomDateInput ref={fieldProps.ref} />}
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
						render={({ field: { onChange, value, ...fieldProps } }) => (
							<DatePicker required
							{...fieldProps}
							id="end"
							placeholderText="Select end time"
							minDate={tomorrow}
							selected={value}
							timeInputLabel="End time:"
							dateFormat="yyyy-MM-dd hh:mm aa"
							showTimeSelect
							onChange={(date: Date | null) => handleEndChange(date, onChange)}
							customInput={<CustomDateInput ref={fieldProps.ref} />}
							/>
						)}
						/>
						<Field.ErrorText>{errors.end?.message}</Field.ErrorText>
					</Field.Root>
				</Stack>

				<Stack direction={{ base: "column", md: "row" }} gap={4}>
					<Field.Root invalid={!!errors.break}>
						<Field.Label htmlFor="break">Break minutes (optional)</Field.Label>
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
						<Field.Label htmlFor="remark">Remark</Field.Label>
						<Textarea
						id="remark"
						required
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