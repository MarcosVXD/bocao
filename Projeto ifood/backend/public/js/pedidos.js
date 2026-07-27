const API = "http://localhost:3000";



// Carregar produtos

function carregarProdutos(){


fetch(API+"/produtos")


.then(res=>res.json())


.then(produtos=>{


let select = 
document.getElementById("produto");


select.innerHTML="";



produtos.forEach(produto=>{


select.innerHTML += `

<option value="${produto.id}">

${produto.nome} - R$ ${produto.preco}

</option>

`;


});


});


}




// Criar pedido

function criarPedido(){



const pedido = {


senha_cliente:
document.getElementById("senha_cliente").value,


produto_id:
document.getElementById("produto").value,


quantidade:
document.getElementById("quantidade").value,


observacao:
document.getElementById("observacao").value,


forma_pagamento:
document.getElementById("pagamento").value,


setor:
document.getElementById("setor").value



};



fetch(API+"/pedidos",{


method:"POST",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify(pedido)



})


.then(res=>res.json())


.then(data=>{


document.getElementById("mensagem").innerHTML =

`
Pedido criado! 
<br>
Valor: R$ ${data.valor_total}
`;



});


}




carregarProdutos();