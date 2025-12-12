<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stream con Chat F1 - Multi Stream</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            background-color: #000;
            color: #fff;
            font-family: Arial, sans-serif;
        }
        .header {
            background-color: #111;
            padding: 10px;
            text-align: center;
            border-bottom: 2px solid #333;
        }
        .header button {
            padding: 10px 20px;
            margin: 0 10px;
            background: #333;
            color: #0ff;
            border: 1px solid #0ff;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        .header button:hover, .header button.active {
            background: #0ff;
            color: #000;
        }
        .container {
            display: flex;
            flex-direction: row;
            height: calc(100% - 60px);
            max-width: 1600px;
            margin: 0 auto;
            position: relative; /* Para el footer */
        }
        .stream, .chat-section {
            padding: 20px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .stream {
            flex: 7;
        }
        .chat-section {
            flex: 3;
            border-left: 2px solid #333;
            justify-content: flex-start;
        }
        .player-container {
            position: relative;
            width: 100%;
            max-width: 1000px;
        }
        .chat-container {
            width: 100%;
            height: 100%;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        .chat-section h2 {
            margin: 0 0 10px 0;
            text-align: center;
            width: 100%;
        }
        iframe {
            width: 100%;
            height: 600px;
            border: 0;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
        }
        #chat-iframe {
            flex: 1;
            width: 100%;
            min-height: 600px;
            border: 0;
            overflow: hidden;
        }
        .controls {
            margin-top: 15px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
            width: 100%;
        }
        button.controls-btn {
            padding: 10px 15px;
            background: #333;
            color: #0ff;
            border: 1px solid #0ff;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button.controls-btn:hover {
            background: #0ff;
            color: #000;
        }

        /* Frase llamativa */
        .frase-llamativa {
            text-align: center;
            font-size: 36px;
            font-weight: bold;
            color: #ff0000;
            text-shadow: 0 0 15px #00ffff, 0 0 30px #00ffff;
            margin-bottom: 20px;
            animation: pulso 2s infinite;
        }

        @keyframes pulso {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        /* Footer con el disclaimer */
        .footer-disclaimer {
            position: fixed;
            bottom: 10px;
            left: 10px;
            background-color: rgba(0, 0, 0, 0.7);
            padding: 8px 15px;
            border-radius: 5px;
            font-size: 14px;
            color: #ccc;
            z-index: 1000;
            border: 1px solid #333;
        }

        @media (max-width: 900px) {
            .container {
                flex-direction: column;
            }
            .chat-section {
                border-left: 0;
                border-top: 2px solid #333;
            }
            .header button {
                margin: 5px;
                padding: 8px 15px;
                font-size: 14px;
            }
            iframe {
                height: 400px;
            }
            .frase-llamativa {
                font-size: 28px;
            }
            .footer-disclaimer {
                font-size: 12px;
                padding: 6px 10px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <button id="btn-daddy" class="active" onclick="cambiarStream('daddy')">DAZN F1 Español</button>
        <button id="btn-espn" onclick="cambiarStream('espn')">ESPN Argentina</button>
        <button id="btn-fox" onclick="cambiarStream('fox')">Fox Sports Argentina</button>
    </div>

    <div class="container">
        <!-- Reproductor -->
        <div class="stream">
            <div class="frase-llamativa">fernando is faster than you...</div>

            <div class="player-container">
                <iframe id="player" src="about:blank" allowfullscreen></iframe>
            </div>
            <div class="controls">
                <strong>Reproductor:</strong>
                <button class="controls-btn" onclick="changePlayerSize(-100)">- Achicar</button>
                <button class="controls-btn" onclick="changePlayerSize(100)">+ Agrandar</button>
                <button class="controls-btn" onclick="movePlayer(-50)">← Izquierda</button>
                <button class="controls-btn" onclick="movePlayer(50)">→ Derecha</button>
                <button class="controls-btn" onclick="resetPlayer()">Reset</button>
            </div>
        </div>

        <!-- Chat -->
        <div class="chat-section">
            <h2>Chat F1 en vivo</h2>
            <div class="chat-container">
                <iframe id="chat-iframe" src="https://xat.com/Todosobref1ahora" 
                        allowfullscreen scrolling="no"></iframe>
            </div>
            <div class="controls">
                <strong>Chat:</strong>
                <button class="controls-btn" onclick="changeChatSize(-100)">- Achicar</button>
                <button class="controls-btn" onclick="changeChatSize(100)">+ Agrandar</button>
                <button class="controls-btn" onclick="moveChat(-50)">← Izquierda</button>
                <button class="controls-btn" onclick="moveChat(50)">→ Derecha</button>
                <button class="controls-btn" onclick="resetChat()">Reset</button>
            </div>
        </div>
    </div>

    <!-- Disclaimer en la parte inferior izquierda -->
    <div class="footer-disclaimer">
        Esta página está hecha sin fines de lucros, todos los streams no son de nuestra propiedad.
    </div>

    <script>
        // URLs codificadas en Base64
        const streams = {
            daddy: "aHR0cHM6Ly9kYWRkeWhkLmNvbS93YXRjaC9zdHJlYW0tNTM3LnBocA==",
            espn:  "aHR0cHM6Ly9kYWRkeWhkLmNvbS9zdHJlYW0vc3RyZWFtLTE0OS5waHA=",
            fox:   "aHR0cHM6Ly9kYWRkeWhkLmNvbS9zdHJlYW0vc3RyZWFtLTc4Ny5waHA="
        };

        function cambiarStream(tipo) {
            const player = document.getElementById('player');
            player.src = atob(streams[tipo]);
            document.getElementById('btn-daddy').classList.toggle('active', tipo === 'daddy');
            document.getElementById('btn-espn').classList.toggle('active', tipo === 'espn');
            document.getElementById('btn-fox').classList.toggle('active', tipo === 'fox');
        }

        // Cargar stream por defecto
        window.onload = function() {
            cambiarStream('daddy');
        };

        // Controles reproductor
        const player = document.getElementById('player');
        let playerWidth = 100;
        let playerHeight = 600;
        let playerMarginLeft = 0;

        function changePlayerSize(delta) {
            playerHeight += delta;
            playerWidth = (playerHeight / 600) * 100;
            if (playerHeight < 300) playerHeight = 300;
            player.style.height = playerHeight + 'px';
            player.style.width = playerWidth + '%';
        }

        function movePlayer(delta) {
            playerMarginLeft += delta;
            player.style.marginLeft = playerMarginLeft + 'px';
        }

        function resetPlayer() {
            playerWidth = 100;
            playerHeight = 600;
            playerMarginLeft = 0;
            player.style.width = '100%';
            player.style.height = '600px';
            player.style.marginLeft = '0';
        }

        // Controles chat
        const chatIframe = document.getElementById('chat-iframe');

        function changeChatSize(delta) {
            let current = parseInt(chatIframe.style.height) || 600;
            current += delta;
            if (current < 400) current = 400;
            chatIframe.style.height = current + 'px';
        }

        function moveChat(delta) {
            let current = parseInt(chatIframe.style.marginLeft) || 0;
            current += delta;
            chatIframe.style.marginLeft = current + 'px';
        }

        function resetChat() {
            chatIframe.style.height = '100%';
            chatIframe.style.marginLeft = '0';
        }

        // Activar sonidos del chat automáticamente
        const chatFrame = document.getElementById('chat-iframe');

        chatFrame.addEventListener('load', function() {
            setTimeout(function() {
                try {
                    const chatWindow = chatFrame.contentWindow;
                    if (chatWindow && typeof chatWindow.chatSound === 'function') {
                        chatWindow.chatSound(1); // 1 = activar message sound
                        console.log('Sonidos de mensajes activados automáticamente');
                    }
                } catch (e) {
                    console.log('No se pudo activar sonido automáticamente (posible restricción de iframe)');
                }
            }, 5000);
        });
    </script>
</body>
</html>
