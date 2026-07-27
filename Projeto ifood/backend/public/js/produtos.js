const API = "http://localhost:3000";



function carregarProdutos(){


fetch(API + "/produtos")


.then(res=>res.json())


.then(produtos=>{


let tabela = "";


produtos.forEach(produto=>{


tabela += `

<tr>

<td>${produto.id}</td>

<td>${produto.nome}</td>

<td>${produto.categoria}</td>

<td>R$ ${produto.preco}</td>


<td>

<button 
class="btn-delete"
onclick="excluirProduto(${produto.id})">

Excluir

</button>

</td>


</tr>

`;


});


document.getElementById("listaProdutos").innerHTML=tabela;


});


}




function cadastrarProduto(){


const produto = {


nome:
document.getElementById("nome").value,


descricao:
document.getElementById("descricao").value,


categoria:
document.getElementById("categoria").value,


preco:
document.getElementById("preco").value


};



fetch(API+"/produtos",{


method:"POST",


headers:{

"Content-Type":"application/json"

},


body:JSON.stringify(produto)


})


.then(res=>res.json())


.then(()=>{


alert("Produto cadastrado!");


carregarProdutos();


});



}





function excluirProduto(id){


fetch(API+"/produtos/"+id,{

method:"DELETE"

})


.then(()=>{

carregarProdutos();

});


}



carregarProdutos();