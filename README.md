# P2P Video Call 📞

Бесплатное P2P видео-звонок приложение с WebRTC, оптимизированное для мобильных устройств.

![P2P Video Call](https://img.shields.io/badge/WebRTC-P2P%20Video%20Call-blue)
![Mobile Optimized](https://img.shields.io/badge/Mobile-Optimized-green)
![No Installation](https://img.shields.io/badge/No-Installation%20Required-lightgrey)

## 🌟 Особенности

- ✅ **Peer-to-Peer видеозвонки** - Прямое соединение между участниками
- ✅ **Полная поддержка мобильных устройств** - Адаптивный дизайн для всех экранов
- ✅ **Автоматическое определение устройства** - Оптимальный интерфейс для каждого устройства
- ✅ **Без установки приложений** - Работает прямо в браузере
- ✅ **Зашифрованное соединение** - Безопасная передача данных
- ✅ **Смена камеры** - Переключение между фронтальной и основной камерой
- ✅ **QR-код для подключения** - Быстрое присоединение по QR-коду
- ✅ **PWA поддержка** - Работает оффлайн после первой загрузки

## 🚀 Быстрый старт

### Для пользователей:
1. Откройте [приложение на GitHub Pages](https://yourusername.github.io/p2p-video-call)
2. Нажмите "Создать звонок"
3. Поделитесь ссылкой или QR-кодом с другом
4. Начните общение!

### Для разработчиков:

```bash
# Клонируйте репозиторий
git clone https://github.com/yourusername/p2p-video-call.git
cd p2p-video-call

# Установите зависимости
npm install

# Запустите локальный сервер
npm run dev
```

Откройте http://localhost:8080 в браузере.

## 📱 Мобильная оптимизация

- **Автоматическое определение устройства** - Интерфейс подстраивается под экран
- **Touch-оптимизированные кнопки** - Удобное управление на сенсорных экранах
- **Поддержка смены камеры** - Легкое переключение между камерами
- **Предотвращение сна экрана** - Экран не блокируется во время звонка
- **Адаптация под ориентацию** - Оптимальный layout для портрета и ландшафта
- **Оптимизированная производительность** - Плавная работа на мобильных устройствах

## 🖥️ Браузерная поддержка

| Браузер | Версия | Поддержка |
|---------|--------|-----------|
| Chrome | 60+ | ✅ Полная |
| Firefox | 55+ | ✅ Полная |
| Safari | 11+ | ✅ Полная |
| Edge | 79+ | ✅ Полная |
| Mobile Safari | 11+ | ✅ Полная |
| Chrome Mobile | 60+ | ✅ Полная |

## 🛠️ Технологии

- **WebRTC** - Peer-to-peer видеосвязь
- **Vanilla JavaScript** - Чистый JS без фреймворков
- **CSS3 Grid & Flexbox** - Современная верстка
- **HTML5 Media APIs** - Работа с медиапотоками
- **Service Workers** - Оффлайн работа и кэширование
- **Responsive Design** - Адаптивный дизайн

## 🌐 Деплой

### GitHub Pages (Рекомендуется)
```bash
npm run deploy
```

[![Deploy to GitHub Pages](https://github.com/yourusername/p2p-video-call/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/p2p-video-call/actions)

### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/p2p-video-call)

### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/p2p-video-call)

## 📁 Структура проекта

```
p2p-video-call/
├── public/                 # Статические файлы для GitHub Pages
│   ├── index.html         # Главная страница
│   ├── style.css          # Стили с мобильной адаптацией
│   ├── script.js          # Основная логика приложения
│   └── sw.js              # Service Worker для PWA
├── server/                # Серверная часть (опционально)
│   ├── signaling-turn-server.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions для авто-деплоя
├── .gitignore
├── package.json          # Основные зависимости и скрипты
├── netlify.toml          # Конфигурация Netlify
├── vercel.json           # Конфигурация Vercel
└── README.md
```

## 🔧 Серверная часть (опционально)

Для работы в сложных сетевых условиях (NAT) рекомендуется использовать TURN сервер:

```bash
cd server
npm install

# Настройте окружение
cp .env.example .env
# Отредактируйте .env файл с вашими настройками

# Запустите сервер
npm start
```

## 🎯 Использование

### Создание звонка:
1. Нажмите "Создать звонок"
2. Разрешите доступ к камере и микрофону
3. Поделитесь ссылкой или QR-кодом

### Присоединение к звонку:
1. Перейдите по полученной ссылке
2. Или введите ID сессии вручную
3. Разрешите доступ к медиаустройствам
4. Наслаждайтесь общением!

### Управление во время звонка:
- **📹** - Включить/выключить видео
- **🎤** - Включить/выключить микрофон
- **📷** - Сменить камеру (на мобильных)
- **📞** - Завершить звонок

## 📄 Лицензия

MIT License - смотрите LICENSE файл для деталей.

## 🤝 Вклад в проект

Мы приветствуем вклады! Чтобы внести свой вклад:

1. Форкните репозиторий
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Закоммитьте изменения (`git commit -m 'Add amazing feature'`)
4. Запушите branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 🐛 Сообщение об ошибках

Если вы нашли ошибку или у вас есть предложение по улучшению:

1. Проверьте [существующие issues](https://github.com/yourusername/p2p-video-call/issues)
2. Создайте новое issue с подробным описанием
3. Укажите версию браузера и ОС

## 📞 Поддержка

- 📧 Email: your-email@example.com
- 🐛 [Issues](https://github.com/yourusername/p2p-video-call/issues)
- 💬 [Discussions](https://github.com/yourusername/p2p-video-call/discussions)

## 🙏 Благодарности

- WebRTC team за прекрасную технологию
- Сообщество открытого исходного кода
- Все контрибьюторы проекта

---

**⭐ Если проект вам понравился, поставьте звезду на GitHub!**
