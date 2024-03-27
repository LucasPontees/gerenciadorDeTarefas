import Task from "../models/TasksModel.js";
import User from "../models/User.js";
import {Op} from 'sequelize'

export default class TasksController {
    static async showTask(req, res) {

        let search = ''

        if(req.query.search){
            search = req.query.search
        }

        let order = 'DESC'

        if(req.query.order === 'old') {
            order = 'ASC'
        }else {
            order = 'DESC'
        }

    
        const taskData = await Task.findAll({
            include: User,
            where: {
                title: { [Op.like]: `%${search}%` },
            },
            order: [['createdAt', order]]
        }) 

        const tasks = taskData.map((result)=> result.get({ plain: true}))

        let tasksQty = tasks.length
        if(tasksQty === 0){
            tasksQty = false
        }


        res.render('tasks/home', { tasks, tasksQty, search})
    }

    static async dashboard(req, res) {
        const userId = req.session.userid

        const user = await User.findOne({
            where: {
                id: userId,
            },
            include: Task,
            plain: true,
        })
        if (!user) {
            res.redirect('/login')
        }
        const tasks = user.Tasks.map((result) => result.dataValues)
        
        let emptyTasks = false

        if(tasks.length ===0 ) {
            emptyTasks = true
        }
        
        res.render('tasks/dashboard', { tasks, emptyTasks })
    }

    static createTask(req, res) {
        res.render('tasks/create')
    }

    static async createTaskSave(req, res) {
        const { title, description } = req.body;
        const UserId = req.session.userid;

        try {
            const task = await Task.create({ title, description, UserId})
            res.redirect('/tasks/dashboard')


            req.session.save(() => {

            })
        } catch (error) {
            console.log('error')
        }
    }

    static async removeTask(req, res) {
        const id = req.body.id
        const UserId = req.session.userid

        try {
            await Task.destroy({ where: { id: id, UserId: UserId } })

            req.flash('message', 'Tarefa removida !')

            req.session.save(() => {
                res.redirect('/tasks/dashboard')

            })
        } catch (error) {
            console.log('aconteceu um erro')
        }
    }

    static updateTask(req, res) {
        const id = req.params.id
    
        Task.findOne({ where: { id: id }, raw: true })
          .then((task) => {
            res.render('tasks/edit', { task })
          })
          .catch((err) => console.log())
      }
    
      static updateTaskPost(req, res) {
        const id = req.body.id
    
        const task = {
          title: req.body.title,
          description: req.body.description,
        }
    
        Task.update(task, { where: { id: id } })
          .then(() => {
            req.flash('message', 'Tarefa atualizada com sucesso!')
            req.session.save(() => {
              res.redirect('/tasks/dashboard')
            })
          })
          .catch((err) => console.log())
      }

    static async completeTask(req, res) {
        const taskId = req.params.id;
    
        try {
            const task = await Task.findByPk(taskId);
            if (!task) {
                req.flash('message', 'Tarefa não encontrada.');
                res.redirect('/tasks/dashboard');
                return;
            }
    
            // Inverte o status de completude da tarefa
            task.completed = !task.completed;
            await task.save();
    
            res.redirect('/tasks/dashboard');
        } catch (error) {
            console.error(error);
            req.flash('message', 'Ocorreu um erro ao marcar a tarefa.');
            res.redirect('/tasks/dashboard');
        }
    }
    
   

}