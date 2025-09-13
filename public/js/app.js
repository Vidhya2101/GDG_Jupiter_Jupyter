document.addEventListener('DOMContentLoaded', async () => {
    const trailContainer = document.getElementById('transaction-trail');

    try {
        const response = await fetch('/api/transactions');
        const transactions = await response.json();

        trailContainer.innerHTML = ''; // Clear the "loading" message

        if (transactions.length === 0) {
            trailContainer.innerHTML = '<p>No transactions found.</p>';
            return;
        }

        transactions.forEach(txn => {
            const txnElement = document.createElement('div');
            txnElement.className = 'transaction-block';
            
            txnElement.innerHTML = `
                <div class="txn-header">
                    <p><strong>From:</strong> ${txn.from}</p>
                    <p><strong>To:</strong> ${txn.to}</p>
                </div>
                <div class="txn-body">
                    <p><strong>Amount:</strong> $${txn.amount.toLocaleString()}</p>
                    <p><strong>Description:</strong> ${txn.description}</p>
                </div>
                <div class="txn-footer">
                    <small>Hash: ${txn.currentHash.substring(0, 20)}...</small>
                    <small>Previous Hash: ${txn.previousHash.substring(0, 20)}...</small>
                </div>
            `;
            trailContainer.appendChild(txnElement);
        });

    } catch (error) {
        trailContainer.innerHTML = '<p>Error loading data. Is the server running?</p>';
        console.error('Failed to fetch transactions:', error);
    }
});