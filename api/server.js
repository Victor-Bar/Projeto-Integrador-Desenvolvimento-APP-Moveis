const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const PORTA = 3333;

function ler(arquivo) {
  const caminho = path.join(__dirname, "dados", arquivo);
  return JSON.parse(fs.readFileSync(caminho, "utf-8"));
}

function salvar(arquivo, lista) {
  const caminho = path.join(__dirname, "dados", arquivo);
  fs.writeFileSync(caminho, JSON.stringify(lista, null, 2));
}

function proximoId(lista) {
  let maior = 0;
  for (const item of lista) {
    if (item.id > maior) maior = item.id;
  }
  return maior + 1;
}

function validarContato(contato) {
  const erros = [];
   const nome = contato.nome || "";
  const telefone = (contato.telefone || "").replace(/\D/g, "");
  const cpf = (contato.cpf || "").replace(/\D/g, "");

  if (nome.trim().length < 3) erros.push("O nome precisa ter pelo menos 3 letras.");
  if (/[0-9]/.test(nome)) erros.push("O nome não pode ter números.");
  if (telefone.length < 10 || telefone.length > 11) erros.push("O telefone precisa ter 10 ou 11 números, com DDD.");
  if (cpf.length > 0 && cpf.length !== 11) erros.push("O CPF precisa ter 11 números.");
  if (contato.idUsuario === undefined) {
    erros.push("O campo 'idUsuario' é obrigatório.");
  } else {
    const usuarios = ler("usuarios.json");
    const existe = usuarios.some((u) => u.id === Number(contato.idUsuario));
    if (!existe) erros.push("Não existe usuária com id " + contato.idUsuario + ".");
  }
  return erros;
}

app.get("/contatos", (req, res) => {
  res.json(ler("contatos.json"));
});

app.get("/contatos/:id", (req, res) => {
  const contatos = ler("contatos.json");
  const contato = contatos.find((c) => c.id === Number(req.params.id));
  if (!contato) {
    return res.status(404).json({ erro: "Contato não encontrado." });
  }
  res.json(contato);
});

app.post("/contatos", (req, res) => {
  const erros = validarContato(req.body);
  if (erros.length > 0) {
    return res.status(400).json({ erros: erros });
  }
  const contatos = ler("contatos.json");
  const novo = {
    id: proximoId(contatos),
    idUsuario: Number(req.body.idUsuario),
    nome: req.body.nome,
    cpf: req.body.cpf || "",
    telefone: req.body.telefone,
    endereco: req.body.endereco || "",
    nota: req.body.nota || "",
  };
  contatos.push(novo);
  salvar("contatos.json", contatos);
  res.status(201).json(novo);
});

app.put("/contatos/:id", (req, res) => {
  const contatos = ler("contatos.json");
  const indice = contatos.findIndex((c) => c.id === Number(req.params.id));
  if (indice === -1) {
    return res.status(404).json({ erro: "Contato não encontrado." });
  }
  const atualizado = { ...contatos[indice], ...req.body, id: contatos[indice].id };
  const erros = validarContato(atualizado);
  if (erros.length > 0) {
    return res.status(400).json({ erros: erros });
  }
  contatos[indice] = atualizado;
  salvar("contatos.json", contatos);
  res.json(atualizado);
});

app.delete("/contatos/:id", (req, res) => {
  const contatos = ler("contatos.json");
  const indice = contatos.findIndex((c) => c.id === Number(req.params.id));
  if (indice === -1) {
    return res.status(404).json({ erro: "Contato não encontrado." });
  }
  const removido = contatos[indice];
  contatos.splice(indice, 1);
  salvar("contatos.json", contatos);
  res.json(removido);
});

app.listen(PORTA, () => {
  console.log("API rodando em http://localhost:" + PORTA);
});