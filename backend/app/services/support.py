from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.support import Sector, SupportArea, SupportType
from app.schemas.support import (
    SectorCreate,
    SectorUpdate,
    SupportAreaCreate,
    SupportAreaUpdate,
    SupportTypeCreate,
    SupportTypeUpdate,
)


def normalize_name(value: str) -> str:
    return value.strip().upper()


def create_sector(db: Session, payload: SectorCreate) -> Sector:
    name = normalize_name(payload.name)
    if db.scalar(select(Sector).where(Sector.name == name)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Setor ja cadastrado.")
    sector = Sector(name=name, description=payload.description, is_active=payload.is_active)
    db.add(sector)
    db.commit()
    db.refresh(sector)
    return sector


def update_sector(db: Session, sector: Sector, payload: SectorUpdate) -> Sector:
    values = payload.model_dump(exclude_unset=True)
    if "name" in values:
        values["name"] = normalize_name(values["name"])
        existing = db.scalar(select(Sector).where(Sector.name == values["name"], Sector.id != sector.id))
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Setor ja cadastrado.")
    for field, value in values.items():
        setattr(sector, field, value)
    db.commit()
    db.refresh(sector)
    return sector


def create_support_area(db: Session, payload: SupportAreaCreate) -> SupportArea:
    name = normalize_name(payload.name)
    if db.scalar(select(SupportArea).where(SupportArea.name == name)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Area de suporte ja cadastrada.")
    area = SupportArea(name=name, description=payload.description, is_active=payload.is_active)
    db.add(area)
    db.commit()
    db.refresh(area)
    return area


def update_support_area(db: Session, area: SupportArea, payload: SupportAreaUpdate) -> SupportArea:
    values = payload.model_dump(exclude_unset=True)
    if "name" in values:
        values["name"] = normalize_name(values["name"])
        existing = db.scalar(select(SupportArea).where(SupportArea.name == values["name"], SupportArea.id != area.id))
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Area de suporte ja cadastrada.")
    for field, value in values.items():
        setattr(area, field, value)
    db.commit()
    db.refresh(area)
    return area


def assert_support_area_exists(db: Session, support_area_id: int) -> SupportArea:
    area = db.get(SupportArea, support_area_id)
    if not area:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Area de suporte nao encontrada.")
    return area


def create_support_type(db: Session, payload: SupportTypeCreate) -> SupportType:
    assert_support_area_exists(db, payload.support_area_id)
    name = normalize_name(payload.name)
    existing = db.scalar(
        select(SupportType).where(
            SupportType.support_area_id == payload.support_area_id,
            SupportType.name == name,
        )
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Tipo de suporte ja cadastrado para esta area.")
    support_type = SupportType(
        support_area_id=payload.support_area_id,
        name=name,
        description=payload.description,
        is_active=payload.is_active,
    )
    db.add(support_type)
    db.commit()
    db.refresh(support_type)
    return support_type


def update_support_type(db: Session, support_type: SupportType, payload: SupportTypeUpdate) -> SupportType:
    values = payload.model_dump(exclude_unset=True)
    support_area_id = values.get("support_area_id", support_type.support_area_id)
    if "support_area_id" in values:
        assert_support_area_exists(db, support_area_id)
    if "name" in values:
        values["name"] = normalize_name(values["name"])
    name = values.get("name", support_type.name)
    existing = db.scalar(
        select(SupportType).where(
            SupportType.support_area_id == support_area_id,
            SupportType.name == name,
            SupportType.id != support_type.id,
        )
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Tipo de suporte ja cadastrado para esta area.")
    for field, value in values.items():
        setattr(support_type, field, value)
    db.commit()
    db.refresh(support_type)
    return support_type
