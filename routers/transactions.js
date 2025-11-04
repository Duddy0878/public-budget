const express = require('express');
const db = require('../db');
const {updateWallet,recalculateBalance} = require('./functions');

const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const [transactions] = await db.query("SELECT * FROM transactions");
        res.json(transactions);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
})

router.get('/total', async (req, res) => {
    
    const {type, period, wallet_id} = req.query;

    try{
            if (!['income', 'expense', 'all'].includes(type)) {
              return res.status(400).json({ error: "Invalid type parameter" });
            }
            
            if (!['week', 'month', 'year', 'none'].includes(period)) {
              return res.status(400).json({ error: "Invalid period parameter" });
            }

            let dateFilter = '';
            if (period !== 'none') {
              const startDate = new Date();
            
            if (period === 'week') {
                startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week (Sunday)
            } else if (period === 'month') {
                startDate.setDate(1); // Start of month
            } else if (period === 'year') {
                startDate.setMonth(0, 1); // Start of year
            }
            
             const formattedDate = startDate.toISOString().split('T')[0];
             dateFilter = `AND date >= '${formattedDate}'`;
            }

            const walletFilter = wallet_id ? `AND wallet_id = ${parseInt(wallet_id)}` : '';

            let query

            if(type === 'all'){
             query = `SELECT COALESCE(SUM(CASE 
                  WHEN type = 'income'  THEN amount
                  WHEN type = 'expense' THEN -amount
                  ELSE 0
                 END), 0)as total
                 FROM transactions
                 WHERE 1=1 ${dateFilter} ${walletFilter}`
            }
            else{
            const typeFilter =  `AND type = '${type}'`
             query = `
                SELECT COALESCE(SUM(amount), 0) as total
                FROM transactions
                WHERE 1=1 ${dateFilter} ${typeFilter} ${walletFilter}
                `
            }
           
            const [result] = await db.query(query);

            const total = parseFloat(result[0].total || 0).toFixed(2);
    
            res.json({ total });

        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: "Internal server error" });
        }
  });

router.get('/totalByMonth', async (req, res) => {
    
          const {category_id,wallet_id} = req.query;
          try {
                const joinClauses = [];
                const params = [];

                if (wallet_id !== undefined && wallet_id !== '' && wallet_id !== 'all' && wallet_id > 0) {
                  joinClauses.push('t.wallet_id = ?');
                  params.push(parseInt(wallet_id, 10));
                }
                if (category_id !== undefined && category_id !== '' && category_id !== 'all'&& category_id > 0) {
                  joinClauses.push('t.category_id = ?');
                  params.push(parseInt(category_id, 10));
                }

               const joinFilterSql = joinClauses.length ? 'AND ' + joinClauses.join(' AND ') : '';

            let query = 
            `WITH RECURSIVE months AS (
              SELECT DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 11 MONTH) AS month_start
              UNION ALL
              SELECT DATE_ADD(month_start, INTERVAL 1 MONTH)
              FROM months
              WHERE month_start < DATE_FORMAT(CURDATE(), '%Y-%m-01')
            )
            SELECT 
              DATE_FORMAT(m.month_start, '%Y-%m-01') AS month_start,
              DATE_FORMAT(m.month_start, '%Y-%m')     AS month,
              COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount END), 0) AS income,
              COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount END), 0) AS expense
            FROM months m
            LEFT JOIN transactions t
              ON t.date >= m.month_start
              AND t.date < DATE_ADD(m.month_start, INTERVAL 1 MONTH)
              -- optional filters
              ${joinFilterSql}
            GROUP BY m.month_start
              ORDER BY m.month_start;`;
          

          const [result] = await db.query(query,params)
            

            // const total = parseFloat(result[0].total || 0).toFixed(2);
    
            res.json({ result });

        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: "Internal server error" });
        }
  });

// for old json
// router.post('/', async (req, res) => {

//     const { dateEnterd , wallet, category, amount, date, type, description } = req.body;

//     try {
//         const [result] = await db.execute(
//             `INSERT INTO transactions(created_at,wallet_id,amount,date,type,category_id,description)
//              VALUES (?, ?, ?, ?, ?, ?,?)`,
//             [dateEnterd, wallet, amount, date, type, category, description]
//         );
//         res.status(201).json({ id: result.insertId, dateEnterd, wallet, amount, date, type, category, description });
//     }
//     catch (error) {
//         console.error(error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }

// })

// for new sql

router.post('/', async (req, res) => {

    const {wallet_id, category_id, amount, date, type, description } = req.body;
    try {
        const [result] = await db.execute(
            `INSERT INTO transactions(wallet_id,amount,date,type,category_id,description)
             VALUES (?,?,?,?,?,?)`,
            [wallet_id, amount, date, type, category_id, description]
        );
        await updateWallet(wallet_id, amount,type);
        res.status(201).json({ id: result.insertId,  wallet_id, amount, date, type, category_id, description });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }

})

router.patch('/:id', async (req, res) => {
  const  id  = parseInt(req.params.id);
  const { date, amount, type, category_id, wallet_id, description } = req.body;
  
  if(wallet_id === undefined){
    return res.status(400).json({ error: "wallet_id is required" });
  }

  try {
    const updates = [];
    const values = [];
    
    if (amount !== undefined) {
      updates.push("amount = ?");
      values.push(amount);
    }
    if (date!== undefined) {
      updates.push("date = ?");
      values.push(date);
    }
    if (type !== undefined) {
      updates.push("type = ?");
      values.push(type);
    }
    if (category_id !== undefined) {
      updates.push("category_id = ?");
      values.push(category_id);
    }
    if (wallet_id !== undefined) {
      updates.push("wallet_id = ?");
      values.push(wallet_id);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    values.push(id);

    const sql = `UPDATE transactions SET ${updates.join(", ")} WHERE id = ?`;
    const [result] = await db.execute(sql, values);
    

    res.json({ message: "Transaction updated", result });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }

  await recalculateBalance(wallet_id);
});

router.delete('/:id', async (req, res) => {
  const  id  = parseInt(req.params.id);
  const  wallet_id  = parseInt(req.query.toUpdate);


  try {
    const [result] = await db.execute(
      'DELETE FROM transactions WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: "Transaction updated", result });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }

  await recalculateBalance(wallet_id);
}); 

module.exports = router;