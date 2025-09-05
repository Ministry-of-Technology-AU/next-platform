"use client";
import * as Form from "@/components/form";
import PageTitle from "@/components/page-title";
import { CirclePlus } from "lucide-react";
import { useState, useEffect, use } from "react";
import { majors, batches } from "@/data/data";

interface SearchParams {
  name: string;
  code: string;
  year: number;
  semester: string;
}

interface FormData {
  reviewExperience: string;
  grading_transparent: string;
  strict: string;
  fair: string;
  lecturer: string;
  relatable: string;
  overall: string;
  mode: string;
  grading: string;
  extracredit: string;
  taInfluence: string;
  batch: string;
  major: string;
  grade: string;
  isAnonymous: boolean;
}

export default function AddReview({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise using React.use()
  const { id } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseDetails, setCourseDetails] = useState<{
    id: string;
    name: string;
    code: string;
    year: number;
    semester: string;
  } | null>(null);

  // Initialize all form state at the top level
  const [formData, setFormData] = useState<FormData>({
    reviewExperience: "",
    grading_transparent: "1",
    strict: "1",
    fair: "1",
    lecturer: "1",
    relatable: "1",
    overall: "1",
    mode: "offline",
    grading: "absolute",
    extracredit: "false",
    taInfluence: "",
    batch: batches[0].name,
    major: majors[0],
    grade: "Do Not Wish to Reveal",
    isAnonymous: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch course details based on ID from params
  useEffect(() => {
    async function fetchCourseDetail() {
      try {
        setLoading(true);
        console.log('Fetching course details for ID:', id);
        
        // Use the dedicated course API endpoint
        const response = await fetch(`/api/courses/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.data) {
          const course = result.data;
          setCourseDetails({
            id: course.id.toString(),
            name: course.attributes.courseTitle,
            code: course.attributes.courseCode,
            year: course.attributes.year,
            semester: course.attributes.semester
          });
        } else {
          setError('Course not found');
        }
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('Failed to fetch course details');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchCourseDetail();
    }
  }, [id]);

  const subheading = courseDetails 
    ? `Submit a course review about ${courseDetails.name} (${courseDetails.code}) offered in ${courseDetails.semester} ${courseDetails.year}.`
    : "Loading course details...";
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <PageTitle
          text="Add Course Review"
          subheading="Loading course details..."
          icon={CirclePlus}
        />
        <div className="flex justify-center items-center py-12">
          <div className="text-neutral-primary">Loading course information...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <PageTitle
          text="Add Course Review"
          subheading="Error loading course details"
          icon={CirclePlus}
        />
        <div className="flex justify-center items-center py-12">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  // Show form only when course details are loaded
  if (!courseDetails) {
    return (
      <div className="min-h-screen container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <PageTitle
          text="Add Course Review"
          subheading="Course not found"
          icon={CirclePlus}
        />
        <div className="flex justify-center items-center py-12">
          <div className="text-neutral-primary">Course not found.</div>
        </div>
      </div>
    );
  }
  
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!courseDetails) {
      alert("Course details not loaded. Please refresh the page.");
      return;
    }

    if (isSubmitting) {
      return; // Prevent double submission
    }

    setIsSubmitting(true);

    // Map form data directly to API schema
    const apiData = {
      data: {
        review: formData.reviewExperience,
        transparent: parseInt(formData.grading_transparent, 10),
        lecturer: parseInt(formData.lecturer, 10),
        overall: parseInt(formData.overall, 10),
        relatability: parseInt(formData.relatable, 10),
        extracredit: formData.extracredit === "true",
        grading_type: formData.grading,
        grade: formData.grade,
        batch: formData.batch,
        strict: parseInt(formData.strict, 10),
        fair: parseInt(formData.fair, 10),
        mode: formData.mode,
        tf: formData.taInfluence,
        major: formData.major,
        cr: false,
        course: parseInt(courseDetails.id), // Use the actual course ID
        author: 1
      }
    };

    console.log("Submitting review with data:", apiData);

    try {
      const response = await fetch(`/api/courses/${courseDetails.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        alert("Review submitted successfully!");
        // Optionally redirect back to course reviews page
        window.location.href = "/course-reviews";
      } else {
        throw new Error(result.error || "Unknown error occurred");
      }
    } catch (err) {
      console.error("❌ Error submitting review:", err);
      alert("Failed to submit review: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const gradeOptions = [
    { value: "A/A-", label: "A / A-" },
    { value: "B+/B/B-", label: " B+ / B / B-" },
    { value: "C+/C/C-", label: " C+ / C / C-" },
    { value: "D+/D/D-", label: " D+ / D / D-" },
    { value: "F", label: " F" },
    { value: "Have Not Received Grade", label: " Not Received Yet" },
    { value: "Do Not Wish to Reveal", label: " Do not wish to disclose" },
  ];
  
  return (
    <div className="min-h-screen container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <PageTitle
        text="Add Course Review"
        subheading={subheading}
        icon={CirclePlus}
      />
      <Form.FormContainer
        onSubmit={handleSubmit}
        className="max-w-6xl mt-4 sm:mt-6 bg-gray-light-90 p-3 sm:p-4 lg:p-6 rounded-lg shadow-md"
      >
        <div className="space-y-4">
          <h3 className="text-xl font-bold">SECTION 1 - Review</h3>
          <Form.TextInput
            title="What was your experience taking this course?"
            placeholder="Enter your experience"
            description="Feel free to be as elaborate as you wish, but if you could specify some overarching details about the course – such as grading rubric (if you can recollect), experience during LS and DS, provision of accommodations and their nature, so on and so forth."
            isRequired
            isParagraph
            value={formData.reviewExperience}
            onChange={(value) => handleInputChange("reviewExperience", value)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold mt-6">SECTION 2 - Ratings</h3>
          <Form.SingleSelect
            title="How Transparent Was The Grading System?"
            isRequired
            placeholder="1 - Highly Ambiguous; 5 - Highly Transparent"
            items={[
              { label: "1 - Highly Ambiguous", value: "1" },
              { label: "2 - Ambiguous", value: "2" },
              { label: "3 - Neutral", value: "3" },
              { label: "4 - Transparent", value: "4" },
              { label: "5 - Highly Transparent", value: "5" },
            ]}
            value={formData.grading_transparent}
            onChange={(value) =>
              handleInputChange("grading_transparent", value)
            }
          />
          <Form.SingleSelect
            title="How Strict Was The Grading?"
            isRequired
            placeholder="1 - Very Lenient; 5 - Very Strict"
            items={[
              { label: "1 - Very Lenient", value: "1" },
              { label: "2 - Somewhat Lenient", value: "2" },
              { label: "3 - Neutral", value: "3" },
              { label: "4 - Somewhat Strict", value: "4" },
              { label: "5 - Very Strict", value: "5" },
            ]}
            value={formData.strict}
            onChange={(value) => handleInputChange("strict", value)}
          />
          <Form.SingleSelect
            title="How Fair Was The Grading?"
            isRequired
            placeholder="1 - Very Unfair; 5 - Very Fair"
            items={[
              { label: "1 - Unfair", value: "1" },
              { label: "2 - Somewhat Unfair", value: "2" },
              { label: "3 - Moderately Fair", value: "3" },
              { label: "4 - Fair", value: "4" },
              { label: "5 - Completely Fair", value: "5" },
            ]}
            value={formData.fair}
            onChange={(value) => handleInputChange("fair", value)}
          />
          <Form.SingleSelect
            title="How Good Was The Lecturer?"
            isRequired
            placeholder="1 - Poor; 5 - Excellent"
            items={[
              { label: "1 - Very Poor", value: "1" },
              { label: "2 - Poor", value: "2" },
              { label: "3 - Average", value: "3" },
              { label: "4 - Good", value: "4" },
              { label: "5 - Excellent", value: "5" },
            ]}
            value={formData.lecturer}
            onChange={(value) => handleInputChange("lecturer", value)}
          />
          <Form.SingleSelect
            title="How would you rate the relatability of assignments and assessments in relation to the content taught in class?"
            isRequired
            placeholder="1 - Not Relatable; 5 - Very Relatable"
            items={[
              { label: "1 - Highly Unrelated", value: "1" },
              { label: "2 - Moderately Unrelated", value: "2" },
              { label: "3 - Partially Related", value: "3" },
              { label: "4 - Mostly Related", value: "4" },
              { label: "5 - Perfectly Related", value: "5" },
            ]}
            value={formData.relatable}
            onChange={(value) => handleInputChange("relatable", value)}
          />
          <Form.SingleSelect
            title="At an overall level, would you recommend this course with this professor to others?"
            placeholder=""
            isRequired
            items={[
              { label: "1 - Definitely Not", value: "1" },
              { label: "2 - Probably Not", value: "2" },
              { label: "3 - Might or Might Not", value: "3" },
              { label: "4 - Probably Yes", value: "4" },
              { label: "5 - Definitely Yes", value: "5" },
            ]}
            value={formData.overall}
            onChange={(value) => handleInputChange("overall", value)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold mt-6">SECTION 3 - Course Details</h3>
          <Form.SingleSelect
            title="Mode of Course Conducted"
            placeholder="online/offline"
            isRequired
            items={[
              { label: "Offline", value: "offline" },
              { label: "Online", value: "online" },
            ]}
            value={formData.mode}
            onChange={(value) => handleInputChange("mode", value)}
          />
          <Form.SingleSelect
            title="Nature of Grading System"
            placeholder="Absolute/Relative"
            isRequired
            items={[
              { label: "Absolute", value: "absolute" },
              { label: "Relative", value: "relative" },
            ]}
            value={formData.grading}
            onChange={(value) => handleInputChange("grading", value)}
          />
          <Form.SingleSelect
            title="Were there any extra credit opportunities?"
            placeholder="Yes/No"
            isRequired
            items={[
              { label: "Yes", value: "true" },
              { label: "No", value: "false" },
            ]}
            value={formData.extracredit}
            onChange={(value) => handleInputChange("extracredit", value)}
          />
          <Form.TextInput
            title="To what degree Was the course influenced by TAs/TFs, and do you have any recommendations for students on them?"
            placeholder="eg. None"
            isParagraph
            value={formData.taInfluence}
            onChange={(value) => handleInputChange("taInfluence", value)}
          />
          <Form.SingleSelect
            title="Your Batch"
            placeholder="Select Batch"
            isRequired
            items={batches.map((batch) => ({
              label: batch.name,
              value: batch.name,
            }))}
            value={formData.batch}
            onChange={(value) => handleInputChange("batch", value)}
          />
          <Form.SingleSelect
            title="Your Major"
            placeholder="major"
            isRequired
            items={majors.map((major) => ({
              label: major,
              value: major,
            }))}
            value={formData.major}
            onChange={(value) => handleInputChange("major", value)}
          />
          <Form.SingleSelect
            title="Grade Received"
            placeholder="Select Grade"
            isRequired
            items={gradeOptions}
            value={formData.grade}
            onChange={(value) => handleInputChange("grade", value)}
          />
        </div>

        <div className="space-y-4">
          <Form.CheckboxComponent
            title="Review Under My Name"
            description="Reviews are by default published anonymously. Do you wish to disclose your name and other details?"
            value={!formData.isAnonymous}
            onChange={(checked) => handleInputChange("isAnonymous", !checked)}
          />
          <Form.SubmitButton 
            text="Submit Review"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          />
        </div>
      </Form.FormContainer>
    </div>
  );
}
