module.exports = [
"[project]/components/TicketSelector.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TicketSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minus.js [app-ssr] (ecmascript) <export default as Minus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/mock-data.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function TicketSelector({ eventId, eventSlug, ticketCategories }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [quantities, setQuantities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const setQty = (id, delta, max)=>{
        setQuantities((prev)=>{
            const next = Math.min(max, Math.max(0, (prev[id] ?? 0) + delta));
            return {
                ...prev,
                [id]: next
            };
        });
    };
    const subtotal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>ticketCategories.reduce((sum, tc)=>sum + (quantities[tc.id] ?? 0) * tc.unitPrice, 0), [
        quantities,
        ticketCategories
    ]);
    const totalSelected = Object.values(quantities).reduce((a, b)=>a + b, 0);
    const goToCheckout = ()=>{
        const params = new URLSearchParams();
        Object.entries(quantities).filter(([, q])=>q > 0).forEach(([id, q])=>params.set(id, String(q)));
        router.push(`/checkout/${eventId}?${params.toString()}`);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-stub border border-line bg-white p-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "font-display text-lg text-ink",
                children: "Choisissez vos billets"
            }, void 0, false, {
                fileName: "[project]/components/TicketSelector.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 divide-y divide-line",
                children: ticketCategories.map((tc)=>{
                    const remaining = tc.quantity - tc.quantitySold;
                    const soldOut = remaining <= 0;
                    const qty = quantities[tc.id] ?? 0;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between gap-4 py-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-medium text-ink",
                                        children: tc.name
                                    }, void 0, false, {
                                        fileName: "[project]/components/TicketSelector.tsx",
                                        lineNumber: 59,
                                        columnNumber: 17
                                    }, this),
                                    tc.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-ink/50",
                                        children: tc.description
                                    }, void 0, false, {
                                        fileName: "[project]/components/TicketSelector.tsx",
                                        lineNumber: 61,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 font-mono text-sm text-forest",
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatFCFA"])(tc.unitPrice)
                                    }, void 0, false, {
                                        fileName: "[project]/components/TicketSelector.tsx",
                                        lineNumber: 63,
                                        columnNumber: 17
                                    }, this),
                                    !soldOut && remaining <= 30 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-0.5 text-xs text-coral",
                                        children: [
                                            "Plus que ",
                                            remaining,
                                            " places"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/TicketSelector.tsx",
                                        lineNumber: 67,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/TicketSelector.tsx",
                                lineNumber: 58,
                                columnNumber: 15
                            }, this),
                            soldOut ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "shrink-0 rounded-full bg-ink/5 px-3 py-1 text-xs text-ink/40",
                                children: "Épuisé"
                            }, void 0, false, {
                                fileName: "[project]/components/TicketSelector.tsx",
                                lineNumber: 74,
                                columnNumber: 17
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex shrink-0 items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        "aria-label": `Retirer un billet ${tc.name}`,
                                        onClick: ()=>setQty(tc.id, -1, remaining),
                                        disabled: qty === 0,
                                        className: "flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink/60 transition-colors hover:bg-forest/5 disabled:opacity-30",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__["Minus"], {
                                            size: 14
                                        }, void 0, false, {
                                            fileName: "[project]/components/TicketSelector.tsx",
                                            lineNumber: 85,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/TicketSelector.tsx",
                                        lineNumber: 79,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-4 text-center font-mono text-sm",
                                        children: qty
                                    }, void 0, false, {
                                        fileName: "[project]/components/TicketSelector.tsx",
                                        lineNumber: 87,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        "aria-label": `Ajouter un billet ${tc.name}`,
                                        onClick: ()=>setQty(tc.id, 1, remaining),
                                        disabled: qty >= remaining,
                                        className: "flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink/60 transition-colors hover:bg-forest/5 disabled:opacity-30",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                            size: 14
                                        }, void 0, false, {
                                            fileName: "[project]/components/TicketSelector.tsx",
                                            lineNumber: 94,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/TicketSelector.tsx",
                                        lineNumber: 88,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/TicketSelector.tsx",
                                lineNumber: 78,
                                columnNumber: 17
                            }, this)
                        ]
                    }, tc.id, true, {
                        fileName: "[project]/components/TicketSelector.tsx",
                        lineNumber: 57,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/components/TicketSelector.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 flex items-center justify-between border-t border-line pt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-ink/60",
                        children: "Sous-total"
                    }, void 0, false, {
                        fileName: "[project]/components/TicketSelector.tsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-mono text-lg font-medium text-ink",
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatFCFA"])(subtotal)
                    }, void 0, false, {
                        fileName: "[project]/components/TicketSelector.tsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/TicketSelector.tsx",
                lineNumber: 103,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: goToCheckout,
                disabled: totalSelected === 0,
                className: "mt-4 w-full rounded-full bg-forest py-3 text-sm font-medium text-ivory transition-colors hover:bg-forest-light disabled:cursor-not-allowed disabled:opacity-40",
                children: totalSelected === 0 ? "Sélectionnez au moins un billet" : `Continuer · ${totalSelected} billet${totalSelected > 1 ? "s" : ""}`
            }, void 0, false, {
                fileName: "[project]/components/TicketSelector.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/TicketSelector.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
}),
"[project]/lib/mock-data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Données de démonstration — à remplacer par des requêtes Prisma
// (voir lib/db.ts) une fois la base connectée. La forme des objets
// correspond exactement au schéma défini dans prisma/schema.prisma.
__turbopack_context__.s([
    "categories",
    ()=>categories,
    "cities",
    ()=>cities,
    "events",
    ()=>events,
    "fillRate",
    ()=>fillRate,
    "formatFCFA",
    ()=>formatFCFA,
    "getEventBySlug",
    ()=>getEventBySlug,
    "minPrice",
    ()=>minPrice
]);
const categories = [
    "Concert",
    "Festival",
    "Conférence",
    "Sport",
    "Théâtre",
    "Nightlife"
];
const cities = [
    "Cotonou",
    "Porto-Novo",
    "Parakou",
    "Abomey-Calavi"
];
const events = [
    {
        id: "evt_1",
        slug: "afro-nation-cotonou",
        title: "Afro Nation Cotonou",
        description: "Trois scènes, une nuit. Afro Nation pose ses valises à Cotonou pour une édition spéciale avec les plus grands noms de l'afrobeats et de l'amapiano, entre la plage et la ville.",
        category: "Festival",
        city: "Cotonou",
        venueName: "Plage de Fidjrossè",
        address: "Route des Pêches, Fidjrossè, Cotonou",
        coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1600&auto=format&fit=crop",
        startsAt: "2026-12-19T18:00:00+01:00",
        endsAt: "2026-12-20T02:00:00+01:00",
        organizerName: "Vibra Events",
        ticketCategories: [
            {
                id: "tc_1a",
                name: "Early Bird",
                unitPrice: 15000,
                quantity: 300,
                quantitySold: 287
            },
            {
                id: "tc_1b",
                name: "Standard",
                unitPrice: 25000,
                quantity: 1200,
                quantitySold: 640
            },
            {
                id: "tc_1c",
                name: "VIP",
                description: "Accès lounge + boissons incluses",
                unitPrice: 60000,
                quantity: 150,
                quantitySold: 52
            }
        ]
    },
    {
        id: "evt_2",
        slug: "benin-tech-summit-2026",
        title: "Bénin Tech Summit",
        description: "Le rendez-vous annuel de l'écosystème tech béninois : startups, investisseurs, développeurs et institutions se retrouvent pour deux jours de conférences, d'ateliers et de networking.",
        category: "Conférence",
        city: "Cotonou",
        venueName: "Palais des Congrès",
        address: "Boulevard de la Marina, Cotonou",
        coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop",
        startsAt: "2026-11-05T09:00:00+01:00",
        endsAt: "2026-11-06T18:00:00+01:00",
        organizerName: "Epitech Bénin Alumni",
        ticketCategories: [
            {
                id: "tc_2a",
                name: "Étudiant",
                unitPrice: 3000,
                quantity: 400,
                quantitySold: 180
            },
            {
                id: "tc_2b",
                name: "Standard",
                unitPrice: 10000,
                quantity: 500,
                quantitySold: 210
            },
            {
                id: "tc_2c",
                name: "Pass Entreprise",
                description: "Accès salon exposants",
                unitPrice: 35000,
                quantity: 80,
                quantitySold: 19
            }
        ]
    },
    {
        id: "evt_3",
        slug: "nuit-des-tables-rondes",
        title: "La Nuit des Tables Rondes",
        description: "Stand-up, poésie urbaine et musique live dans une ambiance intimiste. Une soirée éclectique portée par une nouvelle génération d'artistes béninois.",
        category: "Nightlife",
        city: "Cotonou",
        venueName: "Le Podium",
        address: "Quartier Haie Vive, Cotonou",
        coverImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1600&auto=format&fit=crop",
        startsAt: "2026-09-27T20:00:00+01:00",
        endsAt: "2026-09-28T00:00:00+01:00",
        organizerName: "Collectif Ana",
        ticketCategories: [
            {
                id: "tc_3a",
                name: "Standard",
                unitPrice: 5000,
                quantity: 200,
                quantitySold: 145
            },
            {
                id: "tc_3b",
                name: "VIP",
                description: "Table réservée, 1er rang",
                unitPrice: 20000,
                quantity: 30,
                quantitySold: 24
            }
        ]
    },
    {
        id: "evt_4",
        slug: "finale-coupe-benin-porto-novo",
        title: "Finale Coupe du Bénin",
        description: "La grande finale de la Coupe du Bénin. Ambiance garantie dans un stade en fusion pour couronner le champion de la saison.",
        category: "Sport",
        city: "Porto-Novo",
        venueName: "Stade Charles de Gaulle",
        address: "Porto-Novo",
        coverImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop",
        startsAt: "2026-10-18T16:00:00+01:00",
        endsAt: "2026-10-18T19:00:00+01:00",
        organizerName: "Fédération Béninoise de Football",
        ticketCategories: [
            {
                id: "tc_4a",
                name: "Populaire",
                unitPrice: 2000,
                quantity: 5000,
                quantitySold: 3120
            },
            {
                id: "tc_4b",
                name: "Tribune",
                unitPrice: 8000,
                quantity: 1200,
                quantitySold: 640
            },
            {
                id: "tc_4c",
                name: "Loge VIP",
                unitPrice: 30000,
                quantity: 60,
                quantitySold: 41
            }
        ]
    },
    {
        id: "evt_5",
        slug: "marche-des-createurs-parakou",
        title: "Marché des Créateurs",
        description: "Mode, artisanat et gastronomie locale rassemblés le temps d'un week-end. Plus de 60 exposants venus de tout le pays.",
        category: "Festival",
        city: "Parakou",
        venueName: "Place de l'Étoile Rouge",
        address: "Parakou",
        coverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop",
        startsAt: "2026-10-03T10:00:00+01:00",
        endsAt: "2026-10-04T19:00:00+01:00",
        organizerName: "Ville de Parakou",
        ticketCategories: [
            {
                id: "tc_5a",
                name: "Entrée journée",
                unitPrice: 1000,
                quantity: 2000,
                quantitySold: 430
            }
        ]
    },
    {
        id: "evt_6",
        slug: "romeo-juliette-plein-air",
        title: "Roméo & Juliette, en plein air",
        description: "Une adaptation contemporaine du classique de Shakespeare, jouée en français et en fon, sous les étoiles.",
        category: "Théâtre",
        city: "Abomey-Calavi",
        venueName: "Campus UAC — Amphithéâtre extérieur",
        address: "Abomey-Calavi",
        coverImage: "https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1600&auto=format&fit=crop",
        startsAt: "2026-09-25T19:30:00+01:00",
        endsAt: "2026-09-25T21:30:00+01:00",
        organizerName: "Troupe Kpogozoun",
        ticketCategories: [
            {
                id: "tc_6a",
                name: "Standard",
                unitPrice: 3500,
                quantity: 250,
                quantitySold: 98
            }
        ]
    }
];
function getEventBySlug(slug) {
    return events.find((e)=>e.slug === slug);
}
function minPrice(event) {
    return Math.min(...event.ticketCategories.map((t)=>t.unitPrice));
}
function fillRate(event) {
    const total = event.ticketCategories.reduce((s, t)=>s + t.quantity, 0);
    const sold = event.ticketCategories.reduce((s, t)=>s + t.quantitySold, 0);
    return Math.round(sold / total * 100);
}
function formatFCFA(amount) {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}
}),
];

//# sourceMappingURL=_0quus_k._.js.map