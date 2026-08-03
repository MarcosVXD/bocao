const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname,"public")));


const db = new sqlite3.Database("database.db");



// ===============================
// CRIAÇÃO DO BANCO
// ===============================

db.serialize(()=>{


db.run(`
CREATE TABLE IF NOT EXISTS usuarios(

id INTEGER PRIMARY KEY AUTOINCREMENT,
nome TEXT NOT NULL,
email TEXT UNIQUE NOT NULL,
senha TEXT NOT NULL,
cargo TEXT NOT NULL

)
`);



db.run(`
CREATE TABLE IF NOT EXISTS produtos(

id INTEGER PRIMARY KEY AUTOINCREMENT,
nome TEXT NOT NULL,
descricao TEXT,
categoria TEXT,
preco REAL NOT NULL

)
`);




db.run(`
CREATE TABLE IF NOT EXISTS setores(

id INTEGER PRIMARY KEY AUTOINCREMENT,
nome TEXT NOT NULL

)
`);




db.run(`
CREATE TABLE IF NOT EXISTS pedidos(

id INTEGER PRIMARY KEY AUTOINCREMENT,

senha_cliente TEXT,

observacao TEXT,

forma_pagamento TEXT,

valor_total REAL,

status TEXT,

setor TEXT,

data TEXT

)
`);




db.run(`
CREATE TABLE IF NOT EXISTS itens_pedido(

id INTEGER PRIMARY KEY AUTOINCREMENT,

pedido_id INTEGER,

produto_id INTEGER,

quantidade INTEGER,

subtotal REAL

)
`);




db.run(`
CREATE TABLE IF NOT EXISTS caixa(

id INTEGER PRIMARY KEY AUTOINCREMENT,

pedido_id INTEGER,

valor REAL,

forma_pagamento TEXT,

data TEXT

)
`);




db.run(`
INSERT OR IGNORE INTO usuarios
(nome,email,senha,cargo)

VALUES

(
'Administrador',
'admin@bocao.com',
'123456',
'Gerente'
)

`);





db.run(`
INSERT OR IGNORE INTO setores(id,nome)
VALUES
(1,'Atendimento'),
(2,'Cozinha'),
(3,'Caixa'),
(4,'Retirada')
`);




});





// ===============================
// LOGIN
// ===============================


app.post("/login",(req,res)=>{


const {email,senha}=req.body;



db.get(

`
SELECT *
FROM usuarios
WHERE email=?
AND senha=?

`,

[email,senha],

(err,row)=>{


if(err)
return res.status(500).json(err);



if(!row){

return res.status(401).json({

sucesso:false,
mensagem:"Usuário ou senha inválidos."

});

}



res.json({

sucesso:true,

usuario:{

id:row.id,
nome:row.nome,
cargo:row.cargo

}

});


}


);


});





// ===============================
// PRODUTOS
// ===============================



app.get("/produtos",(req,res)=>{


db.all(

"SELECT * FROM produtos ORDER BY nome",

[],

(err,rows)=>{


if(err)
return res.status(500).json(err);


res.json(rows);


}


);


});






app.post("/produtos",(req,res)=>{


const {

nome,
descricao,
categoria,
preco

}=req.body;



db.run(

`
INSERT INTO produtos

(nome,descricao,categoria,preco)

VALUES(?,?,?,?)

`,

[
nome,
descricao,
categoria,
preco
],

function(err){


if(err)
return res.status(500).json(err);



res.json({

mensagem:"Produto cadastrado",

id:this.lastID

});


}


);


});





app.put("/produtos/:id",(req,res)=>{


const {

nome,
descricao,
categoria,
preco

}=req.body;



db.run(

`
UPDATE produtos

SET

nome=?,
descricao=?,
categoria=?,
preco=?

WHERE id=?

`,

[

nome,
descricao,
categoria,
preco,
req.params.id

],

err=>{


if(err)
return res.status(500).json(err);



res.json({

mensagem:"Produto atualizado"

});


}


);



});





app.delete("/produtos/:id",(req,res)=>{


db.run(

"DELETE FROM produtos WHERE id=?",

[req.params.id],

err=>{


if(err)
return res.status(500).json(err);


res.json({

mensagem:"Produto excluído"

});


}


);



});

// ===============================
// SETORES
// ===============================


app.get("/setores",(req,res)=>{


db.all(

"SELECT * FROM setores",

[],

(err,rows)=>{


res.json(rows);


}


);


});





app.post("/setores",(req,res)=>{


const {nome}=req.body;


if(!nome){

return res.status(400).json({

mensagem:"Informe o nome do setor."

});

}



db.run(

"INSERT INTO setores(nome) VALUES(?)",

[nome],

function(err){


if(err)
return res.status(500).json(err);



res.json({

mensagem:"Setor cadastrado",

id:this.lastID

});


}


);


});






// ===============================
// PEDIDOS
// ===============================


app.post("/pedidos",(req,res)=>{

const {

observacao,
forma_pagamento,
setor,
itens

}=req.body;

let valor_total = 0;

// Gera automaticamente a próxima senha
db.get(

"SELECT MAX(CAST(senha_cliente AS INTEGER)) AS ultima FROM pedidos",

[],

(err,row)=>{

if(err)
return res.status(500).json(err);

const proximaSenha = (row?.ultima || 0) + 1;

// Gera 001, 002, 003...
const senha_cliente = proximaSenha
    .toString()
    .padStart(3, "0");

db.run(

`
INSERT INTO pedidos

(
senha_cliente,
observacao,
forma_pagamento,
valor_total,
status,
setor,
data
)

VALUES(?,?,?,?,?,?,?)

`,

[

senha_cliente,
observacao,
forma_pagamento,
0,
"Recebido",
setor,
new Date().toISOString()

],

function(err){

if(err)
return res.status(500).json(err);

const pedido_id = this.lastID;

let concluidos = 0;

itens.forEach(item=>{

db.get(

"SELECT preco FROM produtos WHERE id=?",

[item.produto_id],

(err,produto)=>{

if(err)
return res.status(500).json(err);

const subtotal = produto.preco * item.quantidade;

valor_total += subtotal;

db.run(

`
INSERT INTO itens_pedido
(
pedido_id,
produto_id,
quantidade,
subtotal
)
VALUES(?,?,?,?)
`,

[
pedido_id,
item.produto_id,
item.quantidade,
subtotal
]

);

concluidos++;

if(concluidos === itens.length){

db.run(

`
UPDATE pedidos
SET valor_total=?
WHERE id=?
`,

[
valor_total,
pedido_id
],

(err)=>{

if(err)
return res.status(500).json(err);

res.json({

mensagem:"Pedido criado",

id:pedido_id,

senha_cliente,

valor_total

});

}

);

}

});

});

}

);

});

});


// ===============================
// LISTAR PEDIDOS
// ===============================


app.get("/pedidos",(req,res)=>{


db.all(

`
SELECT *

FROM pedidos

ORDER BY id DESC

`,

[],

(err,pedidos)=>{


if(err)
return res.status(500).json(err);



let resultado=[];

let contador=0;



if(pedidos.length===0){

return res.json([]);

}




pedidos.forEach(pedido=>{


db.all(

`
SELECT

produtos.nome,

itens_pedido.quantidade,

itens_pedido.subtotal


FROM itens_pedido


INNER JOIN produtos

ON produtos.id = itens_pedido.produto_id


WHERE pedido_id=?

`,

[pedido.id],


(err,itens)=>{


resultado.push({

...pedido,

itens:itens

});



contador++;



if(contador===pedidos.length){

res.json(resultado);

}



}



);



});



}



);



});






// ===============================
// ALTERAR STATUS DO PEDIDO
// ===============================


app.put("/pedidos/:id/status",(req,res)=>{


const {status}=req.body;



db.get(

"SELECT status FROM pedidos WHERE id=?",

[req.params.id],


(err,pedido)=>{


if(err){

return res.status(500).json(err);

}




if(!pedido){

return res.status(404).json({

mensagem:"Pedido não encontrado"

});

}




const fluxo = {

    "Recebido":[
        "Em preparo",
        "Pronto"
    ],

    "Em preparo":[
        "Pronto"
    ],

    "Pronto":[
        "Finalizado"
    ],

    "Finalizado":[
        "Entregue"
    ],

    "Entregue":[]

};





if(!fluxo[pedido.status].includes(status)){


return res.status(400).json({

mensagem:

`Não permitido: ${pedido.status} → ${status}`


});


}





db.run(

`

UPDATE pedidos

SET status=?

WHERE id=?

`,

[

status,

req.params.id

],


function(err){


if(err)
return res.status(500).json(err);



res.json({

mensagem:"Status atualizado",

status:status

});



}



);



}



);



});

// ===============================
// CAIXA
// ===============================


app.post("/caixa",(req,res)=>{


const {

pedido_id,
valor,
forma_pagamento

}=req.body;



db.run(

`

INSERT INTO caixa

(
pedido_id,
valor,
forma_pagamento,
data
)

VALUES(?,?,?,?)

`,

[

pedido_id,

valor,

forma_pagamento,

new Date().toISOString()

],



function(err){


if(err){

return res.status(500).json(err);

}



res.json({

mensagem:"Pagamento registrado",

id:this.lastID

});



}



);



});






// ===============================
// HISTÓRICO DE VENDAS
// ===============================


app.get("/vendas",(req,res)=>{


db.all(

`

SELECT *

FROM caixa

ORDER BY id DESC

`,

[],

(err,rows)=>{


if(err){

return res.status(500).json(err);

}



res.json(rows);



}


);



});






// ===============================
// RELATÓRIOS
// ===============================


app.get("/relatorios/vendas",(req,res)=>{


db.get(

`

SELECT

COUNT(*) AS quantidade_vendas,

SUM(valor) AS total_vendido


FROM caixa

`,

[],

(err,row)=>{


if(err){

return res.status(500).json(err);

}



res.json(row);



}



);



});







// ===============================
// LIMPAR PEDIDOS TESTE
// ===============================


app.delete("/limpar-pedidos",(req,res)=>{

    db.serialize(()=>{

        db.run("DELETE FROM itens_pedido");

        db.run("DELETE FROM pedidos");

        // Reinicia o contador das tabelas
        db.run("DELETE FROM sqlite_sequence WHERE name='pedidos'");

        db.run("DELETE FROM sqlite_sequence WHERE name='itens_pedido'");

        res.json({
            mensagem:"Pedidos apagados. Senha reiniciada para 1."
        });

    });

});


// ===============================
// PRÓXIMA SENHA
// ===============================

app.get("/proxima-senha", (req, res) => {

    db.get(
        "SELECT MAX(CAST(senha_cliente AS INTEGER)) AS ultima FROM pedidos",
        [],
        (err, row) => {

            if (err) {
                return res.status(500).json(err);
            }

            let proxima = 1;

            if (row && row.ultima) {
                proxima = row.ultima + 1;
            }

            res.json({
                senha: String(proxima).padStart(3, "0")
            });

        }
    );

});


// ===============================
// SERVIDOR
// ===============================


app.listen(3000,()=>{


console.log(
"Servidor rodando na porta 3000"
);


});