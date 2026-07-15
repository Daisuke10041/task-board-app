const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// データベース接続の設定
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// サーバー起動時にテーブルを作成
const initDB = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            requestor VARCHAR(100),
            assignee VARCHAR(100),
            text TEXT,
            datetime VARCHAR(100),
            location VARCHAR(100)
        );
    `);
    console.log('Database initialized');
};
initDB();

app.get('/', async (req, res) => {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
    res.render('index', { tasks: result.rows });
});

app.post('/add', async (req, res) => {
    const newRequestor = req.body.requestor;
    const newAssignee = req.body.assignee || newRequestor;
    const newTaskText = req.body.taskName;
    const newTaskDatetime = req.body.taskDatetime;
    const newTaskLocation = req.body.taskLocation;

    if (newTaskText && newRequestor) {
        await pool.query(
            'INSERT INTO tasks (requestor, assignee, text, datetime, location) VALUES ($1, $2, $3, $4, $5)',
            [newRequestor, newAssignee, newTaskText, newTaskDatetime, newTaskLocation]
        );
    }
    res.redirect('/');
});

app.post('/delete/:id', async (req, res) => {
    const targetId = parseInt(req.params.id, 10);
    await pool.query('DELETE FROM tasks WHERE id = $1', [targetId]);
    res.redirect('/');
});

app.post('/reject/:id', async (req, res) => {
    const targetId = parseInt(req.params.id, 10);
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [targetId]);
    
    if (result.rows.length > 0) {
        const task = result.rows[0];
        const newText = `[拒否されました] ${task.text}`;
        await pool.query(
            'UPDATE tasks SET assignee = $1, text = $2 WHERE id = $3',
            [task.requestor, newText, targetId]
        );
    }
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});