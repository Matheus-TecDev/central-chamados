from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.core.enums import UserRole
from app.models.support import Sector, SupportArea, SupportType
from app.models.user import User
from app.schemas.support import (
    SectorCreate,
    SectorRead,
    SectorUpdate,
    SupportAreaCreate,
    SupportAreaRead,
    SupportAreaUpdate,
    SupportTypeCreate,
    SupportTypeRead,
    SupportTypeUpdate,
)
from app.services.support import (
    create_sector,
    create_support_area,
    create_support_type,
    update_sector,
    update_support_area,
    update_support_type,
)

router = APIRouter(tags=["Atendimento"])


@router.get("/sectors", response_model=list[SectorRead])
def list_sectors(
    active_only: bool = False,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Sector]:
    query = select(Sector).order_by(Sector.name)
    if active_only:
        query = query.where(Sector.is_active.is_(True))
    return list(db.scalars(query))


@router.post("/sectors", response_model=SectorRead, status_code=201)
def store_sector(
    payload: SectorCreate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> Sector:
    return create_sector(db, payload)


@router.put("/sectors/{sector_id}", response_model=SectorRead)
def update_sector_route(
    sector_id: int,
    payload: SectorUpdate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> Sector:
    sector = db.get(Sector, sector_id)
    if not sector:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Setor nao encontrado.")
    return update_sector(db, sector, payload)


@router.delete("/sectors/{sector_id}", status_code=204)
def deactivate_sector(
    sector_id: int,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> None:
    sector = db.get(Sector, sector_id)
    if not sector:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Setor nao encontrado.")
    sector.is_active = False
    db.commit()


@router.get("/support-areas", response_model=list[SupportAreaRead])
def list_support_areas(
    active_only: bool = False,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[SupportArea]:
    query = select(SupportArea).order_by(SupportArea.name)
    if active_only:
        query = query.where(SupportArea.is_active.is_(True))
    return list(db.scalars(query))


@router.post("/support-areas", response_model=SupportAreaRead, status_code=201)
def store_support_area(
    payload: SupportAreaCreate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> SupportArea:
    return create_support_area(db, payload)


@router.put("/support-areas/{support_area_id}", response_model=SupportAreaRead)
def update_support_area_route(
    support_area_id: int,
    payload: SupportAreaUpdate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> SupportArea:
    area = db.get(SupportArea, support_area_id)
    if not area:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Area de suporte nao encontrada.")
    return update_support_area(db, area, payload)


@router.delete("/support-areas/{support_area_id}", status_code=204)
def deactivate_support_area(
    support_area_id: int,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> None:
    area = db.get(SupportArea, support_area_id)
    if not area:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Area de suporte nao encontrada.")
    area.is_active = False
    db.commit()


@router.get("/support-types", response_model=list[SupportTypeRead])
def list_support_types(
    active_only: bool = False,
    support_area_id: int | None = None,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[SupportType]:
    query = select(SupportType).options(joinedload(SupportType.support_area)).order_by(SupportType.name)
    if active_only:
        query = query.where(SupportType.is_active.is_(True))
    if support_area_id:
        query = query.where(SupportType.support_area_id == support_area_id)
    return list(db.scalars(query))


@router.post("/support-types", response_model=SupportTypeRead, status_code=201)
def store_support_type(
    payload: SupportTypeCreate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> SupportType:
    return create_support_type(db, payload)


@router.put("/support-types/{support_type_id}", response_model=SupportTypeRead)
def update_support_type_route(
    support_type_id: int,
    payload: SupportTypeUpdate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> SupportType:
    support_type = db.get(SupportType, support_type_id)
    if not support_type:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tipo de suporte nao encontrado.")
    return update_support_type(db, support_type, payload)


@router.delete("/support-types/{support_type_id}", status_code=204)
def deactivate_support_type(
    support_type_id: int,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> None:
    support_type = db.get(SupportType, support_type_id)
    if not support_type:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tipo de suporte nao encontrado.")
    support_type.is_active = False
    db.commit()
