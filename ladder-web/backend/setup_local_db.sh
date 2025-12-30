#!/bin/bash
# Скрипт для настройки локальной базы данных PostgreSQL

set -e

echo "🗄️  Настройка локальной базы данных PostgreSQL для Ladder..."
echo ""

# Проверка наличия PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL не установлен!"
    echo ""
    echo "Установите PostgreSQL:"
    echo "  macOS: brew install postgresql@15"
    echo "  Linux: sudo apt-get install postgresql-15"
    echo "  Windows: https://www.postgresql.org/download/windows/"
    exit 1
fi

# Проверка запущен ли PostgreSQL
if ! pg_isready &> /dev/null; then
    echo "⚠️  PostgreSQL не запущен. Запускаю..."
    
    # Попытка запуска (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start postgresql@15 2>/dev/null || brew services start postgresql 2>/dev/null || {
            echo "❌ Не удалось запустить PostgreSQL автоматически"
            echo "Запустите вручную: brew services start postgresql"
            exit 1
        }
        sleep 3
    else
        echo "❌ PostgreSQL не запущен. Запустите вручную:"
        echo "  Linux: sudo systemctl start postgresql"
        exit 1
    fi
fi

echo "✅ PostgreSQL запущен"
echo ""

# Получение имени текущего пользователя системы
CURRENT_USER=$(whoami)

# Проверка, можем ли мы подключиться как текущий пользователь
if psql -U "$CURRENT_USER" -d postgres -c "SELECT 1" &> /dev/null; then
    PSQL_USER="$CURRENT_USER"
    echo "📝 Используется пользователь PostgreSQL: $PSQL_USER"
elif psql -U postgres -d postgres -c "SELECT 1" &> /dev/null; then
    PSQL_USER="postgres"
    echo "📝 Используется пользователь PostgreSQL: $PSQL_USER"
else
    echo "❌ Не удалось подключиться к PostgreSQL"
    echo "Попробуйте запустить: sudo -u postgres psql"
    exit 1
fi

echo ""
echo "🔄 Создание пользователя и базы данных..."

# Создание пользователя (если не существует)
psql -U "$PSQL_USER" -d postgres <<EOF 2>/dev/null || true
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'ladder_user') THEN
        CREATE USER ladder_user WITH PASSWORD 'ladder_password';
        RAISE NOTICE 'Пользователь ladder_user создан';
    ELSE
        RAISE NOTICE 'Пользователь ladder_user уже существует';
    END IF;
END
\$\$;
EOF

# Создание базы данных (если не существует)
psql -U "$PSQL_USER" -d postgres <<EOF
SELECT 'CREATE DATABASE ladder_db OWNER ladder_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ladder_db')\gexec
EOF

# Выдача прав
psql -U "$PSQL_USER" -d postgres <<EOF
GRANT ALL PRIVILEGES ON DATABASE ladder_db TO ladder_user;
ALTER DATABASE ladder_db OWNER TO ladder_user;
EOF

echo "✅ База данных ladder_db создана"
echo ""

# Проверка подключения
echo "🔍 Проверка подключения..."
if psql -U ladder_user -d ladder_db -c "SELECT 1" &> /dev/null; then
    echo "✅ Подключение успешно!"
else
    echo "⚠️  Не удалось подключиться с новым пользователем"
    echo "Попробуйте вручную:"
    echo "  psql -U $PSQL_USER -d postgres"
    echo "  CREATE USER ladder_user WITH PASSWORD 'ladder_password';"
    echo "  CREATE DATABASE ladder_db OWNER ladder_user;"
fi

echo ""
echo "✅ База данных настроена!"
echo ""
echo "📋 Параметры подключения:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   User: ladder_user"
echo "   Password: ladder_password"
echo "   Database: ladder_db"
echo ""
echo "🔧 Следующий шаг:"
echo "   cd backend"
echo "   poetry run alembic upgrade head"

