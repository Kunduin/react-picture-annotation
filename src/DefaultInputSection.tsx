import React from "react";
import DeleteButton from "./DeleteButton";

export interface IDefaultInputSection {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onDelete: () => void;
}

export default ({
  value,
  onChange,
  onDelete,
  placeholder = "INPUT TAG HERE",
}: IDefaultInputSection) => {
  return (
    <div className="rp-default-input-section">
      <input
        className="rp-default-input-section_input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <a className="rp-default-input-section_delete" onClick={() => onDelete()}>
        <DeleteButton />
      </a>
    </div>
  );
};
