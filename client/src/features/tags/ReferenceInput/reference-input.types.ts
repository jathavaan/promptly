export interface RefCandidate {
  uuid: string;
  id: string;
}

export interface ReferenceInputProps {
  value: string;
  onChange: (value: string) => void;
  candidates: RefCandidate[];
  placeholder?: string;
  minRows?: number;
  ariaLabel?: string;
}
