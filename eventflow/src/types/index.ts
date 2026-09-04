export interface EventCardData {
  id: string;
  slug: string;
  title: string;
  city: string;
  venue: string;
  startsAt: string;
  coverImageUrl: string | null;
  fromPriceXof: number;
  category: string;
}

export interface TicketSelection {
  ticketTypeId: string;
  name: string;
  unitPriceXof: number;
  quantity: number;
  available: number;
}

export interface ScanFeedback {
  status: "SUCCESS" | "ERROR";
  holderName?: string;
  ticketTypeName?: string;
  errorReason?: string;
}
