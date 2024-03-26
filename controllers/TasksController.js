import Task from "../models/toughts.js";
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

        const toughts = taskData.map((result)=> result.get({ plain: true}))

        let toughtsQty = toughts.length
        if(toughtsQty === 0){
            toughtsQty = false
        }


        res.render('toughts/home', { toughts, toughtsQty, search})
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
        const toughts = user.Toughts.map((result) => result.dataValues)
        
        let emptyToughts = false

        if(toughts.length ===0 ) {
            emptyToughts = true
        }
        
        res.render('toughts/dashboard', { toughts, emptyToughts })
    }

    static createTought(req, res) {
        res.render('toughts/create')
    }

    static async createToughtSave(req, res) {
        const { title, description } = req.body;
        const UserId = req.session.userid;

        try {
            const tought = await Task.create({ title, description, UserId})

            req.flash('message', 'pensamento criado')
            res.redirect('/toughts/dashboard')


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

            req.flash('message', 'pensamento removido')

            req.session.save(() => {
                res.redirect('/toughts/dashboard')

            })
        } catch (error) {
            console.log('aconteceu um erro')
        }
    }

    static updateTask(req, res) {
        const id = req.params.id
    
        Task.findOne({ where: { id: id }, raw: true })
          .then((task) => {
            res.render('toughts/edit', { task })
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
              res.redirect('/toughts/dashboard')
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
                res.redirect('/toughts/dashboard');
                return;
            }
    
            // Inverte o status de completude da tarefa
            task.completed = !task.completed;
            await task.save();
    
            res.redirect('/toughts/dashboard');
        } catch (error) {
            console.error(error);
            req.flash('message', 'Ocorreu um erro ao marcar a tarefa.');
            res.redirect('/toughts/dashboard');
        }
    }
    
   

}