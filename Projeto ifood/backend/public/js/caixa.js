const API = "http://localhost:3000";



// Buscar pedidos

function carregarPedidos(){


fetch(API+"/pedidos")


.then(res=>res.json())


.then(pedidos=>{


let tabela = "";



pedidos.forEach(pedido=>{


if(
pedido.status === "Pronto"
){


tabela += `


<tr>

<td>${pedido.id}</td>

<td>${pedido.senha_cliente}</td>

<td>${pedido.produto}</td>

<td>R$ ${pedido.valor_total}</td>


<td>


<select id="pagamento${pedido.id}">

<option value="Dinheiro">
Dinheiro
</option>


<option value="Cartão">
Cartão
</option>


<option value="Pix">
Pix
</option>


</select>


</td>


<td>

<button onclick="pagar(${pedido.id},${pedido.valor_total})">

Finalizar

</button>

</td>


</tr>


`;

}


});



document.getElementById("listaPedidos").innerHTML = tabela;



});


}




// Registrar pagamento

function pagar(id,valor){


const forma = 
document.getElementById("pagamento"+id).value;



fetch(API+"/caixa",{


method:"POST",


headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({

pedido_id:id,

valor:valor,

forma_pagamento:forma


})


})


.then(res=>res.json())


.then(()=>{


alert("Pagamento registrado!");


carregarPedidos();

carregarHistorico();


});


}





// Histórico

function carregarHistorico(){


fetch(API+"/vendas")


.then(res=>res.json())


.then(vendas=>{


let tabela="";


vendas.forEach(venda=>{


tabela += `

<tr>

<td>${venda.id}</td>

<td>R$ ${venda.valor}</td>

<td>${venda.forma_pagamento}</td>

<td>${venda.data}</td>


</tr>

`;


});


document.getElementById("historico").innerHTML=tabela;


});


}




carregarPedidos();

carregarHistorico();


setInterval(carregarPedidos,5000);