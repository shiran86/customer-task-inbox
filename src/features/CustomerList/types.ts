import type { CustomerInbox } from '../../types/ui';

export interface CustomerListProps {
  customers: CustomerInbox[];
  selectedCustomerCode: string | null;
  onSelectCustomer: (customerCode: string) => void;
}

export interface CustomerRowProps {
  customer: CustomerInbox;
  isSelected: boolean;
  onSelect: (customerCode: string) => void;
}
