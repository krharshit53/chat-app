const socket = io()
/*Elements*/
const $messageForm=document.querySelector('#message-form')
const $messageFormInp=$messageForm.querySelector('input')
const $messageFormBtn=$messageForm.querySelector('button')
const $sendLoc=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')
const $sidebar=document.querySelector('#sidebar')

/*Templates*/

const $messageTemp=document.querySelector('#message-template').innerHTML
const $locationTemp=document.querySelector('#location-template').innerHTML
const $sidebarTemp=document.querySelector('#sidebar-template').innerHTML

// Query parsing
 const {username,room} =Qs.parse(location.search,{ignoreQueryPrefix:true})

socket.on('message', (message) => {
    
   console.log(message.username)
    const html=Mustache.render($messageTemp,{
        username:message.username,
        text:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    
})

socket.on('message-location',(message)=>
{
    
    const html=Mustache.render($locationTemp,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})


socket.on('roomData',({room,users})=>
{
    const html=Mustache.render($sidebarTemp,{
        room,
        users
    })
    $sidebar.innerHTML=html
})




$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
   
    $messageFormBtn.setAttribute('disabled','disabled')
     
    const message = $messageFormInp.value;

    socket.emit('sendMessage', message,(error)=>
    {
           $messageFormBtn.removeAttribute('disabled')
           $messageFormInp.value=''
           $messageFormInp.focus()
           if(error)
           return console.log(error);

           console.log('message is delivered!')
    })
})

$sendLoc.addEventListener('click',(e)=>
{
    e.preventDefault();
    navigator.geolocation.getCurrentPosition((position)=>
    {
        const long=position.coords.longitude;
        const latt=position.coords.latitude;
        $sendLoc.setAttribute('disabled','disabled')
        socket.emit('send-location',{long,latt},()=>
        {
            console.log('location is shared!')
            $sendLoc.removeAttribute('disabled')
        });
    })

    
})

socket.emit('join',{username,room},(error)=>
{
         if(error)
         {
             alert(error);
             location.href='/'
         }
});