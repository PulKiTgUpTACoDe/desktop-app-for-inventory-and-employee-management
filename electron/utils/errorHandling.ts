import { Prisma } from '@prisma/client'

export type DeleteErrorResponse = { success: false; error: string; code?: string };

export function formatPrismaDeleteError(entity: string, err: string): DeleteErrorResponse {

  const error = err as any

  const isFK = err.toLowerCase().includes("foreign key constraint")

  // If not FK, return generic error
  if (!isFK) {
    return {
      success: false,
      error: error?.message ?? String(error),
    };
  }

  // Entity-specific guidance
  const guidanceByEntity: Record<string, string> = {
    employee:
      'Cannot delete employee because payrolls reference it. Delete related payrolls first.',
    payroll:
      'Cannot delete payroll because a payslip references it. Delete the payslip first.',
    product:
      'Cannot delete product because order items or stock reference it. Delete related purchase/sales order items and stock first.',
    productCategory:
      'Cannot delete category because products reference it. Delete or reassign those products first.',
    productBrand:
      'Cannot delete brand because products reference it. Delete or reassign those products first.',
    supplier:
      'Cannot delete supplier because purchase orders reference it. Delete related purchase orders first.',
    vendor:
      'Cannot delete vendor because sales orders reference it. Delete related sales orders (and invoices/payments) first.',
    purchaseOrder:
      'Cannot delete purchase order because it has line items. Delete the items first.',
    salesOrder:
      'Cannot delete sales order because it has invoices or line items. Delete its invoice(s) and items first.',
    invoice:
      'Cannot delete invoice because payments reference it. Delete related payments first.',
    payment:
      'Cannot delete payment due to a related constraint. Please remove dependent records first.',
  };

  const guidance =
    guidanceByEntity[entity] ??
    'Cannot delete due to related records. Remove dependent records first.';

  return { success: false, error: guidance, code: 'FK_CONSTRAINT' };
}
