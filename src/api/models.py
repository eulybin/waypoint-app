from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy import String, Boolean, Integer, Text, DateTime, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime 
import enum
import json

db = SQLAlchemy()
bcrypt = Bcrypt()

class UserRole(enum.Enum):
    ADMIN = "admin"
    USER = "user"
    

class User(db.Model):
    
    __tablename__ = 'users'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.USER, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow) 
    
    # Relaciones
    routes: Mapped[list["Route"]] = relationship('Route', back_populates='author', cascade='all, delete-orphan')
    votes: Mapped[list["Vote"]] = relationship('Vote', back_populates='user', cascade='all, delete-orphan')


    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role.value,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        
class Route(db.Model):
    
    __tablename__ = 'routes'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    locality: Mapped[str] = mapped_column(String(100), nullable=True)
    points_of_interest: Mapped[str] = mapped_column(Text, nullable=False)  # JSON string
    coordinates: Mapped[str] = mapped_column(Text, nullable=True)  # JSON string con coordenadas
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    author: Mapped["User"] = relationship('User', back_populates='routes')
    votes: Mapped[list["Vote"]] = relationship('Vote', back_populates='route', cascade='all, delete-orphan')
    
    def serialize(self):
    
        return {
                "id": self.id,
                "user_id": self.user_id,
                "author_name": self.author.name if self.author else "Unknown",
                "country": self.country,
                "city": self.city,
                "locality": self.locality,
                "points_of_interest": self.get_points_of_interest_list(),
                "coordinates": self.get_coordinates_dict(),
                "average_rating": round(self.get_average_rating(), 2),
                "total_votes": self.get_total_votes(),
                "created_at": self.created_at.isoformat() if self.created_at else None
            }

    # Utilities for serialization and stats
    def get_points_of_interest_list(self):
        """Devuelve points_of_interest como lista (convierte desde JSON si es necesario)."""
        try:
            if not self.points_of_interest:
                return []
            if isinstance(self.points_of_interest, list):
                return self.points_of_interest
            return json.loads(self.points_of_interest)
        except Exception:
            # Si no es JSON válido, devolver el valor tal cual o una lista vacía
            return []

    def get_coordinates_dict(self):
        """Devuelve coordinates como dict (convierte desde JSON si es necesario)."""
        try:
            if not self.coordinates:
                return None
            if isinstance(self.coordinates, dict):
                return self.coordinates
            return json.loads(self.coordinates)
        except Exception:
            return None

    def get_average_rating(self):
        """Calcula el rating promedio a partir de los objetos Vote relacionados."""
        try:
            if not self.votes or len(self.votes) == 0:
                return 0.0
            total = sum([v.rating for v in self.votes if v and v.rating is not None])
            count = len([v for v in self.votes if v and v.rating is not None])
            return (total / count) if count > 0 else 0.0
        except Exception:
            return 0.0

    def get_total_votes(self):
        try:
            return len(self.votes) if self.votes else 0
        except Exception:
            return 0

class Vote(db.Model):
  #Permite votar de una a 5 estrellas
    __tablename__ = 'votes'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    route_id: Mapped[int] = mapped_column(ForeignKey('routes.id'), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5 estrellas
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    user: Mapped["User"] = relationship('User', back_populates='votes')
    route: Mapped["Route"] = relationship('Route', back_populates='votes')
    
    # Constraint para evitar votos duplicados del mismo usuario en la misma ruta
    __table_args__ = (UniqueConstraint('user_id', 'route_id', name='unique_user_route_vote'),)
    
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "route_id": self.route_id,
            "rating": self.rating,
            "user_name": self.user.name if self.user else "Unknown",
            "created_at": self.created_at.isoformat() if self.created_at else None
        }