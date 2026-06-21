@extends('pdf.layout')

@section('title', 'Laporan Penjualan')

@section('content')
<div class="header">
    <h1>Laporan Penjualan</h1>
    <div class="meta">
        Outlet: {{ $outlet }} &nbsp;|&nbsp;
        Periode: {{ \Carbon\Carbon::parse($startDate)->translatedFormat('d M Y') }} – {{ \Carbon\Carbon::parse($endDate)->translatedFormat('d M Y') }}
    </div>
</div>

<div class="summary-grid">
    <div class="summary-box">
        <div class="label">Total Omzet</div>
        <div class="value">Rp {{ number_format($summary['totalRevenue'], 0, ',', '.') }}</div>
    </div>
    <div class="summary-box">
        <div class="label">Jumlah Transaksi</div>
        <div class="value">{{ number_format($summary['totalTransactions']) }}</div>
    </div>
    <div class="summary-box">
        <div class="label">Rata-rata/Transaksi</div>
        <div class="value">Rp {{ number_format($summary['avgTransaction'], 0, ',', '.') }}</div>
    </div>
    <div class="summary-box">
        <div class="label">Total Diskon</div>
        <div class="value">Rp {{ number_format($summary['totalDiscount'], 0, ',', '.') }}</div>
    </div>
</div>

<div class="section-title">Detail Transaksi</div>
<table>
    <thead>
        <tr>
            <th>No</th>
            <th>Invoice</th>
            <th>Tanggal</th>
            <th>Outlet</th>
            <th>Kasir</th>
            <th>Subtotal</th>
            <th>Diskon</th>
            <th class="text-right">Total</th>
            <th>Bayar</th>
        </tr>
    </thead>
    <tbody>
        @foreach($rows as $i => $trx)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $trx->invoice_number }}</td>
            <td>{{ \Carbon\Carbon::parse($trx->transaction_date)->format('d/m/Y H:i') }}</td>
            <td>{{ $trx->outlet?->name ?? '-' }}</td>
            <td>{{ $trx->user?->name ?? '-' }}</td>
            <td class="text-right">{{ number_format($trx->subtotal, 0, ',', '.') }}</td>
            <td class="text-right">{{ number_format($trx->discount, 0, ',', '.') }}</td>
            <td class="text-right fw-bold">{{ number_format($trx->total, 0, ',', '.') }}</td>
            <td>{{ ucfirst($trx->payment_method) }}</td>
        </tr>
        @endforeach
        @if($rows->isEmpty())
        <tr><td colspan="9" style="text-align:center; color:#9ca3af;">Tidak ada data transaksi</td></tr>
        @endif
    </tbody>
    <tfoot>
        <tr>
            <td colspan="7" class="fw-bold text-right" style="padding-top:8px;">TOTAL OMZET</td>
            <td class="fw-bold text-right" style="padding-top:8px;">Rp {{ number_format($summary['totalRevenue'], 0, ',', '.') }}</td>
            <td></td>
        </tr>
    </tfoot>
</table>
@endsection
