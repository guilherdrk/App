const { select, input, checkbox} = require('@inquirer/prompts');
const fs = require("fs").promises

let mensagem = "Bem-vindo ao APP de metas";



const carregarMetas = async () => {
    try {
        const dados = await fs.readFile("metas.json", "utf-8");
        metas = JSON.parse(dados);
    } catch (erro) {
        console.error("Erro ao carregar metas:", erro.message);
        metas = []; // Se der erro, inicializa com array vazio
    }
}

const salvarMetas = async () => {
    try {
        await fs.writeFile("metas.json", JSON.stringify(metas, null, 2), "utf-8");
        console.log("Metas salvas com sucesso.");
    } catch (erro) {
        console.error("Erro ao salvar metas:", erro.message);
    }
}


const cadastrarMeta = async ()=> {
    const meta = await input({ message: "Digite a meta:"});

    if(meta.length == 0){
        console.log("A meta não pode ser vazia.");
        return;
    }
    metas.push(
        { value: meta, checked: false }
    );

    mensagem = "Meta cadastrada com sucesso";
}

const listarMetas = async () => {
    if(metas.length == 0){
        mensagem = "Não existem metas!";
        return
    }

    const respostas = await checkbox({
        message: "Use as setas para mudar de meta, o espaço para marcar ou desmarcar e o Enter para finalizar essa etapa",
        choices: [...metas], // spread operator 
        instructions: false
    });

    metas.forEach((m) => {
        m.checked = false;
    })     

    if(respostas.length == 0){
        mensagem = "Nenhuma meta selecionada!";
        return;
    }

    

    respostas.forEach((resposta) => {
        const meta = metas.find((m) => {
            return m.value == resposta; // que retorna um valor logico (sim) ou (não)
        }); //find serve para procurar
        meta.checked = true;
    }); // forEach(para cara)
    mensagem = 'Meta(s) marcadas como concluída(s)!';
}

const metasRealizadas = async () =>{
    if(metas.length == 0){
        mensagem = "Não existem metas!";
        return
    }
    

    const realizadas = metas.filter((meta) => {
        return meta.checked == true;
    })

    if(realizadas.length == 0){
        mensagem = 'Não existem metas realizadas! :(';
        return
    }

    await select({
        message: "Metas realizadas: " + realizadas.length,
        choices: [...realizadas]
    })
}


const metasAbertas = async ()=>{
    if(metas.length == 0){
        mensagem = "Não existem metas!";
        return
    }
    

    const abertas = metas.filter((meta) =>{
        return meta.checked != true;
    })

    if(abertas.length == 0){
        mensagem = 'Não existem metas abertas';
        return
    }

    await select({
        message: "Metas Abertas: " + abertas.length,
        choices: [...abertas]
    })
}

const deletarMetas = async ()=>{
    if(metas.length == 0){
        mensagem = "Não existem metas!";
        return
    }
    

    const metasDesmarcadas = metas.map((meta) => {
        // meta.checked = false;
        return {value: meta.value, checked: false}
    })
    const itemsADeletar = await checkbox({
        message: "Selecione item para deletar",
        choices: [...metasDesmarcadas],
        instructions: false
    })

    if(itemsADeletar == 0){
        mensagem = "Nenhum item para deletar";
        return 
    }

    itemsADeletar.forEach((item) =>{
        metas = metas.filter((meta) =>{
            return meta.value != item
        })
    })
    mensagem = "Meta(s) deletada(s) com suceeso";
}

const mostrarMensagem = () =>{
    console.clear();

    if(mensagem != ""){
        console.log(mensagem);
        console.log("");
        mensagem = "";
    }
}
 
const start = async () => {
    carregarMetas();

    while(true){
        mostrarMensagem();
        await salvarMetas();

        const opcao = await select({
            message: "Menu >",
            choices: [
                {
                    name: "Cadastrar meta",
                    value: "cadastrar"
                },
                {
                    name: "Listar metas",
                    value: "listar"
                },
                {
                    name: "Metas realizadas",
                    value: "realizadas"
                },
                {
                    name: "Metas abertas",
                    value: "abertas"
                },
                {
                    name: "Deletar metas",
                    value: "deletar"
                },
                {
                    name: "Sair",
                    value: "sair"
                }
            ]
        });

        switch(opcao){
            case "cadastrar":
                await cadastrarMeta(); //sempre que eu for usar uma função async eu coloco na frente dela o await

                break;
            case "listar":
                await listarMetas();

                break;
            case "realizadas":
                await metasRealizadas();
                break;
            case "abertas":
                await metasAbertas();
                break;
            case "deletar":
                await deletarMetas();
                break;
            case "sair":
                console.log("Até a proxima!");
                return;    
        };
    };
};

start();