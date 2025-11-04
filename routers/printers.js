const express = require('express');
const PDFDocument = require('pdfmake');
const db = require('../db');

const router = express.Router();


async function getFilteredTransactions(filters = {}) {
  let query = `
    SELECT
      t.id,
      t.amount,
      t.date,
      t.type,
      t.description,
      w.name as wallet_name,
      c.name as category_name
    FROM transactions t
    LEFT JOIN wallets w ON t.wallet_id = w.id
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.category_id && filters.category_id !== 'none') {
    query += ' AND t.category_id = ?';
    params.push(parseInt(filters.category_id));
  }

  if (filters.wallet_id && filters.wallet_id !== 'none') {
    query += ' AND t.wallet_id = ?';
    params.push(parseInt(filters.wallet_id));
  }

  if (filters.type && filters.type !== 'none') {
    query += ' AND t.type = ?';
    params.push(filters.type);
  }

  if (filters.month && filters.month !== 'none') {
    query += ' AND MONTH(t.date) = ?';
    params.push(parseInt(filters.month));
  }

  query += ' ORDER BY t.date DESC';

  const [transactions] = await db.execute(query, params);
  return transactions;
}

function formatMoney(value, locale = 'en-US', currency = 'USD'){
    const number = parseFloat(value)

    const formatter = new Intl.NumberFormat(locale, {
     style: 'currency',
    currency: currency,
  });

    return formatter.format(number);
}

const fonts = {
  Roboto: {
    normal: "pdf/roboto/static/Roboto-Regular.ttf",
    bold: "pdf/roboto/static/Roboto-Medium.ttf",
    italics: "pdf/roboto/static/Roboto-Italic.ttf",
    bolditalics: "pdf/roboto/static/Roboto-MediumItalic.ttf",
  },
  DM: {
    normal: "pdf/DM_serif_Display/DMSerifDisplay-Regular.ttf",
    bold: "pdf/DM_serif_Display/DMSerifDisplay-Regular.ttf",
    italics: "pdf/DM_serif_Display/DMSerifDisplay-Italic.ttf",
    bolditalics: "pdf/DM_serif_Display/DMSerifDisplay-Regular.ttf",
  }
};

const printer = new PDFDocument(fonts);

router.get("/pdf", async (req, res) => {
  try {
    const filters = req.query;
    const transactions = await getFilteredTransactions(filters);

    const monthName =
      filters.month && filters.month !== "none"
        ? new Date(0, parseInt(filters.month) - 1).toLocaleString("default", {
            month: "long",
          })
        : "All Months";

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const total = income - expense;

    // Build table body dynamically
    const tableBody = [
      [
        { text: "Date", style: "tableHeader" },
        { text: "Type", style: "tableHeader" },
        { text: "Amount", style: "tableHeader" },
        { text: "Wallet", style: "tableHeader" },
        { text: "Category", style: "tableHeader" },
        { text: "Description", style: "tableHeader" },
      ],
      ...transactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        formatMoney(t.amount),
        t.wallet_name || "N/A",
        t.category_name || "N/A",
        t.description || "",
      ]),
    ];

    const docDefinition = {
      content: [
        { text: `${monthName} Transactions Report`, style: "header" },
        {
          text: `Generated: ${new Date().toLocaleDateString()}`,
          style: "subheader",
        },
        { text: "Summary", style: "sectionHeader" },
        {
          ul: [
            `Total Income: ${formatMoney(income)}`,
            `Total Expenses: ${formatMoney(expense)}`,
            `Net Total: ${formatMoney(total)}`,
          ],
        },
        { text: "Transactions", style: "sectionHeader", margin: [0, 15, 0, 5] },
        transactions.length > 0
          ? {
              table: {
                headerRows: 1,
                widths: ["auto", "auto", "auto", "*", "*", "*"],
                body: tableBody,
              },
              layout: {
                fillColor: (rowIndex) =>
                  rowIndex === 0
                    ? "#e0e0e0" // header
                    : rowIndex % 2 === 0
                    ? null
                    : "#f5f5f5", // zebra striping
                    vLineWidth: () => {return 0},
              },
            }
          : { text: "No transactions found for the selected filters." },
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: "center", margin: [0, 0, 0, 10] },
        subheader: { fontSize: 10, alignment: "center", margin: [0, 0, 0, 20] },
        sectionHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        tableHeader: { bold: true, fillColor: "#eeeeee" },
      },
      defaultStyle: {
        font: "Roboto",
        fontSize: 10,
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const filename = `transactions-report-${monthName}.pdf`;

    // Allow client to choose whether to download or view inline.
    // Use ?download=true to force attachment; otherwise default to inline.
    const download = String(req.query.download).toLowerCase() === 'true';

    res.setHeader('Content-Type', 'application/pdf');
    if (download) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
      // Inline display in browser PDF viewer when possible
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    }

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate PDF report" });
  }
});

router.get('/', (req, res) => {
  // Reconstruct query string to forward filters and download option
  const qs = Object.keys(req.query)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(req.query[k])}`)
    .join('&');

  // Build URL that points to the mounted /pdf endpoint for this router
  const pdfUrl = `${req.baseUrl}/pdf?${qs}`; // e.g. '/printers/pdf?...'

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>View Transactions PDF</title>
      <style>body,html{height:100%;margin:0}iframe{border:0;width:100%;height:100vh}</style>
    </head>
    <body>
      <iframe id="pdfFrame" src="${pdfUrl}"></iframe>
      <script>
        // Try to auto-print after iframe loads. Note: many browsers block automatic print without user gesture.
        const iframe = document.getElementById('pdfFrame');
        iframe.addEventListener('load', function() {
          try {
            // attempt to call print on the iframe contentWindow
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          } catch (e) {
            // fallback: open the PDF in a new tab so user can print/download manually
            console.warn('Auto-print failed, opening PDF in new tab', e);
            window.open('${pdfUrl}', '_blank');
          }
        });
      </script>
    </body>
  </html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});
module.exports = router;


