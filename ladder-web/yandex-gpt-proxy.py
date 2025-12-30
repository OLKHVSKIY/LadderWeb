#!/usr/bin/env python3
"""
Простой прокси-сервер для Yandex GPT API (обход CORS)
Запускается на порту 8001
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError
import json
import sys
import os
from pathlib import Path

# Загружаем переменные окружения из .env файла
def load_env_file():
    """Загружает переменные окружения из .env файла"""
    env_file = Path(__file__).parent / '.env'
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

# Загружаем .env файл
load_env_file()

# Конфигурация Yandex GPT
YANDEX_GPT_API_KEY = os.getenv("YANDEX_GPT_API_KEY", "")
YANDEX_GPT_FOLDER_ID = os.getenv("YANDEX_GPT_FOLDER_ID", "")
YANDEX_GPT_URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"

class YandexGPTProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Обработка preflight CORS запросов"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Max-Age', '3600')
        self.end_headers()
    
    def do_POST(self):
        """Обработка POST запросов"""
        if self.path == '/api/ai/yandex-gpt/chat':
            try:
                # Проверяем наличие API ключей
                if not YANDEX_GPT_API_KEY or not YANDEX_GPT_FOLDER_ID:
                    error_response = {
                        "error": {
                            "message": "Yandex GPT API keys not configured. Please create .env file with YANDEX_GPT_API_KEY and YANDEX_GPT_FOLDER_ID",
                            "type": "configuration_error"
                        }
                    }
                    self.send_response(500)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(error_response).encode('utf-8'))
                    return
                
                # Читаем тело запроса
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                request_data = json.loads(post_data.decode('utf-8'))
                
                # Извлекаем параметры
                model = request_data.get('model', 'yandexgpt-lite')
                messages = request_data.get('messages', [])
                temperature = request_data.get('temperature', 0.7)
                max_tokens = request_data.get('max_tokens', 2000)
                
                # Преобразуем сообщения в формат Yandex GPT
                yandex_messages = []
                for msg in messages:
                    text = msg.get('text') or msg.get('content') or ""
                    yandex_messages.append({
                        "role": msg.get('role', 'user'),
                        "text": text
                    })
                
                # Формируем запрос к Yandex GPT API
                yandex_request = {
                    "modelUri": f"gpt://{YANDEX_GPT_FOLDER_ID}/{model}",
                    "completionOptions": {
                        "stream": False,
                        "temperature": temperature,
                        "maxTokens": max_tokens
                    },
                    "messages": yandex_messages
                }
                
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Api-Key {YANDEX_GPT_API_KEY}"
                }
                
                # Отправляем запрос к Yandex GPT API
                try:
                    req = Request(
                        YANDEX_GPT_URL,
                        data=json.dumps(yandex_request).encode('utf-8'),
                        headers=headers,
                        method='POST'
                    )
                    
                    with urlopen(req, timeout=30) as response:
                        if response.status != 200:
                            error_body = response.read().decode('utf-8')
                            self.send_error(response.status, error_body)
                            return
                        
                        data = json.loads(response.read().decode('utf-8'))
                except HTTPError as e:
                    error_body = e.read().decode('utf-8') if hasattr(e, 'read') else str(e)
                    self.send_error(e.code, error_body)
                    return
                except URLError as e:
                    self.send_error(503, f"Connection error: {str(e)}")
                    return
                
                # Парсим ответ от Yandex GPT
                message_text = ""
                if data.get("result") and data["result"].get("alternatives"):
                    message_text = data["result"]["alternatives"][0]["message"]["text"]
                elif data.get("alternatives") and data["alternatives"][0].get("message"):
                    message_text = data["alternatives"][0]["message"]["text"]
                else:
                    self.send_error(500, "Unexpected response format from Yandex GPT API")
                    return
                
                # Возвращаем ответ в формате OpenAI-совместимом
                response_data = {
                    "choices": [{
                        "message": {
                            "role": "assistant",
                            "content": message_text
                        }
                    }]
                }
                
                # Отправляем ответ
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
                
            except json.JSONDecodeError as e:
                error_response = {
                    "error": {
                        "message": f"Invalid JSON in request: {str(e)}",
                        "type": "json_decode_error"
                    }
                }
                self.send_response(400)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(error_response).encode('utf-8'))
            except Exception as e:
                print(f"Error: {e}", file=sys.stderr)
                error_response = {
                    "error": {
                        "message": str(e),
                        "type": "server_error"
                    }
                }
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(error_response).encode('utf-8'))
        else:
            self.send_error(404, "Not Found")
    
    def log_message(self, format, *args):
        """Переопределяем логирование для более чистого вывода"""
        print(f"[{self.address_string()}] {args[0]} {args[1]} {args[2]}")

def run(port=8001):
    """Запуск прокси-сервера"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, YandexGPTProxyHandler)
    print(f"🚀 Yandex GPT Proxy Server запущен на http://localhost:{port}")
    print(f"📡 Проксирует запросы к Yandex GPT API")
    print(f"🔑 API Key: {YANDEX_GPT_API_KEY[:10]}...")
    print(f"📁 Folder ID: {YANDEX_GPT_FOLDER_ID}")
    print("\nНажмите Ctrl+C для остановки\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n⏹️  Сервер остановлен")
        httpd.server_close()

if __name__ == '__main__':
    import sys
    port = 8001
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Использование: python yandex-gpt-proxy.py [port]")
            sys.exit(1)
    run(port)

