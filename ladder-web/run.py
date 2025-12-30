#!/usr/bin/env python3
"""
Скрипт для запуска всех сервисов Ladder в одном терминале
"""
import subprocess
import sys
import os
import signal
import time
from pathlib import Path

# Цвета для вывода
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
RED = '\033[0;31m'
BLUE = '\033[0;34m'
NC = '\033[0m'  # No Color

BASE_DIR = Path(__file__).parent.absolute()
LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(exist_ok=True)

processes = []

def cleanup(signum=None, frame=None):
    """Остановка всех процессов"""
    print(f"\n{YELLOW}⏹️  Остановка всех сервисов...{NC}")
    for proc in processes:
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except:
            try:
                proc.kill()
            except:
                pass
    print(f"{GREEN}✅ Все сервисы остановлены{NC}")
    sys.exit(0)

# Регистрируем обработчики сигналов
signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

def check_poetry():
    """Проверка наличия Poetry"""
    try:
        subprocess.run(["poetry", "--version"], capture_output=True, check=True)
        return True
    except:
        print(f"{RED}❌ Poetry не установлен. Установите его:{NC}")
        print("curl -sSL https://install.python-poetry.org | python3 -")
        return False

def check_env():
    """Проверка наличия .env файла"""
    env_file = BASE_DIR / ".env"
    if not env_file.exists():
        print(f"{YELLOW}⚠️  Файл .env не найден!{NC}")
        print("Создайте файл .env с ключами Yandex GPT:")
        print("YANDEX_GPT_API_KEY=ваш_ключ")
        print("YANDEX_GPT_FOLDER_ID=ваш_folder_id")
        return False
    return True

def run_backend():
    """Запуск Backend API"""
    print(f"{GREEN}📡 Запуск Backend API на порту 8000...{NC}")
    backend_dir = BASE_DIR / "backend"
    log_file = LOGS_DIR / "backend.log"
    
    # Получаем путь к виртуальному окружению Poetry из backend директории
    # Важно: явно указываем рабочую директорию и очищаем переменные окружения Poetry
    backend_env = os.environ.copy()
    # Удаляем переменные Poetry, которые могут указывать на другое окружение
    backend_env.pop("POETRY_ACTIVE", None)
    backend_env.pop("VIRTUAL_ENV", None)
    
    poetry_env_result = subprocess.run(
        ["poetry", "env", "info", "--path"],
        cwd=str(backend_dir),
        capture_output=True,
        text=True,
        env=backend_env
    )
    
    if poetry_env_result.returncode == 0 and poetry_env_result.stdout.strip():
        venv_path = poetry_env_result.stdout.strip()
        uvicorn_path = os.path.join(venv_path, "bin", "uvicorn")
        
        # Проверяем, что файл существует
        if os.path.exists(uvicorn_path) and os.access(uvicorn_path, os.X_OK):
            # Используем прямой путь к uvicorn из виртуального окружения
            with open(log_file, "w") as f:
                proc = subprocess.Popen(
                    [uvicorn_path, "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
                    cwd=str(backend_dir),
                    stdout=f,
                    stderr=subprocess.STDOUT,
                    env={**backend_env, "PYTHONPATH": str(backend_dir)}
                )
        else:
            # Если uvicorn не найден, используем poetry run
            print(f"{YELLOW}⚠️  Uvicorn не найден по пути {uvicorn_path}, используем poetry run{NC}")
            with open(log_file, "w") as f:
                proc = subprocess.Popen(
                    ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
                    cwd=str(backend_dir),
                    stdout=f,
                    stderr=subprocess.STDOUT,
                    env={**backend_env, "PYTHONPATH": str(backend_dir)}
                )
    else:
        # Fallback: используем poetry run
        error_msg = poetry_env_result.stderr.strip() if poetry_env_result.stderr else "Неизвестная ошибка"
        print(f"{YELLOW}⚠️  Не удалось получить путь к окружению ({error_msg}), используем poetry run{NC}")
        with open(log_file, "w") as f:
            proc = subprocess.Popen(
                ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
                cwd=str(backend_dir),
                stdout=f,
                stderr=subprocess.STDOUT,
                env={**backend_env, "PYTHONPATH": str(backend_dir)}
            )
    
    processes.append(proc)
    return proc

def run_proxy():
    """Запуск Yandex GPT Proxy"""
    print(f"{GREEN}🤖 Запуск Yandex GPT Proxy на порту 8001...{NC}")
    log_file = LOGS_DIR / "proxy.log"
    
    # Proxy может работать без Poetry, используем обычный python3
    with open(log_file, "w") as f:
        proc = subprocess.Popen(
            ["python3", "yandex-gpt-proxy.py"],
            cwd=str(BASE_DIR),
            stdout=f,
            stderr=subprocess.STDOUT
        )
    processes.append(proc)
    return proc

def run_frontend():
    """Запуск Frontend"""
    print(f"{GREEN}🌐 Запуск Frontend на порту 3000...{NC}")
    log_file = LOGS_DIR / "frontend.log"
    
    # Frontend может работать без Poetry, используем обычный python3
    with open(log_file, "w") as f:
        proc = subprocess.Popen(
            ["python3", "server.py"],
            cwd=str(BASE_DIR),
            stdout=f,
            stderr=subprocess.STDOUT
        )
    processes.append(proc)
    return proc

def kill_process_on_port(port):
    """Освобождает порт, убивая процесс на нём"""
    try:
        result = subprocess.run(
            ["lsof", "-ti", f":{port}"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0 and result.stdout.strip():
            pids = result.stdout.strip().split('\n')
            for pid in pids:
                try:
                    os.kill(int(pid), signal.SIGTERM)
                    time.sleep(0.5)
                    os.kill(int(pid), signal.SIGKILL)
                except:
                    pass
    except:
        pass

def main():
    print(f"{GREEN}🚀 Запуск всех сервисов Ladder...{NC}\n")
    
    # Освобождаем порты перед запуском
    print(f"{YELLOW}🔍 Проверка и освобождение портов...{NC}")
    kill_process_on_port(8000)
    kill_process_on_port(8001)
    kill_process_on_port(3000)
    time.sleep(1)
    
    # Проверки
    if not check_poetry():
        sys.exit(1)
    
    if not check_env():
        sys.exit(1)
    
    # Установка зависимостей backend (если нужно)
    backend_dir = BASE_DIR / "backend"
    poetry_env = subprocess.run(
        ["poetry", "env", "info", "--path"],
        cwd=str(backend_dir),
        capture_output=True,
        text=True
    )
    
    if poetry_env.returncode != 0 or not poetry_env.stdout.strip():
        print(f"{YELLOW}📦 Установка зависимостей backend...{NC}")
        subprocess.run(["poetry", "install", "--no-root"], cwd=str(backend_dir), check=False)
    
    # Запуск сервисов
    backend_proc = run_backend()
    proxy_proc = run_proxy()
    frontend_proc = run_frontend()
    
    # Ждем немного для запуска
    print(f"{YELLOW}⏳ Ожидание запуска сервисов...{NC}")
    time.sleep(5)
    
    # Проверка статуса
    print()
    backend_running = backend_proc.poll() is None
    proxy_running = proxy_proc.poll() is None
    frontend_running = frontend_proc.poll() is None
    
    if backend_running:
        print(f"{GREEN}✅ Backend API запущен (PID: {backend_proc.pid}){NC}")
    else:
        print(f"{RED}❌ Backend API не запустился. Проверьте logs/backend.log{NC}")
        # Показываем последние строки лога
        try:
            with open(LOGS_DIR / "backend.log", "r") as f:
                lines = f.readlines()
                if lines:
                    print(f"{YELLOW}Последние строки лога:{NC}")
                    for line in lines[-5:]:
                        print(f"  {line.strip()}")
        except:
            pass
    
    if proxy_running:
        print(f"{GREEN}✅ Yandex GPT Proxy запущен (PID: {proxy_proc.pid}){NC}")
    else:
        print(f"{RED}❌ Yandex GPT Proxy не запустился. Проверьте logs/proxy.log{NC}")
        # Показываем последние строки лога
        try:
            with open(LOGS_DIR / "proxy.log", "r") as f:
                lines = f.readlines()
                if lines:
                    print(f"{YELLOW}Последние строки лога:{NC}")
                    for line in lines[-5:]:
                        print(f"  {line.strip()}")
        except:
            pass
    
    if frontend_running:
        print(f"{GREEN}✅ Frontend запущен (PID: {frontend_proc.pid}){NC}")
    else:
        print(f"{RED}❌ Frontend не запустился. Проверьте logs/frontend.log{NC}")
    
    print()
    print(f"{GREEN}════════════════════════════════════════{NC}")
    print(f"{GREEN}🎉 Все сервисы запущены!{NC}")
    print(f"{GREEN}════════════════════════════════════════{NC}")
    print()
    print(f"📱 Frontend:     {GREEN}http://localhost:3000/public/{NC}")
    print(f"🔧 Backend API:  {GREEN}http://localhost:8000{NC}")
    print(f"📚 API Docs:     {GREEN}http://localhost:8000/docs{NC}")
    print(f"🤖 GPT Proxy:    {GREEN}http://localhost:8001{NC}")
    print()
    print(f"{YELLOW}Логи сохраняются в директории logs/{NC}")
    print(f"{YELLOW}Нажмите Ctrl+C для остановки всех сервисов{NC}")
    print()
    
    # Ждем завершения всех процессов
    try:
        while True:
            time.sleep(1)
            # Проверяем, что процессы еще работают
            if any(p.poll() is not None for p in processes):
                break
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()

if __name__ == "__main__":
    main()

