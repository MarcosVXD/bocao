const API = "http://localhost:3000";

// Carrinho do pedido
let itensPedido = [];
let produtos = [];

// Carregar produtos

function carregarProdutos(){


fetch(API+"/produtos")


.then(res=>res.json())


.then(lista=>{

    produtos = lista;

    let select = document.getElementById("produto");

    select.innerHTML = "";

    lista.forEach(produto=>{

        select.innerHTML += `
            <option value="${produto.id}">
                ${produto.nome} - R$ ${produto.preco}
            </option>
        `;

    });

});


}

function adicionarItem(){

    const produtoId = Number(document.getElementById("produto").value);
    const quantidade = Number(document.getElementById("quantidade").value);

    if(quantidade <= 0){

        alert("Quantidade inválida.");
        return;

    }

    const produto = produtos.find(p => p.id == produtoId);

    if(!produto){
        return;
    }

   // verifica se o produto já existe no pedido

const itemExistente = itensPedido.find(
    item => item.produto_id == produto.id
);


if(itemExistente){

    itemExistente.quantidade += quantidade;

    itemExistente.subtotal =
    itemExistente.quantidade * itemExistente.preco;


}else{


    itensPedido.push({

        produto_id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        quantidade: quantidade,
        subtotal: produto.preco * quantidade

    });

}

    atualizarLista();

}
function atualizarLista(){

    const lista = document.getElementById("listaItens");

    lista.innerHTML = "";

    let total = 0;

    itensPedido.forEach(item=>{

        total += item.subtotal;

        lista.innerHTML += `
            <p>
                ${item.nome}
                -
                ${item.quantidade}x
                -
                R$ ${item.subtotal.toFixed(2)}
            </p>
        `;

    });

    document.getElementById("totalPedido").innerHTML =
        `Total: R$ ${total.toFixed(2)}`;

}


// Criar pedido

function criarPedido(){


    if(itensPedido.length === 0){

        alert("Adicione produtos ao pedido.");
        return;

    }


    const pedido = {


        senha_cliente:
        document.getElementById("senha_cliente").value,


        observacao:
        document.getElementById("observacao").value,


        forma_pagamento:
        document.getElementById("pagamento").value,


        setor:
        document.getElementById("setor").value,


        itens:

        itensPedido.map(item=>({

            produto_id:item.produto_id,

            quantidade:item.quantidade

        }))


    };



    console.log(pedido);



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

        Senha: ${data.senha_cliente}

        <br>

        Valor: R$ ${data.valor_total}
        `;


        itensPedido = [];

        atualizarLista();


    })


    .catch(error=>{


        console.log(error);

        alert("Erro ao criar pedido");


    });


}




carregarProdutos();