from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Kairos Lab API"
    app_env: str = "development"
    app_host: str = "127.0.0.1"
    app_port: int = 8000

    database_url: str = "sqlite:///./kairos.db"

    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 120

    admin_username: str = "admin"
    admin_password: str = "kairos123"

    cors_allow_origins: str = "http://localhost:4321,http://127.0.0.1:4321"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
