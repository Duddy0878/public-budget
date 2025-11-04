const db = require('../db');

const updateWallet = async (walletId, amount, type) => {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Invalid amount');
  }
  if (!['income', 'expense'].includes(type)) {
    console.log("type", type);
    throw new Error('Invalid type');
  }

  const delta = type === 'income' ? amount : -amount;

  const [result] = await db.execute(
    'UPDATE wallets SET balance = balance + ? WHERE id = ?',
    [delta, walletId]
  );

  return result.affectedRows; // caller decides how to respond
};

const recalculateBalance = async (walletId) => {
  const [rows] = await db.execute(`
    SELECT COALESCE(
      SUM(CASE 
            WHEN type = 'income'  THEN amount
            WHEN type = 'expense' THEN -amount
            ELSE 0
          END), 0
    ) AS balance
    FROM transactions
    WHERE wallet_id = ?
  `, [walletId]);

  const balance = rows[0]?.balance ?? 0;

  await db.execute(
    'UPDATE wallets SET balance = ? WHERE id = ?',
    [balance, walletId]
  );

  return balance;
};

const exchangeWallet = async  (id) => {
    // !important this is  a project defualt that unknown wallet is one
    console.log(id);
    try {
        const [result] = await db.query(
            `UPDATE transactions SET wallet_id = ? WHERE wallet_id = ?`,
            [1,id]
        );

        await recalculateBalance(1);
        console.log('went', id);
        return result.affectedRows;
     } catch (error) {
       console.error(error.message);
       throw error;
     }
}

module.exports = {updateWallet,recalculateBalance,exchangeWallet};