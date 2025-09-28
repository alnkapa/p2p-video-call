const turn = require('node-turn');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

class SignalingTurnServer {
    constructor() {
        this.sessions = new Map();
        this.setupTurnServer();
        this.setupSignalingServer();
    }

    setupTurnServer() {
        this.turnServer = new turn({
            listeningPort: 3478,
            listeningIps: ['0.0.0.0'],
            relayIps: ['0.0.0.0'],
            externalIps: {
                '': process.env.PUBLIC_IP || 'auto'
            },
            minPort: 49152,
            maxPort: 65535,
            authMech: 'long-term',
            credentials: {
                [process.env.TURN_USER || 'user']: process.env.TURN_PASSWORD || 'password'
            },
            debugLevel: 'INFO'
        });

        this.turnServer.start();
        console.log('TURN сервер запущен на порту 3478');
    }

    setupSignalingServer() {
        this.wss = new WebSocket.Server({ port: 8080 });
        console.log('Signaling сервер запущен на порту 8080');

        this.wss.on('connection', (ws) => {
            const clientId = uuidv4();
            console.log(`Новое подключение: ${clientId}`);

            ws.clientId = clientId;
            this.setupMessageHandlers(ws);
        });
    }

    setupMessageHandlers(ws) {
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                this.handleMessage(ws, message);
            } catch (error) {
                console.error('Ошибка парсинга сообщения:', error);
            }
        });

        ws.on('close', () => {
            console.log(`Клиент отключен: ${ws.clientId}`);
            this.cleanupSession(ws.clientId);
        });

        ws.on('error', (error) => {
            console.error(`WebSocket ошибка: ${error}`);
        });
    }

    handleMessage(ws, message) {
        switch (message.type) {
            case 'create-session':
                this.handleCreateSession(ws, message);
                break;
            case 'join-session':
                this.handleJoinSession(ws, message);
                break;
            case 'offer':
            case 'answer':
            case 'ice-candidate':
                this.handleWebRTCMessage(ws, message);
                break;
            default:
                console.log('Неизвестный тип сообщения:', message.type);
        }
    }

    handleCreateSession(ws, message) {
        const sessionId = uuidv4().substr(0, 8);
        this.sessions.set(sessionId, {
            creator: ws.clientId,
            participants: new Set([ws.clientId]),
            creatorWs: ws
        });

        const turnConfig = this.getTurnConfig();
        
        ws.send(JSON.stringify({
            type: 'session-created',
            sessionId: sessionId,
            turnConfig: turnConfig
        }));

        console.log(`Сессия создана: ${sessionId}`);
    }

    handleJoinSession(ws, message) {
        const session = this.sessions.get(message.sessionId);
        
        if (!session) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Сессия не найдена'
            }));
            return;
        }

        session.participants.add(ws.clientId);
        session.joinerWs = ws;

        const turnConfig = this.getTurnConfig();
        ws.send(JSON.stringify({
            type: 'session-joined',
            turnConfig: turnConfig
        }));

        if (session.creatorWs) {
            session.creatorWs.send(JSON.stringify({
                type: 'participant-joined'
            }));
        }

        console.log(`Участник присоединился к сессии: ${message.sessionId}`);
    }

    handleWebRTCMessage(ws, message) {
        const session = this.findSessionByClientId(ws.clientId);
        if (!session) return;

        const targetWs = this.getOtherParticipant(session, ws.clientId);
        if (targetWs) {
            targetWs.send(JSON.stringify(message));
        }
    }

    findSessionByClientId(clientId) {
        for (const [sessionId, session] of this.sessions) {
            if (session.participants.has(clientId)) {
                return session;
            }
        }
        return null;
    }

    getOtherParticipant(session, clientId) {
        if (session.creatorWs && session.creatorWs.clientId !== clientId) {
            return session.creatorWs;
        }
        if (session.joinerWs && session.joinerWs.clientId !== clientId) {
            return session.joinerWs;
        }
        return null;
    }

    cleanupSession(clientId) {
        for (const [sessionId, session] of this.sessions) {
            if (session.participants.has(clientId)) {
                session.participants.delete(clientId);
                
                const otherWs = this.getOtherParticipant(session, clientId);
                if (otherWs) {
                    otherWs.send(JSON.stringify({
                        type: 'participant-left'
                    }));
                }

                if (session.participants.size === 0) {
                    this.sessions.delete(sessionId);
                    console.log(`Сессия удалена: ${sessionId}`);
                }
                break;
            }
        }
    }

    getTurnConfig() {
        return {
            iceServers: [
                {
                    urls: [
                        'stun:stun.l.google.com:19302',
                        'stun:stun1.l.google.com:19302'
                    ]
                },
                {
                    urls: [
                        `turn:${process.env.TURN_DOMAIN || 'localhost'}:3478`
                    ],
                    username: process.env.TURN_USER || 'user',
                    credential: process.env.TURN_PASSWORD || 'password'
                }
            ],
            iceTransportPolicy: 'all'
        };
    }

    stop() {
        if (this.turnServer) {
            this.turnServer.stop();
        }
        if (this.wss) {
            this.wss.close();
        }
    }
}

const server = new SignalingTurnServer();

process.on('SIGINT', () => {
    console.log('Остановка серверов...');
    server.stop();
    process.exit(0);
});
