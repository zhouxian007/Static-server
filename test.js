const fs = require('fs')
//读数据库
const usersString = fs.readFileSync('./db/users.json').toString()
const usersArray = JSON.parse(usersString)
console.log(usersArray)
//写数据库
const users3 = {id:3 ,name:'tom',password:123}
usersArray.push(users3)
const string = JSON.stringify(usersArray)
fs.writeFileSync('./db/users.json',string)