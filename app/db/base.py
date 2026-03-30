"""
SQLAlchemy declarative base.
All ORM models must inherit from Base defined here.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass