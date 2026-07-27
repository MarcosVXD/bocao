const API = "http://localhost:3000";



function carregarPedidos(){


fetch(API + "/pedidos")


.then(res=>res.json())


.then(pedidos=>{


let tabela = "";



pedidos.forEach(pedido=>{


if(
pedido.status === "Pronto"
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
${pedido.status}
</td>


<td>


<button onclick="entregarPedido(${pedido.id})">

Entregue

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

status:"Finalizado"

})


})


.then(()=>{


carregarPedidos();


});


}



carregarPedidos();


setInterval(carregarPedidos,5000);