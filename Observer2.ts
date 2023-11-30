// Importando as bibliotecas necessárias
import * as fs from 'fs';
import * as readline from 'readline';

// Definindo a interface do observador
interface Observer {
  update(event: string, data: any): void;
}

// Definindo a classe abstrata do editor
abstract class Editor {
  // Atributos privados
  private observers: Observer[] = [];
  private fileName: string;
  private content: string[] = [];

  // Construtor que recebe o nome do arquivo
  constructor(fileName: string) {
    this.fileName = fileName;
  }

  // Método para adicionar um observador
  public addObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  // Método para remover um observador
  public removeObserver(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  // Método para notificar os observadores sobre um evento
  protected notify(event: string, data: any): void {
    for (const observer of this.observers) {
      observer.update(event, data);
    }
  }

  // Método para inserir uma linha no conteúdo
  public insertLine(lineNumber: number, text: string): void {
    if (lineNumber >= 0 && lineNumber <= this.content.length) {
      this.content.splice(lineNumber, 0, text);
      this.notify('insert', { lineNumber, text });
    } else {
      throw new Error('Número de linha inválido');
    }
  }

  // Método para remover uma linha do conteúdo
  public removeLine(lineNumber: number): void {
    if (lineNumber >= 0 && lineNumber < this.content.length) {
      const text = this.content.splice(lineNumber, 1)[0];
      this.notify('remove', { lineNumber, text });
    } else {
      throw new Error('Número de linha inválido');
    }
  }

  // Método para obter o conteúdo como uma string
  public getContent(): string {
    return this.content.join('\n');
  }

  // Método para obter o nome do arquivo
  public getFileName(): string {
    return this.fileName;
  }

  // Método abstrato para abrir o editor
  public abstract open(): void;

  // Método abstrato para salvar o conteúdo no arquivo
  public abstract save(): void;
}

// Definindo a subclasse do editor de texto
class TextEditor extends Editor {
  // Construtor que recebe o nome do arquivo e chama o construtor da superclasse
  constructor(fileName: string) {
    super(fileName);
  }

  // Método para abrir o editor e disparar o evento "open"
  public open(): void {
    this.notify('open', this.getFileName());
  }

  // Método para salvar o conteúdo no arquivo e disparar o evento "save"
  public save(): void {
    fs.writeFileSync(this.getFileName(), this.getContent());
    this.notify('save', this.getFileName());
  }
}

// Definindo a classe do observador de eventos
class EventObserver implements Observer {
  // Método para atualizar o observador sobre um evento
  public update(event: string, data: any): void {
    console.log(`Evento: ${event}, Dados: ${JSON.stringify(data)}`);
  }
}

// Definindo a classe do observador de conteúdo
class ContentObserver implements Observer {
  // Método para atualizar o observador sobre um evento
  public update(event: string, data: any): void {
    if (event === 'save') {
      const fileName = data as string;
      const content = fs.readFileSync(fileName, 'utf-8');
      console.log(`Conteúdo do arquivo ${fileName}:`);
      console.log(content);
    }
  }
}

// Criando uma instância do editor de texto
const textEditor = new TextEditor('texto.txt');

// Criando uma instância do observador de eventos
const eventObserver = new EventObserver();

// Criando uma instância do observador de conteúdo
const contentObserver = new ContentObserver();

// Adicionando os observadores ao editor de texto
textEditor.addObserver(eventObserver);
textEditor.addObserver(contentObserver);

// Abrindo o editor de texto e disparando o evento "open"
textEditor.open();

// Criando uma interface para ler as entradas do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Definindo uma função para ler as linhas de texto do usuário
function readLines(): void {
  // Perguntando ao usuário o número da linha e o texto
  rl.question('Digite o número da linha e o texto separados por espaço ou EOF para encerrar: ', (answer) => {
    // Verificando se o usuário digitou EOF
    if (answer === 'EOF') {
      // Salvando o conteúdo no arquivo e disparando o evento "save"
      textEditor.save();
      // Encerrando a interface
      rl.close();
    } else {
      // Separando o número da linha e o texto
      const [lineNumber, ...text] = answer.split(' ');
      // Convertendo o número da linha para um inteiro
      const line = parseInt(lineNumber, 10);
      // Juntando o texto com espaços
      const textLine = text.join(' ');
      // Inserindo a linha no conteúdo e disparando o evento "insert"
      textEditor.insertLine(line, textLine);
      // Chamando a função novamente
      readLines();
    }
  });
}

// Chamando a função para ler as linhas de texto do usuário
readLines();
