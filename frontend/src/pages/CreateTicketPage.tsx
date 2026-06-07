import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSelect } from "../components/AppSelect";
import { ticketPriorities, ticketPriorityLabels, toOptions } from "../constants/options";
import { useAuth } from "../contexts/AuthContext";
import { createTicket, listSectors, listSupportAreas, listSupportTypes, uploadTicketAttachments } from "../services/resources";
import { Sector, SupportArea, SupportType, TicketPriority } from "../types/domain";

const priorityOptions = toOptions(ticketPriorities, ticketPriorityLabels);

export function CreateTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [supportAreas, setSupportAreas] = useState<SupportArea[]>([]);
  const [supportTypes, setSupportTypes] = useState<SupportType[]>([]);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIA");
  const [sectorId, setSectorId] = useState("");
  const [supportAreaId, setSupportAreaId] = useState("");
  const [supportTypeId, setSupportTypeId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      setLoading(true);
      setError("");
      try {
        const [sectorItems, areaItems, typeItems] = await Promise.all([
          listSectors(true),
          listSupportAreas(true),
          listSupportTypes({ activeOnly: true })
        ]);
        setSectors(sectorItems);
        setSupportAreas(areaItems);
        setSupportTypes(typeItems);
        setSectorId(String(sectorItems[0]?.id ?? ""));
        setSupportAreaId(String(areaItems[0]?.id ?? ""));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados de atendimento.");
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, []);

  const typeOptions = useMemo(
    () => supportTypes.filter((type) => String(type.support_area_id) === supportAreaId),
    [supportTypes, supportAreaId]
  );

  useEffect(() => {
    setSupportTypeId(String(typeOptions[0]?.id ?? ""));
  }, [typeOptions]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const ticket = await createTicket({
        description,
        priority,
        sector_id: Number(sectorId),
        support_area_id: Number(supportAreaId),
        support_type_id: Number(supportTypeId)
      });
      if (files.length) {
        await uploadTicketAttachments(ticket.id, files);
      }
      navigate(`/chamados/${ticket.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar chamado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Novo chamado</h1>
          <p>Registre a solicitacao com setor, area de suporte e tipo para triagem.</p>
        </div>
      </div>
      {error && <div className="alert list-alert">{error}</div>}
      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="requester-summary">
          <span>Solicitante</span>
          <strong>{user?.name}</strong>
          <small>{user?.email}</small>
        </div>
        <div className="form-grid">
          <AppSelect
            label="Setor"
            value={sectorId}
            options={sectors.map((sector) => ({ value: String(sector.id), label: sector.name }))}
            onChange={setSectorId}
            isDisabled={loading || !sectors.length}
            placeholder={sectors.length ? "Selecione" : "Sem setores ativos"}
          />
          <AppSelect
            label="Area do suporte"
            value={supportAreaId}
            options={supportAreas.map((area) => ({ value: String(area.id), label: area.name }))}
            onChange={setSupportAreaId}
            isDisabled={loading || !supportAreas.length}
            placeholder={supportAreas.length ? "Selecione" : "Sem areas ativas"}
          />
          <AppSelect
            label="Tipo de suporte"
            value={supportTypeId}
            options={typeOptions.map((type) => ({ value: String(type.id), label: type.name }))}
            onChange={setSupportTypeId}
            isDisabled={loading || !supportAreaId || !typeOptions.length}
            placeholder={typeOptions.length ? "Selecione" : "Sem tipos para a area"}
          />
          <AppSelect label="Prioridade" value={priority} options={priorityOptions} onChange={(value) => setPriority(value as TicketPriority)} isSearchable={false} />
        </div>
        <label>Detalhamento do problema<textarea value={description} onChange={(event) => setDescription(event.target.value)} required /></label>
        <label>Anexos opcionais de imagem ou video<input type="file" accept="image/*,video/*" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></label>
        {files.length > 0 && <div className="attachment-hint">{files.length} arquivo(s) selecionado(s)</div>}
        <button className="primary form-submit" disabled={saving || loading || !sectorId || !supportAreaId || !supportTypeId || !description.trim()}>
          {saving ? "Criando..." : "Criar chamado"}
        </button>
      </form>
    </>
  );
}
