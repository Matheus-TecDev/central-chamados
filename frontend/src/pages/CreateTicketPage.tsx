import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { FileVideo, Image as ImageIcon, UploadCloud, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppSelect } from "../components/AppSelect";
import { ticketPriorities, ticketPriorityLabels, toOptions } from "../constants/options";
import { useAuth } from "../contexts/AuthContext";
import { createTicket, listSectors, listSupportAreas, listSupportTypes, uploadTicketAttachments } from "../services/resources";
import { Sector, SupportArea, SupportType, TicketPriority } from "../types/domain";

const priorityOptions = toOptions(ticketPriorities, ticketPriorityLabels);

function formatBytes(value: number) {
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
  if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${value} B`;
}

export function CreateTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [supportAreas, setSupportAreas] = useState<SupportArea[]>([]);
  const [supportTypes, setSupportTypes] = useState<SupportType[]>([]);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIA");
  const [sectorId, setSectorId] = useState("");
  const [supportAreaId, setSupportAreaId] = useState("");
  const [supportTypeId, setSupportTypeId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
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

  const filePreviews = useMemo(
    () => files.map((file) => ({ file, url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "" })),
    [files]
  );

  useEffect(() => {
    return () => {
      filePreviews.forEach((preview) => {
        if (preview.url) URL.revokeObjectURL(preview.url);
      });
    };
  }, [filePreviews]);

  function handleSelectedFiles(selectedFiles: File[]) {
    setFiles(selectedFiles.filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/")));
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

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
        <div className="field">
          <span className="field-label">Anexos opcionais</span>
          <div
            className={`upload-dropzone ${dragActive ? "drag-active" : ""} ${files.length ? "has-files" : ""}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragActive(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              handleSelectedFiles(Array.from(event.dataTransfer.files));
            }}
          >
            <input
              ref={fileInputRef}
              className="sr-only"
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(event) => handleSelectedFiles(Array.from(event.target.files ?? []))}
            />
            <div className="upload-empty">
              <span className="upload-icon"><UploadCloud size={22} /></span>
              <div>
                <strong>Arraste imagens ou videos aqui</strong>
                <small>Ou selecione arquivos do computador. Limite por arquivo: 25 MB.</small>
              </div>
              <button className="secondary" type="button" onClick={() => fileInputRef.current?.click()}>
                Selecionar arquivos
              </button>
            </div>
            {files.length > 0 && (
              <div className="upload-list">
                {filePreviews.map((preview, index) => (
                  <div className="upload-file" key={`${preview.file.name}-${preview.file.size}-${index}`}>
                    {preview.url ? (
                      <img src={preview.url} alt="" />
                    ) : (
                      <span className="upload-file-icon"><FileVideo size={18} /></span>
                    )}
                    <span>
                      <strong>{preview.file.name}</strong>
                      <small>{preview.file.type || "arquivo"} - {formatBytes(preview.file.size)}</small>
                    </span>
                    <button className="icon-button upload-remove" type="button" onClick={() => removeFile(index)} aria-label={`Remover ${preview.file.name}`}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {!files.length && <div className="upload-hint"><ImageIcon size={14} /> JPG, PNG, WEBP, MP4 e outros formatos de imagem/video aceitos pelo navegador.</div>}
          </div>
        </div>
        <button className="primary form-submit" disabled={saving || loading || !sectorId || !supportAreaId || !supportTypeId || !description.trim()}>
          {saving ? "Criando..." : "Criar chamado"}
        </button>
      </form>
    </>
  );
}
