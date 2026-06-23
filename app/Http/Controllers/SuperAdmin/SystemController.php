<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class SystemController extends Controller
{
    public function index()
    {
        $dbSize = DB::selectOne("
            SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
            FROM information_schema.TABLES
            WHERE table_schema = DATABASE()
        ");

        $info = [
            'php_version'     => PHP_VERSION,
            'laravel_version' => app()->version(),
            'db_size_mb'      => $dbSize?->size_mb ?? 0,
            'environment'     => app()->environment(),
            'debug_mode'      => config('app.debug'),
            'cache_driver'    => config('cache.default'),
            'queue_driver'    => config('queue.default'),
            'app_url'         => config('app.url'),
        ];

        return Inertia::render('SuperAdmin/System/Index', [
            'info' => $info,
        ]);
    }

    public function logs()
    {
        $logPath = storage_path('logs/laravel.log');
        $lines   = [];

        if (File::exists($logPath)) {
            $content  = File::get($logPath);
            $rawLines = array_filter(explode("\n", $content));
            $entries  = [];
            $current  = null;

            foreach (array_reverse($rawLines) as $line) {
                if (preg_match('/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+)\.(\w+): (.+)$/', $line, $m)) {
                    if ($current) {
                        $entries[] = $current;
                    }
                    $current = [
                        'timestamp' => $m[1],
                        'env'       => $m[2],
                        'level'     => strtolower($m[3]),
                        'message'   => $m[4],
                    ];
                    if (count($entries) >= 100) {
                        break;
                    }
                }
            }
            if ($current && count($entries) < 100) {
                $entries[] = $current;
            }
            $lines = $entries;
        }

        return Inertia::render('SuperAdmin/System/Logs', [
            'logs' => $lines,
        ]);
    }

    public function queues()
    {
        $failedJobs = DB::table('failed_jobs')
            ->orderByDesc('failed_at')
            ->limit(50)
            ->get()
            ->map(fn ($j) => [
                'id'         => $j->id,
                'connection' => $j->connection,
                'queue'      => $j->queue,
                'payload'    => json_decode($j->payload, true)['displayName'] ?? 'Unknown',
                'exception'  => mb_substr($j->exception, 0, 300),
                'failed_at'  => $j->failed_at,
            ]);

        $pendingJobs = DB::table('jobs')
            ->selectRaw('queue, COUNT(*) as count')
            ->groupBy('queue')
            ->get();

        return Inertia::render('SuperAdmin/System/Queues', [
            'failedJobs'  => $failedJobs,
            'pendingJobs' => $pendingJobs,
        ]);
    }
}
