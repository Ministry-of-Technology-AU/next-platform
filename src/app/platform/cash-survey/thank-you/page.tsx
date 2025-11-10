"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SubmissionData {
  hasSubmitted: boolean;
  timestamp: string;
  totalSubmissions: number;
}

export default function ThankYouPage() {
  const router = useRouter();
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissionStatus = async () => {
      try {
        const response = await fetch("/api/platform/cash-survey", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch survey status");
        }

        const result = await response.json();

        if (result.success && result.hasSubmitted) {
          setSubmissionData({
            hasSubmitted: true,
            timestamp: result.timestamp,
            totalSubmissions: result.totalSubmissions,
          });
        } else {
          // User hasn't submitted, redirect to survey
          router.push("/platform/cash-survey");
        }
      } catch (error) {
        console.error("Error fetching submission status:", error);
        toast.error("Error verifying submission status");
        // Redirect to survey on error
        router.push("/platform/cash-survey");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissionStatus();
  }, [router]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!submissionData?.hasSubmitted) {
    return null; // This shouldn't render due to redirect, but as a safety
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-3xl md:text-4xl">Thank You!</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main message */}
          <div className="space-y-3">
            <p className="text-lg text-gray-700 dark:text-gray-300 text-center">
              Your CASH survey submission has been successfully recorded.
            </p>
            <p className="text-base text-gray-600 dark:text-gray-400 text-center">
              Thank you for taking the time to complete the Committee Against Sexual Harassment
              (CASH) Student Experience Survey. Your feedback is invaluable in helping us create a
              safer and more inclusive campus community.
            </p>
          </div>

          {/* Submission details */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-300">Submission Details</p>
                <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                  Submitted on: <span className="font-medium">{new Date(submissionData.timestamp).toLocaleString()}</span>
                </p>
                {submissionData.totalSubmissions > 1 && (
                  <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                    Total submissions: <span className="font-medium">Submission #{submissionData.totalSubmissions}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Information text */}
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              Your responses have been securely recorded and will be used to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Understand the experiences of students on campus</li>
              <li>Identify areas for improvement in our policies and procedures</li>
              <li>Develop targeted interventions and support systems</li>
              <li>Track progress over time</li>
            </ul>
          </div>

          {/* Note about resubmissions */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-900 dark:text-amber-300">
              <span className="font-semibold">Note:</span> You have already completed this survey. 
              Resubmissions are not permitted to maintain data integrity. If you need to report an 
              incident or have concerns, please contact CASH directly.
            </p>
          </div>

          {/* Call to action */}
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              If you have any questions or concerns, you can reach out to CASH at your institution.
            </p>
            <Button
              onClick={() => router.push("/platform")}
              className="w-full"
              size="lg"
            >
              Return to Platform
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
