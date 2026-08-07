import jsPDF from "jspdf";


export function generateReceipt(customer){

    const doc = new jsPDF();


    doc.setFontSize(18);
    doc.text(
        "R DREAM INFRA DEVELOPERS",
        20,
        20
    );


    doc.setFontSize(14);

    doc.text(
        "Payment Receipt",
        20,
        35
    );


    doc.setFontSize(12);


    doc.text(
        `Customer Name : ${customer.name}`,
        20,
        55
    );


    doc.text(
        `Mobile : ${customer.mobile}`,
        20,
        70
    );


    doc.text(
        `Plot No : ${customer.plot_no}`,
        20,
        85
    );


    doc.text(
        `Plot Size : ${customer.size} Sq.Yds`,
        20,
        100
    );


    doc.text(
        `Total Amount : ₹${customer.total}`,
        20,
        115
    );


    doc.text(
        `Paid Amount : ₹${customer.paid}`,
        20,
        130
    );


    doc.text(
        `Balance Amount : ₹${customer.balance}`,
        20,
        145
    );


    doc.text(
        "Thank you for choosing R DREAM INFRA DEVELOPERS",
        20,
        170
    );


    doc.save(
        `Receipt_${customer.name}.pdf`
    );

}