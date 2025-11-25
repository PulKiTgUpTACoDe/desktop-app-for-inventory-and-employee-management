import { ipcMain } from 'electron';

import puppeteer from 'puppeteer';
import { app } from 'electron';
import path from 'path';
import prisma from "../../src/lib/prisma.js";

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const generateInvoicePDF = async (invoiceId: string): Promise<{ filePath: string }> => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        salesOrder: {
          include: {
            vendor: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
        },
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const subtotal = invoice.salesOrder.items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0
    );
    const paidAmount = invoice.payments?.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    ) || 0;
    const balance = Number(invoice.totalAmount) - paidAmount;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      line-height: 1.6;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }
    
    .company-info h1 {
      color: #2563eb;
      font-size: 28px;
      margin-bottom: 5px;
    }
    
    .company-info p {
      color: #666;
      font-size: 14px;
    }
    
    .invoice-info {
      text-align: right;
    }
    
    .invoice-number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }
    
    .invoice-meta {
      font-size: 14px;
      color: #666;
    }
    
    .billing-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    
    .bill-to, .invoice-details {
      flex: 1;
    }
    
    .section-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      font-size: 16px;
    }
    
    .info-text {
      color: #666;
      font-size: 14px;
      margin-bottom: 5px;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    .items-table th {
      background-color: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #dee2e6;
    }
    
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }
    
    .items-table .text-right {
      text-align: right;
    }
    
    .summary {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }
    
    .summary-table {
      width: 300px;
    }
    
    .summary-table td {
      padding: 8px;
      font-size: 14px;
    }
    
    .summary-table .total-row {
      font-weight: bold;
      font-size: 16px;
      border-top: 2px solid #dee2e6;
    }
    
    .payments-section {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    
    .payment-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background-color: #f8f9fa;
      margin-bottom: 10px;
      border-radius: 4px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .status-paid {
      background-color: #d4edda;
      color: #155724;
    }
    
    .status-pending {
      background-color: #fff3cd;
      color: #856404;
    }
    
    .status-overdue {
      background-color: #f8d7da;
      color: #721c24;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-info">
        <h1>Swaraj Enterprises</h1>
        <p>Bharti Nagar, nupur gali, Mira Road, Mumbai</p>
        <p>City, State - ZIP Code</p>
        <p>Phone: (123) 456-7890</p>
        <p>Email: info@yourbusiness.com</p>
      </div>
      <div class="invoice-info">
        <div class="invoice-number">INVOICE #${invoice.invoiceNumber}</div>
        <div class="invoice-meta">
          <div>Date: ${formatDate(invoice.invoiceDate)}</div>
          <div>Due Date: ${formatDate(invoice.dueDate)}</div>
          <div class="status-badge status-${invoice.status.toLowerCase()}">${invoice.status}</div>
        </div>
      </div>
    </div>

    <div class="billing-info">
      <div class="bill-to">
        <div class="section-title">Bill To:</div>
        <div class="info-text"><strong>${invoice.salesOrder.vendor.name}</strong></div>
        ${invoice.salesOrder.vendor.contactPerson ? `<div class="info-text">Attn: ${invoice.salesOrder.vendor.contactPerson}</div>` : ''}
        ${invoice.salesOrder.vendor.address ? `<div class="info-text">${invoice.salesOrder.vendor.address}</div>` : ''}
        ${invoice.salesOrder.vendor.email ? `<div class="info-text">${invoice.salesOrder.vendor.email}</div>` : ''}
        ${invoice.salesOrder.vendor.phone ? `<div class="info-text">${invoice.salesOrder.vendor.phone}</div>` : ''}
      </div>
      <div class="invoice-details">
        <div class="section-title">Order Details:</div>
        <div class="info-text">Order #: ${invoice.salesOrder.orderNumber}</div>
        <div class="info-text">Invoice Date: ${formatDate(invoice.invoiceDate)}</div>
        <div class="info-text">Payment Terms: Net 30</div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th class="text-right">Quantity</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.salesOrder.items.map(item => `
          <tr>
            <td>${item.product.name}</td>
            <td>${item.product.sku}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">₹${Number(item.unitPrice).toFixed(2)}</td>
            <td class="text-right">₹${Number(item.totalPrice).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="summary">
      <table class="summary-table">
        <tr>
          <td>Subtotal:</td>
          <td class="text-right">₹${subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Tax (0%):</td>
          <td class="text-right">₹0.00</td>
        </tr>
        <tr class="total-row">
          <td>Total Amount:</td>
          <td class="text-right">₹${Number(invoice.totalAmount).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Paid Amount:</td>
          <td class="text-right">₹${paidAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td><strong>Balance Due:</strong></td>
          <td class="text-right"><strong>₹${balance.toFixed(2)}</strong></td>
        </tr>
      </table>
    </div>

    ${invoice.payments && invoice.payments.length > 0 ? `
    <div class="payments-section">
      <div class="section-title">Payment History:</div>
      ${invoice.payments.map(payment => `
        <div class="payment-item">
          <div>
            <strong>₹${Number(payment.amount).toFixed(2)}</strong> - ${payment.paymentMethod}
            <br><small>${formatDate(payment.paymentDate)}</small>
            ${payment.reference ? `<br><small>Ref: ${payment.reference}</small>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>This is a computer-generated invoice and does not require a signature.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set content and generate PDF
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Ensure downloads directory exists
    const downloadsDir = app.getPath('downloads');
    const fileName = `invoice_${invoice.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = path.join(downloadsDir, fileName);
    
    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    
    return { filePath };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};


export function pdfHandlers() {
  ipcMain.handle('generate-invoice-pdf', async (_, invoiceId: string) => {
    try {
      const result = await generateInvoicePDF(invoiceId);
      return { success: true, data: result };
    } catch (error) {
      console.error('PDF generation failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });
}
