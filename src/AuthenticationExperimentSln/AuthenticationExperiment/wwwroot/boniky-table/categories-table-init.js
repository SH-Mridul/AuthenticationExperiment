/**
 * categories-table-init.js — jQuery Edition
 * ─────────────────────────────────────────────────────────────────────────────
 * First load  → window.__CATEGORY_DATA__ (baked in by Razor View, zero AJAX)
 * After that  → POST /Admin/Category/GetCategoriesData (DataTables C# pattern)
 *
 * Column index map:
 *   [0] imageUrl
 *   [1] name
 *   [2] subcategoryCount
 *   [3] productCount
 *   [4] id
 * ─────────────────────────────────────────────────────────────────────────────
 */

$(function () {
    'use strict';

    var COL = { IMAGE: 0, NAME: 1, SUBCAT: 2, PRODUCTS: 3, ID: 4 };

    // ── Antiforgery token ─────────────────────────────────────────────────────
    var csrf = $('input[name="__RequestVerificationToken"]').val() || '';

    // ── Render helpers ────────────────────────────────────────────────────────

    function renderActions(val, row) {
        var id = row[COL.ID];
        return (
            '<td class="px-4 py-2 text-center">' +
            '<div class="custom-dropdown relative inline-block">' +
            '<button class="dropdown-trigger p-2 text-slate-400 hover:text-primary transition-colors focus:outline-none">' +
            '<i data-lucide="more-horizontal" class="w-5 h-5"></i>' +
            '</button>' +
            '<div class="dropdown-menu absolute right-0 mt-2 w-40 bg-white border border-gray-200 ' +
            'rounded-xl shadow-xl z-50 py-1.5 ' +
            'scale-95 opacity-0 pointer-events-none ' +
            'transition-all duration-200 origin-top-right">' +
            '<button class="dropdown-item px-3 py-2 flex items-center gap-2.5 ' +
            'text-xs font-bold text-slate-600 hover:bg-gray-50 hover:text-primary ' +
            'transition-colors w-full text-left" ' +
            'data-action="edit" data-id="' + id + '">' +
            '<i data-lucide="edit-3" class="w-4 h-4"></i> Edit' +
            '</button>' +
            '<button class="dropdown-item px-3 py-2 flex items-center gap-2.5 ' +
            'text-xs font-bold text-slate-600 hover:bg-gray-50 hover:text-primary ' +
            'transition-colors w-full text-left" ' +
            'data-action="duplicate" data-id="' + id + '">' +
            '<i data-lucide="copy" class="w-4 h-4"></i> Duplicate' +
            '</button>' +
            '<div class="h-px bg-gray-100 my-1"></div>' +
            '<button class="dropdown-item px-3 py-2 flex items-center gap-2.5 ' +
            'text-xs font-bold text-rose-500 hover:bg-rose-50 ' +
            'transition-colors w-full text-left" ' +
            'data-action="delete" data-id="' + id + '">' +
            '<i data-lucide="trash-2" class="w-4 h-4"></i> Delete' +
            '</button>' +
            '</div>' +
            '</div>' +
            '</td>'
        );
    }

    function renderExpanded($expandTr, row) {
        var id = row[COL.ID];

        // Fetch subcategories lazily when row is expanded
        $.ajax({
            url: '/Category/GetSubcategories/' + id,
            type: 'GET',
            success: function (subs) {
                if (!subs || !subs.length) {
                    $($expandTr).html(
                        '<td colspan="5" class="p-0 border-b border-gray-100">' +
                        '<div class="px-20 py-4 text-xs font-semibold text-slate-400">No subcategories.</div>' +
                        '</td>'
                    );
                    return;
                }

                var items = $.map(subs, function (s) {
                    var stockCls = s.stock === 0 ? 'text-rose-500'
                        : s.stock < 5 ? 'text-amber-500'
                            : 'text-slate-400';
                    return (
                        '<div class="flex items-center justify-between py-2 border-b border-dashed border-gray-200 last:border-0">' +
                        '<div class="flex items-center gap-4">' +
                        '<div class="w-2.5 h-2.5 rounded-full shrink-0" ' +
                        'style="background:' + s.color + ';border:1px solid #e2e8f0;"></div>' +
                        '<span class="text-xs font-bold text-slate-600">' + s.name + '</span>' +
                        '<span class="text-[10px] font-mono font-bold text-slate-400">SKU: ' + s.sku + '</span>' +
                        '</div>' +
                        '<div class="flex items-center gap-8">' +
                        '<span class="text-xs font-bold ' + stockCls + '">' + s.stock + ' in Stock</span>' +
                        '<span class="text-xs font-black text-slate-900 w-16 text-right">$' + parseFloat(s.price).toFixed(2) + '</span>' +
                        '</div>' +
                        '</div>'
                    );
                });

                $($expandTr).html(
                    '<td colspan="5" class="p-0 border-b border-gray-100">' +
                    '<div class="px-20 py-4 space-y-3">' + items.join('') + '</div>' +
                    '</td>'
                );
            },
            error: function () {
                $($expandTr).html(
                    '<td colspan="5" class="p-0 border-b border-gray-100">' +
                    '<div class="px-20 py-4 text-xs font-semibold text-rose-400">Failed to load subcategories.</div>' +
                    '</td>'
                );
            }
        });

        // Placeholder shown immediately while the ajax runs
        return (
            '<td colspan="5" class="p-0 border-b border-gray-100">' +
            '<div class="px-20 py-4 text-xs font-semibold text-slate-400 flex items-center gap-2">' +
            '<svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">' +
            '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>' +
            '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>' +
            '</svg>' +
            'Loading subcategories...' +
            '</div>' +
            '</td>'
        );
    }

    // ── Init BonikyTable ──────────────────────────────────────────────────────

    var categoryTable = new BonikyTable('.item-card table', {

        // First load: use data baked into the page by the Razor View
        inlineData: window.__CATEGORY_DATA__ || null,

        ajax: {
            url: '/Category/GetCategoriesData',
            type: 'POST',
            token: csrf,                          // ASP.NET antiforgery
            data: { searchItem: { name: null } } // extra body fields → CategoryListModel.SearchItem
        },

        columns: [
            // Col 0 — Chevron (no data, no sort)
            {
                data: null, orderable: false,
                render: function () {
                    return (
                        '<td class="px-4 py-2 text-center">' +
                        '<div class="flex items-center justify-center">' +
                        '<i data-lucide="chevron-right" ' +
                        'class="w-4 h-4 text-slate-400 transition-transform duration-300 chevron-icon"></i>' +
                        '</div>' +
                        '</td>'
                    );
                }
            },

            // Col 1 — Name + Image (sortable)
            {
                data: COL.NAME, orderable: true,
                render: function (name, row) {
                    return (
                        '<td class="px-4 py-2">' +
                        '<div class="flex items-center gap-4">' +
                        '<div class="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">' +
                        '<img src="' + row[COL.IMAGE] + '" alt="' + name + '" ' +
                        'class="w-full h-full object-cover" ' +
                        'onerror="this.src=\'https://placehold.co/48x48/f1f5f9/94a3b8?text=?\'" />' +
                        '</div>' +
                        '<div>' +
                        '<p class="text-sm font-bold text-slate-900 leading-tight">' + name + '</p>' +
                        '</div>' +
                        '</div>' +
                        '</td>'
                    );
                }
            },

            // Col 2 — Subcategory count (sortable)
            {
                data: COL.SUBCAT, orderable: true,
                render: function (val) {
                    return '<td class="px-4 py-2 font-mono text-[11px] text-slate-500 font-bold">' + val + '</td>';
                }
            },

            // Col 3 — Product count (sortable)
            {
                data: COL.PRODUCTS, orderable: true,
                render: function (val) {
                    return '<td class="px-4 py-2">' + val + '</td>';
                }
            },

            // Col 4 — Actions dropdown (no sort)
            {
                data: null, orderable: false,
                render: renderActions
            },
        ],

        pageLength: window.__CATEGORY_DATA__ ? window.__CATEGORY_DATA__.pageSize : 8,
        pagingType: 'numbers',
        ordering: true,
        info: true,
        searching: false,

        language: {
            info: 'Showing _START_–_END_ of _TOTAL_ categories',
            infoEmpty: 'No categories found',
            emptyTable: 'No categories available.',
            loadingRecords: 'Loading categories...',
        },

        expandable: {
            enabled: true,
            render: renderExpanded,
        },

        // Called before every POST (NOT the first inline load)
        beforeSend: function (body) {
            // Push live filter values into the body here:
            // body.searchItem.name = $('#filterName').val() || null;
        },

        // Called after every successful draw
        onDraw: function (resp) {
            // Update stat cards etc:
            // $('[data-stat-total]').text(resp.recordsTotal);
        },
    });

    // ── Action button clicks (delegated — works after every draw) ─────────────
    $(document).on('click', '[data-action]', function (e) {
        var action = $(this).data('action');
        var id = $(this).data('id');

        if (action === 'edit') {
            alert('Edit ID: ' + id);
            // openEditModal(id);
        }

        if (action === 'duplicate') {
            alert('Duplicate ID: ' + id);
            // $.post('/Admin/Category/Duplicate/' + id).done(function () { categoryTable.reloadKeepPage(); });
        }

        if (action === 'delete') {
            if (!confirm('Delete this category?')) return;
            alert('Delete ID: ' + id);
            // $.ajax({ url: '/Admin/Category/Delete/' + id, type: 'DELETE' })
            //   .done(function () { categoryTable.reload(); });
        }
    });

    // ── "Add Category" save button ────────────────────────────────────────────
    $('#addCategoryModal .btn-filled').on('click', function () {
        // After your API save succeeds:
        // $.post('/Admin/Category/Save', formData).done(function () {
        //     categoryTable.reload();
        //     $('#addCategoryModal').hide();
        // });
        console.log('Saved → call categoryTable.reload() after API success');
    });

    // ── Optional: advanced search form ───────────────────────────────────────
    // $('#btnSearch').on('click', function () {
    //     categoryTable.setExtraData({ searchItem: { name: $('#filterName').val() || null } });
    // });
    // $('#btnClear').on('click', function () {
    //     $('#filterName').val('');
    //     categoryTable.setExtraData({ searchItem: { name: null } });
    // });

    // ── Expose for console testing ────────────────────────────────────────────
    window.categoryTable = categoryTable;

    /*
     * Console commands:
     *   categoryTable.reload()
     *   categoryTable.search('Electronics')
     *   categoryTable.order(1, 'desc')
     *   categoryTable.order(3, 'desc')
     *   categoryTable.page(2)
     *   categoryTable.pageLength(5)
     *   categoryTable.setExtraData({ searchItem: { name: 'Phones' } })
     *   categoryTable.getState()
     */
});