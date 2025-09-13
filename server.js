// 1. Import necessary packages
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto-js');

// 2. Setup Express App
const app = express();
const PORT = 3000;

app.use(express.json()); // Parse JSON bodies
app.use(express.static('public')); // Serve static files from 'public'

// 3. Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/trustTrailDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));

// 4. Define Transaction Schema
const transactionSchema = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    previousHash: { type: String, required: true },
    currentHash: { type: String, required: true },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// 5. Helper function to calculate hash
const calculateHash = (from, to, amount, description, timestamp, previousHash) => {
    return crypto.SHA256(from + to + amount + description + timestamp + previousHash).toString();
};

// 6. API Endpoints

// GET all transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const chain = await Transaction.find().sort({ timestamp: 1 });
        res.json(chain);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions.', error: error.message });
    }
});

// POST a new transaction
app.post('/api/transaction', async (req, res) => {
    try {
        const { from, to, amount, description } = req.body;

        // Validate input
        if (!from || !to || !amount || !description) {
            return res.status(400).json({ message: 'All fields are required: from, to, amount, description.' });
        }

        const lastTransaction = await Transaction.findOne().sort({ timestamp: -1 });
        if (!lastTransaction) {
            return res.status(400).json({ message: 'No budget exists. Create a budget first.' });
        }

        const previousHash = lastTransaction.currentHash;
        const timestamp = new Date();
        const currentHash = calculateHash(from, to, amount, description, timestamp, previousHash);

        const newTransaction = new Transaction({
            from,
            to,
            amount,
            description,
            timestamp,
            previousHash,
            currentHash,
        });

        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(500).json({ message: 'Error creating transaction.', error: error.message });
    }
});

// POST: Create the first "Genesis" budget
app.post('/api/budget', async (req, res) => {
    try {
        const existing = await Transaction.findOne();
        if (existing) {
            return res.status(400).json({ message: 'Budget already exists.' });
        }

        const { to, amount, description } = req.body;

        if (!to || !amount || !description) {
            return res.status(400).json({ message: 'All fields are required: to, amount, description.' });
        }

        const from = "Institution Source";
        const previousHash = "0"; // Genesis block
        const timestamp = new Date();
        const currentHash = calculateHash(from, to, amount, description, timestamp, previousHash);

        const genesisBlock = new Transaction({
            from,
            to,
            amount,
            description,
            timestamp,
            previousHash,
            currentHash,
        });

        await genesisBlock.save();
        res.status(201).json(genesisBlock);
    } catch (error) {
        res.status(500).json({ message: 'Error creating budget.', error: error.message });
    }
});

// 7. Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
