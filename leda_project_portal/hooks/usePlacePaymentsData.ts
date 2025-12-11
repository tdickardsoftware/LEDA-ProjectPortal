import { useQuery } from "@tanstack/react-query";

export interface PlacePaymentHistoryDataTable {
	paymentNbr: number;
	ledaId: number;
	fullName: string;
	amount: string;
	date: string;
	type: string;
	seasonCode: string;
	paymentType: string;
	fiscalYear: string;
	comp: boolean;
	paidOff: boolean;
	notes: string;
	[key: string]: unknown;
}

interface PaginatedPlacePaymentsResponse {
	data: PlacePaymentHistoryDataTable[];
	pagination: {
		page: number;
		pageSize: number;
		totalRecords: number;
		totalPages: number;
	};
}

export function usePlacePaymentsData(page: number, pageSize: number, search: string, ledaId?: string) {
	return useQuery<PaginatedPlacePaymentsResponse>({
		queryKey: ["place-payments-datatable", page, pageSize, search, ledaId],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				pageSize: pageSize.toString(),
				...(search && { search }),
				...(ledaId && { ledaId }),
			});

			const response = await fetch(`/api/maintenance/payment/placePayment/datatable?${params}`, {
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch place payments");
			}

			return response.json();
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		placeholderData: (previousData) => previousData, // Keep previous data while fetching new
	});
}
