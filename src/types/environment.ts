export interface EnvironmentVariable {
  [key: string]: string;
}

export interface Environment {
  id: number;
  name: string;
  description: string;
  created_by: string;
  variables: EnvironmentVariable;
  created_at: string;
  updated_at: string;
}

export interface CreateEnvironmentPayload {
  name: string;
  description: string;
  created_by: string;
  variables: EnvironmentVariable;
}

export interface UpdateEnvironmentPayload {
  name: string;
  description: string;
  variables: EnvironmentVariable;
}

export interface ExtractionRule {
  id: string;
  enabled: boolean;
  jsonPath: string;
  variableName: string;
}
