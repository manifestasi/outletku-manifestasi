<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Laporan')</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #1a1a2e; line-height: 1.5; }
        .page { padding: 28px 32px; }

        /* Header */
        .header { border-bottom: 2px solid #4f46e5; padding-bottom: 14px; margin-bottom: 20px; }
        .header h1 { font-size: 18px; font-weight: 700; color: #4f46e5; }
        .header .meta { font-size: 10px; color: #6b7280; margin-top: 4px; }

        /* Section titles */
        .section-title { font-size: 12px; font-weight: 700; color: #374151; margin: 18px 0 8px; border-left: 3px solid #4f46e5; padding-left: 8px; }

        /* Tables */
        table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        th { background: #4f46e5; color: #fff; font-weight: 600; font-size: 10px; padding: 7px 10px; text-align: left; }
        td { padding: 6px 10px; border-bottom: 1px solid #f3f4f6; font-size: 10px; }
        tr:nth-child(even) td { background: #f9fafb; }

        /* Summary boxes */
        .summary-grid { display: table; width: 100%; margin-bottom: 16px; }
        .summary-box { display: table-cell; width: 25%; padding: 10px 12px; background: #f5f3ff; border: 1px solid #e0e7ff; }
        .summary-box + .summary-box { border-left: 0; }
        .summary-box .label { font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
        .summary-box .value { font-size: 14px; font-weight: 700; color: #4f46e5; margin-top: 3px; }

        /* Profit/Loss styling */
        .pl-row { display: table-row; }
        .pl-label, .pl-value { display: table-cell; padding: 6px 0; font-size: 11px; }
        .pl-value { text-align: right; }
        .pl-divider { border-top: 1px solid #e5e7eb; }
        .pl-bold { font-weight: 700; font-size: 12px; }
        .text-green { color: #059669; }
        .text-red { color: #dc2626; }

        /* Footer */
        .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 9px; color: #9ca3af; text-align: center; }
        .text-right { text-align: right; }
        .fw-bold { font-weight: 700; }
        .text-muted { color: #6b7280; }
    </style>
</head>
<body>
<div class="page">
    @yield('content')
    <div class="footer">
        Dicetak oleh sistem OutletKu — {{ now()->format('d M Y H:i') }} WIB
    </div>
</div>
</body>
</html>
