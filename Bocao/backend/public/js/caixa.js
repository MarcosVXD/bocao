const API = "http://localhost:3000";



// Buscar pedidos para pagamento

function carregarPedidos(){


fetch(API+"/pedidos")


.then(res=>res.json())


.then(pedidos=>{


let tabela = "";



pedidos.forEach(pedido=>{


if(
pedido.status === "Pronto"
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

R$ ${pedido.valor_total.toFixed(2)}

</td>



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

Finalizar pagamento

</button>


</td>



</tr>


`;



}


});



document.getElementById("listaPedidos").innerHTML=tabela;



});


}







// Registrar pagamento

function pagar(id,valor){



const forma = 
document.getElementById("pagamento"+id).value;




// Primeiro registra no caixa

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



// Depois finaliza o pedido

return fetch(API+"/pedidos/"+id+"/status",{


method:"PUT",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify({


status:"Finalizado"


})


});



})


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

<td>
${venda.id}
</td>


<td>
R$ ${venda.valor}
</td>


<td>
${venda.forma_pagamento}
</td>


<td>
${venda.data}
</td>


</tr>

`;



});



document.getElementById("historico").innerHTML=tabela;



});


}







carregarPedidos();

carregarHistorico();



setInterval(carregarPedidos,5000);