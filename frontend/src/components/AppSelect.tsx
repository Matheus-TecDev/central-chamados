import Select, { SingleValue, StylesConfig } from "react-select";

export interface SelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  className?: string;
  inputId?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
  isSearchable?: boolean;
  label?: string;
  noOptionsMessage?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  value: string;
}

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderColor: state.isFocused ? "#2563eb" : "#cbd5e1",
    borderRadius: 6,
    boxShadow: state.isFocused ? "0 0 0 3px rgba(37, 99, 235, 0.12)" : "none",
    backgroundColor: state.isDisabled ? "#f8fafc" : "#ffffff",
    ":hover": {
      borderColor: state.isFocused ? "#2563eb" : "#94a3b8"
    }
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "2px 12px"
  }),
  placeholder: (base) => ({
    ...base,
    color: "#64748b"
  }),
  singleValue: (base) => ({
    ...base,
    color: "#0f172a"
  }),
  input: (base) => ({
    ...base,
    color: "#0f172a"
  }),
  indicatorSeparator: () => ({
    display: "none"
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "#2563eb" : "#64748b",
    paddingRight: 10
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "#64748b"
  }),
  menu: (base) => ({
    ...base,
    border: "1px solid #d8e0e8",
    borderRadius: 6,
    boxShadow: "0 16px 36px rgba(15, 23, 42, 0.14)",
    overflow: "hidden",
    zIndex: 20
  }),
  menuList: (base) => ({
    ...base,
    padding: 4
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: 4,
    color: state.isSelected ? "#ffffff" : "#0f172a",
    backgroundColor: state.isSelected ? "#1e3a5f" : state.isFocused ? "#eef4fb" : "#ffffff",
    cursor: "pointer"
  })
};

export function AppSelect({
  className = "",
  inputId,
  isClearable = false,
  isDisabled = false,
  isSearchable = true,
  label,
  noOptionsMessage = "Nenhuma opcao encontrada",
  onChange,
  options,
  placeholder = "Selecione",
  value
}: AppSelectProps) {
  const selectedOption = options.find((option) => option.value === value) ?? null;

  function handleChange(option: SingleValue<SelectOption>) {
    onChange(option?.value ?? "");
  }

  return (
    <label className={`field select-field ${className}`}>
      {label && <span className="field-label">{label}</span>}
      <Select<SelectOption, false>
        classNamePrefix="app-select"
        inputId={inputId}
        isClearable={isClearable}
        isDisabled={isDisabled}
        isSearchable={isSearchable}
        noOptionsMessage={() => noOptionsMessage}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        styles={selectStyles}
        value={selectedOption}
      />
    </label>
  );
}
