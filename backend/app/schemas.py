from pydantic import BaseModel, Field


class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProductBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    category: str = Field(min_length=2, max_length=80)
    desc: str = Field(min_length=2, max_length=2000)
    price: str = Field(min_length=1, max_length=40)
    image: str = ""
    visible: bool = True
    enabled: bool = True
    stock_status: str = "disponible"


class ProductCreate(ProductBase):
    id: str = Field(min_length=3, max_length=80)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    category: str | None = Field(default=None, min_length=2, max_length=80)
    desc: str | None = Field(default=None, min_length=2, max_length=2000)
    price: str | None = Field(default=None, min_length=1, max_length=40)
    image: str | None = None
    visible: bool | None = None
    enabled: bool | None = None
    stock_status: str | None = None


class ProductOut(ProductBase):
    id: str

    class Config:
        from_attributes = True
