const API = "http://localhost:3000";


function carregarRelatorio(){


fetch(API+"/relatorios/vendas")


.then(res=>res.json())


.then(dados=>{


document.getElementById("quantidade").innerHTML =
dados.quantidade_vendas || 0;


document.getElementById("total").innerHTML =

"R$ " + 
Number(dados.total_vendido || 0)
.toFixed(2);



});


}



carregarRelatorio();