import { useQuery } from "@tanstack/react-query";

export interface TeamPaymentHistoryDataTable {
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

interface PaginatedTeamPaymentsResponse {
	data: TeamPaymentHistoryDataTable[];
	pagination: {
		page: number;
		pageSize: number;
		totalRecords: number;
		totalPages: number;
	};
}

export function useTeamPaymentsData(page: number, pageSize: number, search: string, ledaId?: string) {
	return useQuery<PaginatedTeamPaymentsResponse>({
		queryKey: ["team-payments-datatable", page, pageSize, search, ledaId],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				pageSize: pageSize.toString(),
				...(search && { search }),
				...(ledaId && { ledaId }),
			});

			const response = await fetch(`/api/maintenance/payment/teamPayment/datatable?${params}`, {
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch team payments");
			}

			return response.json();
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		placeholderData: (previousData) => previousData, // Keep previous data while fetching new
	});
}
