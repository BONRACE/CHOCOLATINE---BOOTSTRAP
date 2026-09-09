(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/CatalogClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CatalogClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/mock-data.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EventCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/EventCard.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function CatalogClient({ events }) {
    _s();
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [category, setCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [city, setCity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CatalogClient.useMemo[filtered]": ()=>{
            const q = query.trim().toLowerCase();
            return events.filter({
                "CatalogClient.useMemo[filtered]": (e)=>{
                    const matchesQuery = !q || e.title.toLowerCase().includes(q) || e.venueName.toLowerCase().includes(q) || e.city.toLowerCase().includes(q);
                    const matchesCategory = !category || e.category === category;
                    const matchesCity = !city || e.city === city;
                    return matchesQuery && matchesCategory && matchesCity;
                }
            }["CatalogClient.useMemo[filtered]"]);
        }
    }["CatalogClient.useMemo[filtered]"], [
        events,
        query,
        category,
        city
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "relative overflow-hidden bg-forest",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-14 md:grid-cols-[1.1fr_0.9fr] md:pb-24 md:pt-20",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "animate-[fadeUp_0.7s_ease-out]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-mono text-xs uppercase tracking-[0.16em] text-gold/80",
                                    children: "Bénin · Billetterie en ligne"
                                }, void 0, false, {
                                    fileName: "[project]/components/CatalogClient.tsx",
                                    lineNumber: 33,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "mt-4 max-w-lg font-display text-4xl italic leading-[1.1] text-ivory md:text-5xl",
                                    children: "Votre prochaine sortie tient dans un billet."
                                }, void 0, false, {
                                    fileName: "[project]/components/CatalogClient.tsx",
                                    lineNumber: 36,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-5 max-w-md text-[15px] leading-relaxed text-ivory/70",
                                    children: "Concerts, festivals, conférences et matchs — trouvez l'événement, réservez en Mobile Money ou carte, et présentez simplement votre QR code à l'entrée."
                                }, void 0, false, {
                                    fileName: "[project]/components/CatalogClient.tsx",
                                    lineNumber: 39,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-8 flex max-w-md items-center gap-2 rounded-full border border-gold/30 bg-forest-dark/60 p-1.5 pl-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                            size: 17,
                                            className: "shrink-0 text-gold/70"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CatalogClient.tsx",
                                            lineNumber: 47,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: query,
                                            onChange: (e)=>setQuery(e.target.value),
                                            placeholder: "Un artiste, une salle, une ville…",
                                            className: "w-full bg-transparent py-2 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CatalogClient.tsx",
                                            lineNumber: 48,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "shrink-0 rounded-full bg-gold px-4 py-2 text-sm font-medium text-forest-dark transition-colors hover:bg-gold-pale",
                                            children: "Chercher"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CatalogClient.tsx",
                                            lineNumber: 55,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CatalogClient.tsx",
                                    lineNumber: 46,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CatalogClient.tsx",
                            lineNumber: 32,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative hidden items-center justify-center md:flex",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative w-64 rotate-[6deg] rounded-stub border border-gold/25 bg-forest-dark/70 p-5 shadow-2xl",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-mono text-[10px] uppercase tracking-widest text-gold/60",
                                            children: "Accès général"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CatalogClient.tsx",
                                            lineNumber: 64,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-2 font-display text-2xl italic text-ivory",
                                            children: "Afro Nation"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CatalogClient.tsx",
                                            lineNumber: 67,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-1 text-xs text-ivory/50",
                                            children: "Fidjrossè, Cotonou"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CatalogClient.tsx",
                                            lineNumber: 70,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "my-4 h-px w-full bg-[repeating-linear-gradient(90deg,transparent,transparent_5px,rgba(212,166,47,0.4)_5px,rgba(212,166,47,0.4)_9px)]"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CatalogClient.tsx",
                                            lineNumber: 71,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-end justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "font-mono text-[10px] text-gold/60",
                                                            children: "PORTE"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CatalogClient.tsx",
                                                            lineNumber: 74,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "font-display text-lg text-ivory",
                                                            children: "B"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CatalogClient.tsx",
                                                            lineNumber: 75,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CatalogClient.tsx",
                                                    lineNumber: 73,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-12 w-12 rounded bg-ivory/90 p-1",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-full w-full bg-[repeating-linear-gradient(90deg,#12241C,#12241C_2px,transparent_2px,transparent_4px)]"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CatalogClient.tsx",
                                                        lineNumber: 78,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CatalogClient.tsx",
                                                    lineNumber: 77,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CatalogClient.tsx",
                                            lineNumber: 72,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CatalogClient.tsx",
                                    lineNumber: 63,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute -bottom-4 -left-4 w-52 -rotate-[8deg] rounded-stub border border-gold/15 bg-forest-dark/40 p-5 opacity-70",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-mono text-[10px] uppercase tracking-widest text-gold/40",
                                            children: "Standard"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CatalogClient.tsx",
                                            lineNumber: 83,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-2 font-display text-lg italic text-ivory/70",
                                            children: "Tech Summit"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CatalogClient.tsx",
                                            lineNumber: 86,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CatalogClient.tsx",
                                    lineNumber: 82,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CatalogClient.tsx",
                            lineNumber: 62,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CatalogClient.tsx",
                    lineNumber: 31,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CatalogClient.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "border-b border-line bg-ivory",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-6 py-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setCategory(null),
                            className: `rounded-full px-3.5 py-1.5 text-sm transition-colors ${category === null ? "bg-forest text-ivory" : "bg-white text-ink/70 hover:bg-forest/10"}`,
                            children: "Tout"
                        }, void 0, false, {
                            fileName: "[project]/components/CatalogClient.tsx",
                            lineNumber: 97,
                            columnNumber: 11
                        }, this),
                        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categories"].map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setCategory(c === category ? null : c),
                                className: `rounded-full px-3.5 py-1.5 text-sm transition-colors ${category === c ? "bg-forest text-ivory" : "bg-white text-ink/70 hover:bg-forest/10"}`,
                                children: c
                            }, c, false, {
                                fileName: "[project]/components/CatalogClient.tsx",
                                lineNumber: 108,
                                columnNumber: 13
                            }, this)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "mx-1 h-5 w-px bg-line",
                            "aria-hidden": "true"
                        }, void 0, false, {
                            fileName: "[project]/components/CatalogClient.tsx",
                            lineNumber: 121,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                            value: city ?? "",
                            onChange: (e)=>setCity(e.target.value || null),
                            className: "rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink/70 focus:outline-none",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "",
                                    children: "Toutes les villes"
                                }, void 0, false, {
                                    fileName: "[project]/components/CatalogClient.tsx",
                                    lineNumber: 128,
                                    columnNumber: 13
                                }, this),
                                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cities"].map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: c,
                                        children: c
                                    }, c, false, {
                                        fileName: "[project]/components/CatalogClient.tsx",
                                        lineNumber: 130,
                                        columnNumber: 15
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CatalogClient.tsx",
                            lineNumber: 123,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CatalogClient.tsx",
                    lineNumber: 96,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CatalogClient.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "mx-auto max-w-6xl px-6 py-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6 flex items-baseline justify-between",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "font-display text-2xl text-ink",
                            children: filtered.length > 0 ? `${filtered.length} événement${filtered.length > 1 ? "s" : ""} à découvrir` : "Aucun événement trouvé"
                        }, void 0, false, {
                            fileName: "[project]/components/CatalogClient.tsx",
                            lineNumber: 141,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/CatalogClient.tsx",
                        lineNumber: 140,
                        columnNumber: 9
                    }, this),
                    filtered.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
                        children: filtered.map((event)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EventCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                event: event
                            }, event.id, false, {
                                fileName: "[project]/components/CatalogClient.tsx",
                                lineNumber: 151,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/CatalogClient.tsx",
                        lineNumber: 149,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-stub border border-dashed border-line bg-white/60 px-6 py-16 text-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-ink/60",
                            children: "Essayez un autre mot-clé, ou changez de ville et de catégorie."
                        }, void 0, false, {
                            fileName: "[project]/components/CatalogClient.tsx",
                            lineNumber: 156,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/CatalogClient.tsx",
                        lineNumber: 155,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CatalogClient.tsx",
                lineNumber: 139,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/CatalogClient.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_s(CatalogClient, "qg1ZGGH91g09KgxHjbSgmy0PL2s=");
_c = CatalogClient;
var _c;
__turbopack_context__.k.register(_c, "CatalogClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/EventCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EventCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/mock-data.ts [app-client] (ecmascript)");
;
;
;
;
function formatDate(iso) {
    const d = new Date(iso);
    return {
        day: d.toLocaleDateString("fr-FR", {
            day: "2-digit"
        }),
        month: d.toLocaleDateString("fr-FR", {
            month: "short"
        }).replace(".", ""),
        time: d.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
        })
    };
}
function EventCard({ event }) {
    const { day, month, time } = formatDate(event.startsAt);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: `/evenements/${event.slug}`,
        className: "group block focus-visible:outline-none",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
            className: "relative overflow-hidden rounded-stub bg-white shadow-[0_1px_0_#DCD3BE] transition-shadow group-hover:shadow-[0_10px_30px_-12px_rgba(11,74,50,0.35)]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative aspect-[4/3] overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            src: event.coverImage,
                            alt: "",
                            fill: true,
                            sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
                            className: "object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        }, void 0, false, {
                            fileName: "[project]/components/EventCard.tsx",
                            lineNumber: 25,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute left-3 top-3 rounded-full bg-forest/90 px-3 py-1 text-xs font-medium text-ivory backdrop-blur-sm",
                            children: event.category
                        }, void 0, false, {
                            fileName: "[project]/components/EventCard.tsx",
                            lineNumber: 32,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute right-3 top-3 flex flex-col items-center rounded-md bg-ivory px-2.5 py-1.5 text-forest shadow-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-mono text-[10px] uppercase leading-none tracking-wide text-forest/60",
                                    children: month
                                }, void 0, false, {
                                    fileName: "[project]/components/EventCard.tsx",
                                    lineNumber: 37,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-display text-lg leading-none",
                                    children: day
                                }, void 0, false, {
                                    fileName: "[project]/components/EventCard.tsx",
                                    lineNumber: 40,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/EventCard.tsx",
                            lineNumber: 36,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/EventCard.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ticket-notch perforation"
                    }, void 0, false, {
                        fileName: "[project]/components/EventCard.tsx",
                        lineNumber: 46,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/EventCard.tsx",
                    lineNumber: 45,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-5 py-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "font-display text-xl leading-snug text-ink",
                            children: event.title
                        }, void 0, false, {
                            fileName: "[project]/components/EventCard.tsx",
                            lineNumber: 51,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-1 text-sm text-ink/60",
                            children: [
                                event.venueName,
                                " · ",
                                event.city,
                                " · ",
                                time
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/EventCard.tsx",
                            lineNumber: 54,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-3 flex items-baseline justify-between border-t border-line pt-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs text-ink/50",
                                    children: "à partir de"
                                }, void 0, false, {
                                    fileName: "[project]/components/EventCard.tsx",
                                    lineNumber: 58,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-mono text-sm font-medium text-forest",
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatFCFA"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["minPrice"])(event))
                                }, void 0, false, {
                                    fileName: "[project]/components/EventCard.tsx",
                                    lineNumber: 59,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/EventCard.tsx",
                            lineNumber: 57,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/EventCard.tsx",
                    lineNumber: 50,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/EventCard.tsx",
            lineNumber: 22,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/EventCard.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_c = EventCard;
var _c;
__turbopack_context__.k.register(_c, "EventCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/mock-data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0420gt0._.js.map