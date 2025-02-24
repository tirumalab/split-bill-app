// parse.js
import { createWorker } from "https://cdn.jsdelivr.net/npm/tesseract.js@4.0.2/+esm";

const worker = await createWorker("eng");

async function parseReceipt(image) {
    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    const { data: { text } } = await worker.recognize(image);
    console.log(text);  // Check the extracted text
    
    await worker.terminate();
}
import { db } from "./firebase.js";  // ✅ Import `db` properly

console.log("Firebase DB imported successfully!", db); // Check if db is loaded
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

const parseBtn = document.getElementById('parseBtn');
const confirmBtn = document.getElementById('confirmBtn');
const itemsTable = document.getElementById('itemsTable');
const itemsBody = document.getElementById('itemsBody');
const ocrTextDiv = document.getElementById('ocrText');

let parsedItems = []; // array of { name: string, price: number }

// 1. Parse receipt on button click
parseBtn.addEventListener('click', async () => {
  const fileInput = document.getElementById('receiptImage');
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select an image first!");
    return;
  }

  // Initialize Tesseract.js worker
  const worker = createWorker();
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');

  // Recognize
  const { data: { text } } = await worker.recognize(file);
  await worker.terminate();

  // Display raw text
  ocrTextDiv.textContent = text;

  // Parse lines
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Basic regex to find lines with trailing price
  // e.g. "Wisconsin Cheese Curds 8.00" or "WI Alarmist $7.00"
  const itemRegex = /^(.*?)(\$?\d+(\.\d{1,2})?)$/;

  parsedItems = [];
  for (const line of lines) {
    const match = line.match(itemRegex);
    if (match) {
      let itemName = match[1].trim();
      let priceStr = match[2].replace('$', '').trim();
      let price = parseFloat(priceStr);

      // Filter out obviously incorrect lines (like "Subtotal", "Tax", etc.)
      // or handle them separately. For now, let's just store them too,
      // or we can skip them if they are exactly "Subtotal" or "Tax".
      if (itemName.toLowerCase().includes('subtotal') ||
          itemName.toLowerCase().includes('tax') ||
          itemName.toLowerCase().includes('tip')) {
        // We might store them in separate variables or skip them
        continue;
      }

      parsedItems.push({ name: itemName, price: price });
    }
  }

  // Show the items in a table for manual review/correction
  populateItemsTable(parsedItems);
});

function populateItemsTable(items) {
  // Clear the table
  itemsBody.innerHTML = '';
  itemsTable.style.display = 'table';

  items.forEach((item, idx) => {
    const row = document.createElement('tr');
    
    const nameTd = document.createElement('td');
    const nameInput = document.createElement('input');
    nameInput.value = item.name;
    nameTd.appendChild(nameInput);
    
    const priceTd = document.createElement('td');
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.step = '0.01';
    priceInput.value = item.price.toFixed(2);
    priceTd.appendChild(priceInput);
    
    row.appendChild(nameTd);
    row.appendChild(priceTd);
    itemsBody.appendChild(row);
  });

  confirmBtn.style.display = 'inline-block';
}

// 2. Confirm & Upload to Firebase
confirmBtn.addEventListener('click', async () => {
  // Re-read the table inputs in case user edited them
  const rows = itemsBody.querySelectorAll('tr');
  const finalItems = [];
  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const name = inputs[0].value.trim();
    const price = parseFloat(inputs[1].value.trim());
    finalItems.push({ name, price });
  });

  try {
    const docRef = await addDoc(collection(db, "bills"), {
      items: finalItems,
      createdAt: serverTimestamp()
    });
    const billId = docRef.id;

    // Generate link to select page
    const selectionLink = `${window.location.origin}/select.html?billId=${billId}`;
    document.getElementById('shareLink').textContent = `Share this link: ${selectionLink}`;
  } catch (err) {
    console.error("Error saving to Firestore", err);
    alert("Error saving data");
  }
});
