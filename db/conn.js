import { Sequelize } from "sequelize";

const sequelize = new Sequelize('inova_task', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})

try{
    sequelize.authenticate()
    console.log('succcess banco')
}catch(err){
    console.log(`no connect: ${err}`)
}

export default sequelize