export default interface IShift {
	id: number;
	title: string;
	location: string;
	start: Date;
	end: Date;
	break: number;
	remark: string;
};


export type ShiftInput = Readonly<Omit<IShift, "id">>;

export type ShiftData = Readonly<{
	[K in keyof IShift]: IShift[K] extends Date? string: IShift[K]
}>;