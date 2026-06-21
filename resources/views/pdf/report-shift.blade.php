@extends('pdf.layout')

@section('title', 'Rekap Shift')

@section('content')
<div class="header">
    <h1>Rekap Shift Kasir</h1>
    <div class="meta">
        Outlet: {{ $shift->outlet?->name }} &nbsp;|&nbsp; Kasir: {{ $shift->user?->name }}
    </div>
</div>

<div class="summary-grid">
    <div class="summary-box">
        <div class="label">Buka Shift</div>
        <div class="value" style="font-size:11px;">{{ $shift->opened_at?->format('d/m/Y H:i') }}</div>
    </div>
    <div class="summary-box">
        <div class="label">Tutup Shift</div>
        <div class="value" style="font-size:11px;">{{ $shift->closed_at?->format('d/m/Y H:i') ?? '—' }}</div>
    </div>
    <div class="summary-box">
        <div class="label">Kas Awal</div>
        <div class="value">Rp {{ number_format($shift->opening_cash, 0, ',', '.') }}</div>
    </div>
    <div class="summary-box">
        <div class="label">Kas Akhir</div>
        <div class="value">Rp {{ number_format($shift->closing_cash ?? 0, 0, ',', '.') }}</div>
    </div>
</div>

<div class="summary-grid" style="margin-bottom:20px;">
    <div class="summary-box">
        <div class="label">Total Penjualan Tunai</div>
        <div class="value">Rp {{ number_format($cashSales, 0, ',', '.') }}</div>
    </div>
    <div class="summary-box">
        <div class="label">Total Omzet</div>
        <div class="value">Rp {{ number_format($totalSales, 0, ',', '.') }}</div>
    </div>
    <div class="summary-box">
        <div class="label">Jumlah Transaksi</div>
        <div class="value">{{ $trxCount }}</div>
    </div>
    <div class="summary-box">
        <div class="label">Selisih Kas</div>
        <div class="value" style="color: {{ abs($cashDiff) >= 10000 ? '#dc2626' : '#059669' }};">
            Rp {{ number_format($cashDiff, 0, ',', '.') }}
        </div>
    </div>
</div>

@if($shift->transactions->where('is_void', false)->isNotEmpty())
<div class="section-title">Detail Transaksi Shift</div>
<table>
    <thead>
        <tr>
            <th>No</th>
            <th>Invoice</th>
            <th>Waktu</th>
            <th>Items</th>
            <th class="text-right">Total</th>
            <th>Bayar</th>
        </tr>
    </thead>
    <tbody>
        @foreach($shift->transactions->where('is_void', false) as $i => $trx)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $trx->invoice_number }}</td>
            <td>{{ $trx->transaction_date?->format('H:i') }}</td>
            <td>{{ $trx->items->count() }} item</td>
            <td class="text-right fw-bold">Rp {{ number_format($trx->total, 0, ',', '.') }}</td>
            <td>{{ ucfirst($trx->payment_method) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

@if($shift->notes)
<div style="margin-top:12px; padding:10px; background:#fef9c3; border:1px solid #fde68a; border-radius:4px;">
    <strong>Catatan Shift:</strong><br>{{ $shift->notes }}
</div>
@endif
@endsection
