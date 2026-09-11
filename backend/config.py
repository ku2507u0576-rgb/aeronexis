from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./airfare_index.db"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_KEY_SECRET: str = "default_secret"
    BASE_YEAR: int = 2023
    BASE_VALUE: float = 100.0

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
