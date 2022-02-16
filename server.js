var http = require("http");
var fs = require("fs");
var url = require("url");
var port = process.argv[2];

if (!port) {
  console.log("请指定端口号好不啦？\nnode server.js 8888 这样不会吗？");
  process.exit(1);
}

  var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true);
  var pathWithQuery = request.url;
  var queryString = "";
  if (pathWithQuery.indexOf("?") >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf("?"));
  }
  var path = parsedUrl.pathname;
  var query = parsedUrl.query;
  var method = request.method;
  var accept = request.headers["accept"]; //大小写敏感

  /******** 从这里开始看，上面不要看 ************/

  console.log("有个傻子发请求过来啦！路径（带查询参数）为：" + pathWithQuery);
  console.log("method:");
  console.log(method); //GET或者POST
  console.log("request.headers:");
  console.log(request.headers); //得到所有符合格式的请求头
  const session = JSON.parse(fs.readFileSync('./session.json').toString())

    if(path==="/sign_in" && method==="POST"){
      response.setHeader('Content-type','text/html;charset=utf-8')
      const userArray = JSON.parse (fs.readFileSync('./db/users.json'));//读一下数据库
      console.log(userArray)
      const array = [];
        request.on("data", chunk=>{
            array.push(chunk)
          
        });
        request.on("end",()=>{
            const string = Buffer.concat(array).toString()
            const obj = JSON.parse(string) //name password
            const user = userArray.find((user) => user.name===obj.name && user.password===obj.password
            );
            if(user === undefined){
              response.statusCode=400;
            
              response.end('不匹配');
            } else{
              response.statusCode=200
              const random= Math.random();
              const session = JSON.parse(fs.readFileSync('./session.json').toString())
              session[random]= {user_id:user.id}
              fs.writeFileSync('./session.json',JSON.stringify(session))
              response.setHeader('Set-Cookie',`session_id=${random}; HttpOnly`)
              
            }
            response.end();
        });
   
    }else if(path==="/home.html"){
      const cookie = request.headers["cookie"];
      let sessionId;
      try{
        sessionId = cookie.split(';').filter(s=>s.indexOf("session_id=")>=0)[0].split('=')[1]
      }catch(error){
      }
      
      if(sessionId && session[sessionId]){
        const userId = session[sessionId].user_id
        const homeHtml =fs.readFileSync("./public/home.html").toString()
        const userArray = JSON.parse (fs.readFileSync('./db/users.json'))
        const user = userArray.find(user=>user.id=== userId)
        let string=''
        if(user){
          string = homeHtml.replace('{{loginStatus}}','已登录').replace('{{user.name}}',user.name)
        }else{
          // string = homeHtml.replace('{{loginStatus}}','未登录')
        }
        response.write(string)
      }else{
        const homeHtml =fs.readFileSync("./public/home.html").toString()
        const string = homeHtml.replace('{{loginStatus}}','未登录').replace('{{user.name}}','您好，您')
        response.write(string)
      }
      response.end("home")

    }else if(path==="/register" && method==="POST"){
      response.setHeader('Content-type','text/html;charset=utf-8')
      const userArray = JSON.parse (fs.readFileSync('./db/users.json'))//读一下数据库
      
      const array = []//申明一个空数组
        request.on('data' , (chunk)=>{
            array.push(chunk)
          
        })
        request.on('end' , ()=>{
            const string = Buffer.concat(array).toString()
            console.log(string)
            let obj = JSON.parse(string)
            
            let lastUser=userArray[userArray.length-1]
            const newUser = {
              id:lastUser?lastUser.id+1:1,
              name:obj.name,
              password:obj.password
            }//id为最后一个用户的id+1
            userArray.push(newUser)//把这个新用户存入数组里面
            fs.writeFileSync('./db/users.json',JSON.stringify(userArray)) //把用户变成字符串写到json里面
            response.end()
        })
      
    }else{
      response.statusCode = 200;
      const filePath = path === '/' ? '/index.html' : path//默认首页
      const index = filePath.lastIndexOf('.')//把“.”后面的赋值成index变量
      const suffix= filePath.substring(index)//拿到子字符串的后缀suffix
      
      const fileTypes= {//HasMap
          '.html':'text/html',
          '.css':'text/css',
          '.js':'text/javascript',
          '.png':'text/png',
          '.jpg':'text/jpeg',
         
      }
      
      response.setHeader('Content-Type', `${fileTypes[suffix] || 'text/html'};charset=utf-8`);
      let content 
      try {
          content = fs.readFileSync(`./public${filePath}`);
      } catch (error) {
          
          content = '文件不存在'
          response.statusCode = 404;
      }
      response.write(content)
        response.end();
    }
   
  /******** 代码结束，下面不要看 ************/
});

server.listen(port);
console.log(
  "监听 " +
    port +
    " 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:" +
    port
);