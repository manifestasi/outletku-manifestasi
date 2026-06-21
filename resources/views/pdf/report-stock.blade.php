@extends('pdf.layout')

@section('title', 'Laporan Stok')

@section('content')
<div class="header">
    <h1>Laporan Stok</h1>
    <div class="meta">
        Outlet: {{ $outlet }} &nbsp;|&nbsp; Per tanggal: {{ now()->translatedFormat('d M Y') }}
    </div>
</div>

<table>
    <thead>
        <tr>
            <th>No</th>
            <th>Produk</th>
            <th>SKU</th>
            <th>Outlet</th>
            <th class="text-right">Stok Saat Ini</th>
            <th class="text-right">Batas Rendah</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach($stocks as $i => $stock)
        @php $low = $stock->quantity <= $stock->low_stock_threshold; @endphp
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $stock->product?->name ?? '-' }}</td>
            <td class="text-muted">{{ $stock->product?->sku ?? '-' }}</td>
            <td>{{ $stock->outlet?->name ?? '-' }}</td>
            <td class="text-right fw-bold {{ $low ? 'text-red' : '' }}">{{ number_format($stock->quantity) }}</td>
            <td class="text-right text-muted">{{ number_format($stock->low_stock_threshold) }}</td>
            <td style="color: {{ $low ? '#dc2626' : '#059669' }}; font-weight:600;">{{ $low ? 'RENDAH' : 'Normal' }}</td>
        </tr>
        @endforeach
        @if($stocks->isEmpty())
        <tr><td colspan="7" style="text-align:center; color:#9ca3af;">Tidak ada data stok</td></tr>
        @endif
    </tbody>
</table>

@php $lowCount = $stocks->filter(fn($s) => $s->quantity <= $s->low_stock_threshold)->count(); @endphp
@if($lowCount > 0)
<p style="color:#dc2626; font-size:10px; margin-top:8px;">
    ⚠ {{ $lowCount }} produk dengan stok rendah — perlu segera diisi ulang.
</p>
@endif
@endsection
