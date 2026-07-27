const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("database.db");


// ===============================
// CRIAÇÃO DO BANCO
// ===============================

db.serialize(() => {


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
            produto_id INTEGER,
            quantidade INTEGER,
            observacao TEXT,
            forma_pagamento TEXT,
            valor_total REAL,
            status TEXT,
            setor TEXT,
            data TEXT,

            FOREIGN KEY(produto_id)
            REFERENCES produtos(id)
        )
    `);


    db.run(`
        CREATE TABLE IF NOT EXISTS caixa(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER,
            valor REAL,
            forma_pagamento TEXT,
            data TEXT,

            FOREIGN KEY(pedido_id)
            REFERENCES pedidos(id)
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
        (1,'Atendimento')
    `);


    db.run(`
        INSERT OR IGNORE INTO setores(id,nome)
        VALUES
        (2,'Cozinha')
    `);


    db.run(`
        INSERT OR IGNORE INTO setores(id,nome)
        VALUES
        (3,'Caixa')
    `);


    db.run(`
        INSERT OR IGNORE INTO setores(id,nome)
        VALUES
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
        SELECT * FROM usuarios
        WHERE email=?
        AND senha=?
        `,

        [email,senha],


        (err,row)=>{


            if(err){
                return res.status(500).json(err);
            }


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


            if(err){
                return res.status(500).json(err);
            }


            res.json(rows);


        }

    );


});




app.get("/produtos/:id",(req,res)=>{


    db.get(

        "SELECT * FROM produtos WHERE id=?",

        [req.params.id],


        (err,row)=>{


            if(err){
                return res.status(500).json(err);
            }


            res.json(row);


        }

    );


});




app.post("/produtos",(req,res)=>{


    const {
        nome,
        descricao,
        categoria,
        preco
    } = req.body;



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


            if(err){
                return res.status(500).json(err);
            }


            res.json({

                mensagem:"Produto cadastrado!",
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
    } = req.body;



    db.run(

        `
        UPDATE produtos SET

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


            if(err){
                return res.status(500).json(err);
            }


            res.json({
                mensagem:"Produto atualizado."
            });


        }

    );


});




app.delete("/produtos/:id",(req,res)=>{


    db.run(

        "DELETE FROM produtos WHERE id=?",


        [
            req.params.id
        ],


        err=>{


            if(err){
                return res.status(500).json(err);
            }


            res.json({
                mensagem:"Produto excluído."
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




// ===============================
// PEDIDOS
// ===============================


app.post("/pedidos",(req,res)=>{


const {

senha_cliente,
produto_id,
quantidade,
observacao,
forma_pagamento,
setor

}=req.body;



db.get(

"SELECT preco FROM produtos WHERE id=?",

[produto_id],


(err,produto)=>{


    if(err){
        return res.status(500).json(err);
    }


    const valor_total =
    produto.preco * quantidade;



    db.run(

    `
    INSERT INTO pedidos

    (
    senha_cliente,
    produto_id,
    quantidade,
    observacao,
    forma_pagamento,
    valor_total,
    status,
    setor,
    data
    )

    VALUES(?,?,?,?,?,?,?,?,?)

    `,


    [

    senha_cliente,
    produto_id,
    quantidade,
    observacao,
    forma_pagamento,
    valor_total,
    "Recebido",
    setor,
    new Date().toISOString()

    ],


    function(err){


        res.json({

            mensagem:"Pedido criado!",
            id:this.lastID,
            valor_total

        });


    }


    );


});


});





app.get("/pedidos",(req,res)=>{


db.all(

`
SELECT

pedidos.*,
produtos.nome AS produto

FROM pedidos

INNER JOIN produtos

ON produtos.id = pedidos.produto_id

ORDER BY pedidos.id DESC

`,

[],


(err,rows)=>{


res.json(rows);


}


);


});





app.put("/pedidos/:id/status",(req,res)=>{


const {status}=req.body;



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


err=>{


res.json({
mensagem:"Status atualizado."
});


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


res.json({

mensagem:"Pagamento registrado.",
id:this.lastID

});


}


);


});





app.get("/vendas",(req,res)=>{


db.all(

"SELECT * FROM caixa ORDER BY id DESC",

[],

(err,rows)=>{

res.json(rows);

}


);


});




// ===============================
// RELATÓRIO
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


res.json(row);


}


);


});




// ===============================
// SERVIDOR
// ===============================


app.listen(3000,()=>{

    console.log("Servidor rodando na porta 3000");

});