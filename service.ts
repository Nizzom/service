// Класс является сервером обработки запросов.
// в конструкторе передается транспорт, и настройки кластеризации
// сервер может работать как в одном процессе так и порождать для обработки запросов дочерние процессы.
// Задача дописать недостающие части и отрефакторить существующий код.
// Использовать функционал модуля cluster - не лучшая идея. Предпочтительный вариант - порождение процессов через child_process
// Мы ожидаем увидеть реализацию работы с межпроцессным взаимодействием в том виде, в котором вы сможете.
// Контроль жизни дочерних процессов должен присутствовать в качестве опции.
// Должна быть возможность включать\отключать пересоздание процессов в случае падения
// Предпочтительно увидеть различные режимы балансировки входящих запросов.
//
// Не важно, http/ws/tcp/ или простой сокет это все изолируется в транспорте.
// Единственное что знает сервис обработки запросов это тип подключения транспорта, постоянный или временный
// и исходя из этого создает нужную конфигурацию. ну и еще от того какой режим кластеризации был выставлен
// В итоговом варианте ожидаем увидеть код в какой-либо системе контроля версия (github, gitlab) на ваш выбор
// Примеры использования при том или ином транспорте
// Будет плюсом, если задействуете в этом деле typescript и статическую типизацию.
// Вам не нужна привязка к каким-либо фрэймворкам или нестандартным библиотекам. Все реализуется при помощи встроенных модулей nodejs
// Если вам что-то не понятно, задавайте вопросы.
// Если вы не умеете применять принципы ООП, не начинайте задание
// Если вы не готовы тратить время на задачу, говорите об этом сразу и не приступайте к выполнению.

class Service {
  transport: any
  isClusterMode: boolean
  clusterOptions: any
  pid: number
  PORT: number
  http: any
  dispatcher: Function
  server: any
  net: any
  os: any
  cpus: number
  workers: String[]
  ipToInt: Function
  balancer: Function

  constructor(options) {
    this.transport  = options.transport;
    this.isClusterMode = !!options.cluster;
    if (this.isClusterMode) {
      this.clusterOptions = options.cluster;
    }
  }

  async start() {
    if (this.isClusterMode) {
      if (this.clusterOptions.isMaster) {
        await this.startCluster();
        if (this.transport.isPermanentConnection) {
          await this.startTransport();
        }
      } else {
        await this.startWorker();
        if (!this.transport.isPermanentConnection) {
          await this.startTransport();
        }
      }
    } else {
      await this.startWorker();
      await this.startTransport();
    }
  }

  async startTransport() {
    //todo: логика запуска транспорта
  }

  async startWorker() {
    this.pid = process.pid;
    this.PORT = 2000;
    this.http = require("http");

    console.log(`Worker pid: ${process.pid}`);

    this.dispatcher = (req, res) => {
      console.log(req.url);
      res.setHeader("Process-Id", process.pid);
      res.end(`Hello from worker ${process.pid}`);
    };

    this.server = this.http.createServer(this.dispatcher);
    this.server.listen(null);

    process.on("message", (message: any, socket : any) => {
      if (message.name === "socket") {
        socket.server = this.server ;
        this.server.emit("connection", socket);
      }
    });

    process.on("SIGINT", () => {
      console.log(`Signal SIGINT`);
      this.server.close(() => {
        process.exit(0);
      });
    });
    process.on("SIGTERM", () => {
      console.log(`Signal SIGTERM`);
      this.server.close(() => {
        process.exit(0);
      });
    });
    process.on("SIGUSR2", () => {
      console.log(`Signal SIGUSR2`);
      this.server.close(() => {
        process.exit(1);
      });
    });
    //todo: логика запуска обработчика запросов
  }

  async startCluster() {
    this.pid = process.pid;
    this.net = require("net");
    this.os = require("os");
    this.cpus = this.os.cpus().length;
    console.log(`Master pid: ${this.pid}`);
    console.log(`Starting ${this.cpus} forks`);

    this.workers = [];

    for (let i = 0; i < this.cpus; i++) {
      const work :any = cluster.fork();
      this.workers.push(work);
    }
    this.clusterOptions.on('exit', (worker, code) => {
      console.log(`Worker died. Pid : ${worker.process.pid}. Code : ${code}`)
      if (code === 1) {
      cluster.fork()
      }
    })

    this.ipToInt = (ip) =>
      ip.split(".").reduce((res, item) => (res << 8) + +item, 0);

    this.balancer = (socket) => {
      const ip = this.ipToInt(socket.remoteAddress);
      const id = Math.abs(ip) % this.cpus;
      const worker: any = this.workers[id];
      if (worker) worker.send({ name: "socket" }, socket);
    };

    this.server = new this.net.Server(this.balancer);
    this.server.listen(2000);
    //todo: логика запуска дочерних процессов
  }
}

const cluster = require("cluster");
const service = new Service({
  transport: { isPermanentConnection: true },
  cluster
});
service.start();
