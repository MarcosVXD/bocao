const API = "http://localhost:3000";



function carregarPedidos(){


fetch(API + "/pedidos")


.then(res=>res.json())


.then(pedidos=>{


let tabela = "";



pedidos.forEach(pedido=>{


if(
pedido.status === "Finalizado"
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

${pedido.status}

</td>



<td>


<button onclick="entregarPedido(${pedido.id})">

Confirmar retirada

</button>


</td>



</tr>


`;



}


});



document.getElementById("listaPedidos").innerHTML = tabela;



});


}






function entregarPedido(id){


fetch(API + "/pedidos/"+id+"/status",{


method:"PUT",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify({


status:"Entregue"


})


})


.then(()=>{


carregarPedidos();


});


}




carregarPedidos();


setInterval(carregarPedidos,5000);