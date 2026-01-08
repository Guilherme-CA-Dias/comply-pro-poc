export const DEFAULT_SCHEMAS = {
	orders: {
		properties: {
			purchaseOrder: {
				type: "object",
				title: "Purchase Order",
				properties: {
					manufacturer: { type: "string", title: "Manufacturer" },
					supplier_alt_id: { type: "string", title: "Supplier Alt ID" },
					po_number: { type: "string", title: "PO Number" },
					po_date: { type: "string", title: "PO Date" },
					product_name: { type: "string", title: "Product Name" },
					sku: { type: "string", title: "SKU" },
					quantity: { type: "string", title: "Quantity" },
					Invoice_number: { type: "string", title: "Invoice Number" },
					carrier: { type: "string", title: "Carrier" },
					bill_of_lading: { type: "string", title: "Bill of Lading" },
					container: { type: "string", title: "Container" },
				},
				required: [
					"manufacturer",
					"supplier_alt_id",
					"po_number",
					"po_date",
					"product_name",
					"sku",
					"quantity",
				],
			},
		},
		required: ["purchaseOrder"],
	},
} as const;

export type DefaultFormType = keyof typeof DEFAULT_SCHEMAS;
