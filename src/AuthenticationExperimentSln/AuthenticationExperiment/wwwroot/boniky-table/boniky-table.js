/**
 * BonikyTable — jQuery Edition
 * ============================================================
 * Requires: jQuery 3+
 *
 * HOW IT WORKS
 * ─────────────
 * First load  → reads window.__CATEGORY_DATA__ (baked in by Razor View)
 * After that  → $.ajax POST to your controller on every sort/page/search
 *
 * SERVER REQUEST BODY (matches DataTables C# base class):
 * {
 *   start:  0,
 *   length: 8,
 *   order:  [{ column: 1, dir: "asc" }],
 *   search: { value: "", regex: false },
 *   searchItem: { name: null }   ← your extra model fields
 * }
 *
 * SERVER RESPONSE:
 * {
 *   recordsTotal:    124,
 *   recordsFiltered: 124,
 *   data: [ ["col0","col1","col2","col3","id"], ... ]
 * }
 *
 * USAGE
 * ─────
 * var table = new BonikyTable('table', {
 *
 *   inlineData: window.__CATEGORY_DATA__,  // from Razor View (first load)
 *
 *   ajax: {
 *     url:  '/Admin/Category/GetCategoriesData',
 *     type: 'POST',
 *     data: { searchItem: { name: null } },  // extra body fields
 *     token: $('input[name="__RequestVerificationToken"]').val()
 *   },
 *
 *   columns: [
 *     { data: null, orderable: false, render: function(val, row) { return '<td>...</td>'; } },
 *     { data: 1,    orderable: true,  render: function(val, row) { return '<td>' + val + '</td>'; } },
 *     { data: 2,    orderable: true },
 *     { data: null, orderable: false, render: function(val, row) { return '<td>actions</td>'; } },
 *   ],
 *
 *   pageLength:  8,
 *   pagingType:  'numbers',   // 'numbers' | 'simple'
 *   ordering:    true,
 *   info:        true,
 *   searching:   false,       // true = auto-inject search box
 *
 *   language: {
 *     info:           'Showing _START_–_END_ of _TOTAL_ categories',
 *     infoEmpty:      'No categories found',
 *     emptyTable:     'No data available.',
 *     loadingRecords: 'Loading...',
 *     search:         'Search:',
 *   },
 *
 *   expandable: {
 *     enabled: true,
 *     render: function($expandTr, row, rowIndex) { return '<td colspan="5">...</td>'; }
 *   },
 *
 *   beforeSend: function(body) { body.searchItem.name = $('#myInput').val() || null; },
 *   onDraw:     function(resp) { },
 *   onRowClick: function($tr, row) { },
 * });
 *
 * PUBLIC API
 * ──────────
 *   table.reload()                    reset to page 0 and fetch
 *   table.reloadKeepPage()            fetch current page again
 *   table.search('term')              global search + reload
 *   table.page(n)                     jump to page n (0-indexed)
 *   table.order(colIndex, 'asc')      sort + reload
 *   table.pageLength(n)               change rows per page + reload
 *   table.setExtraData({ key: val })  merge into ajax.data + reload
 *   table.getState()                  returns current state object
 *   table.destroy()                   unbind all events
 */

;(function ($) {
    'use strict';

    // ── Defaults ─────────────────────────────────────────────────────────────

    var DEFAULTS = {
        inlineData:  null,
        ajax:        null,
        columns:     [],
        pageLength:  10,
        searching:   false,
        ordering:    true,
        info:        true,
        pagingType:  'numbers',
        language: {
            info:           'Showing _START_–_END_ of _TOTAL_ entries',
            infoEmpty:      'Showing 0 entries',
            emptyTable:     'No data available.',
            loadingRecords: 'Loading...',
            search:         'Search:',
        },
        expandable:  { enabled: false, render: null },
        beforeSend:  null,
        onDraw:      null,
        onRowClick:  null,
    };

    // ── BonikyTable Constructor ───────────────────────────────────────────────

    function BonikyTable(selector, options) {
        this.$table  = $(selector);
        if (!this.$table.length) {
            console.error('BonikyTable: table not found — ' + selector);
            return;
        }

        this.opts = $.extend(true, {}, DEFAULTS, options);

        this.state = {
            page:          0,
            length:        this.opts.pageLength,
            search:        '',
            orderCol:      null,
            orderDir:      'asc',
            total:         0,
            totalFiltered: 0,
        };

        this._firstLoad    = true;   // true = use inlineData instead of ajax
        this._activeXhr    = null;   // current $.ajax request (for aborting)
        this._lastSortCol  = null;

        this._locateControls();
        if (this.opts.searching) this._buildSearchInput();
        this._bindHeaders();
        this._load();
    }

    // ── Prototype methods ─────────────────────────────────────────────────────

    BonikyTable.prototype = {

        // ── Find info / pagination elements ──────────────────────────────────

        _locateControls: function () {
            var $card = this.$table.closest('.item-card');

            this.$info   = $card.find('[data-boniky-info]').first();
            this.$pagин  = $card.find('[data-boniky-pagination]').first();
            this.$search = $card.find('[data-boniky-search]').first();

            // Fallback to Boniky template selectors if data-* not present
            if (!this.$info.length)  this.$info  = $card.find('.text-\\[11px\\]').first();
            if (!this.$pagин.length) this.$pagин = $card.find('.flex.items-center.gap-1\\.5').first();

            if (this.$search.length) this._bindSearchInput(this.$search);
        },

        // ── Search input ──────────────────────────────────────────────────────

        _buildSearchInput: function () {
            if (this.$search.length) return; // already in DOM

            var self  = this;
            var $wrap = $(
                '<div class="flex items-center gap-2 px-6 py-3 border-b border-gray-100">' +
                    '<label class="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">' +
                        this.opts.language.search +
                    '</label>' +
                    '<input type="text" data-boniky-search class="input h-9 text-sm max-w-xs" placeholder="Search..." />' +
                '</div>'
            );

            this.$table.parent().before($wrap);
            this.$search = $wrap.find('[data-boniky-search]');
            this._bindSearchInput(this.$search);
        },

        _bindSearchInput: function ($input) {
            var self = this;
            var timer;

            $input.on('input.boniky', function () {
                clearTimeout(timer);
                timer = setTimeout(function () {
                    self.state.search = $input.val().trim();
                    self.state.page   = 0;
                    self._load();
                }, 400);
            });
        },

        // ── Sortable column headers ───────────────────────────────────────────

        _bindHeaders: function () {
            var self = this;

            this.$table.find('thead th').each(function (idx) {
                var col       = self.opts.columns[idx];
                var $th       = $(this);
                if (!col) return;

                var sortable = self.opts.ordering !== false
                    && col.orderable !== false
                    && col.data !== null;

                if (!sortable) return;

                $th.css({ cursor: 'pointer', userSelect: 'none' })
                   .addClass('boniky-sortable');

                // Sort indicator ▲▼
                $th.append(
                    '<span class="sort-indicator" style="' +
                        'display:inline-flex;flex-direction:column;gap:1px;' +
                        'margin-left:5px;opacity:0.3;font-size:8px;' +
                        'line-height:1;vertical-align:middle;' +
                    '"><span>▲</span><span>▼</span></span>'
                );

                $th.on('click.boniky', function () {
                    if (self._lastSortCol === idx) {
                        self.state.orderDir = self.state.orderDir === 'asc' ? 'desc' : 'asc';
                    } else {
                        self.state.orderDir = 'asc';
                    }
                    self._lastSortCol   = idx;
                    self.state.orderCol = idx;
                    self.state.page     = 0;
                    self._refreshSortUI();
                    self._load();
                });
            });

            this._refreshSortUI();
        },

        _refreshSortUI: function () {
            var self = this;
            this.$table.find('thead th').each(function (idx) {
                var $ind    = $(this).find('.sort-indicator');
                if (!$ind.length) return;

                var active = self.state.orderCol === idx;
                $ind.css('opacity', active ? '1' : '0.3');
                $(this).toggleClass('boniky-sorted', active);

                var $up = $ind.find('span').eq(0);
                var $dn = $ind.find('span').eq(1);

                if (active) {
                    $up.css('opacity', self.state.orderDir === 'asc'  ? '1' : '0.25');
                    $dn.css('opacity', self.state.orderDir === 'desc' ? '1' : '0.25');
                } else {
                    $up.css('opacity', '1');
                    $dn.css('opacity', '1');
                }
            });
        },

        // ── Main load — inline data first, then $.ajax ────────────────────────

        _load: function () {
            var self = this;

            // Abort any running request
            if (this._activeXhr) {
                this._activeXhr.abort();
                this._activeXhr = null;
            }

            this._showLoading(true);

            // ── First load: use inlineData from Razor View ───────────────────
            if (this._firstLoad && this.opts.inlineData) {
                this._firstLoad = false;
                setTimeout(function () {           // keep it async so UI paints first
                    self._draw(self.opts.inlineData);
                }, 0);
                return;
            }

            this._firstLoad = false;

            if (!this.opts.ajax) {
                console.warn('BonikyTable: no ajax config');
                this._showLoading(false);
                return;
            }

            // ── Build POST body ───────────────────────────────────────────────
            var body = {
                start:  this.state.page * this.state.length,
                length: this.state.length,
                order:  this.state.orderCol !== null
                            ? [{ column: this.state.orderCol, dir: this.state.orderDir }]
                            : [],
                search: { value: this.state.search, regex: false },
            };

            // Merge extra fields (e.g. searchItem)
            var extra = this.opts.ajax.data;
            if (extra) {
                $.extend(body, typeof extra === 'function' ? extra() : extra);
            }

            // beforeSend hook — caller can mutate body
            if (typeof this.opts.beforeSend === 'function') {
                this.opts.beforeSend(body);
            }

            // ── $.ajax call ──────────────────────────────────────────────────
            var ajaxHeaders = {};
            if (this.opts.ajax.token) {
                ajaxHeaders['RequestVerificationToken'] = this.opts.ajax.token;
            }
            $.extend(ajaxHeaders, this.opts.ajax.headers || {});

            this._activeXhr = $.ajax({
                url:         this.opts.ajax.url,
                type:        this.opts.ajax.type || 'POST',
                contentType: 'application/json',
                headers:     ajaxHeaders,
                data:        JSON.stringify(body),

                success: function (resp) {
                    self._activeXhr = null;
                    self._draw(resp);
                },

                error: function (xhr, status) {
                    if (status === 'abort') return;
                    self._activeXhr = null;
                    self._showLoading(false);
                    self._renderError();
                    console.error('BonikyTable ajax error:', xhr.status, xhr.statusText);
                }
            });
        },

        // ── Draw: update state + render rows + info + pagination ──────────────

        _draw: function (resp) {
            this.state.total         = resp.recordsTotal    || 0;
            this.state.totalFiltered = resp.recordsFiltered || resp.recordsTotal || 0;

            this._renderRows(resp.data || []);
            this._renderInfo();
            this._renderPagination();
            this._showLoading(false);

            if (typeof this.opts.onDraw === 'function') {
                this.opts.onDraw(resp);
            }
        },

        // ── Render rows ───────────────────────────────────────────────────────

        _renderRows: function (rows) {
            var self   = this;
            var $tbody = this.$table.find('tbody');
            $tbody.empty();

            if (!rows || !rows.length) {
                $tbody.html(
                    '<tr><td colspan="' + this.opts.columns.length + '" ' +
                    'class="px-6 py-12 text-center text-sm font-semibold text-slate-400">' +
                    this.opts.language.emptyTable + '</td></tr>'
                );
                return;
            }

            $.each(rows, function (rowIdx, row) {

                // ── Build main row ────────────────────────────────────────────
                var $tr = $('<tr class="product-parent group hover:bg-gray-50/50 transition-colors cursor-pointer"></tr>');
                $tr.data('row-index', rowIdx);

                $.each(self.opts.columns, function (colIdx, col) {
                    var cellVal = (col.data !== null && col.data !== undefined) ? row[col.data] : null;
                    var tdHtml  = typeof col.render === 'function'
                        ? col.render(cellVal, row, rowIdx)
                        : '<td class="px-4 py-2">' + (cellVal == null ? '' : cellVal) + '</td>';
                    $tr.append(tdHtml);
                });

                $tbody.append($tr);

                // ── Expandable row ────────────────────────────────────────────
                if (self.opts.expandable && self.opts.expandable.enabled
                    && typeof self.opts.expandable.render === 'function') {

                    var expandId = 'bk-exp-' + rowIdx;
                    var $expTr   = $('<tr id="' + expandId + '" class="variant-container bg-slate-50/30 hidden"></tr>');
                    var expHtml  = self.opts.expandable.render($expTr[0], row, rowIdx);
                    $expTr.html(expHtml);
                    $tbody.append($expTr);

                    var $chevron = $tr.find('.chevron-icon');
                    var isOpen   = false;

                    $tr.on('click.boniky', function (e) {
                        if ($(e.target).closest('.custom-dropdown').length) return;

                        isOpen = !isOpen;
                        $expTr.toggleClass('hidden', !isOpen);
                        $chevron.css('transform', isOpen ? 'rotate(90deg)' : '');

                        if (typeof self.opts.onRowClick === 'function') {
                            self.opts.onRowClick($tr, row);
                        }
                    });

                } else if (typeof self.opts.onRowClick === 'function') {
                    $tr.on('click.boniky', function (e) {
                        if ($(e.target).closest('.custom-dropdown').length) return;
                        self.opts.onRowClick($tr, row);
                    });
                }

                // Re-init Boniky dropdowns inside this row
                self._initDropdowns($tr);
            });

            // Refresh Lucide icons
            if (window.lucide) window.lucide.createIcons();
        },

        // ── Boniky dropdown toggle ────────────────────────────────────────────

        _initDropdowns: function ($row) {
            $row.find('.custom-dropdown').each(function () {
                var $dd      = $(this);
                var $trigger = $dd.find('.dropdown-trigger');
                var $menu    = $dd.find('.dropdown-menu');
                if (!$trigger.length || !$menu.length) return;

                $menu.addClass('scale-95 opacity-0 pointer-events-none');

                $trigger.on('click.boniky', function (e) {
                    e.stopPropagation();
                    var isOpen = !$menu.hasClass('opacity-0');

                    // Close all open menus
                    $('.dropdown-menu').addClass('scale-95 opacity-0 pointer-events-none');

                    if (!isOpen) {
                        $menu.removeClass('scale-95 opacity-0 pointer-events-none');
                    }
                });
            });
        },

        // ── Info text ─────────────────────────────────────────────────────────

        _renderInfo: function () {
            if (!this.opts.info || !this.$info.length) return;

            var page   = this.state.page;
            var length = this.state.length;
            var total  = this.state.totalFiltered;

            if (!total) {
                this.$info.html(this.opts.language.infoEmpty);
                return;
            }

            var start = page * length + 1;
            var end   = Math.min((page + 1) * length, total);

            var html = this.opts.language.info
                .replace(/_START_/g, '<span class="font-bold text-slate-700">' + start + '</span>')
                .replace(/_END_/g,   '<span class="font-bold text-slate-700">' + end   + '</span>')
                .replace(/_TOTAL_/g, '<span class="font-bold text-slate-700">' + total + '</span>');

            this.$info.html(html);
        },

        // ── Pagination ────────────────────────────────────────────────────────

        _renderPagination: function () {
            if (!this.$pagин.length) return;

            var self       = this;
            var page       = this.state.page;
            var totalPages = Math.max(1, Math.ceil(this.state.totalFiltered / this.state.length));

            this.$pagин.empty();

            // Prev button
            this.$pagин.append(this._navBtn('←', page === 0, function () { self._goTo(page - 1); }));

            // Page number buttons
            if (this.opts.pagingType !== 'simple') {
                $.each(this._pageNumbers(page, totalPages), function (_, p) {
                    if (p === '…') {
                        self.$pagин.append('<span class="px-1 text-slate-300 text-xs select-none">...</span>');
                    } else {
                        var $btn = $('<button class="pagination-btn' + (p === page ? ' active' : '') + '">' + (p + 1) + '</button>');
                        $btn.on('click.boniky', function () { self._goTo(p); });
                        self.$pagин.append($btn);
                    }
                });
            }

            // Next button
            this.$pagин.append(this._navBtn('→', page >= totalPages - 1, function () { self._goTo(page + 1); }));
        },

        _pageNumbers: function (cur, total) {
            if (total <= 7) {
                var arr = [];
                for (var i = 0; i < total; i++) arr.push(i);
                return arr;
            }
            if (cur <= 3)         return [0, 1, 2, 3, 4, '…', total - 1];
            if (cur >= total - 4) return [0, '…', total - 5, total - 4, total - 3, total - 2, total - 1];
            return [0, '…', cur - 1, cur, cur + 1, '…', total - 1];
        },

        _navBtn: function (label, disabled, onClick) {
            var cls = disabled
                ? 'text-slate-200 pointer-events-none'
                : 'text-slate-400 group-hover:text-primary';

            var $btn = $(
                '<button class="cursor-pointer group">' +
                    '<span class="text-xs font-bold transition-colors ' + cls + '">' + label + '</span>' +
                '</button>'
            );

            if (!disabled) $btn.on('click.boniky', onClick);
            return $btn;
        },

        _goTo: function (page) {
            var max = Math.ceil(this.state.totalFiltered / this.state.length);
            if (page < 0 || page >= max) return;
            this.state.page = page;
            this._load();
        },

        // ── Loading overlay ───────────────────────────────────────────────────

        _showLoading: function (on) {
            var $tbody = this.$table.find('tbody');
            if (!$tbody.length) return;

            if (on) {
                $tbody.find('tr:not(.bk-loading)').css('opacity', '0.35');
                if (!$tbody.find('.bk-loading').length) {
                    $tbody.append(
                        '<tr class="bk-loading">' +
                            '<td colspan="' + this.opts.columns.length + '" class="px-6 py-3 text-center">' +
                                '<div class="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">' +
                                    '<svg class="animate-spin h-3.5 w-3.5" style="color:var(--color-primary,#0284c7)" ' +
                                         'xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">' +
                                        '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>' +
                                        '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>' +
                                    '</svg>' +
                                    this.opts.language.loadingRecords +
                                '</div>' +
                            '</td>' +
                        '</tr>'
                    );
                }
            } else {
                $tbody.find('tr').css('opacity', '');
                $tbody.find('.bk-loading').remove();
            }
        },

        _renderError: function () {
            this.$table.find('tbody').html(
                '<tr><td colspan="' + this.opts.columns.length + '" ' +
                'class="px-6 py-10 text-center text-sm font-semibold text-rose-400">' +
                'Failed to load data. Please try again.</td></tr>'
            );
        },

        // ── Public API ────────────────────────────────────────────────────────

        reload: function () {
            this.state.page = 0;
            this._load();
        },

        reloadKeepPage: function () {
            this._load();
        },

        search: function (term) {
            this.state.search = String(term);
            this.state.page   = 0;
            if (this.$search.length) this.$search.val(this.state.search);
            this._load();
        },

        page: function (n) {
            this._goTo(n);
        },

        order: function (colIndex, dir) {
            this._lastSortCol   = colIndex;
            this.state.orderCol = colIndex;
            this.state.orderDir = dir === 'desc' ? 'desc' : 'asc';
            this.state.page     = 0;
            this._refreshSortUI();
            this._load();
        },

        pageLength: function (n) {
            this.state.length = n;
            this.state.page   = 0;
            this._load();
        },

        setExtraData: function (obj) {
            this.opts.ajax.data = $.extend({}, this.opts.ajax.data || {}, obj);
            this.state.page     = 0;
            this._load();
        },

        getState: function () {
            return $.extend({}, this.state);
        },

        destroy: function () {
            this.$table.find('thead th').off('.boniky');
            this.$table.find('tbody').off('.boniky');
            if (this.$search.length) this.$search.off('.boniky');
            $(document).off('.boniky-' + this._id);
            if (this._activeXhr) this._activeXhr.abort();
        },
    };

    // Close all dropdowns on document click
    $(document).on('click.boniky-global', function () {
        $('.dropdown-menu').addClass('scale-95 opacity-0 pointer-events-none');
    });

    // Expose globally
    window.BonikyTable = BonikyTable;

}(jQuery));