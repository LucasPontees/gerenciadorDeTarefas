import express from 'express'
import { engine } from 'express-handlebars'
import session from 'express-session'
import FileStore from 'session-file-store'
import flash from 'express-flash'
import path from 'path'
import os from 'os'
import tasksRoutes from './routes/tasksRoutes.js'
import authRoutes from './routes/authRoutes.js'

const app = express()
const FileStoreSession = FileStore(session)


import conn from './db/conn.js'
import TasksController from './controllers/TasksController.js'

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')

app.use(express.urlencoded({
    extended: true
}))

app.use(express.json())

app.use(session({
    name: "session",
    secret: "nosso_secret",
    resave: false,
    saveUninitialized: false,
    store: new FileStoreSession({
        logFn: function () { },
        path: path.join(os.tmpdir(), 'sessions'),
    }),
    cookie: {
        secure: false,
        maxAge: 360000,
        expires: new Date(Date.now() + 360000),
        httpOnly: true
    }
}),
)


app.use(flash())

app.use(express.static('public'))

app.use((req, res, next) => {

    console.log(req.session.userid);

    if (req.session.userid) {
        res.locals.session = req.session;
    }

    next()
})

app.use('/tasks', tasksRoutes)
app.use('/', authRoutes)

app.get('/', TasksController.showTask)

conn.sync().then(() => {

    app.listen(3000)
})
    .catch((err) => console.log(err))

