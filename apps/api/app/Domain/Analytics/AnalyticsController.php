<?php

namespace App\Domain\Analytics;

use App\Http\Controllers\Controller;
use App\Models\ExamAttempt;
use App\Models\ExamPackage;
use App\Models\ExamSession;
use App\Models\Question;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Analytics',
    description: 'Analytics & Reporting endpoints'
)]
class AnalyticsController extends Controller
{
    #[OA\Get(
        path: '/api/v1/analytics/exams/{id}',
        summary: 'Get analytics for a specific exam package',
        tags: ['Analytics'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Exam analytics data')
        ]
    )]
    public function examAnalytics($id)
    {
        $package = ExamPackage::findOrFail($id);
        
        // Get all sessions for this package
        $sessionIds = ExamSession::where('package_id', $id)->pluck('id');
        
        if ($sessionIds->isEmpty()) {
            return $this->successResponse([
                'package' => $package->only(['id', 'name']),
                'total_attempts' => 0,
                'avg_score' => 0,
                'highest_score' => 0,
                'lowest_score' => 0,
                'pass_rate' => 0,
                'question_analysis' => []
            ], 'No attempts found for this package');
        }

        // Basic Stats
        $attempts = ExamAttempt::whereIn('session_id', $sessionIds)
            ->whereNotNull('submitted_at')
            ->get();
            
        if ($attempts->isEmpty()) {
             return $this->successResponse([
                'package' => $package->only(['id', 'name']),
                'total_attempts' => 0,
                'avg_score' => 0,
                'highest_score' => 0,
                'lowest_score' => 0,
                'pass_rate' => 0,
                'question_analysis' => []
            ], 'No completed attempts found');
        }

        $totalAttempts = $attempts->count();
        $avgScore = $attempts->avg('score_total');
        $maxScore = $attempts->max('score_total');
        $minScore = $attempts->min('score_total');
        
        // Assume passing grade is 60 if not specified (TODO: Add passing_grade to exam_packages)
        $passingGrade = 60; 
        $passedCount = $attempts->where('score_total', '>=', $passingGrade)->count();
        $passRate = ($passedCount / $totalAttempts) * 100;

        // Question Analysis
        // We need to join exam_answers -> attempts -> sessions -> package
        // But we already have sessionIds
        $questionStats = DB::table('exam_answers')
            ->join('exam_attempts', 'exam_answers.attempt_id', '=', 'exam_attempts.id')
            ->join('questions', 'exam_answers.question_id', '=', 'questions.id')
            ->whereIn('exam_attempts.session_id', $sessionIds)
            ->select(
                'questions.id',
                'questions.stem', // careful with long text
                DB::raw('count(*) as total_answers'),
                DB::raw('sum(case when exam_answers.is_correct = 1 then 1 else 0 end) as correct_count')
            )
            ->groupBy('questions.id', 'questions.stem')
            ->get()
            ->map(function ($q) {
                return [
                    'question_id' => $q->id,
                    // Truncate stem for display
                    'question_snippet' => substr(strip_tags($q->stem), 0, 50) . '...',
                    'total_answers' => $q->total_answers,
                    'correct_count' => $q->correct_count,
                    'accuracy_rate' => $q->total_answers > 0 
                        ? round(($q->correct_count / $q->total_answers) * 100, 1) 
                        : 0
                ];
            });

        return $this->successResponse([
            'package' => $package->only(['id', 'name']),
            'total_attempts' => $totalAttempts,
            'avg_score' => round($avgScore, 1),
            'highest_score' => $maxScore,
            'lowest_score' => $minScore,
            'pass_rate' => round($passRate, 1),
            'question_analysis' => $questionStats
        ], 'Exam analytics retrieved successfully');
    }

    #[OA\Get(
        path: '/api/v1/analytics/user/progress',
        summary: 'Get user progress tracking',
        tags: ['Analytics'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'User progress data')
        ]
    )]
    public function userProgress(Request $request)
    {
        $user = $request->user();

        // Summary
        $sessions = ExamSession::where('user_id', $user->id)
            ->with(['package', 'attempts' => function($q) {
                $q->latest();
            }])
            ->get();

        $completedSessions = $sessions->filter(fn($s) => $s->status === 'finished' || $s->status === 'graded'); // Assuming 'finished' or similar
        
        $totalExamsTaken = $completedSessions->count();
        
        // Calculate average score across latest attempt of each session
        $scores = $completedSessions->map(function($session) {
            return $session->attempts->first()?->score_total ?? 0;
        });
        
        $averageScore = $scores->isNotEmpty() ? $scores->avg() : 0;

        // Recent Activity
        $recentActivity = ExamAttempt::whereHas('session', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->whereNotNull('submitted_at')
            ->with('session.package')
            ->latest('submitted_at')
            ->take(5)
            ->get()
            ->map(function($attempt) {
                return [
                    'exam_name' => $attempt->session->package->name,
                    'date' => $attempt->submitted_at->format('Y-m-d H:i'),
                    'score' => $attempt->score_total
                ];
            });

        return $this->successResponse([
            'total_exams_taken' => $totalExamsTaken,
            'average_score' => round($averageScore, 1),
            'recent_activity' => $recentActivity
        ], 'User progress retrieved successfully');
    }

    #[OA\Get(
        path: '/api/v1/analytics/user/performance',
        summary: 'Get user performance metrics by subject',
        tags: ['Analytics'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Performance metrics')
        ]
    )]
    public function performanceMetrics(Request $request)
    {
        $user = $request->user();

        // Join: Answers -> Attempts -> Sessions(user) -> Questions -> QuestionBanks(subject)
        $stats = DB::table('exam_answers')
            ->join('exam_attempts', 'exam_answers.attempt_id', '=', 'exam_attempts.id')
            ->join('exam_sessions', 'exam_attempts.session_id', '=', 'exam_sessions.id')
            ->join('questions', 'exam_answers.question_id', '=', 'questions.id')
            ->join('question_banks', 'questions.bank_id', '=', 'question_banks.id')
            ->where('exam_sessions.user_id', $user->id)
            ->whereNotNull('exam_attempts.submitted_at')
            ->select(
                'question_banks.subject',
                DB::raw('count(*) as total_questions'),
                DB::raw('sum(case when exam_answers.is_correct = 1 then 1 else 0 end) as correct_count')
            )
            ->groupBy('question_banks.subject')
            ->get()
            ->map(function($stat) {
                return [
                    'subject' => $stat->subject,
                    'total_questions' => $stat->total_questions,
                    'correct_count' => $stat->correct_count,
                    'accuracy' => $stat->total_questions > 0 
                        ? round(($stat->correct_count / $stat->total_questions) * 100, 1) 
                        : 0
                ];
            });

        return $this->successResponse($stats, 'Performance metrics retrieved successfully');
    }

    #[OA\Get(
        path: '/api/v1/analytics/recommendations',
        summary: 'Get recommendations for the user',
        tags: ['Analytics'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Recommendations')
        ]
    )]
    public function recommendations(Request $request)
    {
        $user = $request->user();

        // 1. Identify weak subjects (accuracy < 60%)
        // Reuse logic or call internal method. For simplicity, duplicating query logic or using a simpler approach.
        // Let's use the same query as performanceMetrics but filter.
        
        $weakSubjects = DB::table('exam_answers')
            ->join('exam_attempts', 'exam_answers.attempt_id', '=', 'exam_attempts.id')
            ->join('exam_sessions', 'exam_attempts.session_id', '=', 'exam_sessions.id')
            ->join('questions', 'exam_answers.question_id', '=', 'questions.id')
            ->join('question_banks', 'questions.bank_id', '=', 'question_banks.id')
            ->where('exam_sessions.user_id', $user->id)
            ->select(
                'question_banks.subject',
                DB::raw('count(*) as total_questions'),
                DB::raw('sum(case when exam_answers.is_correct = 1 then 1 else 0 end) as correct_count')
            )
            ->groupBy('question_banks.subject')
            ->havingRaw('(sum(case when exam_answers.is_correct = 1 then 1 else 0 end) / count(*)) < 0.6')
            ->pluck('subject');

        // 2. Find ExamPackages that contain these subjects
        // ExamPackage -> ExamSection -> QuestionBank(subject)
        
        $recommendedPackages = ExamPackage::whereHas('sections', function($q) use ($weakSubjects) {
            $q->whereIn('subject', $weakSubjects);
        })
        ->with('sections')
        ->inRandomOrder()
        ->take(3)
        ->get();
        
        // If no weak subjects or no packages found, return popular/random packages
        if ($recommendedPackages->isEmpty()) {
            $recommendedPackages = ExamPackage::inRandomOrder()->take(3)->get();
            $reason = 'Explore our top exam packages';
        } else {
            $reason = 'Based on your recent performance in: ' . $weakSubjects->implode(', ');
        }

        return $this->successResponse([
            'reason' => $reason,
            'packages' => $recommendedPackages
        ], 'Recommendations retrieved successfully');
    }
}
