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

app.listen(PORTA, () => {
  console.log("API rodando em http://localhost:" + PORTA);
});