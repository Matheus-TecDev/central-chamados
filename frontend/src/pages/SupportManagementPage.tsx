import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppSelect } from "../components/AppSelect";
import { ActiveBadge } from "../components/Badge";
import {
  createSector,
  createSupportArea,
  createSupportType,
  deactivateSector,
  deactivateSupportArea,
  deactivateSupportType,
  listSectors,
  listSupportAreas,
  listSupportTypes,
  updateSector,
  updateSupportArea,
  updateSupportType
} from "../services/resources";
import { Sector, SupportArea, SupportType } from "../types/domain";

type Tab = "sectors" | "areas" | "types";

const emptyBaseForm = { id: 0, name: "", description: "", is_active: true };
const emptyTypeForm = { ...emptyBaseForm, support_area_id: "" };

export function SupportManagementPage() {
  const [tab, setTab] = useState<Tab>("sectors");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [areas, setAreas] = useState<SupportArea[]>([]);
  const [types, setTypes] = useState<SupportType[]>([]);
  const [sectorForm, setSectorForm] = useState(emptyBaseForm);
  const [areaForm, setAreaForm] = useState(emptyBaseForm);
  const [typeForm, setTypeForm] = useState(emptyTypeForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function reload() {
    const [sectorItems, areaItems, typeItems] = await Promise.all([listSectors(), listSupportAreas(), listSupportTypes()]);
    setSectors(sectorItems);
    setAreas(areaItems);
    setTypes(typeItems);
    setTypeForm((current) => ({ ...current, support_area_id: current.support_area_id || String(areaItems[0]?.id ?? "") }));
  }

  useEffect(() => {
    document.title = "Nexus | Atendimento";
    reload().catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar cadastros."));
  }, []);

  const areaOptions = useMemo(() => areas.map((area) => ({ value: String(area.id), label: area.name })), [areas]);

  async function runAction(action: () => Promise<unknown>) {
    setSaving(true);
    setError("");
    try {
      await action();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar cadastro.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSectorSubmit(event: FormEvent) {
    event.preventDefault();
    await runAction(() =>
      sectorForm.id
        ? updateSector(sectorForm.id, sectorForm)
        : createSector({ name: sectorForm.name, description: sectorForm.description, is_active: sectorForm.is_active })
    );
    setSectorForm(emptyBaseForm);
  }

  async function handleAreaSubmit(event: FormEvent) {
    event.preventDefault();
    await runAction(() =>
      areaForm.id
        ? updateSupportArea(areaForm.id, areaForm)
        : createSupportArea({ name: areaForm.name, description: areaForm.description, is_active: areaForm.is_active })
    );
    setAreaForm(emptyBaseForm);
  }

  async function handleTypeSubmit(event: FormEvent) {
    event.preventDefault();
    await runAction(() =>
      typeForm.id
        ? updateSupportType(typeForm.id, { ...typeForm, support_area_id: Number(typeForm.support_area_id) })
        : createSupportType({
            name: typeForm.name,
            description: typeForm.description,
            is_active: typeForm.is_active,
            support_area_id: Number(typeForm.support_area_id)
          })
    );
    setTypeForm({ ...emptyTypeForm, support_area_id: String(areas[0]?.id ?? "") });
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Atendimento</h1>
          <p>Gerencie setores, areas de suporte e tipos vinculados.</p>
        </div>
        <Link className="secondary" to="/categorias">Categorias legadas</Link>
      </div>
      {error && <div className="alert list-alert">{error}</div>}
      <div className="tabs">
        <button className={`tab-button ${tab === "sectors" ? "active" : ""}`} type="button" onClick={() => setTab("sectors")}>Setores</button>
        <button className={`tab-button ${tab === "areas" ? "active" : ""}`} type="button" onClick={() => setTab("areas")}>Areas</button>
        <button className={`tab-button ${tab === "types" ? "active" : ""}`} type="button" onClick={() => setTab("types")}>Tipos</button>
      </div>

      {tab === "sectors" && (
        <>
          <form className="inline-form management-form" onSubmit={handleSectorSubmit}>
            <label>Nome<input value={sectorForm.name} onChange={(event) => setSectorForm((current) => ({ ...current, name: event.target.value }))} required /></label>
            <label>Descricao<input value={sectorForm.description} onChange={(event) => setSectorForm((current) => ({ ...current, description: event.target.value }))} /></label>
            <label className="checkbox-field"><input type="checkbox" checked={sectorForm.is_active} onChange={(event) => setSectorForm((current) => ({ ...current, is_active: event.target.checked }))} />Ativo</label>
            <button className="primary form-submit" disabled={saving}>{sectorForm.id ? "Salvar setor" : "Criar setor"}</button>
          </form>
          <div className="table management-table">
            <div className="table-header"><span>Nome</span><span>Descricao</span><span>Status</span><span>Acoes</span></div>
            {sectors.map((sector) => (
              <div className="table-row" key={sector.id}>
                <span data-label="Nome">{sector.name}</span>
                <span data-label="Descricao">{sector.description}</span>
                <span data-label="Status"><ActiveBadge active={sector.is_active} /></span>
                <span data-label="Acoes" className="row-actions">
                  <button className="secondary" type="button" onClick={() => setSectorForm({ id: sector.id, name: sector.name, description: sector.description ?? "", is_active: sector.is_active })}>Editar</button>
                  <button className="secondary" type="button" onClick={() => runAction(() => sector.is_active ? deactivateSector(sector.id) : updateSector(sector.id, { is_active: true }))}>{sector.is_active ? "Desativar" : "Ativar"}</button>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "areas" && (
        <>
          <form className="inline-form management-form" onSubmit={handleAreaSubmit}>
            <label>Nome<input value={areaForm.name} onChange={(event) => setAreaForm((current) => ({ ...current, name: event.target.value }))} required /></label>
            <label>Descricao<input value={areaForm.description} onChange={(event) => setAreaForm((current) => ({ ...current, description: event.target.value }))} /></label>
            <label className="checkbox-field"><input type="checkbox" checked={areaForm.is_active} onChange={(event) => setAreaForm((current) => ({ ...current, is_active: event.target.checked }))} />Ativo</label>
            <button className="primary form-submit" disabled={saving}>{areaForm.id ? "Salvar area" : "Criar area"}</button>
          </form>
          <div className="table management-table">
            <div className="table-header"><span>Nome</span><span>Descricao</span><span>Status</span><span>Acoes</span></div>
            {areas.map((area) => (
              <div className="table-row" key={area.id}>
                <span data-label="Nome">{area.name}</span>
                <span data-label="Descricao">{area.description}</span>
                <span data-label="Status"><ActiveBadge active={area.is_active} /></span>
                <span data-label="Acoes" className="row-actions">
                  <button className="secondary" type="button" onClick={() => setAreaForm({ id: area.id, name: area.name, description: area.description ?? "", is_active: area.is_active })}>Editar</button>
                  <button className="secondary" type="button" onClick={() => runAction(() => area.is_active ? deactivateSupportArea(area.id) : updateSupportArea(area.id, { is_active: true }))}>{area.is_active ? "Desativar" : "Ativar"}</button>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "types" && (
        <>
          <form className="inline-form management-form management-type-form" onSubmit={handleTypeSubmit}>
            <AppSelect label="Area" value={typeForm.support_area_id} options={areaOptions} onChange={(value) => setTypeForm((current) => ({ ...current, support_area_id: value }))} />
            <label>Nome<input value={typeForm.name} onChange={(event) => setTypeForm((current) => ({ ...current, name: event.target.value }))} required /></label>
            <label>Descricao<input value={typeForm.description} onChange={(event) => setTypeForm((current) => ({ ...current, description: event.target.value }))} /></label>
            <label className="checkbox-field"><input type="checkbox" checked={typeForm.is_active} onChange={(event) => setTypeForm((current) => ({ ...current, is_active: event.target.checked }))} />Ativo</label>
            <button className="primary form-submit" disabled={saving || !typeForm.support_area_id}>{typeForm.id ? "Salvar tipo" : "Criar tipo"}</button>
          </form>
          <div className="table support-types-table">
            <div className="table-header"><span>Tipo</span><span>Area</span><span>Descricao</span><span>Status</span><span>Acoes</span></div>
            {types.map((type) => (
              <div className="table-row" key={type.id}>
                <span data-label="Tipo">{type.name}</span>
                <span data-label="Area">{type.support_area.name}</span>
                <span data-label="Descricao">{type.description}</span>
                <span data-label="Status"><ActiveBadge active={type.is_active} /></span>
                <span data-label="Acoes" className="row-actions">
                  <button className="secondary" type="button" onClick={() => setTypeForm({ id: type.id, name: type.name, description: type.description ?? "", is_active: type.is_active, support_area_id: String(type.support_area_id) })}>Editar</button>
                  <button className="secondary" type="button" onClick={() => runAction(() => type.is_active ? deactivateSupportType(type.id) : updateSupportType(type.id, { is_active: true }))}>{type.is_active ? "Desativar" : "Ativar"}</button>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
