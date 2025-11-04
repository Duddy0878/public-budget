const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [categories] = await db.query("SELECT * FROM categories");
        res.json(categories);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
})

router.get('/statistics', async (req, res) => {
  const {  type, period,wallet_id} = req.query;
  try {
    // validate inputs
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: "Invalid type parameter" });
    }
    if (!['week', 'month', 'year', 'none'].includes(period)) {
      return res.status(400).json({ error: "Invalid period parameter" });
    }

    // build start date
    let startDate = null;
    if (period !== 'none') {
      startDate = new Date();
      if (period === 'week') {
        startDate.setDate(startDate.getDate() - startDate.getDay());
      } else if (period === 'month') {
        startDate.setDate(1);
      } else if (period === 'year') {
        startDate.setMonth(0, 1);
      }
      startDate = startDate.toISOString().split('T')[0];
    }

    const [rows] = await db.query(
      `
      SELECT c.name AS category, COALESCE(SUM(amount), 0) AS total
      FROM categories c
      LEFT JOIN transactions t 
        ON t.category_id = c.id
        AND (? IS NULL OR t.wallet_id = ?)
        AND (? = 'all' OR t.type = ?)
        AND (? IS NULL OR t.date >= ?)
      GROUP BY c.id, c.name
      HAVING total > 0
      ORDER BY total DESC

      `,
      [
        wallet_id ? parseInt(wallet_id) : null, wallet_id ? parseInt(wallet_id) : null,
        type, type,
        startDate, startDate
      ]
    );

    res.json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
})

router.post('/', async (req, res) => {
    
    const { name } = req.body;

    try {
        const [result] = await db.execute(
            `INSERT INTO categories(name)
             VALUES (?)`,
            [name]
        );
        res.status(201).json({ id: result.insertId, name });
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
        `UPDATE categories
        SET name = ?
        WHERE id = ?`,
        [name, id]
        );

        if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Category not found' });
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

        const [result] = await db.execute(
        `DELETE FROM categories
        WHERE id = ?`,
        [id]
        );

        if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'category not found' });
        }

        return res.status(200).json({
            id,
            affectedRows: result.affectedRows,
            changedRows: result.changedRows
        });

    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error k" });
    }

})

module.exports = router;
