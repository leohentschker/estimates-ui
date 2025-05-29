import { useState } from "react";
import { Edge, Node } from "@xyflow/react";

export type VariableType = 'real' | 'int' | 'bool';

export type Variable = {
  name: string;
  type: VariableType;
}

export type Relation = {
  input: string;
  valid: boolean;
}

export type Goal = {
  input: string;
  valid: boolean;
}

export const TYPE_TO_SET = {
  real: '\\mathbb{R}',
  int: '\\mathbb{Z}',
  bool: '\\mathbb{B}',
}
