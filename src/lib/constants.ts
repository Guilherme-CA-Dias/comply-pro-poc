export const RECORD_ACTIONS = [
	{
		key: "get-orders",
		name: "Orders",
		type: "default",
	},
] as const;

export type RecordActionKey = (typeof RECORD_ACTIONS)[number]["key"] | string;
