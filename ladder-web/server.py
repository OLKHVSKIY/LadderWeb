#!/usr/bin/env python3
"""
Простой HTTP сервер для обслуживания frontend файлов по пути /public/...
"""
import http.server
import socketserver
import os
from urllib.parse import unquote
from pathlib import Path

PORT = 3000

# Определяем корневую директорию проекта (где находится server.py)
BASE_DIR = Path(__file__).parent.absolute()

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def get_content_type(self, file_path):
        """Определяет Content-Type по расширению файла"""
        if file_path.endswith('.html'):
            return 'text/html'
        elif file_path.endswith('.css'):
            return 'text/css'
        elif file_path.endswith('.js'):
            return 'application/javascript'
        elif file_path.endswith('.json'):
            return 'application/json'
        elif file_path.endswith('.png'):
            return 'image/png'
        elif file_path.endswith('.jpg') or file_path.endswith('.jpeg'):
            return 'image/jpeg'
        elif file_path.endswith('.svg'):
            return 'image/svg+xml'
        elif file_path.endswith('.woff') or file_path.endswith('.woff2'):
            return 'font/woff2'
        elif file_path.endswith('.ttf'):
            return 'font/ttf'
        elif file_path.endswith('.eot'):
            return 'application/vnd.ms-fontobject'
        else:
            return 'application/octet-stream'
    
    def serve_file(self, file_path):
        """Обслуживает файл с правильным Content-Type"""
        if os.path.exists(file_path) and os.path.isfile(file_path):
            self.send_response(200)
            content_type = self.get_content_type(file_path)
            self.send_header('Content-type', content_type)
            self.end_headers()
            
            # Читаем и отправляем файл
            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
            return True
        return False
    
    def do_GET(self):
        # Очищаем путь от query string
        path = self.path.split('?')[0]
        path = unquote(path)
        
        # Обработка favicon.ico - перенаправляем на ai.png
        if path == '/favicon.ico':
            favicon_path = BASE_DIR / 'frontend' / 'assets' / 'images' / 'icons' / 'ai.png'
            if os.path.exists(favicon_path):
                self.serve_file(str(favicon_path))
                return
            else:
                self.send_error(404, "Favicon not found")
                return
        
        # Если путь начинается с /public/, обслуживаем файлы из frontend/public
        if path.startswith('/public/'):
            file_path = path[8:]  # Убираем '/public/'
            # Убираем начальный слеш, если есть
            file_path = file_path.lstrip('/')
            # Если путь пустой или это директория, добавляем index.html
            if not file_path or file_path.endswith('/'):
                file_path = file_path.rstrip('/') + '/index.html'
            
            full_path = BASE_DIR / 'frontend' / 'public' / file_path
            if not self.serve_file(str(full_path)):
                self.send_error(404, f"File not found: {full_path}")
        
        # Если путь начинается с /assets/, обслуживаем файлы из frontend/assets
        elif path.startswith('/assets/'):
            file_path = path[8:]  # Убираем '/assets/'
            full_path = BASE_DIR / 'frontend' / 'assets' / file_path
            if not self.serve_file(str(full_path)):
                self.send_error(404, "File not found")
        
        else:
            # Для всех остальных путей возвращаем 404
            self.send_error(404, "Not Found")

if __name__ == "__main__":
    class ReusableTCPServer(socketserver.TCPServer):
        allow_reuse_address = True
    
    with ReusableTCPServer(("", PORT), CustomHandler) as httpd:
        print(f"🚀 Frontend сервер запущен на http://localhost:{PORT}")
        print(f"📁 Доступ к файлам: http://localhost:{PORT}/public/")
        print(f"🏠 Главная страница: http://localhost:{PORT}/public/index.html")
        httpd.serve_forever()

