@extends('pdf.layout')

@section('title', 'Laporan Laba Rugi')

@section('content')
<div class="header">
    <h1>Laporan Laba Rugi</h1>
    <div class="meta">
        Outlet: {{ $outlet }} &nbsp;|&nbsp;
        Periode: {{ \Carbon\Carbon::parse($startDate)->translatedFormat('d M Y') }} – {{ \Carbon\Carbon::parse($endDate)->translatedFormat('d M Y') }}
    </div>
</div>

<div style="max-width:440px; margin:0 auto;">
    <table style="border:1px solid #e5e7eb;">
        <thead>
            <tr>
                <th style="width:70%;">Keterangan</th>
                <th class="text-right">Jumlah (Rp)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    Pendapatan (Omzet)
                    <span class="text-muted" style="font-size:9px; display:block;">{{ number_format($report['totalTransactions']) }} transaksi valid</span>
                </td>
                <td class="text-right fw-bold">{{ number_format($report['income'], 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="text-red">
                    HPP / Harga Pokok Penjualan
                    <span class="text-muted" style="font-size:9px; display:block;">Biaya modal produk terjual</span>
                </td>
                <td class="text-right text-red">({{ number_format($report['cogs'], 0, ',', '.') }})</td>
            </tr>
            <tr style="background:#f0fdf4;">
                <td class="fw-bold">Laba Kotor</td>
                <td class="text-right fw-bold {{ $report['grossProfit'] >= 0 ? 'text-green' : 'text-red' }}">
                    {{ number_format($report['grossProfit'], 0, ',', '.') }}
                </td>
            </tr>
            <tr>
                <td class="text-red">
                    Total Pengeluaran Operasional
                    <span class="text-muted" style="font-size:9px; display:block;">Biaya operasional outlet</span>
                </td>
                <td class="text-right text-red">({{ number_format($report['totalExpense'], 0, ',', '.') }})</td>
            </tr>
            <tr style="background:{{ $report['netProfit'] >= 0 ? '#f0fdf4' : '#fef2f2' }}; border-top:2px solid #4f46e5;">
                <td class="fw-bold" style="font-size:13px;">LABA BERSIH</td>
                <td class="text-right fw-bold {{ $report['netProfit'] >= 0 ? 'text-green' : 'text-red' }}" style="font-size:13px;">
                    Rp {{ number_format($report['netProfit'], 0, ',', '.') }}
                </td>
            </tr>
        </tbody>
    </table>

    <table style="margin-top:16px; border:1px solid #e5e7eb;">
        <thead>
            <tr><th colspan="2">Analisis Margin</th></tr>
        </thead>
        <tbody>
            <tr>
                <td>Margin Kotor</td>
                <td class="text-right fw-bold">
                    {{ $report['income'] > 0 ? number_format(($report['grossProfit'] / $report['income']) * 100, 1) : '0' }}%
                </td>
            </tr>
            <tr>
                <td>Margin Bersih</td>
                <td class="text-right fw-bold {{ $report['netProfit'] >= 0 ? 'text-green' : 'text-red' }}">
                    {{ $report['income'] > 0 ? number_format(($report['netProfit'] / $report['income']) * 100, 1) : '0' }}%
                </td>
            </tr>
            <tr>
                <td>Total Transaksi</td>
                <td class="text-right fw-bold">{{ number_format($report['totalTransactions']) }}</td>
            </tr>
        </tbody>
    </table>
</div>
@endsection
