const API = "http://localhost:3000";



function carregarPedidos(){


fetch(API + "/pedidos")


.then(res=>res.json())


.then(pedidos=>{


let tabela = "";



pedidos.forEach(pedido=>{


if(
pedido.setor === "Cozinha" &&
pedido.status !== "Pronto"
){


tabela += `

<tr>

<td>
${pedido.senha_cliente}
</td>


<td>
${pedido.produto}
</td>


<td>
${pedido.quantidade}
</td>


<td>
${pedido.observacao}
</td>


<td>
${pedido.status}
</td>


<td>


<button onclick="alterarStatus(${pedido.id}, 'Preparando')">

Preparar

</button>



<button onclick="alterarStatus(${pedido.id}, 'Pronto')">

Pronto

</button>


</td>


</tr>


`;

}


});


document.getElementById("listaPedidos").innerHTML=tabela;



});


}




function alterarStatus(id,status){



fetch(API+"/pedidos/"+id+"/status",{


method:"PUT",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify({

status:status

})


})


.then(()=>{


carregarPedidos();


});


}



carregarPedidos();


// Atualiza a cada 5 segundos

setInterval(carregarPedidos,5000);