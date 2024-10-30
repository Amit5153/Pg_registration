document.addEventListener('DOMContentLoaded', function () {

    // Event listener for bill form submission
    const billForm = document.getElementById('billForm');
    if (billForm) {
        billForm.addEventListener('submit', generateBill);
    }

    // Event listener for guest registration form
    const guestForm = document.getElementById('guest-registration');
    if (guestForm) {
        guestForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent form submission

            const guest = {
                name: document.getElementById('name').value,
                mobile: document.getElementById('mobile').value,
                aadhar: document.getElementById('aadhar').value,
                room: document.getElementById('room').value,
                advance: document.getElementById('advance').value,
                checkin: document.getElementById('checkin').value,
                checkout: document.getElementById('checkout').value
                
            };

            const guests = JSON.parse(localStorage.getItem('guests')) || [];
            guests.push(guest);
            localStorage.setItem('guests', JSON.stringify(guests));

            displayGuests(); // Refresh the displayed list
            calculateTotalAdvance();
            document.getElementById('guestForm').reset(); // Reset the form
            
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
    // Display the list of guests
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

    // Getting values from input fields
    const guestName = document.getElementById('guestName').value;
    const roomNumber = document.getElementById('roomNumber').value;
    const electricBill = parseFloat(document.getElementById('electricBill').value) || 0;
    const roomRent = parseFloat(document.getElementById('roomRent').value) || 0;
    const advance = parseFloat(document.getElementById('advance').value) || 0;
    const utilities = parseFloat(document.getElementById('utilities').value) || 0;

    // Calculating the total (subtract advance as it's pre-paid)
    const total = (electricBill + roomRent + utilities) - advance;

    // Bill details to display
    const billDetails = `
        <h2>Monthly Bill</h2>
        <p>Name: ${guestName}</p>
        <p>Room Number: ${roomNumber}</p>
        <p>Electric Bill: ₹${electricBill.toFixed(2)}</p>
        <p>Room Rent: ₹${roomRent.toFixed(2)}</p>
        <p>Advance: ₹${advance.toFixed(2)}</p>
        <p>Utilities: ₹${utilities.toFixed(2)}</p>
        <p><strong>Total: ₹${total.toFixed(2)}</strong></p>
    `;

    // Display the bill details
    document.getElementById('billOutput').innerHTML = billDetails;

    // Attach event listeners for downloading the bill if the buttons exist
    const downloadPDFButton = document.getElementById('downloadPDF');
    const downloadCSVButton = document.getElementById('downloadCSV');

    if (downloadPDFButton) {
        downloadPDFButton.onclick = () => downloadPDF(billDetails);
    } else {
        console.error("Download PDF button not found!");
    }

    if (downloadCSVButton) {
        downloadCSVButton.onclick = () => downloadCSV(guestName, roomNumber, electricBill, roomRent, advance, utilities, total);
    } else {
        console.error("Download CSV button not found!");
    }
}

function displayGuests() {
    const guests = JSON.parse(localStorage.getItem('guests')) || [];
    const guestListDiv = document.getElementById('guestList');

    // Clear previous data to avoid duplication
    guestListDiv.innerHTML = '';

    if (guests.length === 0) {
        guestListDiv.innerHTML = '<p>No guests available.</p>';
        return;
    }

    // Create table for guest list
    const table = document.createElement('table');
    table.className = 'guest-table';
    table.innerHTML = `
        <tr>
            <th>Name</th>
            <th>Room</th>
            <th>Advance</th>
            <th>Mobile</th>
            <th>Aadhar Card</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Actions</th>
        </tr>
    `;

    // Populate the table with guest data
    guests.forEach((guest, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${guest.name}</td>
            <td>${guest.room || ''}</td>
            <td>₹${guest.advance}</td>
            <td>${guest.mobile}</td>
            <td>${guest.aadhar}</td>
            <td>${guest.checkin}</td>
            <td>${guest.checkout}</td>
            <td>
                <button onclick="editGuest(${index})">Edit</button>
                <button onclick="deleteGuest(${index})">Delete</button>
            </td>
        `;
        table.appendChild(row);
    });

    guestListDiv.appendChild(table);
}

// Attach displayGuests to the button's onclick event
document.getElementById('fetchButton').onclick = displayGuests;



function editGuest(index) {
    const guests = JSON.parse(localStorage.getItem('guests')) || [];
    const guest = guests[index];

    document.getElementById('name').value = guest.name;
    document.getElementById('mobile').value = guest.mobile;
    document.getElementById('aadhar').value = guest.aadhar;
    document.getElementById('advance').value = guest.advance;
    document.getElementById('checkin').value = guest.checkin;
    document.getElementById('checkout').value = guest.checkout;

    deleteGuest(index); // Remove the guest from the list before editing
}

function deleteGuest(index) {
    const guests = JSON.parse(localStorage.getItem('guests')) || [];
    guests.splice(index, 1);
    localStorage.setItem('guests', JSON.stringify(guests));

    displayGuests(); // Refresh the list
    calculateTotalAdvance(); // Update total advance
}

function calculateTotalAdvance() {
    const guests = JSON.parse(localStorage.getItem('guests')) || [];
    
    // Calculate total advance
    let totalAdvance = guests.reduce((sum, guest) => {
        return sum + (parseFloat(guest.advance) || 0); // Convert advance to number, default to 0 if NaN
    }, 0);
    
    // Ensure totalAdvance is a valid number before calling toFixed
    if (!isNaN(totalAdvance)) {
        document.getElementById('totalAdvance').textContent = `Total Advance: ₹${totalAdvance.toFixed(2)}`;
    } else {
        document.getElementById('totalAdvance').textContent = 'Total Advance: ₹0.00';
    }
}


function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background-color: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        padding: 20px;
        margin: 10px 0;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        opacity: 0.9;
        font-size: 18px;
        text-align: center;
        position: relative;
        width: 300px;
        height: 150px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    `;

    // Create rotating circle
    const rotatingCircle = document.createElement('div');
    rotatingCircle.style.cssText = `
        width: 50px;
        height: 50px;
        border: 5px solid white;
        border-top: 5px solid transparent;
        border-radius: 50%;
        animation: rotate 1.5s linear infinite;
        margin-bottom: 15px;
    `;

    // Append circle and message to toast
    toast.appendChild(rotatingCircle);
    const toastMessage = document.createElement('div');
    toastMessage.textContent = message;
    toast.appendChild(toastMessage);

    // Add toast to container
    toastContainer.appendChild(toast);

    // Automatically remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 500);
}

// Add rotating animation
const style = document.createElement('style');
style.textContent = `
    @keyframes rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

guestForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const guest = {
        name: document.getElementById('name').value,
        mobile: document.getElementById('mobile').value,
        aadhar: document.getElementById('aadhar').value,
        advance: parseFloat(document.getElementById('advance').value),
        checkin: document.getElementById('checkin').value,
        checkout: document.getElementById('checkout').value,
    };

    const guests = JSON.parse(localStorage.getItem('guests')) || [];
    guests.push(guest);
    localStorage.setItem('guests', JSON.stringify(guests));

    displayGuests(); // Refresh the displayed list
    calculateTotalAdvance(); // Update total advance

    showToast('Guest added successfully!', 'success'); // Show success toast
});
function editGuest(index) {
    const guests = JSON.parse(localStorage.getItem('guests')) || [];
    const guest = guests[index];

    document.getElementById('name').value = guest.name;
    document.getElementById('mobile').value = guest.mobile;
    document.getElementById('aadhar').value = guest.aadhar;
    document.getElementById('advance').value = guest.advance;
    document.getElementById('checkin').value = guest.checkin;
    document.getElementById('checkout').value = guest.checkout;

    deleteGuest(index); // Remove the guest from the list before editing
    showToast('Guest edited successfully!', 'success'); // Show success toast
}

function deleteGuest(index) {
    const guests = JSON.parse(localStorage.getItem('guests')) || [];
    guests.splice(index, 1);
    localStorage.setItem('guests', JSON.stringify(guests));

    displayGuests(); // Refresh the list
    calculateTotalAdvance(); // Update total advance

    showToast('Guest deleted successfully!', 'success'); // Show success toast
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const selectedMonth = document.getElementById('monthFilter').value;
    const selectedPG = document.getElementById('pg').value;

    // Table Title
    doc.setFontSize(18);
    doc.text("Expense Report", 14, 10);
    doc.setFontSize(12);
    doc.text(`For: ${selectedMonth} - ${selectedPG}`, 14, 15);
    
    // Table Headers
    const headers = ["PG", "Type", "Amount (₹)", "Date"];
    const data = expenses.filter(exp => exp.month === selectedMonth && exp.pg === selectedPG)
        .map(exp => [exp.pg, exp.type, exp.amount.toFixed(2), exp.date]);

    // Create Table
    const startY = 30; // Starting Y position for table
    const startX = 14; // Starting X position for table
    const columnWidths = [40, 40, 40, 40]; // Set column widths
    const rowHeight = 10;

    // Draw Header
    headers.forEach((header, index) => {
        doc.setFillColor(255, 99, 132); // Header background color
        doc.rect(startX + index * columnWidths[index], startY, columnWidths[index], rowHeight, 'F'); // Fill rectangle
        doc.setTextColor(255); // Set text color to white
        doc.text(header, startX + index * columnWidths[index] + 5, startY + 7); // Header text
    });

    // Draw Data Rows
    doc.setTextColor(0); // Reset text color to black
    data.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            doc.text(cell, startX + cellIndex * columnWidths[cellIndex], startY + (rowIndex + 1) * rowHeight);
            // Draw borders
            doc.rect(startX + cellIndex * columnWidths[cellIndex], startY + (rowIndex + 1) * rowHeight - rowHeight, columnWidths[cellIndex], rowHeight);
        });
    });

    // Draw the bottom border
    headers.forEach((_, index) => {
        doc.rect(startX + index * columnWidths[index], startY, columnWidths[index], (data.length + 1) * rowHeight);
    });

    // Save PDF
    doc.save(`${selectedMonth}-${selectedPG}-expenses.pdf`);
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
