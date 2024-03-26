export interface ITransaction {
  id: number;
  amount: number;
  category: string;
  note: string;
  date: string;
  paymentMethod: string;
  paidBy: string;
  type: string;
  isDeleted: boolean;
  icon?: string;
}
