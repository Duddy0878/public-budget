const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/type', async (req, res) => {

  const type = req.query.type;

    try {
        const [notifications] = await db.query("SELECT * FROM notifications WHERE type = ?", [type]);
        res.json(notifications);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
})

router.post('/', async (req, res) => {
    
    const { trans_id,type,msg,auther } = req.body;

    try {
        const [result] = await db.execute(
            `INSERT INTO notifications(trans_id,type,msg,auther)
             VALUES (?,?,?,?)`,
            [trans_id,type,msg,auther]
        );
        res.status(201).json({ id: result.insertId});
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }

})

router.delete('/:id', async (req, res) => {

    const id = parseInt(req.params.id);

    try {

        const [result] = await db.execute(
        `DELETE FROM notifications
        WHERE id = ?`,
        [id]
        );

        if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'notification not found' });
        }

        return res.status(200).json({
            id,
            affectedRows: result.affectedRows,
            changedRows: result.changedRows
        });

    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error " });
    }

})

module.exports = router;
