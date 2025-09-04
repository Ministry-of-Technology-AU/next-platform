"use client";
import * as Form from "@/components/form";
import PageTitle from "@/components/page-title";
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import { majors, batches } from "@/data/data";
import { strapiPost } from "@/lib/apis/strapi";

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

export default function AddReview({ params }: { params: { id: string }}) {
//   const subheading = `Submit a course review about ${searchParams.name} (${searchParams.code}) offered in ${searchParams.semester} ${searchParams.year}.`;
const subheading = "Submit a course review.";
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
  
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
        course: 1,
        author: 1
      }
    };

    const dummyApiData = {
      data: {
        review: "Prof is very approachable and teaches well.",
        transparent: 5,
        lecturer: 5,
        overall: 5,
        relatability: 4,
        extracredit: true,
        grading_type: "absolute",
        grade: "A/A-",
        batch: "UG2023",
        strict: 3,
        fair: 5,
        mode: "offline",
        tf: "No influence",
        major: "Computer Science",
        cr: false,
        course: 1, // <-- must be a valid course ID
        author: 1, // <-- must be a valid user ID
      },
    };

    try {
      const res = await strapiPost("/reviews", dummyApiData);
      console.log("✅ Review submitted:", res);
      alert("Review submitted successfully!");
    } catch (err) {
      console.error("❌ Error submitting review:", err);
      alert("Failed to submit review");
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
    <div className="min-h-screen container mx-auto px-6 py-8">
      <PageTitle
        text="Add Course Review"
        subheading={subheading}
        icon={CirclePlus}
      />
      <Form.FormContainer
        onSubmit={handleSubmit}
        className="max-w-6xl mt-6 bg-gray-light-90 p-6 rounded-lg shadow-md"
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
          <Form.SubmitButton text="Submit Review" />
        </div>
      </Form.FormContainer>
    </div>
  );
}
