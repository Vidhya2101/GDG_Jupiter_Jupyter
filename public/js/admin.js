document.addEventListener('DOMContentLoaded', () => {
    const budgetForm = document.getElementById('budget-form');
    const transactionForm = document.getElementById('transaction-form');

    // Handle budget creation
    budgetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            to: document.getElementById('budget-to').value,
            amount: document.getElementById('budget-amount').value,
            description: document.getElementById('budget-desc').value,
        };

        const response = await fetch('/api/budget', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert('Budget created successfully!');
            budgetForm.reset();
        } else {
            alert('Error creating budget. Check console.');
            console.error(await response.json());
        }
    });

    // Handle new transaction
    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            from: document.getElementById('txn-from').value,
            to: document.getElementById('txn-to').value,
            amount: document.getElementById('txn-amount').value,
            description: document.getElementById('txn-desc').value,
        };

        const response = await fetch('/api/transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert('Transaction added successfully!');
            transactionForm.reset();
        } else {
            alert('Error adding transaction. Check console.');
            console.error(await response.json());
        }
    });
});