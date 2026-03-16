"use client"
/* ─────────────────────────────────────────────────────────────
   page.tsx  —  /admin/orders
   Orchestrates: StatsBar · FlowChart · Filters · Table · Pagination
   All sub-components are individually importable & reusable.

   Install:
     npm dlx shadcn@latest add checkbox input button badge select
       table pagination
     npm install recharts
───────────────────────────────────────────────────────────────*/
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useOrders } from "@/hooks/useOrders"
import { useBreadcrumb } from "@/providers/BreadcrumbContext"
import { useDebounce } from "@/hooks/useDebounce"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { orderService, type OrderStatus } from "@/services/order.service"
import { toast } from "sonner"

import { OrderStatsBar } from "@/components/order/Orderstatsbar"
import { OrderFlowChart } from "@/components/order/Orderflowchart"
import { OrderFilters } from "@/components/order/Orderfilters"
import { OrderTable } from "@/components/order/OrderTable"
import { ReusablePagination } from "@/components/ReusablePagination"


export default function AdminOrdersPage() {
    const queryClient = useQueryClient()
    const { setBreadcrumbs } = useBreadcrumb()
    const params = useSearchParams()

    /* ── local state ── */
    const [page, setPage] = useState(1)
    const [rawSearch, setRawSearch] = useState("")
    const [status, setStatus] = useState("all")
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [showChart, setShowChart] = useState(true)

    const search = useDebounce(rawSearch, 400)

    /* ── breadcrumbs + URL status param ── */
    useEffect(() => {
        const s = params.get("status")
        if (s) setStatus(s)
        setBreadcrumbs([{ label: "Orders", href: "/admin/orders" }])
    }, [setBreadcrumbs])

    /* ── data ── */
    const { data, isLoading } = useOrders({
        page,
        limit: 15,
        status: status === "all" ? undefined : status,
        search: search || undefined,
    })

    const orders = data?.orders ?? []
    const total = data?.total ?? 0
    const totalPages = data?.totalPages ?? 1

    /* ── status update mutation ── */
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
            orderService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders", "all"] })
            toast.success("Order status updated")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update status")
        },
    })

    /* ── selection helpers ── */
    const handleToggle = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }, [])

    const handleSelectAll = useCallback((checked: boolean) => {
        setSelectedIds(checked ? new Set(orders.map((o: any) => o._id)) : new Set())
    }, [orders])

    const handleClearSelect = useCallback(() => setSelectedIds(new Set()), [])

    /* ── filter change resets page + selection ── */
    const handleSearch = (v: string) => { setRawSearch(v); setPage(1); setSelectedIds(new Set()) }
    const handleStatus = (v: string) => { setStatus(v); setPage(1); setSelectedIds(new Set()) }

    /* ── bulk export (stub) ── */
    const handleBulkExport = () => {
        toast.success(`Exporting ${selectedIds.size} orders…`)
        // wire to your export API here
    }

    return (
        <>
            <style>{PAGE_STYLES}</style>

            <div className=" space-y-5 pb-20">

                {/* ══ HEADER ═══════════════════════════════════════════════ */}
                <div className="  flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="ao-display text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
                        <p className="text-sm text-slate-400 font-medium mt-0.5">
                            {total.toLocaleString("en-IN")} total orders
                        </p>
                    </div>
                    <button
                        onClick={() => setShowChart(c => !c)}
                        className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-xl px-3 py-1.5 transition-all self-start sm:self-auto"
                    >
                        {showChart ? "Hide" : "Show"} analytics
                    </button>
                </div>

                {/* ══ KPI BAR ══════════════════════════════════════════════ */}
                <div className="ao-fade ">
                    <OrderStatsBar orders={orders} total={total} isLoading={isLoading} />
                </div>

                {/* ══ CHART ════════════════════════════════════════════════ */}
                {showChart && (
                    <div className="ao-fade ao-fade-2 bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5">
                        <div className="ao-section-label mb-1">Order flow</div>
                        <h2 className="ao-display text-base font-bold text-slate-900 mb-4">
                            Order Analytics
                        </h2>
                        <OrderFlowChart orders={orders} isLoading={isLoading} />
                    </div>
                )}

                {/* ══ FILTERS ══════════════════════════════════════════════ */}
                <div className="ao-fade ao-fade-3">
                    <OrderFilters
                        rawSearch={rawSearch}
                        onSearch={handleSearch}
                        status={status}
                        onStatus={handleStatus}
                        selectedIds={selectedIds}
                        allIds={orders.map((o: any) => o._id)}
                        onSelectAll={handleSelectAll}
                        onClearSelect={handleClearSelect}
                        onBulkExport={handleBulkExport}
                    />
                </div>

                {/* ══ TABLE ════════════════════════════════════════════════ */}
                <div className="ao-fade ao-fade-4">
                    <OrderTable
                        orders={orders}
                        isLoading={isLoading}
                        selectedIds={selectedIds}
                        onToggle={handleToggle}
                        detailHref={id => `/admin/orders/${id}`}
                    />
                </div>

                {/* ══ PAGINATION ═══════════════════════════════════════════ */}
                <div className="ao-fade ao-fade-4">
                    <ReusablePagination
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={total}
                        itemsPerPage={15}
                        onPageChange={p => { setPage(p); setSelectedIds(new Set()) }}
                        itemsLabel="orders"
                    />
                </div>

            </div>
        </>
    )
}

/* ─────────────────────────────────────────────────────────────
   PAGE STYLES
───────────────────────────────────────────────────────────────*/
const PAGE_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

.    { font-family: 'DM Sans', system-ui, sans-serif; }
.ao-display { font-family: 'Syne', system-ui, sans-serif; }

@keyframes ao-in {
  from { opacity:0; transform:translateY(12px); }
  to   { opacity:1; transform:translateY(0);    }
}
.ao-fade   { animation: ao-in .35s cubic-bezier(.22,1,.36,1) both; }
. { animation-delay: .04s; }
.ao-fade-2 { animation-delay: .10s; }
.ao-fade-3 { animation-delay: .16s; }
.ao-fade-4 { animation-delay: .22s; }

.ao-section-label {
  font-family: 'Syne', system-ui, sans-serif;
  font-size: 10px; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase;
  color: #94A3B8;
}
`