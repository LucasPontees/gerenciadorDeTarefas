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

    static async updateTask(req, res) {

        const id = req.params.id


        const task = await Task.findOne({where: {id: id}, raw: true})

        res.render('toughts/edit', {task})

    }

    static async updateToughtSave(req, res) {
        const { id, title, description } = req.body;
    
        try {
            const tought = await Task.findByPk(id);
            if (!tought) {
                req.flash('message', 'Pensamento não encontrado.');
                res.redirect('/toughts/dashboard');
                return;
            }
    
            tought.title = title;
            tought.description = description;
            await tought.save();
    
            req.flash('message', 'Pensamento atualizado com sucesso!');
            res.redirect('/toughts/dashboard');
        } catch (error) {
            console.error(error);
            req.flash('message', 'Erro ao atualizar pensamento.');
            res.redirect(`/toughts/edit/${id}`);
        }
    }

    static async completeTought(req, res) {
        const toughtId = req.params.id;
    
        try {
            const tought = await Task.findByPk(toughtId);
            if (!tought) {
                req.flash('message', 'Tarefa não encontrada.');
                res.redirect('/toughts/dashboard');
                return;
            }
    
            // Inverte o status de completude da tarefa
            tought.completed = !tought.completed;
            await tought.save();
    
            let message = '';
            if (tought.completed) {
                message = '';
            } else {
                message = '';
            }
    
            req.flash('message', message);
            res.redirect('/toughts/dashboard');
        } catch (error) {
            console.error(error);
            req.flash('message', 'Ocorreu um erro ao marcar a tarefa.');
            res.redirect('/toughts/dashboard');
        }
    }
    
   

}