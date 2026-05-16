import { jsPDF } from "jspdf";
import "jspdf-autotable";

export function generateBudgetPDF(order: any) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const refNumber = order.order_number.replace("ORD-", "PRE-");
  const expirationDate = new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("PescaShop", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("Artículos de Pesca y Aventura", 14, 25);
  doc.text("Av. Costanera 1234", 14, 30);
  doc.text("Email: ventas@pescashop.com", 14, 34);
  doc.text("Teléfono: +54 (11) 5555-0199", 14, 38);

  // Right side: Document Title
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(140, 12, 56, 10, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("PRESUPUESTO", 152, 18.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`#${refNumber}`, 148, 28);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Fecha Emisión: ${new Date(order.created_at).toLocaleDateString("es-AR")}`, 140, 34);
  doc.setTextColor(225, 29, 72); // rose-600
  doc.text(`Vence: ${expirationDate.toLocaleDateString("es-AR")}`, 140, 39);

  // Divider
  doc.setDrawColor(241, 245, 249); // slate-100
  doc.setLineWidth(0.5);
  doc.line(14, 45, 196, 45);

  // Customer Info Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(14, 50, 182, 24, "F");
  doc.setDrawColor(241, 245, 249);
  doc.rect(14, 50, 182, 24, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Cliente", 18, 56);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(order.shipping_name || (order.profiles as any)?.full_name || "Cliente Web", 18, 62);
  doc.setTextColor(100, 116, 139);
  doc.text(order.shipping_email || "Sin email registrado", 18, 67);
  if (order.shipping_phone) {
    doc.text(order.shipping_phone, 18, 71);
  }

  // Items Table
  const tableHeaders = [["Producto", "Cantidad", "Precio Unit.", "Total"]];
  const tableBody = order.order_items.map((item: any) => [
    item.product_name + (item.sku ? `\nSKU: ${item.sku}` : ""),
    item.quantity.toString(),
    `$${item.unit_price.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
    `$${item.subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
  ]);

  (doc as any).autoTable({
    startY: 80,
    head: tableHeaders,
    body: tableBody,
    theme: "striped",
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [71, 85, 105],
      fontSize: 8.5,
      fontStyle: "bold",
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: "auto", halign: "left" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 4,
    },
    didParseCell: function (data: any) {
      if (data.section === "head" && data.column.index === 1) {
        data.cell.styles.halign = "center";
      }
      if (data.section === "head" && data.column.index >= 2) {
        data.cell.styles.halign = "right";
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 80;

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("TOTAL COTIZADO:", 120, finalY + 12);

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  const totalStr = `$${order.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
  doc.text(totalStr, 196 - doc.getTextWidth(totalStr), finalY + 12);

  // Terms and conditions
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(14, finalY + 22, 196, finalY + 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Condiciones Generales", 14, finalY + 28);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("• Precios sujetos a variaciones sin previo aviso tras el vencimiento.", 14, finalY + 33);
  doc.text("• Para confirmar el pedido, por favor comuníquese por teléfono o correo electrónico.", 14, finalY + 37);
  doc.text("• El retiro o envío de mercadería está sujeto a disponibilidad de stock.", 14, finalY + 41);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("Gracias por su preferencia", 196 - doc.getTextWidth("Gracias por su preferencia"), finalY + 33);
  doc.setFont("helvetica", "normal");
  doc.text("PescaShop - Acompañamos tu pasión.", 196 - doc.getTextWidth("PescaShop - Acompañamos tu pasión."), finalY + 38);

  // Save the PDF
  doc.save(`Presupuesto-${refNumber}.pdf`);
}
