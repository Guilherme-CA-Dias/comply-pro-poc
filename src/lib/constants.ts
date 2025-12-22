export const RECORD_ACTIONS = [
	{
		key: "get-files",
		name: "Files",
		type: "default",
	},
	{
		key: "get-folders",
		name: "Folders",
		type: "default",
	},
] as const;

export type RecordActionKey = (typeof RECORD_ACTIONS)[number]["key"] | string;
