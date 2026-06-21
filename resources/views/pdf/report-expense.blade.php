@extends('pdf.layout')

@section('title', 'Laporan Pengeluaran')

@section('content')
<div class="header">
    <h1>Laporan Pengeluaran</h1>
    <div class="meta">
        Outlet: {{ $outlet }} &nbsp;|&nbsp;
        Periode: {{ \Carbon\Carbon::parse($startDate)->translatedFormat('d M Y') }} – {{ \Carbon\Carbon::parse($endDate)->translatedFormat('d M Y') }}
    </div>
</div>

<div class="summary-grid">
    <div class="summary-box" style="width:50%">
        <div class="label">Total Pengeluaran</div>
        <div class="value" style="color:#dc2626;">Rp {{ number_format($totalAmount, 0, ',', '.') }}</div>
    </div>
    <div class="summary-box" style="width:50%">
        <div class="label">Jumlah Transaksi</div>
        <div class="value">{{ count($rows) }}</div>
    </div>
</div>

@if($byCategory->isNotEmpty())
<div class="section-title">Pengeluaran per Kategori</div>
<table>
    <thead>
        <tr>
            <th>Kategori</th>
            <th class="text-right">Jumlah Transaksi</th>
            <th class="text-right">Total</th>
            <th class="text-right">%</th>
        </tr>
    </thead>
    <tbody>
        @foreach($byCategory as $cat)
        <tr>
            <td>{{ $cat->category_name }}</td>
            <td class="text-right">{{ $cat->count }}</td>
            <td class="text-right">Rp {{ number_format($cat->total, 0, ',', '.') }}</td>
            <td class="text-right text-muted">
                {{ $totalAmount > 0 ? number_format(($cat->total / $totalAmount) * 100, 1) : '0' }}%
            </td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

<div class="section-title">Detail Pengeluaran</div>
<table>
    <thead>
        <tr>
            <th>No</th>
            <th>Tanggal</th>
            <th>Kategori</th>
            <th>Outlet</th>
            <th>Deskripsi</th>
            <th class="text-right">Jumlah</th>
        </tr>
    </thead>
    <tbody>
        @foreach($rows as $i => $exp)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ \Carbon\Carbon::parse($exp->expense_date)->format('d/m/Y') }}</td>
            <td>{{ $exp->category?->name ?? '-' }}</td>
            <td>{{ $exp->outlet?->name ?? 'Semua' }}</td>
            <td>{{ $exp->description ?? '-' }}</td>
            <td class="text-right fw-bold">Rp {{ number_format($exp->amount, 0, ',', '.') }}</td>
        </tr>
        @endforeach
        @if($rows->isEmpty())
        <tr><td colspan="6" style="text-align:center; color:#9ca3af;">Tidak ada data</td></tr>
        @endif
    </tbody>
    <tfoot>
        <tr>
            <td colspan="5" class="fw-bold text-right" style="padding-top:8px;">TOTAL</td>
            <td class="fw-bold text-right text-red" style="padding-top:8px;">Rp {{ number_format($totalAmount, 0, ',', '.') }}</td>
        </tr>
    </tfoot>
</table>
@endsection
