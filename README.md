# BRCAP-Utils
Biblioteca utilitária utilizada pela equipe de desenvolvimento da Brasil Cap.

## Instalação
`$ npm install brcap-utils`

## Método utilitário para Validação de CPF
Exemplo de utilização:

    const Util = require('brcap-utils');
    let cpfEhValido = Util.cpfEhValido('423.375.020-07');
    if(cpfEhValido){
        //faz algo
    }
