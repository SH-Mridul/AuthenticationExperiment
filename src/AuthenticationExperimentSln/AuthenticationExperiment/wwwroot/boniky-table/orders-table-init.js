/**
 * order-table-init.js — jQuery Edition
 * ─────────────────────────────────────────────────────────────────────────────
 * First load  → window.__ORDER_DATA__ (baked in by Razor View, zero AJAX)
 * After that  → POST /Order/GetOrdersData
 *
 * Column index map (matches controller string[] order):
 *   [0] orderId
 *   [1] customerName
 *   [2] customerEmail
 *   [3] customerAvatar (URL)
 *   [4] totalAmount
 *   [5] paymentStatus  "Paid" | "Pending" | "Refunded"
 *   [6] orderStatus    "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"
 *   [7] date
 *   [8] id
 * ─────────────────────────────────────────────────────────────────────────────
 */

$(function () {
    'use strict';

    var COL = {
        ORDER_ID: 0,
        CUSTOMER_NAME: 1,
        CUSTOMER_EMAIL: 2,
        AVATAR: 3,
        AMOUNT: 4,
        PAYMENT_STATUS: 5,
        ORDER_STATUS: 6,
        DATE: 7,
        ID: 8,
    };

    var csrf = $('input[name="__RequestVerificationToken"]').val() || '';

    // ── Status badge helpers ──────────────────────────────────────────────────

    var ORDER_STATUS_STYLES = {
        'Pending': { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
        'Processing': { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
        'Shipped': { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500' },
        'Delivered': { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
        'Cancelled': { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' },
    };

    var PAYMENT_STATUS_STYLES = {
        'Paid': { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
        'Pending': { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
        'Refunded': { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' },
    };

    function statusBadge(label, styleMap) {
        var s = styleMap[label] || { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400' };
        return (
            '<div class="inline-flex items-center gap-1.5 px-2 py-0.5 ' + s.bg + ' ' + s.text + ' rounded-full border border-slate-100/50">' +
            '<span class="w-1 h-1 rounded-full ' + s.dot + '"></span>' +
            '<span class="text-[10px] font-semibold uppercase">' + label + '</span>' +
            '</div>'
        );
    }

    // ── Actions dropdown cell ─────────────────────────────────────────────────

    function renderActions(val, row) {
        var id = row[COL.ID];
        return (
            '<td class="px-6 py-3 text-center">' +
            '<div class="custom-dropdown relative inline-block">' +
            '<button class="dropdown-trigger p-1.5 text-slate-300 hover:text-primary transition-colors focus:outline-none cursor-pointer">' +
            '<i data-lucide="more-vertical" class="w-4 h-4"></i>' +
            '</button>' +
            '<div class="dropdown-menu absolute right-0 mt-2 w-40 bg-white border border-gray-200 ' +
            'rounded-xl shadow-xl z-50 py-1.5 ' +
            'scale-95 opacity-0 pointer-events-none ' +
            'transition-all duration-200 origin-top-right">' +
            '<a href="/Order/Details/' + id + '" ' +
            'class="dropdown-item px-3 py-2 flex items-center gap-2.5 ' +
            'text-xs font-bold text-slate-600 hover:bg-gray-50 hover:text-primary ' +
            'transition-colors w-full text-left">' +
            '<i data-lucide="eye" class="w-4 h-4"></i> View Invoice' +
            '</a>' +
            '<div class="h-px bg-gray-100 my-1"></div>' +
            '<button class="dropdown-item px-3 py-2 flex items-center gap-2.5 ' +
            'text-xs font-bold text-rose-500 hover:bg-rose-50 ' +
            'transition-colors w-full text-left" ' +
            'data-action="cancel" data-id="' + id + '">' +
            '<i data-lucide="x-circle" class="w-4 h-4"></i> Cancel Order' +
            '</button>' +
            '</div>' +
            '</div>' +
            '</td>'
        );
    }

    // ── BonikyTable init ──────────────────────────────────────────────────────

    var orderTable = new BonikyTable('.item-card table', {

        inlineData: window.__ORDER_DATA__ || null,

        ajax: {
            url: '/Order/GetOrdersData',
            type: 'POST',
            token: csrf,
            data: {
                searchItem: {
                    orderId: null,
                    customerName: null,
                    paymentStatus: null,
                    orderStatus: null,
                    dateFrom: null,
                    dateTo: null,
                }
            }
        },

        columns: [
            // Col 0 — Order ID (sortable)
            {
                data: COL.ORDER_ID, orderable: true,
                render: function (val) {
                    return '<td class="px-6 py-3"><span class="text-sm font-bold text-slate-900">' + val + '</span></td>';
                }
            },

            // Col 1 — Customer (name + avatar + email, sortable by name)
            {
                data: COL.CUSTOMER_NAME, orderable: true,
                render: function (name, row) {
                    return (
                        '<td class="px-6 py-3">' +
                        '<div class="flex items-center gap-3">' +
                        '<img src="' + row[COL.AVATAR] + '" ' +
                        'class="h-8 w-8 rounded-full border border-gray-100 shrink-0" ' +
                        'onerror="this.src=\'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '\'" ' +
                        'alt="" />' +
                        '<div class="min-w-0">' +
                        '<h4 class="text-xs font-bold text-slate-900 leading-tight truncate">' + name + '</h4>' +
                        '<p class="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">' + row[COL.CUSTOMER_EMAIL] + '</p>' +
                        '</div>' +
                        '</div>' +
                        '</td>'
                    );
                }
            },

            // Col 2 — Customer Email (hidden — used in Col 1, not rendered separately)
            // We skip this col in the thead too, so orderable: false and render returns empty
            {
                data: COL.CUSTOMER_EMAIL, orderable: false,
                render: function () { return ''; }  // rendered inside Col 1
            },

            // Col 3 — Avatar URL (hidden — used in Col 1)
            {
                data: COL.AVATAR, orderable: false,
                render: function () { return ''; }
            },

            // Col 4 — Total Amount (sortable)
            {
                data: COL.AMOUNT, orderable: true,
                render: function (val) {
                    return '<td class="px-6 py-3"><span class="text-[11px] font-bold text-slate-700">' + val + '</span></td>';
                }
            },

            // Col 5 — Payment Status (sortable)
            {
                data: COL.PAYMENT_STATUS, orderable: true,
                render: function (val) {
                    return '<td class="px-6 py-3">' + statusBadge(val, PAYMENT_STATUS_STYLES) + '</td>';
                }
            },

            // Col 6 — Order Status (sortable)
            {
                data: COL.ORDER_STATUS, orderable: true,
                render: function (val) {
                    return '<td class="px-6 py-3">' + statusBadge(val, ORDER_STATUS_STYLES) + '</td>';
                }
            },

            // Col 7 — Date (sortable)
            {
                data: COL.DATE, orderable: true,
                render: function (val) {
                    return '<td class="px-6 py-3"><span class="text-[11px] font-normal text-slate-500">' + val + '</span></td>';
                }
            },

            // Col 8 — Actions (no sort)
            {
                data: null, orderable: false,
                render: renderActions
            },
        ],

        pageLength: window.__ORDER_DATA__ ? window.__ORDER_DATA__.pageSize : 8,
        pagingType: 'numbers',
        ordering: true,
        info: true,
        searching: false,   // search handled by the existing input above the table

        language: {
            info: 'Showing _START_–_END_ of _TOTAL_ orders',
            infoEmpty: 'No orders found',
            emptyTable: 'No orders available.',
            loadingRecords: 'Loading orders...',
        },

        // Push live filter values from the search box + dropdowns
        beforeSend: function (body) {
            body.searchItem.orderStatus = _activeStatusFilter || null;
            body.searchItem.paymentStatus = _activePaymentFilter || null;
            body.searchItem.orderId = $('.order-search-input').val().trim() || null;
        },

        onDraw: function (resp) {
            // Update "Showing X of Y" in the custom footer (separate from data-boniky-info)
            // or update stat cards here
        },
    });

    // ── Track active filter values ────────────────────────────────────────────
    var _activeStatusFilter = null;
    var _activePaymentFilter = null;

    // ── Existing search input (top-left of the order page) ───────────────────
    // Wire the existing <input placeholder="Search orders..."> to BonikyTable
    var searchTimer;
    $(document).on('input', 'input[placeholder="Search orders..."]', function () {
        var val = $(this).val().trim();
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
            orderTable.search(val);
        }, 400);
    });

    // ── Payment dropdown filter ───────────────────────────────────────────────
    // Matches the existing "Payment" dropdown buttons in the HTML
    $(document).on('click', '.dropdown-item', function () {
        var $btn = $(this);
        var $parent = $btn.closest('.custom-dropdown');

        // Payment dropdown (contains "Paid", "Pending", "Refunded", "All")
        if ($parent.find('.dropdown-trigger span.trigger-text').text().trim() === 'Payment' ||
            $btn.text().trim() === 'All' && $parent.find('[data-lucide="banknote"]').length) {

            var label = $btn.text().trim();
            _activePaymentFilter = (label === 'All') ? null : label;

            // Update trigger label
            $parent.find('.trigger-text').text(label === 'All' ? 'Payment' : label);
            orderTable.reload();
        }

        // Order Status dropdown
        if ($parent.find('[data-lucide="package"]').length) {
            var label = $btn.text().trim();
            _activeStatusFilter = (label === 'All Status') ? null : label;
            $parent.find('.trigger-text').text(label === 'All Status' ? 'Status' : label);
            orderTable.reload();
        }
    });

    // ── Filter pills (All / Pending / Delivered) ──────────────────────────────
    $(document).on('click', '.filter-pill', function () {
        $('.filter-pill').removeClass('active');
        $(this).addClass('active');

        var label = $(this).text().trim();
        _activeStatusFilter = (label === 'All') ? null : label;
        orderTable.reload();
    });

    // ── Action buttons (delegated) ────────────────────────────────────────────
    $(document).on('click', '[data-action="cancel"]', function () {
        var id = $(this).data('id');
        if (!confirm('Cancel this order?')) return;
        alert('Cancel order ID: ' + id);
        // $.ajax({ url: '/Order/Cancel/' + id, type: 'POST' })
        //   .done(function () { orderTable.reloadKeepPage(); });
    });

    // ── Expose globally ───────────────────────────────────────────────────────
    window.orderTable = orderTable;

    /*
     * Console commands:
     *   orderTable.reload()
     *   orderTable.search('Alex')
     *   orderTable.order(0, 'desc')        sort by Order ID desc
     *   orderTable.order(4, 'desc')        sort by Amount desc
     *   orderTable.order(6, 'asc')         sort by Order Status asc
     *   orderTable.page(2)
     *   orderTable.pageLength(5)
     *   orderTable.setExtraData({ searchItem: { paymentStatus: 'Paid' } })
     *   orderTable.getState()
     */
});