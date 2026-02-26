"use client";

import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import { KanbanOrder } from "@/lib/api/kanban";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Edit, Trash2, AlertCircle } from "lucide-react";

// Column Definitions
const COLUMNS = [
  {
    id: "column-pedidos-confirmados",
    title: "Pedidos Confirmados",
    color: "bg-slate-50 border-r border-slate-200",
    headerColor: "bg-slate-600",
    text: "text-white",
    limit: 0,
  },
  {
    id: "column-en-corte",
    title: "En Corte",
    color: "bg-slate-50 border-r border-slate-200",
    headerColor: "bg-cyan-600",
    text: "text-white",
    limit: 4,
  },
  {
    id: "column-en-ensamblaje",
    title: "En Ensamblaje",
    color: "bg-slate-50 border-r border-slate-200",
    headerColor: "bg-amber-500",
    text: "text-black",
    limit: 3,
  },
  {
    id: "column-listo-para-instalar",
    title: "Listo para Instalar",
    color: "bg-slate-50 border-r border-slate-200",
    headerColor: "bg-orange-600",
    text: "text-white",
    limit: 0,
  },
  {
    id: "column-finalizado",
    title: "Finalizado",
    color: "bg-slate-50",
    headerColor: "bg-emerald-600",
    text: "text-white",
    limit: 0,
  },
];

interface KanbanBoardProps {
  initialOrders: KanbanOrder[];
  onOrderMove: (orderId: string, destColumn: string, newIndex: number) => void;
  onOrderClick: (order: KanbanOrder) => void;
  onCopyOrder?: (order: KanbanOrder) => void;
  onDeleteOrder?: (orderId: string) => void;
  wipLimits?: { [key: string]: number };
}

export function KanbanBoard({
  initialOrders,
  onOrderMove,
  onOrderClick,
  onCopyOrder,
  onDeleteOrder,
  wipLimits = {},
}: KanbanBoardProps) {
  const [orders, setOrders] = useState<KanbanOrder[]>([]);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // ✅ Patrón inmutable: crear nuevo array con objeto actualizado
    const newOrders = orders.map((order) =>
      order.id === draggableId
        ? { ...order, column_id: destination.droppableId }
        : order,
    );

    setOrders(newOrders);
    onOrderMove(draggableId, destination.droppableId, destination.index);
  };

  const getColumnStyle = (colId: string, currentCount: number) => {
    const colDef = COLUMNS.find((c) => c.id === colId);
    if (!colDef) return "bg-gray-50";

    // Dynamic WIP Limits
    const limit = wipLimits[colId] || colDef.limit || 0;

    if (limit > 0 && currentCount > limit) {
      return "bg-red-50 border-red-200";
    }

    return colDef.color;
  };

  // Helper to format date
  const isLate = (dateStr: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full w-full p-2 gap-2 bg-slate-100/50 overflow-hidden">
        {COLUMNS.map((col) => {
          const colOrders = orders
            .filter((o) => o.column_id === col.id)
            .sort((a, b) => (a.position_rank || 0) - (b.position_rank || 0));

          const count = colOrders.length;

          // Dynamic Limit from props
          const limit =
            wipLimits && wipLimits[col.id]
              ? wipLimits[col.id]
              : col.id === "column-en-corte"
                ? 4
                : col.id === "column-en-ensamblaje"
                  ? 3
                  : 0; // Default Fallback if no config

          const isOverflow = limit > 0 && count > limit;

          // Calculate class for exceeded WIP
          const stateClasses = isOverflow
            ? "border-red-500 bg-red-50"
            : "border-slate-200 bg-white";

          return (
            <div
              key={col.id}
              id={col.id}
              className={`flex flex-col flex-1 min-w-0 rounded-lg shadow-sm border transition-colors duration-200 ${stateClasses}`}
            >
              {/* Header */}
              <div
                className={`p-3 border-b border-slate-100 flex justify-between items-center ${col.headerColor} rounded-t-lg`}
              >
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-bold text-sm ${col.id === "column-en-ensamblaje" ? "text-slate-900" : "text-white"}`}
                  >
                    {col.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${col.id === "column-en-ensamblaje" ? "bg-black/10 text-slate-900" : "bg-white/20 text-white"}`}
                  >
                    {count}
                    {limit > 0 ? `/${limit}` : ""}
                  </span>
                </div>
              </div>

              {/* Inner Actions for First Column */}
              {col.id === "column-pedidos-confirmados" && (
                <div className="p-2 flex gap-2 border-b border-slate-100 bg-slate-50/50">
                  <button
                    onClick={() =>
                      document.getElementById("btn-new-order")?.click()
                    }
                    className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-1.5 px-2 rounded shadow-sm transition-colors text-center"
                  >
                    + Nueva
                  </button>
                  <button
                    onClick={() =>
                      document.getElementById("btn-paste-order")?.click()
                    }
                    className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-1.5 px-2 rounded shadow-sm transition-colors flex items-center justify-center gap-1"
                  >
                    <Copy className="h-3 w-3" /> Pegar
                  </button>
                </div>
              )}

              <Droppable droppableId={col.id}>
                {(
                  provided: DroppableProvided,
                  snapshot: DroppableStateSnapshot,
                ) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-2 space-y-2 min-h-[100px] bg-slate-50/50 ${snapshot.isDraggingOver ? "bg-indigo-50/50" : ""}`}
                  >
                    {colOrders.map((order, index) => (
                      <Draggable
                        key={order.id}
                        draggableId={order.id}
                        index={index}
                      >
                        {(
                          provided: DraggableProvided,
                          snapshot: DraggableStateSnapshot,
                        ) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ ...provided.draggableProps.style }}
                            className={`
                                                            group relative flex flex-col rounded-lg shadow-sm border border-slate-200 bg-white overflow-hidden
                                                            transition-all hover:shadow-md
                                                            ${snapshot.isDragging ? "shadow-lg rotate-1 z-50 ring-1 ring-slate-400" : ""}
                                                        `}
                          >
                            {/* Full Colored Header */}
                            <div
                              className={`${col.headerColor} p-2 flex justify-between items-start text-white`}
                            >
                              <div className="flex flex-col">
                                <span className="text-lg font-bold leading-none">
                                  {order.id}
                                </span>
                              </div>
                              {/* Actions visible on Hover (or always if preferred, but keep compact) */}
                              <div className="flex gap-1 opacity-90 hover:opacity-100">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCopyOrder?.(order);
                                  }}
                                  className="hover:bg-white/20 p-0.5 rounded text-white"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOrderClick(order);
                                  }}
                                  className="hover:bg-white/20 p-0.5 rounded text-white"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteOrder?.(order.id);
                                  }}
                                  className="hover:bg-white/20 p-0.5 rounded text-white hover:text-red-200"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Dense Content Body */}
                            <div className="p-2 space-y-1.5 text-xs text-slate-700">
                              {/* Client */}
                              <div className="leading-snug">
                                <span className="text-slate-500 font-medium">
                                  Cliente:{" "}
                                </span>
                                <span className="font-bold text-slate-800 text-[13px]">
                                  {order.client_name}
                                </span>
                              </div>

                              {/* Product (Combined Name + Desc) */}
                              <div className="leading-snug">
                                <span className="text-slate-500 font-medium">
                                  Producto:{" "}
                                </span>
                                <span className="text-slate-800 font-medium break-words">
                                  {order.product_name}
                                  {order.additional_desc
                                    ? ` - ${order.additional_desc}`
                                    : ""}
                                </span>
                              </div>

                              {/* Medidas (Boxed or Strong) */}
                              <div className="py-0.5 font-bold text-slate-700 text-[13px]">
                                Medidas: {Math.round(order.width_mm / 10)}cm x{" "}
                                {Math.round(order.height_mm / 10)}cm
                              </div>

                              <hr className="border-slate-100 my-1" />

                              {/* Grid Details */}
                              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                                <div>
                                  <span className="font-medium text-slate-600">
                                    Marca:
                                  </span>{" "}
                                  {order.brand || "-"}
                                </div>
                                <div>
                                  <span className="font-medium text-slate-600">
                                    Color:
                                  </span>{" "}
                                  {order.color || "-"}
                                </div>
                                <div>
                                  <span className="font-medium text-slate-600">
                                    Cristal:
                                  </span>{" "}
                                  {order.crystal_type || "-"}
                                </div>
                                <div>
                                  <span className="font-medium text-slate-600">
                                    Creación:
                                  </span>{" "}
                                  {order.creation_date}
                                </div>
                              </div>

                              <hr className="border-slate-100 my-1" />

                              {/* Footer: Rework & Date */}
                              <div className="flex justify-between items-center pt-0.5">
                                <div className="flex items-center gap-1">
                                  {order.rework_count > 0 && (
                                    <span className="flex items-center gap-0.5 text-orange-600 bg-orange-50 px-1 rounded text-[10px] font-bold">
                                      <AlertCircle className="h-3 w-3" />{" "}
                                      {order.rework_count}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-500 font-medium mr-1">
                                    Entrega:
                                  </span>
                                  <span
                                    className={`font-bold text-[13px] ${isLate(order.delivery_date) ? "text-red-600" : "text-slate-700"}`}
                                  >
                                    {order.delivery_date}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
