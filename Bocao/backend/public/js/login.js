function login(){


const email =
document.getElementById("email").value;


const senha =
document.getElementById("senha").value;



fetch("http://localhost:3000/login",{


method:"POST",

headers:{
    "Content-Type":"application/json"
},


body:JSON.stringify({

    email:email,
    senha:senha

})


})


.then(res=>res.json())


.then(data=>{


if(data.sucesso){


    localStorage.setItem(
        "usuario",
        JSON.stringify(data.usuario)
    );


    window.location.href="index.html";


}
else{


document.getElementById("mensagem").innerHTML =
data.mensagem;


}



})


.catch(error=>{


console.log(error);


});


}