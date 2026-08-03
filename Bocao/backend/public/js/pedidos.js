const API = "http://localhost:3000";



let itensPedido = [];
let produtos = [];


function carregarProximaSenha() {

    fetch(API + "/proxima-senha")
        .then(res => res.json())
        .then(data => {
            document.getElementById("senha_cliente").value = data.senha;
        })
        .catch(err => console.log(err));

}


function carregarProdutos() {

    fetch(API + "/produtos")
        .then(res => res.json())
        .then(lista => {

            produtos = lista;

            const select = document.getElementById("produto");

            select.innerHTML = "";

            lista.forEach(produto => {

                select.innerHTML += `
                    <option value="${produto.id}">
                        ${produto.nome} - R$ ${produto.preco.toFixed(2)}
                    </option>
                `;

            });

        })
        .catch(err => console.log(err));

}



function adicionarItem() {

    const produtoId = Number(document.getElementById("produto").value);
    const quantidade = Number(document.getElementById("quantidade").value);

    if (quantidade <= 0) {
        alert("Quantidade inválida.");
        return;
    }

    const produto = produtos.find(p => p.id === produtoId);

    if (!produto) return;

    const itemExistente = itensPedido.find(
        item => item.produto_id === produto.id
    );

    if (itemExistente) {

        itemExistente.quantidade += quantidade;

        itemExistente.subtotal =
            itemExistente.quantidade * itemExistente.preco;

    } else {

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



function atualizarLista() {

    const lista = document.getElementById("listaItens");

    lista.innerHTML = "";

    let total = 0;

    itensPedido.forEach(item => {

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


function criarPedido() {
    alert("A função foi chamada!");

    if (itensPedido.length === 0) {
        alert("Adicione produtos ao pedido.");
        return;
    }

    const pedido = { 

        observacao: document.getElementById("observacao").value,

        forma_pagamento: document.getElementById("pagamento").value,

        setor: document.getElementById("setor").value,

        itens: itensPedido.map(item => ({

            produto_id: item.produto_id,
            quantidade: item.quantidade

        }))
        

    };

    fetch(API + "/pedidos", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(pedido)

    })

        .then(res => res.json())

        .then(data => {

            document.getElementById("mensagem").innerHTML = `
                <strong>Pedido criado com sucesso!</strong><br>
                Senha: <strong>${data.senha_cliente}</strong><br>
                Valor: <strong>R$ ${Number(data.valor_total).toFixed(2)}</strong>
            `;

            

            itensPedido = [];

            atualizarLista();

            

            document.getElementById("observacao").value = "";
            document.getElementById("quantidade").value = 1;
            document.getElementById("pagamento").selectedIndex = 0;
            document.getElementById("produto").selectedIndex = 0;

            

            carregarProximaSenha();

        })

        .catch(error => {

            console.log(error);
            alert("Erro ao criar pedido.");

        });

}



carregarProdutos();
carregarProximaSenha();