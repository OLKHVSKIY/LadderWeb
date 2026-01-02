"""
Утилиты для проверки Telegram WebApp initData
"""
import hashlib
import hmac
import json
from typing import Dict, Any
from urllib.parse import parse_qsl


def parse_init_data(init_data: str) -> Dict[str, str]:
    return dict(parse_qsl(init_data, keep_blank_values=True))


def validate_init_data(init_data: str, bot_token: str) -> Dict[str, Any]:
    data = parse_init_data(init_data)
    if "hash" not in data:
        raise ValueError("Missing hash")

    received_hash = data.pop("hash")
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(data.items()))

    secret_key = hmac.new(
        b"WebAppData",
        bot_token.encode("utf-8"),
        hashlib.sha256
    ).digest()

    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    if calculated_hash != received_hash:
        raise ValueError("Invalid hash")

    if "user" in data:
        try:
            data["user"] = json.loads(data["user"])
        except json.JSONDecodeError:
            data["user"] = None

    return data
