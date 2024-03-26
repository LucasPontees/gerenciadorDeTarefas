import { DataTypes } from "sequelize";
import db from '../db/conn.js'
import User from "./User.js";

const Task = db.define('Tasks', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        require: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
})

Task.belongsTo(User)
User.hasMany(Task)

export default Task