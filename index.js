const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(express.static('public'));

let tasks = [];
let nextId = 1;

app.get('/', (req, res) => {
    res.render('index', { tasks: tasks });
});

app.post('/add', (req, res) => {
    const newRequestor = req.body.requestor;
    // 修正: 相手の名前（assignee）が空欄（偽値）なら、自分の名前（requestor）を入れる
    const newAssignee = req.body.assignee || newRequestor;
    
    const newTaskText = req.body.taskName;
    const newTaskDatetime = req.body.taskDatetime;
    const newTaskLocation = req.body.taskLocation;

    // 必須チェックから newAssignee を外し、自分の名前とタスク名があれば保存できるようにする
    if (newTaskText && newRequestor) {
        tasks.push({
            id: nextId,
            requestor: newRequestor,
            assignee: newAssignee,
            text: newTaskText,
            datetime: newTaskDatetime,
            location: newTaskLocation
        });
        nextId++;
    }
    res.redirect('/');
});

app.post('/delete/:id', (req, res) => {
    const targetId = parseInt(req.params.id, 10);
    tasks = tasks.filter(task => task.id !== targetId);
    res.redirect('/');
});

app.post('/reject/:id', (req, res) => {
    const targetId = parseInt(req.params.id, 10);
    // 該当するIDのタスクを探す
    const task = tasks.find(t => t.id === targetId);

    if (task) {
        // 担当者(assignee)を依頼者(requestor)に戻す
        task.assignee = task.requestor;
        // タスク名の先頭に分かりやすく[拒否]をつける
        task.text = `[拒否されました] ${task.text}`;
    }
    
    res.redirect('/');
});
// ★ここまで追加

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});