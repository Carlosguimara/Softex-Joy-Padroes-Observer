const leitor = require('readline-sync')

// Definir a interface Observer com o método update()
interface Observer {
    update(event: string, data: any): void;
  }
  
  // Definir a classe Editor que é o Subject do padrão Observer
  class Editor {
    private observers: Observer[] = [];
  
    // Adicionar um observer à lista de observadores
    attach(observer: Observer) {
      this.observers.push(observer);
    }
  
    // Remover um observer da lista de observadores
    detach(observer: Observer) {
      let index = this.observers.indexOf(observer);
      if (index !== -1) {
        this.observers.splice(index, 1);
      }
    }
  
    // Notificar os observadores sobre um evento
    notify(event: string, data: any) {
      for (let observer of this.observers) {
        observer.update(event, data);
      }
    }
  }
  
  // Definir uma subclasse da classe Editor chamada TextEditor
  class TextEditor extends Editor {
    private lines: string[] = [];
  
    // Inserir o texto na ordem correspondente a lineNumber e deslocar as linhas posteriores se necessário
    insertLine(lineNumber: number, text: string) {
      this.lines.splice(lineNumber, 0, text);
      this.notify("insert", { lineNumber, text });
    }
  
    // Deletar o texto da linha correspondente e deslocar as linhas posteriores se necessário
    removeLine(lineNumber: number) {
      let text = this.lines.splice(lineNumber, 1)[0];
      this.notify("remove", { lineNumber, text });
    }
  
    // Retornar o conteúdo do editor como uma string
    getContent(): string {
      return this.lines.join("\n");
    }
  }
  
  // Definir uma classe concreta que implementa a Observer para salvar o conteúdo do editor em um arquivo
  class FileSaver implements Observer {
    private fileName: string;
  
    constructor(fileName: string) {
      this.fileName = fileName;
    }
  
    // Atualizar o arquivo com base no evento e nos dados recebidos
    update(event: string, data: any) {
      switch (event) {
        case "open":
          // Criar um novo arquivo vazio
          console.log(`Criando um novo arquivo: ${this.fileName}`);
          break;
        case "save":
          // Escrever o conteúdo do editor no arquivo
          console.log(`Salvando o conteúdo do editor no arquivo: ${this.fileName}`);
          console.log(data.content);
          break;
        case "insert":
          // Escrever a linha inserida no arquivo
          console.log(`Inserindo a linha ${data.lineNumber + 1} no arquivo: ${this.fileName}`);
          console.log(data.text);
          break;
        case "remove":
          // Apagar a linha removida do arquivo
          console.log(`Removendo a linha ${data.lineNumber + 1} do arquivo: ${this.fileName}`);
          console.log(data.text);
          break;
        default:
          // Ignorar outros eventos
          break;
      }
    }
  }
  
  // Instanciar um TextEditor e disparar o evento "open"
  let textEditor = new TextEditor();
  textEditor.attach(new FileSaver("texto.txt"));
  textEditor.notify("open", null);
  
  // Receber as linhas de textos, que serão inseridas no objeto textEditor, do usuário até que ele envie o texto “EOF” que não deve ser inserido no objeto textEditor
  let input: string = leitor.question("Digite uma linha de texto ou EOF para terminar:");
  let lineNumber = 0;
  while (input !== "EOF") {
    textEditor.insertLine(lineNumber, input);
    lineNumber++;
    input = leitor.question("Digite uma linha de texto ou EOF para terminar:");
  }
  
  // Por fim o textEditor deve disparar o evento "save" para que o conteúdo seja salvo no arquivo configurado e imprimir todo o conteúdo do arquivo na tela
  textEditor.notify("save", { content: textEditor.getContent() });