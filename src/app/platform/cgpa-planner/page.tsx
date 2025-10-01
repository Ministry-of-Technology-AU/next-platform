"use server";

import React from "react";
import CGPAPlanner from "./cgpa-planner";

export default async function CourseReviews(){
    return (<div className="mt-5 mx-6">
        <CGPAPlanner />
    </div>);
}