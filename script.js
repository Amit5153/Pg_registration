document.addEventListener('DOMContentLoaded', function () {

    // Event listener for bill form submission
    const billForm = document.getElementById('billForm');
    if (billForm) {
        billForm.addEventListener('submit', generateBill);
    }

    // Event listener for guest registration form
    const guestForm = document.getElementById('registrationForm');
    if (guestForm) {
        guestForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent form submission

            const guest = {
                name: document.getElementById('name').value,
                mobile: document.getElementById('mobile').value,
                aadhar: document.getElementById('aadhar').value,
                advance: document.getElementById('advance').value,

            };

            const guests = JSON.parse(localStorage.getItem('guests')) || [];
            guests.push(guest);
            localStorage.setItem('guests', JSON.stringify(guests));

            displayGuests(); // Refresh the displayed list
        });
    }

    // Show the Guest Registration section by default
    showSection('guest-registration');

    // Add event listeners for the buttons to toggle sections
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function () {
            if (this.textContent.includes('Guest Registration')) {
                showSection('guest-registration');
            } else if (this.textContent.includes('Generate Bill')) {
                showSection('bill-generate');
            }
        });
    });
});

// Function to toggle sections (guest registration and bill generation)
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.toggle-section').forEach(section => {
        section.style.display = 'none';
    });

    // Show the selected section
    document.getElementById(sectionId).style.display = 'block';
}

function generateBill(event) {
    event.preventDefault();

    const guestName = document.getElementById('guestName').value;
    const roomNumber = document.getElementById('roomNumber').value;
    const electricBill = parseFloat(document.getElementById('electricBill').value);
    const roomRent = parseFloat(document.getElementById('roomRent').value);
    const utilities = parseFloat(document.getElementById('utilities').value);
    const total = electricBill + roomRent + utilities;

    const billDetails = `
        <h2>Monthly Bill</h2>
        <p>Name: ${guestName}</p>
        <p>Room Number: ${roomNumber}</p>
        <p>Electric Bill: ${electricBill.toFixed(2)}</p>
        <p>Room Rent: ₹${roomRent.toFixed(2)}</p>
        <p>Utilities: ₹${utilities.toFixed(2)}</p>
        <p><strong>Total: ₹${total.toFixed(2)}</strong></p>
    `;

    document.getElementById('billOutput').innerHTML = billDetails;

    // Add event listeners for download buttons
    document.getElementById('downloadPDF').onclick = () => downloadPDF(billDetails);
    document.getElementById('downloadCSV').onclick = () => downloadCSV(guestName, roomNumber, electricBill, roomRent, utilities, total);
}

function displayGuests() {
    const guestList = JSON.parse(localStorage.getItem('guests')) || [];
    const guestListDiv = document.getElementById('guestList');
    guestListDiv.innerHTML = ''; // Clear the previous entries

    guestList.forEach(guest => {
        const guestDiv = document.createElement('div');
        guestDiv.className = 'guest-item';
        guestDiv.textContent = `Name: ${guest.name}, Room: ${guest.room || 'N/A'}, Mobile: ${guest.mobile}, Aadhar Card: ${guest.aadhar}`;
        guestListDiv.appendChild(guestDiv);
    });
}




function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Extracting values from form inputs
    const guestName = document.getElementById('guestName').value;
    const roomNumber = document.getElementById('roomNumber').value;
    const electricBill = parseFloat(document.getElementById('electricBill').value);
    const roomRent = parseFloat(document.getElementById('roomRent').value);
    const utilities = parseFloat(document.getElementById('utilities').value);
    const total = electricBill + roomRent + utilities;

    // Add current date (DD/MM/YYYY)
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

    // Title styling - large font, centered
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('OM MENS PG MONTHLY BILL', 105, 20, null, null, 'center');
    doc.setFontSize(10);
    doc.text('(Original for Recipient)', 105, 26, null, null, 'center');

    // Add contact information
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Plot no 07, Panchayat Office Road, Perungudi, Chennai 600096', 105, 32, null, null, 'center');
    doc.text('Email: ommenspg@gmail.com', 105, 38, null, null, 'center');
    doc.text('Mobile: 9551002459, 8667668826, 8148516937', 105, 44, null, null, 'center');

    // Add date and invoice details
    doc.setFontSize(12);
    doc.text(`Invoice Date: ${formattedDate}`, 150, 50); // Right-aligned date
    doc.text(`Invoice Number: INV-${Date.now()}`, 20, 50); // Left-aligned invoice number

    // Section for guest details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Guest Name: ${guestName}`, 20, 60);
    doc.text(`Room Number: ${roomNumber}`, 20, 68);

    // Draw table lines for rows and columns (simulating table)
    doc.setLineWidth(0.5);

    // Headers for table
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 20, 80);
    doc.text('Unit Price', 100, 80);
    doc.text('Qty', 130, 80);
    doc.text('Net Amount', 150, 80);
    doc.text('Total', 180, 80);

    // Draw horizontal line below headers
    doc.line(20, 82, 200, 82);

    // Add rows (items in the bill)
    doc.setFont('helvetica', 'normal');
    doc.text('Electric Bill', 20, 90);
    doc.text(`₹${electricBill.toFixed(2)}`, 100, 90);
    doc.text('1', 130, 90);
    doc.text(`₹${electricBill.toFixed(2)}`, 150, 90);
    doc.text(`₹${electricBill.toFixed(2)}`, 180, 90);

    doc.text('Room Rent', 20, 100);
    doc.text(`₹${roomRent.toFixed(2)}`, 100, 100);
    doc.text('1', 130, 100);
    doc.text(`₹${roomRent.toFixed(2)}`, 150, 100);
    doc.text(`₹${roomRent.toFixed(2)}`, 180, 100);

    doc.text('Utilities', 20, 110);
    doc.text(`₹${utilities.toFixed(2)}`, 100, 110);
    doc.text('1', 130, 110);
    doc.text(`₹${utilities.toFixed(2)}`, 150, 110);
    doc.text(`₹${utilities.toFixed(2)}`, 180, 110);

    // Draw horizontal line before total
    doc.line(20, 115, 200, 115);

    // Total amount styling - bigger font for total
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ₹${total.toFixed(2)}`, 20, 130);

    // Footer: Digital Signature Placeholder
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.text('Authorized Signatory', 20, 150);

    // Add a line for the digital signature
    doc.line(20, 155, 80, 155);  // Signature line

    // Footer information
    doc.setFontSize(10);
    doc.text('Invoice generated for internal use', 20, 160);

    // Save the PDF with guest name as file name
    const pdfFileName = `${guestName}_Bill.pdf`;
    doc.save(pdfFileName);
}



function downloadCSV(name, room, electric, rent, utilities, total) {
    const csvContent = `data:text/csv;charset=utf-8,Name,Room Number,Electric Bill,Room Rent,Utilities,Total\n${name},${room},${electric},${rent},${utilities},${total}`;
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.setAttribute('href', encodedUri);
    a.setAttribute('download', 'bill.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
