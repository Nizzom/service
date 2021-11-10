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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Service = /** @class */ (function () {
    function Service(options) {
        this.transport = options.transport;
        this.isClusterMode = !!options.cluster;
        if (this.isClusterMode) {
            this.clusterOptions = options.cluster;
        }
    }
    Service.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isClusterMode) return [3 /*break*/, 8];
                        if (!this.clusterOptions.isMaster) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.startCluster()];
                    case 1:
                        _a.sent();
                        if (!this.transport.isPermanentConnection) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.startTransport()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 7];
                    case 4: return [4 /*yield*/, this.startWorker()];
                    case 5:
                        _a.sent();
                        if (!!this.transport.isPermanentConnection) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.startTransport()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [3 /*break*/, 11];
                    case 8: return [4 /*yield*/, this.startWorker()];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, this.startTransport()];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    Service.prototype.startTransport = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    Service.prototype.startWorker = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.pid = process.pid;
                this.PORT = 2000;
                this.http = require("http");
                console.log("Worker pid: " + process.pid);
                this.dispatcher = function (req, res) {
                    console.log(req.url);
                    res.setHeader("Process-Id", process.pid);
                    res.end("Hello from worker " + process.pid);
                };
                this.server = this.http.createServer(this.dispatcher);
                this.server.listen(null);
                process.on("message", function (message, socket) {
                    if (message.name === "socket") {
                        socket.server = _this.server;
                        _this.server.emit("connection", socket);
                    }
                });
                process.on("SIGINT", function () {
                    console.log("Signal SIGINT");
                    _this.server.close(function () {
                        process.exit(0);
                    });
                });
                process.on("SIGTERM", function () {
                    console.log("Signal SIGTERM");
                    _this.server.close(function () {
                        process.exit(0);
                    });
                });
                process.on("SIGUSR2", function () {
                    console.log("Signal SIGUSR2");
                    _this.server.close(function () {
                        process.exit(1);
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    Service.prototype.startCluster = function () {
        return __awaiter(this, void 0, void 0, function () {
            var i, work;
            var _this = this;
            return __generator(this, function (_a) {
                this.pid = process.pid;
                this.net = require("net");
                this.os = require("os");
                this.cpus = this.os.cpus().length;
                console.log("Master pid: " + this.pid);
                console.log("Starting " + this.cpus + " forks");
                this.workers = [];
                for (i = 0; i < this.cpus; i++) {
                    work = cluster.fork();
                    this.workers.push(work);
                }
                this.clusterOptions.on('exit', function (worker, code) {
                    console.log("Worker died. Pid : " + worker.process.pid + ". Code : " + code);
                    if (code === 1) {
                        cluster.fork();
                    }
                });
                this.ipToInt = function (ip) {
                    return ip.split(".").reduce(function (res, item) { return (res << 8) + +item; }, 0);
                };
                this.balancer = function (socket) {
                    var ip = _this.ipToInt(socket.remoteAddress);
                    var id = Math.abs(ip) % _this.cpus;
                    var worker = _this.workers[id];
                    if (worker)
                        worker.send({ name: "socket" }, socket);
                };
                this.server = new this.net.Server(this.balancer);
                this.server.listen(2000);
                return [2 /*return*/];
            });
        });
    };
    return Service;
}());
var cluster = require("cluster");
var service = new Service({
    transport: { isPermanentConnection: true },
    cluster: cluster
});
service.start();
