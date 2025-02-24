// select.js
import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const billId = urlParams.get('billId');
if (!billId) {
  alert("No billId provided in URL.");
}

const userNameInput = document.getElementById('userName');
const itemsContainer = document.getElementById('itemsContainer');
const costBreakdownDiv = document.getElementById('costBreakdown');
const saveSelectionBtn = document.getElementById('saveSelectionBtn');

let billData = null;
let selectedItemIndices = new Set(); // which items this user selected

async function loadBill() {
  const docRef = doc(db, "bills", billId);
  // Real-time updates
  onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      billData = snapshot.data();
      renderItems(billData.items);
      computeCosts();
    } else {
      alert("Bill not found!");
    }
  });
}

function renderItems(items) {
  itemsContainer.innerHTML = '';
  items.forEach((item, idx) => {
    const div = document.createElement('div');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `item-${idx}`;
    checkbox.checked = selectedItemIndices.has(idx);

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedItemIndices.add(idx);
      } else {
        selectedItemIndices.delete(idx);
      }
      computeCosts();
    });

    const label = document.createElement('label');
    label.setAttribute('for', `item-${idx}`);
    label.textContent = `${item.name} - $${item.price.toFixed(2)}`;

    div.appendChild(checkbox);
    div.appendChild(label);
    itemsContainer.appendChild(div);
  });
}

// Basic cost computation: sum selected items, plus your share of tax/tip if you stored them
function computeCosts() {
  if (!billData || !billData.items) return;
  let subtotal = 0;
  selectedItemIndices.forEach((idx) => {
    subtotal += billData.items[idx].price;
  });
  
  // If you have tax, tip stored in doc, do a proportional split. For now, just show item total
  costBreakdownDiv.textContent = `Your total: $${subtotal.toFixed(2)}`;
}

saveSelectionBtn.addEventListener('click', async () => {
  const userName = userNameInput.value.trim();
  if (!userName) {
    alert("Please enter your name");
    return;
  }

  // Save selection in the bill doc
  // We can store an array of { userName, itemIndices: [..] }
  const docRef = doc(db, "bills", billId);

  const selection = {
    userName: userName,
    itemIndices: Array.from(selectedItemIndices)
  };

  // You could do a "selections" array in your doc
  try {
    await updateDoc(docRef, {
      selections: arrayUnion(selection)
    });
    alert("Selection saved!");
  } catch (err) {
    console.error(err);
    alert("Error saving selection");
  }
});

// Start
loadBill();
