/**
 * Hook for fetching paginated player payment history records.
 * Supports search filtering and optional scoping by a specific player's LEDA ID.
 */
import { useQuery } from "@tanstack/react-query";

// Row shape returned by the player-payment datatable API
export interface PlayerPaymentHistoryDataTable {
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

interface PaginatedPlayerPaymentsResponse {
	data: PlayerPaymentHistoryDataTable[];
	pagination: {
		page: number;
		pageSize: number;
		totalRecords: number;
		totalPages: number;
	};
}

/**
 * Fetches a paginated list of player payment records.
 * Pass `ledaId` to scope results to a single player.
 */
export function usePlayerPaymentsData(page: number, pageSize: number, search: string, ledaId?: string) {
	return useQuery<PaginatedPlayerPaymentsResponse>({
		queryKey: ["player-payments-datatable", page, pageSize, search, ledaId],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				pageSize: pageSize.toString(),
				...(search && { search }),
				...(ledaId && { ledaId }),
			});

			const response = await fetch(`/api/maintenance/payment/playerPayment/datatable?${params}`, {
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch player payments");
			}

			return response.json();
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		placeholderData: (previousData) => previousData, // Keep previous data while fetching new
	});
}
