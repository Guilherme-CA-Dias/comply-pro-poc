export const DEFAULT_SCHEMAS = {
	files: {
		properties: {
			id: { type: "string", title: "ID" },
			name: { type: "string", title: "Name" },
			email: { type: "string", title: "Email", format: "email" },
			phone: { type: "string", title: "Phone Number", format: "phone" },
			status: {
				type: "string",
				title: "Status",
				enum: ["Active", "Inactive", "Pending"],
				default: "Active",
			},
		},
		required: ["id", "name", "email"],
	},
	companies: {
		properties: {
			id: { type: "string", title: "ID" },
			name: { type: "string", title: "Company Name" },
			website: { type: "string", title: "Website", format: "uri" },
			industry: {
				type: "string",
				title: "Industry",
				enum: [
					"Technology",
					"Healthcare",
					"Finance",
					"Manufacturing",
					"Retail",
					"Other",
				],
			},
			size: {
				type: "string",
				title: "Company Size",
				enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
			},
		},
		required: ["id", "name"],
	},
	tasks: {
		properties: {
			id: { type: "string", title: "ID" },
			name: { type: "string", title: "Name" },
			taskName: { type: "string", title: "Task Name" },
			description: { type: "string", title: "Description" },
			status: {
				type: "string",
				title: "Status",
				enum: ["Not Started", "In Progress", "Completed", "Deferred"],
			},
			priority: {
				type: "string",
				title: "Priority",
				enum: ["Low", "Medium", "High", "Urgent"],
			},
			dueDate: { type: "string", title: "Due Date", format: "date" },
			assignedTo: { type: "string", title: "Assigned To" },
		},
		required: ["id", "name", "taskName"],
	},
	folders: {
		properties: {
			id: { type: "string", title: "ID" },
			name: { type: "string", title: "Name" },
			email: { type: "string", title: "Email", format: "email" },
			phone: { type: "string", title: "Phone Number", format: "phone" },
			status: {
				type: "string",
				title: "Status",
				enum: ["Active", "Inactive", "Pending"],
			},
		},
	},
} as const;

export type DefaultFormType = keyof typeof DEFAULT_SCHEMAS;
