import firebase from 'firebase/compat/app';

export type FirebaseUser = firebase.User;

export interface ReworkEvent {
  from: string;
  to: string;
  date: string;
}

export interface StageMovement {
  stage: string;
  entryDate: string;
  exitDate?: string;
}

export interface WorkOrder {
  id: string;
  client: string;
  product: string;
  brand: string;
  color: string;
  crystal: string;
  deliveryDate: string; // YYYY-MM-DD
  creationDate: string; // YYYY-MM-DD
  completionDate?: string; // YYYY-MM-DD
  width?: number;
  height?: number;
  additionalDescription?: string;
  reworkCount?: number;
}

export interface ProjectHistory extends WorkOrder {
  status: 'Activo' | 'Finalizado' | 'Eliminado' | 'Archivado';
  deletedFromColumn: string | null;
  deletionDate: string | null;
  reworkHistory?: ReworkEvent[];
  movementHistory?: StageMovement[];
}

export type ColumnId =
  | 'column-pedidos-confirmados'
  | 'column-en-corte'
  | 'column-en-ensamblaje'
  | 'column-listo-para-instalar'
  | 'column-finalizado';

export const COLUMN_IDS: ColumnId[] = [
  'column-pedidos-confirmados',
  'column-en-corte',
  'column-en-ensamblaje',
  'column-listo-para-instalar',
  'column-finalizado',
];

export interface KanbanData {
  'column-pedidos-confirmados': WorkOrder[];
  'column-en-corte': WorkOrder[];
  'column-en-ensamblaje': WorkOrder[];
  'column-listo-para-instalar': WorkOrder[];
  'column-finalizado': WorkOrder[];
  'allProjectsHistory': ProjectHistory[];
}

export interface WipLimits {
  'column-en-corte': number;
  'column-en-ensamblaje': number;
}