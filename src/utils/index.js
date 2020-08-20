function generateMessage(username,text)
{
    var date=new Date()
    return {
           username,
           text,
           createdAt:date.getTime()
           
    }
}
function genrateLocationmessage(username,url)
{
     var date=new Date();
     return {
         username,
         url,
         createdAt:date.getTime()
     }
}
module.exports={
    generateMessage,
    genrateLocationmessage
}