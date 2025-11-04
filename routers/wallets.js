const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [wallets] = await db.query("SELECT * FROM wallets");
        res.json(wallets);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
})

router.post('/', async (req, res) => {

        console.log(req.body);
    
    const { name, balance } = req.body;

    try {
        const [result] = await db.execute(
            `INSERT INTO wallets(name,balance)
             VALUES (?, ?)`,
            [name, balance]
        );
        res.status(201).json({ id: result.insertId, name, balance });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }

})

router.patch('/:id', async (req, res) => {

    const id = parseInt(req.params.id);
    const {name} = req.body;

    try {

        if (name === undefined) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const [result] = await db.execute(
        `UPDATE wallets
        SET name = ?
        WHERE id = ?`,
        [name, id]
        );

        if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Wallet not found' });
        }

        return res.status(200).json({
            id,
            name,
            affectedRows: result.affectedRows,
            changedRows: result.changedRows
        });

    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error k" });
    }

})

router.delete('/:id', async (req, res) => {

    const id = parseInt(req.params.id);

    try {

        await exchangeWallet(id);

        const [result] = await db.execute(
        `DELETE FROM wallets
        WHERE id = ?`,
        [id]
        );

        if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Wallet not found' });
        }

        return res.status(200).json({
            id,
            affectedRows: result.affectedRows,
            changedRows: result.changedRows
        });
        // return res.status(200).json({

        // });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error k" });
    }

})

module.exports = router;
