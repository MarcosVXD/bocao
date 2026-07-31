const API = "http://localhost:3000";



function carregarPedidos(){


fetch(API + "/pedidos")


.then(res=>res.json())


.then(pedidos=>{


let tabela = "";



pedidos.forEach(pedido=>{


if(
pedido.setor === "Cozinha" &&
(
pedido.status === "Recebido" ||
pedido.status === "Em preparo"
)
){


let listaItens = "";


pedido.itens.forEach(item=>{


listaItens += `

${item.nome} - ${item.quantidade}x
<br>

`;


});



tabela += `

<tr>


<td>

#${pedido.id}

</td>



<td>

${pedido.senha_cliente}

</td>



<td>

${listaItens}

</td>



<td>

${pedido.observacao}

</td>



<td>

${pedido.status}

</td>



<td>



${
pedido.status === "Recebido"

?

`

<button onclick="alterarStatus(${pedido.id}, 'Em preparo')">

Iniciar preparo

</button>

`

:

`

<button onclick="alterarStatus(${pedido.id}, 'Pronto')">

Finalizar

</button>

`

}



</td>


</tr>


`;


}


});



document.getElementById("listaPedidos").innerHTML=tabela;



});


}






function alterarStatus(id,status){


console.log("Alterando pedido:", id, "para", status);


fetch(API+"/pedidos/"+id+"/status",{


method:"PUT",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify({

status:status

})


})


.then(res=>res.json())


.then(data=>{


console.log(data);


carregarPedidos();


})


.catch(err=>{


console.log("ERRO:",err);


});


}




carregarPedidos();



// Atualiza automaticamente

setInterval(carregarPedidos,5000);